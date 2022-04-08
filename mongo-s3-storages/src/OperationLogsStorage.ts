import {
    IOperationLog,
    IOperationLogsStorage,
    Operation,
} from "@staticdeploy/core";

export default class OperationLogsStorage implements IOperationLogsStorage {
    async findMany(): Promise<IOperationLog[]> {
        throw new Error("Not implemented");
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
        throw new Error("Not implemented");
    }
}
