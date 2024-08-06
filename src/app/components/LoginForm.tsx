"use client";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { FormEvent, useState } from "react";
import { useLogin } from "@/app/lib/hooks";
import { FloatLabel } from "primereact/floatlabel";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { login, isLoggingIn, error } = useLogin();
    const submitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        login({ username, password }).catch((e: unknown) => {
            console.error(e);
        });
    };
    return (
        <main className="grid mt-5">
            {error ? <p className="text-sm p-error mt-2">{error.message}</p> : ""}
            <form onSubmit={submitForm} className="col-6 col-offset-3">
                <div className="field mt-5">
                    <FloatLabel>
                        <InputText
                            id="username"
                            name="username"
                            className="w-full"
                            invalid={!!error}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                            }}
                        />
                        <label htmlFor="username" className={error ? " p-error" : ""}>
                            Username
                        </label>
                    </FloatLabel>
                </div>
                <div className="field mt-5">
                    <FloatLabel>
                        <Password
                            id="password"
                            name="password"
                            className="w-full"
                            invalid={!!error}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            feedback={false}
                            toggleMask
                        />
                        <label htmlFor="password" className={error ? " p-error" : ""}>
                            Password
                        </label>
                    </FloatLabel>
                </div>
                <div className="field mt-5">
                    <Button label="Login" icon="pi pi-check" loading={isLoggingIn} type="submit" />
                </div>
            </form>
        </main>
    );
}
