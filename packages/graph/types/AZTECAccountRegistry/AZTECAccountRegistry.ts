// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  EthereumCall,
  EthereumEvent,
  SmartContract,
  EthereumValue,
  JSONValue,
  TypedMap,
  Entity,
  EthereumTuple,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class RegisterExtension extends EthereumEvent {
  get params(): RegisterExtension__Params {
    return new RegisterExtension__Params(this);
  }
}

export class RegisterExtension__Params {
  _event: RegisterExtension;

  constructor(event: RegisterExtension) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get linkedPublicKey(): Bytes {
    return this._event.parameters[1].value.toBytes();
  }
}

export class LogAddress extends EthereumEvent {
  get params(): LogAddress__Params {
    return new LogAddress__Params(this);
  }
}

export class LogAddress__Params {
  _event: LogAddress;

  constructor(event: LogAddress) {
    this._event = event;
  }

  get account(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class LogString extends EthereumEvent {
  get params(): LogString__Params {
    return new LogString__Params(this);
  }
}

export class LogString__Params {
  _event: LogString;

  constructor(event: LogString) {
    this._event = event;
  }

  get message(): string {
    return this._event.parameters[0].value.toString();
  }
}

export class LogBytes extends EthereumEvent {
  get params(): LogBytes__Params {
    return new LogBytes__Params(this);
  }
}

export class LogBytes__Params {
  _event: LogBytes;

  constructor(event: LogBytes) {
    this._event = event;
  }

  get sig(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }
}

export class AZTECAccountRegistry extends SmartContract {
  static bind(address: Address): AZTECAccountRegistry {
    return new AZTECAccountRegistry("AZTECAccountRegistry", address);
  }

  accountMapping(param0: Address): Bytes {
    let result = super.call("accountMapping", [
      EthereumValue.fromAddress(param0)
    ]);
    return result[0].toBytes();
  }

  EIP712_DOMAIN_HASH(): Bytes {
    let result = super.call("EIP712_DOMAIN_HASH", []);
    return result[0].toBytes();
  }
}

export class ConstructorCall extends EthereumCall {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get _chainId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class UpdateChainIdCall extends EthereumCall {
  get inputs(): UpdateChainIdCall__Inputs {
    return new UpdateChainIdCall__Inputs(this);
  }

  get outputs(): UpdateChainIdCall__Outputs {
    return new UpdateChainIdCall__Outputs(this);
  }
}

export class UpdateChainIdCall__Inputs {
  _call: UpdateChainIdCall;

  constructor(call: UpdateChainIdCall) {
    this._call = call;
  }

  get _chainId(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class UpdateChainIdCall__Outputs {
  _call: UpdateChainIdCall;

  constructor(call: UpdateChainIdCall) {
    this._call = call;
  }
}

export class RegisterAZTECExtensionCall extends EthereumCall {
  get inputs(): RegisterAZTECExtensionCall__Inputs {
    return new RegisterAZTECExtensionCall__Inputs(this);
  }

  get outputs(): RegisterAZTECExtensionCall__Outputs {
    return new RegisterAZTECExtensionCall__Outputs(this);
  }
}

export class RegisterAZTECExtensionCall__Inputs {
  _call: RegisterAZTECExtensionCall;

  constructor(call: RegisterAZTECExtensionCall) {
    this._call = call;
  }

  get _account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _linkedPublicKey(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get v(): i32 {
    return this._call.inputValues[2].value.toI32();
  }

  get r(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }

  get s(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class RegisterAZTECExtensionCall__Outputs {
  _call: RegisterAZTECExtensionCall;

  constructor(call: RegisterAZTECExtensionCall) {
    this._call = call;
  }
}
