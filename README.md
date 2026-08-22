# SBT Vote Protocol

Decentralized multi-poll voting protocol built on **Stellar Soroban** using Soulbound Tokens (SBTs) for voter eligibility verification and permissionless poll creation.

## Overview

This protocol enables secure, transparent elections and decentralized community proposals where:
- **Permissionless Poll Creation**: Any user can launch a custom poll with custom options, categories, and duration.
- **Soulbound Voter Identity (SBT)**: Users can claim a non-transferable Soulbound Token directly from the interface.
- **1-Person-1-Vote Integrity**: Each SBT holder can vote exactly once per poll, mathematically enforced on-chain.
- **Verifiable & Transparent Results**: Real-time live vote counts and on-chain event streams.
- **High-End Modern Web3 UI**: Glassmorphic dark design with Stellar cyan & gold accents, interactive landing page, and community voting hub.

## Architecture

```
sbt-vote-protocol/
├── contracts/sbt-vote/    # Soroban smart contract (Rust)
│   └── src/
│       ├── lib.rs         # Contract entry point & public interface
│       ├── types.rs       # DataKey, Poll, VoterRecord, VoteError
│       ├── storage.rs     # Multi-poll storage & TTL management
│       ├── sbt.rs         # Permissionless & admin SBT minting
│       ├── voting.rs      # Poll creation & vote casting with validation
│       ├── events.rs      # Contract events (#[contractevent])
│       └── test.rs        # Unit tests (14 tests)
├── frontend/              # Next.js 14 Web3 frontend with Freighter wallet
│   └── src/
│       ├── app/           # Pages & layout
│       ├── components/    # UI components (Landing, PollHub, Modals, Badges)
│       ├── hooks/         # useWallet, useEvents
│       └── lib/           # Stellar SDK, contract helpers & poll storage
└── scripts/
    └── deploy.sh          # Testnet deployment script
```

## Smart Contract

### Public Functions

| Function | Access | Description |
|----------|--------|-------------|
| `initialize(admin)` | Once | Initialize protocol admin and poll count |
| `claim_sbt(voter)` | Public | Permissionless claim of SBT voter identity |
| `mint_sbt(to)` | Admin | Admin minting of SBT to specific address |
| `create_poll(creator, options_count)` | Public | Launch a new community poll with 2-20 options |
| `vote(poll_id, voter, option_id)` | Voter | Cast a vote on a specific poll (requires SBT) |
| `set_poll_status(poll_id, caller, is_open)` | Creator/Admin | Open or close an existing poll |
| `get_poll_count()` | Public | Get total number of created polls |
| `get_poll(poll_id)` | Public | Get metadata and status of a poll |
| `get_poll_votes(poll_id, option_id)` | Public | Get vote count for an option |
| `get_poll_voter(poll_id, voter)` | Public | Check voter status for a specific poll |
| `has_sbt(voter)` | Public | Check if address holds a Soulbound Token |

### Error Handling

| Code | Error | Triggered When |
|------|-------|----------------|
| 1 | `NotAuthorized` | Non-creator/non-admin attempts status change |
| 2 | `VotingClosed` | Vote attempted while poll is closed |
| 3 | `AlreadyVoted` | Voter tries to vote again on the same poll |
| 4 | `NoSoulboundToken` | Voter without SBT tries to cast a vote |
| 5 | `InvalidOption` | Vote cast for invalid option ID |
| 6 | `AlreadyInitialized` | Contract initialized twice |
| 7 | `AlreadyHasSbt` | Claiming SBT when already possessing one |
| 8 | `PollNotFound` | Querying non-existent poll ID |
| 9 | `InvalidOptionsCount` | Creating poll with <2 or >20 options |

## Getting Started

### Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) with `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- [Node.js](https://nodejs.org/) >= 18
- [Freighter Wallet](https://www.freighter.app/) browser extension

### Build & Test

```bash
# Build the contract
make build

# Run unit tests (14 tests)
make test

# Format code
make fmt
```

### Run Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Freighter wallet.

## License

MIT
