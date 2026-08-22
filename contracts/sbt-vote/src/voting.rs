// voting.rs
use soroban_sdk::{Address, Env};
use crate::{events, storage, types::{DataKey, VoteError}};

pub fn cast_vote(env: &Env, voter: Address, candidate_id: u32) -> Result<(), VoteError> {
    voter.require_auth();

    if !storage::is_voting_open(env) {
        return Err(VoteError::VotingClosed);
    }

    let mut record = storage::get_voter_record(env, &voter);
    
    if !record.has_sbt {
        return Err(VoteError::NoSoulboundToken);
    }
    if record.has_voted {
        return Err(VoteError::AlreadyVoted);
    }

    // Tandai sudah memilih
    record.has_voted = true;
    env.storage().persistent().set(&DataKey::Voter(voter.clone()), &record);

    // Tambah suara kandidat
    let current_votes: u32 = env.storage().persistent().get(&DataKey::Candidate(candidate_id)).unwrap_or(0);
    env.storage().persistent().set(&DataKey::Candidate(candidate_id), &(current_votes + 1));

    events::publish_vote_event(env, &voter, candidate_id);
    Ok(())
}