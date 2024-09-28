import { Context, NarrowedContext, Telegraf } from "telegraf";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Model } from "./Model";
import { Storage } from "./Storage";
import { Message, Update } from "telegraf/types";
import { Types } from "telegraf";

const notInGroupError =
    "Mi dispiace, questa funzione è disponibile solamente nei gruppi e nei supergruppi!";

export default class Controller {
    private readonly model: Model;

    public constructor(
        storage: Storage,
        private readonly bot: Telegraf,
    ) {
        this.model = new Model(storage);
    }

    public registerRoutes() {
        this.bot.start(this.start);
        this.bot.help(this.help);
        this.bot.command("in", this.in);
        this.bot.command("out", this.out);
        this.bot.command("raid", this.raid);
    }

    private start = async (
        ctx: NarrowedContext<
            Context,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        > &
            Types.CommandContextExtn,
    ): Promise<unknown> => {
        return await ctx.reply(
            "Ciao! Questo è un bot per la generazione automatica di notifiche per i raid su Pokémon GO. " +
                "Usa /help per sapere di più sul suo funzionamento.",
        );
    };

    private help = async (
        ctx: NarrowedContext<
            Context,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        > &
            Types.CommandContextExtn,
    ): Promise<unknown> => {
        return await ctx.replyWithMarkdownV2(
            "Comandi disponibili:\n" +
                "• /in: usalo una sola volta per ricevere le notifiche anche con il gruppo in silenzioso\n" +
                "• /out: usalo una sola volta per *NON* ricevere più le notifiche anche con il gruppo in silezioso\n" +
                "• /raid: usalo per generare una notifica automatica per un raid specificando, nell'ordine, il " +
                "nome del Pokémon e il tempo rimanente\n\n" +
                "Questo bot funziona solamente per i gruppi Telegram, non per chat private\\.",
        );
    };

    private in = async (
        ctx: NarrowedContext<
            Context,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        > &
            Types.CommandContextExtn,
    ): Promise<unknown> => {
        if (!["group", "supergroup"].includes(ctx.chat.type)) {
            return await ctx.reply(notInGroupError);
        }
        const name = ctx.from.username ?? ctx.from.first_name;
        if (
            await this.model.insertSubscription({
                userId: ctx.from.id,
                username: name,
                chatId: ctx.chat.id,
            })
        ) {
            return await ctx.reply(`Ho inserito ${name} tra chi notificare!`);
        }
        return Promise.resolve();
    };

    private out = async (
        ctx: NarrowedContext<
            Context,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        > &
            Types.CommandContextExtn,
    ): Promise<unknown> => {
        if (!["group", "supergroup"].includes(ctx.chat.type)) {
            return await ctx.reply(notInGroupError);
        }
        if (await this.model.deleteSubscription(ctx.from.id, ctx.chat.id)) {
            return await ctx.reply(
                `Ho rimosso ${ctx.from.username ?? ctx.from.first_name} da chi notificare!`,
            );
        }
        return Promise.resolve();
    };

    private raid = async (
        ctx: NarrowedContext<
            Context,
            {
                message: Update.New & Update.NonChannel & Message.TextMessage;
                update_id: number;
            }
        > &
            Types.CommandContextExtn,
    ) => {
        if (!["group", "supergroup"].includes(ctx.chat.type)) {
            return await ctx.reply(notInGroupError);
        }
        return await pipe(
            E.Do,
            E.bind("p", () => E.fromNullable("Al messaggio manca il pokémon!")(ctx.args[0])),
            E.bind("m", () =>
                E.fromNullable("Al messaggio manca il numero di minuti!")(ctx.args[1]),
            ),
            E.map(
                ({ p, m }) =>
                    `Un nuovo raid per ${p} è iniziato e mancano ${m} minuti alla fine!\n`,
            ),
            E.fold(
                (e) => ctx.reply(e),
                (f) =>
                    pipe(
                        TE.tryCatch(
                            () => this.model.getAllSubscriptionsForChat(ctx.chat.id),
                            String,
                        ),
                        TE.map((us) => f.concat(...us.map((u) => `@${u.username}\n`), "!!!")),
                        TE.foldW(
                            (e) => () => Promise.reject(new Error(e)),
                            (r) => () => ctx.reply(r),
                        ),
                    )(),
            ),
        );
    };
}
