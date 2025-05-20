use anchor_lang::prelude::*;

#[error_code]
pub enum RouletteError {
    #[msg("The player is already dead")]
    PlayerDead,
    #[msg("Player must spin the cylinder")]
    CylinderNotSpinned,
    #[msg("The cylinder is still spinning")]
    CylinderStillSpinning,
    #[msg("Treasury does not match the one in NetworkState")]
    InvalidTreasury,
}
