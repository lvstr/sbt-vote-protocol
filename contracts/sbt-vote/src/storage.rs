// storage.rs
use soroban_sdk::{Address, Env};
use crate::types::{DataKey, VoterRecord};

pub fn require_admin(env: &Env) {
    let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
    admin.require_auth();
}

pub fn is_voting_open(env: &Env) -> bool {
    env.storage().instance().get(&DataKey::VotingOpen).unwrap_or(false)
}

pub fn get_voter_record(env: &Env, voter: &Address) -> VoterRecord {
    env.storage().persistent().get(&DataKey::Voter(voter.clone())).unwrap_or(VoterRecord {
        has_sbt: false,
        has_voted: false,
    })
}