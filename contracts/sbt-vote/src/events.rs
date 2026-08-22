use soroban_sdk::{contractevent, Address, Env};

#[contractevent]
pub struct MintSbt {
    #[topic]
    pub to: Address,
}

#[contractevent]
pub struct PollCreated {
    #[topic]
    pub poll_id: u32,
    #[topic]
    pub creator: Address,
    pub options_count: u32,
}

#[contractevent]
pub struct VoteCast {
    #[topic]
    pub poll_id: u32,
    #[topic]
    pub voter: Address,
    pub option_id: u32,
}

#[contractevent]
pub struct PollStatusChanged {
    #[topic]
    pub poll_id: u32,
    pub is_open: bool,
}

pub fn emit_mint(env: &Env, to: &Address) {
    MintSbt { to: to.clone() }.publish(env);
}

pub fn emit_poll_created(env: &Env, poll_id: u32, creator: &Address, options_count: u32) {
    PollCreated {
        poll_id,
        creator: creator.clone(),
        options_count,
    }
    .publish(env);
}

pub fn emit_vote(env: &Env, poll_id: u32, voter: &Address, option_id: u32) {
    VoteCast {
        poll_id,
        voter: voter.clone(),
        option_id,
    }
    .publish(env);
}

pub fn emit_poll_status(env: &Env, poll_id: u32, is_open: bool) {
    PollStatusChanged { poll_id, is_open }.publish(env);
}
