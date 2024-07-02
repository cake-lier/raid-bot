import { Telegraf } from "telegraf";
import { Model } from "./model";

async function main() {
    const dbName = process.env["DB_NAME"]!;
    const botToken = process.env["BOT_TOKEN"]!;
    const model = await Model.create(
        process.env["DB_HOST"] ?? "localhost",
        Number.parseInt(process.env["DB_PORT"] ?? "27017"),
        process.env["USERNAME"] ?? "",
        process.env["PASSWORD"] ?? "",
        process.env["APP_NAME"] ?? "",
        dbName
    );
    const botApi = new Telegraf(botToken);
    botApi.start(c => c.reply(
        `Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO.
        Usa /help per sapere di più sul suo funzionamento.`
    ));
    botApi.help(c => c.replyWithMarkdownV2(
        `Comandi disponibili:
        * /in: usalo una sola volta per ricere le notifiche anche con il gruppo in silenzioso
        * /out: usalo una sola volta per **NON** ricevere più le notifiche anche con il gruppo in silezioso
        * /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il nome del Pokémon e il tempo rimanente`
    ));
    botApi.command("in", async c => {
        const name = c.from.username ?? c.from.first_name;
        if (await model.insertUser(c.from.id, name, c.chat.id) > 0) {
            c.reply(`Ho inserito ${name} tra chi notificare!`);
        }
    });
    botApi.command("out", async c => {
        if (await model.deleteUser(c.from.id, c.chat.id) > 0) {
            c.reply(`Ho rimosso ${c.from.username ?? c.from.first_name} da chi notificare!`);
        }
    });
    botApi.command("raid", async c => {
        const [ pokemonName, minutes ]: string[] = c.args;
        if (!pokemonName || !minutes) {
            c.reply("Al messaggio manca qualcosa!");
            return;
        }
        c.reply(
            `Un nuovo raid per ${pokemonName} è iniziato e mancano ${minutes} minuti alla fine!\n`.concat(
                ...(await model.getAllUsers(c.chat.id)).map(u => `@${u}\n`),
                "!!!"
            )
        );
    });
    await botApi.launch({
        webhook: {
            domain: "https://raid-bot-3vzy.onrender.com",
            port: 10_000
        }
    });
    process.once("SIGINT", async () => {
        botApi.stop("SIGINT");
        await model.cleanUp();
    });
    process.once("SIGTERM", async () => {
        botApi.stop("SIGTERM");
        await model.cleanUp();
    });
}

main().then(console.log).catch(console.error);