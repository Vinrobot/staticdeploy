import { IGroup, IGroupsStorage } from "@staticdeploy/core";

export default class GroupsStorage implements IGroupsStorage {
    async findOne(id: string): Promise<IGroup | null> {
        throw new Error("Not implemented");
    }

    async findOneByName(name: string): Promise<IGroup | null> {
        throw new Error("Not implemented");
    }

    async findMany(): Promise<IGroup[]> {
        throw new Error("Not implemented");
    }

    async oneExistsWithName(name: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async allExistWithIds(ids: string[]): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async createOne(toBeCreatedGroup: {
        id: string;
        name: string;
        roles: string[];
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IGroup> {
        throw new Error("Not implemented");
    }

    async updateOne(
        id: string,
        patch: {
            name?: string;
            roles?: string[];
            updatedAt: Date;
        }
    ): Promise<IGroup> {
        throw new Error("Not implemented");
    }

    async deleteOne(id: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
