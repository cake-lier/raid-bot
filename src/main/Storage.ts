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
        const db = client.db();
        await db.createIndex("subscriptions", { userId: 1, chatId: 1 }, { unique: true });
        return new Storage(client, db);
    }

    public async create(document: object, collection: string): Promise<boolean> {
        try {
            return await this.db
                .collection(collection)
                .insertOne(document)
                .then(() => true);
        } catch {
            return Promise.resolve(false);
        }
    }

    public async delete(document: object, collection: string): Promise<boolean> {
        try {
            return await this.db
                .collection(collection)
                .deleteOne(document)
                .then((r) => r.deletedCount > 0);
        } catch {
            return Promise.resolve(false);
        }
    }

    public async read<T extends object>(document: Partial<T>, collection: string): Promise<T[]> {
        return await this.db.collection(collection).find(document).project<T>({ _id: 0 }).toArray();
    }

    public async cleanUp(): Promise<void> {
        await this.client.close();
    }
}
