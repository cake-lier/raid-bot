import { it, describe, expect, beforeAll, afterAll } from "vitest";
import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import { Model } from "../main/Model";
import * as O from "fp-ts/Option";
import { SimpleFormatOptions } from "../main/ConnectionOptions";
import { Storage } from "../main/Storage";

let mongoDb: StartedMongoDBContainer | undefined = undefined;
let storage: Storage | undefined = undefined;
let model: Model | undefined = undefined;

beforeAll(async () => {
    mongoDb = await new MongoDBContainer("mongo:5.0.28").start();
    storage = await Storage.create(
        SimpleFormatOptions(
            O.none,
            O.none,
            "localhost",
            O.fromNullable(mongoDb.getFirstMappedPort()),
            "raid-bot",
        ),
    );
    model = new Model(storage);
}, 30_000);

/* eslint @typescript-eslint/no-non-null-assertion: 0 */
describe("A model", () => {
    describe("when inserting a new user", () => {
        it("should add it to the database", async () => {
            expect(
                await model!.insertSubscription({ userId: 42, username: "cake_lier", chatId: 42 }),
            ).toBe(true);
            expect(await model!.getAllSubscriptionsForChat(42)).toStrictEqual([{ userId: 42, username: "cake_lier", chatId: 42 }]);
            await model!.deleteSubscription(42, 42);
        });
    });

    describe("when inserting an already inserted user", () => {
        it("should not add it to the database", async () => {
            expect(
                await model!.insertSubscription({ userId: 42, username: "cake_lier", chatId: 42 }),
            ).toBe(true);
            expect(
                await model!.insertSubscription({ userId: 42, username: "cake_lier", chatId: 42 }),
            ).toBe(false);
            await model!.deleteSubscription(42, 42);
        });
    });

    describe("when deleting an existing user", () => {
        it("should remove it from the database", async () => {
            await model!.insertSubscription({ userId: 42, username: "cake_lier", chatId: 42 });
            expect(await model!.deleteSubscription(42, 42)).toBe(true);
            expect(await model!.getAllSubscriptionsForChat(42)).toStrictEqual([]);
        });
    });

    describe("when deleting an already deleted user", () => {
        it("should not remove it from the database", async () => {
            await model!.insertSubscription({ userId: 42, username: "cake_lier", chatId: 42 });
            await model!.deleteSubscription(42, 42);
            expect(await model!.deleteSubscription(42, 42)).toBe(false);
        });
    });
}, 30_000);

afterAll(async () => {
    await storage?.cleanUp();
    await mongoDb?.stop();
});
