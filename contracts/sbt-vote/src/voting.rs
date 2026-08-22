use soroban_sdk::{Address, Env};

use crate::{events, storage, types::VoteError};

/// Cast a vote for a registered candidate.
/// Validates: auth, voting open, has SBT, not already voted, valid candidate.
pub fn cast_vote(env: &Env, voter: &Address, candidate_id: u32) -> Result<(), VoteError> {
    voter.require_auth();

    if !storage::is_voting_open(env) {
        return Err(VoteError::VotingClosed);
    }

    if !storage::is_valid_candidate(env, candidate_id) {
        return Err(VoteError::InvalidCandidate);
    }

    let record = storage::get_voter_record(env, voter);

    if !record.has_sbt {
        return Err(VoteError::NoSoulboundToken);
    }

    if record.has_voted {
        return Err(VoteError::AlreadyVoted);
    }

    // Mark voter as having voted
    let updated = crate::types::VoterRecord {
        has_sbt: true,
        has_voted: true,
    };
    storage::set_voter_record(env, voter, &updated);

    // Increment candidate's vote count
    storage::increment_candidate_votes(env, candidate_id);

    events::emit_vote(env, voter, candidate_id);
    Ok(())
}
