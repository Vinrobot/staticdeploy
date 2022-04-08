import registerStoragesTests from "@staticdeploy/storages-test-suite";

import MongoS3Storages from "../src";

execStorageTests();

function execStorageTests() {
    // Create a mongoS3Storages object with test configurations
    const mongoS3Storages = new MongoS3Storages();

    registerStoragesTests({
        storagesName: "mongo-s3-storages",
        storages: mongoS3Storages.getStorages(),
        setupStorages: async () => undefined,
        eraseStorages: async () => undefined,
    });
}
