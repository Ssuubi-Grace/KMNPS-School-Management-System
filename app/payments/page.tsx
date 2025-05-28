'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const currentYear = new Date().getFullYear();
const terms = ['Term I', 'Term II', 'Term III'];



export default function PaymentsPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [totalFee, setTotalFee] = useState('');
    const [term, setTerm] = useState(terms[0]);
    const [year, setYear] = useState(currentYear);
    const [payments, setPayments] = useState([]);
    //receipt
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [requirements, setRequirements] = useState({
        broom: false,
        ream: false,
        toiletPaper: false,
        liquidSoap: false,
        jik: false,
    }); 
    const [editPaymentId, setEditPaymentId] = useState(null);
    const [filterTerm, setFilterTerm] = useState('');
    const [filterYear, setFilterYear] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const { data: studentData } = await supabase.from('pupils').select('*');
            setStudents(studentData || []);

            const { data: paymentData } = await supabase.from('payments').select('*');
            setPayments(paymentData || []);
        };

        fetchData();
    }, []);

    const filteredStudents = students.filter(
        (student) =>
            student.fullName.toLowerCase().includes(selectedStudent.toLowerCase()) ||
            student.admissionNo.toLowerCase().includes(selectedStudent.toLowerCase())
    );

    const matchedStudent = students.find(
        (s) =>
            s.admissionNo.toLowerCase() === selectedStudent.toLowerCase() ||
            s.fullName.toLowerCase() === selectedStudent.toLowerCase()
    );

    useEffect(() => {
        if (matchedStudent) {
            const studentPayments = payments.filter(
                (p) => p.admissionNo === matchedStudent.admissionNo
            );
            if (studentPayments.length > 0) {
                const latest = studentPayments[studentPayments.length - 1];
                setTotalFee(latest.totalFee?.toString() || '');
            } else {
                setTotalFee('');
            }
        }
    }, [matchedStudent, payments]);

    const handlePayment = async () => {
        if (!matchedStudent) {
            alert('Please enter a valid student name or admission number');
            return;
        }

        if (!totalFee || isNaN(parseInt(totalFee))) {
            alert('Please enter a valid total fee');
            return;
        }

        if (!amountPaid || isNaN(parseInt(amountPaid))) {
            alert('Please enter a valid amount paid');
            return;
        }

        const paymentData = {
            admissionNo: matchedStudent.admissionNo,
            fullName: matchedStudent.fullName,
            classGrade: matchedStudent.classGrade,
            amountPaid: parseInt(amountPaid),
            totalFee: parseInt(totalFee),
           // balance: balance, //have added it to reflect in the db
            
            //balance: getBalance(),
            //balance: parseInt(totalFee || '0') - (getTotalPaid() + parseInt(amountPaid || '0')),
            balance: Number(totalFee) - (getTotalPaid() + Number(amountPaid)),


            requirements,
            date: new Date().toISOString(),
            term,
            year
        };

        if (editPaymentId) {
            const { error } = await supabase
                .from('payments')
                .update(paymentData)
                .eq('id', editPaymentId);

            if (error) {
                console.error('Supabase Update Error:', error.message);
                //alert('Error updating payment');
                //alert(Error saving payment: ${error.message}); //edited the code to log the error message
                alert(`Error saving payment: ${error.message}`);

                return;
            }
            setEditPaymentId(null);
            alert('Payment updated successfully!');
        } else {
            const { error } = await supabase.from('payments').insert([paymentData]);
            if (error) {
                console.error('Supabase Insert Error:', error.message);
                //alert(Error saving payment: ${error.message});
                alert(`Error saving payment: ${error.message}`);
                return;
            }
            // const { error } = await supabase.from('payments').insert([paymentData]);
            // if (error) {
            //     alert('Error saving payment');
            //     return;
            // }
            
            alert('Payment recorded successfully!');
        }

        setAmountPaid('');
        setRequirements({
            broom: false,
            ream: false,
            toiletPaper: false,
            liquidSoap: false,
            jik: false,
        });

        const { data: updatedPayments } = await supabase.from('payments').select('*');
        setPayments(updatedPayments || []);
    };

    const getTotalPaid = () => {
        return payments
            .filter((p) => p.admissionNo === matchedStudent?.admissionNo)
            .reduce((sum, p) => sum + p.amountPaid, 0);
    };

    const getBalance = () => {
        return parseInt(totalFee || '0') - getTotalPaid();
    };

    //defining this here  rather than putting it directly in the td
    const calculateBalanceForPayment = (p) => {
        const paid = payments
            .filter((x) => x.admissionNo === p.admissionNo && x.term === p.term && x.year === p.year && x.date <= p.date)
            .reduce((sum, x) => sum + x.amountPaid, 0);
        return p.totalFee - paid;
    };
    

    const paymentHistory = () => {
        return payments
        .filter((p) => {
            return (
                p.admissionNo === matchedStudent?.admissionNo &&
                (filterTerm ? p.term === filterTerm : true) &&
                (filterYear ? p.year.toString() === filterYear : true)
            );
        })
        
            // .filter((p) =>
            //     p.admissionNo === matchedStudent?.admissionNo &&
            //     (filterTerm ? p.term === filterTerm : true) &&
            //     (filterYear ? p.year.toString() === filterYear : true)
            // )

            .map((p, index) => (
                <tr key={p.id || index}>
                    <td>{new Date(p.date).toLocaleString()}</td>
                    <td>{p.fullName}</td>
                    <td>{p.admissionNo}</td>
                    <td>{p.totalFee}</td>
                    
                    <td>{p.amountPaid}</td>
                    <td>{calculateBalanceForPayment(p)}</td>
                    
                    {/* <td>{p.totalFee - payments
                    .filter((x) => x.admissionNo === p.admissionNo && x.term === p.term && x.year === p.year && x.date <= p.date)
                    .reduce((sum, x) => sum + x.amountPaid, 0)}</td> */}


                    <td>{Object.keys(p.requirements).filter((key) => p.requirements[key]).join(', ')}</td>
                    <td>{p.term}</td>
                    <td>{p.year}</td>

                    <td>
                        <button
                            className="text-blue-600 underline"
                            onClick={() => {
                                setEditPaymentId(p.id);
                                setAmountPaid(p.amountPaid.toString());
                                setTotalFee(p.totalFee.toString());
                                setRequirements(p.requirements);
                                setTerm(p.term);
                                setYear(p.year);
                            }}
                        >
                            Edit
                        </button>

                        <button
                            className="text-green-600 underline"
                            onClick={() => setSelectedReceipt(p)}
                        >
                            Receipt
                        </button>
                    </td>
                </tr>
            ));
    };


    //receipt
    const ReceiptModal = ({ payment, onClose }) => {
        if (!payment) return null;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
                    >
                        ✖
                    </button>
                    <img
                        src="/kutya_Mukama_Logo.png" 
                        alt="School Logo"
                        className="mx-auto h-32  w-36 mb-2"
                    />
                    <h1 className="text-2xl font-bold">Kutya Mukama Nursery and Primary School</h1>
                    <p className="text-sm text-gray-600 italic mt-2 mb-4">"Work hard for Sucess"</p>
                    <h2 className="text-xl font-semibold mb-4">Payment Receipt</h2>
                    <p><strong>Date:</strong> {new Date(payment.date).toLocaleString()}</p>
                    <p><strong>Name:</strong> {payment.fullName}</p>
                    <p><strong>Admission No:</strong> {payment.admissionNo}</p>
                    <p><strong>Class:</strong> {payment.classGrade}</p>
                    <p><strong>Term:</strong> {payment.term} {payment.year}</p>
                    <p><strong>Total Fee:</strong> UGX {payment.totalFee}</p>
                    <p><strong>Amount Paid:</strong> UGX {payment.amountPaid}</p>
                    <p><strong>Balance:</strong> UGX {payment.balance}</p>
                    <p><strong>Requirements:</strong> {Object.keys(payment.requirements).filter(k => payment.requirements[k]).join(', ') || 'None'}</p>
                    <p className="italic text-sm font-bold  mt-4 mb-4">"Thank you for supporting the education of our children!"</p>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => window.print()}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Print
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    
    
    const hasMadePayment = matchedStudent &&
        payments.some((p) => p.admissionNo === matchedStudent.admissionNo);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">💳 Payments and Requirements</h1>

            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search by Name or Admission Number"
                    value={
                        matchedStudent
                            ? `${matchedStudent.fullName} (${matchedStudent.admissionNo})`
                            : selectedStudent
                    }
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="input w-full p-2 border rounded"
                />
                {selectedStudent && filteredStudents.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
                        {filteredStudents.map((student) => (
                            <li
                                key={student.admissionNo}
                                //onClick={() => setSelectedStudent(student.fullName)} just cahanged to admission number coz This may break if a student's name isn’t unique. It's safer to use admission number:
                                onClick={() => setSelectedStudent(student.admissionNo)}

                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            >
                                {student.fullName} ({student.admissionNo})
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {matchedStudent && (
                <div className="mb-4">
                    <h2 className="font-semibold">Student Details</h2>
                    <p>Name: {matchedStudent.fullName}</p>
                    <p>Class: {matchedStudent.classGrade}</p>
                    <p>Total Fees: UGX {totalFee || 'Not Set'}</p>
                    <p>Total Paid: UGX {getTotalPaid()}</p>
                    <p>Balance: UGX {getBalance()}</p>
                </div>
            )}

            <input
                type="number"
                placeholder="Enter Total Fee"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="input w-full mb-2 p-2 border rounded"
                disabled={hasMadePayment} //added this to disable editing the total fee once paid
            />

            <input
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="input w-full mb-2 p-2 border rounded"
            />

            <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="input w-full mb-2 p-2 border rounded"
            >
                {terms.map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>

            <input
                type="number"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="input w-full mb-2 p-2 border rounded"
            />

            <h2 className="font-semibold">Requirements</h2>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.keys(requirements).map((item) => (
                    <label key={item} className="capitalize">
                        <input
                            type="checkbox"
                            checked={requirements[item]}
                            onChange={() =>
                                setRequirements((prev) => ({
                                    ...prev,
                                    [item]: !prev[item],
                                }))
                            }
                            className="mr-2"
                        />
                        {item}
                    </label>
                ))}
            </div>

            <button
                onClick={handlePayment}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                {editPaymentId ? 'Update Payment' : 'Record Payment'}
            </button>

            {matchedStudent && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    <div className="flex gap-2 mb-2">
                        <select
                            className="border p-1 rounded"
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                        >
                            <option value="">All Terms</option>
                            {terms.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Filter by Year"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="border p-1 rounded"
                        />
                    </div>

                    <table className="table-auto w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-2 py-1 whitespace-nowrap">Date</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Full Name</th>
                                <th className="border px-2 py-1 whitespace-nowrap">admissionNo </th>
                                <th className="border px-2 py-1 whitespace-nowrap">Total Fee</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Amount Paid</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Balance</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Requirements</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Term</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Year</th>
                                <th className="border px-2 py-1 whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>{paymentHistory()}</tbody>
                        
                    </table>
                </div>
            )}

            {selectedReceipt && (
                <ReceiptModal
                    payment={selectedReceipt}
                    onClose={() => setSelectedReceipt(null)}
            />
)}


        </div>
    );
}




// // //ALLOWS ME TO SET A TOTAL FEE
// 'use client';
// import { useState, useEffect } from 'react';

// export default function PaymentsPage() {
//   return (
//     <div className="text-center">
//     </div>
//   )
// }

// export default function PaymentsPage() {
//     const [students, setStudents] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState('');
//     const [amountPaid, setAmountPaid] = useState('');
//     const [totalFee, setTotalFee] = useState('');
//     const [requirements, setRequirements] = useState({
//         broom: false,
//         ream: false,
//         toiletPaper: false,
//         liquidSoap: false,
//         jick: false,
//     });

//     useEffect(() => {
//         const saved = JSON.parse(localStorage.getItem('pupilData') || '[]');
//         setStudents(saved);
//     }, []);

//     const filteredStudents = students.filter(
//         (student) =>
//             student.fullName.toLowerCase().includes(selectedStudent.toLowerCase()) ||
//             student.admissionNo.toLowerCase().includes(selectedStudent.toLowerCase())
//     );

//     const matchedStudent = students.find(
//         (s) =>
//             s.admissionNo.toLowerCase() === selectedStudent.toLowerCase() ||
//             s.fullName.toLowerCase() === selectedStudent.toLowerCase()
//     );

//     useEffect(() => {
//         if (matchedStudent) {
//             const allPayments = JSON.parse(localStorage.getItem('payments') || '[]');
//             const studentPayments = allPayments.filter(
//                 (p: any) => p.admissionNo === matchedStudent.admissionNo
//             );

//             if (studentPayments.length > 0) {
//                 const latest = studentPayments[studentPayments.length - 1];
//                 setTotalFee(latest.totalFee?.toString() || '');
//             } else {
//                 setTotalFee('');
//             }
//         }
//     }, [matchedStudent]);

//     const handlePayment = () => {
//         if (!matchedStudent) {
//             alert('Please enter a valid student name or admission number');
//             return;
//         }

//         if (!totalFee || isNaN(parseInt(totalFee))) {
//             alert('Please enter a valid total fee');
//             return;
//         }

//         if (!amountPaid || isNaN(parseInt(amountPaid))) {
//             alert('Please enter a valid amount paid');
//             return;
//         }

//         const existing = JSON.parse(localStorage.getItem('payments') || '[]');

//         const newPayment = {
//             admissionNo: matchedStudent.admissionNo,
//             fullName: matchedStudent.fullName,
//             classGrade: matchedStudent.classGrade,
//             amountPaid: parseInt(amountPaid),
//             totalFee: parseInt(totalFee),
//             requirements,
//             date: new Date().toISOString(),
//         };

//         localStorage.setItem('payments', JSON.stringify([...existing, newPayment]));
//         alert('Payment recorded successfully!');
//         setAmountPaid('');
//         setRequirements({
//             broom: false,
//             ream: false,
//             toiletPaper: false,
//             liquidSoap: false,
//             jick: false,
//         });
//     };

//     const getTotalPaid = () => {
//         const studentPayments = JSON.parse(localStorage.getItem('payments') || '[]');
//         return studentPayments
//             .filter((payment: any) => payment.admissionNo === matchedStudent?.admissionNo)
//             .reduce((sum: number, payment: any) => sum + payment.amountPaid, 0);
//     };

//     const getBalance = () => {
//         //return parseInt(totalFee || '0') - getTotalPaid();
//         return parseInt(totalFee) - getTotalPaid();
//     };

//     const paymentHistory = () => {
//         const studentPayments = JSON.parse(localStorage.getItem('payments') || '[]');
//         const filteredPayments = studentPayments.filter(
//             (payment: any) => payment.admissionNo === matchedStudent?.admissionNo
//         );
//         return filteredPayments.map((payment: any, index: number) => (
//             <tr key={index}>
//                 <td>{new Date(payment.date).toLocaleString()}</td>
//                 <td>{payment.amountPaid}</td>
//                 <td>{Object.keys(payment.requirements).filter((key) => payment.requirements[key]).join(', ')}</td>
//             </tr>
//         ));
//     };


//     const hasMadePayment = matchedStudent &&
//         JSON.parse(localStorage.getItem('payments') || '[]')
//             .some((p) => p.admissionNo === matchedStudent.admissionNo);


//     return (
//         <div className="max-w-3xl mx-auto p-4">
//             <h1 className="text-xl font-bold mb-4">💳 Payments and Requirements</h1>

//             {/* Search with suggestions */}

//             <div className="relative mb-24">
//                 <input
//                     type="text"
//                     placeholder="Search by Name or Admission Number"
//                     value={
//                         matchedStudent
//                             ? `${matchedStudent.fullName} (${matchedStudent.admissionNo})`
//                             : selectedStudent
//                     }
//                     // chged value from value={selectedStudent} to that
//                     onChange={(e) => setSelectedStudent(e.target.value)}
//                     className="input w-full p-2 border rounded"
//                 />
//                 {/* {selectedStudent && filteredStudents.length > 0 && (
//                     <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
//                         {filteredStudents.map((student) => (
//                             <li
//                                 key={student.admissionNo}
//                                 onClick={() => setSelectedStudent(student.admissionNo)} //replaced .fullName with admissionNo
//                                 className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
//                             >
//                                 {student.fullName} ({student.admissionNo})
//                             </li>
//                         ))}
//                     </ul>
//                 )} */}
//                 {selectedStudent && filteredStudents.length > 0 && (
//                     <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
//                         {filteredStudents.map((student) => (
//                             <li
//                                 key={student.admissionNo}
//                                 onClick={() => setSelectedStudent(student.fullName)}
//                                 className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
//                             >
//                                 {student.fullName} ({student.admissionNo})
//                             </li>
//                         ))}
//                     </ul>
//                 )}


//             </div>

//             {matchedStudent && (
//                 <div className="mb-4">
//                     <h2 className="font-semibold">Student Details</h2>
//                     <p>Name: {matchedStudent.fullName}</p>
//                     <p>Class: {matchedStudent.classGrade}</p>
//                     <p>Total Fees: UGX {totalFee || 'Not Set'}</p>
//                     <p>Total Paid: UGX {getTotalPaid()}</p>
//                     <p>Balance: UGX {getBalance()}</p>
//                 </div>
//             )}


//             {/* Total Fee Input (Editable only on first payment) */}
//             <input
//                 type="number"
//                 placeholder="Enter Total Fee"
//                 value={totalFee}
//                 onChange={(e) => setTotalFee(e.target.value)}
//                 className="input w-full mb-4 p-2 border rounded"
//                 disabled={hasMadePayment}
//             />

//             {hasMadePayment && (
//                 <p className="text-sm text-gray-500 mt-1 italic mb-4">
//                     Already set Total fees for this pupil.
//                 </p>
//             )}

//             {/* Total Fee Input
//             <input
//                 type="number"
//                 placeholder="Enter Total Fee"
//                 value={totalFee}
//                 onChange={(e) => setTotalFee(e.target.value)}
//                 className="input w-full mb-4 p-2 border rounded"
//             /> */}

//             {/* Amount Paid Input */}
//             <input
//                 type="number"
//                 placeholder="Amount Paid"
//                 value={amountPaid}
//                 onChange={(e) => setAmountPaid(e.target.value)}
//                 className="input w-full mb-4 p-2 border rounded"
//             />

//             {/* Requirements */}
//             <h2 className="font-semibold">Requirements</h2>
//             <div className="grid grid-cols-2 gap-2 mb-4">
//                 {Object.keys(requirements).map((item) => (
//                     <label key={item} className="capitalize">
//                         <input
//                             type="checkbox"
//                             checked={requirements[item]}
//                             onChange={() =>
//                                 setRequirements((prev) => ({
//                                     ...prev,
//                                     [item]: !prev[item],
//                                 }))
//                             }
//                             className="mr-2"
//                         />
//                         {item}
//                     </label>
//                 ))}
//             </div>

//             <button
//                 onClick={handlePayment}
//                 className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//                 Record Payment
//             </button>

//             {/* Payment History Table */}
//             {matchedStudent && (
//                 <div className="mt-6">
//                     <h3 className="font-semibold mb-2">Payment History</h3>
//                     <table className="table-auto w-full border">
//                         <thead>
//                             <tr className="bg-gray-200">
//                                 <th className="border px-2 py-1">Date</th>
//                                 <th className="border px-2 py-1">Amount Paid</th>
//                                 <th className="border px-2 py-1">Requirements</th>
//                             </tr>
//                         </thead>
//                         <tbody>{paymentHistory()}</tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }


