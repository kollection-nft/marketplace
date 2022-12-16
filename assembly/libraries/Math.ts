import { u128, SafeMath } from "@koinos/sdk-as";

let _100 = u128.fromU64(100000);

export class MathMK {
  static getFeeProtocol(_amount: u64): u64 {
    let fee = u128.fromU64(2500);
    let amount = u128.fromU64(_amount);
    let result = SafeMath.div(SafeMath.mul(amount, fee), _100);
    return result.toU64();
  }

  static getRoyalty(_amount: u64, _fee: u64): u64 {
    let fee = u128.fromU64(_fee);
    let amount = u128.fromU64(_amount);
    let result = SafeMath.div(SafeMath.mul(amount, fee), _100);
    return result.toU64();
  }
}