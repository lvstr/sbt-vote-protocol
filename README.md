# SBT Vote Protocol

Decentralized voting system built on **Stellar Soroban** using Soulbound Tokens (SBTs) for voter eligibility verification.

## Overview

This protocol enables secure, transparent elections where:
- An admin mints non-transferable **Soulbound Tokens** to eligible voters
- Only SBT holders can cast votes
- Each voter can only vote once (1-person-1-vote)
- Results are transparent and verifiable on-chain
- Events are emitted for real-time off-chain monitoring

## Architecture

```
sbt-vote-protocol/
├── contracts/sbt-vote/    # Soroban smart contract (Rust)
│   └── src/
│       ├── lib.rs         # Contract entry point & public interface
│       ├── types.rs       # DataKey, VoterRecord, VoteError
│       ├── storage.rs     # Storage helpers & TTL management
│       ├── sbt.rs         # SBT minting logic
│       ├── voting.rs      # Vote casting with validation
│       ├── events.rs      # Contract events (#[contractevent])
│       └── test.rs        # Unit tests (13 tests)
├── frontend/              # Next.js frontend with Freighter wallet
│   └── src/
│       ├── app/           # Pages & layout
│       ├── components/    # UI components
│       ├── hooks/         # useWallet, useEvents
│       └── lib/           # Stellar SDK & contract helpers
└── scripts/
    └── deploy.sh          # Testnet deployment script
```

## Smart Contract

### Public Functions

| Function | Access | Description |
|----------|--------|-------------|
| `initialize(admin)` | Once | Set admin and open voting |
| `register_candidate()` | Admin | Register a new candidate, returns ID |
| `mint_sbt(to)` | Admin | Mint SBT to eligible voter |
| `vote(voter, candidate_id)` | Voter | Cast a vote |
| `set_voting_status(is_open)` | Admin | Open/close voting |
| `get_votes(candidate_id)` | Public | Get vote count |
| `get_voter(voter)` | Public | Get voter status |
| `get_candidate_count()` | Public | Get registered candidate count |
| `is_voting_open()` | Public | Check voting status |

### Error Handling

The contract defines 7 error types, all actively used:

| Code | Error | Triggered When |
|------|-------|----------------|
| 1 | `NotAuthorized` | Non-admin calls admin function |
| 2 | `VotingClosed` | Vote attempted while voting is closed |
| 3 | `AlreadyVoted` | Voter tries to vote again |
| 4 | `NoSoulboundToken` | Voter without SBT tries to vote |
| 5 | `InvalidCandidate` | Vote for unregistered candidate |
| 6 | `AlreadyInitialized` | Contract initialized twice |
| 7 | `AlreadyHasSbt` | Minting SBT to existing holder |

### Events

| Event | Topics | Data |
|-------|--------|------|
| `MintSbt` | `to: Address` | - |
| `VoteCast` | `voter: Address` | `candidate_id: u32` |
| `VotingStatusChanged` | - | `is_open: bool` |
| `CandidateRegistered` | - | `candidate_id: u32` |

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

# Run tests
make test

# Format code
make fmt
```

### Deploy to Testnet

```bash
# Deploy and initialize with 3 candidates
make deploy

# Or run the script directly with a custom source account
SOURCE_ACCOUNT=my-key ./scripts/deploy.sh
```

### Run Frontend

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your contract ID from deployment

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and connect your Freighter wallet.

## Frontend Features

- **Wallet Connection**: Connect/disconnect via Freighter
- **Voter Status**: See your SBT and voting status
- **Vote Casting**: Select a candidate and submit transaction
- **Live Results**: Real-time vote tallies with progress bars
- **Event Feed**: Live polling of contract events
- **Transaction Status**: Visual feedback (building → signing → submitting → success/error)
- **Error Handling**: Contract errors mapped to user-friendly messages

## Technology Stack

- **Smart Contract**: Rust, Soroban SDK v25
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Wallet**: Freighter API v2
- **Network**: Stellar Testnet (Soroban RPC)

## License

MIT
