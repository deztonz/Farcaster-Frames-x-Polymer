# ⛓️ The Polymer x Frame Farcaster 

## 📚 Documentation

Frog.fm documentation can be found in [the official Frog documentation](https://frog.fm/installation).

## 📋 Prerequisites

The repo is **compatible with both Hardhat and Foundry** development environments.

- Have [git](https://git-scm.com/downloads) installed
- Have [node](https://nodejs.org) installed (v18+)
- Have [Farcaster/Warpcast account](https://warpcast.com/)
- Deployed Base and Optimism contract address (XCounterUC) use just do-it-base 
It does the following under the hood (add to Justfile):
```bash
do-it-base:
    echo "Running the full E2E flow..."
    just set-contracts optimism XCounterUC true && just set-contracts base XCounterUC true
    just deploy base optimism
    just sanity-check
    just send-packet base
    echo "You've done it!"
```


You'll need some API keys from third party's:
- [Optimism Sepolia](https://optimism-sepolia.blockscout.com/account/api-key) and [Base Sepolia](https://base-sepolia.blockscout.com/account/api-key) Blockscout Explorer API keys
- Have an [Alchemy API key](https://docs.alchemy.com/docs/alchemy-quickstart-guide) for OP and Base Sepolia


## 🧰 Install dependencies

1. Clone the repository and goto directory:
```bash
git clone https://github.com/deztonz/Farcaster-Frames-x-Polymer.git
cd polymer-farcaster-frames
```

2. Set up your environment variables:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

## Configuration

3. Install dependencies:
```bash
# API keys for developer tooling and infra
OP_ALCHEMY_API_KEY=''
BASE_ALCHEMY_API_KEY=''

# Base , OP XCounterUC contract
BASE_CONTRACT=''
OP_CONTRACT=''

# Universal Channel
BASE_CHANNEL='channel-11'
OP_CHANNEL='channel-10'

# Contract addresses for the sim-client
OP_UC_MW_SIM=''
BASE_UC_MW_SIM=''

OP_DISPATCHER_SIM=''
BASE_DISPATCHER_SIM=''

# public url deploy ex. https://xxx.vercel.app
PUBLIC_URL=''
```

## Usage
1. Start developement
```bash
npm run dev
```
2. see the simulation of the http://localhost:5173/api/dev
