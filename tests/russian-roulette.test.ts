import { beforeAll, describe, expect, test } from "bun:test";
import { emulateFulfill, getSetup } from "./setup";
import { RussianRoulette } from "../target/types/russian_roulette";
import { LiteSVMProvider } from "anchor-litesvm";
import { AnchorError, BN, Program } from "@coral-xyz/anchor";
import {
  InitBuilder,
  Orao,
  randomnessAccountAddress,
} from "@orao-network/solana-vrf";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram } from "@solana/web3.js";
import { fetchPlayerAcc } from "./accounts";
import { getPlayerPda } from "./pda";
import { LiteSVM } from "litesvm";

describe("russian-roulette", () => {
  let { client, program, provider, vrf } = {} as {
    client: LiteSVM;
    program: Program<RussianRoulette>;
    provider: LiteSVMProvider;
    vrf: Orao;
  };

  const [treasury, fulfillmentAuthority, authority] = Array.from(
    { length: 3 },
    Keypair.generate
  );
  const [playerPda] = getPlayerPda(authority.publicKey);
  let currentRound: number;
  let prevForce: Buffer<ArrayBufferLike> = Buffer.alloc(32);
  let force: Buffer;

  beforeAll(async () => {
    ({ client, program, provider, vrf } = getSetup(
      [treasury, fulfillmentAuthority, authority].map((kp) => {
        pubkey: return {
          pubkey: kp.publicKey,
          account: {
            data: new Uint8Array(0),
            executable: false,
            lamports: LAMPORTS_PER_SOL,
            owner: SystemProgram.programId,
          },
        };
      })
    ));

    await new InitBuilder(
      vrf,
      provider.publicKey,
      treasury.publicKey,
      [fulfillmentAuthority.publicKey],
      new BN(100)
    ).rpc();
  });

  test("spin and pull trigger", async () => {
    force = Keypair.generate().publicKey.toBuffer();

    await program.methods
      .spinAndPullTrigger([...force])
      .accountsPartial({
        authority: authority.publicKey,
        treasury: treasury.publicKey,
        prevRound: randomnessAccountAddress(prevForce),
      })
      .signers([authority])
      .rpc();

    const playerAcc = await fetchPlayerAcc(program, playerPda);

    expect(playerAcc.authority).toStrictEqual(authority.publicKey);
    expect(playerAcc.force).toStrictEqual([...force]);
    expect(playerAcc.rounds.toNumber()).toBe(1);

    currentRound = playerAcc.rounds.toNumber();
  });

  test("throws if randomness is not fulfilled", async () => {
    try {
      await program.methods
        .spinAndPullTrigger([...Keypair.generate().publicKey.toBuffer()])
        .accountsPartial({
          authority: authority.publicKey,
          treasury: treasury.publicKey,
          prevRound: randomnessAccountAddress(force),
        })
        .signers([authority])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { code } = (err as AnchorError).error.errorCode;
      expect(code).toBe("CylinderStillSpinning");
    }
  });

  test("play until dead", async () => {
    while (true) {
      await emulateFulfill(vrf, fulfillmentAuthority, force);
      const randomness = await vrf.getRandomness(force);
      const randomnessBuffer = Buffer.from(randomness.getFulfilledRandomness());

      expect(randomnessBuffer).not.toEqual(Buffer.alloc(64));

      if (randomnessBuffer.readBigUInt64LE() % BigInt(6) === BigInt(0)) {
        console.log(`Player is dead after ${currentRound} round(s)`);
        break;
      } else {
        console.log("Player is alive");
      }

      prevForce = force;
      force = Keypair.generate().publicKey.toBuffer();

      await program.methods
        .spinAndPullTrigger([...force])
        .accountsPartial({
          authority: authority.publicKey,
          treasury: treasury.publicKey,
          prevRound: randomnessAccountAddress(prevForce),
        })
        .signers([authority])
        .rpc();

      const playerAcc = await fetchPlayerAcc(program, playerPda);

      expect(playerAcc.force).toStrictEqual([...force]);
      expect(playerAcc.rounds.toNumber()).toBe(++currentRound);
    }
  });

  test("throws if trigger is pulled when player is dead", async () => {
    try {
      await program.methods
        .spinAndPullTrigger([...Keypair.generate().publicKey.toBuffer()])
        .accountsPartial({
          authority: authority.publicKey,
          treasury: treasury.publicKey,
          prevRound: randomnessAccountAddress(force),
        })
        .signers([authority])
        .rpc();
    } catch (err) {
      expect(err).toBeInstanceOf(AnchorError);

      const { code } = (err as AnchorError).error.errorCode;
      expect(code).toBe("PlayerDead");
    }
  });
});
