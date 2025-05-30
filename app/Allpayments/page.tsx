'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Payment } from '@/types/payments';
import { useRef } from 'react';



const AllPayments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filterTerm, setFilterTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');
    const [search, setSearch] = useState('');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const fetchPayments = async () => {
            const { data, error } = await supabase.from('payments').select('*');

            if (error) {
                console.error('Error fetching payments:', error.message);
            } else {
                setPayments(data || []);
            }
        };

        fetchPayments();
    }, []);

    const filteredPayments = payments
        .filter((p) =>
            (filterTerm ? p.term === filterTerm : true) &&
            (filterYear ? p.year.toString() === filterYear : true) &&
            (search
                ? p.fullName.toLowerCase().includes(search.toLowerCase()) ||
                p.admissionNo.toLowerCase().includes(search.toLowerCase())
                : true)
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const calculateBalanceForPayment = (p: Payment) => {
        const sameStudentTerm = payments
            .filter(
                (x: Payment) =>
                    x.admissionNo === p.admissionNo &&
                    x.term === p.term &&
                    x.year === p.year &&
                    new Date(x.date) <= new Date(p.date)
            )
            .reduce((sum, x) => sum + x.amountPaid, 0);
        return p.totalFee - sameStudentTerm;
    };

    const handlePrint = () => {
        if (receiptRef.current) {
            const printContents = receiptRef.current.innerHTML;
            const printWindow = window.open('', '', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Payment Receipt</title>
                            <style>
                                body { font-family: sans-serif; padding: 20px; }
                                h1, h2 { text-align: center; }
                                img { display: block; margin: 0 auto; }
                                p { margin: 6px 0; }
                            </style>
                        </head>
                        <body>${printContents}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }
    };


    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">All Payments Records</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
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
            </div>

            {/* Table */}
            <div className="overflow-auto">
                <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2">Date</th>
                            <th className="border px-3 py-2">Name</th>
                            <th className="border px-3 py-2">Admission No</th>
                            <th className="border px-3 py-2">Class</th>
                            <th className="border px-3 py-2">Term</th>
                            <th className="border px-3 py-2">Year</th>
                            <th className="border px-3 py-2">Total Fee</th>
                            <th className="border px-3 py-2">Paid</th>
                            <th className="border px-3 py-2">Balance</th>
                            <th className="border px-3 py-2">Requirements</th>
                            <th className="border px-3 py-2">Receipt</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.map((p) => (
                            <tr key={p.id}>
                                <td className="border px-3 py-2">{new Date(p.date).toLocaleString()}</td>
                                <td className="border px-3 py-2">{p.fullName}</td>
                                <td className="border px-3 py-2">{p.admissionNo}</td>
                                <td className="border px-3 py-2">{p.classGrade}</td>
                                <td className="border px-3 py-2">{p.term}</td>
                                <td className="border px-3 py-2">{p.year}</td>
                                <td className="border px-3 py-2">UGX {p.totalFee}</td>
                                <td className="border px-3 py-2">UGX {p.amountPaid}</td>
                                <td className="border px-3 py-2">UGX {calculateBalanceForPayment(p)}</td>
                                <td className="border px-3 py-2">
                                    {Object.keys(p.requirements)
                                        .filter((key) => p.requirements[key])
                                        .join(', ') || 'None'}
                                </td>
                                <td className="border px-3 py-2">
                                    <button
                                        onClick={() => setSelectedPayment(p)}
                                        className="text-blue-600 underline"
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredPayments.length === 0 && (
                            <tr>
                                <td colSpan={11} className="text-center py-4 text-gray-500">
                                    No payments found for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>




            {/* Receipt Modal/Panel */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg relative">
                        <div ref={receiptRef}>
                            <img
                                src="/kutya_Mukama_Logo.png"
                                alt="School Logo"
                                className="mx-auto h-32 w-36 mb-2"
                            />
                            <h1 className="text-2xl font-bold text-center">Kutya Mukama Nursery and Primary School</h1>
                            <p className="text-sm text-gray-600 italic mt-2 mb-4 text-center">"Work hard for Success"</p>

                            <h2 className="text-xl font-semibold mb-4 text-center">Payment Receipt</h2>
                            <p><strong>Name:</strong> {selectedPayment.fullName}</p>
                            <p><strong>Admission No:</strong> {selectedPayment.admissionNo}</p>
                            <p><strong>Class:</strong> {selectedPayment.classGrade}</p>
                            <p><strong>Term:</strong> {selectedPayment.term}</p>
                            <p><strong>Year:</strong> {selectedPayment.year}</p>
                            <p><strong>Amount Paid:</strong> UGX {selectedPayment.amountPaid}</p>
                            <p><strong>Total Fee:</strong> UGX {selectedPayment.totalFee}</p>
                            <p><strong>Balance:</strong> UGX {calculateBalanceForPayment(selectedPayment)}</p>
                            <p><strong>Date:</strong> {new Date(selectedPayment.date).toLocaleString()}</p>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                                onClick={handlePrint}
                            >
                                Print
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                onClick={() => setSelectedPayment(null)}
                            >
                                Close
                            </button>
                        </div>

                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-black"
                            onClick={() => setSelectedPayment(null)}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
};

export default AllPayments;


// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient';
// import { Payment } from '@/types/payments';



// const AllPayments = () => {
//     //const [payments, setPayments] = useState([]);
//     const [payments, setPayments] = useState<Payment[]>([]);

//     const [filterTerm, setFilterTerm] = useState('');
//     const [filterYear, setFilterYear] = useState('');
//     const [search, setSearch] = useState('');

//     useEffect(() => {
//         const fetchPayments = async () => {
//             const { data, error } = await supabase.from('payments').select('*');

//             if (error) {
//                 console.error('Error fetching payments:', error.message);
//             } else {
//                 setPayments(data || []);
//             }
//         };

//         fetchPayments();
//     }, []);

//     const filteredPayments = payments
//         .filter((p) =>
//             (filterTerm ? p.term === filterTerm : true) &&
//             (filterYear ? p.year.toString() === filterYear : true) &&
//             (search
//                 ? p.fullName.toLowerCase().includes(search.toLowerCase()) ||
//                 p.admissionNo.toLowerCase().includes(search.toLowerCase())
//                 : true)
//         )
//         .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Latest first

//     const calculateBalanceForPayment = (p: Payment) => {
//         const sameStudentTerm = payments
//             .filter(
//                 (x: Payment) =>
//                     x.admissionNo === p.admissionNo &&
//                     x.term === p.term &&
//                     x.year === p.year &&
//                     new Date(x.date) <= new Date(p.date)
//             )
//             .reduce((sum, x) => sum + x.amountPaid, 0);
//         return p.totalFee - sameStudentTerm;
//     };

//     return (
//         <div className="p-4">
//             <h1 className="text-xl font-bold mb-4">All Payments Records</h1>

//             <div className="flex flex-wrap gap-4 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search by name or admission no"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="border rounded px-3 py-2 w-full sm:w-64"
//                 />

//                 <select
//                     value={filterTerm}
//                     onChange={(e) => setFilterTerm(e.target.value)}
//                     className="border rounded px-3 py-2"
//                 >
//                     <option value="">All Terms</option>
//                     <option value="Term I">Term I</option>
//                     <option value="Term II">Term II</option>
//                     <option value="Term III">Term III</option>
//                 </select>

//                 <input
//                     type="number"
//                     placeholder="Year"
//                     value={filterYear}
//                     onChange={(e) => setFilterYear(e.target.value)}
//                     className="border rounded px-3 py-2 w-24"
//                 />
//             </div>

//             <div className="overflow-auto">
//                 <table className="min-w-full bg-white border rounded shadow">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="border px-3 py-2">Date</th>
//                             <th className="border px-3 py-2">Name</th>
//                             <th className="border px-3 py-2">Admission No</th>
//                             <th className="border px-3 py-2">Class</th>
//                             <th className="border px-3 py-2">Term</th>
//                             <th className="border px-3 py-2">Year</th>
//                             <th className="border px-3 py-2">Total Fee</th>
//                             <th className="border px-3 py-2">Paid</th>
//                             <th className="border px-3 py-2">Balance</th>
//                             <th className="border px-3 py-2">Requirements</th>
//                             <th className="border px-3 py-2">Receipt</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredPayments.map((p) => (
//                             <tr key={p.id}>
//                                 <td className="border px-3 py-2">{new Date(p.date).toLocaleString()}</td>
//                                 <td className="border px-3 py-2">{p.fullName}</td>
//                                 <td className="border px-3 py-2">{p.admissionNo}</td>
//                                 <td className="border px-3 py-2">{p.classGrade}</td>
//                                 <td className="border px-3 py-2">{p.term}</td>
//                                 <td className="border px-3 py-2">{p.year}</td>
//                                 <td className="border px-3 py-2">UGX {p.totalFee}</td>
//                                 <td className="border px-3 py-2">UGX {p.amountPaid}</td>
//                                 <td className="border px-3 py-2">UGX {calculateBalanceForPayment(p)}</td>
//                                 <td className="border px-3 py-2">
//                                     {Object.keys(p.requirements)
//                                         .filter((key) => p.requirements[key])
//                                         .join(', ') || 'None'}
//                                 </td>
//                                 <td className="border px-3 py-2">
//                                     <button
//                                         onClick={() => window.open(`/receipt/${p.id}`, '_blank')}
//                                         className="text-blue-600 underline"
//                                     >
//                                         View
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}

//                         {filteredPayments.length === 0 && (
//                             <tr>
//                                 <td colSpan={11} className="text-center py-4 text-gray-500">
//                                     No payments found for the selected filters.
//                                 </td>
//                             </tr>
//                         )}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default AllPayments;


// 'use client';

// import React, { useState, useEffect } from 'react';
// //import { Button } from '@/components/ui/button'; // Tailwind UI components
// import { Input } from '@/components/ui/input';
// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';

// interface Payment {
//     id: number;
//     admissionNumber: string;
//     fullName: string;
//     classLevel: string;
//     term: string;
//     year: string;
//     date: string;
//     requirementsBrought: string;
//     pendingRequirements: string;
//     totalFee: number;
//     amountPaid: number;
//     balance: number;
// }

// const Button = ({ children, ...props }) => (
//     <button className="bg-blue-600 text-white py-2 px-4 rounded" {...props}>
//         {children}
//     </button>
// );


// const AllPayments = () => {
//     const [payments, setPayments] = useState<Payment[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         // Fetch or load payment records (this would usually be an API call)
//         const dummyData: Payment[] = [
//             {
//                 id: 1,
//                 admissionNumber: 'ADM123',
//                 fullName: 'John Doe',
//                 classLevel: 'Primary 4',
//                 term: 'Term 1',
//                 year: '2025',
//                 date: '2025-02-10',
//                 requirementsBrought: 'Books, Pens',
//                 pendingRequirements: 'Shoes',
//                 totalFee: 200000,
//                 amountPaid: 150000,
//                 balance: 50000,
//             },
//             // Add more records here...
//         ];
//         setPayments(dummyData);
//     }, []);

//     const filteredPayments = payments.filter(p =>
//         p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
//     );

//     const exportToExcel = () => {
//         const worksheet = XLSX.utils.json_to_sheet(filteredPayments);
//         const workbook = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
//         XLSX.writeFile(workbook, 'AllPayments.xlsx');
//     };

//     const exportToPDF = () => {
//         const doc = new jsPDF();
//         doc.text('All Payments Report', 14, 16);
//         doc.autoTable({
//             startY: 20,
//             head: [['ADM No', 'Name', 'Class', 'Term', 'Year', 'Date', 'Req. Brought', 'Pending', 'Total', 'Paid', 'Balance']],
//             body: filteredPayments.map(p => [
//                 p.admissionNumber,
//                 p.fullName,
//                 p.classLevel,
//                 p.term,
//                 p.year,
//                 p.date,
//                 p.requirementsBrought,
//                 p.pendingRequirements,
//                 p.totalFee,
//                 p.amountPaid,
//                 p.balance,
//             ]),
//         });
//         doc.save('AllPayments.pdf');
//     };

//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4">All Learner Payments</h1>

//             <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
//                 <Input
//                     placeholder="Search by name or admission number..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full md:w-1/3"
//                 />
//                 <div className="flex gap-2">
//                     <Button onClick={exportToExcel}>Export Excel</Button>
//                     <Button onClick={exportToPDF}>Export PDF</Button>
//                 </div>
//             </div>

//             <div className="overflow-x-auto">
//                 <table className="min-w-full table-auto border border-gray-200">
//                     <thead className="bg-gray-100">
//                         <tr className="text-sm font-medium text-left">
//                             <th className="px-3 py-2 border">ADM No</th>
//                             <th className="px-3 py-2 border">Name</th>
//                             <th className="px-3 py-2 border">Class</th>
//                             <th className="px-3 py-2 border">Term</th>
//                             <th className="px-3 py-2 border">Year</th>
//                             <th className="px-3 py-2 border">Date</th>
//                             <th className="px-3 py-2 border">Req. Brought</th>
//                             <th className="px-3 py-2 border">Pending</th>
//                             <th className="px-3 py-2 border">Total Fee</th>
//                             <th className="px-3 py-2 border">Paid</th>
//                             <th className="px-3 py-2 border">Balance</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredPayments.map((payment) => (
//                             <tr key={payment.id} className="text-sm hover:bg-gray-50">
//                                 <td className="px-3 py-2 border">{payment.admissionNumber}</td>
//                                 <td className="px-3 py-2 border">{payment.fullName}</td>
//                                 <td className="px-3 py-2 border">{payment.classLevel}</td>
//                                 <td className="px-3 py-2 border">{payment.term}</td>
//                                 <td className="px-3 py-2 border">{payment.year}</td>
//                                 <td className="px-3 py-2 border">{payment.date}</td>
//                                 <td className="px-3 py-2 border">{payment.requirementsBrought}</td>
//                                 <td className="px-3 py-2 border">{payment.pendingRequirements}</td>
//                                 <td className="px-3 py-2 border">{payment.totalFee}</td>
//                                 <td className="px-3 py-2 border">{payment.amountPaid}</td>
//                                 <td className="px-3 py-2 border">{payment.balance}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default AllPayments;



// 'use client';
// import { useState, useEffect } from 'react';

// export default function ViewPaymentsPage() {
//     const [payments, setPayments] = useState([]);
//     const [filterClass, setFilterClass] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');

//     useEffect(() => {
//         const stored = JSON.parse(localStorage.getItem('payments') || '[]');
//         setPayments(stored);
//     }, []);

//     const filtered = payments.filter((p: any) => {
//         const matchClass = filterClass ? p.classGrade === filterClass : true;
//         const matchSearch =
//             (p.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//             (p.admissionNo?.toLowerCase() || '').includes(searchTerm.toLowerCase());
//         return matchClass && matchSearch;
//     });

//     // Group payments by admission number to compute balances
//     const balances: Record<string, { fullName: string, totalFee: number, totalPaid: number }> = {};

//     filtered.forEach((p: any) => {
//         const adm = p.admissionNo || '';
//         if (!adm) return;
//         const amountPaid = Number(p.amountPaid) || 0;
//         const totalFee = Number(p.totalFee) || 0;

//         if (!balances[adm]) {
//             balances[adm] = {
//                 fullName: p.fullName || '',
//                 totalFee: totalFee,
//                 totalPaid: amountPaid,
//             };
//         } else {
//             balances[adm].totalPaid += amountPaid;
//             // If a newer totalFee is provided, prefer it
//             if (totalFee) balances[adm].totalFee = totalFee;
//         }
//     });

//     return (
//         <div className="max-w-6xl mx-auto p-4">
//             <h1 className="text-xl font-bold mb-4">📄 All Payment History</h1>

//             {/* Filters */}
//             <div className="flex flex-col md:flex-row gap-4 mb-4">
//                 <input
//                     type="text"
//                     placeholder="Search by Name or Admission No."
//                     className="input p-2 border rounded w-full md:w-1/2"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                 />

//                 <select
//                     className="input p-2 border rounded w-full md:w-1/2"
//                     onChange={(e) => setFilterClass(e.target.value)}
//                     value={filterClass}
//                 >
//                     <option value="">All Classes</option>
//                     <option value="Baby Class">Baby Class</option>
//                     <option value="Middle Class">Middle class</option>
//                     <option value="Top Class">Top Class</option>
//                     <option value="Primary One">Primary One </option>
//                     <option value="Primary Two">Primary Two </option>
//                     <option value="Primary Three">Primary Three </option>
//                     <option value="Primary Four">Primary Four </option>
//                     <option value="Primary Five">Primary Five </option>
//                     <option value="Primary Six">Primary Six </option>
//                     <option value="Primary Seven">Primary Seven </option>
//                 </select>
//             </div>

//             <table className="table-auto w-full border">
//                 <thead>
//                     <tr className="bg-gray-200">
//                         <th className="border px-2 py-1">Date</th>
//                         <th className="border px-2 py-1">Name</th>
//                         <th className="border px-2 py-1">Adm. No</th>
//                         <th className="border px-2 py-1">Class</th>
//                         <th className="border px-2 py-1">Amount Paid</th>
//                         <th className="border px-2 py-1">Total Fee</th>
//                         <th className="border px-2 py-1">Balance</th>
//                         <th className="border px-2 py-1">Requirements</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filtered.length > 0 ? (
//                         filtered.map((p: any, i: number) => {
//                             const balanceInfo = balances[p.admissionNo] || { totalFee: 0, totalPaid: 0 };
//                             const balance = balanceInfo.totalFee - balanceInfo.totalPaid;

//                             return (
//                                 <tr key={i}>
//                                     <td className="border px-2 py-1">{new Date(p.date).toLocaleString()}</td>
//                                     <td className="border px-2 py-1">{p.fullName}</td>
//                                     <td className="border px-2 py-1">{p.admissionNo}</td>
//                                     <td className="border px-2 py-1">{p.classGrade}</td>
//                                     <td className="border px-2 py-1">{p.amountPaid || ''}</td>
//                                     <td className="border px-2 py-1">{p.totalFee || ''}</td>
//                                     <td className="border px-2 py-1 text-red-600 font-bold">
//                                         {balanceInfo.totalFee ? balance : '—'}
//                                     </td>
//                                     <td className="border px-2 py-1">
//                                         {Object.keys(p.requirements || {})
//                                             .filter((r) => p.requirements[r])
//                                             .join(', ') || 'None'}
//                                     </td>
//                                 </tr>
//                             );
//                         })
//                     ) : (
//                         <tr>
//                             <td colSpan={8} className="text-center py-4">No payment records found.</td>
//                         </tr>
//                     )}
//                 </tbody>
//             </table>
//         </div>
//     );
// }



