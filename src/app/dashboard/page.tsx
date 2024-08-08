"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { useDeleteSubscription, useLogout, useSubscriptions } from "@/app/lib/hooks";
import InsertForm from "@/app/components/InsertForm";
import { Subscription } from "@/main/SubscriptionModel";

export default function Dashboard() {
    const { response, isLoading } = useSubscriptions();
    const { deleteTrigger, isDeleting } = useDeleteSubscription();
    const { logoutTrigger, isLoggingOut } = useLogout();
    if (!response) {
        return "";
    }
    const deleteBodyTemplate = (user: Subscription) => (
        <Button
            icon="pi pi-trash"
            severity="danger"
            loading={isDeleting}
            onClick={() => {
                deleteTrigger(user, {
                    optimisticData: {
                        subscriptions: response.subscriptions.filter(
                            (e) => e.userId !== user.userId && e.chatId !== user.chatId,
                        ),
                    },
                }).catch((e: unknown) => {
                    console.error(e);
                });
            }}
        />
    );
    return (
        <div className="grid">
            <DataTable
                stripedRows
                sortField="username"
                className="col-12"
                value={response.subscriptions}
                loading={isLoading}
            >
                <Column field="user_id" header="User id"></Column>
                <Column field="chat_id" header="Chat id"></Column>
                <Column field="username" header="Username"></Column>
                <Column
                    body={deleteBodyTemplate}
                    exportable={false}
                    style={{ minWidth: "6rem" }}
                    header="Delete?"
                ></Column>
            </DataTable>
            <InsertForm subscriptions={response.subscriptions} />
            <Button
                label="Logout"
                loading={isLoggingOut}
                onClick={() => {
                    logoutTrigger().catch((e: unknown) => {
                        console.error(e);
                    });
                }}
            />
        </div>
    );
}
