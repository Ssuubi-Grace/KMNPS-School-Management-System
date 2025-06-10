'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import * as XLSX from 'xlsx';

interface Summary {
    admissionNo: string;
    fullName: string;
    classGrade: string;
    term: string;
    year: number;
    totalFee: number;
    totalPaid: number;
    balance: number;
    date: string; // latest payment date
    requirements: string[];
}

const LatestPaymentsSummary = () => {
    const [summaryData, setSummaryData] = useState<Summary[]>([]);
    const [search, setSearch] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [filterClass, setFilterClass] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            const { data, error } = await supabase.from('payments').select('*');

            if (error) {
                console.error('Error fetching payments:', error.message);
                return;
            }
            if (!data) return;

            const grouped = new Map<string, Summary>();

            for (const p of data) {
                const key = `${p.admissionNo}_${p.term}_${p.year}`;
                const existing = grouped.get(key);

                // Collect requirements keys that are true
                const requirements = p.requirements
                    ? Object.keys(p.requirements).filter((key) => p.requirements[key])
                    : [];

                if (existing) {
                    existing.totalPaid += p.amountPaid;
                    // Pick latest totalFee and date
                    if (new Date(p.date) > new Date(existing.date)) {
                        existing.totalFee = p.totalFee;
                        existing.date = p.date;
                        existing.requirements = requirements; // update to latest requirements too
                    }
                    existing.balance = existing.totalFee - existing.totalPaid;
                } else {
                    grouped.set(key, {
                        admissionNo: p.admissionNo,
                        fullName: p.fullName,
                        classGrade: p.classGrade,
                        term: p.term,
                        year: p.year,
                        totalFee: p.totalFee,
                        totalPaid: p.amountPaid,
                        balance: p.totalFee - p.amountPaid,
                        date: p.date,
                        requirements,
                    });
                }
            }

            setSummaryData(Array.from(grouped.values()));
        };

        fetchSummary();
    }, []);

    // Apply filters and search
    const filteredData = useMemo(() => {
        return summaryData.filter((item) => {
            const searchMatch =
                search === '' ||
                item.fullName.toLowerCase().includes(search.toLowerCase()) ||
                item.admissionNo.toLowerCase().includes(search.toLowerCase());
            const termMatch = filterTerm === '' || item.term === filterTerm;
            const yearMatch = filterYear === '' || item.year.toString() === filterYear;
            const classMatch = filterClass === '' || item.classGrade === filterClass;

            return searchMatch && termMatch && yearMatch && classMatch;
        });
    }, [summaryData, search, filterTerm, filterYear, filterClass]);

    // Export to Excel handler
    const exportToExcel = () => {
        const worksheetData = filteredData.map((item) => ({
            'Name': item.fullName,
            'Admission No': item.admissionNo,
            'Class': item.classGrade,
            'Term': item.term,
            'Year': item.year,
            'Total Fee': item.totalFee,
            'Total Paid': item.totalPaid,
            'Balance': item.balance,
            'Date': new Date(item.date).toLocaleString(),
            'Requirements': item.requirements.join(', ') || 'None',
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments Summary');
        XLSX.writeFile(workbook, 'payments_summary.xlsx');
    };

    // Gather unique classes for the filter dropdown
    const uniqueClasses = Array.from(new Set(summaryData.map((item) => item.classGrade))).sort();

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Latest Payment Summary Per Student</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 items-center">
                <input
                    type="text"
                    placeholder="Search by name or admission no"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded px-3 py-2 w-full sm:w-64"
                />

                <select
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All Terms</option>
                    <option value="Term I">Term I</option>
                    <option value="Term II">Term II</option>
                    <option value="Term III">Term III</option>
                </select>

                <input
                    type="number"
                    placeholder="Year"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="border rounded px-3 py-2 w-24"
                />

                <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="border rounded px-3 py-2"
                >
                    <option value="">All Classes</option>
                    {uniqueClasses.map((cls) => (
                        <option key={cls} value={cls}>
                            {cls}
                        </option>
                    ))}
                </select>

                <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Export to Excel
                </button>
            </div>

            {/* Table */}
            <div className="overflow-auto">
                <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2">Name</th>
                            <th className="border px-3 py-2">Admission No</th>
                            <th className="border px-3 py-2">Class</th>
                            <th className="border px-3 py-2">Term</th>
                            <th className="border px-3 py-2">Year</th>
                            <th className="border px-3 py-2">Total Fee</th>
                            <th className="border px-3 py-2">Total Paid</th>
                            <th className="border px-3 py-2">Balance</th>
                            <th className="border px-3 py-2">Date</th>
                            <th className="border px-3 py-2">Requirements</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td className="border px-3 py-2">{item.fullName}</td>
                                <td className="border px-3 py-2">{item.admissionNo}</td>
                                <td className="border px-3 py-2">{item.classGrade}</td>
                                <td className="border px-3 py-2">{item.term}</td>
                                <td className="border px-3 py-2">{item.year}</td>
                                <td className="border px-3 py-2">UGX {item.totalFee}</td>
                                <td className="border px-3 py-2">UGX {item.totalPaid}</td>
                                <td className="border px-3 py-2">UGX {item.balance}</td>
                                <td className="border px-3 py-2">{new Date(item.date).toLocaleString()}</td>
                                <td className="border px-3 py-2">
                                    {item.requirements.length > 0 ? item.requirements.join(', ') : 'None'}
                                </td>
                            </tr>
                        ))}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={10} className="text-center py-4 text-gray-500">
                                    No summary data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LatestPaymentsSummary;




// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { Payment } from '@/types/payments';

// interface Summary {
//     admissionNo: string;
//     fullName: string;
//     classGrade: string;
//     term: string;
//     year: number;
//     totalFee: number;
//     totalPaid: number;
//     balance: number;
//     date: string;
// }

// const LatestPaymentsSummary = () => {
//     const [summaryData, setSummaryData] = useState<Summary[]>([]);

//     useEffect(() => {
//         const fetchSummary = async () => {
//             const { data, error } = await supabase.from('payments').select('*');

//             if (error) {
//                 console.error('Error fetching payments:', error.message);
//                 return;
//             }

//             if (!data) return;

//             const grouped = new Map<string, Summary>();

//             for (const p of data) {
//                 const key = `${p.admissionNo}_${p.term}_${p.year}`;
//                 const existing = grouped.get(key);

//                 if (existing) {
//                     existing.totalPaid += p.amountPaid;
//                     // Always pick the latest totalFee based on date
//                     if (new Date(p.date) > new Date(existing.date)) {
//                         existing.totalFee = p.totalFee;
//                         existing.date = p.date;
//                     }
//                     existing.balance = existing.totalFee - existing.totalPaid;
//                 } else {
//                     grouped.set(key, {
//                         admissionNo: p.admissionNo,
//                         fullName: p.fullName,
//                         classGrade: p.classGrade,
//                         term: p.term,
//                         year: p.year,
//                         totalFee: p.totalFee,
//                         totalPaid: p.amountPaid,
//                         balance: p.totalFee - p.amountPaid,
//                         date: p.date, // temp field to track latest fee
//                     });
//                 }
//             }

//             const result = Array.from(grouped.values());

//             setSummaryData(result);
//         };

//         fetchSummary();
//     }, []);

//     return (
//         <div className="p-4">
//             <h1 className="text-xl font-bold mb-4">Latest Payment Summary Per Student</h1>

//             <div className="overflow-auto">
//                 <table className="min-w-full bg-white border rounded shadow">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="border px-3 py-2">Name</th>
//                             <th className="border px-3 py-2">Admission No</th>
//                             <th className="border px-3 py-2">Class</th>
//                             <th className="border px-3 py-2">Term</th>
//                             <th className="border px-3 py-2">Year</th>
//                             <th className="border px-3 py-2">Total Fee</th>
//                             <th className="border px-3 py-2">Total Paid</th>
//                             <th className="border px-3 py-2">Balance</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {summaryData.map((item, index) => (
//                             <tr key={index}>
//                                 <td className="border px-3 py-2">{item.fullName}</td>
//                                 <td className="border px-3 py-2">{item.admissionNo}</td>
//                                 <td className="border px-3 py-2">{item.classGrade}</td>
//                                 <td className="border px-3 py-2">{item.term}</td>
//                                 <td className="border px-3 py-2">{item.year}</td>
//                                 <td className="border px-3 py-2">UGX {item.totalFee}</td>
//                                 <td className="border px-3 py-2">UGX {item.totalPaid}</td>
//                                 <td className="border px-3 py-2">UGX {item.balance}</td>
//                             </tr>
//                         ))}
//                         {summaryData.length === 0 && (
//                             <tr>
//                                 <td colSpan={8} className="text-center py-4 text-gray-500">
//                                     No summary data available.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default LatestPaymentsSummary;
