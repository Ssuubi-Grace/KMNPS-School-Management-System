"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* ---------- tiny field helpers ---------- */
function Input({
    label,
    ...props
}: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            {label && <label className="block text-sm font-medium mb-1">{label}</label>}
            <input {...props} className="border p-2 w-full rounded" />
        </div>
    );
}
function Select({
    label,
    children,
    ...props
}: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            {label && <label className="block text-sm font-medium mb-1">{label}</label>}
            <select {...props} className="border p-2 w-full rounded">
                {children}
            </select>
        </div>
    );
}
function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
            {children}
        </button>
    );
}

/* ---------- DB shape ---------- */
interface Visitor {
    id: string;
    name: string;
    address: string;          // 👈 fixed spelling
    person_to_see: string;
    purpose: string;
    visit_date: string | null;
    term: string | null;
    time_in: string | null;
    time_out: string | null;
    phone: string | null;
    email: string | null;
}

const terms = ["Term I", "Term II", "Term III"];

/* ---------- shared fetch helper ---------- */
const fetchVisitors = async (
    setVisitors: React.Dispatch<React.SetStateAction<Visitor[]>>
) => {
    const { data, error } = await supabase.from("visitors").select("*");

    console.log("Fetched data:", data);
    console.log("Fetch error:", error);

    if (error) {
        console.error("Error fetching visitors:", error);
        alert(`Error fetching visitors: ${error.message}`);
    } else {
        setVisitors(data as Visitor[]);
    }
};


export default function VisitorsListPage() {
    const [visitors, setVisitors] = useState<Visitor[]>([]);
    const [filterTerm, setFilterTerm] = useState("");
    const [filterYear, setFilterYear] = useState("");
    const [search, setSearch] = useState("");

    /* ---------- first load + refetch on window focus ---------- */
    useEffect(() => {
        fetchVisitors(setVisitors);
        const onFocus = () => fetchVisitors(setVisitors);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    /* ---------- year list for dropdown ---------- */
    const years = useMemo(
        () =>
            Array.from(
                new Set(
                    visitors
                        .map((v) => v.visit_date?.slice(0, 4))
                        .filter((year): year is string => Boolean(year))
                )
            ).sort(),
        [visitors]
    );


    /* ---------- filters ---------- */
    const filteredVisitors = useMemo(() => {
        return visitors.filter((v) => {
            if (filterTerm && v.term !== filterTerm) return false;
            if (filterYear && (v.visit_date?.slice(0, 4) ?? "") !== filterYear) return false;
            if (search) {
                const q = search.toLowerCase();
                const hay = `${v.name} ${v.person_to_see} ${v.purpose}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [visitors, filterTerm, filterYear, search]);

    /* ---------- UI ---------- */
    return (
        <div className="p-4 max-w-7xl mx-auto space-y-6">
            {/* header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Visitor Records</h1>
                <div className="flex gap-2">
                    <a href="/visitors" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Add Visitor
                    </a>
                    <Button onClick={() => fetchVisitors(setVisitors)}>Refresh</Button>
                </div>
            </div>

            {/* filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
                <Input
                    label="Search"
                    placeholder="Name, person to see, purpose…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Select label="Filter by Term" value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)}>
                    <option value="">All Terms</option>
                    {terms.map((t) => (
                        <option key={t} value={t}>
                            {t}
                        </option>
                    ))}
                </Select>
                <Select label="Filter by Year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="">All Years</option>
                    {years.map((y) => (
                        y && (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        )
                    ))}
                </Select>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2">Name</th>
                            <th className="p-2">Address</th>
                            <th className="p-2">Person to See</th>
                            <th className="p-2">Purpose</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Term</th>
                            <th className="p-2">Time&nbsp;In</th>
                            <th className="p-2">Time&nbsp;Out</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVisitors.length ? (
                            filteredVisitors.map((v) => (
                                <tr key={v.id} className="border-t">
                                    <td className="p-2">{v.name}</td>
                                    <td className="p-2">{v.address}</td>
                                    <td className="p-2">{v.person_to_see}</td>
                                    <td className="p-2">{v.purpose}</td>
                                    <td className="p-2">{v.visit_date}</td>
                                    <td className="p-2">{v.term}</td>
                                    <td className="p-2">{v.time_in}</td>
                                    <td className="p-2">{v.time_out}</td>
                                    <td className="p-2">{v.phone}</td>
                                    <td className="p-2">{v.email}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={10} className="text-center text-gray-500 p-4">
                                    No visitor records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


