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

import {ModelPermissions} from "./ModelPermissions";
import {ModelDataInitializer} from "./ModelDataInitializer";

/**
 * The configuration available when creating a model with the
 * [[ModelService.create]] or [[ModelService.openAutoCreate]] methods.
 *
 * @module Real Time Data
 */
export interface ICreateModelOptions {
  /**
   * The collection in which this model will live.
   */
  collection: string;

  /**
   * The model's ID.  If not provided, a UUID will be generated.
   *
   * Note that model IDs must be unique *even across collections*!
   */
  id?: string;

  /**
   * The initial contents of the model, either provided directly or as the result
   * of a callback function.  This data should be easily serializable.
   */
  data?: ModelDataInitializer;

  /**
   * Set to true if the permissions set in this object should override those set
   * in the parent collection.
   */
  overrideCollectionWorldPermissions?: boolean;

  /**
   * Generic permissions for this model for all users.
   */
  worldPermissions?: ModelPermissions;

  /**
   * Per-user permissions can be set here, where the key is an existing user's username.
   */
  userPermissions?: { [username: string]: ModelPermissions };
}
