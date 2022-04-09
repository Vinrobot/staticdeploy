import { IApp, IAppsStorage, IConfiguration } from "@staticdeploy/core";
import { Db, Collection } from "mongodb";

import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

@convertErrors
export default class AppsStorage implements IAppsStorage {
    private collection: Collection<IApp>;

    constructor(private mongo: Db) {
        this.collection = this.mongo.collection<IApp>(tables.apps);
    }

    async findOne(id: string): Promise<IApp | null> {
        return this.collection.findOne({ id });
    }

    async findOneByName(name: string): Promise<IApp | null> {
        return this.collection.findOne({ name });
    }

    async findMany(): Promise<IApp[]> {
        return this.collection.find().toArray();
    }

    async oneExistsWithId(id: string): Promise<boolean> {
        const app = await this.collection.findOne(
            { id },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return app !== null;
    }

    async oneExistsWithName(name: string): Promise<boolean> {
        const app = await this.collection.findOne(
            { name },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return app !== null;
    }

    async createOne(toBeCreatedApp: {
        id: string;
        name: string;
        defaultConfiguration: IConfiguration;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IApp> {
        const result = await this.collection.insertOne(toBeCreatedApp);
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return toBeCreatedApp;
    }

    async updateOne(
        id: string,
        patch: {
            defaultConfiguration?: IConfiguration;
            updatedAt: Date;
        }
    ): Promise<IApp> {
        const result = await this.collection.updateOne({ id }, { $set: patch });
        if (!result.acknowledged || result.matchedCount !== 1) {
            throw new Error("Unable to update");
        }
        return (await this.findOne(id))!;
    }

    async deleteOne(id: string): Promise<void> {
        const result = await this.collection.deleteOne({ id });
        if (!result.acknowledged || result.deletedCount !== 1) {
            throw new Error("Unable to delete");
        }
    }
}
