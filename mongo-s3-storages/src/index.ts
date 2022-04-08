import {
    IHealthCheckResult,
    IStorages,
    IStoragesModule,
} from "@staticdeploy/core";

import AppsStorage from "./AppsStorage";
import BundlesStorage from "./BundlesStorage";
import EntrypointsStorage from "./EntrypointsStorage";
import GroupsStorage from "./GroupsStorage";
import OperationLogsStorage from "./OperationLogsStorage";
import UsersStorage from "./UsersStorage";

export default class MongoS3Storages implements IStoragesModule {
    constructor(options: {}) {
        /**/
    }

    async setup() {
        /**/
    }

    getStorages(): IStorages {
        return {
            apps: new AppsStorage(),
            bundles: new BundlesStorage(),
            entrypoints: new EntrypointsStorage(),
            groups: new GroupsStorage(),
            operationLogs: new OperationLogsStorage(),
            users: new UsersStorage(),
            checkHealth: this.checkHealth.bind(this),
        };
    }

    private async checkHealth(): Promise<IHealthCheckResult> {
        const healthCheckResult: IHealthCheckResult = {
            isHealthy: true,
            details: {},
        };
        return healthCheckResult;
    }
}
