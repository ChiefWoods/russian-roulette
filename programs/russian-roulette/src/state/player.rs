use std::mem::size_of;

use anchor_lang::prelude::*;
use orao_solana_vrf::state::RandomnessV2;

use crate::error::RouletteError;

#[account]
#[derive(InitSpace)]
pub struct Player {
    pub authority: Pubkey,
    pub force: [u8; 32],
    pub rounds: u64,
}

impl Player {
    /// Creates a new state for the `player`.
    pub fn new(authority: Pubkey) -> Self {
        Self {
            authority,
            force: Default::default(),
            rounds: Default::default(),
        }
    }

    /// Asserts that the player is able to play.
    ///
    /// Returns `Ok` on success.
    pub fn assert_can_play(&self, prev_round_acc: &UncheckedAccount) -> Result<()> {
        if self.rounds == 0 {
            return Ok(());
        }
        let randomness_v2 = RandomnessV2::try_deserialize(&mut &prev_round_acc.data.borrow()[..])?;
        match Self::current_state(&randomness_v2) {
            CurrentState::Alive => Ok(()),
            CurrentState::Dead => Err(RouletteError::PlayerDead.into()),
            CurrentState::Playing => Err(RouletteError::CylinderStillSpinning.into()),
        }
    }

    /// Derives last round outcome.
    pub fn current_state(randomness: &RandomnessV2) -> CurrentState {
        if let Some(randomness) = randomness.fulfilled() {
            if Self::is_dead(&randomness.randomness) {
                CurrentState::Dead
            } else {
                CurrentState::Alive
            }
        } else {
            CurrentState::Playing
        }
    }

    /// Decides whether player is dead or alive.
    fn is_dead(randomness: &[u8; 64]) -> bool {
        // use only first 8 bytes for simplicity
        let value = randomness[0..size_of::<u64>()].try_into().unwrap();
        u64::from_le_bytes(value) % 6 == 0
    }
}

/// Last round outcome.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CurrentState {
    /// Player is alive and able to play.
    Alive,
    /// Player is dead and can't play anymore.
    Dead,
    /// Player is waiting for current round to finish.
    Playing,
}
