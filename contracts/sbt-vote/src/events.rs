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

#[contractevent]
pub struct VotingStatusChanged {
    pub is_open: bool,
}

#[contractevent]
pub struct CandidateRegistered {
    pub candidate_id: u32,
}

pub fn emit_mint(env: &Env, to: &Address) {
    MintSbt { to: to.clone() }.publish(env);
}

pub fn emit_vote(env: &Env, voter: &Address, candidate_id: u32) {
    VoteCast {
        voter: voter.clone(),
        candidate_id,
    }
    .publish(env);
}

pub fn emit_voting_status(env: &Env, is_open: bool) {
    VotingStatusChanged { is_open }.publish(env);
}

pub fn emit_candidate_registered(env: &Env, candidate_id: u32) {
    CandidateRegistered { candidate_id }.publish(env);
}
