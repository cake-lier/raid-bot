"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import {
    useDeleteSubscription,
    useLoggedInUser,
    useLogout,
    useSubscriptions,
} from "@/app/lib/hooks";
import InsertForm from "@/app/components/InsertForm";
import { Subscription } from "@/main/SubscriptionModel";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const { isLoadingUser, userResponse } = useLoggedInUser();
    const { subscriptionsResponse, isLoadingSubscriptions } = useSubscriptions();
    const { deleteTrigger, isDeleting } = useDeleteSubscription();
    const { logoutTrigger, isLoggingOut } = useLogout();
    if (isLoadingUser) {
        return "";
    } else if (!userResponse?.isLoggedIn) {
        router.replace("/");
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
                        subscriptions: subscriptionsResponse?.subscriptions.filter(
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
                sortOrder={1}
                className="col-12"
                value={subscriptionsResponse?.subscriptions}
                loading={isLoadingSubscriptions}
            >
                <Column field="userId" header="User id"></Column>
                <Column field="chatId" header="Chat id"></Column>
                <Column field="username" header="Username"></Column>
                <Column
                    body={deleteBodyTemplate}
                    exportable={false}
                    style={{ minWidth: "6rem" }}
                    header="Delete?"
                ></Column>
            </DataTable>
            <InsertForm subscriptions={subscriptionsResponse?.subscriptions} />
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
