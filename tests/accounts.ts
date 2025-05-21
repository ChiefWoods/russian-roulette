import { PublicKey } from "@solana/web3.js";
import { RussianRoulette } from "../target/types/russian_roulette";
import { Program } from "@coral-xyz/anchor";

export async function fetchPlayerAcc(
  program: Program<RussianRoulette>,
  playerPda: PublicKey
) {
  return program.account.player.fetchNullable(playerPda);
}
