import {AppliedStringInsertOperation} from "./AppliedStringInsertOperation";
import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {StringRemove} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

export class AppliedStringRemoveOperation extends AppliedDiscreteOperation implements StringRemove {

  constructor(id: string, noOp: boolean, public index: number, public value: string) {
    super(OperationType.STRING_REMOVE, id, noOp);
    Object.freeze(this);
  }

  inverse(): AppliedStringInsertOperation {
    return new AppliedStringInsertOperation(this.id, this.noOp, this.index, this.value);
  }
}
