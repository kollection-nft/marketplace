import { Protobuf, System } from "@koinos/sdk-as";
import { error } from "@koinos/proto-as";
import { colections } from "./../proto/colections"

enum entries {
  name_entry = 0x82a3537f,
  symbol_entry = 0xb76a7ca1,
  total_supply_entry = 0xb0da3934,
  royalties_entry = 0x36e90cd0,
  transfer_entry = 0x27f576ca,
  owner_entry = 0x27f576ca,
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
    const args = new colections.name_arguments();
    const callRes = System.call(this._contractId, entries.name_entry, Protobuf.encode(args, colections.name_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token name");
    const res = Protobuf.decode<colections.name_result>(callRes.res.object as Uint8Array, colections.name_result.decode);
    return res.value;
  }

  symbol(): string {
    const args = new colections.symbol_arguments();
    const callRes = System.call(this._contractId, entries.symbol_entry, Protobuf.encode(args, colections.symbol_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token symbol");
    const res = Protobuf.decode<colections.symbol_result>(callRes.res.object as Uint8Array, colections.symbol_result.decode);
    return res.value;
  }

  totalSupply(): u64 {
    const args = new colections.total_supply_arguments();
    const callRes = System.call(this._contractId, entries.total_supply_entry, Protobuf.encode(args, colections.total_supply_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token supply");
    const res = Protobuf.decode<colections.total_supply_result>(callRes.res.object as Uint8Array, colections.total_supply_result.decode);
    return res.value;
  }

  getRoyalties(): colections.royalty_object[] {
    const args = new colections.royalties_arguments();
    const callRes = System.call(this._contractId, entries.royalties_entry, Protobuf.encode(args, colections.royalties_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token supply");
    const res = Protobuf.decode<colections.royalties_result>(callRes.res.object as Uint8Array, colections.royalties_result.decode);
    return res.value;
  }

  ownerOf(token_id: u64): Uint8Array {
    const args = new colections.owner_of_arguments(token_id);
    const callRes = System.call(this._contractId, entries.owner_entry, Protobuf.encode(args, colections.owner_of_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<colections.owner_of_result>(callRes.res.object as Uint8Array, colections.owner_of_result.decode);
    return res.value;
  }

  balanceOf(owner: Uint8Array): u64 {
    const args = new colections.balance_of_arguments(owner);
    const callRes = System.call(this._contractId, entries.balance_of_entry, Protobuf.encode(args, colections.balance_of_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<colections.balance_of_result>(callRes.res.object as Uint8Array, colections.balance_of_result.decode);
    return res.value;
  }

  transfer(from: Uint8Array, to: Uint8Array, token_id: u64): bool {
    const args = new colections.transfer_arguments(from, to, token_id);
    const callRes = System.call(this._contractId, entries.transfer_entry, Protobuf.encode(args, colections.transfer_arguments.encode));
    return callRes.code == error.error_code.success;
  }

  getApproved(token_id: u64): Uint8Array {
    const args = new colections.get_approved_arguments(token_id);
    const callRes = System.call(this._contractId, entries.approved_entry, Protobuf.encode(args, colections.get_approved_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<colections.get_approved_result>(callRes.res.object as Uint8Array, colections.get_approved_result.decode);
    return res.value;
  }

  isApprovedForAll(owner: Uint8Array, operator: Uint8Array): bool {
    const args = new colections.is_approved_for_all_arguments(owner, operator);
    const callRes = System.call(this._contractId, entries.approved_operator_entry, Protobuf.encode(args, colections.is_approved_for_all_arguments.encode));
    System.require(callRes.code == 0, "failed to retrieve token balance");
    const res = Protobuf.decode<colections.is_approved_for_all_result>(callRes.res.object as Uint8Array, colections.is_approved_for_all_result.decode);
    return res.value;
  }
}
