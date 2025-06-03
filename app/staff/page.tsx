"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/* ——— field helpers ——— */
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
        <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto">
            {children}
        </button>
    );
}

/* ——— static options ——— */
const roles = [
    "Teacher",
    "Bursar",
    "Cook",
    "Security",
    "Cleaner",
    "Librarian",
    "Nurse",
    "Accountant",
    "Administrator",
];
const classMap: { [key: string]: string } = {
    'Baby Class': 'B',
    'Middle Class': 'M',
    'Top Class': 'T',
    'Primary One': 'P1',
    'Primary Two': 'P2',
    'Primary Three': 'P3',
    'Primary Four': 'P4',
    'Primary Five': 'P5',
    'Primary Six': 'P6',
    'Primary Seven': 'P7',
};

const departments = ["Teaching", "Administration", "Support"];

export default function AddStaffPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: "",
        address: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        dob: "",
        class_to_teach: "",
        subjects: "",
        other_responsibility: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.from("staff").insert([form]);
        if (error) {
            alert(`Error adding staff: ${error.message}`);
            console.error(error);
        } else {
            alert("Staff added successfully!");
            setForm({
                name: "",
                address: "",
                email: "",
                phone: "",
                role: "",
                department: "",
                dob: "",
                class_to_teach: "",
                subjects: "",
                other_responsibility: "",
            });
        }
    };

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center">Add Staff Member</h1>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <Input type="email" label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input type="tel" label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Select label="Role / Title" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                        <option key={r}>{r}</option>
                    ))}
                </Select>
                <Select label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                        <option key={d}>{d}</option>
                    ))}
                </Select>
                <Input type="date" label="Date of Birth" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                <Select
                    label="Class to Teach (optional)"
                    value={form.class_to_teach}
                    onChange={(e) => setForm({ ...form, class_to_teach: e.target.value })}
                >
                    <option value="">Select Class</option>
                    {Object.keys(classMap).map((label) => (
                        <option key={label} value={label}>
                            {label}
                        </option>
                    ))}
                </Select>
                {/* <Input label="Class to Teach (optional)" value={form.class_to_teach} onChange={(e) => setForm({ ...form, class_to_teach: e.target.value })} /> */}
                <Input label="Subjects (comma‑separated)" value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} />
                <Input label="Other Responsibility" value={form.other_responsibility} onChange={(e) => setForm({ ...form, other_responsibility: e.target.value })} />
                <div className="md:col-span-2 flex justify-between">
                    <Button type="submit">Add Staff</Button>
                    <button type="button" className="underline text-blue-600" onClick={() => router.push("/Allstaff")}>
                        View All Staff
                    </button>
                </div>
            </form>
        </div>
    );
}
