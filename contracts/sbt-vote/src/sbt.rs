// sbt.rs
use soroban_sdk::{Address, Env};
use crate::{events, storage, types::DataKey};

pub fn mint_sbt(env: &Env, to: Address) {
    storage::require_admin(env);
    
    let mut record = storage::get_voter_record(env, &to);
    // Hanya bisa mint 1 kali
    if !record.has_sbt {
        record.has_sbt = true;
        env.storage().persistent().set(&DataKey::Voter(to.clone()), &record);
        events::publish_mint_event(env, &to);
    }
}