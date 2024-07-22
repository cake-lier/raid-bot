import {Telegraf} from "telegraf";
import {Model} from "./Model";
import {SrvFormatOptions} from "./ConnectionOptions";
import * as TE from "fp-ts/TaskEither";
import {pipe} from "fp-ts/function";

const main =
    pipe(
        TE.Do,
        TE.bind("h", () => TE.fromNullable("Missing db hostname env variable")(process.env["DB_HOST"])),
        TE.bind("u", () => TE.fromNullable("Missing db username env variable")(process.env["DB_USERNAME"])),
        TE.bind("p", () => TE.fromNullable("Missing db password env variable")(process.env["DB_PASSWORD"])),
        TE.bind("a", () => TE.fromNullable("Missing app name env variable")(process.env["APP_NAME"])),
        TE.bind("d", () => TE.fromNullable("Missing db name env variable")(process.env["DB_NAME"])),
        TE.bind("m", ({ h, u, p, a, d }) => TE.tryCatch(() => Model.create(SrvFormatOptions(h, u, p, a, d)), String)),
        TE.bind("t", () => TE.fromNullable("Missing bot token env variable")(process.env["BOT_TOKEN"])),
        TE.let("b", ({ t }) => new Telegraf(t)),
        TE.flatMap( ({ m, b }) => TE.tryCatch( () => {
            b.start(c => c.reply(
                "Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO. "
                + "Usa /help per sapere di più sul suo funzionamento."
            ));
            b.help(c => c.replyWithMarkdownV2(
                "Comandi disponibili:\n"
                + "• /in: usalo una sola volta per ricevere le notifiche anche con il gruppo in silenzioso\n"
                + "• /out: usalo una sola volta per *NON* ricevere più le notifiche anche con il gruppo in silezioso\n"
                + "• /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il nome del Pokémon e il tempo rimanente\n\n"
                + "Questo bot funziona solamente per i gruppi Telegram, non per chat private\\."
            ));
            b.command("in", async c => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply("Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!");
                }
                const name = c.from.username ?? c.from.first_name;
                if (await m.insertUser(c.from.id, name, c.chat.id)) {
                    return await c.reply(`Ho inserito ${name} tra chi notificare!`);
                }
                return Promise.resolve();
            });
            b.command("out", async c => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply("Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!");
                }
                if (await m.deleteUser(c.from.id, c.chat.id)) {
                    return await c.reply(`Ho rimosso ${c.from.username ?? c.from.first_name} da chi notificare!`);
                }
                return Promise.resolve();
            });
            b.command("raid", async c => {
                if (!["group", "supergroup"].includes(c.chat.type)) {
                    return await c.reply("Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!");
                }
                const [ pokemonName, minutes ] = c.args;
                if (!pokemonName || !minutes) {
                    return await c.reply("Al messaggio manca qualcosa!");
                }
                return await c.reply(
                    `Un nuovo raid per ${pokemonName} è iniziato e mancano ${minutes} minuti alla fine!\n`.concat(
                        ...(await m.getAllUsers(c.chat.id)).map(u => `@${u}\n`),
                        "!!!"
                    )
                );
            });
            process.once("SIGINT", () => {
                b.stop("SIGINT");
                m.cleanUp().catch((e: unknown) => { console.error(e) });
            });
            process.once("SIGTERM", () => {
                b.stop("SIGTERM");
                m.cleanUp().catch((e: unknown) => { console.error(e) });
            });
            return b.launch({
                webhook: {
                    domain: "https://raid-bot-3vzy.onrender.com",
                    port: 10_000
                }
            });
        }, String))
    );

main().then(() => { console.log("Ready") }).catch((e: unknown) => { console.error(e) });
