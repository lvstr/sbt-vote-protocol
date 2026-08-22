use soroban_sdk::{Address, Env};

use crate::{
    events, storage,
    types::{Poll, VoteError},
};

/// Create a new poll with specified number of options.
/// Anyone can create a poll. Returns the assigned poll ID.
pub fn create_poll(
    env: &Env,
    creator: &Address,
    options_count: u32,
) -> Result<u32, VoteError> {
    creator.require_auth();

    if options_count < 2 || options_count > 20 {
        return Err(VoteError::InvalidOptionsCount);
    }

    let poll_id = storage::increment_poll_count(env);
    let poll = Poll {
        id: poll_id,
        creator: creator.clone(),
        options_count,
        is_open: true,
        total_votes: 0,
    };

    storage::set_poll(env, &poll);
    events::emit_poll_created(env, poll_id, creator, options_count);

    Ok(poll_id)
}

/// Cast a vote for an option in a specific poll.
/// Validates: voter auth, SBT ownership, poll open, valid option ID, 1-vote-per-poll rule.
pub fn cast_vote(
    env: &Env,
    poll_id: u32,
    voter: &Address,
    option_id: u32,
) -> Result<(), VoteError> {
    voter.require_auth();

    // Voter must possess a Soulbound Token
    if !storage::has_global_sbt(env, voter) {
        return Err(VoteError::NoSoulboundToken);
    }

    let mut poll = storage::get_poll(env, poll_id)?;

    if !poll.is_open {
        return Err(VoteError::VotingClosed);
    }

    if option_id < 1 || option_id > poll.options_count {
        return Err(VoteError::InvalidOption);
    }

    let voter_record = storage::get_poll_voter_record(env, poll_id, voter);
    if voter_record.has_voted {
        return Err(VoteError::AlreadyVoted);
    }

    // Record vote and increment counters
    storage::set_poll_voter_record(env, poll_id, voter, option_id);
    storage::increment_poll_votes(env, poll_id, option_id);

    poll.total_votes += 1;
    storage::set_poll(env, &poll);

    events::emit_vote(env, poll_id, voter, option_id);
    Ok(())
}

/// Open or close a poll. Can only be called by the poll creator or protocol admin.
pub fn set_poll_status(
    env: &Env,
    poll_id: u32,
    caller: &Address,
    is_open: bool,
) -> Result<(), VoteError> {
    caller.require_auth();

    let mut poll = storage::get_poll(env, poll_id)?;

    if &poll.creator != caller {
        // If not the creator, check if caller is the protocol admin
        storage::require_admin(env)?;
    }

    poll.is_open = is_open;
    storage::set_poll(env, &poll);
    events::emit_poll_status(env, poll_id, is_open);

    Ok(())
}
