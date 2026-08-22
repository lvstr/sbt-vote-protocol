use soroban_sdk::{Address, Env};

use crate::types::{DataKey, VoteError, VoterRecord};

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

/// Verify the caller is the admin. Returns error instead of panicking.
pub fn require_admin(env: &Env) -> Result<(), VoteError> {
    let admin: Address = env
        .storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(VoteError::NotAuthorized)?;
    admin.require_auth();
    Ok(())
}

/// Check whether voting is currently open.
pub fn is_voting_open(env: &Env) -> bool {
    env.storage()
        .instance()
        .get(&DataKey::VotingOpen)
        .unwrap_or(false)
}

/// Read the voter record, defaulting to no SBT and no vote.
pub fn get_voter_record(env: &Env, voter: &Address) -> VoterRecord {
    env.storage()
        .persistent()
        .get(&DataKey::Voter(voter.clone()))
        .unwrap_or(VoterRecord {
            has_sbt: false,
            has_voted: false,
        })
}

/// Save the voter record to persistent storage.
pub fn set_voter_record(env: &Env, voter: &Address, record: &VoterRecord) {
    let key = DataKey::Voter(voter.clone());
    env.storage().persistent().set(&key, record);
    extend_persistent_ttl(env, &key);
}

/// Get the number of registered candidates.
pub fn get_candidate_count(env: &Env) -> u32 {
    env.storage()
        .instance()
        .get(&DataKey::CandidateCount)
        .unwrap_or(0)
}

/// Check if a candidate ID is valid (registered).
pub fn is_valid_candidate(env: &Env, candidate_id: u32) -> bool {
    candidate_id > 0 && candidate_id <= get_candidate_count(env)
}

/// Get votes for a candidate.
pub fn get_candidate_votes(env: &Env, candidate_id: u32) -> u32 {
    env.storage()
        .persistent()
        .get(&DataKey::Candidate(candidate_id))
        .unwrap_or(0)
}

/// Increment votes for a candidate.
pub fn increment_candidate_votes(env: &Env, candidate_id: u32) {
    let key = DataKey::Candidate(candidate_id);
    let current: u32 = env.storage().persistent().get(&key).unwrap_or(0);
    env.storage().persistent().set(&key, &(current + 1));
    extend_persistent_ttl(env, &key);
}
