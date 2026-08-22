use soroban_sdk::{contracterror, contracttype, Address};

/// Storage keys for the contract.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    PollCount,
    GlobalSbt(Address),
    Poll(u32),
    PollOption(u32, u32),       // (poll_id, option_id)
    PollVoter(u32, Address),    // (poll_id, voter)
}

/// Metadata and state for an on-chain poll.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Poll {
    pub id: u32,
    pub creator: Address,
    pub options_count: u32,
    pub is_open: bool,
    pub total_votes: u32,
}

/// Per-voter status for a specific poll and global SBT ownership.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VoterRecord {
    pub has_sbt: bool,
    pub has_voted: bool,
    pub voted_option: u32,
}

/// Contract errors returned to callers.
/// Each variant maps to a unique u32 code for the Soroban runtime.
#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VoteError {
    /// Caller is not authorized.
    NotAuthorized = 1,
    /// Voting period for this poll is closed.
    VotingClosed = 2,
    /// Voter has already cast a vote on this poll.
    AlreadyVoted = 3,
    /// Voter does not hold a Soulbound Token.
    NoSoulboundToken = 4,
    /// Option / candidate ID is not valid for this poll.
    InvalidOption = 5,
    /// Contract has already been initialized.
    AlreadyInitialized = 6,
    /// Voter already holds an SBT.
    AlreadyHasSbt = 7,
    /// Poll with the given ID does not exist.
    PollNotFound = 8,
    /// Options count must be between 2 and 20.
    InvalidOptionsCount = 9,
}
