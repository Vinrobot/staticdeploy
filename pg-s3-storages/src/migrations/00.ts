import { Knex } from "knex";

import tables from "../common/tables";

/*
 * Initial setup, creating tables for apps, bundles, entrypoints, and
 * operationLogs
 */
export function up(knex: Knex) {
    return knex.schema
        .createTable(tables.apps, (table) => {
            table.string("id").primary();
            table.string("name").unique().notNullable();
            table.json("defaultConfiguration").notNullable();
            table.timestamp("createdAt").notNullable();
            table.timestamp("updatedAt").notNullable();
        })
        .createTable(tables.bundles, (table) => {
            table.string("id").primary();
            table.string("name").notNullable();
            table.string("tag").notNullable();
            table.index(["name", "tag"]);
            table.text("description").notNullable();
            table.string("hash").notNullable();
            table.json("assets").notNullable();
            table.string("fallbackAssetPath").notNullable();
            table.integer("fallbackStatusCode").notNullable();
            table.timestamp("createdAt").notNullable();
        })
        .createTable(tables.entrypoints, (table) => {
            table.string("id").primary();
            table.string("urlMatcher").unique().notNullable();
            table
                .string("appId")
                .notNullable()
                .index()
                .references("id")
                .inTable(tables.apps);
            table
                .string("bundleId")
                .index()
                .references("id")
                .inTable(tables.bundles);
            table.string("redirectTo");
            table.json("configuration");
            table.timestamp("createdAt").notNullable();
            table.timestamp("updatedAt").notNullable();
        })
        .createTable(tables.operationLogs, (table) => {
            table.string("id").primary();
            table.string("operation").notNullable();
            table.json("parameters").notNullable();
            table.string("performedBy").notNullable();
            table.timestamp("performedAt").notNullable();
        });
}

export function down() {
    // Knex migrations require a down function, but we're not interested in
    // providing one
}
