"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
    <button
      {...props}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full md:w-auto"
    >
      {children}
    </button>
  );
}

const terms = ["Term I", "Term II", "Term III"];

export default function VisitorsPage() {
  const [form, setForm] = useState({
    name: "",
    adress: "",
    person_to_see: "",
    purpose: "",
    visit_date: "",
    term: "",
    time_in: "",
    time_out: "",
    phone: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("visitors").insert([form]);
    if (error) {
      console.error("Insert Error:", error);
      alert(`Error adding visitor: ${error.message}`);
    } else {
      alert("Visitor added successfully!");
      setForm({
        name: "",
        adress: "",
        person_to_see: "",
        purpose: "",
        visit_date: "",
        term: "",
        time_in: "",
        time_out: "",
        phone: "",
        email: "",
      });
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">Add Visitor</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Input label="Visitor Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Address" value={form.adress} onChange={(e) => setForm({ ...form, adress: e.target.value })} />
        <Input label="Person to See" value={form.person_to_see} onChange={(e) => setForm({ ...form, person_to_see: e.target.value })} />
        <Input label="Purpose of Visit" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
        <Input type="date" label="Date of Visit" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
        <Select label="Select Term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })}>
          <option value="">Select Term</option>
          {terms.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Input type="time" label="Time In" value={form.time_in} onChange={(e) => setForm({ ...form, time_in: e.target.value })} />
        <Input type="time" label="Time Out" value={form.time_out} onChange={(e) => setForm({ ...form, time_out: e.target.value })} />
        <Input type="tel" label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input type="email" label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <div className="md:col-span-2">
          <Button type="submit">Add Visitor</Button>
        </div>
      </form>

      <div className="text-center">
        <a
          href="/Allvisitors"
          className="inline-block text-blue-600 hover:underline font-medium"
        >
          View All Visitors
        </a>
      </div>
    </div>
  );
}
