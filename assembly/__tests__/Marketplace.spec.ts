import { Base58, MockVM, protocol, chain, StringBytes, system_calls, Protobuf, Arrays, token } from "@koinos/sdk-as";
import { Marketplace } from '../Marketplace';
import { marketplace } from '../proto/marketplace';
import { colections } from '../proto/colections';

// ADDRESS
const CONTRACT_ID = Base58.decode("17TAwcuJ4tHc9TmCbZ24nSMvY9bPxwQq5s");
const MOCKADRESS = Base58.decode("13nxuEi19W8sfjQiaPLSv2ht2WVp6dNyhn");
const MOCKADRESS2 = Base58.decode("1BrPkP7JhBwT4MuRDMWiiysGEu4XkyXuCH");
const MOCKCOLLECTION = Base58.decode("1M6NjRHh5x926wZUXYUz86x6j5MBqQJAvQ");
const MOCKTOKEN = Base58.decode("1H88naibGSwCbxnXB3MpYSdiEChKducag3");

function setBlockHeader(): void {

}


describe('contract', () => {
  beforeEach(() => {
    MockVM.reset();
    MockVM.setContractId(CONTRACT_ID);
    // set transaction
    setBlockHeader()
    let block = new protocol.block();
    let blockHeader = new protocol.block_header();
    blockHeader.timestamp = Date.now();
    block.header = blockHeader
    MockVM.setBlock(block);
  });

  it("should create order and get order", () => {

    let _mkp = new Marketplace();
    let contractResults: system_calls.exit_arguments[] = [
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(CONTRACT_ID), colections.get_approved_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(true), colections.is_approved_for_all_result.encode) ))
    ];
    MockVM.setCallContractResults(contractResults);
    MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
    let now = Date.now()
    let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, now + 1000)
    let res = _mkp.create_order(order);
    expect(res.result).toBe(true);


    let getOrder = new marketplace.get_order_arguments(MOCKCOLLECTION, 1);
    let res2 = _mkp.get_order(getOrder).result!;

    expect(res2.token_id).toBe(1);
    expect(res2.token_price).toBe(100);
    expect(res2.time_expire).toBe(now + 1000);
    expect(Arrays.equal(res2.seller, MOCKADRESS)).toBe(true);
    expect(Arrays.equal(res2.token_sell, MOCKTOKEN)).toBe(true);
    expect(Arrays.equal(res2.collection, MOCKCOLLECTION)).toBe(true);
  })

  it("should create sales order", () => {
    let _mkp = new Marketplace();
    let contractResults: system_calls.exit_arguments[] = [
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(CONTRACT_ID), colections.get_approved_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(true), colections.is_approved_for_all_result.encode) ))
    ];
    MockVM.setCallContractResults(contractResults);
    MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
    let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, Date.now() + 10000)
    let res = _mkp.create_order(order);
    expect(res.result).toBe(true);

    // // does not create order by expiration of time
    expect(() => {
      MockVM.reset();
      MockVM.setContractId(CONTRACT_ID);
      let block = new protocol.block();
      let blockHeader = new protocol.block_header();
      let currentDate = Date.now();
      blockHeader.timestamp = currentDate
      block.header = blockHeader
      MockVM.setBlock(block);
      MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
      let contractResults: system_calls.exit_arguments[] = [
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(CONTRACT_ID), colections.get_approved_result.encode) )),
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(true), colections.is_approved_for_all_result.encode) ))
      ];
      MockVM.setCallContractResults(contractResults);
      let _mkp = new Marketplace();
      let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, currentDate - 1)
      _mkp.create_order(order);
    }).toThrow();

    // // does not create order for contract approval
    expect(() => {
      MockVM.reset();
      MockVM.setContractId(CONTRACT_ID);
      let block = new protocol.block();
      let blockHeader = new protocol.block_header();
      blockHeader.timestamp = Date.now();
      block.header = blockHeader
      MockVM.setBlock(block);
      MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
      let contractResults: system_calls.exit_arguments[] = [
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(MOCKTOKEN), colections.get_approved_result.encode) )),
        new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(false), colections.is_approved_for_all_result.encode) ))
      ];
      MockVM.setCallContractResults(contractResults);
      let _mkp = new Marketplace();
      let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, Date.now() + 1000)
      _mkp.create_order(order);
    }).toThrow();
  });

  it("should execute sales order", () => {
    let _mkp = new Marketplace();
    let contractResults0: system_calls.exit_arguments[] = [
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(CONTRACT_ID), colections.get_approved_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(true), colections.is_approved_for_all_result.encode) ))
    ];
    MockVM.setCallContractResults(contractResults0);
    MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
    let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, Date.now() + 1000)
    _mkp.create_order(order);

    // execute order
    let contractResults: system_calls.exit_arguments[] = [
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new token.transfer_result(), token.transfer_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.royalties_result([]), colections.royalties_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new token.transfer_result(), token.transfer_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.transfer_result(true), colections.transfer_result.encode) )),
    ];
    MockVM.setCallContractResults(contractResults);
    MockVM.setCaller(new chain.caller_data(MOCKADRESS2, chain.privilege.user_mode));
    let execute = new marketplace.execute_order_arguments(MOCKCOLLECTION, 1);
    let res = _mkp.execute_order(execute);
    expect(res.result).toBe(true);
  });

  it("should cancel sales order", () => {
    let _mkp = new Marketplace();
    let contractResults0: system_calls.exit_arguments[] = [
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.owner_of_result(MOCKADRESS), colections.owner_of_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.get_approved_result(CONTRACT_ID), colections.get_approved_result.encode) )),
      new system_calls.exit_arguments(0, new chain.result( Protobuf.encode(new colections.is_approved_for_all_result(true), colections.is_approved_for_all_result.encode) ))
    ];
    MockVM.setCallContractResults(contractResults0);
    MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
    let order = new marketplace.create_order_arguments(MOCKCOLLECTION, MOCKTOKEN, 1, 100, Date.now() + 1000)
    _mkp.create_order(order);

    // cancel order
    MockVM.setCaller(new chain.caller_data(MOCKADRESS, chain.privilege.user_mode));
    let cancel = new marketplace.cancel_order_arguments(MOCKCOLLECTION, 1);
    let res = _mkp.cancel_order(cancel);
    expect(res.result).toBe(true);
  });
});
