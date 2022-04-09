import { IGroup, IGroupsStorage } from "@staticdeploy/core";
import { Db, Collection } from "mongodb";

import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

@convertErrors
export default class GroupsStorage implements IGroupsStorage {
    private collection: Collection<IGroup>;

    constructor(private mongo: Db) {
        this.collection = this.mongo.collection<IGroup>(tables.groups);
    }

    async findOne(id: string): Promise<IGroup | null> {
        return this.collection.findOne({ id });
    }

    async findOneByName(name: string): Promise<IGroup | null> {
        return this.collection.findOne({ name });
    }

    async findMany(): Promise<IGroup[]> {
        return this.collection.find().toArray();
    }

    async oneExistsWithName(name: string): Promise<boolean> {
        const group = await this.collection.findOne(
            { name },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return group !== null;
    }

    async allExistWithIds(ids: string[]): Promise<boolean> {
        const groups = await this.collection
            .find(
                {
                    id: { $in: ids },
                },
                {
                    projection: { _id: 1, id: 1 },
                }
            )
            .toArray();
        return groups.length === ids.length;
    }

    async createOne(toBeCreatedGroup: {
        id: string;
        name: string;
        roles: string[];
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IGroup> {
        const result = await this.collection.insertOne(toBeCreatedGroup);
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return toBeCreatedGroup;
    }

    async updateOne(
        id: string,
        patch: {
            name?: string;
            roles?: string[];
            updatedAt: Date;
        }
    ): Promise<IGroup> {
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
