
// //ALLOWS ME TO SET A TOTAL FEE
'use client';
import { useState, useEffect } from 'react';

export default function PaymentsPage() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [totalFee, setTotalFee] = useState('');
    const [requirements, setRequirements] = useState({
        broom: false,
        ream: false,
        toiletPaper: false,
        liquidSoap: false,
        jick: false,
    });

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('pupilData') || '[]');
        setStudents(saved);
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
            const allPayments = JSON.parse(localStorage.getItem('payments') || '[]');
            const studentPayments = allPayments.filter(
                (p: any) => p.admissionNo === matchedStudent.admissionNo
            );

            if (studentPayments.length > 0) {
                const latest = studentPayments[studentPayments.length - 1];
                setTotalFee(latest.totalFee?.toString() || '');
            } else {
                setTotalFee('');
            }
        }
    }, [matchedStudent]);

    const handlePayment = () => {
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

        const existing = JSON.parse(localStorage.getItem('payments') || '[]');

        const newPayment = {
            admissionNo: matchedStudent.admissionNo,
            fullName: matchedStudent.fullName,
            classGrade: matchedStudent.classGrade,
            amountPaid: parseInt(amountPaid),
            totalFee: parseInt(totalFee),
            requirements,
            date: new Date().toISOString(),
        };

        localStorage.setItem('payments', JSON.stringify([...existing, newPayment]));
        alert('Payment recorded successfully!');
        setAmountPaid('');
        setRequirements({
            broom: false,
            ream: false,
            toiletPaper: false,
            liquidSoap: false,
            jick: false,
        });
    };

    const getTotalPaid = () => {
        const studentPayments = JSON.parse(localStorage.getItem('payments') || '[]');
        return studentPayments
            .filter((payment: any) => payment.admissionNo === matchedStudent?.admissionNo)
            .reduce((sum: number, payment: any) => sum + payment.amountPaid, 0);
    };

    const getBalance = () => {
        //return parseInt(totalFee || '0') - getTotalPaid();
        return parseInt(totalFee) - getTotalPaid();
    };

    const paymentHistory = () => {
        const studentPayments = JSON.parse(localStorage.getItem('payments') || '[]');
        const filteredPayments = studentPayments.filter(
            (payment: any) => payment.admissionNo === matchedStudent?.admissionNo
        );
        return filteredPayments.map((payment: any, index: number) => (
            <tr key={index}>
                <td>{new Date(payment.date).toLocaleString()}</td>
                <td>{payment.amountPaid}</td>
                <td>{Object.keys(payment.requirements).filter((key) => payment.requirements[key]).join(', ')}</td>
            </tr>
        ));
    };


    const hasMadePayment = matchedStudent &&
        JSON.parse(localStorage.getItem('payments') || '[]')
            .some((p) => p.admissionNo === matchedStudent.admissionNo);


    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">💳 Payments and Requirements</h1>

            {/* Search with suggestions */}

            <div className="relative mb-24">
                <input
                    type="text"
                    placeholder="Search by Name or Admission Number"
                    value={
                        matchedStudent
                            ? `${matchedStudent.fullName} (${matchedStudent.admissionNo})`
                            : selectedStudent
                    }
                    // chged value from value={selectedStudent} to that
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="input w-full p-2 border rounded"
                />
                {/* {selectedStudent && filteredStudents.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
                        {filteredStudents.map((student) => (
                            <li
                                key={student.admissionNo}
                                onClick={() => setSelectedStudent(student.admissionNo)} //replaced .fullName with admissionNo
                                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                            >
                                {student.fullName} ({student.admissionNo})
                            </li>
                        ))}
                    </ul>
                )} */}
                {selectedStudent && filteredStudents.length > 0 && (
                    <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-md max-h-40 overflow-y-auto">
                        {filteredStudents.map((student) => (
                            <li
                                key={student.admissionNo}
                                onClick={() => setSelectedStudent(student.fullName)}
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


            {/* Total Fee Input (Editable only on first payment) */}
            <input
                type="number"
                placeholder="Enter Total Fee"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="input w-full mb-4 p-2 border rounded"
                disabled={hasMadePayment}
            />

            {hasMadePayment && (
                <p className="text-sm text-gray-500 mt-1 italic mb-4">
                    Already set Total fees for this pupil.
                </p>
            )}

            {/* Total Fee Input
            <input
                type="number"
                placeholder="Enter Total Fee"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                className="input w-full mb-4 p-2 border rounded"
            /> */}

            {/* Amount Paid Input */}
            <input
                type="number"
                placeholder="Amount Paid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="input w-full mb-4 p-2 border rounded"
            />

            {/* Requirements */}
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
                Record Payment
            </button>

            {/* Payment History Table */}
            {matchedStudent && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    <table className="table-auto w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border px-2 py-1">Date</th>
                                <th className="border px-2 py-1">Amount Paid</th>
                                <th className="border px-2 py-1">Requirements</th>
                            </tr>
                        </thead>
                        <tbody>{paymentHistory()}</tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


