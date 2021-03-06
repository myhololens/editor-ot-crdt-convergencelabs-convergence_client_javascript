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

import {IdbStorageAdapter} from "../../../main/storage/idb";
import {ILocalOperationData, IModelState} from "../../../main/storage/api/";
import {ModelPermissions} from "../../../main/model/";

import {expect} from "chai";
// tslint:disable-next-line:no-duplicate-imports
import * as chai from "chai";
import "fake-indexeddb/auto";
import * as chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

describe("IdbModelStore", () => {
  describe("modelExists()", () => {
    it("returns false for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        const exists = await modelStore.modelExists(modelState.modelId);
        expect(exists).to.be.false;
      })
    );

    it("returns true for a model that does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.modelId);
        expect(exists).to.be.true;
      })
    );
  });

  describe("putModel()", () => {
    it("stores the correct model", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const retrieved = await modelStore.getModelState(modelState.modelId);
        expect(retrieved).to.deep.equal(modelState);
      })
    );
  });

  describe("deleteModel()", () => {
    it("deletes and existing model ", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const modelState = createModelState();
        await modelStore.putModelState(modelState);
        const exists = await modelStore.modelExists(modelState.modelId);
        expect(exists).to.be.true;

        await modelStore.removeSubscriptions([modelState.modelId]);
        const afterDelete = await modelStore.modelExists(modelState.modelId);
        expect(afterDelete).to.be.false;
      })
    );
  });

  describe("processLocalOperation()", () => {
    it("Reject if the model does not exist", () => withStorage(async (adapter) => {
        const modelStore = adapter.modelStore();
        const localOp: ILocalOperationData = {
          sequenceNumber: 0,
          contextVersion: 1,
          modelId: "does-not-exist",
          sessionId: "none",
          operation: {
            type: "string_insert",
          },
          timestamp: new Date()
        };

        const result = modelStore.processLocalOperation(localOp);
        return expect(result).to.eventually.be.rejected;
      })
    );
  });
});

let modelCounter = 1;

function createModelState(): IModelState {
  return {
    modelId: "modelId" + modelCounter++,
    collection: "collection",
    local: false,
    version: 10,
    lastSequenceNumber: 0,
    valueIdPrefix: {prefix: "vid", increment: 0},
    createdTime: new Date(),
    modifiedTime: new Date(),
    permissions: new ModelPermissions(true, true, true, true),
    snapshot: {
      version: 10,
      sequenceNumber: 0,
      data: {
        type: "object",
        id: "1:0",
        value: {}
      },
      localOperations: [],
      serverOperations: []
    }
  };
}

let counter = 1;

function withStorage(body: (IdbStorageAdapter) => Promise<any>): Promise<any> {
  const adapter = new IdbStorageAdapter();
  return adapter.initialize("namespace", "domain" + counter++, "someuser")
    .then(() => body(adapter))
    .then((result) => {
      adapter.destroy();
      return Promise.resolve(result);
    })
    .catch((e) => {
      adapter.destroy();
      return Promise.reject(e);
    });
}
