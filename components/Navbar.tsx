
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [studentsOpen, setStudentsOpen] = useState(false);
    const [paymentsOpen, setPaymentsOpen] = useState(false);
    const [visitorsOpen, setVisitorsOpen] = useState(false);
    const [staffOpen, setStaffOpen] = useState(false);
    const [salaryOpen, setSalaryOpen] = useState(false);

    const studentsRef = useRef<HTMLDivElement>(null);
    const paymentsRef = useRef<HTMLDivElement>(null);
    const visitorsRef = useRef<HTMLDivElement>(null);
    const staffRef = useRef<HTMLDivElement>(null);
    const salaryRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setMenuOpen(!menuOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                studentsRef.current &&
                !studentsRef.current.contains(event.target as Node)
            ) {
                setStudentsOpen(false);
            }

            if (
                paymentsRef.current &&
                !paymentsRef.current.contains(event.target as Node)
            ) {
                setPaymentsOpen(false);
            }
            if (
                visitorsRef.current &&
                !visitorsRef.current.contains(event.target as Node)
            ) {
                setVisitorsOpen(false);
            }
            if (
                staffRef.current &&
                !staffRef.current.contains(event.target as Node)
            ) {
                setStaffOpen(false);
            }

            if (
                salaryRef.current &&
                !salaryRef.current.contains(event.target as Node)
            ) {
                setSalaryOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        // <nav className="bg-blue-700 text-white shadow-md relative">
        //     <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <nav className="bg-blue-700 text-white shadow-md fixed top-0 w-full z-50 h-16 flex items-center ">
            <div className="max-w-7xl mx-auto px-6 py-0 flex justify-between items-center w-full"> {/* Changed py-4 to py-0 */}
                <Link href="/" className="text-xl font-bold tracking-wide">
                    🎓 School Manager
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-6 items-center">
                    <Link href="/" className="hover:text-yellow-300">Home</Link>
                    <Link href="/dashboard" className="hover:text-yellow-300">Dashboard</Link>

                    {/* Students Dropdown */}
                    <div className="relative" ref={studentsRef}>
                        <button
                            onClick={() => setStudentsOpen(!studentsOpen)}
                            className="hover:text-yellow-300 flex items-center gap-1"
                        >
                            Students
                        </button>
                        {studentsOpen && (
                            <div className="absolute bg-white text-black rounded-md shadow-md mt-2 w-52 z-20">
                                <Link href="/students/register" className="block px-4 py-2 hover:bg-gray-100">Add New Pupil</Link>
                                <hr />
                                <Link href="/students/list" className="block px-4 py-2 hover:bg-gray-100">View All Pupils</Link>
                            </div>
                        )}
                    </div>

                    {/* Staff Dropdown */}
                    <div className="relative" ref={staffRef}>
                        <button
                            onClick={() => setStaffOpen(!staffOpen)}
                            className="hover:text-yellow-300 flex items-center gap-1"
                        >
                            Staff
                        </button>
                        {staffOpen && (
                            <div className="absolute bg-white text-black rounded-md shadow-md mt-2 w-52 z-20">
                                <Link href="/staff" className="block px-4 py-2 hover:bg-gray-100">Add New Staff</Link>
                                <hr />
                                <Link href="/Allstaff" className="block px-4 py-2 hover:bg-gray-100">View All Staff</Link>
                            </div>
                        )}
                    </div>

                    {/* Attendance */}
                    <Link href="/attendance" className="hover:text-yellow-300">Attendance</Link>


                    {/* Classes */}
                    <Link href="/classes/nursery" className="hover:text-yellow-300">Nursery</Link>
                    <Link href="/classes/primary" className="hover:text-yellow-300">Primary</Link>

                    {/* Payments Dropdown */}
                    <div className="relative" ref={paymentsRef}>
                        <button
                            onClick={() => setPaymentsOpen(!paymentsOpen)}
                            className="hover:text-yellow-300 flex items-center gap-1"
                        >
                            Payments
                        </button>
                        {paymentsOpen && (
                            <div className="absolute bg-white text-black rounded-md shadow-md mt-2 w-52 z-20">
                                <Link href="/payments" className="block px-4 py-2 hover:bg-gray-100">Make Payment</Link>
                                <hr />
                                <Link href="/Allpayments" className="block px-4 py-2 hover:bg-gray-100">View All Payments</Link>
                                <hr />
                                <Link href="/Allpayments/LatestPaymentsSummary" className="block px-4 py-2 hover:bg-gray-100">Payments Summary</Link>

                            </div>
                        )}
                    </div>


                    {/* Salaries Dropdown */}
                    <div className="relative" ref={salaryRef}>
                        <button
                            onClick={() => setSalaryOpen(!salaryOpen)}
                            className="hover:text-yellow-300 flex items-center gap-1"
                        >
                            Salaries
                        </button>
                        {salaryOpen && (
                            <div className="absolute bg-white text-black rounded-md shadow-md mt-2 w-52 z-20">
                                <Link href="/salary/paySalary" className="block px-4 py-2 hover:bg-gray-100">Pay Salary</Link>
                                <hr />
                                <Link href="/salary/salaryRecords" className="block px-4 py-2 hover:bg-gray-100">View Salary Records</Link>
                                <hr />
                                <Link href="/salary/salaryRecords/SalaryRecordsSummary" className="block px-4 py-2 hover:bg-gray-100"> Salary Records Summary</Link>
                            </div>
                        )}
                    </div>

                    {/* Visitors Dropdown */}
                    <div className="relative" ref={visitorsRef}>
                        <button
                            onClick={() => setVisitorsOpen(!visitorsOpen)}
                            className="hover:text-yellow-300 flex items-center gap-1"
                        >
                            Visitors
                        </button>
                        {visitorsOpen && (
                            <div className="absolute bg-white text-black rounded-md shadow-md mt-2 w-52 z-20">
                                <Link href="/visitors" className="block px-4 py-2 hover:bg-gray-100">Add Visitor</Link>
                                <hr />
                                <Link href="/Allvisitors" className="block px-4 py-2 hover:bg-gray-100">View All Visitors</Link>
                            </div>
                        )}
                    </div>

                    <Link href="/reports" className="hover:text-yellow-300">Reports</Link>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={toggleMenu} className="md:hidden">
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>


            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden px-4 pb-4 space-y-3">
                    <Link href="/" className="block hover:text-yellow-300">Home</Link>
                    <Link href="/dashboard" className="block hover:text-yellow-300">Dashboard</Link>

                    {/* Mobile Students */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-blue-800 px-4 py-2 text-white font-semibold">Students</div>
                        <Link href="/students/register" className="block px-4 py-2 bg-blue-100 text-black">Add New Pupil</Link>
                        <Link href="/students/list" className="block px-4 py-2 bg-blue-100 text-black">View All Pupils</Link>
                    </div>

                    {/* Mobile Staff */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-blue-800 px-4 py-2 text-white font-semibold">Staff</div>
                        <Link href="/staff" className="block px-4 py-2 bg-blue-100 text-black">Add New Staff</Link>
                        <Link href="/Allstaff" className="block px-4 py-2 bg-blue-100 text-black">View All Staff</Link>
                    </div>

                    <Link href="/attendance" className="block hover:text-yellow-300">Attendance</Link>


                    <Link href="/classes/nursery" className="block hover:text-yellow-300">Nursery</Link>
                    <Link href="/classes/primary" className="block hover:text-yellow-300">Primary</Link>

                    {/* Mobile Payments */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-blue-800 px-4 py-2 text-white font-semibold">Payments</div>
                        <Link href="/payments" className="block px-4 py-2 bg-blue-100 text-black">Make Payment</Link>
                        <Link href="/Allpayments" className="block px-4 py-2 bg-blue-100 text-black">View All Payments</Link>
                        <Link href="/Allpayments/LatestPaymentsSummary" className="block px-4 py-2 bg-blue-100 text-black">Payments Summary</Link>

                    </div>

                    {/* Mobile Salaries */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-blue-800 px-4 py-2 text-white font-semibold">Salaries</div>
                        <Link href="/salary/paySalary" className="block px-4 py-2 bg-blue-100 text-black">Pay Salary</Link>
                        <Link href="/salary/salaryRecords" className="block px-4 py-2 bg-blue-100 text-black">View Salary Records</Link>
                        <Link href="/salary/salaryRecords/SalaryRecordsSummary" className="block px-4 py-2 bg-blue-100 text-black"> Salary Records Summary</Link>

                    </div>

                    {/* Mobile Visitors */}
                    <div className="border rounded-md overflow-hidden">
                        <div className="bg-blue-800 px-4 py-2 text-white font-semibold">Visitors</div>
                        <Link href="/payments" className="block px-4 py-2 bg-blue-100 text-black">Add Visitor</Link>
                        <Link href="/Allpayments" className="block px-4 py-2 bg-blue-100 text-black">View All Visitors</Link>
                    </div>

                    <Link href="/reports" className="block hover:text-yellow-300">Reports</Link>
                </div>
            )}
        </nav>
    );
}




// // 'use client';
// // import Link from 'next/link';

// export default function Navbar() {
//     return (
//         <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
//             <div className="font-bold text-lg">📘 School Manager</div>
//             <div className="space-x-4 text-sm md:text-base">
//                 <Link href="/">Home</Link>
//                 <Link href="/students">Students</Link>
//                 <Link href="/classes/nursery">Nursery</Link>
//                 <Link href="/classes/primary">Primary</Link>
//                 <Link href="/payments">Payments</Link>
//             </div>
//         </nav>
//     );
// }
