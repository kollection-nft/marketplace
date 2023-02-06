import { Base58, System } from "@koinos/sdk-as";

export namespace Constants {
  export const TREASURY_CONTRACT = Base58.decode('');


  let  TOKENS_ACEPTED: Uint8Array | null = null;
  export function KoinContractId(): Uint8Array {
    if (TOKENS_ACEPTED == null) {
      TOKENS_ACEPTED = System.getContractAddress('koin');
    }
    return TOKENS_ACEPTED!;
  }
}