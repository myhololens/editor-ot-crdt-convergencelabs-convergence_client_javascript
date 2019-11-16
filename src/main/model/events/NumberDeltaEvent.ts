/*
 * Copyright (c) 2019 - Convergence Labs, Inc.
 *
 * This file is part of the Convergence JavaScript Client, which is released
 * under the terms of the GNU Lesser General Public License version 3
 * (LGPLv3), which is a refinement of the GNU Lesser General Public License
 * version 3 (GPLv3).  A copy of the both the GPLv3 and the LGPLv3 should have
 * been provided along with this file, typically located in the "LICENSE" and
 * "LICENSE.LGPL" files (respectively), which are part of this source code
 * package. Alternatively, see <https://www.gnu.org/licenses/gpl-3.0.html> and
 * <https://www.gnu.org/licenses/lgpl-3.0.html> for the full text of the GPLv3
 * and LGPLv3 licenses, if they were not provided.
 */

import {IValueChangedEvent} from "./IValueChangedEvent";
import {ObservableNumber} from "../observable/ObservableNumber";
import {DomainUser} from "../../identity";

/**
 * Emitted when arithmetic is performed on a [[RealTimeNumber]].
 *
 * When the value of a [[RealTimeNumber]] is directly set
 * (with e.g. `rtNumber.value(23)`), a [[NumberSetValueEvent]] is emitted.
 *
 * @module Real Time Data
 */
export class NumberDeltaEvent implements IValueChangedEvent {
  public static readonly NAME = "delta";

  /**
   * @inheritdoc
   */
  public readonly name: string = NumberDeltaEvent.NAME;

  /**
   * @param element
   * @param value
   * @param sessionId
   * @param user
   * @param local
   *
   * @hidden
   * @internal
   */
  constructor(
    /**
     * The [[RealTimeNumber]] or [[HistoricalNumber]] which was modified
     */
    public readonly element: ObservableNumber,

    /**
     * @inheritdoc
     */
    public readonly user: DomainUser,

    /**
     * @inheritdoc
     */
    public readonly sessionId: string,

    /**
     * True if the change occurred locally (within the current session)
     */
    public readonly local: boolean,

    /**
     * The new value of the number
     */
    public readonly value: number
  ) {
    Object.freeze(this);
  }
}
