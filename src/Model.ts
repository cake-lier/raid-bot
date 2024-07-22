import { Db, MongoClient } from "mongodb";
import {ConnectionOptions, getConnectionString} from "./ConnectionOptions";

export class Model {
    private readonly client: MongoClient;
    private readonly db: Db;

    private constructor(client: MongoClient, db: Db) {
        this.client = client;
        this.db = db;
    }

    public static async create(connectionOptions: ConnectionOptions): Promise<Model> {
        const client = new MongoClient(getConnectionString(connectionOptions));
        await client.connect();
        const db = client.db(connectionOptions.dbName);
        await db.createIndex("subscriptions",  { "userId": 1, "chatId": 1 }, { unique: true });
        return new Model(client, db);
    }

    public async insertUser(userId: number, username: string, chatId: number): Promise<boolean> {
        try {
            return await this.db.collection("subscriptions").insertOne({
                userId,
                username,
                chatId
            }).then(() => true);
        } catch {}
        return Promise.resolve(false);
    }

    public async deleteUser(userId: number, chatId: number): Promise<boolean> {
        try {
            return await this.db.collection("subscriptions")
                                .deleteOne({userId, chatId})
                                .then(r => r.deletedCount > 0);
        } catch {}
        return Promise.resolve(false);
    }

    public async getAllUsers(chatId: number): Promise<readonly string[]> {
        const documents = await this.db.collection("subscriptions")
                                       .find({ chatId })
                                       .project({ "username": 1, "_id": 0 })
                                       .toArray();
        return documents.map(d => d["username"]);
    }

    public async cleanUp(): Promise<void> {
        return await this.client.close();
    }
}
