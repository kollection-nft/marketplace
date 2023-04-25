import { System } from "@koinos/sdk-as";
import { marketplace } from "./proto/marketplace";

// libs
import { Orders } from "./Orders";

export class Marketplace {
  _contractId: Uint8Array;

  // controllers
  _order: Orders;
  constructor() {
    this._contractId = System.getContractId();
    // controller
    this._order = new Orders(this._contractId);
  }

  // controller orders
  get_order(args: marketplace.get_order_arguments): marketplace.get_order_result {
    return this._order.get_order(args);
  }
  create_order(args: marketplace.create_order_arguments): marketplace.create_order_result {
    return this._order.create_order(args);
  }
  execute_order(args: marketplace.execute_order_arguments): marketplace.execute_order_result {
    return this._order.execute_order(args);
  }
  cancel_order(args: marketplace.cancel_order_arguments): marketplace.cancel_order_result {
    return this._order.cancel_order(args);
  }
}
