import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
    return <div className="rounded-xl border p-4 shadow-md bg-white">{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="p-2">{children}</div>;
}
