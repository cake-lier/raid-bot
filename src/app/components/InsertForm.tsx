import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormEvent, useState } from "react";
import { useInsertSubscription } from "@/app/lib/hooks";
import { Subscription } from "@/main/SubscriptionModel";

export default function InsertForm({
    subscriptions,
}: {
    subscriptions: Subscription[] | undefined;
}) {
    const { insertTrigger, isInserting } = useInsertSubscription();
    const [userId, setUserId] = useState(0);
    const [chatId, setChatId] = useState(0);
    const [username, setUsername] = useState("");
    const insertRegisteredUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newSubscription: Subscription = { userId, chatId, username };
        insertTrigger(newSubscription, {
            optimisticData: { subscriptions: [...(subscriptions ?? []), newSubscription] },
        }).catch((e: unknown) => {
            console.error(e);
        });
    };
    return (
        <form onSubmit={insertRegisteredUser} className="col-12 formgrid grid">
            <div className="field col mt-5">
                <FloatLabel>
                    <InputText
                        id="user_id"
                        name="user_id"
                        className="w-full"
                        value={userId.toString()}
                        keyfilter="pint"
                        onChange={(e) => {
                            const parsed = Number.parseInt(e.target.value);
                            setUserId(Number.isNaN(parsed) ? 0 : parsed);
                        }}
                    />
                    <label htmlFor="user_id">User Id</label>
                </FloatLabel>
            </div>
            <div className="field col mt-5">
                <FloatLabel>
                    <InputText
                        id="chat_id"
                        name="chat_id"
                        className="w-full"
                        value={chatId.toString()}
                        keyfilter="pint"
                        onChange={(e) => {
                            const parsed = Number.parseInt(e.target.value);
                            setChatId(Number.isNaN(parsed) ? 0 : parsed);
                        }}
                    />
                    <label htmlFor="chat_id">Chat Id</label>
                </FloatLabel>
            </div>
            <div className="field col mt-5">
                <FloatLabel>
                    <InputText
                        id="username"
                        name="username"
                        className="w-full"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                        }}
                    />
                    <label htmlFor="username">Username</label>
                </FloatLabel>
            </div>
            <div className="field mt-5">
                <Button label="Insert" icon="pi pi-check" loading={isInserting} type="submit" />
            </div>
        </form>
    );
}