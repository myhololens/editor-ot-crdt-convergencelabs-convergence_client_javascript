/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "COPYING" and
 * "COPYING.LESSER" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {OperationPair} from "../OperationPair";
import {OperationTransformationFunction} from "../OperationTransformationFunction";
import {StringRemoveOperation} from "../../ops/StringRemoveOperation";
import {RangeRangeRelationship, RangeRelationshipUtil} from "../../util/RangeRelationshipUtil";

/**
 * @hidden
 * @internal
 */
export const StringRemoveRemoveOTF: OperationTransformationFunction<StringRemoveOperation, StringRemoveOperation> =
  (s: StringRemoveOperation, c: StringRemoveOperation) => {
    const cStart: number = c.index;
    const cEnd: number = c.index + c.value.length;

    const sStart: number = s.index;
    const sEnd: number = s.index + s.value.length;

    const rr: RangeRangeRelationship = RangeRelationshipUtil.getRangeRangeRelationship(sStart, sEnd, cStart, cEnd);

    let offsetDelta: number;
    let overlapStart: number;
    let overlapEnd: number;

    switch (rr) {
      case RangeRangeRelationship.Precedes:
        // S-RR-1
        return new OperationPair(
          s,
          c.copy({index: c.index - s.value.length}));
      case RangeRangeRelationship.PrecededBy:
        // S-RR-2
        return new OperationPair(
          s.copy({index: s.index - c.value.length}),
          c);
      case RangeRangeRelationship.Meets:
      case RangeRangeRelationship.Overlaps:
        // S-RR-3 and S-RR-5
        offsetDelta = c.index - s.index;
        return new OperationPair(
          s.copy({value: s.value.substring(0, offsetDelta)}),
          c.copy({index: s.index, value: c.value.substring(s.value.length - offsetDelta, c.value.length)}));
      case RangeRangeRelationship.MetBy:
      case RangeRangeRelationship.OverlappedBy:
        // S-RR-4 and S-RR-6
        offsetDelta = s.index - c.index;
        return new OperationPair(
          s.copy({index: c.index, value: s.value.substring(c.value.length - offsetDelta, s.value.length)}),
          c.copy({value: c.value.substring(0, offsetDelta)}));
      case RangeRangeRelationship.Starts:
        // S-RR-7
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(s.value.length, c.value.length)}));
      case RangeRangeRelationship.StartedBy:
        // S-RR-8
        return new OperationPair(
          s.copy({value: s.value.substring(c.value.length, s.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.Contains:
        // S-RR-9
        overlapStart = c.index - s.index;
        overlapEnd = overlapStart + c.value.length;
        return new OperationPair(
          s.copy({value: s.value.substring(0, overlapStart) + s.value.substring(overlapEnd, s.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.ContainedBy:
        // S-RR-10
        overlapStart = s.index - c.index;
        overlapEnd = overlapStart + s.value.length;
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(0, overlapStart) + c.value.substring(overlapEnd, c.value.length)}));
      case RangeRangeRelationship.Finishes:
        // S-RR-11
        return new OperationPair(
          s.copy({noOp: true}),
          c.copy({value: c.value.substring(0, c.value.length - s.value.length)}));
      case RangeRangeRelationship.FinishedBy:
        // S-RR-12
        return new OperationPair(
          s.copy({value: s.value.substring(0, s.value.length - c.value.length)}),
          c.copy({noOp: true}));
      case RangeRangeRelationship.EqualTo:
        // S-RR-13
        return new OperationPair(s.copy({noOp: true}), c.copy({noOp: true}));
      default:
        throw new Error("invalid range range relationship");
    }
  };
