import { System, Protobuf, authority } from "@koinos/sdk-as";
import { Marketplace as ContractClass } from "./Marketplace";
import { marketplace as ProtoNamespace } from "./proto/marketplace";

export function main(): i32 {
  const contractArgs = System.getArguments();
  let retbuf = new Uint8Array(1024);

  const c = new ContractClass();

  switch (contractArgs.entry_point) {
    case 0x45915cb9: {
      const args = Protobuf.decode<ProtoNamespace.get_order_arguments>(
        contractArgs.args,
        ProtoNamespace.get_order_arguments.decode
      );
      const res = c.get_order(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.get_order_result.encode);
      break;
    }

    case 0x438c7445: {
      const args = Protobuf.decode<ProtoNamespace.create_order_arguments>(
        contractArgs.args,
        ProtoNamespace.create_order_arguments.decode
      );
      const res = c.create_order(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.create_order_result.encode);
      break;
    }

    case 0xe38a2678: {
      const args = Protobuf.decode<ProtoNamespace.execute_order_arguments>(
        contractArgs.args,
        ProtoNamespace.execute_order_arguments.decode
      );
      const res = c.execute_order(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.execute_order_result.encode);
      break;
    }

    case 0x8442359c: {
      const args = Protobuf.decode<ProtoNamespace.cancel_order_arguments>(
        contractArgs.args,
        ProtoNamespace.cancel_order_arguments.decode
      );
      const res = c.cancel_order(args);
      retbuf = Protobuf.encode(res, ProtoNamespace.cancel_order_result.encode);
      break;
    }

    default:
      System.exit(1);
      break;
  }

  System.exit(0, retbuf);
  return 0;
}

main();
