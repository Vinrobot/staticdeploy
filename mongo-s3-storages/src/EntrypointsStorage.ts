import {
    IConfiguration,
    IEntrypoint,
    IEntrypointsStorage,
} from "@staticdeploy/core";

export default class EntrypointsStorage implements IEntrypointsStorage {
    async findOne(id: string): Promise<IEntrypoint | null> {
        throw new Error("Not implemented");
    }

    async findOneByUrlMatcher(urlMatcher: string): Promise<IEntrypoint | null> {
        throw new Error("Not implemented");
    }

    async findManyByAppId(appId: string): Promise<IEntrypoint[]> {
        throw new Error("Not implemented");
    }

    async findManyByUrlMatcherHostname(
        urlMatcherHostname: string
    ): Promise<IEntrypoint[]> {
        throw new Error("Not implemented");
    }

    async oneExistsWithUrlMatcher(urlMatcher: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async anyExistsWithAppId(appId: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async anyExistsWithBundleIdIn(bundleIds: string[]): Promise<boolean> {
        throw new Error("Not implemented");
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
        throw new Error("Not implemented");
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
        throw new Error("Not implemented");
    }

    async deleteOne(id: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
