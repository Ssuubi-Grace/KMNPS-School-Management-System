// app/salary/records/page.tsx
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Row {
    id: string;
    staff_id: string;
    period_month: number;
    period_year: number;
    name: string;
    role: string;
    total_salary: number;
    amount_paid: number;
    paid_at: string;
}

/* quick formatter */
const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 0 });

export default function SalaryRecords() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    /* join staff + salary tables */
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("staff_salaries")
                .select(`
          id, staff_id, period_month, period_year, total_salary, amount_paid, paid_at,
          staff!inner(id, name, role)
        `)
                .order("paid_at", { ascending: false });

            if (error) alert(error.message);
            else
                setRows(
                    (data || []).map((r: any) => ({
                        ...r,
                        name: r.staff.name,
                        role: r.staff.role,
                    }))
                );
            setLoading(false);
        })();
    }, []);

    if (loading) return <p className="p-6">Loading …</p>;

    /* calculate running balances per staff+period */
    const summary = new Map<string, { total: number; paid: number }>();
    rows.forEach((r) => {
        const key = `${r.staff_id}-${r.period_month}-${r.period_year}`;
        if (!summary.has(key))
            summary.set(key, { total: r.total_salary, paid: 0 });
        summary.get(key)!.paid += r.amount_paid;
    });

    return (
        <div className="p-6 max-w-6xl mx-auto overflow-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">Salary Records</h1>

            <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        {[
                            "Date", "Staff", "Role", "Period",
                            "Total Salary", "This Payment", "Paid So Far", "Balance"
                        ].map((h) => (
                            <th key={h} className="p-2 border">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => {
                        const key = `${r.staff_id}-${r.period_month}-${r.period_year}`;
                        const paidSoFar = summary.get(key)!.paid;
                        const balance = r.total_salary - paidSoFar;
                        return (
                            <tr key={r.id} className="border-t hover:bg-gray-50">
                                <td className="p-2 border">{new Date(r.paid_at).toLocaleDateString()}</td>
                                <td className="p-2 border">{r.name}</td>
                                <td className="p-2 border">{r.role}</td>
                                <td className="p-2 border">
                                    {`${r.period_year}-${String(r.period_month).padStart(2, "0")}`}
                                </td>
                                <td className="p-2 border text-right">UGX {fmt(r.total_salary)}</td>
                                <td className="p-2 border text-right">UGX {fmt(r.amount_paid)}</td>
                                <td className="p-2 border text-right">UGX {fmt(paidSoFar)}</td>
                                <td className="p-2 border text-right font-semibold">
                                    UGX {fmt(balance)}
                                </td>
                            </tr>
                        );
                    })}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={8} className="p-6 text-center text-gray-500">
                                No salary payments yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
