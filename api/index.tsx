import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { handle } from 'frog/vercel'
import { contractAbi, dispatcherAbi } from "./abi.js";
import { ethers, JsonRpcProvider } from "ethers";
import * as dotenv from 'dotenv';
import { baseSepolia } from 'viem/chains';

dotenv.config();

const rpcOptimism = `https://opt-sepolia.g.alchemy.com/v2/${process.env.OP_ALCHEMY_API_KEY}`;
const rpcBase = `https://base-sepolia.g.alchemy.com/v2/${process.env.BASE_ALCHEMY_API_KEY}`;
let baseContractAddress = (process.env.BASE_CONTRACT) as `0x${string}`;
let opContractAddress = (process.env.OP_CONTRACT) as `0x${string}`;
let baseChannelName = ethers.encodeBytes32String(process.env.BASE_CHANNEL as string);
let opChannelName = ethers.encodeBytes32String(process.env.OP_CHANNEL as string);
let opUCAddress = process.env.OP_UC_MW_SIM;
let baseUCAddress = process.env.BASE_UC_MW_SIM;
const opDispatcherAddress = process.env.OP_DISPATCHER_SIM as string;
const baseDispatcherAddress = process.env.BASE_DISPATCHER_SIM as string;
const opProvider = new JsonRpcProvider(rpcOptimism, 11155420);
const baseProvider = new JsonRpcProvider(rpcBase, 84532);
const opDispatcherContract = new ethers.Contract(opDispatcherAddress, dispatcherAbi, opProvider);
const baseDispatcherContract = new ethers.Contract(baseDispatcherAddress, dispatcherAbi, baseProvider);
let tranID = '' as string;

type State = {
  sendTx: string
  sendTime: number
  recvTx: string
  recvTime: number
  ackTx: string
  ackTime: number
  wrAckTx:string
  wrAckTime:number
  sequence: number
  sendTxId: string
}

export const app = new Frog<{ State: State }>({
  assetsPath: '/',
  basePath: '/api',
  initialState: {},
})

