use std::sync::Arc;

use jax::Jax;
use tauri::State;

use crate::error::AppError;
use crate::shards::network::NetworkShard;
use crate::shards::opgg::{
    champion_detail, list_champions, OpggChampionDetailDto, OpggChampionListDto,
};

#[tauri::command]
pub async fn opgg_list_champions(
    jax: State<'_, Arc<Jax>>,
) -> Result<OpggChampionListDto, AppError> {
    let network = jax.get_shard::<NetworkShard>().config()?;
    list_champions(network.external_http_client(), network.request_timeout()).await
}

#[tauri::command]
pub async fn opgg_get_champion_detail(
    jax: State<'_, Arc<Jax>>,
    champion_id: u32,
    position: String,
) -> Result<OpggChampionDetailDto, AppError> {
    let network = jax.get_shard::<NetworkShard>().config()?;
    champion_detail(
        network.external_http_client(),
        network.request_timeout(),
        champion_id,
        &position,
    )
    .await
}
