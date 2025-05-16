'use client';
import { useState, useEffect } from 'react';

export default function ViewPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [filterClass, setFilterClass] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('payments') || '[]');
        setPayments(stored);
    }, []);

    const filtered = payments.filter((p: any) => {
        const matchClass = filterClass ? p.classGrade === filterClass : true;
        const matchSearch =
            (p.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (p.admissionNo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        return matchClass && matchSearch;
    });

    // Group payments by admission number to compute balances
    const balances: Record<string, { fullName: string, totalFee: number, totalPaid: number }> = {};

    filtered.forEach((p: any) => {
        const adm = p.admissionNo || '';
        if (!adm) return;
        const amountPaid = Number(p.amountPaid) || 0;
        const totalFee = Number(p.totalFee) || 0;

        if (!balances[adm]) {
            balances[adm] = {
                fullName: p.fullName || '',
                totalFee: totalFee,
                totalPaid: amountPaid,
            };
        } else {
            balances[adm].totalPaid += amountPaid;
            // If a newer totalFee is provided, prefer it
            if (totalFee) balances[adm].totalFee = totalFee;
        }
    });

    return (
        <div className="max-w-6xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">📄 All Payment History</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search by Name or Admission No."
                    className="input p-2 border rounded w-full md:w-1/2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                    className="input p-2 border rounded w-full md:w-1/2"
                    onChange={(e) => setFilterClass(e.target.value)}
                    value={filterClass}
                >
                    <option value="">All Classes</option>
                    <option value="Baby Class">Baby Class</option>
                    <option value="Middle Class">Middle class</option>
                    <option value="Top Class">Top Class</option>
                    <option value="Primary One">Primary One </option>
                    <option value="Primary Two">Primary Two </option>
                    <option value="Primary Three">Primary Three </option>
                    <option value="Primary Four">Primary Four </option>
                    <option value="Primary Five">Primary Five </option>
                    <option value="Primary Six">Primary Six </option>
                    <option value="Primary Seven">Primary Seven </option>
                </select>
            </div>

            <table className="table-auto w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-1">Date</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Adm. No</th>
                        <th className="border px-2 py-1">Class</th>
                        <th className="border px-2 py-1">Amount Paid</th>
                        <th className="border px-2 py-1">Total Fee</th>
                        <th className="border px-2 py-1">Balance</th>
                        <th className="border px-2 py-1">Requirements</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map((p: any, i: number) => {
                            const balanceInfo = balances[p.admissionNo] || { totalFee: 0, totalPaid: 0 };
                            const balance = balanceInfo.totalFee - balanceInfo.totalPaid;

                            return (
                                <tr key={i}>
                                    <td className="border px-2 py-1">{new Date(p.date).toLocaleString()}</td>
                                    <td className="border px-2 py-1">{p.fullName}</td>
                                    <td className="border px-2 py-1">{p.admissionNo}</td>
                                    <td className="border px-2 py-1">{p.classGrade}</td>
                                    <td className="border px-2 py-1">{p.amountPaid || ''}</td>
                                    <td className="border px-2 py-1">{p.totalFee || ''}</td>
                                    <td className="border px-2 py-1 text-red-600 font-bold">
                                        {balanceInfo.totalFee ? balance : '—'}
                                    </td>
                                    <td className="border px-2 py-1">
                                        {Object.keys(p.requirements || {})
                                            .filter((r) => p.requirements[r])
                                            .join(', ') || 'None'}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center py-4">No payment records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}



