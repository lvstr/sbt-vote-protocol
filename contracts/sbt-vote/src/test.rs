#![cfg(test)]

use crate::{SbtVoteContract, SbtVoteContractClient};
use soroban_sdk::{testutils::Address as _, Address, Env};

fn setup() -> (Env, SbtVoteContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SbtVoteContract, ());
    let client = SbtVoteContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);
    client.initialize(&admin);
    (env, client, admin)
}

// ─── Initialization ──────────────────────────────────────────────────────────

#[test]
fn test_initialize_success() {
    let env = Env::default();
    env.mock_all_auths();
    let contract_id = env.register(SbtVoteContract, ());
    let client = SbtVoteContractClient::new(&env, &contract_id);
    let admin = Address::generate(&env);

    client.initialize(&admin);
    assert!(client.is_voting_open());
    assert_eq!(client.get_candidate_count(), 0);
}

#[test]
fn test_initialize_already_initialized() {
    let (_env, client, _admin) = setup();
    let another = Address::generate(&_env);
    let result = client.try_initialize(&another);
    assert!(result.is_err());
}

// ─── Candidate Registration ──────────────────────────────────────────────────

#[test]
fn test_register_candidate() {
    let (_env, client, _admin) = setup();

    let id1 = client.register_candidate();
    assert_eq!(id1, 1);

    let id2 = client.register_candidate();
    assert_eq!(id2, 2);

    assert_eq!(client.get_candidate_count(), 2);
    assert_eq!(client.get_votes(&1), 0);
    assert_eq!(client.get_votes(&2), 0);
}

// ─── SBT Minting ────────────────────────────────────────────────────────────

#[test]
fn test_mint_sbt_success() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.mint_sbt(&voter);

    let record = client.get_voter(&voter);
    assert!(record.has_sbt);
    assert!(!record.has_voted);
}

#[test]
fn test_mint_sbt_already_has_sbt() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.mint_sbt(&voter);
    let result = client.try_mint_sbt(&voter);
    assert!(result.is_err());
}

// ─── Voting ─────────────────────────────────────────────────────────────────

#[test]
fn test_vote_success() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.register_candidate();
    client.mint_sbt(&voter);
    client.vote(&voter, &1);

    assert_eq!(client.get_votes(&1), 1);
    let record = client.get_voter(&voter);
    assert!(record.has_voted);
}

#[test]
fn test_vote_multiple_voters() {
    let (env, client, _admin) = setup();
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    client.register_candidate();
    client.register_candidate();

    client.mint_sbt(&voter1);
    client.mint_sbt(&voter2);

    client.vote(&voter1, &1);
    client.vote(&voter2, &1);

    assert_eq!(client.get_votes(&1), 2);
    assert_eq!(client.get_votes(&2), 0);
}

#[test]
fn test_vote_error_no_sbt() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.register_candidate();
    let result = client.try_vote(&voter, &1);
    assert!(result.is_err());
}

#[test]
fn test_vote_error_already_voted() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.register_candidate();
    client.mint_sbt(&voter);
    client.vote(&voter, &1);

    let result = client.try_vote(&voter, &1);
    assert!(result.is_err());
}

#[test]
fn test_vote_error_invalid_candidate() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.mint_sbt(&voter);
    // No candidates registered, ID 99 is invalid
    let result = client.try_vote(&voter, &99);
    assert!(result.is_err());
}

#[test]
fn test_vote_error_voting_closed() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.register_candidate();
    client.mint_sbt(&voter);
    client.set_voting_status(&false);

    let result = client.try_vote(&voter, &1);
    assert!(result.is_err());
}

// ─── Voting Status ───────────────────────────────────────────────────────────

#[test]
fn test_set_voting_status() {
    let (_env, client, _admin) = setup();

    assert!(client.is_voting_open());

    client.set_voting_status(&false);
    assert!(!client.is_voting_open());

    client.set_voting_status(&true);
    assert!(client.is_voting_open());
}

// ─── Query Functions ─────────────────────────────────────────────────────────

#[test]
fn test_get_voter_default() {
    let (env, client, _admin) = setup();
    let unknown = Address::generate(&env);
    let record = client.get_voter(&unknown);
    assert!(!record.has_sbt);
    assert!(!record.has_voted);
}
