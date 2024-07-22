import {it, describe, expect, beforeAll, afterAll} from 'vitest';
import {MongoDBContainer, StartedMongoDBContainer} from "@testcontainers/mongodb";
import {Model} from "./Model";
import * as O from "fp-ts/Option";
import {SimpleFormatOptions} from "./ConnectionOptions";

let mongoDb: StartedMongoDBContainer | undefined = undefined;
let model: Model | undefined = undefined;

beforeAll(async () => {
    mongoDb = await new MongoDBContainer("mongo:5.0.28").start();
    model = await Model.create(
        SimpleFormatOptions(O.none, O.none, "localhost", O.fromNullable(mongoDb.getFirstMappedPort()), "raid-bot")
    );
}, 30_000);

describe("A model", () => {
    describe("when inserting a new user", () => {
        it("should add it to the database", async () => {
            expect(await model?.insertUser(42, "cake_lier", 42)).toBe(true);
            expect(await model?.getAllUsers(42)).toStrictEqual(["cake_lier"]);
            await model?.deleteUser(42, 42);
        });
    });

    describe("when inserting an already inserted user", () => {
       it("should not add it to the database", async () => {
           expect(await model?.insertUser(42, "cake_lier", 42)).toBe(true);
           expect(await model?.insertUser(42, "cake_lier", 42)).toBe(false);
           await model?.deleteUser(42, 42);
       });
    });

    describe("when deleting an existing user", () => {
        it("should remove it from the database", async () => {
            await model?.insertUser(42, "cake_lier", 42);
            expect(await model?.deleteUser(42, 42)).toBe(true);
            expect(await model?.getAllUsers(42)).toStrictEqual([]);
        });
    })

    describe("when deleting an already deleted user", () => {
        it("should not remove it from the database", async () => {
            await model?.insertUser(42, "cake_lier", 42);
            await model?.deleteUser(42, 42);
            expect(await model?.deleteUser(42, 42)).toBe(false);
        });
    });
}, 30_000);

afterAll(async () => {
    await model?.cleanUp();
    await mongoDb?.stop();
});