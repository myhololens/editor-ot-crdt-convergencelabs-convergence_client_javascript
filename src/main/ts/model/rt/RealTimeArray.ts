import {RealTimeContainerValue} from "./RealTimeContainerValue";
import {ObservableArray} from "../observable/ObservableArray";
import {ValueChangedEvent} from "../observable/ObservableValue";
import {RealTimeValue} from "./RealTimeValue";
import {ArrayValue, DataValue} from "../dataValue";
import {PathElement, Path} from "../ot/Path";
import {ModelEventCallbacks, RealTimeModel} from "./RealTimeModel";
import {ModelValueType} from "../ModelValueType";
import {RealTimeValueFactory} from "./RealTimeValueFactory";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {RealTimeObject} from "./RealTimeObject";
import {ModelOperationEvent} from "../ModelOperationEvent";
import {OperationType} from "../ot/ops/OperationType";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";

export class RealTimeArray extends RealTimeContainerValue<any[]> implements ObservableArray {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: RealTimeValue.Events.DETACHED,
    MODEL_CHANGED: RealTimeValue.Events.MODEL_CHANGED
  };

  private _children: Array<RealTimeValue<any>>;

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(data: ArrayValue,
              parent: RealTimeContainerValue<any>,
              fieldInParent: PathElement,
              callbacks: ModelEventCallbacks,
              model: RealTimeModel) {
    super(ModelValueType.Array, data.id, parent, fieldInParent, callbacks, model);

    this._children = [];

    for (var i: number = 0; i < data.children.length; i++) {
      this._children.push(RealTimeValueFactory.create(data.children[i], this, i, this._callbacks, model));
    }
  }

  get(index: number): RealTimeValue<any> {
    return this._children[index];
  }

  set(index: number, value: any): void {
    this._validateReplace(index, value);

    var dataValue: DataValue = this._model._createDataValue(value);
    var operation: ArrayReplaceOperation = new ArrayReplaceOperation(this.id(), false, index, dataValue);
    var child: RealTimeValue<any> = this._children[index];
    this._children[index] = RealTimeValueFactory.create(dataValue, this, index, this._callbacks, this.model());
    this.updateFieldInParent(index);
    child._detach();
    this._sendOperation(operation);
  }

  insert(index: number, value: any): void {
    this._validateInsert(index, value);
    var dataValue: DataValue = this._model._createDataValue(value);
    var operation: ArrayInsertOperation = new ArrayInsertOperation(this.id(), false, index, dataValue);
    this._children.splice(index, 0, (RealTimeValueFactory.create(dataValue, this, index, this._callbacks, this._model)));
    this.updateFieldInParent(index);
    this._sendOperation(operation);
  }

  remove(index: number): Object|number|string|boolean {
    this._validateRemove(index);

    var operation: ArrayRemoveOperation = new ArrayRemoveOperation(this.id(), false, index);
    var child: RealTimeValue<any> = this._children[index];
    var removeValue: Object|number|string|boolean = child.data();
    this._children.splice(index, 1);
    this.updateFieldInParent(index);
    child._detach();
    this._sendOperation(operation);
    return removeValue;
  }

  reorder(fromIndex: number, toIndex: number): void {
    this._validateMove(fromIndex, toIndex);

    var operation: ArrayMoveOperation = new ArrayMoveOperation(this.id(), false, fromIndex, toIndex);

    var child: RealTimeValue<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));
    this._sendOperation(operation);
  }

  push(value: any): void {
    this.insert(this._children.length, value);
  }

  pop(): any {
    return this.remove(this._children.length - 1);
  }

  unshift(value: any): void {
    this.insert(0, value);
  }

  shift(): any {
    return this.remove(0);
  }

  length(): number {
    return this._children.length;
  }

  forEach(callback: (value: RealTimeValue<any>, index?: number) => void): void {
    this._children.forEach(callback);
  }

  //
  // protected and private methods.
  //

  protected _getData(): Array<any> {
    var returnVal: Array<any> = [];
    this.forEach((child: RealTimeValue<any>) => {
      returnVal.push(child.data());
    });
    return returnVal;
  }

  protected _setData(data: any[]): void {
    this._validateSet(data);

    var dataValues: DataValue[] = data.map((value: any) => {
      return this._model._createDataValue(value);
    });

    var operation: ArraySetOperation = new ArraySetOperation(this.id(), false, dataValues);
    this._detachChildren();

    this._children = dataValues.map((value: any, i: number) => {
      return RealTimeValueFactory.create(value, this, i, this._callbacks, this.model());
    });
    this._sendOperation(operation);
  }

  protected _detachChildren(): void {
    this.forEach((child: RealTimeValue<any>) => {
      child._detach();
    });
  }

  _path(pathArgs: Path): RealTimeValue<any> {
    if (pathArgs.length === 0) {
      return this;
    }

    var index: number = <number> pathArgs[0];
    var child: RealTimeValue<any> = this._children[index];
    if (pathArgs.length > 1) {
      if (child.type() === ModelValueType.Object) {
        return (<RealTimeObject> child).valueAt(pathArgs.slice(1, pathArgs.length));
      } else if (child.type() === ModelValueType.Array) {
        return (<RealTimeArray> child).valueAt(pathArgs.slice(1, pathArgs.length));
      } else {
        // TODO: Determine correct way to handle undefined
        return RealTimeValueFactory.create(undefined, null, null, this._callbacks, null);
      }
    } else {
      return child;
    }
  }

  // Handlers for incoming operations

  _handleRemoteOperation(operationEvent: ModelOperationEvent): void {
    var type: string = operationEvent.operation.type;
    if (type === OperationType.ARRAY_INSERT) {
      this._handleInsertOperation(operationEvent);
    } else if (type === OperationType.ARRAY_REORDER) {
      this._handleReorderOperation(operationEvent);
    } else if (type === OperationType.ARRAY_REMOVE) {
      this._handleRemoveOperation(operationEvent);
    } else if (type === OperationType.ARRAY_SET) {
      this._handleSetOperation(operationEvent);
    } else if (type === OperationType.ARRAY_VALUE) {
      this._handleSetValueOperation(operationEvent);
    } else {
      throw new Error("Invalid operation!");
    }
  }

  private _handleInsertOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayInsertOperation = <ArrayInsertOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: DataValue = operation.value;

    this._validateInsert(index, value);

    var newValue: RealTimeValue<any> =
      RealTimeValueFactory.create(value, this, index, this._callbacks, this._model);

    this._children.splice(index, 0, newValue);
    this.updateFieldInParent(index);

    var event: ArrayInsertEvent = {
      src: this,
      name: RealTimeArray.Events.INSERT,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: newValue
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleReorderOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayMoveOperation = <ArrayMoveOperation> operationEvent.operation;
    var fromIndex: number = operation.fromIndex;
    var toIndex: number = operation.toIndex;

    this._validateMove(fromIndex, toIndex);

    var child: RealTimeValue<any> = this._children[fromIndex];
    this._children.splice(fromIndex, 1);
    this._children.splice(toIndex, 0, child);

    this.updateFieldInParent(Math.min(fromIndex, toIndex));

    var event: ArrayReorderEvent = {
      src: this,
      name: RealTimeArray.Events.REORDER,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      fromIndex: fromIndex,
      toIndex: toIndex
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleRemoveOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayRemoveOperation = <ArrayRemoveOperation> operationEvent.operation;
    var index: number = operation.index;

    this._validateRemove(index);

    var child: RealTimeValue<any> = this._children[index];
    this._children.splice(index, 1);
    this.updateFieldInParent(index);

    child._detach();

    var event: ArrayRemoveEvent = {
      src: this,
      name: RealTimeArray.Events.REMOVE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetOperation(operationEvent: ModelOperationEvent): void {
    var operation: ArrayReplaceOperation = <ArrayReplaceOperation> operationEvent.operation;
    var index: number = operation.index;
    var value: DataValue = operation.value;

    this._validateReplace(index, value);

    var child: RealTimeValue<any> = this._children[index];
    var newValue: RealTimeValue<any> = RealTimeValueFactory.create(value, this, index, this._callbacks, this._model);
    this._children[index] = newValue;
    this.updateFieldInParent(index);

    child._detach();

    var event: ArraySetEvent = {
      src: this,
      name: RealTimeArray.Events.SET,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      index: index,
      value: newValue
    };
    this.emitEvent(event);

    this._bubbleModelChangedEvent(event);
  }

  private _handleSetValueOperation(operationEvent: ModelOperationEvent): ArraySetValueEvent {
    var operation: ArraySetOperation = <ArraySetOperation> operationEvent.operation;
    var values: DataValue[] = operation.value;

    this._validateSet(values);

    var oldChildren: Array<RealTimeValue<any>> = this._children;
    this._children = values.map((value: DataValue, index: number) => {
      return RealTimeValueFactory.create(value, this, index, this._callbacks, this._model);
    });

    oldChildren.forEach((oldChild: RealTimeValue<any>) => oldChild._detach());

    var event: ArraySetValueEvent = {
      src: this,
      name: RealTimeArray.Events.VALUE,
      sessionId: operationEvent.sessionId,
      username: operationEvent.username,
      version: operationEvent.version,
      timestamp: operationEvent.timestamp,
      value: values
    };
    this.emitEvent(event);
    return event;
  }

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Arrays to do have references yet.");
  }

  // Private Validation Methods

  private _validateInsert(index: number, value: Object|number|string|boolean): void {
    // TODO: Add integer check
    if (this._children.length < index || index < 0) {
      throw new Error("Index out of bounds!");
    }

    if (typeof value === 'undefined' || typeof value === 'function') {
      throw new Error("Invalid value for insert!");
    }
  }

  private _validateMove(fromIndex: number, toIndex: number): void {
    // TODO: Add integer check
    if (this._children.length <= fromIndex || fromIndex < 0 || this._children.length <= toIndex || toIndex < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateRemove(index: number): void {
    // TODO: Add integer check
    if (this._children.length <= index || index < 0) {
      throw new Error("Index out of bounds!");
    }
  }

  private _validateReplace(index: number, value: Object|number|string|boolean): void {
    // TODO: Add integer check
    if (this._children.length <= index || index < 0) {
      throw new Error("Index out of bounds!");
    }

    if (typeof value === 'undefined' || typeof value === 'function') {
      throw new Error("Illegal argument!");
    }
  }

  private _validateSet(values: Array<Object|number|string|boolean>): void {
    if (!Array.isArray(values)) {
      throw new Error("Illegal argument!");
    }
  }

  // Private Functions
  /**
   * Update fieldInParent for all children.
   * @param {number} start
   */
  private updateFieldInParent(start: number): void {
    for (var i: number = start; i < this._children.length; i++) {
      var child: RealTimeValue<any> = this._children[i];
      child.fieldInParent = i;
    }
  }
}

export interface ArrayInsertEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayRemoveEvent extends ValueChangedEvent {
  index: number;
}

export interface ArraySetEvent extends ValueChangedEvent {
  index: number;
  value: any;
}

export interface ArrayReorderEvent extends ValueChangedEvent {
  fromIndex: number;
  toIndex: any;
}

export interface ArraySetValueEvent extends ValueChangedEvent {
  value: Array<any>;
}