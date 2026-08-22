use soroban_sdk::{Address, Env};

use crate::{events, storage, types::VoteError};

/// Permissionless Soulbound Token registration.
/// Any voter can claim their SBT identity on-chain for voting.
pub fn claim_sbt(env: &Env, voter: &Address) -> Result<(), VoteError> {
    voter.require_auth();

    if storage::has_global_sbt(env, voter) {
        return Err(VoteError::AlreadyHasSbt);
    }

    storage::set_global_sbt(env, voter);
    events::emit_mint(env, voter);
    Ok(())
}

/// Mint an SBT to the given address. Can be called by admin.
pub fn mint_sbt(env: &Env, to: &Address) -> Result<(), VoteError> {
    storage::require_admin(env)?;

    if storage::has_global_sbt(env, to) {
        return Err(VoteError::AlreadyHasSbt);
    }

    storage::set_global_sbt(env, to);
    events::emit_mint(env, to);
    Ok(())
}
