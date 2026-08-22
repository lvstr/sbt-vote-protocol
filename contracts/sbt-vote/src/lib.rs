#![no_std]

mod types;
mod storage;
mod events;
mod sbt;
mod voting;

use soroban_sdk::{contract, contractimpl, Address, Env};
use types::{DataKey, VoteError};

#[contract]
pub struct SbtVoteContract;

#[contractimpl]
impl SbtVoteContract {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::VotingOpen, &true);
    }

    pub fn mint_token(env: Env, to: Address) {
        sbt::mint_sbt(&env, to);
    }

    pub fn vote(env: Env, voter: Address, candidate_id: u32) -> Result<(), VoteError> {
        voting::cast_vote(&env, voter, candidate_id)
    }

    pub fn get_votes(env: Env, candidate_id: u32) -> u32 {
        env.storage().persistent().get(&DataKey::Candidate(candidate_id)).unwrap_or(0)
    }
}