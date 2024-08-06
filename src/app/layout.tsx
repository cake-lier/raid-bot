import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";
import "primeflex/primeflex.css";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primeicons/primeicons.css";
import "@/app/globals.scss";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Raid bot",
    description: "A bot for announcing pokémon raids",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
