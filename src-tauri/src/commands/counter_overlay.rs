use std::sync::Arc;

use jax::Jax;
use tauri::State;

use crate::error::AppError;
use crate::shards::counter_overlay::CounterOverlayShard;

#[tauri::command]
pub async fn counter_overlay_dismiss(jax: State<'_, Arc<Jax>>) -> Result<(), AppError> {
    jax.get_shard::<CounterOverlayShard>().dismiss()
}
