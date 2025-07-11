import { PublicKey } from "@solana/web3.js";
import idl from "../target/idl/russian_roulette.json";

const RUSSIAN_ROULETTE_PROGRAM_ID = new PublicKey(idl.address);

export function getPlayerPda(authority: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("player"), authority.toBuffer()],
    RUSSIAN_ROULETTE_PROGRAM_ID,
  );
}
