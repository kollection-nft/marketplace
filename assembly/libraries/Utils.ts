import { StringBytes, System, value, Protobuf } from "@koinos/sdk-as";
import { marketplace } from "./../proto/marketplace";

export class Utils {
  static getCaller(): Uint8Array {
    const caller = System.getCaller();
    if(caller.caller.length) {
      return caller.caller as Uint8Array;
    }
    const txFieldPayee = System.getTransactionField('header.payee');
    if(txFieldPayee) {
      if(txFieldPayee.bytes_value.length) {
        return txFieldPayee.bytes_value as Uint8Array;
      }
    }
    const txFieldPayer = System.getTransactionField('header.payer') as value.value_type;
    return txFieldPayer.bytes_value as Uint8Array;
  }

  static getBlockNumber(): u64 {
    let block_height_field = System.getBlockField('header.height')!;
    let head_block = block_height_field.uint64_value as u64;
    return head_block
  }

  static getOrderId(timeExpire: u64, owner: Uint8Array, collection: Uint8Array, tokenId: Uint8Array, tokenPrice: u64): Uint8Array {
    let message = new marketplace.hash_id(tokenId, owner, collection, timeExpire, tokenPrice);
    return Protobuf.encode(message, marketplace.hash_id.encode);
  }
}