import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FormEvent, useState } from "react";
import { useInsertRegisteredUser } from "@/app/lib/hooks";
import { RegisteredUser } from "@/app/lib/types";

export default function InsertForm() {
    const { insertTrigger, isInserting } = useInsertRegisteredUser();
    const [userId, setUserId] = useState(0);
    const [chatId, setChatId] = useState(0);
    const [username, setUsername] = useState("");
    const insertRegisteredUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newRegisteredUser: RegisteredUser = { userId, chatId, username };
        insertTrigger(newRegisteredUser, {
            optimisticData: (currentData) => ({
                registeredUsers: [...(currentData?.registeredUsers ?? []), newRegisteredUser],
            }),
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
                            setUserId(Number.parseInt(e.target.value));
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
                            setChatId(Number.parseInt(e.target.value));
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
                        keyfilter="pint"
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
