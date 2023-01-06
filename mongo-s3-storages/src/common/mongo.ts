import { WithId } from "mongodb";

export function withoutId<T>(objectWithId: WithId<T>): T;
export function withoutId<T>(objectWithId: WithId<T> | null): T | null;
export function withoutId<T>(
    objectWithId: WithId<T> | undefined
): T | undefined;
export function withoutId<T>(
    objectWithId: WithId<T> | null | undefined
): T | null | undefined {
    if (objectWithId === undefined) return undefined;
    if (objectWithId === null) return null;

    const { _id, ...object } = objectWithId;
    return object as unknown as T;
}
