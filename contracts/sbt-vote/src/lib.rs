#![no_std]

mod events;
mod sbt;
mod storage;
mod types;
mod voting;

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env};
use types::{DataKey, VoteError, VoterRecord};

#[contract]
pub struct SbtVoteContract;

#[contractimpl]
impl SbtVoteContract {
    /// Initialize the contract with an admin address.
    /// Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), VoteError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(VoteError::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VotingOpen, &true);
        env.storage().instance().set(&DataKey::CandidateCount, &0u32);
        storage::extend_instance_ttl(&env);
        Ok(())
    }

    /// Register a new candidate. Only admin can call.
    /// Returns the new candidate's ID (1-indexed).
    pub fn register_candidate(env: Env) -> Result<u32, VoteError> {
        storage::require_admin(&env)?;
        let count = storage::get_candidate_count(&env);
        let new_id = count + 1;
        env.storage().instance().set(&DataKey::CandidateCount, &new_id);
        // Initialize vote count
        env.storage().persistent().set(&DataKey::Candidate(new_id), &0u32);
        storage::extend_instance_ttl(&env);
        events::emit_candidate_registered(&env, new_id);
        Ok(new_id)
    }

    /// Mint a Soulbound Token to a voter address. Only admin can call.
    pub fn mint_sbt(env: Env, to: Address) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        sbt::mint_sbt(&env, &to)
    }

    /// Cast a vote for a candidate. Requires voter auth.
    pub fn vote(env: Env, voter: Address, candidate_id: u32) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        voting::cast_vote(&env, &voter, candidate_id)
    }

    /// Open or close the voting period. Only admin can call.
    pub fn set_voting_status(env: Env, is_open: bool) -> Result<(), VoteError> {
        storage::require_admin(&env)?;
        env.storage().instance().set(&DataKey::VotingOpen, &is_open);
        storage::extend_instance_ttl(&env);
        events::emit_voting_status(&env, is_open);
        Ok(())
    }

    // ─── Read-Only Queries ───────────────────────────────────────────────

    /// Get the total votes for a candidate.
    pub fn get_votes(env: Env, candidate_id: u32) -> u32 {
        storage::get_candidate_votes(&env, candidate_id)
    }

    /// Get a voter's record (SBT status and vote status).
    pub fn get_voter(env: Env, voter: Address) -> VoterRecord {
        storage::get_voter_record(&env, &voter)
    }

    /// Get the number of registered candidates.
    pub fn get_candidate_count(env: Env) -> u32 {
        storage::get_candidate_count(&env)
    }

    /// Check if voting is currently open.
    pub fn is_voting_open(env: Env) -> bool {
        storage::is_voting_open(&env)
    }
}
