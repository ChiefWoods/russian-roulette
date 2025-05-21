import { PublicKey } from "@solana/web3.js";
import { RUSSIAN_ROULETTE_PROGRAM_ID } from "./constants";

export function getPlayerPda(authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("player"), authority.toBuffer()],
    RUSSIAN_ROULETTE_PROGRAM_ID
  );
}
