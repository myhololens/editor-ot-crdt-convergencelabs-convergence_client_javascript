import {RealTimeElement} from "./RealTimeElement";
import {RealTimeContainerElement} from "./RealTimeContainerElement";
import {ArrayNode} from "../internal/ArrayNode";
import {RealTimeWrapperFactory} from "./RealTimeWrapperFactory";
import {ModelEventCallbacks} from "./RealTimeModel";
import {ArrayReplaceOperation} from "../ot/ops/ArrayReplaceOperation";
import {ArrayInsertOperation} from "../ot/ops/ArrayInsertOperation";
import {ArrayRemoveOperation} from "../ot/ops/ArrayRemoveOperation";
import {ArrayMoveOperation} from "../ot/ops/ArrayMoveOperation";
import {ArraySetOperation} from "../ot/ops/ArraySetOperation";
import {RemoteReferenceEvent} from "../../connection/protocol/model/reference/ReferenceEvent";
import {ModelNodeEvent} from "../internal/events";
import {ArrayNodeInsertEvent} from "../internal/events";
import {ArrayNodeRemoveEvent} from "../internal/events";
import {ArrayNodeReorderEvent} from "../internal/events";
import {ArrayNodeSetEvent} from "../internal/events";
import {ArrayNodeSetValueEvent} from "../internal/events";
import {RealTimeModel} from "./RealTimeModel";

export class RealTimeArray extends RealTimeElement<any[]> implements RealTimeContainerElement<any[]> {

  static Events: any = {
    INSERT: "insert",
    REMOVE: "remove",
    SET: "set",
    REORDER: "reorder",
    VALUE: "value",
    DETACHED: RealTimeElement.Events.DETACHED,
    MODEL_CHANGED: RealTimeElement.Events.MODEL_CHANGED
  };

  /**
   * Constructs a new RealTimeArray.
   */
  constructor(protected _delegate: ArrayNode,
              protected _callbacks: ModelEventCallbacks,
              _wrapperFactory: RealTimeWrapperFactory,
              _model: RealTimeModel) {
    super(_delegate, _callbacks, _wrapperFactory, _model, []);

    this._delegate.events().subscribe((event: ModelNodeEvent) => {
      if (event.local) {
        if (event instanceof ArrayNodeInsertEvent) {
          this._sendOperation(new ArrayInsertOperation(this.id(), false, event.index, event.src.get(event.index).dataValue()));
        } else if (event instanceof ArrayNodeRemoveEvent) {
          this._sendOperation(new ArrayRemoveOperation(this.id(), false, event.index));
        } else if (event instanceof ArrayNodeReorderEvent) {
          this._sendOperation(new ArrayMoveOperation(this.id(), false, event.fromIndex, event.toIndex));
        } else if (event instanceof ArrayNodeSetEvent) {
          let index: number = event.index;
          this._sendOperation(new ArrayReplaceOperation(this.id(), false, index, event.src.get(index).dataValue()));
        } else if (event instanceof ArrayNodeSetValueEvent) {
          this._sendOperation(new ArraySetOperation(this.id(), false, event.src.dataValue().children));
        }
      }
    });
  }

  get(index: number): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.get(index));
  }


  set(index: number, value: any): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.set(index, value));
  }

  insert(index: number, value: any): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.insert(index, value));
  }

  remove(index: number): Object|number|string|boolean {
    return this._delegate.remove(index);
  }

  reorder(fromIndex: number, toIndex: number): void {
    this._delegate.reorder(fromIndex, toIndex);
  }

  push(value: any): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.push(value));
  }

  pop(): any {
    return this._delegate.pop();
  }

  unshift(value: any): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.unshift(value));
  }

  shift(): any {
    return this._delegate.shift();
  }

  length(): number {
    return this._delegate.length();
  }

  forEach(callback: (value: RealTimeElement<any>, index?: number) => void): void {
    this._delegate.forEach((modelNode, index) => {
      callback(this._wrapperFactory.wrap(modelNode), index);
    });
  }

  elementAt(pathArgs: any): RealTimeElement<any> {
    return this._wrapperFactory.wrap(this._delegate.valueAt(pathArgs));
  }

  //
  // protected and private methods.
  //

  _handleRemoteReferenceEvent(event: RemoteReferenceEvent): void {
    throw new Error("Arrays to do have references yet.");
  }
}
