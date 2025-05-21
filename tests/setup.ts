import { Program } from "@coral-xyz/anchor";
import { fromWorkspace, LiteSVMProvider } from "anchor-litesvm";
import { RussianRoulette } from "../target/types/russian_roulette";
import idl from "../target/idl/russian_roulette.json";
import { Keypair, PublicKey } from "@solana/web3.js";
import { AccountInfoBytes } from "litesvm";
import { sign } from "tweetnacl";
import { FulfillBuilder, Orao } from "@orao-network/solana-vrf";

export function getSetup(
  accs: { pubkey: PublicKey; account: AccountInfoBytes }[] = []
) {
  const client = fromWorkspace("./");
  client.addProgramFromFile(
    new PublicKey("VRFzZoJdhFWL8rkvu87LpKM3RbcVezpMEc6X5GVDr7y"),
    "./tests/fixtures/orao_vrf.so"
  );

  for (const { pubkey, account } of accs) {
    client.setAccount(new PublicKey(pubkey), {
      data: account.data,
      executable: account.executable,
      lamports: account.lamports,
      owner: new PublicKey(account.owner),
    });
  }

  const provider = new LiteSVMProvider(client);
  // override getRecentPrioritizationFees here
  provider.connection.getRecentPrioritizationFees = async () => {
    const clock = provider.client.getClock();

    return Promise.resolve([
      {
        prioritizationFee: 0,
        slot: Number(clock.slot),
      },
    ]);
  };
  const program = new Program<RussianRoulette>(idl, provider);
  const vrf = new Orao(provider);

  return { client, provider, program, vrf };
}

// This helper emulates randomness fulfillment that is usually listened and carried out by the VRF nodes.
export async function emulateFulfill(
  vrf: Orao,
  fulfillmentAuthority: Keypair,
  seed: Uint8Array
) {
  const signature = sign.detached(seed, fulfillmentAuthority.secretKey);

  await new FulfillBuilder(vrf, seed).rpc(
    fulfillmentAuthority.publicKey,
    signature
  );
}
