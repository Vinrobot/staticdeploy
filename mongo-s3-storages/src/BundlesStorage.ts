import {
    IAssetWithContent,
    IAssetWithoutContent,
    IBaseBundle,
    IBundlesStorage,
    IBundleWithoutAssetsContent,
} from "@staticdeploy/core";

export default class BundlesStorage implements IBundlesStorage {
    async findOne(id: string): Promise<IBundleWithoutAssetsContent | null> {
        throw new Error("Not implemented");
    }

    async findLatestByNameAndTag(
        name: string,
        tag: string
    ): Promise<IBundleWithoutAssetsContent | null> {
        throw new Error("Not implemented");
    }

    async getBundleAssetContent(
        bundleId: string,
        assetPath: string
    ): Promise<Buffer | null> {
        throw new Error("Not implemented");
    }

    async findMany(): Promise<IBaseBundle[]> {
        throw new Error("Not implemented");
    }

    async findManyByNameAndTag(
        name: string,
        tag: string
    ): Promise<IBundleWithoutAssetsContent[]> {
        throw new Error("Not implemented");
    }

    async findManyNames(): Promise<string[]> {
        throw new Error("Not implemented");
    }

    async findManyTagsByName(name: string): Promise<string[]> {
        throw new Error("Not implemented");
    }

    async oneExistsWithId(id: string): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async createOne(toBeCreatedBundle: {
        id: string;
        name: string;
        tag: string;
        description: string;
        hash: string;
        assets: IAssetWithContent[];
        fallbackAssetPath: string;
        fallbackStatusCode: number;
        createdAt: Date;
    }): Promise<IBundleWithoutAssetsContent> {
        throw new Error("Not implemented");
    }

    async deleteMany(ids: string[]): Promise<void> {
        throw new Error("Not implemented");
    }
}
