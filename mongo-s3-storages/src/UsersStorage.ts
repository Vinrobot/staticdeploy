import {
    IGroup,
    IUser,
    IUsersStorage,
    IUserWithGroups,
    IUserWithRoles,
    UserType,
} from "@staticdeploy/core";

export default class UsersStorage implements IUsersStorage {
    async findOne(id: string): Promise<IUser | null> {
        throw new Error("Not implemented");
    }

    async findOneWithGroups(id: string): Promise<IUserWithGroups | null> {
        throw new Error("Not implemented");
    }

    async findOneWithRolesByIdpAndIdpId(
        idp: string,
        idpId: string
    ): Promise<IUserWithRoles | null> {
        throw new Error("Not implemented");
    }

    async findMany(): Promise<IUser[]> {
        throw new Error("Not implemented");
    }

    async oneExistsWithIdpAndIdpId(
        idp: string,
        idpId: string
    ): Promise<boolean> {
        throw new Error("Not implemented");
    }

    async anyExistsWithGroup(groupId: string): Promise<boolean> {
        throw new Error("Not implemented");
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
        throw new Error("Not implemented");
    }

    async updateOne(
        id: string,
        patch: {
            name?: string;
            groupsIds?: string[];
            updatedAt: Date;
        }
    ): Promise<IUser> {
        throw new Error("Not implemented");
    }

    async deleteOne(id: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
