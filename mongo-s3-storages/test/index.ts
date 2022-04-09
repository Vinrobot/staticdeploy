import registerStoragesTests from "@staticdeploy/storages-test-suite";
import { S3 } from "aws-sdk";
import { Db } from "mongodb";

import MongoS3Storages from "../src";

execStorageTests(false);
execStorageTests(true);

function execStorageTests(enableGCSCompatibility: boolean) {
    // Create a mongoS3Storages object with test configurations
    const mongoS3Storages = new MongoS3Storages({
        mongoUrl:
            "mongodb://root:password@localhost:27017/test?authSource=admin",
        s3Config: {
            bucket: "test",
            endpoint: "http://localhost:9000",
            accessKeyId: "accessKeyId",
            secretAccessKey: "secretAccessKey",
            enableGCSCompatibility: enableGCSCompatibility,
        },
    });

    registerStoragesTests({
        storagesName: "mongo-s3-storages",
        storages: mongoS3Storages.getStorages(),
        setupStorages: () => mongoS3Storages.setup(),
        eraseStorages: async () => {
            const mongoDb: Db = (mongoS3Storages as any).mongoDb;
            const s3Client: S3 = (mongoS3Storages as any).s3Client;
            const s3Bucket: string = (mongoS3Storages as any).s3Bucket;

            // Empty the database, starting from entrypoints since they
            // reference apps and bundles
            const collections = await mongoDb.collections();
            for (const collection of collections) {
                await collection.drop();
            }

            // Empty the S3 bucket
            const objects = await s3Client
                .listObjects({ Bucket: s3Bucket })
                .promise();
            if (objects.Contents && objects.Contents.length > 0) {
                await s3Client
                    .deleteObjects({
                        Bucket: s3Bucket,
                        Delete: {
                            Objects: objects.Contents.map((obj) => ({
                                Key: obj.Key!,
                            })),
                        },
                    })
                    .promise();
            }
        },
    });
}
