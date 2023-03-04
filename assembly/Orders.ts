import { System, Arrays, Base58, Crypto, Protobuf, Token, SafeMath, StringBytes } from "@koinos/sdk-as";
import { State } from "./State";
import { marketplace } from "./proto/marketplace";

// Libs
import { Utils } from "./libraries/Utils";
import { MathMK } from "./libraries/Math";
import { Constants } from "./Constantes";

// interfaces
import { Collection } from "./interfaces/Collection";

export class Orders {
  _contractId: Uint8Array;
  _state: State;
  constructor(state: State, contractId: Uint8Array) {
    this._state = state;
    this._contractId = contractId;
  }

  get_order(args: marketplace.get_order_arguments): marketplace.get_order_result {
    let res = new marketplace.get_order_result();
    let orderId = `${Base58.encode(args.collection)}_${ StringBytes.bytesToString(args.token_id) }`;
    let order = this._state.getOrder(orderId)
    if(order) {
      res.result = order;
    }
    return res;
  }
  create_order(args: marketplace.create_order_arguments): marketplace.create_order_result {
    let res = new marketplace.create_order_result()
    // data
    let token_id = args.token_id;
    let token_sell = args.token_sell;
    let collection = args.collection;
    let token_price = args.token_price;
    let time_expire = args.time_expire;

    // process
    let _colecction = new Collection(collection);
    let caller = Utils.getCaller();
    let owner = _colecction.ownerOf(token_id);

    // check if the owner is the one who calls the call
    System.require(Arrays.equal(owner, caller), "MarketplaceV1.create: NOT_ASSET_OWNER")

    // filter accepted tokens for payments
    System.require(Arrays.equal(token_sell, Constants.TOKENS_ACEPTED), "MarketplaceV1.create: TOKEN_UNACEPTED")

    // check if the contract can handle the token
    let approvedContract = Arrays.equal(_colecction.getApproved(token_id), this._contractId);
    let approvedOperator = _colecction.isApprovedForAll(owner, this._contractId);
    System.require(approvedContract ||  approvedOperator, "MarketplaceV1.create: CONTRACT_NOT_MANAGE_ASSET")

    // checks expiration date for the order
    let blockTimestampField = System.getBlockField("header.timestamp");
    System.require(blockTimestampField != null, 'block height cannot be null');
    let currentDate = blockTimestampField!.uint64_value as u64;
    System.require(currentDate < time_expire || 0 == time_expire, "MarketplaceV1.create: INVALID_EXPIRES")

    // pre-data
    let sOwner = Base58.encode(owner);
    let sColection = Base58.encode(collection);
    let sTokenId = StringBytes.bytesToString(token_id);

    // create order
    let order = new marketplace.order_object();
    order.id = System.hash(Crypto.multicodec.sha2_256, Utils.getOrderId(currentDate, sOwner, sColection, sTokenId, token_price))!;
    order.seller = caller;
    order.token_id = token_id;
    order.token_sell = token_sell;
    order.collection = collection;
    order.token_price = token_price;
    order.time_expire = time_expire;

    // save order
    let orderId = `${sColection}_${sTokenId}`;
    this._state.saveOrder(orderId, order);

    // generate event
    const createEvent = new marketplace.create_order_event(
      order.id,
      caller,
      collection,
      token_id,
      token_price,
      time_expire,
      token_sell,
    );
    const impacted = [caller];
    System.event(
      "marketplace.create_order",
      Protobuf.encode(createEvent, marketplace.create_order_event.encode),
      impacted
    );

    res.result = true;
    return res;
  }
  execute_order(args: marketplace.execute_order_arguments): marketplace.execute_order_result {
    let res = new marketplace.execute_order_result();
    // data
    let token_id = args.token_id;
    let collection = args.collection;

    // process
    let _colecction = new Collection(collection);
    let caller = Utils.getCaller();

    // pre-data
    let sColection = Base58.encode(collection);
    let sTokenId = StringBytes.bytesToString(token_id);
    let id = `${sColection}_${sTokenId}`;
    let order = this._state.getOrder(id);

    // check if the order exists
    System.require(order != null, "MarketplaceV1.execute: EXIST_ORDER");

    // check if the buyer is the same seller
    System.require(!Arrays.equal(order!.seller, caller), "MarketplaceV1.execute: BUYER_IS_SELLER");

    // check if the owner of the NFT is the same seller
    let owner = _colecction.ownerOf(token_id);
    System.require(Arrays.equal(order!.seller, owner), "MarketplaceV1.execute: NOT_ASSET_OWNER")

    // checks expiration date for the order
    let blockTimestampField = System.getBlockField("header.timestamp");
    System.require(blockTimestampField != null, 'block height cannot be null');
    let currentDate = blockTimestampField!.uint64_value as u64;
    System.require(currentDate <= order!.time_expire || order!.time_expire == 0, "MarketplaceV1.execute: EXPIRED_ORDER");

    // prepared token
    let token = new Token(order!.token_sell);
    let tokenTotal = order!.token_price;
    let tokenRemain = order!.token_price;

    // transfer fees protocol
    let treasury = Constants.TREASURY_CONTRACT;
    let protocolFee = MathMK.getFeeProtocol(tokenTotal)
    let resultTrasferFee = token.transfer(caller, treasury, protocolFee)
    System.require(resultTrasferFee, "MarketplaceV1.execute: TRANSFER_PROTOCOL_FEE");
    tokenRemain = SafeMath.sub(tokenRemain, protocolFee);

    // transfer royalties
    let royalties = _colecction.getRoyalties();
    let royaltiesTotal: u64 = 0;
    if(royalties.length) {
      for (let index = 0; index < royalties.length; index++) {
        let royalty = royalties[index];
        let resultRoyalty = MathMK.getRoyalty(tokenTotal, royalty.amount);
        let resultTrasferRoyalty = token.transfer(caller, royalty.address, resultRoyalty)
        System.require(resultTrasferRoyalty, "MarketplaceV1.execute: TRANSFER_ROYALTY_FEE");
        tokenRemain = SafeMath.sub(tokenRemain, resultRoyalty);
        royaltiesTotal = SafeMath.add(royaltiesTotal, royalty.amount);
      }
      // checks expiration date for the order
      System.require(royaltiesTotal<=10000, "MarketplaceV1.execute: ROYALTY_EXEDED_MAX");
    }

    // transfer seller
    let resultTrasferSellet = token.transfer(caller, order!.seller, tokenRemain);
    System.require(resultTrasferSellet, "MarketplaceV1.execute: TRANSFER_PROTOCOL_SELLER");

    // trasnfer buyer
    let resultTrasferBuyer = _colecction.transfer(order!.seller, caller, order!.token_id);
    System.require(resultTrasferBuyer, "MarketplaceV1.execute: TRANSFER_PROTOCOL_BUYER");

    // remove order
    this._state.removeOrder(id);

    // generate event
    const executeEvent = new marketplace.execute_order_event(
      order!.id,
      caller,
      order!.seller,
      order!.collection,
      order!.token_id,
      tokenRemain,
      protocolFee,
      royaltiesTotal,
      order!.token_sell
    );
    const impacted = [caller, order!.seller];
    System.event(
      "marketplace.execute_order",
      Protobuf.encode(executeEvent, marketplace.execute_order_event.encode),
      impacted
    );

    res.result = true;
    return res;
  }
  cancel_order(args: marketplace.cancel_order_arguments): marketplace.cancel_order_result {
    let res = new marketplace.cancel_order_result();
    // data
    let token_id = args.token_id;
    let collection = args.collection;

    // process
    let caller = Utils.getCaller();

    // pre-data
    let sColection = Base58.encode(collection);
    let sTokenId = StringBytes.bytesToString(token_id);
    let id = `${sColection}_${sTokenId}`;
    let order = this._state.getOrder(id);

    // check if the order exists
    System.require(order != null, "MarketplaceV1.cancel: EXIST_ORDER");

    // check if the buyer is the same seller
    System.require(Arrays.equal(order!.seller, caller), "MarketplaceV1.cancel: BUYER_IS_SELLER");

    // checks expiration date for the order
    let blockTimestampField = System.getBlockField("header.timestamp");
    System.require(blockTimestampField != null, 'block height cannot be null');
    let currentDate = blockTimestampField!.uint64_value as u64;
    System.require(currentDate <= order!.time_expire || order!.time_expire == 0, "MarketplaceV1.cancel: EXPIRED_ORDER");

    // remove order
    this._state.removeOrder(id);

    // generate event
    const executeEvent = new marketplace.cancel_order_event(
      order!.id,
      order!.seller,
      order!.collection,
      order!.token_id,
    );
    const impacted = [caller, order!.seller];
    System.event(
      "marketplace.cancel_order",
      Protobuf.encode(executeEvent, marketplace.cancel_order_event.encode),
      impacted
    );

    res.result = true;
    return res;
  }
}