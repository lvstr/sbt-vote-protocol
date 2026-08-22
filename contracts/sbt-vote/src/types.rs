use soroban_sdk::{contracterror, contracttype, Address};

/// Storage keys for the contract.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    VotingOpen,
    Voter(Address),
    Candidate(u32),
    CandidateCount,
}

/// Per-voter state: SBT ownership and voting status.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VoterRecord {
    pub has_sbt: bool,
    pub has_voted: bool,
}

/// Contract errors returned to callers.
/// Each variant maps to a unique u32 code for the Soroban runtime.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VoteError {
    /// Caller is not the admin.
    NotAuthorized = 1,
    /// Voting period is closed.
    VotingClosed = 2,
    /// Voter has already cast a vote.
    AlreadyVoted = 3,
    /// Voter does not hold a Soulbound Token.
    NoSoulboundToken = 4,
    /// Candidate ID is not registered.
    InvalidCandidate = 5,
    /// Contract has already been initialized.
    AlreadyInitialized = 6,
    /// Voter already holds an SBT (cannot mint again).
    AlreadyHasSbt = 7,
}
