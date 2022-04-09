import {
    IHealthCheckResult,
    IStorages,
    IStoragesModule,
} from "@staticdeploy/core";
import { S3 } from "aws-sdk";
import { MongoClient, Db } from "mongodb";

import { StorageSetupError } from "./common/errors";
import AppsStorage from "./AppsStorage";
import BundlesStorage from "./BundlesStorage";
import EntrypointsStorage from "./EntrypointsStorage";
import GroupsStorage from "./GroupsStorage";
import OperationLogsStorage from "./OperationLogsStorage";
import UsersStorage from "./UsersStorage";

export default class MongoS3Storages implements IStoragesModule {
    private mongo: MongoClient;
    private mongoDb: Db;
    private s3Client: S3;
    private s3Bucket: string;
    private s3EnableGCSCompatibility: boolean;

    constructor(options: {
        mongoUrl: string;
        s3Config: {
            bucket: string;
            endpoint: string;
            accessKeyId: string;
            secretAccessKey: string;
            enableGCSCompatibility: boolean;
        };
    }) {
        // Instantiate MongoClient
        this.mongo = new MongoClient(options.mongoUrl);
        this.mongoDb = this.mongo.db(undefined, {
            ignoreUndefined: true,
        });

        // Instantiate S3 client
        this.s3Bucket = options.s3Config.bucket;
        this.s3Client = new S3({
            endpoint: options.s3Config.endpoint,
            accessKeyId: options.s3Config.accessKeyId,
            secretAccessKey: options.s3Config.secretAccessKey,
            s3ForcePathStyle: true,
        });
        this.s3EnableGCSCompatibility = options.s3Config.enableGCSCompatibility;
    }

    async setup() {
        await this.setupMongo();
        await this.createS3Bucket();
    }

    getStorages(): IStorages {
        return {
            apps: new AppsStorage(this.mongoDb),
            bundles: new BundlesStorage(
                this.mongoDb,
                this.s3Client,
                this.s3Bucket,
                this.s3EnableGCSCompatibility
            ),
            entrypoints: new EntrypointsStorage(this.mongoDb),
            groups: new GroupsStorage(this.mongoDb),
            operationLogs: new OperationLogsStorage(this.mongoDb),
            users: new UsersStorage(this.mongoDb),
            checkHealth: this.checkHealth.bind(this),
        };
    }

    private async checkHealth(): Promise<IHealthCheckResult> {
        const healthCheckResult: IHealthCheckResult = {
            isHealthy: true,
            details: {},
        };

        try {
            // TODO: Implement /shrug
            // await this.knex.raw("select 1");
        } catch (err) {
            healthCheckResult.isHealthy = false;
            healthCheckResult.details.postgres = {
                message: "Unable to run query 'select 1'",
                err: err,
            };
        }

        try {
            await this.s3Client.headBucket({ Bucket: this.s3Bucket }).promise();
        } catch (err) {
            healthCheckResult.isHealthy = false;
            healthCheckResult.details.s3 = {
                message: `Unable to HEAD bucket ${this.s3Bucket}`,
                err: err,
            };
        }

        return healthCheckResult;
    }

    private async setupMongo() {
        await this.mongo.connect();
    }

    private async createS3Bucket() {
        // Check if the bucket exists and we can be accessed with our keys
        try {
            await this.s3Client.headBucket({ Bucket: this.s3Bucket }).promise();
            return;
        } catch (err) {
            if (err.statusCode !== 404) {
                throw new StorageSetupError(
                    `Error accessing bucket = ${this.s3Bucket}`,
                    err
                );
            }
        }

        // If the bucket doesn't exist, create it
        try {
            await this.s3Client
                .createBucket({ Bucket: this.s3Bucket })
                .promise();
        } catch (err) {
            throw new StorageSetupError(
                `Error creating bucket = ${this.s3Bucket}`,
                err
            );
        }
    }
}
