import {AppliedDiscreteOperation} from "./AppliedDiscreteOperation";
import {ArrayMove} from "../ops/operationChanges";
import {OperationType} from "../ops/OperationType";

/**
 * @hidden
 * @internal
 */
export class AppliedArrayMoveOperation extends AppliedDiscreteOperation implements ArrayMove {

  constructor(id: string,
              noOp: boolean,
              public readonly fromIndex: number,
              public readonly toIndex: number) {
    super(OperationType.ARRAY_REORDER, id, noOp);
    Object.freeze(this);
  }

  public inverse(): AppliedArrayMoveOperation {
    return new AppliedArrayMoveOperation(this.id, this.noOp, this.toIndex, this.fromIndex);
  }
}
