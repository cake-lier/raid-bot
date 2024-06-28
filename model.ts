import postgres = require("postgres");

class Model {
    private sql: postgres.Sql<{}>;

    public constructor(dbHost: String, dbPort: number, dbUsername: String, dbPassword: String, dbName: String) {
        this.sql = postgres(`postgres://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`);
    }

    public async insertUser(userId: number, username: string, chatId: number): Promise<number> {
        return await this.sql.begin<number>(async t => {
            t`INSERT INTO users (user_id, username) VALUES (${userId}, ${username}) ON CONFLICT DO NOTHING`;
            return (await t`INSERT INTO chats (user_id, chat_id) VALUES (${userId}, ${chatId}) ON CONFLICT DO NOTHING`).count;
        });
    }

    public async deleteUser(userId: number, chatId: number): Promise<number> {
        return await this.sql.begin<number>(async t => {
            const affectedRows: number = (await this.sql`DELETE FROM chats WHERE chats.user_id = ${userId} AND chats.chat_id = ${chatId}`).count;
            if (affectedRows > 0 && (await this.sql`SELECT COUNT(*) as count FROM chats WHERE chats.user_id = ${userId}`)[0].count === 0) {
                await this.sql`DELETE FROM users WHERE users.user_id = ${userId}`;
            }
            return affectedRows;
        });
    }

    public async getAllUsers(chatId: number): Promise<String[]> {
        return await this.sql<String[]>`SELECT users.username FROM users, chats WHERE users.user_id = chats.user_id AND chats.chat_id = ${chatId}`;
    }
}

export default Model;