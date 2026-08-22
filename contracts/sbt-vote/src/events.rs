// events.rs
use soroban_sdk::{contractevent, Address, Env};

#[contractevent]
pub struct MintSbt {
    #[topic]
    pub to: Address,
}

#[contractevent]
pub struct VoteCast {
    #[topic]
    pub voter: Address,
    pub candidate_id: u32,
}

pub fn publish_mint_event(env: &Env, to: &Address) {
    MintSbt { to: to.clone() }.publish(env);
}

pub fn publish_vote_event(env: &Env, voter: &Address, candidate_id: u32) {
    VoteCast {
        voter: voter.clone(),
        candidate_id,
    }
    .publish(env);
}
