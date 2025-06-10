"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ─── types ─── */

interface Staff {
    id: string;        // UUID P‑Key in table
    staff_id: string;
    name: string;
    role: string | null;
}

/* ─── constants / helpers ─── */
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmt = (n: number) => n.toLocaleString();

/* quick input helpers  */
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) =>
    <input {...p} className="border rounded p-2 w-full" />;
const Button = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    <button {...p} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" />;

/* ─── PAGE ─── */
export default function PaySalary() {
    const router = useRouter();

    /* raw data from Supabase */
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);

    /* ui / search */
    const [search, setSearch] = useState("");
    const searched = useMemo(() => {
        const q = search.toLowerCase().trim();
        return staff.filter(s => {
            const name = s.name ?? "";
            const id = s.staff_id ?? "";
            return name.toLowerCase().includes(q) || id.toLowerCase().includes(q);
        });

        // return staff.filter(s =>
        //     s.name.toLowerCase().includes(q) ||
        //     s.staff_id.toLowerCase().includes(q)
        // );
    }, [search, staff]);

    /* form state */
    const [picked, setPicked] = useState<Staff | null>(null);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());

    const [totalSalary, setTotal] = useState("");   // only editable on first payment
    const [amountPaid, setPaid] = useState("");

    /* derived / fetched for current staff‑month */
    const [paidSoFar, setPaidSoFar] = useState(0);
    const [loadingMonth, setLM] = useState(false);

    /* ─ Fetch all staff once ─ */
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("staff")
                .select("id, staff_id, name, role")
                .order("name");
            if (error) console.error(error);
            setStaff(data as Staff[]);
            setLoading(false);
        })();
    }, []);

    /* ─ Fetching payments for the selected month whenever staff / period changes ─ */
    useEffect(() => {
        if (!picked) return;
        (async () => {
            setLM(true);
            const { data, error } = await supabase
                .from("staff_salaries")
                .select("*")
                .eq("staff_id", picked.staff_id)
                .eq("period_month", month + 1)
                .eq("period_year", year);
            if (error) { console.error(error); setLM(false); return; }

            const rows = data || [];
            const alreadyPaid = rows.reduce((sum, r) => sum + r.amount_paid, 0);
            setPaidSoFar(alreadyPaid);

            /* lock the monthly total to the figure given in the FIRST row */
            if (rows.length) {
                setTotal(String(rows[0].total_salary));
            } else {
                setTotal("");            // allow entering total on first payment
            }

            setLM(false);
        })();
    }, [picked, month, year]);

    /* ─ submit ─ */



    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!picked) return alert("Choose a staff member first.");
        if (!totalSalary) return alert("Enter monthly total salary.");
        if (!amountPaid) return alert("Enter amount to pay.");

        const totalNum = Number(totalSalary);
        const payNum = Number(amountPaid);

        if (payNum <= 0) return alert("Payment must be > 0");
        if (payNum + paidSoFar > totalNum)
            return alert("This would over‑pay the salary for the month.");

        const balance = totalNum - (paidSoFar + payNum);

        // ✅ Only insert the actual payment info — no need for paid_so_far or balance in DB
        const { error } = await supabase.from("staff_salaries").insert([
            {
                staff_id: picked.staff_id,
                payment_date: new Date().toISOString(),
                period_month: month + 1,
                period_year: year,
                total_salary: totalNum,
                amount_paid: payNum,
            },
        ]);

        if (error) {
            console.error(error);
            return alert("DB error: " + error.message);
        }

        alert(`Saved! Paid ${fmt(payNum)} UGX. Balance now ${fmt(balance)} UGX.`);

        // Update UI state
        setPaidSoFar(paidSoFar + payNum);
        setPaid("");
        if (balance === 0) setTotal("");
    };



    /* ─ UI ─ */
    if (loading) return <p className="p-6">Loading …</p>;

    return (
        <div className="p-6 space-y-6 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold text-center">Pay Salary</h1>

            {/* search / pick staff */}
            <div>
                <label className="block mb-1 font-medium">Search staff</label>
                <Input
                    placeholder="Name or Staff ID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && searched.length > 0 && (
                    <ul className="border mt-1 max-h-48 overflow-auto bg-white z-10 relative">
                        {searched.map(s => (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onClick={() => { setPicked(s); setSearch(""); }}
                                    className="w-full text-left px-2 py-1 hover:bg-blue-50">
                                    {s.name} • {s.staff_id} • {s.role ?? ""}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {picked && (
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* selected staff summary */}
                    <div className="p-3 rounded bg-gray-100">
                        <p className="font-semibold">{picked.name} ({picked.staff_id})</p>
                        {loadingMonth ? (
                            <p className="text-sm text-gray-500">Loading period info…</p>
                        ) : (
                            <p className="text-sm">
                                Paid so far: <span className="font-semibold">{fmt(paidSoFar)} UGX</span>
                            </p>
                        )}
                    </div>

                    {/* period */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block mb-1 font-medium">Month</label>
                            <select
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                                className="border rounded p-2 w-full">
                                {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                            </select>
                        </div>
                        <Input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            placeholder="Year"
                        />
                    </div>

                    {/* salary / payment */}
                    <Input
                        type="number" step="0.01"
                        placeholder="Total salary for month"
                        value={totalSalary}
                        onChange={(e) => setTotal(e.target.value)}
                        disabled={paidSoFar > 0}           // lock after first payment
                    />
                    <Input
                        type="number" step="0.01"
                        placeholder="Amount paying now"
                        value={amountPaid}
                        onChange={(e) => setPaid(e.target.value)}
                        disabled={Number(totalSalary) - paidSoFar === 0}
                    />
                    <Button
                        type="submit"
                        disabled={
                            Number(totalSalary) - paidSoFar === 0 ||
                            !picked ||
                            !totalSalary ||
                            !amountPaid ||
                            Number(amountPaid) <= 0
                        }>
                        Save Payment
                    </Button>

                    {/* <Button type="submit" disabled={Number(totalSalary) - paidSoFar === 0}>
                        Save Payment
                    </Button> */}
                </form>
            )}
            <div className="text-center">
                <a
                    href="/salary/salaryRecords"
                    className="inline-block text-blue-600 hover:underline font-medium"
                >
                    View All Staff Salaries
                </a>
            </div>
        </div>
    );
}


// // app/salary/pay/page.tsx
// "use client";

// import { useEffect, useState, FormEvent } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";

// /* ——— shapes ——— */
// interface Staff {
//     id: string;
//     name: string;
//     role: string;
// }

// /* ——— helpers ——— */
// const months = [
//     "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
// ];

// function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
//     return <input {...props} className="border rounded p-2 w-full" />;
// }
// function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
//     return (
//         <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" />
//     );
// }

// /* ——— page ——— */
// export default function PaySalary() {
//     const router = useRouter();
//     const [staff, setStaff] = useState<Staff[]>([]);
//     const [loading, setLoading] = useState(true);

//     // form fields
//     const [staffId, setStaffId] = useState("");
//     const [totalSalary, setTotal] = useState("");
//     const [amountPaid, setPaid] = useState("");
//     const [month, setMonth] = useState(new Date().getMonth());
//     const [year, setYear] = useState(new Date().getFullYear());

//     /* grab staff list */
//     useEffect(() => {
//         const fetchStaff = async () => {
//             setLoading(true);
//             const { data, error } = await supabase
//                 .from("staff")
//                 .select("id, name, role")
//                 .order("name");

//             if (error) {
//                 console.error("Error fetching staff:", error);
//             } else {
//                 setStaff(data as Staff[]);
//             }

//             setLoading(false);
//         };

//         fetchStaff();
//     }, []);

//     // useEffect(() => {
//     //     supabase.from("staff")
//     //         .select("id, name, role")
//     //         .order("name")
//     //         .then(({ data }) => setStaff(data as Staff[]))
//     //         .finally(() => setLoading(false));
//     // }, []);

//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();
//         if (!staffId) return alert("Select staff");
//         if (!totalSalary || !amountPaid) return alert("Enter salary + amount");

//         const { error } = await supabase.from("staff_salaries").insert([{
//             staff_id: staffId,
//             period_month: month + 1,
//             period_year: year,
//             total_salary: Number(totalSalary),
//             amount_paid: Number(amountPaid)
//         }]);

//         if (error) alert(error.message);
//         else {
//             alert("Salary recorded!");
//             router.push("/salary/records");
//         }
//     };

//     if (loading) return <p className="p-6">Loading …</p>;

//     return (
//         <div className="p-6 space-y-6 max-w-xl mx-auto">
//             <h1 className="text-3xl font-bold text-center">Pay Salary</h1>

//             <form onSubmit={handleSubmit} className="space-y-4">
//                 {/* staff */}
//                 <div>
//                     <label className="block mb-1 font-medium">Staff member</label>
//                     <select
//                         value={staffId}
//                         onChange={(e) => setStaffId(e.target.value)}
//                         className="border rounded p-2 w-full">
//                         <option value="">— choose —</option>
//                         {staff.map((s) => (
//                             <option key={s.id} value={s.id}>
//                                 {s.name} · {s.role}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* period */}
//                 <div className="flex gap-2">
//                     <div className="flex-1">
//                         <label className="block mb-1 font-medium">Month</label>
//                         <select
//                             value={month}
//                             onChange={(e) => setMonth(Number(e.target.value))}
//                             className="border rounded p-2 w-full">
//                             {months.map((m, i) => (
//                                 <option key={i} value={i}>{m}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <Input
//                         type="number"
//                         value={year}
//                         onChange={(e) => setYear(Number(e.target.value))}
//                         placeholder="Year"
//                     />
//                 </div>

//                 {/* salary + paid */}
//                 <Input
//                     type="number" step="0.01"
//                     placeholder="Total salary for the period"
//                     value={totalSalary}
//                     onChange={(e) => setTotal(e.target.value)}
//                 />
//                 <Input
//                     type="number" step="0.01"
//                     placeholder="Amount paid now"
//                     value={amountPaid}
//                     onChange={(e) => setPaid(e.target.value)}
//                 />

//                 <Button type="submit">Save Payment</Button>
//             </form>
//         </div>
//     );
// }
