import { Storage } from "./Storage";

export interface SubscriptionId {
    readonly userId: number;
    readonly chatId: number;
}

export interface Subscription extends SubscriptionId {
    readonly username: string;
}

export class SubscriptionModel {
    constructor(private readonly storage: Storage) {}

    public async insertSubscription(subscription: Subscription): Promise<boolean> {
        try {
            return await this.storage
                .getDb()
                .collection("subscriptions")
                .insertOne({
                    userId: subscription.userId,
                    username: subscription.username,
                    chatId: subscription.chatId,
                })
                .then(() => true);
        } catch {
            return Promise.resolve(false);
        }
    }

    public async deleteSubscription(id: SubscriptionId): Promise<boolean> {
        try {
            return await this.storage
                .getDb()
                .collection("subscriptions")
                .deleteOne({ userId: id.userId, chatId: id.chatId })
                .then((r) => r.deletedCount > 0);
        } catch {
            return Promise.resolve(false);
        }
    }

    public async getSubscriptionsForChat(chatId: number): Promise<Subscription[]> {
        return await this.storage
            .getDb()
            .collection("subscriptions")
            .find({ chatId })
            .project<{ userId: number; chatId: number; username: string }>({ _id: 0 })
            .toArray();
    }
}
