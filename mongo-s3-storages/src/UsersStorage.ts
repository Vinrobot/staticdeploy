import {
    IGroup,
    IUser,
    IUsersStorage,
    IUserWithGroups,
    IUserWithRoles,
    UserType,
} from "@staticdeploy/core";
import { Db, Collection } from "mongodb";

import convertErrors from "./common/convertErrors";
import tables from "./common/tables";

interface IUserWithGroupIds extends IUser {
    groupsIds: string[];
}

@convertErrors
export default class UsersStorage implements IUsersStorage {
    private collection: Collection<IUserWithGroupIds>;
    private collectionGroup: Collection<IGroup>;

    constructor(private mongo: Db) {
        this.collection = this.mongo.collection<IUserWithGroupIds>(
            tables.users
        );
        this.collectionGroup = this.mongo.collection<IGroup>(tables.groups);
    }

    async findOne(id: string): Promise<IUser | null> {
        return this.collection.findOne(
            { id },
            {
                projection: { groupsIds: 0 },
            }
        );
    }

    async findOneWithGroups(id: string): Promise<IUserWithGroups | null> {
        const mongoUser = await this.collection.findOne({ id });
        if (!mongoUser) return null;
        const { groupsIds, ...user } = mongoUser;
        const groups = await this.collectionGroup
            .find({
                id: { $in: groupsIds },
            })
            .toArray();
        return { ...user, groups };
    }

    async findOneWithRolesByIdpAndIdpId(
        idp: string,
        idpId: string
    ): Promise<IUserWithRoles | null> {
        const mongoUser = await this.collection.findOne({ idp, idpId });
        if (!mongoUser) {
            return null;
        }
        const { groupsIds, ...user } = mongoUser;
        const groupsRoles = await this.collectionGroup
            .find(
                {
                    id: { $in: groupsIds },
                },
                {
                    projection: { roles: 1 },
                }
            )
            .toArray();
        const roles = groupsRoles.flatMap((group) => group.roles);
        return { ...user, roles };
    }

    async findMany(): Promise<IUser[]> {
        return this.collection
            .find(
                {},
                {
                    projection: { groupsIds: 0 },
                }
            )
            .toArray();
    }

    async oneExistsWithIdpAndIdpId(
        idp: string,
        idpId: string
    ): Promise<boolean> {
        const user = await this.collection.findOne(
            { idp, idpId },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return user !== null;
    }

    async anyExistsWithGroup(groupId: string): Promise<boolean> {
        const user = await this.collection.findOne(
            {
                groupsIds: { $all: [groupId] },
            },
            {
                projection: { _id: 1, id: 1 },
            }
        );
        return user !== null;
    }

    async createOne(toBeCreatedUser: {
        id: string;
        idp: string;
        idpId: string;
        type: UserType;
        name: string;
        groupsIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }): Promise<IUser> {
        const result = await this.collection.insertOne(toBeCreatedUser);
        if (!result.acknowledged) {
            throw new Error("Unable to insert");
        }
        return toBeCreatedUser;
    }

    async updateOne(
        id: string,
        patch: {
            name?: string;
            groupsIds?: string[];
            updatedAt: Date;
        }
    ): Promise<IUser> {
        const result = await this.collection.updateOne({ id }, { $set: patch });
        if (!result.acknowledged || result.matchedCount !== 1) {
            throw new Error("Unable to update");
        }
        return (await this.findOne(id))!;
    }

    async deleteOne(id: string): Promise<void> {
        const result = await this.collection.deleteOne({ id });
        if (!result.acknowledged || result.deletedCount !== 1) {
            throw new Error("Unable to delete");
        }
    }
}
