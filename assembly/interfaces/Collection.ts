import { Protobuf, System } from "@koinos/sdk-as";
import { error } from "@koinos/proto-as";
import { collections } from "./../proto/collections"

enum entries {
  name_entry = 0x82a3537f,
  symbol_entry = 0xb76a7ca1,
  total_supply_entry = 0xb0da3934,
  royalties_entry = 0x36e90cd0,
  transfer_entry = 0x27f576ca,
  owner_entry = 0xed61c847,
  balance_of_entry = 0x5c721497,
  approved_entry = 0x4c731020,
  approved_operator_entry = 0xe7ab8ce5
}

export class Collection {
  _contractId: Uint8Array;

  constructor(contractId: Uint8Array) {
    this._contractId = contractId;
  }

  name(): string {
    const args = new collections.name_arguments();
    const callRes = System.call(this._contractId, entries.name_entry, Protobuf.encode(args, collections.name_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token name");
    const res = Protobuf.decode<collections.name_result>(callRes.res.object as Uint8Array, collections.name_result.decode);
    return res.value;
  }

  symbol(): string {
    const args = new collections.symbol_arguments();
    const callRes = System.call(this._contractId, entries.symbol_entry, Protobuf.encode(args, collections.symbol_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token symbol");
    const res = Protobuf.decode<collections.symbol_result>(callRes.res.object as Uint8Array, collections.symbol_result.decode);
    return res.value;
  }

  totalSupply(): u64 {
    const args = new collections.total_supply_arguments();
    const callRes = System.call(this._contractId, entries.total_supply_entry, Protobuf.encode(args, collections.total_supply_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token supply");
    const res = Protobuf.decode<collections.total_supply_result>(callRes.res.object as Uint8Array, collections.total_supply_result.decode);
    return res.value;
  }

  getRoyalties(): collections.royalty_object[] {
    const args = new collections.royalties_arguments();
    const callRes = System.call(this._contractId, entries.royalties_entry, Protobuf.encode(args, collections.royalties_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token supply");
    const res = Protobuf.decode<collections.royalties_result>(callRes.res.object as Uint8Array, collections.royalties_result.decode);
    return res.value;
  }

  ownerOf(token_id: u64): Uint8Array {
    const args = new collections.owner_of_arguments(token_id);
    const callRes = System.call(this._contractId, entries.owner_entry, Protobuf.encode(args, collections.owner_of_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<collections.owner_of_result>(callRes.res.object as Uint8Array, collections.owner_of_result.decode);
    return res.value;
  }

  balanceOf(owner: Uint8Array): u64 {
    const args = new collections.balance_of_arguments(owner);
    const callRes = System.call(this._contractId, entries.balance_of_entry, Protobuf.encode(args, collections.balance_of_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<collections.balance_of_result>(callRes.res.object as Uint8Array, collections.balance_of_result.decode);
    return res.value;
  }

  transfer(from: Uint8Array, to: Uint8Array, token_id: u64): bool {
    const args = new collections.transfer_arguments(from, to, token_id);
    const callRes = System.call(this._contractId, entries.transfer_entry, Protobuf.encode(args, collections.transfer_arguments.encode));
    return callRes.code == error.error_code.success;
  }

  getApproved(token_id: u64): Uint8Array {
    const args = new collections.get_approved_arguments(token_id);
    const callRes = System.call(this._contractId, entries.approved_entry, Protobuf.encode(args, collections.get_approved_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<collections.get_approved_result>(callRes.res.object as Uint8Array, collections.get_approved_result.decode);
    return res.value;
  }

  isApprovedForAll(owner: Uint8Array, operator: Uint8Array): bool {
    const args = new collections.is_approved_for_all_arguments(owner, operator);
    const callRes = System.call(this._contractId, entries.approved_operator_entry, Protobuf.encode(args, collections.is_approved_for_all_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<collections.is_approved_for_all_result>(callRes.res.object as Uint8Array, collections.is_approved_for_all_result.decode);
    return res.value;
  }
}
