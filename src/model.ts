import { Db, MongoClient } from "mongodb";

export class Model {
    private readonly client: MongoClient;
    private readonly db: Db;

    private constructor(client: MongoClient, dbName: string) {
        this.client = client;
        this.db = client.db(dbName);
    }

    public static async create(
        dbHost: string,
        dbPort: number,
        dbUsername: string,
        dbPassword: string,
        appName: string,
        dbName: string
    ): Promise<Model> {
        const client = new MongoClient(
            `mongodb+srv://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/?retryWrites=true&w=majority&appName=${appName}`
        );
        await client.connect();
        return new Model(client, dbName);
    }

    public async insertUser(userId: number, username: string, chatId: number): Promise<number> {
        try {
            return await this.db.collection("subscriptions").insertOne({
                userId,
                username,
                chatId
            }).then(() => 1);
        } catch {}
        return Promise.resolve(0);
    }

    public async deleteUser(userId: number, chatId: number): Promise<number> {
        try {
            return await this.db.collection("subscriptions").deleteOne({userId, chatId}).then(() => 1);
        } catch {}
        return Promise.resolve(0);
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
