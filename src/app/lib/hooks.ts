"use client";

import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { RegisteredUser, RegisteredUserData, User, UserData } from "@/app/lib/types";

const genericErrorMessage = "An error has occurred.";
const unauthorizedErrorMessage = "User has not previously logged in.";

const userApiPath = "/api/users/loggedIn";

export const useLoggedInUser = () => {
    const { data, isLoading, error } = useSWR<UserData, Error, string>(userApiPath, async (k) => {
        const response = await fetch(k);
        if (!response.ok) {
            if (response.status !== 403) {
                throw new Error(genericErrorMessage);
            }
            return {
                isLoggedIn: false,
                user: undefined,
            };
        }
        return {
            isLoggedIn: true,
            user: (await response.json()) as User,
        };
    });
    return {
        response: data,
        isLoading,
        error,
    };
};

export const useLogin = () => {
    const { trigger, isMutating, error } = useSWRMutation<
        User,
        Error,
        string,
        {
            readonly username: string;
            readonly password: string;
        },
        UserData
    >(
        userApiPath,
        async (k, { arg: { username, password } }) => {
            const response = await fetch(k, {
                method: "PUT",
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Username or password were invalid.");
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as User;
        },
        {
            populateCache: (result) => ({ isLoggedIn: true, user: result }),
            revalidate: false,
        },
    );
    return {
        login: trigger,
        isLoggingIn: isMutating,
        error,
    };
};

export const useLogout = () => {
    const { trigger, isMutating } = useSWRMutation<unknown, Error, string, never, UserData>(
        userApiPath,
        async (k) => {
            const response = await fetch(k, { method: "DELETE" });
            if (!response.ok) {
                throw new Error(genericErrorMessage);
            }
        },
        {
            populateCache: () => ({ isLoggedIn: false, user: undefined }),
            revalidate: false,
        },
    );
    return {
        logoutTrigger: trigger,
        isLoggingOut: isMutating,
    };
};

const registeredUsersApiPath = "/api/registeredUsers";

export const useRegisteredUsers = () => {
    const { data, isLoading } = useSWR<RegisteredUserData, Error, string>(
        registeredUsersApiPath,
        async (k) => {
            const response = await fetch(k);
            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as RegisteredUserData;
        },
    );
    return {
        response: data,
        isLoading,
    };
};

export const useInsertRegisteredUser = () => {
    const { trigger, isMutating } = useSWRMutation<
        RegisteredUserData,
        Error,
        string,
        RegisteredUser
    >(
        registeredUsersApiPath,
        async (k, { arg: { userId, chatId, username } }) => {
            const response = await fetch(k, {
                method: "PUT",
                body: JSON.stringify({ userId, chatId, username }),
            });
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Inserted data was invalid.");
                } else if (response.status === 403) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as RegisteredUserData;
        },
        {
            populateCache: true,
            revalidate: false,
        },
    );
    return {
        insertTrigger: trigger,
        isInserting: isMutating,
    };
};

export const useDeleteRegisteredUser = () => {
    const { trigger, isMutating } = useSWRMutation<
        RegisteredUserData,
        Error,
        string,
        {
            readonly userId: number;
            readonly chatId: number;
        }
    >(
        registeredUsersApiPath,
        async (k, { arg: { userId, chatId } }) => {
            const response = await fetch(k, {
                method: "DELETE",
                body: JSON.stringify({ userId, chatId }),
            });
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error("Data to delete was invalid.");
                } else if (response.status === 403) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as RegisteredUserData;
        },
        {
            populateCache: true,
            revalidate: false,
        },
    );
    return {
        deleteTrigger: trigger,
        isDeleting: isMutating,
    };
};
