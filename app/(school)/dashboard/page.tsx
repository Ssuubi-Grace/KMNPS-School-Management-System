import DashboardPage from '@/components/ui/dashboard-ui';

export default function Dashboard() {
    return <DashboardPage />;
}



// 'use client';

// import React, { useEffect, useMemo, useState } from 'react';
// import { supabase } from '@/lib/supabaseClient'; // This is the only external import you should need

// /* --- Interfaces (Types) --- */
// // These define the structure of your data from Supabase
// export interface StaffSalaryRecord {
//     staff_id: string;
//     period_year: number;
//     period_month: number;
//     total_salary: number;
//     amount_paid: number;
// }

// export interface StaffSalarySummary {
//     period_year: number;
//     period_month: number;
//     total_salary: number;
//     total_paid: number;
//     balance: number;
//     monthStr: string;
//     show: boolean;
// }

// export interface Payment {
//     id: string;
//     admissionNo: string;
//     fullName: string;
//     classGrade: string;
//     term: string;
//     year: number;
//     totalFee: number;
//     amountPaid: number;
//     date: string;
// }

// export interface Visitor {
//     id: string;
//     visit_date: string | null;
//     term: string | null;
// }

// export interface Pupil {
//     id: string;
//     fullName: string;
//     admissionNo: string;
//     dob: string | null;
//     gender: string | null;
//     classGrade: string;
//     class?: string; // Optional: If your data sometimes uses 'class' instead of 'classGrade'
// }

// /* --- Helper UI Components --- */
// // These are the reusable UI elements for your dashboard

// export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
//     return (
//         <select {...props} className="border p-2 w-full rounded focus:ring-blue-500 focus:border-blue-500">
//             {children}
//         </select>
//     );
// }

// export function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
//     return (
//         <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
//             {children}
//         </button>
//     );
// }

// export function Stat({ label, value }: { label: string; value: number | string }) {
//     return (
//         <div className="bg-blue-100 p-4 rounded shadow text-center">
//             <div className="font-semibold text-blue-800 text-sm">{label}</div>
//             <div className="text-2xl font-bold text-blue-900 mt-1">{value}</div>
//         </div>
//     );
// }

// export function Card({ label, value }: { label: string; value: number }) {
//     // Format value as Ugandan Shillings (UGX)
//     const formattedValue = value.toLocaleString('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 });
//     return (
//         <div className="bg-green-100 p-4 rounded shadow text-center">
//             <div className="font-semibold text-green-800 text-sm">{label}</div>
//             <div className="text-2xl font-bold text-green-900 mt-1">{formattedValue}</div>
//         </div>
//     );
// }

// // NEW: Specific card for visitors that doesn't format as currency
// export function VisitorCard({ label, value }: { label: string; value: number }) {
//     return (
//         <div className="bg-orange-100 p-4 rounded shadow text-center">
//             <div className="font-semibold text-orange-800 text-sm">{label}</div>
//             <div className="text-2xl font-bold text-orange-900 mt-1">{value.toLocaleString('en-UG')}</div>
//         </div>
//     );
// }


// export function StaffSalaryCard({ label, value }: { label: string; value: number }) {
//     // Format value as Ugandan Shillings (UGX)
//     const formattedValue = value.toLocaleString('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 });
//     return (
//         <div className="bg-purple-100 p-4 rounded shadow text-center">
//             <div className="font-semibold text-purple-800 text-sm">{label}</div>
//             <div className="text-2xl font-bold text-purple-900 mt-1">
//                 {typeof value === 'number' ? formattedValue : '—'}
//             </div>
//         </div>
//     );
// }

// export function Section({ title, children }: { title: string; children: React.ReactNode }) {
//     return (
//         <section className="my-8 p-6 bg-white rounded-lg shadow-md">
//             <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">{title}</h2>
//             {children}
//         </section>
//     );
// }

// export function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
//     return (
//         <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
//                 <thead>
//                     <tr>
//                         {headers.map((h, i) => (
//                             <th key={i} className="border border-gray-300 bg-gray-100 px-4 py-2 text-left text-sm font-semibold text-gray-700">
//                                 {h}
//                             </th>
//                         ))}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {rows.length === 0 ? (
//                         <tr>
//                             <td colSpan={headers.length} className="text-center p-4 text-gray-500 italic">No data available for this selection.</td>
//                         </tr>
//                     ) : rows.map((row, i) => (
//                         <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                             {row.map((val, j) => (
//                                 <td key={j} className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
//                                     {typeof val === "number" ? val.toLocaleString('en-UG') : val}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// export function StaffSalaryTable({ data }: { data: StaffSalarySummary[] }) {
//     if (data.length === 0) {
//         return <div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-md">No salary data to display based on current filters.</div>;
//     }

//     return (
//         <div className="overflow-x-auto">
//             <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
//                 <thead>
//                     <tr className="bg-gray-100">
//                         <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Year</th>
//                         <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Month</th>
//                         <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Salary</th>
//                         <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Total Paid</th>
//                         <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">Balance</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {data.map((row, i) => (
//                         <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                             <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.period_year}</td>
//                             <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">{row.period_month}</td>
//                             <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
//                                 {row.total_salary.toLocaleString('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 })}
//                             </td>
//                             <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
//                                 {row.total_paid.toLocaleString('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 })}
//                             </td>
//                             <td className="border border-gray-300 px-4 py-2 text-sm text-gray-800 font-semibold">
//                                 {row.balance.toLocaleString('en-UG', { style: 'currency', currency: 'UGX', minimumFractionDigits: 0 })}
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }

// /* --- Constants --- */
// const TERMS_ORDER = ["Term I", "Term II", "Term III"];

// /* --- Main Dashboard Component --- */
// export default function DashboardPage() {
//     // State variables for filters and data
//     const [selectedTerm, setSelectedTerm] = useState("Term I");
//     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
//     const [selectedClass, setSelectedClass] = useState("All Classes");

//     const [pupils, setPupils] = useState<Pupil[]>([]);
//     const [staff, setStaff] = useState<any[]>([]); // Define a more specific type if available
//     const [attendance, setAttendance] = useState<any[]>([]); // Define a more specific type if available
//     const [payments, setPayments] = useState<Payment[]>([]);
//     const [visitors, setVisitors] = useState<Visitor[]>([]);
//     const [salaryRecords, setSalaryRecords] = useState<StaffSalaryRecord[]>([]);

//     const [mainLoading, setMainLoading] = useState(true);
//     const [mainError, setMainError] = useState<string | null>(null);
//     const [salaryLoading, setSalaryLoading] = useState(true);
//     const [salaryError, setSalaryError] = useState<string | null>(null);

//     const [selectedMonth, setSelectedMonth] = useState(() => {
//         const now = new Date();
//         return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//     });
//     const [onlyUnpaid, setOnlyUnpaid] = useState(false);
//     const [includePastBalances, setIncludePastBalances] = useState(false);

//     // --- Data Fetching ---
//     const loadAllMainData = async () => {
//         setMainLoading(true);
//         setMainError(null);
//         try {
//             const { data: pupilsData, error: pupilsError } = await supabase.from("pupils").select("*");
//             if (pupilsError) throw pupilsError;
//             setPupils(pupilsData || []);

//             const { data: staffData, error: staffError } = await supabase.from("staff").select("*");
//             if (staffError) throw staffError;
//             setStaff(staffData || []);

//             const { data: attendanceData, error: attendanceError } = await supabase.from("attendance").select("*");
//             if (attendanceError) throw attendanceError;
//             setAttendance(attendanceData || []);

//             const { data: paymentsData, error: paymentsError } = await supabase.from("payments").select("*");
//             if (paymentsError) throw paymentsError;
//             setPayments(paymentsData || []);

//             const { data: visitorsData, error: visitorsError } = await supabase.from("visitors").select("*");
//             if (visitorsError) throw visitorsError;
//             setVisitors(visitorsData || []);

//         } catch (error: any) {
//             console.error("Error loading main dashboard data:", error.message);
//             setMainError(error.message);
//         } finally {
//             setMainLoading(false);
//         }
//     };

//     const loadSalaryData = async () => {
//         setSalaryLoading(true);
//         setSalaryError(null);
//         try {
//             const { data: salaryData, error: salaryError } = await supabase
//                 .from("staff_salaries") // Assuming your table name is 'staff_salaries'
//                 .select("staff_id, period_year, period_month, total_salary, amount_paid");
//             if (salaryError) throw salaryError;
//             setSalaryRecords(salaryData || []);
//         } catch (error: any) {
//             console.error("Error loading salary data:", error.message);
//             setSalaryError(error.message);
//         } finally {
//             setSalaryLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadAllMainData();
//         loadSalaryData();
//     }, []);

//     // --- Memoized Calculations (for performance) ---
//     const uniqueClasses = useMemo(() => {
//         return Array.from(new Set(pupils.map(p => p.classGrade || p.class))).sort();
//     }, [pupils]);

//     const today = new Date().toISOString().split("T")[0];

//     const filteredPupils = useMemo(() => {
//         return selectedClass === "All Classes"
//             ? pupils
//             : pupils.filter(p => (p.classGrade || p.class) === selectedClass);
//     }, [pupils, selectedClass]);

//     const totalPupils = filteredPupils.length;
//     const malePupils = filteredPupils.filter(p => p.gender === "Male").length;
//     const femalePupils = filteredPupils.filter(p => p.gender === "Female").length;

//     const pupilsByClass = useMemo(() => filteredPupils.reduce<Record<string, number>>((a, p) => {
//         const c = p.classGrade || p.class;
//         a[c] = (a[c] || 0) + 1;
//         return a;
//     }, {}), [filteredPupils]);

//     const maleByClass = useMemo(() => filteredPupils.reduce<Record<string, number>>((a, p) => {
//         if (p.gender === "Male") {
//             const c = p.classGrade || p.class;
//             a[c] = (a[c] || 0) + 1;
//         }
//         return a;
//     }, {}), [filteredPupils]);

//     const femaleByClass = useMemo(() => filteredPupils.reduce<Record<string, number>>((a, p) => {
//         if (p.gender === "Female") {
//             const c = p.classGrade || p.class;
//             a[c] = (a[c] || 0) + 1;
//         }
//         return a;
//     }, {}), [filteredPupils]);

