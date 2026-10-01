use std::sync::{Arc, Mutex, OnceLock};
use std::time::Duration;

use async_trait::async_trait;
use jax::{depends, shard_id, Jax, Shard};
use tauri::{
    Manager, PhysicalPosition, PhysicalSize, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};

use crate::error::AppError;
use crate::shards::lcu::LcuShard;
use crate::shards::mini_window::league_client_rect;
use crate::shards::ongoing_game::types::{OngoingGameEvent, OngoingGamePhase};
use crate::shards::ongoing_game::OngoingGameShard;
use crate::shards::tauri_host::TauriHost;
use crate::shards::window_effect::WindowEffectShard;
use crate::utils::webview::apply_release_webview_hardening;

const OVERLAY_LABEL: &str = "counter-overlay";
const OVERLAY_TITLE: &str = "League Jax - Counters";
const OVERLAY_WIDTH: f64 = 320.0;
const OVERLAY_HEIGHT: f64 = 640.0;
const CLIENT_GAP_PX: i32 = 4;

pub struct CounterOverlayShard {
    host: OnceLock<Arc<TauriHost>>,
    window_effect: OnceLock<Arc<WindowEffectShard>>,
    lcu: OnceLock<Arc<LcuShard>>,
    closed_for_champ_select: Mutex<bool>,
}

impl CounterOverlayShard {
    pub fn new() -> Self {
        Self {
            host: OnceLock::new(),
            window_effect: OnceLock::new(),
            lcu: OnceLock::new(),
            closed_for_champ_select: Mutex::new(false),
        }
    }

    pub fn dismiss(&self) -> Result<(), AppError> {
        *self.closed_mut() = true;
        self.hide_current()
    }

    async fn sync_visibility(&self, phase: OngoingGamePhase) -> Result<(), AppError> {
        if phase != OngoingGamePhase::ChampSelect {
            *self.closed_mut() = false;
            return self.hide_current();
        }
        if *self.closed_mut() {
            return Ok(());
        }

        let window = self.ensure_window()?;
        self.stick_to_client(true).await?;
        if window.is_visible().unwrap_or(false) {
            return Ok(());
        }
        window
            .show()
            .map_err(|error| AppError::other(format!("failed to show counter overlay: {error}")))
    }

    pub async fn stick_to_client(&self, force: bool) -> Result<(), AppError> {
        let Some(window) = self.window() else {
            return Ok(());
        };
        if *self.closed_mut() || (!force && !window.is_visible().unwrap_or(false)) {
            return Ok(());
        }
        let Some((client_x, client_y, _client_width, client_height)) = self.client_rect().await
        else {
            return Ok(());
        };

        let width = i32::try_from(window.inner_size().map(|size| size.width).unwrap_or(0))
            .unwrap_or(OVERLAY_WIDTH as i32);
        let height = client_height.max(1);
        let target_x = docked_x(client_x, width, CLIENT_GAP_PX, &work_areas(&window));
        let target_y = client_y;
        self.move_inner_origin(&window, target_x, target_y, height)?;
        Ok(())
    }

    async fn sync_latest(&self, jax: &Jax) -> Result<(), AppError> {
        let phase = jax
            .get_shard::<OngoingGameShard>()
            .manager()
            .map(|manager| manager.snapshot().phase)
            .unwrap_or(OngoingGamePhase::Idle);
        self.sync_visibility(phase).await
    }

    fn hide_current(&self) -> Result<(), AppError> {
        let Some(window) = self.window() else {
            return Ok(());
        };
        if !window.is_visible().unwrap_or(false) {
            return Ok(());
        }
        window
            .hide()
            .map_err(|error| AppError::other(format!("failed to hide counter overlay: {error}")))
    }

