import { IApp, IAppsStorage, IConfiguration } from "@staticdeploy/core";

export default class AppsStorage implements IAppsStorage {
    async findOne(id: string): Promise<IApp | null> {
        throw new Error("Not implemented");
    }

    async findOneByName(name: string): Promise<IApp | null> {
        throw new Error("Not implemented");
    }

    async findMany(): Promise<IApp[]> {
        throw new Error("Not implemented");
    }

    async oneExistsWithId(id: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async oneExistsWithName(name: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async createOne(toBeCreatedApp: {
        id: string;
        name: string;
        defaultConfiguration: IConfiguration;
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IApp> {
        throw new Error("Not implemented");
    }

    async updateOne(
        id: string,
        patch: {
            defaultConfiguration?: IConfiguration;
            updatedAt: Date;
        }
    ): Promise<IApp> {
        throw new Error("Not implemented");
    }

    async deleteOne(id: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
