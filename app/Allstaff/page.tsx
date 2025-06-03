"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/* —— helpers —— */
function Input({ label, ...props }: { label?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            {label && <label className="block text-sm font-medium mb-1">{label}</label>}
            <input {...props} className="border p-2 w-full rounded" />
        </div>
    );
}
function Select({ label, children, ...props }: { label?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
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
        <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {children}
        </button>
    );
}

/* —— data shape —— */
interface Staff {
    id: string;
    name: string;
    address: string | null;
    email: string | null;
    phone: string | null;
    role: string | null;
    department: string | null;
    dob: string | null;
    class_to_teach: string | null;
    subjects: string | null;
    other_responsibility: string | null;
}

/* —— static options —— */
const roles = ["Teacher", "Bursar", "Cook", "Security", "Cleaner", "Librarian", "Nurse", "Accountant", "Administrator"];
const departments = ["Teaching", "Administration", "Support"];

/* —— fetch helper —— */
const fetchStaff = async (setStaff: React.Dispatch<React.SetStateAction<Staff[]>>) => {
    const { data, error } = await supabase.from("staff").select("*").order("name");
    if (error) {
        alert(`Error fetching staff: ${error.message}`);
        console.error(error);
    } else {
        setStaff(data as Staff[]);
    }
};

export default function StaffListPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [filterRole, setFilterRole] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchStaff(setStaff);
        const onFocus = () => fetchStaff(setStaff);
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, []);

    const filteredStaff = useMemo(() => {
        return staff.filter((s) => {
            if (filterRole && s.role !== filterRole) return false;
            if (filterDept && s.department !== filterDept) return false;
            if (search) {
                const q = search.toLowerCase();
                const hay = `${s.name} ${s.email ?? ""} ${s.phone ?? ""}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [staff, filterRole, filterDept, search]);

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-6">
            {/* header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">All Staff Members</h1>
                <a href="/staff" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add Staff
                </a>
            </div>

            {/* filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                <Input label="Search" placeholder="Name, email, phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
                <Select label="Filter by Role" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">All Roles</option>
                    {roles.map((r) => (
                        <option key={r}>{r}</option>
                    ))}
                </Select>
                <Select label="Filter by Department" value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                        <option key={d}>{d}</option>
                    ))}
                </Select>
            </div>

            {/* table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2">Name</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Department</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">DOB</th>
                            <th className="p-2">Class</th>
                            <th className="p-2">Subjects</th>
                            <th className="p-2">Other Responsibility</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.length ? (
                            filteredStaff.map((s) => (
                                <tr key={s.id} className="border-t">
                                    <td className="p-2">{s.name}</td>
                                    <td className="p-2">{s.role}</td>
                                    <td className="p-2">{s.department}</td>
                                    <td className="p-2">{s.email}</td>
                                    <td className="p-2">{s.phone}</td>
                                    <td className="p-2">{s.dob}</td>
                                    <td className="p-2">{s.class_to_teach}</td>
                                    <td className="p-2">{s.subjects}</td>
                                    <td className="p-2">{s.other_responsibility}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="text-center text-gray-500 p-4">
                                    No staff records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