    fn ensure_window(&self) -> Result<WebviewWindow, AppError> {
        let host = self
            .host
            .get()
            .ok_or_else(|| AppError::other("counter overlay is not initialized"))?;
        if let Some(window) = host.app.get_webview_window(OVERLAY_LABEL) {
            return Ok(window);
        }

        let window = WebviewWindowBuilder::new(
            &host.app,
            OVERLAY_LABEL,
            WebviewUrl::App("overlay.html".into()),
        )
        .title(OVERLAY_TITLE)
        .inner_size(OVERLAY_WIDTH, OVERLAY_HEIGHT)
        .decorations(false)
        .transparent(true)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .always_on_top(true)
        .skip_taskbar(true)
        .visible(false)
        .focused(false)
        .shadow(false)
        .build()
        .map_err(|error| AppError::other(format!("failed to create counter overlay: {error}")))?;

        apply_release_webview_hardening(&window).map_err(|error| {
            AppError::other(format!("failed to harden counter overlay: {error}"))
        })?;
        if let Some(effect) = self.window_effect.get() {
            if let Err(error) = effect.apply_current_to_window(&window) {
                tracing::warn!(error = %error, "Failed to apply window effect for counter overlay");
            }
        }
        Ok(window)
    }

    async fn client_rect(&self) -> Option<(i32, i32, i32, i32)> {
        let manager = self.lcu.get()?.manager()?;
        if let Some(pid) = manager.focused_pid().await {
            if let Some(rect) = league_client_rect(pid) {
                return Some(rect);
            }
        }
        let session = manager.any_ready_session()?;
        league_client_rect(session.auth().pid)
    }

    fn move_inner_origin(
        &self,
        window: &WebviewWindow,
        target_x: i32,
        target_y: i32,
        height: i32,
    ) -> Result<(), AppError> {
        let inner = window.inner_position().map_err(|error| {
            AppError::other(format!("failed to read counter overlay position: {error}"))
        })?;
        let outer = window.outer_position().map_err(|error| {
            AppError::other(format!("failed to read counter overlay frame: {error}"))
        })?;
        let size = window.inner_size().map_err(|error| {
            AppError::other(format!("failed to read counter overlay size: {error}"))
        })?;
        let next_height = u32::try_from(height).unwrap_or(size.height);
        let same_place = (inner.x - target_x).abs() <= 1 && (inner.y - target_y).abs() <= 1;
        if same_place && size.height.abs_diff(next_height) <= 1 {
            return Ok(());
        }

        window
            .set_size(PhysicalSize::new(size.width, next_height))
            .map_err(|error| {
                AppError::other(format!("failed to resize counter overlay: {error}"))
            })?;
        window
            .set_position(PhysicalPosition::new(
                target_x - (inner.x - outer.x),
                target_y - (inner.y - outer.y),
            ))
            .map_err(|error| AppError::other(format!("failed to move counter overlay: {error}")))?;
        Ok(())
    }

    fn window(&self) -> Option<WebviewWindow> {
        self.host
            .get()
            .and_then(|host| host.app.get_webview_window(OVERLAY_LABEL))
    }

    fn closed_mut(&self) -> std::sync::MutexGuard<'_, bool> {
        self.closed_for_champ_select
            .lock()
            .unwrap_or_else(|error| error.into_inner())
    }
}

#[async_trait]
impl Shard for CounterOverlayShard {
    shard_id!("9f3c1a72-6d44-4e18-b5a0-2c8e7f4d91ab");
    depends![TauriHost, OngoingGameShard, WindowEffectShard, LcuShard];

    async fn setup(&self, jax: Arc<Jax>) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let host = jax.get_shard::<TauriHost>();
        let _ = self.host.set(host.clone());
        let _ = self.window_effect.set(jax.get_shard::<WindowEffectShard>());
        let _ = self.lcu.set(jax.get_shard::<LcuShard>());
        self.ensure_window()?;

