import { it, describe, expect, beforeAll, afterAll } from "vitest";
import { MongoDBContainer, StartedMongoDBContainer } from "@testcontainers/mongodb";
import { Storage } from "../main/Storage";
import * as O from "fp-ts/Option";
import { SimpleFormatOptions } from "../main/ConnectionOptions";
import { SubscriptionModel } from "../main/SubscriptionModel";

let mongoDb: StartedMongoDBContainer | undefined = undefined;
let storage: Storage | undefined = undefined;
let model: SubscriptionModel | undefined = undefined;

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
    model = new SubscriptionModel(storage);
}, 30_000);

describe("A model", () => {
    const subscriptionId = { chatId: 42, userId: 42 };
    const subscription = { chatId: 42, username: "cake_lier", userId: 42 };

    describe("when inserting a new user", () => {
        it("should add it to the database", async () => {
            expect(await model?.insertSubscription(subscription)).toBe(true);
            expect(await model?.getSubscriptionsForChat(42)).toStrictEqual([subscription]);
            await model?.deleteSubscription(subscriptionId);
        });
    });

    describe("when inserting an already inserted user", () => {
        it("should not add it to the database", async () => {
            expect(await model?.insertSubscription(subscription)).toBe(true);
            expect(await model?.insertSubscription(subscription)).toBe(false);
            await model?.deleteSubscription(subscriptionId);
        });
    });

    describe("when deleting an existing user", () => {
        it("should remove it from the database", async () => {
            await model?.insertSubscription(subscription);
            expect(await model?.deleteSubscription(subscriptionId)).toBe(true);
            expect(await model?.getSubscriptionsForChat(42)).toStrictEqual([]);
        });
    });

    describe("when deleting an already deleted user", () => {
        it("should not remove it from the database", async () => {
            await model?.insertSubscription(subscription);
            await model?.deleteSubscription(subscriptionId);
            expect(await model?.deleteSubscription(subscriptionId)).toBe(false);
        });
    });
}, 30_000);

afterAll(async () => {
    await storage?.cleanUp();
    await mongoDb?.stop();
});
