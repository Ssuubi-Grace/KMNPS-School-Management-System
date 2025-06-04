// app/salary/pay/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ——— shapes ——— */
interface Staff {
    id: string;
    name: string;
    role: string;
}

/* ——— helpers ——— */
const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return <input {...props} className="border rounded p-2 w-full" />;
}
function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" />
    );
}

/* ——— page ——— */
export default function PaySalary() {
    const router = useRouter();
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    // form fields
    const [staffId, setStaffId] = useState("");
    const [totalSalary, setTotal] = useState("");
    const [amountPaid, setPaid] = useState("");
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    /* grab staff list */
    useEffect(() => {
        const fetchStaff = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("staff")
                .select("id, name, role")
                .order("name");

            if (error) {
                console.error("Error fetching staff:", error);
            } else {
                setStaff(data as Staff[]);
            }

            setLoading(false);
        };

        fetchStaff();
    }, []);

    // useEffect(() => {
    //     supabase.from("staff")
    //         .select("id, name, role")
    //         .order("name")
    //         .then(({ data }) => setStaff(data as Staff[]))
    //         .finally(() => setLoading(false));
    // }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!staffId) return alert("Select staff");
        if (!totalSalary || !amountPaid) return alert("Enter salary + amount");

        const { error } = await supabase.from("staff_salaries").insert([{
            staff_id: staffId,
            period_month: month + 1,
            period_year: year,
            total_salary: Number(totalSalary),
            amount_paid: Number(amountPaid)
        }]);

        if (error) alert(error.message);
        else {
            alert("Salary recorded!");
            router.push("/salary/records");
        }
    };

    if (loading) return <p className="p-6">Loading …</p>;

    return (
        <div className="p-6 space-y-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-center">Pay Salary</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* staff */}
                <div>
                    <label className="block mb-1 font-medium">Staff member</label>
                    <select
                        value={staffId}
                        onChange={(e) => setStaffId(e.target.value)}
                        className="border rounded p-2 w-full">
                        <option value="">— choose —</option>
                        {staff.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} · {s.role}
                            </option>
                        ))}
                    </select>
                </div>

                {/* period */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block mb-1 font-medium">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="border rounded p-2 w-full">
                            {months.map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                    </div>
                    <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        placeholder="Year"
                    />
                </div>

                {/* salary + paid */}
                <Input
                    type="number" step="0.01"
                    placeholder="Total salary for the period"
                    value={totalSalary}
                    onChange={(e) => setTotal(e.target.value)}
                />
                <Input
                    type="number" step="0.01"
                    placeholder="Amount paid now"
                    value={amountPaid}
                    onChange={(e) => setPaid(e.target.value)}
                />

                <Button type="submit">Save Payment</Button>
            </form>
        </div>
    );
}
