import "dotenv/config";
import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  createMultisig,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { getExplorerLink } from "@solana-developers/helpers";

let privateKey = process.env["SECRET_KEY"];
if (privateKey === undefined) {
  console.log("Add SECRET_KEY to .env!");
  process.exit(1);
}
const asArray = Uint8Array.from(JSON.parse(privateKey));
const payer = Keypair.fromSecretKey(asArray);

const connection = new Connection(clusterApiUrl("devnet"));

const signer1 = Keypair.generate();
const signer2 = Keypair.generate();
const signer3 = Keypair.generate();

const multisigKey = await createMultisig(
  connection,
  payer,
  [signer1.publicKey, signer2.publicKey, signer3.publicKey],
  2
);

const mint = await createMint(
  connection,
  payer,
  multisigKey, 
  null, 
  2 
);

const recipientAssociatedTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  payer.publicKey
);

try {
    const transactionSignature = await mintTo(
    connection,
    payer,
    mint,
    recipientAssociatedTokenAccount.address,
    multisigKey,
    15 * Math.pow(10, 2), 
    [signer1, signer2] 
  );

  const link = getExplorerLink("transaction", transactionSignature, "devnet");
  console.log(`✅ Success! Mint Token Transaction: ${link}`);
} catch (error) {
  console.log(error);
}
