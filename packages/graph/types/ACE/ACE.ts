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

export class SetCommonReferenceString extends EthereumEvent {
  get params(): SetCommonReferenceString__Params {
    return new SetCommonReferenceString__Params(this);
  }
}

export class SetCommonReferenceString__Params {
  _event: SetCommonReferenceString;

  constructor(event: SetCommonReferenceString) {
    this._event = event;
  }

  get _commonReferenceString(): Array<Bytes> {
    return this._event.parameters[0].value.toBytesArray();
  }
}

export class SetProof extends EthereumEvent {
  get params(): SetProof__Params {
    return new SetProof__Params(this);
  }
}

export class SetProof__Params {
  _event: SetProof;

  constructor(event: SetProof) {
    this._event = event;
  }

  get epoch(): i32 {
    return this._event.parameters[0].value.toI32();
  }

  get category(): i32 {
    return this._event.parameters[1].value.toI32();
  }

  get id(): i32 {
    return this._event.parameters[2].value.toI32();
  }

  get validatorAddress(): Address {
    return this._event.parameters[3].value.toAddress();
  }
}

export class IncrementLatestEpoch extends EthereumEvent {
  get params(): IncrementLatestEpoch__Params {
    return new IncrementLatestEpoch__Params(this);
  }
}

export class IncrementLatestEpoch__Params {
  _event: IncrementLatestEpoch;

  constructor(event: IncrementLatestEpoch) {
    this._event = event;
  }

  get newLatestEpoch(): i32 {
    return this._event.parameters[0].value.toI32();
  }
}

export class CreateNoteRegistry extends EthereumEvent {
  get params(): CreateNoteRegistry__Params {
    return new CreateNoteRegistry__Params(this);
  }
}

export class CreateNoteRegistry__Params {
  _event: CreateNoteRegistry;

  constructor(event: CreateNoteRegistry) {
    this._event = event;
  }