        let Some(manager) = jax.get_shard::<OngoingGameShard>().manager() else {
            tracing::warn!("Counter overlay did not find the ongoing game manager");
            return Ok(());
        };
        let snapshot = manager.snapshot();
        self.sync_visibility(snapshot.phase).await?;
        let mut events = manager.subscribe();
        let cancel = host.cancellation_token();
        let jax_for_events = jax.clone();
        let follow_cancel = cancel.clone();
        let jax_for_follow = jax.clone();
        tokio::spawn(async move {
            let mut ticker = tokio::time::interval(Duration::from_millis(80));
            loop {
                tokio::select! {
                    _ = follow_cancel.cancelled() => break,
                    _ = ticker.tick() => {
                        if let Err(error) = jax_for_follow
                            .get_shard::<CounterOverlayShard>()
                            .stick_to_client(false)
                            .await
                        {
                            tracing::debug!(error = %error, "Counter overlay could not follow the client");
                        }
                    }
                }
            }
        });
        tokio::spawn(async move {
            loop {
                let event = tokio::select! {
                    _ = cancel.cancelled() => break,
                    result = events.recv() => {
                        match result {
                            Ok(event) => event,
                            Err(tokio::sync::broadcast::error::RecvError::Lagged(skipped)) => {
                                tracing::warn!(skipped, "Counter overlay missed ongoing game events");
                                if let Err(error) = jax_for_events
                                    .get_shard::<CounterOverlayShard>()
                                    .sync_latest(&jax_for_events)
                                    .await
                                {
                                    tracing::warn!(
                                        error = %error,
                                        "Failed to sync the counter overlay after a missed update"
                                    );
                                }
                                continue;
                            }
                            Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                        }
                    }
                };
                let OngoingGameEvent::Updated(update) = event else {
                    continue;
                };
                if let Err(error) = jax_for_events
                    .get_shard::<CounterOverlayShard>()
                    .sync_visibility(update.phase)
                    .await
                {
                    tracing::warn!(error = %error, "Failed to sync the counter overlay");
                }
            }
        });
        Ok(())
    }
}

#[derive(Clone, Copy)]
struct WorkArea {
    left: i32,
    right: i32,
}

fn work_areas(window: &WebviewWindow) -> Vec<WorkArea> {
    let monitors = match window.available_monitors() {
        Ok(monitors) => monitors,
        Err(error) => {
            tracing::debug!(error = %error, "Counter overlay could not read monitor work areas");
            return Vec::new();
        }
    };

    monitors
        .iter()
        .filter_map(|monitor| {
            let area = monitor.work_area();
            let width = i32::try_from(area.size.width).ok()?;
            Some(WorkArea {
                left: area.position.x,
                right: area.position.x.saturating_add(width),
            })
        })
        .collect()
}

fn axis_distance(value: i32, start: i32, end: i32) -> i64 {
    let value = i64::from(value);
    let start = i64::from(start);
    let end = i64::from(end);
    if value < start {
        start - value
    } else if value >= end {
        value - end + 1
    } else {
        0
    }
}

fn covered_by_work_areas(areas: &[WorkArea], x: i32, width: i32) -> bool {
    let end = x.saturating_add(width);
    let mut cursor = i64::from(x);
    let mut ranges = areas
        .iter()
        .map(|area| (i64::from(area.left), i64::from(area.right)))
        .collect::<Vec<_>>();
    ranges.sort_by_key(|range| range.0);
    for (left, right) in ranges {
        if right <= cursor {
            continue;
        }
        if left > cursor {
            return false;
        }
        cursor = cursor.max(right);
        if cursor >= i64::from(end) {
            return true;
        }
    }
    cursor >= i64::from(end)
}

fn docked_x(client_x: i32, overlay_width: i32, gap: i32, areas: &[WorkArea]) -> i32 {
    let width = overlay_width.max(0);
    let preferred = client_x.saturating_sub(width).saturating_sub(gap);
    if areas.is_empty() || covered_by_work_areas(areas, preferred, width) {
        return preferred;
    }
    let Some(area) = areas
        .iter()
        .copied()
        .min_by_key(|area| axis_distance(preferred, area.left, area.right))
    else {
        return preferred;
    };
    let max_x = area.right.saturating_sub(width);
    preferred.clamp(area.left, max_x.max(area.left))
}

#[cfg(test)]
mod tests {
    use super::{docked_x, WorkArea};

    fn area(left: i32, right: i32) -> WorkArea {
        WorkArea { left, right }
    }

    #[test]
    fn keeps_the_overlay_inside_the_work_area() {
        let primary = [area(0, 1920)];
        assert_eq!(docked_x(400, 320, 4, &primary), 76);
        assert_eq!(docked_x(10, 320, 4, &primary), 0);

        let left_monitor = [area(-1920, 0)];
        assert_eq!(docked_x(-1800, 320, 4, &left_monitor), -1920);
    }

    #[test]
    fn keeps_a_visible_dock_on_the_neighboring_monitor() {
        let areas = [area(0, 1920), area(1920, 3840)];
        assert_eq!(docked_x(2000, 320, 4, &areas), 1676);
        assert_eq!(docked_x(-7, 320, 4, &areas), 0);
    }
}
