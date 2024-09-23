import { describe, expect, it } from "vitest";
import {
    getConnectionString,
    SimpleFormatOptions,
    SrvFormatOptions,
} from "../main/ConnectionOptions";
import * as O from "fp-ts/Option";

/* eslint sonarjs/no-duplicate-string: 0 */
describe("A SRV connection string", () => {
    describe("when correctly created", () => {
        it("should be valid", () => {
            expect(
                getConnectionString(
                    SrvFormatOptions("username", "password", "hostname", "db", "app"),
                ),
            ).toBe(
                "mongodb+srv://username:password@hostname/db?retryWrites=true&w=majority&appName=app",
            );
        });
    });
});

describe("A simple connection string", () => {
    describe("when created with only the host and the database name", () => {
        it("should be valid", () => {
            expect(
                getConnectionString(SimpleFormatOptions(O.none, O.none, "hostname", O.none, "db")),
            ).toBe("mongodb://hostname/db?directConnection=true");
        });
    });

    describe("when created with only the host, the port and the database name", () => {
        it("should be valid", () => {
            expect(
                getConnectionString(
                    SimpleFormatOptions(O.none, O.none, "hostname", O.some(3000), "db"),
                ),
            ).toBe("mongodb://hostname:3000/db?directConnection=true");
        });
    });

    describe("when created with the username, the host, the port and the database name", () => {
        it("should be valid", () => {
            expect(
                getConnectionString(
                    SimpleFormatOptions(O.some("username"), O.none, "hostname", O.none, "db"),
                ),
            ).toBe("mongodb://username@hostname/db?directConnection=true");
        });
    });

    describe("when created with the password but not the username", () => {
        it("should be valid but ignore the password", () => {
            expect(
                getConnectionString(
                    SimpleFormatOptions(O.none, O.some("password"), "hostname", O.none, "db"),
                ),
            ).toBe("mongodb://hostname/db?directConnection=true");
        });
    });

    describe("when created with username and password, the host, the port and the database name", () => {
        it("should be valid but ignore the password", () => {
            expect(
                getConnectionString(
                    SimpleFormatOptions(
                        O.some("username"),
                        O.some("password"),
                        "hostname",
                        O.some(3000),
                        "db",
                    ),
                ),
            ).toBe("mongodb://username:password@hostname:3000/db?directConnection=true");
        });
    });
});
