import {ModelPermissions} from "./ModelPermissions";
import {ConvergenceConnection} from "../connection/ConvergenceConnection";
import {io} from "@convergence/convergence-proto";
import IConvergenceMessage = io.convergence.proto.IConvergenceMessage;
import IModelPermissionsData = io.convergence.proto.IModelPermissionsData;
import {mapObjectValues} from "../util/ObjectUtils";
import {StringMap} from "../util";
import {toModelPermissions} from "./ModelMessageConverter";

export class ModelPermissionManager {

  /**
   * @internal
   */
  private readonly _modelId: string;

  /**
   * @internal
   */
  private readonly _connection: ConvergenceConnection;

  /**
   * @hidden
   * @internal
   */
  constructor(modelId: string, connection: ConvergenceConnection) {
    this._modelId = modelId;
    this._connection = connection;
  }

  get modelId() {
    return this._modelId;
  }

  public getPermissions(): Promise<ModelPermissions> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      const permissionsData = getModelPermissionsResponse.userPermissions[this._connection.session().username()];
      return toModelPermissions(permissionsData);
    });
  }

  public setOverridesCollection(overrideCollection: boolean): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        overridesCollection: overrideCollection,
        removeAllUserPermissionsBeforeSet: false,
        setUserPermissions: {},
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getOverridesCollection(): Promise<boolean> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return getModelPermissionsResponse.overridesCollection;
    });
  }

  public getWorldPermissions(): Promise<ModelPermissions> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return toModelPermissions(getModelPermissionsResponse.worldPermissions);
    });
  }

  public setWorldPermissions(worldPermissions: ModelPermissions): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        worldPermissions,
        removeAllUserPermissionsBeforeSet: false,
        setUserPermissions: {},
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getAllUserPermissions(): Promise<Map<string, ModelPermissions>> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return StringMap.objectToMap(mapObjectValues(getModelPermissionsResponse.userPermissions, toModelPermissions));
    });
  }

  public setAllUserPermissions(permissions: { [key: string]: ModelPermissions }): Promise<void>;
  public setAllUserPermissions(permissions: Map<string, ModelPermissions>): Promise<void>;
  public setAllUserPermissions(
    permissions: Map<string, ModelPermissions> | { [key: string]: ModelPermissions }): Promise<void> {
    if (!(permissions instanceof Map)) {
      const permsObject = permissions as { [key: string]: ModelPermissions };
      const map = new Map<string, ModelPermissions>();
      Object.keys(permsObject).forEach(key => {
        map.set(key, permsObject[key]);
      });
      permissions = map;
    }

    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        setUserPermissions: StringMap.mapToObject(permissions),
        removeAllUserPermissionsBeforeSet: true
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public getUserPermissions(username: string): Promise<ModelPermissions | undefined> {
    const request: IConvergenceMessage = {
      getModelPermissionsRequest: {
        modelId: this._modelId
      }
    };

    return this._connection.request(request).then((response: IConvergenceMessage) => {
      const {getModelPermissionsResponse} = response;
      return toModelPermissions(getModelPermissionsResponse.userPermissions[username]);
    });
  }

  public setUserPermissions(username: string, permissions: ModelPermissions): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        overridesCollection: false,
        worldPermissions: null,
        setUserPermissions: {username: permissions},
        removeAllUserPermissionsBeforeSet: false,
        removedUserPermissions: []
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }

  public removeUserPermissions(username: string): Promise<void> {
    const request: IConvergenceMessage = {
      setModelPermissionsRequest: {
        modelId: this._modelId,
        removeAllUserPermissionsBeforeSet: false,
        removedUserPermissions: [username]
      }
    };

    return this._connection.request(request).then(() => {
      return;
    });
  }
}
