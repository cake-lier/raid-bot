"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { useDeleteRegisteredUser, useLogout, useRegisteredUsers } from "@/app/lib/hooks";
import InsertForm from "@/app/components/InsertForm";
import { RegisteredUser } from "@/app/lib/types";

export default function Dashboard() {
    const { response, isLoading } = useRegisteredUsers();
    const { deleteTrigger, isDeleting } = useDeleteRegisteredUser();
    const { logoutTrigger, isLoggingOut } = useLogout();
    const deleteBodyTemplate = (user: RegisteredUser) => (
        <Button
            icon="pi pi-trash"
            severity="danger"
            loading={isDeleting}
            onClick={() => {
                deleteTrigger(user, {
                    optimisticData: (currentData) => ({
                        registeredUsers: (currentData?.registeredUsers ?? []).filter(
                            (e) => e.userId !== user.userId && e.chatId !== user.chatId,
                        ),
                    }),
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
                value={response?.registeredUsers ?? []}
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
            <InsertForm />
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
