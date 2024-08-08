import { Db, MongoClient } from "mongodb";
import { ConnectionOptions, getConnectionString } from "./ConnectionOptions";

export class Storage {
    private constructor(
        private readonly client: MongoClient,
        private readonly db: Db,
    ) {}

    public static async create(connectionOptions: ConnectionOptions): Promise<Storage> {
        const client = new MongoClient(getConnectionString(connectionOptions));
        await client.connect();
        const db = client.db(connectionOptions.dbName);
        await db.createIndex("subscriptions", { userId: 1, chatId: 1 }, { unique: true });
        return new Storage(client, db);
    }

    public getDb(): Db {
        return this.db;
    }

    public async cleanUp(): Promise<void> {
        await this.client.close();
    }
}
