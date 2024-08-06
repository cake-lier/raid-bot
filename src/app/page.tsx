"use client";

import { useLoggedInUser } from "@/app/lib/hooks";
import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/LoginForm";

export default function Home() {
    const router = useRouter();
    const { response } = useLoggedInUser();
    if (response?.isLoggedIn) {
        router.replace("/dashboard");
        return "";
    } else {
        return <LoginForm />;
    }
}
