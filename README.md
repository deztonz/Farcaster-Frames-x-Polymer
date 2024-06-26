# ⛓️ The Polymer x Frame Farcaster 

## 📚 Documentation

Frog.fm documentation can be found in [the official Frog documentation](https://frog.fm/installation).

## 📋 Prerequisites

Ensure you have the following:

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


## My Challenge 
[My cast frame farcaster](https://warpcast.com/0xyoiiz/0x2c5c0778) 

My wallet : **0x037B458D968fC146CdA4840dd7A47c4E5728B03d**

[Base Contract : 0x5548D5878CEfE6e13c107323b1193ac6C2FD6010](https://base-sepolia.blockscout.com/address/0x5548D5878CEfE6e13c107323b1193ac6C2FD6010)

[OP Contract : 0xD36f8C13fE98Ff3284d40f1c8637e0e5A83DE56c](https://optimism-sepolia.blockscout.com/address/0xD36f8C13fE98Ff3284d40f1c8637e0e5A83DE56c)