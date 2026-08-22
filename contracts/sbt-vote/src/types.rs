// types.rs
#![no_std]
use soroban_sdk::{contracterror, contracttype, Address};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,           // Menyimpan address admin (KPU/Panitia)
    VotingOpen,      // Status boolean apakah voting sedang berjalan
    Voter(Address),  // Menyimpan status SBT dan status sudah vote atau belum
    Candidate(u32),  // Menyimpan jumlah suara untuk kandidat tertentu
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct VoterRecord {
    pub has_sbt: bool,
    pub has_voted: bool,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum VoteError {
    NotAuthorized = 1,
    VotingClosed = 2,
    AlreadyVoted = 3,
    NoSoulboundToken = 4,
    InvalidCandidate = 5,
}