//     const attTodayAll = useMemo(() => attendance.filter(a => a.attendance_date === today), [attendance, today]);
//     const attToday = useMemo(() => selectedClass === "All Classes"
//         ? attTodayAll
//         : attTodayAll.filter(a => (a.classGrade || a.class) === selectedClass), [attTodayAll, selectedClass]);

//     const presentToday = attToday.filter(a => a.status === "present").length;
//     const absentToday = attToday.filter(a => a.status === "absent").length;

//     const presentByClass = useMemo(() => attToday.reduce<Record<string, number>>((a, a2) => {
//         if (a2.status === "present") {
//             const c = a2.classGrade || a2.class;
//             a[c] = (a[c] || 0) + 1;
//         }
//         return a;
//     }, {}), [attToday]);

//     const absentByClass = useMemo(() => attToday.reduce<Record<string, number>>((a, a2) => {
//         if (a2.status === "absent") {
//             const c = a2.classGrade || a2.class;
//             a[c] = (a[c] || 0) + 1;
//         }
//         return a;
//     }, {}), [attToday]);

//     const totalStaff = staff.length;
//     const staffByDept = useMemo(() => staff.reduce<Record<string, number>>((a, s) => {
//         const d = s.department || "<None>";
//         a[d] = (a[d] || 0) + 1;
//         return a;
//     }, {}), [staff]);

//     const staffByRole = useMemo(() => staff.reduce<Record<string, number>>((a, s) => {
//         const r = s.role || "<None>";
//         a[r] = (a[r] || 0) + 1;
//         return a;
//     }, {}), [staff]);

//     function termOrder(term: string) {
//         const i = TERMS_ORDER.findIndex(t => t === term);
//         return i === -1 ? 1000 : i;
//     }

//     const filteredPayments = useMemo(() => payments.filter(p => {
//         if (p.year.toString() !== selectedYear) return false;
//         if (selectedClass !== "All Classes" && p.classGrade !== selectedClass) return false;
//         return true;
//     }), [payments, selectedYear, selectedClass]);

//     const paymentSummaryData = useMemo(() => {
//         const perStudent = new Map<string, {
//             admissionNo: string;
//             fullName: string;
//             classGrade: string;
//             term: string;
//             year: number;
//             totalFee: number;
//             totalPaid: number;
//         }>();

//         filteredPayments.forEach(p => {
//             const key = `${p.admissionNo}_${p.term}_${p.year}`;
//             const ex = perStudent.get(key);
//             if (ex) {
//                 ex.totalPaid += p.amountPaid;
//                 ex.totalFee = Math.max(ex.totalFee, p.totalFee); // Assuming totalFee might be duplicated per payment
//             } else {
//                 perStudent.set(key, {
//                     admissionNo: p.admissionNo,
//                     fullName: p.fullName,
//                     classGrade: p.classGrade,
//                     term: p.term,
//                     year: p.year,
//                     totalFee: p.totalFee,
//                     totalPaid: p.amountPaid,
//                 });
//             }
//         });
//         return Array.from(perStudent.values()).map(s => ({
//             ...s,
//             balance: s.totalFee - s.totalPaid,
//         }));
//     }, [filteredPayments]);

//     const prevTermsSummary = useMemo(() => paymentSummaryData.filter(s => {
//         if (s.year < Number(selectedYear)) return true;
//         if (s.year === Number(selectedYear)) return termOrder(s.term) < termOrder(selectedTerm);
//         return false;
//     }), [paymentSummaryData, selectedYear, selectedTerm]);

//     const currentTermSummary = useMemo(() => paymentSummaryData.filter(s => s.year === Number(selectedYear) && s.term === selectedTerm),
//         [paymentSummaryData, selectedYear, selectedTerm]
//     );

//     const totalFeePrev = prevTermsSummary.reduce((acc, s) => acc + s.totalFee, 0);
//     const totalPaidPrev = prevTermsSummary.reduce((acc, s) => acc + s.totalPaid, 0);
//     const totalBalPrev = totalFeePrev - totalPaidPrev;

//     const totalFeeCurrent = currentTermSummary.reduce((acc, s) => acc + s.totalFee, 0);
//     const totalPaidCurrent = currentTermSummary.reduce((acc, s) => acc + s.totalPaid, 0);
//     const totalBalCurrent = totalFeeCurrent - totalPaidCurrent;

//     const payByClass = useMemo(() => currentTermSummary.reduce<Record<string, { fee: number; paid: number; bal: number }>>((a, s) => {
//         const c = s.classGrade;
//         if (!a[c]) a[c] = { fee: 0, paid: 0, bal: 0 };
//         a[c].fee += s.totalFee;
//         a[c].paid += s.totalPaid;
//         a[c].bal += s.balance;
//         return a;
//     }, {}), [currentTermSummary]);

//     const todayStr = new Date().toISOString().slice(0, 10);
//     const monthStr = todayStr.slice(0, 7);
//     const yearStr = todayStr.slice(0, 4);

