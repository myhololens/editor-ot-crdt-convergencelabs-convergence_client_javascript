import {RealTimeValue} from "./RealTimeValue";
import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {PathElement} from "./ot/Path";
import NumberAddOperation from "./ot/ops/NumberAddOperation";
import NumberSetOperation from "./ot/ops/NumberSetOperation";
import ModelOperationEvent from "./ModelOperationEvent";
import RealTimeValueType from "./RealTimeValueType";
import {Path} from "./ot/Path";
import {ModelChangeEvent} from "./events";
import {RealTimeModel} from "./RealTimeModel";
import {ModelEventCallbacks} from "./RealTimeModel";
import {RemoteReferenceEvent} from "../connection/protocol/model/reference/ReferenceEvent";
import {OperationType} from "./ot/ops/OperationType";

export default class RealTimeNumber extends RealTimeValue<number> {

  static Events: any = {
    ADD: "add",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED
  };

  /**
   * Constructs a new RealTimeNumber.
   */
  constructor(private _data: number,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(RealTimeValueType.Number, parent, fieldInParent, callbacks, model);
  }

  add(value: number): void {
    this._validateNumber(value);

    if (value !== 0) {
      var operation: NumberAddOperation = new NumberAddOperation(this.path(), false, value);
      this._data += value;
      this._sendOperation(operation);
    }
  }

  subtract(value: number): void {
    this.add(-value);
  }

  increment(): void {
    this.add(1);
  }

  decrement(): void {
    this.add(-1);
  }

  protected _setValue(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }

    var operation: NumberSetOperation = new NumberSetOperation(this.path(), false, value);
    this._data = value;
    this._sendOperation(operation);
  }

  protected _getValue(): number {
    return this._data;
  }

  // Handlers for incoming operations

  _handleRemoteOperation(relativePath: Path, operationEvent: ModelOperationEvent): ModelChangeEvent {
    if (relativePath.length === 0) {
      var type: string = operationEvent.operation.type;
      if (type === OperationType.NUMBER_ADD) {
        return this._handleAddOperation(operationEvent);
      } else if (type === OperationType.NUMBER_VALUE) {
        return this._handleSetOperation(operationEvent);
      } else {
        throw new Error("Invalid operation!");
      }
    } else {
      throw new Error("Invalid path: number values do not have children");
    }
  }

  private _handleAddOperation(operationEvent: ModelOperationEvent): NumberAddEvent {
    var operation: NumberAddOperation = <NumberAddOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data += value;

    var event: NumberAddEvent = {
      src: this,
      name: RealTimeNumber.Events.ADD,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
    return event;
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): NumberSetValueEvent {
    var operation: NumberSetOperation = <NumberSetOperation> operationEvent.operation;
    var value: number = operation.value;

    this._validateNumber(value);
    this._data = value;

    var event: NumberSetValueEvent = {
      src: this,
      name: RealTimeNumber.Events.VALUE,
      sessionId: operationEvent.sessionId,
      userId: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: value
    };
    this.emitEvent(event);
    return event;
  }

  private _validateNumber(value: number): void {
    if (isNaN(value)) {
      throw new Error("Value is NaN");
    }
  }

  _handleRemoteReferenceEvent(relativePath: Path, event: RemoteReferenceEvent): void {
    throw new Error("Number values do not process references");
  }
}

export interface NumberSetValueEvent extends ModelChangeEvent {
  src: RealTimeNumber;
  value:  number;
}

export interface NumberAddEvent extends ModelChangeEvent {
  src: RealTimeNumber;
  value:  number;
}
