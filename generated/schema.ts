// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Asset extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Asset entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Asset must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Asset", id.toString(), this);
    }
  }

  static load(id: string): Asset | null {
    return changetype<Asset | null>(store.get("Asset", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get asset(): Bytes {
    let value = this.get("asset");
    return value!.toBytes();
  }

  set asset(value: Bytes) {
    this.set("asset", Value.fromBytes(value));
  }

  get amount(): BigDecimal {
    let value = this.get("amount");
    return value!.toBigDecimal();
  }

  set amount(value: BigDecimal) {
    this.set("amount", Value.fromBigDecimal(value));
  }
}

export class Borrower extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Borrower entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Borrower must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Borrower", id.toString(), this);
    }
  }

  static load(id: string): Borrower | null {
    return changetype<Borrower | null>(store.get("Borrower", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get loans(): Array<string> {
    let value = this.get("loans");
    return value!.toStringArray();
  }

  set loans(value: Array<string>) {
    this.set("loans", Value.fromStringArray(value));
  }
}

export class Loan extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Loan entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Loan must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Loan", id.toString(), this);
    }
  }

  static load(id: string): Loan | null {
    return changetype<Loan | null>(store.get("Loan", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get borrower(): string {
    let value = this.get("borrower");
    return value!.toString();
  }

  set borrower(value: string) {
    this.set("borrower", Value.fromString(value));
  }

  get amount(): BigDecimal {
    let value = this.get("amount");
    return value!.toBigDecimal();
  }

  set amount(value: BigDecimal) {
    this.set("amount", Value.fromBigDecimal(value));
  }

  get period(): i32 {
    let value = this.get("period");
    return value!.toI32();
  }

  set period(value: i32) {
    this.set("period", Value.fromI32(value));
  }

  get dailyInterest(): BigDecimal {
    let value = this.get("dailyInterest");
    return value!.toBigDecimal();
  }

  set dailyInterest(value: BigDecimal) {
    this.set("dailyInterest", Value.fromBigDecimal(value));
  }

  get claimed(): i32 {
    let value = this.get("claimed");
    return value!.toI32();
  }

  set claimed(value: i32) {
    this.set("claimed", Value.fromI32(value));
  }

  get repayed(): BigDecimal {
    let value = this.get("repayed");
    return value!.toBigDecimal();
  }

  set repayed(value: BigDecimal) {
    this.set("repayed", Value.fromBigDecimal(value));
  }

  get lastRepayment(): i32 {
    let value = this.get("lastRepayment");
    return value!.toI32();
  }

  set lastRepayment(value: i32) {
    this.set("lastRepayment", Value.fromI32(value));
  }

  get lastRepaymentAmount(): BigDecimal | null {
    let value = this.get("lastRepaymentAmount");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigDecimal();
    }
  }

  set lastRepaymentAmount(value: BigDecimal | null) {
    if (!value) {
      this.unset("lastRepaymentAmount");
    } else {
      this.set("lastRepaymentAmount", Value.fromBigDecimal(<BigDecimal>value));
    }
  }

  get lastDebt(): BigDecimal | null {
    let value = this.get("lastDebt");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigDecimal();
    }
  }

  set lastDebt(value: BigDecimal | null) {
    if (!value) {
      this.unset("lastDebt");
    } else {
      this.set("lastDebt", Value.fromBigDecimal(<BigDecimal>value));
    }
  }

  get addedBy(): string {
    let value = this.get("addedBy");
    return value!.toString();
  }

  set addedBy(value: string) {
    this.set("addedBy", Value.fromString(value));
  }
}

export class MicroCredit extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MicroCredit entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type MicroCredit must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MicroCredit", id.toString(), this);
    }
  }

  static load(id: string): MicroCredit | null {
    return changetype<MicroCredit | null>(store.get("MicroCredit", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get borrowed(): Array<string> | null {
    let value = this.get("borrowed");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set borrowed(value: Array<string> | null) {
    if (!value) {
      this.unset("borrowed");
    } else {
      this.set("borrowed", Value.fromStringArray(<Array<string>>value));
    }
  }

  get debt(): Array<string> | null {
    let value = this.get("debt");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set debt(value: Array<string> | null) {
    if (!value) {
      this.unset("debt");
    } else {
      this.set("debt", Value.fromStringArray(<Array<string>>value));
    }
  }

  get repaid(): Array<string> | null {
    let value = this.get("repaid");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set repaid(value: Array<string> | null) {
    if (!value) {
      this.unset("repaid");
    } else {
      this.set("repaid", Value.fromStringArray(<Array<string>>value));
    }
  }

  get interest(): Array<string> | null {
    let value = this.get("interest");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set interest(value: Array<string> | null) {
    if (!value) {
      this.unset("interest");
    } else {
      this.set("interest", Value.fromStringArray(<Array<string>>value));
    }
  }

  get borrowers(): i32 {
    let value = this.get("borrowers");
    return value!.toI32();
  }

  set borrowers(value: i32) {
    this.set("borrowers", Value.fromI32(value));
  }

  get repayments(): i32 {
    let value = this.get("repayments");
    return value!.toI32();
  }

  set repayments(value: i32) {
    this.set("repayments", Value.fromI32(value));
  }

  get liquidity(): Array<string> | null {
    let value = this.get("liquidity");
    if (!value || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set liquidity(value: Array<string> | null) {
    if (!value) {
      this.unset("liquidity");
    } else {
      this.set("liquidity", Value.fromStringArray(<Array<string>>value));
    }
  }
}

export class LoanManager extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save LoanManager entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type LoanManager must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("LoanManager", id.toString(), this);
    }
  }

  static load(id: string): LoanManager | null {
    return changetype<LoanManager | null>(store.get("LoanManager", id));
  }

  get id(): string {
    let value = this.get("id");
    return value!.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get state(): i32 {
    let value = this.get("state");
    return value!.toI32();
  }

  set state(value: i32) {
    this.set("state", Value.fromI32(value));
  }
}
