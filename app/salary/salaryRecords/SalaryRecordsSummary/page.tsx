"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

interface StaffSummary {
    staff_id: string;
    name: string;
    role: string | null;
    department: string | null;
    phone: string | null;
    total_salary: number;
    total_paid: number;
    balance: number;
    period: string;
}

const fmt = (n: number) =>
    n.toLocaleString("en-UG", {
        style: "currency",
        currency: "UGX",
        minimumFractionDigits: 0,
    });

const periodStr = (month: number, year: number) =>
    `${new Date(year, month - 1).toLocaleString("en-US", { month: "long" })}-${year}`;

const getCurrentMonthYear = () => {
    const date = new Date();
    return periodStr(date.getMonth() + 1, date.getFullYear());
};

export default function SalarySummary() {
    const [summaries, setSummaries] = useState<StaffSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [availablePeriods, setAvailablePeriods] = useState<string[]>([]);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("staff_salaries")
                .select(
                    `staff_id, total_salary, amount_paid, period_month, period_year,
           staff!inner(name, role, department, phone)`
                );

            if (error) {
                alert(error.message);
                setLoading(false);
                return;
            }

            const periods = [
                ...new Set(data?.map((d) => periodStr(d.period_month, d.period_year)))
            ].sort((a, b) =>
                new Date(`01 ${b}`) > new Date(`01 ${a}`) ? -1 : 1
            );
            setAvailablePeriods(periods);

            const filtered = data?.filter(
                (row) => periodStr(row.period_month, row.period_year) === selectedMonth
            );

            const map = new Map<string, StaffSummary>();

            filtered?.forEach((row: any) => {
                const key = row.staff_id;
                const existing = map.get(key);

                if (existing) {
                    existing.total_paid += row.amount_paid;
                    existing.balance = existing.total_salary - existing.total_paid;
                } else {
                    map.set(key, {
                        staff_id: row.staff_id,
                        name: row.staff.name,
                        role: row.staff.role,
                        department: row.staff.department,
                        phone: row.staff.phone,
                        total_salary: row.total_salary,
                        total_paid: row.amount_paid,
                        balance: row.total_salary - row.amount_paid,
                        period: periodStr(row.period_month, row.period_year),
                    });
                }
            });

            setSummaries(Array.from(map.values()));
            setLoading(false);
        })();
    }, [selectedMonth]);

    const filteredSummaries = summaries.filter((s) => {
        const query = searchQuery.toLowerCase();
        const matchSearch =
            s.name.toLowerCase().includes(query) ||
            s.staff_id.toLowerCase().includes(query) ||
            (s.phone || "").toLowerCase().includes(query);

        const matchRole = selectedRole ? s.role === selectedRole : true;
        const matchDept = selectedDept ? s.department === selectedDept : true;

        return matchSearch && matchRole && matchDept;
    });

    const uniqueRoles = [...new Set(summaries.map((s) => s.role).filter(Boolean))];
    const uniqueDepts = [...new Set(summaries.map((s) => s.department).filter(Boolean))];

    const exportToExcel = () => {
        const dataToExport = filteredSummaries.map((s) => ({
            "Staff ID": s.staff_id,
            "Staff Name": s.name,
            Phone: s.phone,
            Role: s.role,
            Department: s.department,
            Period: s.period,
            "Total Salary": s.total_salary,
            "Total Paid": s.total_paid,
            Balance: s.balance,
            Status: s.total_paid >= s.total_salary ? "Complete" : "Pending",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SalarySummary");
        XLSX.writeFile(workbook, `salary_summary_${selectedMonth}.xlsx`);
    };

    if (loading) return <p className="p-6">Loading…</p>;

    return (
        <div className="p-6 max-w-6xl mx-auto overflow-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-center flex-grow">Salary Summary</h1>
                <div className="flex gap-2 flex-wrap">
                    <a
                        href="/salary"
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Salary Records
                    </a>
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
                <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border px-3 py-2 rounded w-full md:w-1/4"
                >
                    <option value="">Filter by Month</option>
                    {availablePeriods.map((p) => (
                        <option key={p} value={p}>
                            {p}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Search by name, staff ID, or phone"
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
                        {[
                            "Staff ID",
                            "Staff Name",
                            "Phone",
                            "Role",
                            "Department",
                            "Period",
                            "Total Salary",
                            "Total Paid",
                            "Balance",
                            "Status",
                        ].map((h) => (
                            <th key={h} className="p-2 border">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filteredSummaries.map((s) => {
                        const isComplete = s.total_paid >= s.total_salary;
                        return (
                            <tr key={s.staff_id} className="border-t hover:bg-gray-50">
                                <td className="p-2 border">{s.staff_id}</td>
                                <td className="p-2 border">{s.name}</td>
                                <td className="p-2 border">{s.phone}</td>
                                <td className="p-2 border">{s.role}</td>
                                <td className="p-2 border">{s.department}</td>
                                <td className="p-2 border">{s.period}</td>
                                <td className="p-2 border text-right">{fmt(s.total_salary)}</td>
                                <td className="p-2 border text-right">{fmt(s.total_paid)}</td>
                                <td className="p-2 border text-right font-semibold">{fmt(s.balance)}</td>
                                <td
                                    className="p-2 font-semibold"
                                    style={{ color: isComplete ? "green" : "red" }}
                                >
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

