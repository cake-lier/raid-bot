import { Telegraf } from "telegraf";
import { SrvFormatOptions } from "./ConnectionOptions";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/function";
import { Storage } from "./Storage";
import Controller from "./Controller";
import * as fs from "fs";

const main = pipe(
    TE.Do,
    TE.bind("h", () => TE.fromNullable("Missing db hostname env variable")(process.env["DB_HOST"])),
    TE.bind("u", () =>
        TE.fromNullable("Missing db username env variable")(process.env["DB_USERNAME"]),
    ),
    TE.bind("p", () =>
        TE.fromNullable("Missing db password env variable")(process.env["DB_PASSWORD"]),
    ),
    TE.bind("a", () => TE.fromNullable("Missing app name env variable")(process.env["APP_NAME"])),
    TE.bind("d", () => TE.fromNullable("Missing db name env variable")(process.env["DB_NAME"])),
    TE.bind("s", ({ h, u, p, a, d }) =>
        TE.tryCatch(() => Storage.create(SrvFormatOptions(u, p, h, d, a)), String),
    ),
    TE.bind("t", () => TE.fromNullable("Missing bot token env variable")(process.env["BOT_TOKEN"])),
    TE.let("b", ({ t }) => new Telegraf(t)),
    TE.bind("l", () =>
        TE.tryCatch(
            () =>
                new Promise<readonly string[]>((resolve, reject) => {
                    fs.readFile("names.txt", (e, d) => {
                        if (e) {
                            reject(e);
                        } else {
                            resolve(d.toString().split("\n"));
                        }
                    });
                }),
            String,
        ),
    ),
    TE.flatMap(({ s, b, l }) =>
        TE.tryCatch(() => {
            new Controller(s, b, l).registerRoutes();
            process.once("SIGINT", () => {
                b.stop("SIGINT");
                s.cleanUp().catch((e: unknown) => {
                    console.error(e);
                });
            });
            process.once("SIGTERM", () => {
                b.stop("SIGTERM");
                s.cleanUp().catch((e: unknown) => {
                    console.error(e);
                });
            });
            return b.launch({
                webhook: {
                    domain: "https://raid-bot-3vzy.onrender.com",
                    port: 10_000,
                },
            });
        }, String),
    ),
);

main()
    .then((r) => {
        E.fold((e) => {
            console.error(e);
        }, constVoid)(r);
    })
    .catch((e: unknown) => {
        console.error(e);
    });
