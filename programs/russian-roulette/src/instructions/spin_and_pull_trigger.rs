use anchor_lang::prelude::*;
use orao_solana_vrf::{
    cpi::{accounts::RequestV2, request_v2},
    program::OraoVrf,
    state::NetworkState,
    CONFIG_ACCOUNT_SEED, RANDOMNESS_ACCOUNT_SEED,
};

use crate::{error::RouletteError, Player, PLAYER_SEED};

#[derive(Accounts)]
#[instruction(force: [u8; 32])]
pub struct SpinAndPullTrigger<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = Player::DISCRIMINATOR.len() + Player::INIT_SPACE,
        seeds = [
            PLAYER_SEED,
            authority.key().as_ref()
        ],
        bump
    )]
    pub player: Account<'info, Player>,
    /// CHECK: RandomnessV2, not initialized
    #[account(
        seeds = [RANDOMNESS_ACCOUNT_SEED, player.force.as_ref()],
        seeds::program = orao_solana_vrf::ID,
        bump,
    )]
    pub prev_round: UncheckedAccount<'info>,
    /// CHECK: RandomnessV2, not initialized
    #[account(
        mut,
        seeds = [RANDOMNESS_ACCOUNT_SEED, &force],
        seeds::program = orao_solana_vrf::ID,
        bump,
    )]
    pub random: UncheckedAccount<'info>,
    /// CHECK: NetworkState Treasury
    #[account(mut)]
    pub treasury: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED],
        seeds::program = orao_solana_vrf::ID,
        bump,
        constraint = network_state.config.treasury == treasury.key() @ RouletteError::InvalidTreasury
    )]
    pub network_state: Account<'info, NetworkState>,
    pub system_program: Program<'info, System>,
    pub orao_vrf: Program<'info, OraoVrf>,
}

impl SpinAndPullTrigger<'_> {
    pub fn handler(ctx: Context<SpinAndPullTrigger>, force: [u8; 32]) -> Result<()> {
        // Zero seed is illegal in VRF
        require!(force != [0u8; 32], RouletteError::CylinderNotSpinned);

        let player = &mut ctx.accounts.player;

        if player.rounds == 0 {
            **player = Player::new(*ctx.accounts.authority.as_ref().key);
        }

        player.assert_can_play(&ctx.accounts.prev_round)?;

        request_v2(
            CpiContext::new(
                ctx.accounts.orao_vrf.to_account_info(),
                RequestV2 {
                    payer: ctx.accounts.authority.to_account_info(),
                    network_state: ctx.accounts.network_state.to_account_info(),
                    request: ctx.accounts.random.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    treasury: ctx.accounts.treasury.to_account_info(),
                },
            ),
            force,
        )?;

        player.rounds += 1;
        player.force = force;

        Ok(())
    }
}
