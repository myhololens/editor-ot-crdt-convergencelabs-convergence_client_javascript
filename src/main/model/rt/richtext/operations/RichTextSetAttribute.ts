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

import {RichTextOperation} from "./RichTextOperation";
import {RichTextRange} from "../model";

/**
 * @hidden
 * @internal
 */
export class RichTextSetAttribute implements RichTextOperation {
  private readonly _range: RichTextRange;
  private readonly _key: string;
  private readonly _oldValue: any;
  private readonly _newValue: any;

  constructor(range: RichTextRange, key: string, oldValue: any, newValue: any) {
    this._range = range;
    this._key = key;
    this._newValue = newValue;
    this._oldValue = oldValue;
  }

  public range(): RichTextRange {
    return this._range;
  }

  public key(): string {
    return this._key;
  }

  public oldValue(): any {
    return this._oldValue;
  }

  public newValue(): any {
    return this._newValue;
  }
}