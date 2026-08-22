#![no_std]

mod events;
mod sbt;
mod storage;
mod types;
mod voting;

#[cfg(test)]
mod test;

use soroban_sdk::{contract, contractimpl, Address, Env};
use types::{DataKey, Poll, VoteError, VoterRecord};

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
        env.storage().instance().set(&DataKey::PollCount, &0u32);
        storage::extend_instance_ttl(&env);
        Ok(())
    }

    /// Claim a Soulbound Token (SBT) voter identity.
    /// Permissionless: Any user can register their address as a verified voter.
    pub fn claim_sbt(env: Env, voter: Address) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        sbt::claim_sbt(&env, &voter)
    }

    /// Mint a Soulbound Token to a voter address (Admin function).
    pub fn mint_sbt(env: Env, to: Address) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        sbt::mint_sbt(&env, &to)
    }

    /// Create a new community poll.
    /// Permissionless: Anyone can launch a poll with 2-20 options.
    /// Returns the newly assigned poll ID (1-indexed).
    pub fn create_poll(
        env: Env,
        creator: Address,
        options_count: u32,
    ) -> Result<u32, VoteError> {
        storage::extend_instance_ttl(&env);
        voting::create_poll(&env, &creator, options_count)
    }

    /// Cast a vote for an option in a poll. Requires voter auth and SBT ownership.
    pub fn vote(
        env: Env,
        poll_id: u32,
        voter: Address,
        option_id: u32,
    ) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        voting::cast_vote(&env, poll_id, &voter, option_id)
    }

    /// Open or close a poll. Caller must be the poll creator or protocol admin.
    pub fn set_poll_status(
        env: Env,
        poll_id: u32,
        caller: Address,
        is_open: bool,
    ) -> Result<(), VoteError> {
        storage::extend_instance_ttl(&env);
        voting::set_poll_status(&env, poll_id, &caller, is_open)
    }

    // ─── Read-Only Queries ───────────────────────────────────────────────

    /// Get total number of polls created.
    pub fn get_poll_count(env: Env) -> u32 {
        storage::get_poll_count(&env)
    }

    /// Get details of a specific poll.
    pub fn get_poll(env: Env, poll_id: u32) -> Result<Poll, VoteError> {
        storage::get_poll(&env, poll_id)
    }

    /// Get vote count for a specific option within a poll.
    pub fn get_poll_votes(env: Env, poll_id: u32, option_id: u32) -> u32 {
        storage::get_poll_votes(&env, poll_id, option_id)
    }

    /// Get voter record for a poll (SBT status, voted status, option voted).
    pub fn get_poll_voter(env: Env, poll_id: u32, voter: Address) -> VoterRecord {
        storage::get_poll_voter_record(&env, poll_id, &voter)
    }

    /// Check if an address holds a Soulbound Token.
    pub fn has_sbt(env: Env, voter: Address) -> bool {
        storage::has_global_sbt(&env, &voter)
    }
}
