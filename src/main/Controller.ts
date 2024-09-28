import { Context, NarrowedContext, Telegraf } from "telegraf";
import { Model } from "./Model";
import { Storage } from "./Storage";
import { Message, Update } from "telegraf/types";
import { Types } from "telegraf";
import Spellchecker from "./Spellchecker";

type UpdateContext = NarrowedContext<
    Context,
    {
        message: Update.New & Update.NonChannel & Message.TextMessage;
        update_id: number;
    }
> &
    Types.CommandContextExtn;

export default class Controller {
    private readonly model: Model;
    private readonly spellchecker: Spellchecker;

    public constructor(
        storage: Storage,
        private readonly bot: Telegraf,
        namesList: readonly string[],
    ) {
        this.model = new Model(storage);
        this.spellchecker = new Spellchecker(namesList);
    }

    public registerRoutes() {
        this.bot.start(this.start);
        this.bot.help(this.help);
        this.bot.command("in", (c) => this.checkIfInGroup(c, this.in));
        this.bot.command("out", (c) => this.checkIfInGroup(c, this.out));
        this.bot.command("raid", (c) => this.checkIfInGroup(c, this.raid));
    }

    private start = async (ctx: UpdateContext): Promise<unknown> => {
        return await ctx.reply(
            "Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO. " +
                "Usa /help per sapere di più sul suo funzionamento.",
        );
    };

    private help = async (ctx: UpdateContext): Promise<unknown> => {
        return await ctx.replyWithMarkdownV2(
            "Comandi disponibili:\n" +
                "• /in: usalo una sola volta per ricevere le notifiche anche con il gruppo in silenzioso\n" +
                "• /out: usalo una sola volta per *NON* ricevere più le notifiche anche con il gruppo in silezioso\n" +
                "• /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il " +
                "nome del Pokémon e il tempo rimanente\n\n" +
                "Questo bot funziona solamente per i gruppi Telegram, non per chat private\\.",
        );
    };

    private checkIfInGroup = async (
        ctx: UpdateContext,
        next: (ctx: UpdateContext) => Promise<unknown>,
    ): Promise<unknown> => {
        if (ctx.chat.type === "private") {
            return await ctx.reply(
                "Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!",
            );
        }
        return next(ctx);
    };

    private in = async (ctx: UpdateContext): Promise<unknown> => {
        if (!ctx.from.username) {
            return await ctx.reply(
                "Mi dispiace, ma questo bot non funziona se l'utente non possiede uno username!",
            );
        }
        if (
            await this.model.insertSubscription({
                userId: ctx.from.id,
                username: ctx.from.username,
                chatId: ctx.chat.id,
            })
        ) {
            return await ctx.reply(`Ho inserito ${ctx.from.username} tra chi notificare!`);
        }
        return Promise.resolve();
    };

    private out = async (ctx: UpdateContext): Promise<unknown> => {
        if (await this.model.deleteSubscription(ctx.from.id, ctx.chat.id)) {
            return await ctx.reply(
                `Ho rimosso ${ctx.from.username ?? ctx.from.first_name} da chi notificare!`,
            );
        }
        return Promise.resolve();
    };

    private sendRaidMessage = async (
        ctx: UpdateContext,
        minutes: number,
        rest: readonly string[],
    ): Promise<unknown> => {
        const pokemonName = this.spellchecker.spellcheck(rest.join(" "));
        try {
            const users = await this.model.getAllSubscriptionsForChat(ctx.chat.id);
            return await ctx.reply(
                `Un nuovo raid per ${pokemonName} è iniziato e mancano ${minutes.toString()} minuti alla fine!\n`.concat(
                    ...users.map((u) => `@${u.username}\n`),
                    "!!!",
                ),
            );
        } catch (e: unknown) {
            console.log(e);
        }
        return await ctx.reply(
            "Mi dispiace, si è verificato un errore, non posso eseguire la richiesta!",
        );
    };

    private raid = async (ctx: UpdateContext): Promise<unknown> => {
        const commandArguments = /^\/\S+\s(.*)$/.exec(ctx.msg.text)?.[1]?.split(/\s/);
        if (!commandArguments || commandArguments.length < 2) {
            return await ctx.reply(
                "Mi dispiace, non sono state passate abbastanza informazioni al comando!",
            );
        }
        const lastArgument = commandArguments[commandArguments.length - 1];
        if (lastArgument && !isNaN(+lastArgument)) {
            return this.sendRaidMessage(
                ctx,
                Number(lastArgument),
                commandArguments.slice(0, commandArguments.length - 1),
            );
        }
        const firstArgument = commandArguments[0];
        if (!firstArgument || isNaN(+firstArgument)) {
            return this.sendRaidMessage(ctx, Number(firstArgument), commandArguments.slice(1));
        }
        return await ctx.reply("Mi dispiace, al messaggio mancano i minuti!");
    };
}