//     const totalVisitorsToday = useMemo(
//         () => visitors.filter((v) => v.visit_date?.startsWith(todayStr)).length,
//         [visitors, todayStr]
//     );
//     const totalVisitorsThisMonth = useMemo(
//         () => visitors.filter((v) => v.visit_date?.startsWith(monthStr)).length,
//         [visitors, monthStr]
//     );
//     const totalVisitorsThisYear = useMemo(
//         () => visitors.filter((v) => v.visit_date?.startsWith(yearStr)).length,
//         [visitors, yearStr]
//     );

//     const termCounts = useMemo(() => {
//         const counts: Record<string, number> = {
//             "Term I": 0,
//             "Term II": 0,
//             "Term III": 0,
//             Unknown: 0,
//         };
//         visitors.forEach((v) => {
//             if (v.term && counts[v.term] !== undefined) counts[v.term]++;
//             else counts.Unknown++;
//         });
//         return counts;
//     }, [visitors]);

//     const salarySummaries = useMemo(() => {
//         const staffMonthlyAggregates = new Map<string, { total_salary: number; total_paid: number }>();

//         for (const record of salaryRecords) {
//             const periodKey = `${record.period_year}-${record.period_month}`;
//             const staffPeriodKey = `${periodKey}-${record.staff_id}`;

//             const existing = staffMonthlyAggregates.get(staffPeriodKey);

//             const totalSalary = record.total_salary || 0;
//             const paid = record.amount_paid || 0;

//             if (existing) {
//                 existing.total_paid += paid;
//             } else {
//                 staffMonthlyAggregates.set(staffPeriodKey, {
//                     total_salary: totalSalary,
//                     total_paid: paid,
//                 });
//             }
//         }

//         const groupedByMonth = new Map<string, StaffSalarySummary>();

//         for (const [staffPeriodKey, values] of staffMonthlyAggregates.entries()) {
//             const [year, month] = staffPeriodKey.split('-').map(Number);
//             const monthKey = `${year}-${month}`;
//             const existingMonthSummary = groupedByMonth.get(monthKey);

//             if (existingMonthSummary) {
//                 existingMonthSummary.total_salary += values.total_salary;
//                 existingMonthSummary.total_paid += values.total_paid;
//             } else {
//                 groupedByMonth.set(monthKey, {
//                     period_year: year,
//                     period_month: month,
//                     total_salary: values.total_salary,
//                     total_paid: values.total_paid,
//                     balance: 0,
//                     monthStr: `${year}-${String(month).padStart(2, '0')}`,
//                     show: false,
//                 });
//             }
//         }

//         const result: StaffSalarySummary[] = [];

//         for (const [key, summary] of groupedByMonth.entries()) {
//             summary.balance = summary.total_salary - summary.total_paid;
//             summary.monthStr = `${summary.period_year}-${String(summary.period_month).padStart(2, '0')}`;

//             summary.show =
//                 ((includePastBalances && summary.monthStr <= selectedMonth) ||
//                     (!includePastBalances && summary.monthStr === selectedMonth)) &&
//                 (!onlyUnpaid || summary.balance > 0);

//             result.push(summary);
//         }

//         result.sort((a, b) => {
//             if (a.period_year !== b.period_year) {
//                 return a.period_year - b.period_year;
//             }
//             return a.period_month - b.period_month;
//         });

//         return result.filter((s) => s.show);
//     }, [salaryRecords, selectedMonth, onlyUnpaid, includePastBalances]);

//     const totalSalary = salarySummaries.reduce((sum, r) => sum + r.total_salary, 0);
//     const totalPaid = salarySummaries.reduce((sum, r) => sum + r.total_paid, 0);
//     const totalBalance = salarySummaries.reduce((sum, r) => sum + r.balance, 0);


//     if (mainLoading || salaryLoading) return <div className="p-6 text-center text-lg font-medium text-gray-700">Loading dashboard data...</div>;
//     if (mainError) return <div className="p-6 text-red-600 text-center text-lg font-medium">Error loading main dashboard data: {mainError}</div>;
//     if (salaryError) return <div className="p-6 text-red-600 text-center text-lg font-medium">Error loading salary dashboard data: {salaryError}</div>;

//     return (
//         <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
//             <h1 className="text-3xl font-extrabold text-gray-900 mb-6">🎓 School Dashboard & Reports</h1>

//             {/* Main Dashboard Filters */}
//             <Section title="Dashboard Filters">
//                 <div className="flex flex-wrap gap-6 items-center">
//                     <label className="flex items-center gap-2 text-gray-700 font-medium">
//                         Term:
//                         <Select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
//                             {TERMS_ORDER.map(term => <option key={term}>{term}</option>)}
//                         </Select>
//                     </label>
//                     <label className="flex items-center gap-2 text-gray-700 font-medium">
//                         Year:
//                         <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border rounded px-3 py-1 w-28 focus:ring-blue-500 focus:border-blue-500" />
//                     </label>
//                     <label className="flex items-center gap-2 text-gray-700 font-medium">
//                         Class:
//                         <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
//                             <option>All Classes</option>
//                             {uniqueClasses.map(cls => <option key={cls}>{cls}</option>)}
//                         </Select>
//                     </label>
//                 </div>
//             </Section>

