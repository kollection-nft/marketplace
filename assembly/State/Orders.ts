import { Storage } from "@koinos/sdk-as";
import { marketplace } from "../proto/marketplace";
import { Spaces } from "./Spaces";

export class Orders extends Storage.ProtoMap<
  marketplace.order_id,
  marketplace.order_object
> {
  constructor(contractId: Uint8Array) {
    super(
      contractId,
      Spaces.ORDERS_SPACE_ID,
      marketplace.order_id.decode,
      marketplace.order_id.encode,
      marketplace.order_object.decode,
      marketplace.order_object.encode,
      // no operator approvals by default
      () => new marketplace.order_object()
    );
  }

  getOrder(collection_id: Uint8Array, token_id: Uint8Array): marketplace.order_object {
    return this.get(new marketplace.order_id(collection_id, token_id))!;
  }

  saveOrder(collection_id: Uint8Array, token_id: Uint8Array, order: marketplace.order_object): void {
    return this.put(new marketplace.order_id(collection_id, token_id), order);
  }

  removeOrder(collection_id: Uint8Array, token_id: Uint8Array): void {
    return this.remove(new marketplace.order_id(collection_id, token_id));
  }
}