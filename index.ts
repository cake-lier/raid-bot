import { Telegraf } from "telegraf";
import Model from "./model";

const model = new Model(process.env.DB_HOST, Number.parseInt(process.env.DB_PORT), process.env.USERNAME, process.env.PASSWORD, process.env.DB_NAME);
const botApi = new Telegraf(process.env.BOT_TOKEN);

botApi.start(_ => _.reply(
    `Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO.
    Usa /help per sapere di più sul suo funzionamento.`
));
botApi.help(_ => _.replyWithMarkdownV2(
    `Comandi disponibili:
    * /in: usalo una sola volta per ricere le notifiche anche con il gruppo in silenzioso
    * /out: usalo una sola volta per **NON** ricevere più le notifiche anche con il gruppo in silezioso
    * /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il nome del Pokémon e il tempo rimanente`
));
botApi.command("in", async _ => {
    if (await model.insertUser(_.from.id, _.from.username, _.chat.id) > 0) {
        _.reply(`Ho inserito ${_.from.username} tra chi notificare!`);
    }
});
botApi.command("out", async _ => {
    if (await model.deleteUser(_.from.id, _.chat.id) > 0) {
        _.reply(`Ho rimosso ${_.from.username} da chi notificare!`);
    }
});
botApi.command("raid", async _ => {
    const [ pokemonName, minutes ]: string[] = _.args;
    if (!pokemonName || !minutes) {
        _.reply("Al messaggio manca qualcosa!");
        return;
    }
    _.reply(
        `Un nuovo raid per ${pokemonName} è iniziato e mancano ${minutes} minuti alla fine!\n`.concat(
            ...(await model.getAllUsers(_.chat.id)).map(_ => `@${_}\n`),
            "!!!"
        )
    );
});
botApi.launch();

process.once("SIGINT", () => botApi.stop("SIGINT"));
process.once("SIGTERM", () => botApi.stop("SIGTERM"));
