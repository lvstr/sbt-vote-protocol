use soroban_sdk::{Address, Env};

use crate::{events, storage, types::VoteError};

/// Mint an SBT to the given address. Only admin can call.
/// Returns error if voter already has an SBT.
pub fn mint_sbt(env: &Env, to: &Address) -> Result<(), VoteError> {
    storage::require_admin(env)?;

    let record = storage::get_voter_record(env, to);

    if record.has_sbt {
        return Err(VoteError::AlreadyHasSbt);
    }

    let updated = crate::types::VoterRecord {
        has_sbt: true,
        has_voted: record.has_voted,
    };
    storage::set_voter_record(env, to, &updated);
    events::emit_mint(env, to);

    Ok(())
}