  get registryOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get registryAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get scalingFactor(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get linkedTokenAddress(): Address {
    return this._event.parameters[3].value.toAddress();
  }

  get canAdjustSupply(): boolean {
    return this._event.parameters[4].value.toBoolean();
  }

  get canConvert(): boolean {
    return this._event.parameters[5].value.toBoolean();
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

  get b(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }
}

export class OwnershipTransferred extends EthereumEvent {
  get params(): OwnershipTransferred__Params {
    return new OwnershipTransferred__Params(this);
  }
}

export class OwnershipTransferred__Params {
  _event: OwnershipTransferred;

  constructor(event: OwnershipTransferred) {
    this._event = event;
  }

  get previousOwner(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get newOwner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class CreateNoteRegistry1 extends EthereumEvent {
  get params(): CreateNoteRegistry1__Params {
    return new CreateNoteRegistry1__Params(this);
  }
}

export class CreateNoteRegistry1__Params {
  _event: CreateNoteRegistry1;

  constructor(event: CreateNoteRegistry1) {
    this._event = event;
  }

  get zkAssetAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get linkedTokenAddress(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get scalingFactor(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get canAdjustSupply(): boolean {
    return this._event.parameters[3].value.toBoolean();
  }

  get canConvert(): boolean {
    return this._event.parameters[4].value.toBoolean();
  }
}

export class ACE__getRegistryResult {
  value0: Address;
  value1: BigInt;
  value2: BigInt;
  value3: Bytes;
  value4: Bytes;
  value5: boolean;
  value6: boolean;

  constructor(
    value0: Address,
    value1: BigInt,
    value2: BigInt,
    value3: Bytes,
    value4: Bytes,
    value5: boolean,
    value6: boolean
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
    this.value6 = value6;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromAddress(this.value0));
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    map.set("value2", EthereumValue.fromUnsignedBigInt(this.value2));
    map.set("value3", EthereumValue.fromFixedBytes(this.value3));
    map.set("value4", EthereumValue.fromFixedBytes(this.value4));
    map.set("value5", EthereumValue.fromBoolean(this.value5));
    map.set("value6", EthereumValue.fromBoolean(this.value6));
    return map;
  }
}

export class ACE__getNoteResult {
  value0: i32;
  value1: BigInt;
  value2: BigInt;
  value3: Address;

  constructor(value0: i32, value1: BigInt, value2: BigInt, value3: Address) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
  }

  toMap(): TypedMap<string, EthereumValue> {
    let map = new TypedMap<string, EthereumValue>();
    map.set("value0", EthereumValue.fromI32(this.value0));
    map.set("value1", EthereumValue.fromUnsignedBigInt(this.value1));
    map.set("value2", EthereumValue.fromUnsignedBigInt(this.value2));
    map.set("value3", EthereumValue.fromAddress(this.value3));
    return map;
  }
}

export class ACE extends SmartContract {
  static bind(address: Address): ACE {
    return new ACE("ACE", address);
  }

  JOIN_SPLIT_PROOF(): i32 {
    let result = super.call("JOIN_SPLIT_PROOF", []);
    return result[0].toI32();
  }

  ZERO_VALUE_NOTE_HASH(): Bytes {
    let result = super.call("ZERO_VALUE_NOTE_HASH", []);
    return result[0].toBytes();
  }

  disabledValidators(param0: BigInt, param1: BigInt, param2: BigInt): boolean {
    let result = super.call("disabledValidators", [
      EthereumValue.fromUnsignedBigInt(param0),
      EthereumValue.fromUnsignedBigInt(param1),
      EthereumValue.fromUnsignedBigInt(param2)
    ]);
    return result[0].toBoolean();
  }

  PRIVATE_RANGE_PROOF(): i32 {
    let result = super.call("PRIVATE_RANGE_PROOF", []);
    return result[0].toI32();
  }

  validators(param0: BigInt, param1: BigInt, param2: BigInt): Address {
    let result = super.call("validators", [
      EthereumValue.fromUnsignedBigInt(param0),
      EthereumValue.fromUnsignedBigInt(param1),
      EthereumValue.fromUnsignedBigInt(param2)
    ]);
    return result[0].toAddress();
  }

  DIVIDEND_PROOF(): i32 {
    let result = super.call("DIVIDEND_PROOF", []);
    return result[0].toI32();
  }

  owner(): Address {
    let result = super.call("owner", []);
    return result[0].toAddress();
  }

  MINT_PROOF(): i32 {
    let result = super.call("MINT_PROOF", []);
    return result[0].toI32();
  }

  isOwner(): boolean {
    let result = super.call("isOwner", []);
    return result[0].toBoolean();
  }

  latestEpoch(): i32 {
    let result = super.call("latestEpoch", []);
    return result[0].toI32();
  }

  validatedProofs(param0: Bytes): boolean {
    let result = super.call("validatedProofs", [
      EthereumValue.fromFixedBytes(param0)
    ]);
    return result[0].toBoolean();
  }

  BURN_PROOF(): i32 {
    let result = super.call("BURN_PROOF", []);
    return result[0].toI32();
  }

  getRegistry(_owner: Address): ACE__getRegistryResult {
    let result = super.call("getRegistry", [EthereumValue.fromAddress(_owner)]);
    return new ACE__getRegistryResult(
      result[0].toAddress(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toBytes(),
      result[4].toBytes(),
      result[5].toBoolean(),
      result[6].toBoolean()
    );
  }

  getNote(_registryOwner: Address, _noteHash: Bytes): ACE__getNoteResult {
    let result = super.call("getNote", [
      EthereumValue.fromAddress(_registryOwner),
      EthereumValue.fromFixedBytes(_noteHash)
    ]);
    return new ACE__getNoteResult(
      result[0].toI32(),
      result[1].toBigInt(),
      result[2].toBigInt(),
      result[3].toAddress()
    );
  }

  validateProofByHash(
    _proof: i32,
    _proofHash: Bytes,
    _sender: Address
  ): boolean {
    let result = super.call("validateProofByHash", [
      EthereumValue.fromI32(_proof),
      EthereumValue.fromFixedBytes(_proofHash),
      EthereumValue.fromAddress(_sender)
    ]);
    return result[0].toBoolean();
  }

  getCommonReferenceString(): Array<Bytes> {
    let result = super.call("getCommonReferenceString", []);
    return result[0].toBytesArray();
  }

  getValidatorAddress(_proof: i32): Address {
    let result = super.call("getValidatorAddress", [
      EthereumValue.fromI32(_proof)
    ]);
    return result[0].toAddress();
  }
}

export class SupplementTokensCall extends EthereumCall {
  get inputs(): SupplementTokensCall__Inputs {
    return new SupplementTokensCall__Inputs(this);
  }

  get outputs(): SupplementTokensCall__Outputs {
    return new SupplementTokensCall__Outputs(this);
  }
}

export class SupplementTokensCall__Inputs {
  _call: SupplementTokensCall;

  constructor(call: SupplementTokensCall) {
    this._call = call;
  }

  get _value(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class SupplementTokensCall__Outputs {
  _call: SupplementTokensCall;

  constructor(call: SupplementTokensCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall extends EthereumCall {
  get inputs(): RenounceOwnershipCall__Inputs {
    return new RenounceOwnershipCall__Inputs(this);
  }

  get outputs(): RenounceOwnershipCall__Outputs {
    return new RenounceOwnershipCall__Outputs(this);
  }
}

export class RenounceOwnershipCall__Inputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class RenounceOwnershipCall__Outputs {
  _call: RenounceOwnershipCall;

  constructor(call: RenounceOwnershipCall) {
    this._call = call;
  }
}

export class UpdateNoteRegistryCall extends EthereumCall {
  get inputs(): UpdateNoteRegistryCall__Inputs {
    return new UpdateNoteRegistryCall__Inputs(this);
  }

  get outputs(): UpdateNoteRegistryCall__Outputs {
    return new UpdateNoteRegistryCall__Outputs(this);
  }
}

export class UpdateNoteRegistryCall__Inputs {
  _call: UpdateNoteRegistryCall;

  constructor(call: UpdateNoteRegistryCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofOutput(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _proofSender(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class UpdateNoteRegistryCall__Outputs {
  _call: UpdateNoteRegistryCall;

  constructor(call: UpdateNoteRegistryCall) {
    this._call = call;
  }
}

export class CreateNoteRegistryCall extends EthereumCall {
  get inputs(): CreateNoteRegistryCall__Inputs {
    return new CreateNoteRegistryCall__Inputs(this);
  }

  get outputs(): CreateNoteRegistryCall__Outputs {
    return new CreateNoteRegistryCall__Outputs(this);
  }
}

export class CreateNoteRegistryCall__Inputs {
  _call: CreateNoteRegistryCall;

  constructor(call: CreateNoteRegistryCall) {
    this._call = call;
  }

  get _linkedTokenAddress(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _scalingFactor(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }

  get _canAdjustSupply(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }

  get _canConvert(): boolean {
    return this._call.inputValues[3].value.toBoolean();
  }
}

export class CreateNoteRegistryCall__Outputs {
  _call: CreateNoteRegistryCall;

  constructor(call: CreateNoteRegistryCall) {
    this._call = call;
  }
}

export class PublicApproveCall extends EthereumCall {
  get inputs(): PublicApproveCall__Inputs {
    return new PublicApproveCall__Inputs(this);
  }

  get outputs(): PublicApproveCall__Outputs {
    return new PublicApproveCall__Outputs(this);
  }
}

export class PublicApproveCall__Inputs {
  _call: PublicApproveCall;

  constructor(call: PublicApproveCall) {
    this._call = call;
  }

  get _registryOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get _proofHash(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _value(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class PublicApproveCall__Outputs {
  _call: PublicApproveCall;

  constructor(call: PublicApproveCall) {
    this._call = call;
  }
}

export class TransferOwnershipCall extends EthereumCall {
  get inputs(): TransferOwnershipCall__Inputs {
    return new TransferOwnershipCall__Inputs(this);
  }

  get outputs(): TransferOwnershipCall__Outputs {
    return new TransferOwnershipCall__Outputs(this);
  }
}

export class TransferOwnershipCall__Inputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
  }

  get newOwner(): Address {
    return this._call.inputValues[0].value.toAddress();
  }
}

export class TransferOwnershipCall__Outputs {
  _call: TransferOwnershipCall;

  constructor(call: TransferOwnershipCall) {
    this._call = call;
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
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class MintCall extends EthereumCall {
  get inputs(): MintCall__Inputs {
    return new MintCall__Inputs(this);
  }

  get outputs(): MintCall__Outputs {
    return new MintCall__Outputs(this);
  }
}

export class MintCall__Inputs {
  _call: MintCall;

  constructor(call: MintCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofData(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _proofSender(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class MintCall__Outputs {
  _call: MintCall;

  constructor(call: MintCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class BurnCall extends EthereumCall {
  get inputs(): BurnCall__Inputs {
    return new BurnCall__Inputs(this);
  }

  get outputs(): BurnCall__Outputs {
    return new BurnCall__Outputs(this);
  }
}

export class BurnCall__Inputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofData(): Bytes {
    return this._call.inputValues[1].value.toBytes();
  }

  get _proofSender(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class BurnCall__Outputs {
  _call: BurnCall;

  constructor(call: BurnCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class ValidateProofCall extends EthereumCall {
  get inputs(): ValidateProofCall__Inputs {
    return new ValidateProofCall__Inputs(this);
  }

  get outputs(): ValidateProofCall__Outputs {
    return new ValidateProofCall__Outputs(this);
  }
}

export class ValidateProofCall__Inputs {
  _call: ValidateProofCall;

  constructor(call: ValidateProofCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _sender(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get value2(): Bytes {
    return this._call.inputValues[2].value.toBytes();
  }
}

export class ValidateProofCall__Outputs {
  _call: ValidateProofCall;

  constructor(call: ValidateProofCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class ClearProofByHashesCall extends EthereumCall {
  get inputs(): ClearProofByHashesCall__Inputs {
    return new ClearProofByHashesCall__Inputs(this);
  }

  get outputs(): ClearProofByHashesCall__Outputs {
    return new ClearProofByHashesCall__Outputs(this);
  }
}

export class ClearProofByHashesCall__Inputs {
  _call: ClearProofByHashesCall;

  constructor(call: ClearProofByHashesCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _proofHashes(): Array<Bytes> {
    return this._call.inputValues[1].value.toBytesArray();
  }
}

export class ClearProofByHashesCall__Outputs {
  _call: ClearProofByHashesCall;

  constructor(call: ClearProofByHashesCall) {
    this._call = call;
  }
}

export class SetCommonReferenceStringCall extends EthereumCall {
  get inputs(): SetCommonReferenceStringCall__Inputs {
    return new SetCommonReferenceStringCall__Inputs(this);
  }

  get outputs(): SetCommonReferenceStringCall__Outputs {
    return new SetCommonReferenceStringCall__Outputs(this);
  }
}

export class SetCommonReferenceStringCall__Inputs {
  _call: SetCommonReferenceStringCall;

  constructor(call: SetCommonReferenceStringCall) {
    this._call = call;
  }

  get _commonReferenceString(): Array<Bytes> {
    return this._call.inputValues[0].value.toBytesArray();
  }
}

export class SetCommonReferenceStringCall__Outputs {
  _call: SetCommonReferenceStringCall;

  constructor(call: SetCommonReferenceStringCall) {
    this._call = call;
  }
}

export class InvalidateProofCall extends EthereumCall {
  get inputs(): InvalidateProofCall__Inputs {
    return new InvalidateProofCall__Inputs(this);
  }

  get outputs(): InvalidateProofCall__Outputs {
    return new InvalidateProofCall__Outputs(this);
  }
}

export class InvalidateProofCall__Inputs {
  _call: InvalidateProofCall;

  constructor(call: InvalidateProofCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }
}

export class InvalidateProofCall__Outputs {
  _call: InvalidateProofCall;

  constructor(call: InvalidateProofCall) {
    this._call = call;
  }
}

export class SetProofCall extends EthereumCall {
  get inputs(): SetProofCall__Inputs {
    return new SetProofCall__Inputs(this);
  }

  get outputs(): SetProofCall__Outputs {
    return new SetProofCall__Outputs(this);
  }
}

export class SetProofCall__Inputs {
  _call: SetProofCall;

  constructor(call: SetProofCall) {
    this._call = call;
  }

  get _proof(): i32 {
    return this._call.inputValues[0].value.toI32();
  }

  get _validatorAddress(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class SetProofCall__Outputs {
  _call: SetProofCall;

  constructor(call: SetProofCall) {
    this._call = call;
  }
}

export class IncrementLatestEpochCall extends EthereumCall {
  get inputs(): IncrementLatestEpochCall__Inputs {
    return new IncrementLatestEpochCall__Inputs(this);
  }

  get outputs(): IncrementLatestEpochCall__Outputs {
    return new IncrementLatestEpochCall__Outputs(this);
  }
}

export class IncrementLatestEpochCall__Inputs {
  _call: IncrementLatestEpochCall;

  constructor(call: IncrementLatestEpochCall) {
    this._call = call;
  }
}

export class IncrementLatestEpochCall__Outputs {
  _call: IncrementLatestEpochCall;

  constructor(call: IncrementLatestEpochCall) {
    this._call = call;
  }
}