function textInImage(text: string) {
  return (<div
    style={{
      alignItems: 'center',
      background: 'linear-gradient(to right, #030302, #141414)',
      backgroundSize: '100% 100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      height: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }}
  >
    <img width='200px' height='200px' src={`${process.env.PUBLIC_URL}/polymer.png`}></img>
    <div
      style={{
        color: 'white',
        fontSize: 45,
        fontStyle: 'normal',
        letterSpacing: '-0.025em',
        lineHeight: 1.4,
        marginTop: 30,
        padding: '0 120px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  </div>);
}
function textInImageSmall(text: string) {
  return (<div
    style={{
      alignItems: 'center',
      background: 'linear-gradient(to right, #030302, #141414)',
      backgroundSize: '100% 100%',
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'nowrap',
      height: '100%',
      justifyContent: 'center',
      textAlign: 'center',
      width: '100%',
    }}
  >
    <img width='200px' height='200px' src={`${process.env.PUBLIC_URL}/polymer.png`}></img>
    <div
      style={{
        color: 'white',
        fontSize: 25,
        fontStyle: 'normal',
        letterSpacing: '-0.025em',
        lineHeight: 1.4,
        marginTop: 30,
        padding: '0 120px',
        whiteSpace: 'pre-wrap',
      }}
    >
      {text}
    </div>
  </div>);
}

app.frame('/', (c) => {
  return c.res({
    action: "/verify-recv-packet",
    image: textInImage("Send UniversalPacket transaction"),
    intents: [
      <Button.Transaction target="/send">Send</Button.Transaction>,
    ],
  })
})

app.transaction('/send', (c) => {
  return c.contract({
    abi: contractAbi,
    chainId: `eip155:${baseSepolia.id}`,
    functionName: 'sendUniversalPacket',
    args: [opContractAddress, baseChannelName as `0x${string}`, 36000n],
    to: baseContractAddress
  })
})

app.frame("/verify-recv-packet", async (c) => {
  const { transactionId, buttonValue, buttonIndex, status, deriveState } = c;
  console.log("verify-recv-packet", { transactionId, buttonValue, buttonIndex, status });

  const state = deriveState(previousState => {
    if (transactionId) {
      previousState.sendTxId = transactionId;
      tranID = transactionId;
    }

  })

  if (buttonValue == "verify-packet-receipt") {
    const txId = state.sendTxId;
    console.log("tx : " + txId);
    let receipt = await baseProvider.getTransactionReceipt(txId);
    for (let log of receipt?.logs || []) {
      let decoded = baseDispatcherContract.interface.parseLog(log);
      if (decoded && decoded.name == "SendPacket") {
        const [, , , sequence, ,] = decoded.args;
        state.sequence = Number(sequence);
        state.sendTime = (await receipt!.getBlock()).timestamp;
      }
    }

    const blockNumber = await opProvider.getBlockNumber();
    const recvLogFilter = opDispatcherContract.filters.RecvPacket!(opUCAddress, opChannelName);
    const logs = await opDispatcherContract.queryFilter(recvLogFilter, blockNumber - 3600);

    for (let log of logs) {
      let decoded = opDispatcherContract.interface.parseLog(log);
      if (decoded && decoded.name == "RecvPacket") {
        const [, , recvSeq,] = decoded.args;
        if (recvSeq == state.sequence) {
          state.recvTx = log.transactionHash;
          state.recvTime = (await log.getBlock()).timestamp;

          // let text = "Verify Packet on Optimism";
          // text += `\nReceived : ${state.recvTime - state.sendTime} seconds`;
          let text = `🔔 Event name: RecvPacket`;
          text += `\n⛓️  Network: optimism`;
          text += `\n🔗 Destination Port Address: ${opContractAddress}`;
          text += `\n🛣️  Source Channel ID: ${process.env.OP_CHANNEL}`;
          if (state.sequence) {
            text += `\n📈 Sequence : ${state.sequence}`;
          }
          if (state.recvTx) {
            text += `\n⏳ TxHash: ${state.recvTx}`;
          }
          text += `\n====================================`;
          text += `\n⏱️ Waiting for write acknowledgement...`;

          return c.res({
            image: textInImageSmall(text),
            intents: [
              <Button action={'/verify-ack'} value="verify">
                Verify Packet
              </Button>,
              <Button.Link href={`https://optimism-sepolia.blockscout.com/tx/${log.transactionHash}`}>
                Transaction
              </Button.Link>
            ],
          });
        }
      }
    }
    let text = `🔔 Event name: SendPacket`;
    text += `\n⛓️  Network: base`;
    text += `\n🔗 Source Port Address: ${baseContractAddress}`;
    text += `\n🛣️  Source Channel ID: ${process.env.BASE_CHANNEL}`;
    if (state.sequence) {
      text += `\n📈 Sequence : ${state.sequence}`;
    }
    if (tranID) {
      text += `\n⏳ TxHash: ${tranID}`;
    }
    text += `\n====================================`;
    text += `\n⏱️ Waiting for packet receipt...`;
    return c.res({
      image: textInImageSmall(text),
      intents: [
        <Button value="verify-packet-receipt">
          Verify Packet
        </Button>,
      ],
    });
  }
  let text = `🔔 Event name: SendPacket`;
  text += `\n⛓️  Network: base`;
  text += `\n🔗 Source Port Address: ${baseContractAddress}`;
  text += `\n🛣️  Source Channel ID: ${process.env.BASE_CHANNEL}`;
  if (state.sequence) {
    text = `\n📈 Sequence : ${state.sequence}`;
  }
  if (state.sendTxId) {
    text += `\n⏳ TxHash: ${tranID}`;
  }

  // let text = "IBC packet has been sent";
  // text += `\ntx : `+state.sendTxId;
  // if (state.sequence) {
  //   text = `An IBC packet is sent\n Sequence ${state.sequence}`;
  // }

  return c.res({
    image: textInImageSmall(text),
    intents: [
      <Button value="verify-packet-receipt">
        Verify Packet
      </Button>,
      <Button.Link href={`https://base-sepolia.blockscout.com/tx/${transactionId}`}>
        Transaction
      </Button.Link>
    ],
  });
});

app.frame("/verify-ack", async (c) => {
  const { buttonValue, status, deriveState } = c;
  console.log("verify-ack", { buttonValue, status });
  const state = deriveState();

  const blockNumber = await baseProvider.getBlockNumber();
  const ackLogFilter = baseDispatcherContract.filters.Acknowledgement!(baseUCAddress, baseChannelName);
  const logs = await baseDispatcherContract.queryFilter(ackLogFilter, blockNumber - 3600);

  for (let log of logs) {
    let decoded = baseDispatcherContract.interface.parseLog(log);
    if (decoded && decoded.name == "Acknowledgement") {
      const [, , ackSeq] = decoded.args;
      if (ackSeq == state.sequence) {
        state.ackTx = log.transactionHash;
        state.ackTime = (await log.getBlock()).timestamp;

        // let text = "Check Packet Acknowledged on Base";
        // text += `\nAcknowledged : ${state.ackTime - state.sendTime} seconds`;
        tranID = '';
        let text = `🔔 Event name: Acknowledgement`;
        text += `\n⛓️  Network: base`;
        text += `\n🔗 Destination Port Address: ${baseContractAddress}`;
        text += `\n🛣️  Source Channel ID: ${process.env.OP_CHANNEL}`;
        if (state.sequence) {
          text += `\n📈 Sequence : ${state.sequence}`;
        }
        if (state.ackTx) {
          text += `\n⏳ TxHash: ${state.ackTx}`;
        }

        return c.res({
          image: textInImageSmall(text),
          intents: [
            <Button.Reset>
              try another
            </Button.Reset>,
            <Button.Link href={`https://base-sepolia.blockscout.com/tx/${log.transactionHash}`}>
              Transaction
            </Button.Link>,
            <Button.Link href={`https://discord.gg/Wfydpshds8`}>
              Discord
            </Button.Link>,
          ],
        });
      }
    }
  }

  return c.res({
    image: textInImage("⏱️ Waiting for acknowledgement... on Base"),
    intents: [
      <Button value="verify-ack">
        Verify Packet
      </Button>,
    ],
  });
})

// @ts-ignore
const isEdgeFunction = typeof EdgeFunction !== 'undefined'
const isProduction = isEdgeFunction || import.meta.env?.MODE !== 'development'
devtools(app, isProduction ? { assetsPath: '/.frog' } : { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
