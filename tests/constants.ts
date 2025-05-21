import { PublicKey } from "@solana/web3.js";
import idl from "../target/idl/russian_roulette.json";

export const RUSSIAN_ROULETTE_PROGRAM_ID = new PublicKey(idl.address);
