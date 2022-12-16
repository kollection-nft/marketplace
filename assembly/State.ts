import { System, chain, Base58 } from "@koinos/sdk-as";
import { marketplace } from "./proto/marketplace";

// spaces
const CONFIG_SPACE_ID = 1;
const ORDERS_SPACE_ID = 2;
// keys
const CONFIG_KEY = new Uint8Array(0);


export class State {
  contractId: Uint8Array;

  // spaces
  configSpace: chain.object_space;
  ordersSpace: chain.object_space;
  constructor(contractId: Uint8Array) {
    this.contractId = contractId;

    // spaces
    this.configSpace = new chain.object_space(false, contractId, CONFIG_SPACE_ID);
    this.ordersSpace = new chain.object_space(false, contractId, ORDERS_SPACE_ID);
  }

  // orders
  getOrder(orderId: string): marketplace.order_object | null {
    const order = System.getObject<string, marketplace.order_object>(this.ordersSpace, orderId, marketplace.order_object.decode);
    return order;
  }
  saveOrder(orderId: string, order: marketplace.order_object): void {
    System.putObject(this.ordersSpace, orderId, order, marketplace.order_object.encode);
  }
  removeOrder(orderId: string): void {
    System.removeObject(this.ordersSpace, orderId);
  }
}