import faker from "faker";
import { lowerCase, pick, range } from "lodash";

const id = () => faker.random.alphaNumeric(8);

// Apps
const appName = () =>
    lowerCase(faker.commerce.productName()).replace(/ /g, "-");
export const app = (supplied: any = {}) => ({
    id: id(),
    name: appName(),
    defaultConfiguration: { KEY: "VALUE" },
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...supplied,
});

// Bundles
export const bundleName = () => faker.lorem.slug(4);
export const bundleTag = () => faker.lorem.slug(4);
export const bundle = (supplied: any = {}) => ({
    id: id(),
    hash: faker.random.alphaNumeric(255),
    name: bundleName(),
    tag: bundleTag(),
    description: faker.lorem.sentence(8),
    assets: [
        { path: "/index.html", mimeType: "text/html" },
        { path: "/js/index.js", mimeType: "application/js" },
        { path: "/css/index.css", mimeType: "text/css" },
    ],
    fallbackAssetPath: faker.random.arrayElement(["/index.html", "/404.html"]),
    fallbackStatusCode: faker.random.arrayElement([404, 200]),
    createdAt: faker.date.past(),
    ...supplied,
});
export const baseBundle = () =>
    pick(bundle(), ["id", "name", "tag", "createdAt"]);

export const times = (n: number, generator: () => any) =>
    range(n).map(generator);

// Entrypoints
const entrypointUrlMatcher = () =>
    `${faker.internet.domainName()}/${faker.hacker.noun()}/`;
export const entrypoint = (supplied: any = {}) => ({
    id: id(),
    appId: id(),
    urlMatcher: entrypointUrlMatcher(),
    bundleId: Math.random() > 0.5 ? id() : null,
    redirectTo: Math.random() > 0.5 ? faker.internet.url() : null,
    configuration: Math.random() > 0.5 ? { KEY: "VALUE" } : null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...supplied,
});

// Groups
export const group = (supplied: any = {}) => ({
    id: id(),
    name: lowerCase(faker.commerce.productName()).replace(/ /g, "-"),
    roles: times(3, () =>
        faker.random.arrayElement([
            "root",
            `app-manager:${appName()}`,
            `bundle-manager:${bundleName()}`,
            `entrypoint-manager:${entrypointUrlMatcher()}`,
        ])
    ),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...supplied,
});

// Operation logs
export const operationLog = () => ({
    id: id(),
    operation: faker.random.arrayElement([
        "apps:create",
        "apps:update",
        "apps:delete",
        "entrypoints:create",
        "entrypoints:update",
        "entrypoints:delete",
        "bundles:create",
        "bundles:delete",
    ]),
    parameters: {
        oldApp: { name: "oldApp" },
        newApp: { name: "newApp" },
    },
    performedBy: id(),
    performedAt: faker.date.past(),
});

// Users
export const user = (supplied: any = {}) => ({
    id: id(),
    idp: faker.internet.domainName(),
    idpId: id(),
    type: faker.random.arrayElement(["human", "machine"]),
    name: `${faker.name.firstName()} ${faker.name.lastName()}`,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    ...supplied,
});
export const userWithGroups = (supplied: any = {}) =>
    user({ groups: times(5, group), ...supplied });
