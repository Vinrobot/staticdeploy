import { IStoragesModule } from "@staticdeploy/core";
import MemoryStorages from "@staticdeploy/memory-storages";
import MongoS3Storages from "@staticdeploy/mongo-s3-storages";
import PgS3Storages from "@staticdeploy/pg-s3-storages";
import Logger from "bunyan";
import { isNil } from "lodash";

import IConfig from "../common/IConfig";

export default (config: IConfig, logger: Logger): IStoragesModule => {
    const useS3Storage =
        !isNil(config.s3Bucket) &&
        !isNil(config.s3Endpoint) &&
        !isNil(config.s3AccessKeyId) &&
        !isNil(config.s3SecretAccessKey);
    const usePgStorage = !isNil(config.postgresUrl);
    const useMongoStorage = !isNil(config.mongoUrl);

    logger.info(
        `Using ${
            (usePgStorage
                ? PgS3Storages
                : useMongoStorage
                ? MongoS3Storages
                : MemoryStorages
            ).name
        } storages module`
    );

    if (useS3Storage) {
        const s3Config = {
            bucket: config.s3Bucket!,
            endpoint: config.s3Endpoint!,
            accessKeyId: config.s3AccessKeyId!,
            secretAccessKey: config.s3SecretAccessKey!,
            enableGCSCompatibility: config.s3EnableGCSCompatibility!,
        };

        if (usePgStorage) {
            return new PgS3Storages({
                postgresUrl: config.postgresUrl!,
                s3Config: s3Config,
            });
        } else if (useMongoStorage) {
            return new MongoS3Storages({
                mongoUrl: config.mongoUrl!,
                s3Config: s3Config,
            });
        }
    }

    return new MemoryStorages();
};