//             {/* Main Dashboard Stats */}
//             <Section title="Key Metrics">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 text-center">
//                     {([
//                         ["Total Pupils", totalPupils],
//                         ["Male Pupils", malePupils],
//                         ["Female Pupils", femalePupils],
//                         ["Present Today", presentToday],
//                         ["Absent Today", absentToday],
//                         ["Total Staff", totalStaff],
//                         ["Total Visitors", visitors.length],
//                     ] as [string, number | string][]).map(([label, value], i) => <Stat key={i} label={label} value={value} />)}
//                 </div>
//             </Section>

//             {/* Visitors Summary */}
//             <Section title="Visitors Overview">
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                     {/* Changed Card to VisitorCard for these three */}
//                     <VisitorCard label="Visitors Today" value={totalVisitorsToday} />
//                     <VisitorCard label="Visitors This Month" value={totalVisitorsThisMonth} />
//                     <VisitorCard label="Visitors This Year" value={totalVisitorsThisYear} />
//                     <div className="bg-purple-50 p-4 rounded text-sm text-purple-900 shadow">
//                         <p className="font-semibold text-purple-700 mb-2">Visitors by Term</p>
//                         <ul className="space-y-1">
//                             <li>Term I: {termCounts["Term I"]}</li>
//                             <li>Term II: {termCounts["Term II"]}</li>
//                             <li>Term III: {termCounts["Term III"]}</li>
//                             <li>Unknown: {termCounts.Unknown}</li>
//                         </ul>
//                     </div>
//                 </div>
//             </Section>

//             <Section title="Pupils by Class">
//                 <Table headers={["Class", "Total", "Male", "Female"]} rows={Object.keys(pupilsByClass).map(cls => [cls, pupilsByClass[cls], maleByClass[cls] || 0, femaleByClass[cls] || 0])} />
//             </Section>

//             <Section title={`Attendance by Class (Today: ${new Date(today).toLocaleDateString('en-UG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })})`}>
//                 <Table headers={["Class", "Present", "Absent"]} rows={Object.keys(pupilsByClass).map(cls => [cls, presentByClass[cls] || 0, absentByClass[cls] || 0])} />
//             </Section>

//             <Section title="Staff Breakdown by Department">
//                 <Table headers={["Department", "Count"]} rows={Object.entries(staffByDept)} />
//             </Section>

//             <Section title="Staff Breakdown by Role">
//                 <Table headers={["Role", "Count"]} rows={Object.entries(staffByRole)} />
//             </Section>

//             <Section title={`Payments Summary: Previous Terms (Before ${selectedTerm} ${selectedYear})`}>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <Card label="Total Fees Due (Previous)" value={totalFeePrev} />
//                     <Card label="Total Paid (Previous)" value={totalPaidPrev} />
//                     <Card label="Remaining Balance (Previous)" value={totalBalPrev} />
//                 </div>
//             </Section>

//             <Section title={`Payments Summary: ${selectedTerm} ${selectedYear}`}>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <Card label="Total Fees Due (Current Term)" value={totalFeeCurrent} />
//                     <Card label="Total Paid (Current Term)" value={totalPaidCurrent} />
//                     <Card label="Remaining Balance (Current Term)" value={totalBalCurrent} />
//                 </div>
//             </Section>

//             <Section title={`Payments by Class (${selectedTerm} ${selectedYear})`}>
//                 <Table headers={["Class", "Total Fees", "Total Paid", "Balance"]} rows={Object.entries(payByClass).map(([cls, sums]) => [cls, sums.fee, sums.paid, sums.bal])} />
//             </Section>

//             {/* Staff Salary Dashboard Content */}
//             <Section title="Staff Salary Filters">
//                 <div className="flex flex-wrap gap-6 items-center">
//                     <label className="flex items-center gap-2 text-gray-700 font-medium">
//                         Month:
//                         <input
//                             type="month"
//                             value={selectedMonth}
//                             onChange={(e) => setSelectedMonth(e.target.value)}
//                             className="border rounded px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                     </label>
//                     <label className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
//                         <input
//                             type="checkbox"
//                             checked={onlyUnpaid}
//                             onChange={(e) => setOnlyUnpaid(e.target.checked)}
//                             className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
//                         />
//                         <span>Show Only Unpaid</span>
//                     </label>
//                     <label className="flex items-center space-x-2 text-gray-700 font-medium cursor-pointer">
//                         <input
//                             type="checkbox"
//                             checked={includePastBalances}
//                             onChange={(e) => setIncludePastBalances(e.target.checked)}
//                             className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
//                         />
//                         <span>Include Past Balances</span>
//                     </label>
//                 </div>
//             </Section>

//             <Section title={`Staff Salary Summary for ${new Date(selectedMonth).toLocaleDateString('en-UG', { year: 'numeric', month: 'long' })}`}>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//                     <StaffSalaryCard label="Total Salary to Pay" value={totalSalary} />
//                     <StaffSalaryCard label="Total Paid" value={totalPaid} />
//                     <StaffSalaryCard label="Remaining Balance" value={totalBalance} />
//                 </div>
//             </Section>

