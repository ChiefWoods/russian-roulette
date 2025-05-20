pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("2BVvhg32vNF6mnqDv78373CwwDwhmjRkbmBHe2Gkx2i1");

#[program]
pub mod russian_roulette {
    use super::*;

    pub fn spin_and_pull_trigger(ctx: Context<SpinAndPullTrigger>, force: [u8; 32]) -> Result<()> {
        SpinAndPullTrigger::handler(ctx, force)
    }
}
