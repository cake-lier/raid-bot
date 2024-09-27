import { Storage } from "./Storage";

export interface Subscription {
    userId: number;
    username: string;
    chatId: number;
}

export class Model {
    public constructor(private readonly storage: Storage) {}

    public async insertSubscription(subscription: Subscription): Promise<boolean> {
        return await this.storage.create(subscription, "subscriptions");
    }

    public async deleteSubscription(userId: number, chatId: number): Promise<boolean> {
        return await this.storage.delete({ userId, chatId }, "subscriptions");
    }

    public async getAllSubscriptionsForChat(chatId: number): Promise<Subscription[]> {
        return this.storage.read<Subscription>({ chatId }, "subscriptions");
    }
}
