// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class LoanAdded extends ethereum.Event {
  get params(): LoanAdded__Params {
    return new LoanAdded__Params(this);
  }
}

export class LoanAdded__Params {
  _event: LoanAdded;

  constructor(event: LoanAdded) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get period(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get dailyInterest(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class LoanClaimed extends ethereum.Event {
  get params(): LoanClaimed__Params {
    return new LoanClaimed__Params(this);
  }
}

export class LoanClaimed__Params {
  _event: LoanClaimed;

  constructor(event: LoanClaimed) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get loanId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class RepaymentAdded extends ethereum.Event {
  get params(): RepaymentAdded__Params {
    return new RepaymentAdded__Params(this);
  }
}

export class RepaymentAdded__Params {
  _event: RepaymentAdded;

  constructor(event: RepaymentAdded) {
    this._event = event;
  }

  get userAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get loanId(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }

  get currentDebt(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class UserAddressChanged extends ethereum.Event {
  get params(): UserAddressChanged__Params {
    return new UserAddressChanged__Params(this);
  }
}

export class UserAddressChanged__Params {
  _event: UserAddressChanged;

  constructor(event: UserAddressChanged) {
    this._event = event;
  }

  get oldWalletAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newWalletAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class MicroCredit extends ethereum.SmartContract {
  static bind(address: Address): MicroCredit {
    return new MicroCredit("MicroCredit", address);
  }
}
