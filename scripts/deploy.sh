#!/bin/bash
set -e

# ──────────────────────────────────────────────────────────────────────────────
# SBT Vote Protocol - Testnet Deployment Script
# ──────────────────────────────────────────────────────────────────────────────
# Prerequisites:
#   - stellar CLI installed (https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
#   - A funded testnet account (use `stellar keys generate` and friendbot)
# ──────────────────────────────────────────────────────────────────────────────

NETWORK="testnet"
SOURCE_ACCOUNT="${SOURCE_ACCOUNT:-deployer}"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          SBT Vote Protocol - Testnet Deployment             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Generate keys if not already present
if ! stellar keys address "$SOURCE_ACCOUNT" &>/dev/null; then
  echo "→ Generating deployer keypair..."
  stellar keys generate "$SOURCE_ACCOUNT" --network "$NETWORK"
  echo "  ✓ Key generated and funded via friendbot"
else
  echo "→ Using existing key: $SOURCE_ACCOUNT"
fi

DEPLOYER_ADDRESS=$(stellar keys address "$SOURCE_ACCOUNT")
echo "  Address: $DEPLOYER_ADDRESS"
echo ""

# Step 2: Build the contract
echo "→ Building contract..."
stellar contract build
echo "  ✓ Contract built"
echo ""

# Step 3: Deploy the contract
echo "→ Deploying to testnet..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm target/wasm32v1-none/release/sbt_vote.wasm \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  --alias sbt-vote)
echo "  ✓ Deployed!"
echo "  Contract ID: $CONTRACT_ID"
echo ""

# Step 4: Initialize the contract
echo "→ Initializing contract with admin: $DEPLOYER_ADDRESS"
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- \
  initialize \
  --admin "$DEPLOYER_ADDRESS"
echo "  ✓ Contract initialized"
echo ""

# Step 5: Claim SBT for deployer and create initial sample community polls
echo "→ Claiming Soulbound Token for deployer..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- \
  claim_sbt \
  --voter "$DEPLOYER_ADDRESS"
echo "  ✓ Soulbound Token claimed"

echo "→ Creating Genesis community poll..."
stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source-account "$SOURCE_ACCOUNT" \
  --network "$NETWORK" \
  -- \
  create_poll \
  --creator "$DEPLOYER_ADDRESS" \
  --options_count 3
echo "  ✓ Genesis Poll #1 created with 3 options"
echo ""

# Step 6: Output summary
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    Deployment Complete!                     ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Contract ID: $CONTRACT_ID"
echo "║ Network:     $NETWORK"
echo "║ Admin:       $DEPLOYER_ADDRESS"
echo "║ Polls:       1 Genesis Poll created"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Copy the Contract ID to frontend/.env.local:"
echo "     NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "  2. Start the frontend:"
echo "     cd frontend && npm install && npm run dev"
