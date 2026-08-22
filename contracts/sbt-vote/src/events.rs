// events.rs
use soroban_sdk::{Address, Env, Symbol};

pub fn publish_mint_event(env: &Env, to: &Address) {
    let topics = (Symbol::new(env, "mint_sbt"), to.clone());
    env.events().publish(topics, true);
}

pub fn publish_vote_event(env: &Env, voter: &Address, candidate_id: u32) {
    let topics = (Symbol::new(env, "vote_cast"), voter.clone());
    env.events().publish(topics, candidate_id);
}