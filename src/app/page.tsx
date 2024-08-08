"use client";

import { useLoggedInUser } from "@/app/lib/hooks";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/LoginForm";

export default function Home() {
    const router = useRouter();
    const { userResponse, isLoadingUser } = useLoggedInUser();
    if (!isLoadingUser && userResponse?.isLoggedIn) {
        router.replace("/dashboard");
        return "";
    } else {
        return <LoginForm />;
    }
}
