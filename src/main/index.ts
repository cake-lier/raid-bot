import { Telegraf } from "telegraf";
import { getConnectionString, SrvFormatOptions } from "./ConnectionOptions";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { constVoid, pipe } from "fp-ts/function";
import express from "express";
import { Storage } from "./Storage";
import { SubscriptionModel } from "./SubscriptionModel";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session";
import { Controller } from "./Controller";
import { UserModel } from "./UserModel";

const notInGroupError =
    "Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!";

const main = pipe(
    TE.Do,
    TE.bind("host", () =>
        TE.fromNullable("Missing db hostname env variable")(process.env["DB_HOST"]),
    ),
    TE.bind("username", () =>
        TE.fromNullable("Missing db username env variable")(process.env["DB_USERNAME"]),
    ),
    TE.bind("password", () =>
        TE.fromNullable("Missing db password env variable")(process.env["DB_PASSWORD"]),
    ),
    TE.bind("app", () => TE.fromNullable("Missing app name env variable")(process.env["APP_NAME"])),
    TE.bind("db", () => TE.fromNullable("Missing db name env variable")(process.env["DB_NAME"])),
    TE.let("storageUrl", ({ host, username, password, app, db }) =>
        SrvFormatOptions(username, password, host, db, app),
    ),
    TE.bind("storage", ({ storageUrl }) => TE.tryCatch(() => Storage.create(storageUrl), String)),
    TE.let("subscriptionModel", ({ storage }) => new SubscriptionModel(storage)),
    TE.bind("token", () =>
        TE.fromNullable("Missing bot token env variable")(process.env["BOT_TOKEN"]),
    ),
    TE.bind("botMiddleware", ({ storage, subscriptionModel, token }) =>
        TE.tryCatch(() => {
            const bot = new Telegraf(token);
            bot.start((c) =>
                c.reply(
                    "Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO. " +
                        "Usa /help per sapere di più sul suo funzionamento.",
                ),
            );
            bot.help((c) =>
                c.replyWithMarkdownV2(
                    "Comandi disponibili:\n" +
                        "• /in: usalo una sola volta per ricevere le notifiche anche con il gruppo in silenzioso\n" +
                        "• /out: usalo una sola volta per *NON* ricevere più le notifiche anche con il gruppo in silezioso\n" +
                        "• /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il " +
                        "nome del Pokémon e il tempo rimanente\n\n" +
                        "Questo bot funziona solamente per i gruppi Telegram, non per chat private\\.",
                ),
            );
            bot.command("in", async (c) => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply(notInGroupError);
                }
                const username = c.from.username ?? c.from.first_name;
                if (
                    await subscriptionModel.insertSubscription({
                        userId: c.from.id,
                        username,
                        chatId: c.chat.id,
                    })
                ) {
                    return await c.reply(`Ho inserito ${username} tra chi notificare!`);
                }
                return Promise.resolve();
            });
            bot.command("out", async (c) => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply(notInGroupError);
                }
                if (
                    await subscriptionModel.deleteSubscription({
                        userId: c.from.id,
                        chatId: c.chat.id,
                    })
                ) {
                    return await c.reply(
                        `Ho rimosso ${c.from.username ?? c.from.first_name} da chi notificare!`,
                    );
                }
                return Promise.resolve();
            });
            bot.command("raid", async (c) => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply(notInGroupError);
                }
                return await pipe(
                    E.Do,
                    E.bind("p", () => E.fromNullable("Al messaggio manca il pokémon!")(c.args[0])),
                    E.bind("m", () =>
                        E.fromNullable("Al messaggio manca il numero di minuti!")(c.args[1]),
                    ),
                    E.map(
                        ({ p, m }) =>
                            `Un nuovo raid per ${p} è iniziato e mancano ${m} minuti alla fine!\n`,
                    ),
                    E.fold(
                        (e) => c.reply(e),
                        (f) =>
                            pipe(
                                TE.tryCatch(
                                    () => subscriptionModel.getSubscriptionsForChat(c.chat.id),
                                    String,
                                ),
                                TE.map((us) =>
                                    f.concat(...us.map((u) => `@${u.username}\n`), "!!!"),
                                ),
                                TE.foldW(
                                    (e) => () => Promise.reject(new Error(e)),
                                    (r) => () => c.reply(r),
                                ),
                            )(),
                    ),
                );
            });
            process.once("SIGINT", () => {
                bot.stop("SIGINT");
                storage.cleanUp().catch((e: unknown) => {
                    console.error(e);
                });
            });
            process.once("SIGTERM", () => {
                bot.stop("SIGTERM");
                storage.cleanUp().catch((e: unknown) => {
                    console.error(e);
                });
            });
            return bot.createWebhook({
                domain: "https://raid-bot-3vzy.onrender.com",
                path: "/webhook",
            });
        }, String),
    ),
    TE.bind("sessionSecret", () =>
        TE.fromNullable("Missing session secret env variable")(process.env["SESSION_SECRET"]),
    ),
    TE.flatMap(({ botMiddleware, subscriptionModel, storage, storageUrl, sessionSecret }) =>
        TE.tryCatch(() => {
            const app = express();
            const MongoDBStore = connectMongoDBSession(session);
            return new Promise<void>((resolve) => {
                app.use(express.json())
                    .use(express.static("out"))
                    .use((req, res, next) => {
                        botMiddleware(req, res, next).catch((e: unknown) => {
                            console.error(e);
                        });
                    })
                    .use(
                        session({
                            secret: sessionSecret,
                            resave: true,
                            saveUninitialized: true,
                            unset: "destroy",
                            store: new MongoDBStore({
                                uri: getConnectionString(storageUrl),
                                collection: "sessions",
                            }),
                            name: "cookie",
                            cookie: {
                                path: "/",
                                httpOnly: true,
                                sameSite: "strict",
                                secure: "auto",
                            },
                        }),
                    );
                new Controller(subscriptionModel, new UserModel(storage)).registerRoutes(app);
                return app
                    .get("*", (_, res) => {
                        res.sendFile("out/404.html", { root: process.cwd() });
                    })
                    .listen(10_000, () => {
                        resolve();
                    });
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