//             <Section title="Detailed Staff Salary Records">
//                 <StaffSalaryTable data={salarySummaries} />
//             </Section>
//         </div>
//     );
// }





// // //Main Dashboard with everything

// // //Perfect before putting staffsalary
// // 'use client';
// // import React, { useEffect, useMemo, useState } from "react";
// // import { supabase } from "@/lib/supabaseClient";

// // interface Payment {
// //     id: string;
// //     admissionNo: string;
// //     fullName: string;
// //     classGrade: string;
// //     term: string;
// //     year: number;
// //     totalFee: number;
// //     amountPaid: number;
// //     date: string;
// // }

// // interface Visitor {
// //     id: string;
// //     visit_date: string | null;
// //     term: string | null;
// // }

// // const TERMS_ORDER = ["Term I", "Term II", "Term III"];

// // export default function Dashboard() {
// //     const [selectedTerm, setSelectedTerm] = useState("Term I");
// //     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
// //     const [selectedClass, setSelectedClass] = useState("All Classes");

// //     const [pupils, setPupils] = useState<any[]>([]);
// //     const [staff, setStaff] = useState<any[]>([]);
// //     const [attendance, setAttendance] = useState<any[]>([]);
// //     const [payments, setPayments] = useState<Payment[]>([]);
// //     const [visitors, setVisitors] = useState<Visitor[]>([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState<string | null>(null);

// //     useEffect(() => {
// //         async function load() {
// //             setLoading(true);
// //             try {
// //                 const [
// //                     { data: pupilsData },
// //                     { data: staffData },
// //                     { data: attData },
// //                     { data: payData },
// //                     { data: visData },
// //                 ] = await Promise.all([
// //                     supabase.from("pupils").select("*"),
// //                     supabase.from("staff").select("*"),
// //                     supabase.from("attendance").select("*"),
// //                     supabase.from("payments").select("*"),
// //                     supabase.from("visitors").select("*"),
// //                 ]);
// //                 setPupils(pupilsData ?? []);
// //                 setStaff(staffData ?? []);
// //                 setAttendance(attData ?? []);
// //                 setPayments(payData ?? []);
// //                 setVisitors(visData ?? []);
// //             } catch (e: any) {
// //                 setError(e.message);
// //             } finally {
// //                 setLoading(false);
// //             }
// //         }
// //         load();
// //     }, []);

// //     const today = new Date().toISOString().split("T")[0];

// //     const filteredPupils = selectedClass === "All Classes"
// //         ? pupils
// //         : pupils.filter(p => (p.classGrade || p.class) === selectedClass);

// //     const totalPupils = filteredPupils.length;
// //     const malePupils = filteredPupils.filter(p => p.gender === "Male").length;
// //     const femalePupils = filteredPupils.filter(p => p.gender === "Female").length;

// //     const pupilsByClass = filteredPupils.reduce<Record<string, number>>((a, p) => {
// //         const c = p.classGrade || p.class;
// //         a[c] = (a[c] || 0) + 1;
// //         return a;
// //     }, {});
// //     const maleByClass = filteredPupils.reduce<Record<string, number>>((a, p) => {
// //         if (p.gender === "Male") {
// //             const c = p.classGrade || p.class;
// //             a[c] = (a[c] || 0) + 1;
// //         }
// //         return a;
// //     }, {});
// //     const femaleByClass = filteredPupils.reduce<Record<string, number>>((a, p) => {
// //         if (p.gender === "Female") {
// //             const c = p.classGrade || p.class;
// //             a[c] = (a[c] || 0) + 1;
// //         }
// //         return a;
// //     }, {});

// //     const attTodayAll = attendance.filter(a => a.date === today);
// //     const attToday = selectedClass === "All Classes"
// //         ? attTodayAll
// //         : attTodayAll.filter(a => (a.classGrade || a.class) === selectedClass);
// //     const presentToday = attToday.filter(a => a.status === "present").length;
// //     const absentToday = attToday.filter(a => a.status === "absent").length;

// //     const presentByClass = attToday.reduce<Record<string, number>>((a, a2) => {
// //         if (a2.status === "present") {
// //             const c = a2.classGrade || a2.class;
// //             a[c] = (a[c] || 0) + 1;
// //         }
// //         return a;
// //     }, {});
// //     const absentByClass = attToday.reduce<Record<string, number>>((a, a2) => {
// //         if (a2.status === "absent") {
// //             const c = a2.classGrade || a2.class;
// //             a[c] = (a[c] || 0) + 1;
// //         }
// //         return a;
// //     }, {});

// //     const totalStaff = staff.length;
// //     const staffByDept = staff.reduce<Record<string, number>>((a, s) => {
// //         const d = s.department || "<None>";
// //         a[d] = (a[d] || 0) + 1;
// //         return a;
// //     }, {});
// //     const staffByRole = staff.reduce<Record<string, number>>((a, s) => {
// //         const r = s.role || "<None>";
// //         a[r] = (a[r] || 0) + 1;
// //         return a;
// //     }, {});

// //     function termOrder(term: string) {
// //         const i = TERMS_ORDER.findIndex(t => t === term);
// //         return i === -1 ? 1000 : i;
// //     }

