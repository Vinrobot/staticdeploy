import {
    IConfiguration,
    IEntrypoint,
    IEntrypointsStorage,
} from "@staticdeploy/core";
import { Db, Collection } from "mongodb";

import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

function escapeRegExp(string: string) {
    // HELP, why is there no built-in escape function?????
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#writing_a_regular_expression_pattern
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

@convertErrors
export default class EntrypointsStorage implements IEntrypointsStorage {
    private collection: Collection<IEntrypoint>;

    constructor(private mongo: Db) {
        this.collection = this.mongo.collection<IEntrypoint>(
            tables.entrypoints
        );
    }

    async findOne(id: string): Promise<IEntrypoint | null> {
        return this.collection.findOne({ id });
    }

    async findOneByUrlMatcher(urlMatcher: string): Promise<IEntrypoint | null> {
        return this.collection.findOne({ urlMatcher });
    }

    async findManyByAppId(appId: string): Promise<IEntrypoint[]> {
        return this.collection.find({ appId }).toArray();
    }

    async findManyByUrlMatcherHostname(
        urlMatcherHostname: string
    ): Promise<IEntrypoint[]> {
        const startsWith = new RegExp("^" + escapeRegExp(urlMatcherHostname));
        return this.collection
            .find({
                urlMatcher: { $regex: startsWith },
            })
            .toArray();
    }

    async oneExistsWithUrlMatcher(urlMatcher: string): Promise<boolean> {
        const entrypoint = await this.collection.findOne(
            { urlMatcher },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return entrypoint !== null;
    }

    async anyExistsWithAppId(appId: string): Promise<boolean> {
        const entrypoint = await this.collection.findOne(
            { appId },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return entrypoint !== null;
    }

    async anyExistsWithBundleIdIn(bundleIds: string[]): Promise<boolean> {
        const entrypoint = await this.collection.findOne(
            {
                bundleId: { $in: bundleIds },
            },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return entrypoint !== null;
    }

    async createOne(toBeCreatedEntrypoint: {
        id: string;
        appId: string;
        bundleId: string | null;
        redirectTo: string | null;
        urlMatcher: string;
        configuration: IConfiguration | null;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IEntrypoint> {
        const result = await this.collection.insertOne(toBeCreatedEntrypoint);
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return toBeCreatedEntrypoint;
    }

    async updateOne(
        id: string,
        patch: {
            bundleId?: string | null;
            redirectTo?: string | null;
            configuration?: IConfiguration | null;
            updatedAt: Date;
        }
    ): Promise<IEntrypoint> {
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
