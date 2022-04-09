import {
    IOperationLog,
    IOperationLogsStorage,
    Operation,
} from "@staticdeploy/core";
import { Db, Collection } from "mongodb";

import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

@convertErrors
export default class OperationLogsStorage implements IOperationLogsStorage {
    private collection: Collection<IOperationLog>;

    constructor(private mongo: Db) {
        this.collection = this.mongo.collection<IOperationLog>(
            tables.operationLogs
        );
    }

    async findMany(): Promise<IOperationLog[]> {
        return this.collection.find().toArray();
    }

    async createOne(toBeCreatedOperationLog: {
        id: string;
        operation: Operation;
        parameters: {
            [key: string]: any;
        };
        performedBy: string;
        performedAt: Date;
    }): Promise<IOperationLog> {
        const result = await this.collection.insertOne(toBeCreatedOperationLog);
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return toBeCreatedOperationLog;
    }
}