// //     const filteredPayments = payments.filter(p => {
// //         if (p.year.toString() !== selectedYear) return false;
// //         if (selectedClass !== "All Classes" && p.classGrade !== selectedClass) return false;
// //         return true;
// //     });

// //     const perStudent = new Map<string, {
// //         admissionNo: string;
// //         fullName: string;
// //         classGrade: string;
// //         term: string;
// //         year: number;
// //         totalFee: number;
// //         totalPaid: number;
// //     }>();
// //     filteredPayments.forEach(p => {
// //         const key = `${p.admissionNo}_${p.term}_${p.year}`;
// //         const ex = perStudent.get(key);
// //         if (ex) {
// //             ex.totalPaid += p.amountPaid;
// //             ex.totalFee = Math.max(ex.totalFee, p.totalFee);
// //         } else {
// //             perStudent.set(key, {
// //                 admissionNo: p.admissionNo,
// //                 fullName: p.fullName,
// //                 classGrade: p.classGrade,
// //                 term: p.term,
// //                 year: p.year,
// //                 totalFee: p.totalFee,
// //                 totalPaid: p.amountPaid,
// //             });
// //         }
// //     });

// //     const summary = Array.from(perStudent.values()).map(s => ({
// //         ...s,
// //         balance: s.totalFee - s.totalPaid,
// //     }));

// //     const prevTermsSummary = summary.filter(s => {
// //         if (s.year < Number(selectedYear)) return true;
// //         if (s.year === Number(selectedYear)) return termOrder(s.term) < termOrder(selectedTerm);
// //         return false;
// //     });
// //     const currentTermSummary = summary.filter(s => s.year === Number(selectedYear) && s.term === selectedTerm);

// //     const totalFeePrev = prevTermsSummary.reduce((acc, s) => acc + s.totalFee, 0);
// //     const totalPaidPrev = prevTermsSummary.reduce((acc, s) => acc + s.totalPaid, 0);
// //     const totalBalPrev = totalFeePrev - totalPaidPrev;

// //     const totalFeeCurrent = currentTermSummary.reduce((acc, s) => acc + s.totalFee, 0);
// //     const totalPaidCurrent = currentTermSummary.reduce((acc, s) => acc + s.totalPaid, 0);
// //     const totalBalCurrent = totalFeeCurrent - totalPaidCurrent;

// //     const payByClass = currentTermSummary.reduce<Record<string, { fee: number; paid: number; bal: number }>>((a, s) => {
// //         const c = s.classGrade;
// //         if (!a[c]) a[c] = { fee: 0, paid: 0, bal: 0 };
// //         a[c].fee += s.totalFee;
// //         a[c].paid += s.totalPaid;
// //         a[c].bal += s.balance;
// //         return a;
// //     }, {});

// //     const todayStr = new Date().toISOString().slice(0, 10);
// //     const monthStr = todayStr.slice(0, 7);
// //     const yearStr = todayStr.slice(0, 4);

// //     const totalVisitorsToday = useMemo(
// //         () => visitors.filter((v) => v.visit_date?.startsWith(todayStr)).length,
// //         [visitors, todayStr]
// //     );
// //     const totalVisitorsThisMonth = useMemo(
// //         () => visitors.filter((v) => v.visit_date?.startsWith(monthStr)).length,
// //         [visitors, monthStr]
// //     );
// //     const totalVisitorsThisYear = useMemo(
// //         () => visitors.filter((v) => v.visit_date?.startsWith(yearStr)).length,
// //         [visitors, yearStr]
// //     );
// //     const termCounts = useMemo(() => {
// //         const counts: Record<string, number> = {
// //             "Term I": 0,
// //             "Term II": 0,
// //             "Term III": 0,
// //             Unknown: 0,
// //         };
// //         visitors.forEach((v) => {
// //             if (v.term && counts[v.term] !== undefined) counts[v.term]++;
// //             else counts.Unknown++;
// //         });
// //         return counts;
// //     }, [visitors]);

// //     const uniqueClasses = Array.from(new Set(pupils.map(p => p.classGrade || p.class))).sort();

// //     if (loading) return <div className="p-6">Loading...</div>;
// //     if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

// //     return (
// //         <div className="p-6 space-y-6">
// //             <h1 className="text-2xl font-bold">🎓 School Dashboard & Reports</h1>

// //             {/* Filters */}
// //             <div className="flex flex-wrap gap-4 items-center mb-6">
// //                 <label>Term:&nbsp;
// //                     <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="border rounded px-3 py-1">
// //                         {TERMS_ORDER.map(term => <option key={term}>{term}</option>)}
// //                     </select>
// //                 </label>
// //                 <label>Year:&nbsp;
// //                     <input type="number" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border rounded px-3 py-1 w-24" />
// //                 </label>
// //                 <label>Class:&nbsp;
// //                     <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="border rounded px-3 py-1">
// //                         <option>All Classes</option>
// //                         {uniqueClasses.map(cls => <option key={cls}>{cls}</option>)}
// //                     </select>
// //                 </label>
// //             </div>

