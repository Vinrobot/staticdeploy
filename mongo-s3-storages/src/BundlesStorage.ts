import {
    IAssetWithContent,
    IAssetWithoutContent,
    IBaseBundle,
    IBundlesStorage,
    IBundleWithoutAssetsContent,
} from "@staticdeploy/core";
import { S3 } from "aws-sdk";
import { Db, Collection } from "mongodb";
import { flatMap, map } from "lodash";
import { join } from "path";

import concurrentForEach from "./common/concurrentForEach";
import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

@convertErrors
export default class BundlesStorage implements IBundlesStorage {
    private collection: Collection<IBundleWithoutAssetsContent>;

    constructor(
        private mongo: Db,
        private s3Client: S3,
        private s3Bucket: string,
        private s3EnableGCSCompatibility: boolean
    ) {
        this.collection = this.mongo.collection<IBundleWithoutAssetsContent>(
            tables.bundles
        );
    }

    async findOne(id: string): Promise<IBundleWithoutAssetsContent | null> {
        const mongoBundle = await this.collection.findOne({ id });
        if (!mongoBundle) return null;
        const { _id, ...bundle } = mongoBundle;
        return bundle;
    }

    async findLatestByNameAndTag(
        name: string,
        tag: string
    ): Promise<IBundleWithoutAssetsContent | null> {
        const bundles = await this.collection
            .find({ name, tag })
            .sort("createdAt", "desc")
            .limit(1)
            .toArray();
        return bundles.length === 1 ? bundles[0] : null;
    }

    async getBundleAssetContent(
        bundleId: string,
        assetPath: string
    ): Promise<Buffer | null> {
        const assetS3Key = this.getAssetS3Key(bundleId, assetPath);
        try {
            const s3Object = await this.s3Client
                .getObject({ Bucket: this.s3Bucket, Key: assetS3Key })
                .promise();
            return s3Object.Body as Buffer;
        } catch (err) {
            // If S3 returns a 404, return null
            if (err.statusCode === 404) {
                return null;
            }
            throw err;
        }
    }

    async findMany(): Promise<IBaseBundle[]> {
        return this.collection
            .find(
                {},
                {
                    projection: {
                        _id: 0,
                        id: 1,
                        name: 1,
                        tag: 1,
                        createdAt: 1,
                    },
                }
            )
            .toArray();
    }

    async findManyByNameAndTag(
        name: string,
        tag: string
    ): Promise<IBundleWithoutAssetsContent[]> {
        return this.collection
            .find(
                { name, tag },
                {
                    projection: {
                        _id: 0,
                    },
                }
            )
            .toArray();
    }

    async findManyNames(): Promise<string[]> {
        return this.collection.distinct("name");
    }

    async findManyTagsByName(name: string): Promise<string[]> {
        return this.collection.distinct("tag", { name });
    }

    async oneExistsWithId(id: string): Promise<boolean> {
        const bundle = await this.collection.findOne(
            { id },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return bundle !== null;
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
        // Upload files to S3
        await concurrentForEach(toBeCreatedBundle.assets, async (asset) => {
            await this.s3Client
                .putObject({
                    Bucket: this.s3Bucket,
                    Body: asset.content,
                    Key: this.getAssetS3Key(toBeCreatedBundle.id, asset.path),
                })
                .promise();
        });
        // Omit the assets' content before saving the bundle to db
        const bundleWithoutAssetsContent = {
            ...toBeCreatedBundle,
            assets: toBeCreatedBundle.assets.map((asset) => {
                const newAsset: IAssetWithoutContent = {
                    ...asset,
                    content: undefined,
                };
                delete newAsset.content; // TODO: Check now with ignoreUndefined
                return newAsset;
            }),
        };

        const result = await this.collection.insertOne(
            bundleWithoutAssetsContent
        );
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return bundleWithoutAssetsContent;
    }

    async deleteMany(ids: string[]): Promise<void> {
        const bundles = await this.collection
            .find({
                id: { $in: ids },
            })
            .toArray();
        // Delete bundles' files on S3
        await this.deleteBundlesFiles(bundles);
        // Delete the bundles from db
        this.collection.deleteMany({
            id: { $in: ids },
        });
    }

    private async deleteBundlesFiles(bundles: IBundleWithoutAssetsContent[]) {
        const s3Keys = flatMap(bundles, (bundle) =>
            map(bundle.assets, (asset) =>
                this.getAssetS3Key(bundle.id, asset.path)
            )
        );
        if (this.s3EnableGCSCompatibility) {
            await this.deleteObjectsIndividually(s3Keys);
        } else {
            await this.deleteObjectsInBulk(s3Keys);
        }
    }

    private async deleteObjectsIndividually(s3Keys: string[]) {
        await concurrentForEach(s3Keys, async (s3Key) =>
            this.s3Client
                .deleteObject({ Bucket: this.s3Bucket, Key: s3Key })
                .promise()
        );
    }

    private async deleteObjectsInBulk(s3Keys: string[]) {
        await this.s3Client
            .deleteObjects({
                Bucket: this.s3Bucket,
                Delete: {
                    Objects: map(s3Keys, (s3Key) => ({ Key: s3Key })),
                },
            })
            .promise();
    }

    private getAssetS3Key(bundleId: string, assetPath: string) {
        // When using minio.io as an S3 server, keys can't have a leading /
        // (unlike in AWS S3), so we omit it
        return join(bundleId, assetPath);
    }
}
