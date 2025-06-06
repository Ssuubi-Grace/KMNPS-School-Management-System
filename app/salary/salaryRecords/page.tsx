"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

interface Row {
    id: string;
    staff_id: string;
    name: string;
    role: string | null;
    department: string | null;
    phone: string | null;
    period_month: number;
    period_year: number;
    total_salary: number;
    amount_paid: number;
    payment_date: string;
    balance: number;
}

const fmt = (n: number) =>
    n.toLocaleString("en-UG", {
        style: "currency",
        currency: "UGX",
        minimumFractionDigits: 0,
    });

export default function SalaryRecords() {
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("staff_salaries")
                .select(
                    `id, staff_id, period_month, period_year,
           total_salary, amount_paid, payment_date, balance,
           staff!inner(name, role, department, phone)`
                )
                .order("payment_date", { ascending: true });

            if (error) alert(error.message);
            else
                setRows(
                    (data || []).map((r: any) => ({
                        ...r,
                        name: r.staff.name,
                        role: r.staff.role,
                        department: r.staff.department,
                        phone: r.staff.phone,
                    }))
                );
            setLoading(false);
        })();
    }, []);

    const runningTotals = new Map<string, number>();

    const map = new Map<string, { total: number; paid: number }>();
    rows.forEach((r) => {
        const key = `${r.staff_id}-${r.period_month}-${r.period_year}`;
        if (!map.has(key)) map.set(key, { total: r.total_salary, paid: 0 });
        map.get(key)!.paid += r.amount_paid;
    });

    const filteredRows = rows.filter((r) => {
        const query = searchQuery.toLowerCase();
        const matchSearch =
            r.name.toLowerCase().includes(query) ||
            r.staff_id.toLowerCase().includes(query) ||
            (r.phone || "").toLowerCase().includes(query);

        const matchRole = selectedRole ? r.role === selectedRole : true;
        const matchDept = selectedDept ? r.department === selectedDept : true;

        return matchSearch && matchRole && matchDept;
    });

    const uniqueRoles = [...new Set(rows.map((r) => r.role).filter(Boolean))];
    const uniqueDepts = [...new Set(rows.map((r) => r.department).filter(Boolean))];

    const exportToExcel = () => {
        const dataToExport = filteredRows.map((r) => ({
            Date: new Date(r.payment_date).toLocaleDateString(),
            "Staff ID": r.staff_id,
            "Staff Name": r.name,
            Phone: r.phone,
            Role: r.role,
            Department: r.department,
            Period: `${r.period_year}-${String(r.period_month).padStart(2, "0")}`,
            "Total Salary": r.total_salary,
            "Amount Paid": r.amount_paid,
            "Balance": r.total_salary - (map.get(`${r.staff_id}-${r.period_month}-${r.period_year}`)?.paid || 0),
            Status:
                (map.get(`${r.staff_id}-${r.period_month}-${r.period_year}`)?.paid || 0) >= r.total_salary
                    ? "Complete"
                    : "Pending",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SalaryRecords");
        XLSX.writeFile(workbook, "salary_records.xlsx");
    };

    if (loading) return <p className="p-6">Loading…</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-center">Salary Records</h1>
                <div className="flex gap-2">
                    <a
                        href="/salary/paySalary"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Pay Salary
                    </a>
                    <button
                        onClick={exportToExcel}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Export to Excel
                    </button>
                </div>
            </div>

            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search by name, staff ID, or phone number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/3"
                />
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/4"
                >
                    <option value="">Filter by Role</option>
                    {uniqueRoles.map((role) => (
                        <option key={role as string} value={role as string}>
                            {role}
                        </option>
                    ))}
                </select>
                <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/4"
                >
                    <option value="">Filter by Department</option>
                    {uniqueDepts.map((dept) => (
                        <option key={dept as string} value={dept as string}>
                            {dept}
                        </option>
                    ))}
                </select>
            </div>

            <table className="min-w-full text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        {["Date", "Staff ID", "Staff Name", "Phone", "Role", "Department", "Period", "Total", "Paid Now", "Paid So Far", "Balance", "Status"].map((h) => (
                            <th key={h} className="p-2 border">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredRows.map((r) => {
                        const key = `${r.staff_id}-${r.period_month}-${r.period_year}`;
                        const prevPaid = runningTotals.get(key) || 0;
                        const paidSoFar = prevPaid + r.amount_paid;
                        const balance = r.total_salary - paidSoFar;
                        const isComplete = paidSoFar >= r.total_salary;
                        runningTotals.set(key, paidSoFar);

                        return (
                            <tr key={r.id} className="border-t hover:bg-gray-50">
                                <td className="p-2 border">{new Date(r.payment_date).toLocaleDateString()}</td>
                                <td className="p-2 border">{r.staff_id}</td>
                                <td className="p-2 border">{r.name}</td>
                                <td className="p-2 border">{r.phone}</td>
                                <td className="p-2 border">{r.role}</td>
                                <td className="p-2 border">{r.department}</td>
                                <td className="p-2 border">{`${r.period_year}-${String(r.period_month).padStart(2, "0")}`}</td>
                                <td className="p-2 border text-right">{fmt(r.total_salary)}</td>
                                <td className="p-2 border text-right">{fmt(r.amount_paid)}</td>
                                <td className="p-2 border text-right">{fmt(paidSoFar)}</td>
                                <td className="p-2 border text-right font-semibold">{fmt(balance)}</td>
                                <td className="p-2 font-semibold" style={{ color: isComplete ? "green" : "red" }}>
                                    {isComplete ? "Complete" : "Pending"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

