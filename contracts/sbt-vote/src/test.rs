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
    assert_eq!(client.get_poll_count(), 0);
}

#[test]
fn test_initialize_already_initialized() {
    let (_env, client, _admin) = setup();
    let another = Address::generate(&_env);
    let result = client.try_initialize(&another);
    assert!(result.is_err());
}

// ─── SBT Claiming & Minting ──────────────────────────────────────────────────

#[test]
fn test_claim_sbt_success() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    assert!(!client.has_sbt(&voter));
    client.claim_sbt(&voter);
    assert!(client.has_sbt(&voter));
}

#[test]
fn test_claim_sbt_already_has_sbt() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.claim_sbt(&voter);
    let result = client.try_claim_sbt(&voter);
    assert!(result.is_err());
}

#[test]
fn test_mint_sbt_success() {
    let (env, client, _admin) = setup();
    let voter = Address::generate(&env);

    client.mint_sbt(&voter);
    assert!(client.has_sbt(&voter));
}

// ─── Poll Creation ───────────────────────────────────────────────────────────

#[test]
fn test_create_poll_success() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);

    let poll_id_1 = client.create_poll(&creator, &3);
    assert_eq!(poll_id_1, 1);

    let poll_id_2 = client.create_poll(&creator, &5);
    assert_eq!(poll_id_2, 2);

    assert_eq!(client.get_poll_count(), 2);

    let poll = client.get_poll(&1);
    assert_eq!(poll.id, 1);
    assert_eq!(poll.creator, creator);
    assert_eq!(poll.options_count, 3);
    assert!(poll.is_open);
    assert_eq!(poll.total_votes, 0);
}

#[test]
fn test_create_poll_invalid_options() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);

    // Less than 2 options
    let result_low = client.try_create_poll(&creator, &1);
    assert!(result_low.is_err());

    // More than 20 options
    let result_high = client.try_create_poll(&creator, &25);
    assert!(result_high.is_err());
}

// ─── Voting Mechanics ────────────────────────────────────────────────────────

#[test]
fn test_vote_success() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter1 = Address::generate(&env);
    let voter2 = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);

    client.claim_sbt(&voter1);
    client.claim_sbt(&voter2);

    client.vote(&poll_id, &voter1, &1);
    client.vote(&poll_id, &voter2, &2);

    assert_eq!(client.get_poll_votes(&poll_id, &1), 1);
    assert_eq!(client.get_poll_votes(&poll_id, &2), 1);
    assert_eq!(client.get_poll_votes(&poll_id, &3), 0);

    let poll = client.get_poll(&poll_id);
    assert_eq!(poll.total_votes, 2);

    let record1 = client.get_poll_voter(&poll_id, &voter1);
    assert!(record1.has_sbt);
    assert!(record1.has_voted);
    assert_eq!(record1.voted_option, 1);
}

#[test]
fn test_vote_error_no_sbt() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);
    let result = client.try_vote(&poll_id, &voter, &1);
    assert!(result.is_err());
}

#[test]
fn test_vote_error_already_voted() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);
    client.claim_sbt(&voter);

    client.vote(&poll_id, &voter, &1);
    let result = client.try_vote(&poll_id, &voter, &2);
    assert!(result.is_err());
}

#[test]
fn test_vote_across_multiple_polls() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let poll1 = client.create_poll(&creator, &2);
    let poll2 = client.create_poll(&creator, &3);

    client.claim_sbt(&voter);

    // Voter can vote once on poll 1 and once on poll 2
    client.vote(&poll1, &voter, &1);
    client.vote(&poll2, &voter, &2);

    assert_eq!(client.get_poll_votes(&poll1, &1), 1);
    assert_eq!(client.get_poll_votes(&poll2, &2), 1);
}

#[test]
fn test_vote_error_invalid_option() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);
    client.claim_sbt(&voter);

    // Option 0 is invalid
    let res0 = client.try_vote(&poll_id, &voter, &0);
    assert!(res0.is_err());

    // Option 4 is invalid when max is 3
    let res4 = client.try_vote(&poll_id, &voter, &4);
    assert!(res4.is_err());
}

#[test]
fn test_vote_error_voting_closed() {
    let (env, client, _admin) = setup();
    let creator = Address::generate(&env);
    let voter = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);
    client.claim_sbt(&voter);

    client.set_poll_status(&poll_id, &creator, &false);

    let result = client.try_vote(&poll_id, &voter, &1);
    assert!(result.is_err());
}

#[test]
fn test_set_poll_status_by_creator_and_admin() {
    let (env, client, admin) = setup();
    let creator = Address::generate(&env);

    let poll_id = client.create_poll(&creator, &3);

    // Creator closes
    client.set_poll_status(&poll_id, &creator, &false);
    assert!(!client.get_poll(&poll_id).is_open);

    // Admin re-opens
    client.set_poll_status(&poll_id, &admin, &true);
    assert!(client.get_poll(&poll_id).is_open);
}
