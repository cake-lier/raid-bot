"use client";

import { useLoggedInUser } from "@/app/lib/hooks";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/LoginForm";
import { useEffect, useState } from "react";

export default function Home() {
    const router = useRouter();
    const { userResponse, isLoadingUser } = useLoggedInUser();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, [setIsMounted]);
    if (!isMounted) {
        return "";
    }
    if (!isLoadingUser && userResponse?.isLoggedIn) {
        router.replace("/dashboard");
        return "";
    } else {
        return <LoginForm />;
    }
}
