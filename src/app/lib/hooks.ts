"use client";

import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { FullUser, User } from "@/main/UserModel";
import { subscriptionsApiPath, SubscriptionsResponse, userApiPath } from "@/main/Controller";
import { Subscription, SubscriptionId } from "@/main/SubscriptionModel";
import { StatusCodes } from "http-status-codes";

const genericErrorMessage = "An error has occurred.";
const unauthorizedErrorMessage = "User has not previously logged in.";

export type UserData =
    | {
          readonly isLoggedIn: true;
          readonly user: User;
      }
    | {
          readonly isLoggedIn: false;
          readonly user: undefined;
      };

export const useLoggedInUser = () => {
    const { data, isLoading, error } = useSWR<UserData, Error, string>(userApiPath, async (k) => {
        const response = await fetch(k);
        if (!response.ok) {
            if (response.status !== StatusCodes.NOT_FOUND.valueOf()) {
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
    const { trigger, isMutating, error } = useSWRMutation<User, Error, string, FullUser, UserData>(
        userApiPath,
        async (k, { arg: { username, password } }) => {
            const response = await fetch(k, {
                method: "POST",
                body: JSON.stringify({ username, password }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                if (response.status === StatusCodes.UNAUTHORIZED.valueOf()) {
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

export const useSubscriptions = () => {
    const { data, isLoading } = useSWR<SubscriptionsResponse, Error, string>(
        subscriptionsApiPath,
        async (k) => {
            const response = await fetch(k);
            if (!response.ok) {
                if (response.status === StatusCodes.FORBIDDEN.valueOf()) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as SubscriptionsResponse;
        },
    );
    return {
        response: data,
        isLoading,
    };
};

export const useInsertSubscription = () => {
    const { trigger, isMutating } = useSWRMutation<
        Subscription,
        Error,
        string,
        Subscription,
        SubscriptionsResponse
    >(
        subscriptionsApiPath,
        async (k, { arg: { userId, chatId, username } }) => {
            const response = await fetch(k, {
                method: "POST",
                body: JSON.stringify({ userId, chatId, username }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                if (response.status === StatusCodes.BAD_REQUEST.valueOf()) {
                    throw new Error("Inserted data was invalid.");
                } else if (response.status === StatusCodes.FORBIDDEN.valueOf()) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
            return (await response.json()) as Subscription;
        },
        {
            populateCache: (result, currentData) => ({
                subscriptions: [...(currentData?.subscriptions ?? []), result],
            }),
            revalidate: false,
        },
    );
    return {
        insertTrigger: trigger,
        isInserting: isMutating,
    };
};

export const useDeleteSubscription = () => {
    const { trigger, isMutating } = useSWRMutation<unknown, Error, string, SubscriptionId>(
        subscriptionsApiPath,
        async (k, { arg: { userId, chatId } }) => {
            const response = await fetch(k, {
                method: "DELETE",
                body: JSON.stringify({ userId, chatId }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                if (response.status === StatusCodes.BAD_REQUEST.valueOf()) {
                    throw new Error("Data to delete was invalid.");
                } else if (response.status === StatusCodes.FORBIDDEN.valueOf()) {
                    throw new Error(unauthorizedErrorMessage);
                }
                throw new Error(genericErrorMessage);
            }
        },
    );
    return {
        deleteTrigger: trigger,
        isDeleting: isMutating,
    };
};
