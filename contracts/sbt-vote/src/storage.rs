use soroban_sdk::{Address, Env};

use crate::types::{DataKey, Poll, VoteError, VoterRecord};

// TTL constants (in ledgers, ~5 seconds each)
const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 129_600; // ~7.5 days
const PERSISTENT_BUMP_AMOUNT: u32 = 518_400;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 129_600;

/// Extend instance storage TTL to prevent expiration.
pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

/// Extend a persistent storage entry TTL.
pub fn extend_persistent_ttl(env: &Env, key: &DataKey) {
    env.storage()
        .persistent()
        .extend_ttl(key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
}

/// Verify the caller is the admin.
pub fn require_admin(env: &Env) -> Result<Address, VoteError> {
    let admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(VoteError::NotAuthorized)?;
    admin.require_auth();
    Ok(admin)
}

/// Get total number of polls created.
pub fn get_poll_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::PollCount)
        .unwrap_or(0)
}

/// Increment and return new poll ID.
pub fn increment_poll_count(env: &Env) -> u32 {
    let new_id = get_poll_count(env) + 1;
    env.storage().instance().set(&DataKey::PollCount, &new_id);
    extend_instance_ttl(env);
    new_id
}

/// Get poll information by ID.
pub fn get_poll(env: &Env, poll_id: u32) -> Result<Poll, VoteError> {
    let key = DataKey::Poll(poll_id);
    env.storage()
        .persistent()
        .get(&key)
        .ok_or(VoteError::PollNotFound)
}

/// Save poll information.
pub fn set_poll(env: &Env, poll: &Poll) {
    let key = DataKey::Poll(poll.id);
    env.storage().persistent().set(&key, poll);
    extend_persistent_ttl(env, &key);
}

/// Get vote count for a specific option in a poll.
pub fn get_poll_votes(env: &Env, poll_id: u32, option_id: u32) -> u32 {
    let key = DataKey::PollOption(poll_id, option_id);
    env.storage().persistent().get(&key).unwrap_or(0)
}

/// Increment vote count for a specific option in a poll.
pub fn increment_poll_votes(env: &Env, poll_id: u32, option_id: u32) {
    let key = DataKey::PollOption(poll_id, option_id);
    let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
    env.storage().persistent().set(&key, &(current + 1));
    extend_persistent_ttl(env, &key);
}

/// Check if an address has claimed/minted a Soulbound Token.
pub fn has_global_sbt(env: &Env, voter: &Address) -> bool {
    let key = DataKey::GlobalSbt(voter.clone());
    env.storage().persistent().has(&key)
}

/// Mark an address as holding a Soulbound Token.
pub fn set_global_sbt(env: &Env, voter: &Address) {
    let key = DataKey::GlobalSbt(voter.clone());
    env.storage().persistent().set(&key, &true);
    extend_persistent_ttl(env, &key);
}

/// Get voter record for a specific poll.
pub fn get_poll_voter_record(env: &Env, poll_id: u32, voter: &Address) -> VoterRecord {
    let has_sbt = has_global_sbt(env, voter);
    let key = DataKey::PollVoter(poll_id, voter.clone());
    let voted_option: Option<u32> = env.storage().persistent().get(&key);

    match voted_option {
        Some(opt) => VoterRecord {
            has_sbt,
            has_voted: true,
            voted_option: opt,
        },
        None => VoterRecord {
            has_sbt,
            has_voted: false,
            voted_option: 0,
        },
    }
}

/// Set voter record after casting a vote on a poll.
pub fn set_poll_voter_record(env: &Env, poll_id: u32, voter: &Address, option_id: u32) {
    let key = DataKey::PollVoter(poll_id, voter.clone());
    env.storage().persistent().set(&key, &option_id);
    extend_persistent_ttl(env, &key);
}
