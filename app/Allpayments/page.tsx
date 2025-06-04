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