// //             {/* Stats */}
// //             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
// //                 {([
// //                     ["Total Pupils", totalPupils],
// //                     ["Male Pupils", malePupils],
// //                     ["Female Pupils", femalePupils],
// //                     ["Present Today", presentToday],
// //                     ["Absent Today", absentToday],
// //                     ["Total Staff", totalStaff],
// //                     ["Total Visitors", visitors.length],
// //                 ] as [string, number | string][]).map(([label, value], i) => <Stat key={i} label={label} value={value} />)}
// //             </div>

// //             {/* Visitors Summary */}
// //             <Section title="Visitors Summary">
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
// //                     <Card label="Today" value={totalVisitorsToday} />
// //                     <Card label="This Month" value={totalVisitorsThisMonth} />
// //                     <Card label="This Year" value={totalVisitorsThisYear} />
// //                     <div className="bg-purple-50 p-4 rounded text-sm">
// //                         <p className="font-medium text-purple-700">Visitors by Term</p>
// //                         <ul className="mt-2 space-y-1">
// //                             <li>Term I: {termCounts["Term I"]}</li>
// //                             <li>Term II: {termCounts["Term II"]}</li>
// //                             <li>Term III: {termCounts["Term III"]}</li>
// //                             <li>Unknown: {termCounts.Unknown}</li>
// //                         </ul>
// //                     </div>
// //                 </div>
// //             </Section>

// //             <Section title="Pupils by Class">
// //                 <Table headers={["Class", "Total", "Male", "Female"]} rows={Object.keys(pupilsByClass).map(cls => [cls, pupilsByClass[cls], maleByClass[cls] || 0, femaleByClass[cls] || 0])} />
// //             </Section>

// //             <Section title={`Attendance by Class (Today: ${today})`}>
// //                 <Table headers={["Class", "Present", "Absent"]} rows={Object.keys(pupilsByClass).map(cls => [cls, presentByClass[cls] || 0, absentByClass[cls] || 0])} />
// //             </Section>

// //             <Section title="Staff by Department">
// //                 <Table headers={["Department", "Count"]} rows={Object.entries(staffByDept)} />
// //             </Section>

// //             <Section title="Staff by Role">
// //                 <Table headers={["Role", "Count"]} rows={Object.entries(staffByRole)} />
// //             </Section>

// //             <Section title={`Payments Summary: Previous Terms (Before ${selectedTerm} ${selectedYear})`}>
// //                 <div className="grid grid-cols-3 gap-4">
// //                     <Card label="Total Fees" value={totalFeePrev} />
// //                     <Card label="Total Paid" value={totalPaidPrev} />
// //                     <Card label="Total Balance" value={totalBalPrev} />
// //                 </div>
// //             </Section>

// //             <Section title={`Payments Summary: ${selectedTerm} ${selectedYear}`}>
// //                 <div className="grid grid-cols-3 gap-4">
// //                     <Card label="Total Fees" value={totalFeeCurrent} />
// //                     <Card label="Total Paid" value={totalPaidCurrent} />
// //                     <Card label="Total Balance" value={totalBalCurrent} />
// //                 </div>
// //             </Section>

// //             <Section title={`Payments by Class (${selectedTerm} ${selectedYear})`}>
// //                 <Table headers={["Class", "Total Fees", "Total Paid", "Balance"]} rows={Object.entries(payByClass).map(([cls, sums]) => [cls, sums.fee, sums.paid, sums.bal])} />
// //             </Section>
// //         </div>
// //     );
// // }

// // function Stat({ label, value }: { label: string; value: number | string }) {
// //     return (
// //         <div className="bg-blue-100 p-4 rounded shadow">
// //             <div className="font-semibold">{label}</div>
// //             <div className="text-xl">{value}</div>
// //         </div>
// //     );
// // }

// // function Card({ label, value }: { label: string; value: number }) {
// //     return (
// //         <div className="bg-green-100 p-4 rounded shadow text-center">
// //             <div className="font-semibold">{label}</div>
// //             <div className="text-2xl">{value.toLocaleString()}</div>
// //         </div>
// //     );
// // }

// // function Section({ title, children }: { title: string; children: React.ReactNode }) {
// //     return (
// //         <section className="my-6">
// //             <h2 className="text-xl font-semibold mb-2">{title}</h2>
// //             {children}
// //         </section>
// //     );
// // }

// // function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
// //     return (
// //         <table className="w-full border-collapse border border-gray-300">
// //             <thead>
// //                 <tr>
// //                     {headers.map((h, i) => (
// //                         <th key={i} className="border border-gray-300 bg-gray-200 px-4 py-2 text-left">
// //                             {h}
// //                         </th>
// //                     ))}
// //                 </tr>
// //             </thead>
// //             <tbody>
// //                 {rows.length === 0 ? (
// //                     <tr>
// //                         <td colSpan={headers.length} className="text-center p-4">No data</td>
// //                     </tr>
// //                 ) : rows.map((row, i) => (
// //                     <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
// //                         {row.map((val, j) => (
// //                             <td key={j} className="border border-gray-300 px-4 py-2">
// //                                 {typeof val === "number" ? val.toLocaleString() : val}
// //                             </td>
// //                         ))}
// //                     </tr>
// //                 ))}
// //             </tbody>
// //         </table>
// //     );
// // }




