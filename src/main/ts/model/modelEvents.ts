import {ConvergenceEvent} from "../util/ConvergenceEvent";
import {Path} from "./Path";
import {ModelReference} from "./reference/ModelReference";
import {ObservableModel} from "./observable/ObservableModel";
import {ObservableElement} from "./observable/ObservableElement";
import {ObservableArray} from "./observable/ObservableArray";
import {ObservableBoolean} from "./observable/ObservableBoolean";
import {ObservableNumber} from "./observable/ObservableNumber";
import {ObservableObject} from "./observable/ObservableObject";
import {ObservableString} from "./observable/ObservableString";

export interface ModelEvent extends ConvergenceEvent {
  readonly src: ObservableModel;
}

export interface ModelClosedEvent extends ModelEvent {
  readonly local: boolean;
  readonly reason?: string;
}

export interface VersionChangedEvent extends ModelEvent {
  readonly version: number;
}

export interface RemoteReferenceCreatedEvent extends ConvergenceEvent {
  readonly reference: ModelReference<any>;
}

export interface ConvergenceModelValueEvent extends ConvergenceEvent {
  readonly src: ObservableElement<any>;
  readonly local: boolean;
}

export class ElementDetachedEvent implements ConvergenceEvent {
  public readonly name: string = "detached";

  constructor(public src: ObservableElement<any>) {
  }
}

export interface ValueChangedEvent extends ConvergenceModelValueEvent {
  readonly sessionId: string;
  readonly username: string;
}

export class ModelChangedEvent implements ConvergenceModelValueEvent {
  public static readonly NAME = "model_changed";
  public readonly name: string = ModelChangedEvent.NAME;

  constructor(public readonly src: ObservableElement<any>,
              public readonly relativePath: Path,
              public readonly childEvent: ValueChangedEvent,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ArrayInsertEvent implements ValueChangedEvent {
  public static readonly NAME = "insert";
  public readonly name: string = ArrayInsertEvent.NAME;

  constructor(public readonly src: ObservableArray,
              public readonly index: number,
              public readonly value: ObservableElement<any>,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ArrayRemoveEvent implements ValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = ArrayRemoveEvent.NAME;

  constructor(public readonly src: ObservableArray,
              public readonly index: number,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ArraySetEvent implements ValueChangedEvent {
  public static readonly NAME = "set";
  public readonly name: string = ArraySetEvent.NAME;

  constructor(public readonly src: ObservableArray,
              public readonly index: number,
              public readonly value: ObservableElement<any>,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ArrayReorderEvent implements ValueChangedEvent {
  public static readonly NAME = "reorder";
  public readonly name: string = ArrayReorderEvent.NAME;

  constructor(public readonly src: ObservableArray,
              public readonly fromIndex: number,
              public readonly toIndex: number,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ArraySetValueEvent implements ValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ArraySetValueEvent.NAME;

  constructor(public readonly src: ObservableArray,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class BooleanSetValueEvent implements ValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = BooleanSetValueEvent.NAME;

  constructor(public readonly src: ObservableBoolean,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class NumberSetValueEvent implements ValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = NumberSetValueEvent.NAME;

  constructor(public readonly src: ObservableNumber,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class NumberDeltaEvent implements ValueChangedEvent {
  public static readonly NAME = "delta";
  public readonly name: string = NumberDeltaEvent.NAME;

  constructor(public readonly src: ObservableNumber,
              public readonly value: number,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ObjectSetEvent implements ValueChangedEvent {
  public static readonly NAME = "set";
  public readonly name: string = ObjectSetEvent.NAME;

  constructor(public readonly src: ObservableObject,
              public readonly key: string,
              public readonly value: ObservableElement<any>,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ObjectRemoveEvent implements ValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = ObjectRemoveEvent.NAME;

  constructor(public readonly src: ObservableObject,
              public readonly key: string,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class ObjectSetValueEvent implements ValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = ObjectSetValueEvent.NAME;

  constructor(public readonly src: ObservableObject,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class StringInsertEvent implements ValueChangedEvent {
  public static readonly NAME = "insert";
  public readonly name: string = StringInsertEvent.NAME;

  constructor(public readonly src: ObservableString,
              public readonly index: number,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class StringRemoveEvent implements ValueChangedEvent {
  public static readonly NAME = "remove";
  public readonly name: string = StringRemoveEvent.NAME;

  constructor(public readonly src: ObservableString,
              public readonly index: number,
              public readonly value: string,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}

export class StringSetValueEvent implements ValueChangedEvent {
  public static readonly NAME = "value";
  public readonly name: string = StringSetValueEvent.NAME;

  constructor(public readonly src: ObservableString,
              public readonly sessionId: string,
              public readonly username: string,
              public readonly local: boolean) {
    Object.freeze(this);
  }
}
