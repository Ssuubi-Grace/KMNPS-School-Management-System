// app/dashboard/page.tsx
'use client';
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Payment {
    id: string;
    admissionNo: string;
    fullName: string;
    classGrade: string;
    term: string;
    year: number;
    totalFee: number;
    amountPaid: number;
    date: string;
}

export default function Dashboard() {
    const [pupils, setPupils] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [visitors, setVisitors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [
                    { data: pupilsData },
                    { data: staffData },
                    { data: attData },
                    { data: payData },
                    { data: visData },
                ] = await Promise.all([
                    supabase.from("pupils").select("*"),
                    supabase.from("staff").select("*"),
                    supabase.from("attendance").select("*"),
                    supabase.from("payments").select("*"),
                    supabase.from("visitors").select("*"),
                ]);
                setPupils(pupilsData ?? []);
                setStaff(staffData ?? []);
                setAttendance(attData ?? []);
                setPayments(payData ?? []);
                setVisitors(visData ?? []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

    const today = new Date().toISOString().split("T")[0];

    // Pupils
    const totalPupils = pupils.length;
    const malePupils = pupils.filter(p => p.gender === "Male").length;
    const femalePupils = pupils.filter(p => p.gender === "Female").length;

    // Pupils by class
    const pupilsByClass = pupils.reduce<Record<string, number>>((a, p) => {
        const c = p.classGrade || p.class;
        a[c] = (a[c] || 0) + 1;
        return a;
    }, {});
    const maleByClass = pupils.reduce<Record<string, number>>((a, p) => {
        if (p.gender === "Male") {
            const c = p.classGrade || p.class;
            a[c] = (a[c] || 0) + 1;
        }
        return a;
    }, {});
    const femaleByClass = pupils.reduce<Record<string, number>>((a, p) => {
        if (p.gender === "Female") {
            const c = p.classGrade || p.class;
            a[c] = (a[c] || 0) + 1;
        }
        return a;
    }, {});

    // Attendance
    const attToday = attendance.filter(a => a.date === today);
    const presentToday = attToday.filter(a => a.status === "present").length;
    const absentToday = attToday.filter(a => a.status === "absent").length;
    const presentByClass = attToday.reduce<Record<string, number>>((a, a2) => {
        if (a2.status === "present") {
            const c = a2.classGrade || a2.class;
            a[c] = (a[c] || 0) + 1;
        }
        return a;
    }, {});
    const absentByClass = attToday.reduce<Record<string, number>>((a, a2) => {
        if (a2.status === "absent") {
            const c = a2.classGrade || a2.class;
            a[c] = (a[c] || 0) + 1;
        }
        return a;
    }, {});

    // Staff
    const totalStaff = staff.length;
    const staffByDept = staff.reduce<Record<string, number>>((a, s) => {
        const d = s.department || "<None>";
        a[d] = (a[d] || 0) + 1;
        return a;
    }, {});
    const staffByRole = staff.reduce<Record<string, number>>((a, s) => {
        const r = s.role || "<None>";
        a[r] = (a[r] || 0) + 1;
        return a;
    }, {});

    // Payments summary per student-term-year
    const perStudent = new Map<string, {
        admissionNo: string;
        fullName: string;
        classGrade: string;
        term: string;
        year: number;
        totalFee: number;
        totalPaid: number;
    }>();
    payments.forEach(p => {
        const key = `${p.admissionNo}_${p.term}_${p.year}`;
        const ex = perStudent.get(key);
        if (ex) {
            ex.totalPaid += p.amountPaid;
            // pick latest totalFee if updated
            ex.totalFee = Math.max(ex.totalFee, p.totalFee);
        } else {
            perStudent.set(key, {
                admissionNo: p.admissionNo,
                fullName: p.fullName,
                classGrade: p.classGrade,
                term: p.term,
                year: p.year,
                totalFee: p.totalFee,
                totalPaid: p.amountPaid,
            });
        }
    });
    const summary = Array.from(perStudent.values()).map(s => ({
        ...s,
        balance: s.totalFee - s.totalPaid,
    }));

    const totalFee = summary.reduce((acc, s) => acc + s.totalFee, 0);
    const totalPaid = summary.reduce((acc, s) => acc + s.totalPaid, 0);
    const totalBal = totalFee - totalPaid;

    // Payments per class
    const payByClass = summary.reduce<Record<string, { fee: number; paid: number; bal: number }>>((a, s) => {
        const c = s.classGrade;
        if (!a[c]) a[c] = { fee: 0, paid: 0, bal: 0 };
        a[c].fee += s.totalFee;
        a[c].paid += s.totalPaid;
        a[c].bal += s.balance;
        return a;
    }, {});

    // Visitors
    const totalVisitors = visitors.length;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">🎓 School Dashboard & Reports</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                {[
                    ["Total Pupils", totalPupils],
                    ["Male Pupils", malePupils],
                    ["Female Pupils", femalePupils],
                    ["Present Today", presentToday],
                    ["Absent Today", absentToday],
                    ["Total Staff", totalStaff],
                    ["Total Fee", `UGX ${totalFee.toLocaleString()}`],
                    ["Total Paid", `UGX ${totalPaid.toLocaleString()}`],
                    ["Total Balance", `UGX ${totalBal.toLocaleString()}`],
                    ["Total Visitors", totalVisitors],
                ].map(([label, val], i) => (
                    <Stat key={i} label={String(label)} value={val} />
                ))}
            </div>

            <Section title="Pupils by Class (M / F)">
                <ul className="list-disc pl-5">
                    {Object.entries(pupilsByClass).map(([c, cnt]) => (
                        <li key={c}>{c}: {cnt} (M:{maleByClass[c] || 0}, F:{femaleByClass[c] || 0})</li>
                    ))}
                </ul>
            </Section>

            <Section title="Today’s Attendance by Class">
                <ul className="list-disc pl-5">
                    {Object.entries(presentByClass).map(([c, pres]) => (
                        <li key={c}>{c}: Present {pres}, Absent {absentByClass[c] || 0}</li>
                    ))}
                </ul>
            </Section>

            <Section title="Staff by Department">
                <ul className="list-disc pl-5">
                    {Object.entries(staffByDept).map(([d, cnt]) => (
                        <li key={d}>{d}: {cnt}</li>
                    ))}
                </ul>
            </Section>

            <Section title="Staff by Role">
                <ul className="list-disc pl-5">
                    {Object.entries(staffByRole).map(([r, cnt]) => (
                        <li key={r}>{r}: {cnt}</li>
                    ))}
                </ul>
            </Section>

            <Section title="Payments by Class">
                <ul className="list-disc pl-5">
                    {Object.entries(payByClass).map(([c, obj]) => (
                        <li key={c}>
                            {c}: Fee UGX {obj.fee.toLocaleString()}, Paid UGX {obj.paid.toLocaleString()}, Bal UGX {obj.bal.toLocaleString()}
                        </li>
                    ))}
                </ul>
            </Section>
        </div>
    );
}

const Stat = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white p-4 rounded shadow text-sm">
        <div className="text-gray-600">{label}</div>
        <div className="text-xl font-bold">{value}</div>
    </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h2 className="text-lg font-medium mb-1">{title}</h2>
        {children}
    </div>
);

//has wrong total fees with others correct
// 'use client';
// import React, { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";

// const Dashboard = () => {
//     const [pupils, setPupils] = useState<any[]>([]);
//     const [staff, setStaff] = useState<any[]>([]);
//     const [attendance, setAttendance] = useState<any[]>([]);
//     const [payments, setPayments] = useState<any[]>([]);
//     const [visitors, setVisitors] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchAll = async () => {
//             setLoading(true);
//             try {
//                 const [
//                     { data: pupilsData, error: pe },
//                     { data: staffData, error: se },
//                     { data: attData, error: ae },
//                     { data: payData, error: pye },
//                     { data: visData, error: ve },
//                 ] = await Promise.all([
//                     supabase.from("pupils").select("*"),
//                     supabase.from("staff").select("*"),
//                     supabase.from("attendance").select("*"),
//                     supabase.from("payments").select("*"),
//                     supabase.from("visitors").select("*"),
//                 ]);
//                 if (pe || se || ae || pye || ve) throw pe || se || ae || pye || ve;

//                 setPupils(pupilsData || []);
//                 setStaff(staffData || []);
//                 setAttendance(attData || []);
//                 setPayments(payData || []);
//                 setVisitors(visData || []);
//             } catch (e: any) {
//                 setError(e.message);
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchAll();
//     }, []);

//     if (loading) return <div className="p-6">Loading...</div>;
//     if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

//     const today = new Date().toISOString().split("T")[0];

//     // Pupils stats...
//     const totalPupils = pupils.length;
//     const malePupils = pupils.filter(p => p.gender === "Male").length;
//     const femalePupils = pupils.filter(p => p.gender === "Female").length;

//     const pupilsByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         const cls = p.classGrade || p.class;
//         acc[cls] = (acc[cls] || 0) + 1;
//         return acc;
//     }, {});
//     const maleByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         if (p.gender === "Male") {
//             const cls = p.classGrade || p.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});
//     const femaleByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         if (p.gender === "Female") {
//             const cls = p.classGrade || p.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});

//     // Attendance today
//     const attToday = attendance.filter(a => a.date === today);
//     const presentToday = attToday.filter(a => a.status === "present").length;
//     const absentToday = attToday.filter(a => a.status === "absent").length;
//     const presentByClass = attToday.reduce<Record<string, number>>((acc, a) => {
//         if (a.status === "present") {
//             const cls = a.classGrade || a.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});
//     const absentByClass = attToday.reduce<Record<string, number>>((acc, a) => {
//         if (a.status === "absent") {
//             const cls = a.classGrade || a.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});

//     // Staff by department and role
//     const totalStaff = staff.length;
//     const staffByDept = staff.reduce<Record<string, number>>((acc, s) => {
//         const dept = s.department || "<No Dept>";
//         acc[dept] = (acc[dept] || 0) + 1;
//         return acc;
//     }, {});
//     const staffByRole = staff.reduce<Record<string, number>>((acc, s) => {
//         const role = s.role || "<No Role>";
//         acc[role] = (acc[role] || 0) + 1;
//         return acc;
//     }, {});

//     // Payments calculations
//     const totalFee = payments.reduce((sum, p) => sum + Number(p.totalFee || 0), 0);
//     const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid || 0), 0);
//     const totalBalance = totalFee - totalPaid;

//     // Visitors
//     const totalVisitors = visitors.length;

//     return (
//         <div className="p-6 space-y-6">
//             <h1 className="text-2xl font-bold">🎓 School Dashboard & Reports</h1>

//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
//                 <Stat label="Total Pupils" value={totalPupils} />
//                 <Stat label="Male Pupils" value={malePupils} />
//                 <Stat label="Female Pupils" value={femalePupils} />
//                 <Stat label="Present Today" value={presentToday} />
//                 <Stat label="Absent Today" value={absentToday} />
//                 <Stat label="Total Staff" value={totalStaff} />
//                 <Stat label="Total Fee" value={`UGX ${totalFee.toLocaleString()}`} />
//                 <Stat label="Total Paid" value={`UGX ${totalPaid.toLocaleString()}`} />
//                 <Stat label="Total Balance" value={`UGX ${totalBalance.toLocaleString()}`} />
//                 <Stat label="Total Visitors" value={totalVisitors} />
//             </div>

//             <Section title="Pupils by Class (M / F)">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(pupilsByClass).map(([cls, cnt]) => (
//                         <li key={cls}>
//                             {cls}: {cnt} (M: {maleByClass[cls] || 0}, F: {femaleByClass[cls] || 0})
//                         </li>
//                     ))}
//                 </ul>
//             </Section>

//             <Section title="Today’s Attendance by Class">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(presentByClass).map(([cls, cntP]) => (
//                         <li key={cls}>
//                             {cls}: Present {cntP}, Absent {absentByClass[cls] || 0}
//                         </li>
//                     ))}
//                 </ul>
//             </Section>

//             <Section title="Staff by Department">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(staffByDept).map(([dept, cnt]) => (
//                         <li key={dept}>{dept}: {cnt}</li>
//                     ))}
//                 </ul>
//             </Section>

//             <Section title="Staff by Role">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(staffByRole).map(([role, cnt]) => (
//                         <li key={role}>{role}: {cnt}</li>
//                     ))}
//                 </ul>
//             </Section>
//         </div>
//     );
// };

// const Stat = ({ label, value }: { label: string, value: string | number }) => (
//     <div className="bg-white p-4 rounded shadow text-sm">
//         <div className="text-gray-600">{label}</div>
//         <div className="text-xl font-bold">{value}</div>
//     </div>
// );

// const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
//     <div>
//         <h2 className="text-lg font-medium mb-1">{title}</h2>
//         {children}
//     </div>
// );

// export default Dashboard;


//with pupils and staff correct
// 'use client';
// import React, { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";

// const Dashboard = () => {
//     const [pupils, setPupils] = useState<any[]>([]);
//     const [staff, setStaff] = useState<any[]>([]);
//     const [attendance, setAttendance] = useState<any[]>([]);
//     const [payments, setPayments] = useState<any[]>([]);
//     const [visitors, setVisitors] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const load = async () => {
//             setLoading(true);
//             try {
//                 const [
//                     { data: pupilsData, error: pe },
//                     { data: staffData, error: se },
//                     { data: attData, error: ae },
//                     { data: payData, error: pye },
//                     { data: visData, error: ve },
//                 ] = await Promise.all([
//                     supabase.from("pupils").select("*"),
//                     supabase.from("staff").select("*"),
//                     supabase.from("attendance").select("*"),
//                     supabase.from("payments").select("*"),
//                     supabase.from("visitors").select("*"),
//                 ]);
//                 if (pe || se || ae || pye || ve)
//                     throw pe || se || ae || pye || ve;

//                 setPupils(pupilsData || []);
//                 setStaff(staffData || []);
//                 setAttendance(attData || []);
//                 setPayments(payData || []);
//                 setVisitors(visData || []);
//             } catch (e: any) {
//                 setError(e.message || e.toString());
//             } finally {
//                 setLoading(false);
//             }
//         };
//         load();
//     }, []);

//     if (loading) return <div className="p-6">Loading...</div>;
//     if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

//     const today = new Date().toISOString().split('T')[0];

//     // Pupil stats
//     const totalPupils = pupils.length;
//     const malePupils = pupils.filter(p => p.gender === "Male").length;
//     const femalePupils = pupils.filter(p => p.gender === "Female").length;
//     const pupilsByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         const cls = p.classGrade || p.class; // adjust field name
//         if (!acc[cls]) acc[cls] = 0;
//         acc[cls]++;
//         return acc;
//     }, {});
//     const maleByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         if (p.gender === "Male") {
//             const cls = p.classGrade || p.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});
//     const femaleByClass = pupils.reduce<Record<string, number>>((acc, p) => {
//         if (p.gender === "Female") {
//             const cls = p.classGrade || p.class;
//             acc[cls] = (acc[cls] || 0) + 1;
//         }
//         return acc;
//     }, {});

//     // Attendance stats
//     const attToday = attendance.filter(a => a.date === today);
//     const presentToday = attToday.filter(a => a.status === "present").length;
//     const absentToday = attToday.filter(a => a.status === "absent").length;
//     const presentByClass = attToday.reduce<Record<string, number>>((acc, a) => {
//         const cls = a.classGrade || a.class;
//         if (a.status === "present") acc[cls] = (acc[cls] || 0) + 1;
//         return acc;
//     }, {});
//     const absentByClass = attToday.reduce<Record<string, number>>((acc, a) => {
//         const cls = a.classGrade || a.class;
//         if (a.status === "absent") acc[cls] = (acc[cls] || 0) + 1;
//         return acc;
//     }, {});

//     // Staff stats
//     const totalStaff = staff.length;
//     const staffByDept = staff.reduce<Record<string, number>>((acc, s) => {
//         const d = s.department || "<None>";
//         acc[d] = (acc[d] || 0) + 1;
//         return acc;
//     }, {});
//     const staffByRole = staff.reduce<Record<string, number>>((acc, s) => {
//         const r = s.role || "<None>";
//         acc[r] = (acc[r] || 0) + 1;
//         return acc;
//     }, {});

//     // Payment stats
//     const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount_paid || 0), 0);
//     const totalBalance = payments.reduce((sum, p) => sum + Number(p.balance || 0), 0);

//     // Visitor stats
//     const totalVisitors = visitors.length;

//     return (
//         <div className="p-6 space-y-6">
//             <h1 className="text-2xl font-bold">🎓 School Dashboard</h1>

//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
//                 <Stat label="Total Pupils" value={totalPupils} />
//                 <Stat label="Male Pupils" value={malePupils} />
//                 <Stat label="Female Pupils" value={femalePupils} />
//                 <Stat label="Present Today" value={presentToday} />
//                 <Stat label="Absent Today" value={absentToday} />
//                 <Stat label="Total Staff" value={totalStaff} />
//                 <Stat label="Total Paid" value={`UGX ${totalPaid.toLocaleString()}`} />
//                 <Stat label="Total Balance" value={`UGX ${totalBalance.toLocaleString()}`} />
//                 <Stat label="Total Visitors" value={totalVisitors} />
//             </div>

//             <Section title="Pupils by Class">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(pupilsByClass).map(([cls, cnt]) =>
//                         <li key={cls}>{cls}: {cnt} (M {maleByClass[cls] || 0} / F {femaleByClass[cls] || 0})</li>
//                     )}
//                 </ul>
//             </Section>

//             <Section title="Attendance Today by Class">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(presentByClass).map(([cls, cnt]) =>
//                         <li key={cls}>{cls}: Present {cnt}, Absent {absentByClass[cls] || 0}</li>
//                     )}
//                 </ul>
//             </Section>

//             <Section title="Staff by Department">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(staffByDept).map(([dept, cnt]) =>
//                         <li key={dept}>{dept}: {cnt}</li>
//                     )}
//                 </ul>
//             </Section>

//             <Section title="Staff by Role">
//                 <ul className="list-disc pl-5">
//                     {Object.entries(staffByRole).map(([role, cnt]) =>
//                         <li key={role}>{role}: {cnt}</li>
//                     )}
//                 </ul>
//             </Section>
//         </div>
//     );
// };

// const Stat = ({ label, value }: { label: string, value: string | number }) => (
//     <div className="bg-white p-4 rounded shadow text-sm">
//         <div className="text-gray-600">{label}</div>
//         <div className="text-xl font-bold">{value}</div>
//     </div>
// );

// const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
//     <div>
//         <h2 className="text-lg font-medium mb-1">{title}</h2>
//         {children}
//     </div>
// );

// export default Dashboard;




// "use client";

// import React, { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";

// const Dashboard = () => {

//     // State
//     const [pupils, setPupils] = useState<any[]>([]);
//     const [staff, setStaff] = useState<any[]>([]);
//     const [attendance, setAttendance] = useState<any[]>([]);
//     const [payments, setPayments] = useState<any[]>([]);
//     const [visitors, setVisitors] = useState<any[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             try {
//                 const [pupilsData, staffData, attendanceData, paymentsData, visitorsData] =
//                     await Promise.all([
//                         supabase.from("pupils").select("*"),
//                         supabase.from("staff").select("*"),
//                         supabase.from("attendance").select("*"),
//                         supabase.from("payments").select("*"),
//                         supabase.from("visitors").select("*"),
//                     ]);

//                 console.log("✅ Pupils:", pupilsData.data);
//                 console.log("✅ Staff:", staffData.data);
//                 console.log("✅ Attendance:", attendanceData.data);
//                 console.log("✅ Payments:", paymentsData.data);
//                 console.log("✅ Visitors:", visitorsData.data);

//                 if (pupilsData.error) throw pupilsData.error;
//                 if (staffData.error) throw staffData.error;
//                 if (attendanceData.error) throw attendanceData.error;
//                 if (paymentsData.error) throw paymentsData.error;
//                 if (visitorsData.error) throw visitorsData.error;

//                 setPupils(pupilsData.data ?? []);
//                 setStaff(staffData.data ?? []);
//                 setAttendance(attendanceData.data ?? []);
//                 setPayments(paymentsData.data ?? []);
//                 setVisitors(visitorsData.data ?? []);
//             } catch (err: any) {
//                 console.error("❌ Error loading dashboard data:", err);
//                 setError(err.message || "Something went wrong");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, []);

//     // Derived stats
//     const totalPupils = pupils.length;
//     const malePupils = pupils.filter((p) => p.gender === "Male").length;
//     const femalePupils = pupils.filter((p) => p.gender === "Female").length;

//     const today = new Date().toISOString().split("T")[0];
//     const presentToday = attendance.filter((a) => a.date === today && a.status === "present").length;
//     const absentToday = attendance.filter((a) => a.date === today && a.status === "absent").length;

//     const totalStaff = staff.length;
//     const teachingStaff = staff.filter((s) => s.role === "Teacher").length;
//     const adminStaff = staff.filter((s) => s.role === "Admin").length;
//     const supportStaff = staff.filter((s) => s.role === "Support").length;

//     const totalPaid = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
//     const totalBalance = payments.reduce((sum, p) => sum + (p.balance || 0), 0);

//     const totalVisitors = visitors.length;

//     if (loading) return <div className="p-6 text-xl">Loading dashboard...</div>;
//     if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

//     return (
//         <div className="p-6">
//             <h1 className="text-2xl font-bold mb-4">🎓 School Manager Dashboard</h1>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <Stat label="Total Pupils" value={totalPupils} />
//                 <Stat label="Male Pupils" value={malePupils} />
//                 <Stat label="Female Pupils" value={femalePupils} />
//                 <Stat label="Present Today" value={presentToday} />
//                 <Stat label="Absent Today" value={absentToday} />
//                 <Stat label="Total Staff" value={totalStaff} />
//                 <Stat label="Teaching Staff" value={teachingStaff} />
//                 <Stat label="Admin Staff" value={adminStaff} />
//                 <Stat label="Support Staff" value={supportStaff} />
//                 <Stat label="Total Paid" value={`UGX ${totalPaid.toLocaleString()}`} />
//                 <Stat label="Total Balance" value={`UGX ${totalBalance.toLocaleString()}`} />
//                 <Stat label="Total Visitors" value={totalVisitors} />
//             </div>
//         </div>
//     );
// };

// const Stat = ({ label, value }: { label: string; value: string | number }) => (
//     <div className="bg-white shadow rounded-lg p-4 text-center">
//         <div className="text-gray-600">{label}</div>
//         <div className="text-xl font-bold">{value}</div>
//     </div>
// );

// export default Dashboard;





// 'use client';

// import React, { useEffect, useState } from 'react';
// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     Tooltip,
//     ResponsiveContainer,
// } from 'recharts';
// import { supabase } from '@/lib/supabaseClient';
// import { Card, CardContent } from '@/components/ui/card';

// type Department = 'Teaching' | 'Administration' | 'Support';

// interface Pupil {
//     pupil_id: string;
//     gender: 'Male' | 'Female';
//     class: string;
// }

// interface Attendance {
//     status: 'Present' | 'Absent';
//     date: string;
// }

// interface Staff {
//     department: Department;
// }

// interface Payment {
//     amount_paid: number;
//     balance: number;
//     pupil_id: string;
// }

// interface Visitor {
//     date: string;
// }

// const Dashboard = () => {
//     const [stats, setStats] = useState({
//         totalPupils: 0,
//         malePupils: 0,
//         femalePupils: 0,
//         pupilsPerClass: {} as Record<string, number>,
//         presentToday: 0,
//         absentToday: 0,
//         totalStaff: 0,
//         totalTeaching: 0,
//         totalAdmin: 0,
//         totalSupport: 0,
//     });

//     const [paymentStats, setPaymentStats] = useState({
//         totalPaid: 0,
//         totalBalance: 0,
//         paymentsPerClass: {} as Record<string, { paid: number; balance: number }>,
//     });

//     const [visitorsStats, setVisitorsStats] = useState({
//         totalVisitors: 0,
//         visitorsPerMonth: {} as Record<string, number>,
//     });

//     useEffect(() => {
//         // c
//         const fetchData = async () => {
//             const today = new Date().toISOString().split('T')[0];

//             const { data: pupilsRaw } = await supabase.from('pupils').select('*');
//             const pupils: Pupil[] = pupilsRaw || [];

//             const { data: attendanceRaw } = await supabase
//                 .from('attendance')
//                 .select('*')
//                 .eq('date', today);
//             const attendance: Attendance[] = attendanceRaw || [];

//             const { data: staffRaw } = await supabase.from('staff').select('*');
//             const staff: Staff[] = staffRaw || [];

//             const { data: paymentsRaw } = await supabase.from('payments').select('*');
//             const allPayments: Payment[] = paymentsRaw || [];

//             const { data: visitorsRaw } = await supabase.from('visitors').select('*');
//             const visitors: Visitor[] = visitorsRaw || [];

//             const departmentsCount: Record<Department, number> = {
//                 Teaching: 0,
//                 Administration: 0,
//                 Support: 0,
//             };

//             staff.forEach((member) => {
//                 if (departmentsCount[member.department] !== undefined) {
//                     departmentsCount[member.department]++;
//                 }
//             });

//             const pupilsPerClass: Record<string, number> = {};
//             let male = 0,
//                 female = 0;

//             pupils.forEach((pupil) => {
//                 if (pupil.gender === 'Male') male++;
//                 if (pupil.gender === 'Female') female++;
//                 if (!pupilsPerClass[pupil.class]) pupilsPerClass[pupil.class] = 0;
//                 pupilsPerClass[pupil.class]++;
//             });

//             const presentToday = attendance.filter((a) => a.status === 'Present').length;
//             const absentToday = attendance.filter((a) => a.status === 'Absent').length;

//             let totalPaid = 0,
//                 totalBalance = 0;
//             const paymentsPerClass: Record<string, { paid: number; balance: number }> = {};

//             allPayments.forEach((payment) => {
//                 totalPaid += payment.amount_paid || 0;
//                 totalBalance += payment.balance || 0;
//                 const pupil = pupils.find((p) => p.pupil_id === payment.pupil_id);
//                 if (pupil) {
//                     const cls = pupil.class;
//                     if (!paymentsPerClass[cls]) paymentsPerClass[cls] = { paid: 0, balance: 0 };
//                     paymentsPerClass[cls].paid += payment.amount_paid || 0;
//                     paymentsPerClass[cls].balance += payment.balance || 0;
//                 }
//             });

//             const visitorsPerMonth: Record<string, number> = {};
//             visitors.forEach((v) => {
//                 const date = new Date(v.date);
//                 const month = date.toLocaleString('default', { month: 'long' });
//                 visitorsPerMonth[month] = (visitorsPerMonth[month] || 0) + 1;
//             });

//             setStats({
//                 totalPupils: pupils.length,
//                 malePupils: male,
//                 femalePupils: female,
//                 pupilsPerClass,
//                 presentToday,
//                 absentToday,
//                 totalStaff: staff.length,
//                 totalTeaching: departmentsCount['Teaching'],
//                 totalAdmin: departmentsCount['Administration'],
//                 totalSupport: departmentsCount['Support'],
//             });

//             setPaymentStats({ totalPaid, totalBalance, paymentsPerClass });
//             setVisitorsStats({ totalVisitors: visitors.length, visitorsPerMonth });
//         };


//         fetchData();
//     }, []);

//     const classData = Object.entries(stats.pupilsPerClass).map(([cls, count]) => ({
//         class: cls,
//         count,
//     }));

//     const paymentChartData = Object.entries(paymentStats.paymentsPerClass).map(
//         ([cls, data]) => ({
//             class: cls,
//             paid: data.paid,
//             balance: data.balance,
//         })
//     );

//     const visitorChartData = Object.entries(visitorsStats.visitorsPerMonth).map(
//         ([month, count]) => ({ month, count })
//     );

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
//             <Card><CardContent><h2>Total Pupils</h2><p>{stats.totalPupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Male Pupils</h2><p>{stats.malePupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Female Pupils</h2><p>{stats.femalePupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Present Today</h2><p>{stats.presentToday}</p></CardContent></Card>
//             <Card><CardContent><h2>Absent Today</h2><p>{stats.absentToday}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Staff</h2><p>{stats.totalStaff}</p></CardContent></Card>
//             <Card><CardContent><h2>Teaching Staff</h2><p>{stats.totalTeaching}</p></CardContent></Card>
//             <Card><CardContent><h2>Admin Staff</h2><p>{stats.totalAdmin}</p></CardContent></Card>
//             <Card><CardContent><h2>Support Staff</h2><p>{stats.totalSupport}</p></CardContent></Card>

//             <Card><CardContent><h2>Total Paid</h2><p>UGX {paymentStats.totalPaid.toLocaleString()}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Balance</h2><p>UGX {paymentStats.totalBalance.toLocaleString()}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Visitors</h2><p>{visitorsStats.totalVisitors}</p></CardContent></Card>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Pupils Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={classData}>
//                         <XAxis dataKey="class" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="count" fill="#4f46e5" />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Payments Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={paymentChartData}>
//                         <XAxis dataKey="class" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="paid" fill="#10b981" />
//                         <Bar dataKey="balance" fill="#ef4444" />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Visitors Per Month</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={visitorChartData}>
//                         <XAxis dataKey="month" />
//                         <YAxis />
//                         <Tooltip />
//                         <Bar dataKey="count" fill="#f59e0b" />
//                     </BarChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;



// 'use client'
// import React, { useEffect, useState } from 'react';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { supabase } from '@/lib/supabaseClient';
// import { Card, CardContent } from '@/components/ui/card';

// const Dashboard = () => {
//     const [stats, setStats] = useState({
//         totalPupils: 0,
//         malePupils: 0,
//         femalePupils: 0,
//         pupilsPerClass: {},
//         presentToday: 0,
//         absentToday: 0,
//         totalStaff: 0,
//         totalTeaching: 0,
//         totalAdmin: 0,
//         totalSupport: 0,
//     });

//     const [paymentStats, setPaymentStats] = useState({
//         totalPaid: 0,
//         totalBalance: 0,
//         paymentsPerClass: {},
//     });

//     const [visitorsStats, setVisitorsStats] = useState({
//         totalVisitors: 0,
//         visitorsPerMonth: {},
//     });

//     useEffect(() => {
//         const fetchData = async () => {
//             const today = new Date().toISOString().split('T')[0];

//             const { data: pupils = [], error: pupilsError } = await supabase.from('pupils').select('*');
//             const { data: attendance = [], error: attendanceError } = await supabase.from('attendance').select('*').eq('date', today);
//             // const { data: teachingStaff = [], error: teachingError } = await supabase.from('teachers').select('*');
//             // const { data: nonTeachingStaff = [], error: nonTeachingError } = await supabase.from('non_teaching_staff').select('*');
//             const { data: staff = [], error: staffError } = await supabase.from('staff').select('*');

//             const { data: allPayments = [], error: paymentsError } = await supabase.from('payments').select('*');
//             const { data: visitors = [], error: visitorsError } = await supabase.from('visitors').select('*');


//             if (staffError) {
//                 console.error(staffError);
//             }

//             const departmentsCount = {
//                 Teaching: 0,
//                 Administration: 0,
//                 Support: 0,
//             };

//             // staff.forEach(member => {
//             //     const dept = member.department;
//             //     if (departmentsCount[dept] !== undefined) {
//             //         departmentsCount[dept]++;
//             //     }
//             // });
//             if (staff) {
//                 staff.forEach(member => {
//                     const dept = member.department;
//                     if (departmentsCount[dept] !== undefined) {
//                         departmentsCount[dept]++;
//                     }
//                 });
//             }

//             // totalStaff: staff.length,
//             //     teachingStaff: departmentsCount['Teaching'],
//             //         adminStaff: departmentsCount['Administration'],
//             //             supportStaff: departmentsCount['Support'],

//             if (pupilsError || attendanceError || teachingError || nonTeachingError || paymentsError || visitorsError) {
//                 console.error(pupilsError || attendanceError || teachingError || nonTeachingError || paymentsError || visitorsError);
//             }

//             const pupilsPerClass = {};
//             let male = 0, female = 0;
//             pupils.forEach(pupil => {
//                 if (pupil.gender === 'Male') male++;
//                 if (pupil.gender === 'Female') female++;
//                 if (!pupilsPerClass[pupil.class]) pupilsPerClass[pupil.class] = 0;
//                 pupilsPerClass[pupil.class]++;
//             });

//             const presentToday = attendance.filter(a => a.status === 'Present').length;
//             const absentToday = attendance.filter(a => a.status === 'Absent').length;

//             let totalPaid = 0, totalBalance = 0;
//             const paymentsPerClass = {};
//             allPayments.forEach(payment => {
//                 totalPaid += payment.amount_paid || 0;
//                 totalBalance += payment.balance || 0;
//                 const pupil = pupils.find(p => p.pupil_id === payment.pupil_id);
//                 if (pupil) {
//                     const cls = pupil.class;
//                     if (!paymentsPerClass[cls]) paymentsPerClass[cls] = { paid: 0, balance: 0 };
//                     paymentsPerClass[cls].paid += payment.amount_paid || 0;
//                     paymentsPerClass[cls].balance += payment.balance || 0;
//                 }
//             });

//             const visitorsPerMonth = {};
//             visitors.forEach(v => {
//                 const date = new Date(v.date);
//                 const month = date.toLocaleString('default', { month: 'long' });
//                 visitorsPerMonth[month] = (visitorsPerMonth[month] || 0) + 1;
//             });

//             setStats({
//                 totalPupils: pupils.length,
//                 malePupils: male,
//                 femalePupils: female,
//                 pupilsPerClass,
//                 presentToday,
//                 absentToday,
//                 totalStaff: staff.length,
//                 totalTeaching: departmentsCount['Teaching'],
//                 totalAdmin: departmentsCount['Administration'],
//                 totalSupport: departmentsCount['Support'],
//             });

//             setPaymentStats({ totalPaid, totalBalance, paymentsPerClass });
//             setVisitorsStats({ totalVisitors: visitors.length, visitorsPerMonth });
//         };

//         fetchData();
//     }, []);

//     const classData = Object.entries(stats.pupilsPerClass).map(([cls, count]) => ({ class: cls, count }));
//     const paymentChartData = Object.entries(paymentStats.paymentsPerClass).map(([cls, data]) => ({ class: cls, paid: data.paid, balance: data.balance }));
//     const visitorChartData = Object.entries(visitorsStats.visitorsPerMonth).map(([month, count]) => ({ month, count }));

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
//             <Card><CardContent><h2>Total Pupils</h2><p>{stats.totalPupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Male Pupils</h2><p>{stats.malePupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Female Pupils</h2><p>{stats.femalePupils}</p></CardContent></Card>
//             <Card><CardContent><h2>Present Today</h2><p>{stats.presentToday}</p></CardContent></Card>
//             <Card><CardContent><h2>Absent Today</h2><p>{stats.absentToday}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Staff</h2><p>{stats.totalStaff}</p></CardContent></Card>
//             <Card><CardContent><h2>Teaching Staff</h2><p>{stats.totalTeaching}</p></CardContent></Card>
//             <Card><CardContent><h2>Admin Staff</h2><p>{stats.totalAdmin}</p></CardContent></Card>
//             <Card><CardContent><h2>Support Staff</h2><p>{stats.totalSupport}</p></CardContent></Card>

//             <Card><CardContent><h2>Total Paid</h2><p>UGX {paymentStats.totalPaid.toLocaleString()}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Balance</h2><p>UGX {paymentStats.totalBalance.toLocaleString()}</p></CardContent></Card>
//             <Card><CardContent><h2>Total Visitors</h2><p>{visitorsStats.totalVisitors}</p></CardContent></Card>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Pupils Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={classData}><XAxis dataKey="class" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#4f46e5" /></BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Payments Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={paymentChartData}><XAxis dataKey="class" /><YAxis /><Tooltip /><Bar dataKey="paid" fill="#10b981" /><Bar dataKey="balance" fill="#ef4444" /></BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-full">
//                 <h3 className="text-lg font-bold mb-2">Visitors Per Month</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={visitorChartData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#f59e0b" /></BarChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;




// // export default function Dashboard() {
// //     return <div>Dashboard Page Coming Soon...</div>;
// // }

// import React, { useEffect, useState } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { supabase } from '@/utils/supabaseClient';

// const Dashboard = () => {
//     const [stats, setStats] = useState({
//         totalPupils: 0,
//         malePupils: 0,
//         femalePupils: 0,
//         pupilsPerClass: {},
//         presentToday: 0,
//         absentToday: 0,
//         totalStaff: 0,
//         totalTeaching: 0,
//         totalNonTeaching: 0,
//     });

//     const [paymentStats, setPaymentStats] = useState({
//         totalPaid: 0,
//         totalBalance: 0,
//         paymentsPerClass: {},
//     });

//     const [visitorsStats, setVisitorsStats] = useState({
//         totalVisitors: 0,
//         visitorsPerMonth: {},
//         visitorsPerTerm: {},
//         visitorsPerYear: {},
//     });

//     useEffect(() => {
//         const fetchData = async () => {
//             const today = new Date().toISOString().split('T')[0];

//             const { data: pupils, error: pupilsError } = await supabase.from('pupils').select('*');
//             const { data: attendance, error: attendanceError } = await supabase.from('attendance').select('*').eq('date', today);
//             const { data: teachingStaff, error: teachingError } = await supabase.from('teachers').select('*');
//             const { data: nonTeachingStaff, error: nonTeachingError } = await supabase.from('non_teaching_staff').select('*');
//             const { data: allPayments, error: paymentsError } = await supabase.from('payments').select('*');
//             const { data: visitors, error: visitorsError } = await supabase.from('visitors').select('*');

//             if (pupilsError || attendanceError || teachingError || nonTeachingError || paymentsError || visitorsError) {
//                 console.error(pupilsError || attendanceError || teachingError || nonTeachingError || paymentsError || visitorsError);
//             }

//             const pupilsPerClass = {};
//             let male = 0, female = 0;
//             pupils?.forEach(pupil => {
//                 if (pupil.gender === 'Male') male++;
//                 if (pupil.gender === 'Female') female++;
//                 if (!pupilsPerClass[pupil.class]) pupilsPerClass[pupil.class] = 0;
//                 pupilsPerClass[pupil.class]++;
//             });

//             const presentToday = attendance?.filter(a => a.status === 'Present').length || 0;
//             const absentToday = attendance?.filter(a => a.status === 'Absent').length || 0;

//             let totalPaid = 0, totalBalance = 0;
//             const paymentsPerClass = {};
//             allPayments?.forEach(payment => {
//                 totalPaid += payment.amount_paid || 0;
//                 totalBalance += payment.balance || 0;
//                 const pupil = pupils?.find(p => p.pupil_id === payment.pupil_id);
//                 if (pupil) {
//                     const cls = pupil.class;
//                     if (!paymentsPerClass[cls]) paymentsPerClass[cls] = { paid: 0, balance: 0 };
//                     paymentsPerClass[cls].paid += payment.amount_paid || 0;
//                     paymentsPerClass[cls].balance += payment.balance || 0;
//                 }
//             });

//             const visitorsPerMonth = {};
//             const visitorsPerTerm = {};
//             const visitorsPerYear = {};

//             visitors?.forEach(v => {
//                 const date = new Date(v.date);
//                 const month = date.toLocaleString('default', { month: 'long' });
//                 const year = date.getFullYear();
//                 const term = v.term || 'Unknown';

//                 visitorsPerMonth[month] = (visitorsPerMonth[month] || 0) + 1;
//                 visitorsPerTerm[term] = (visitorsPerTerm[term] || 0) + 1;
//                 visitorsPerYear[year] = (visitorsPerYear[year] || 0) + 1;
//             });

//             setStats({
//                 totalPupils: pupils?.length || 0,
//                 malePupils: male,
//                 femalePupils: female,
//                 pupilsPerClass,
//                 presentToday,
//                 absentToday,
//                 totalStaff: (teachingStaff?.length || 0) + (nonTeachingStaff?.length || 0),
//                 totalTeaching: teachingStaff?.length || 0,
//                 totalNonTeaching: nonTeachingStaff?.length || 0,
//             });

//             setPaymentStats({ totalPaid, totalBalance, paymentsPerClass });

//             setVisitorsStats({
//                 totalVisitors: visitors?.length || 0,
//                 visitorsPerMonth,
//                 visitorsPerTerm,
//                 visitorsPerYear,
//             });
//         };

//         fetchData();
//     }, []);

//     const classData = Object.entries(stats.pupilsPerClass).map(([cls, count]) => ({ class: cls, count }));
//     const paymentChartData = Object.entries(paymentStats.paymentsPerClass).map(([cls, data]) => ({ class: cls, paid: data.paid, balance: data.balance }));
//     const visitorChartData = Object.entries(visitorsStats.visitorsPerMonth).map(([month, count]) => ({ month, count }));

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
//             {/* Basic Stats */}
//             <Card><CardContent><h2 className="text-xl font-semibold">Total Pupils</h2><p className="text-2xl">{stats.totalPupils}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Male Pupils</h2><p className="text-2xl">{stats.malePupils}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Female Pupils</h2><p className="text-2xl">{stats.femalePupils}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Present Today</h2><p className="text-2xl">{stats.presentToday}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Absent Today</h2><p className="text-2xl">{stats.absentToday}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Total Staff</h2><p className="text-2xl">{stats.totalStaff}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Teaching Staff</h2><p className="text-2xl">{stats.totalTeaching}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Non-Teaching Staff</h2><p className="text-2xl">{stats.totalNonTeaching}</p></CardContent></Card>

//             {/* Payment Stats */}
//             <Card><CardContent><h2 className="text-xl font-semibold">Total Paid</h2><p className="text-2xl text-green-600">UGX {paymentStats.totalPaid.toLocaleString()}</p></CardContent></Card>
//             <Card><CardContent><h2 className="text-xl font-semibold">Total Balance</h2><p className="text-2xl text-red-600">UGX {paymentStats.totalBalance.toLocaleString()}</p></CardContent></Card>

//             {/* Visitors Stats */}
//             <Card><CardContent><h2 className="text-xl font-semibold">Total Visitors</h2><p className="text-2xl">{visitorsStats.totalVisitors}</p></CardContent></Card>

//             {/* Charts */}
//             <div className="col-span-1 md:col-span-2 lg:col-span-4">
//                 <h3 className="text-lg font-bold mb-2">Pupils Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={classData}><XAxis dataKey="class" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#4f46e5" /></BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-1 md:col-span-2 lg:col-span-4">
//                 <h3 className="text-lg font-bold mb-2">Payments Per Class</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={paymentChartData}><XAxis dataKey="class" /><YAxis /><Tooltip /><Bar dataKey="paid" fill="#10b981" name="Paid" /><Bar dataKey="balance" fill="#ef4444" name="Balance" /></BarChart>
//                 </ResponsiveContainer>
//             </div>

//             <div className="col-span-1 md:col-span-2 lg:col-span-4">
//                 <h3 className="text-lg font-bold mb-2">Visitors Per Month</h3>
//                 <ResponsiveContainer width="100%" height={300}>
//                     <BarChart data={visitorChartData}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#f59e0b" /></BarChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;




// // import React, { useEffect, useState } from 'react';
// // import { Card, CardContent } from '@/components/ui/card';
// // import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// // import { supabase } from '@/utils/supabaseClient';

// // const Dashboard = () => {
// //     const [stats, setStats] = useState({
// //         totalPupils: 0,
// //         malePupils: 0,
// //         femalePupils: 0,
// //         pupilsPerClass: {},
// //         presentToday: 0,
// //         absentToday: 0,
// //         totalStaff: 0,
// //         totalTeaching: 0,
// //         totalNonTeaching: 0,
// //     });

// //     useEffect(() => {
// //         const fetchData = async () => {
// //             // Fetch pupils data
// //             const { data: pupils, error: pupilsError } = await supabase.from('pupils').select('*');
// //             if (pupilsError) console.error(pupilsError);

// //             // Fetch attendance
// //             const today = new Date().toISOString().split('T')[0];
// //             const { data: attendance, error: attendanceError } = await supabase
// //                 .from('attendance')
// //                 .select('*')
// //                 .eq('date', today);
// //             if (attendanceError) console.error(attendanceError);

// //             // Fetch staff
// //             const { data: teachingStaff, error: teachingError } = await supabase.from('teachers').select('*');
// //             const { data: nonTeachingStaff, error: nonTeachingError } = await supabase.from('non_teaching_staff').select('*');
// //             if (teachingError) console.error(teachingError);
// //             if (nonTeachingError) console.error(nonTeachingError);

// //             const pupilsPerClass = {};
// //             let male = 0, female = 0;
// //             if (pupils) {
// //                 pupils.forEach(pupil => {
// //                     if (pupil.gender === 'Male') male++;
// //                     if (pupil.gender === 'Female') female++;
// //                     if (!pupilsPerClass[pupil.class]) pupilsPerClass[pupil.class] = 0;
// //                     pupilsPerClass[pupil.class]++;
// //                 });
// //             }

// //             const presentToday = attendance?.filter(a => a.status === 'Present').length || 0;
// //             const absentToday = attendance?.filter(a => a.status === 'Absent').length || 0;

// //             setStats({
// //                 totalPupils: pupils?.length || 0,
// //                 malePupils: male,
// //                 femalePupils: female,
// //                 pupilsPerClass,
// //                 presentToday,
// //                 absentToday,
// //                 totalStaff: (teachingStaff?.length || 0) + (nonTeachingStaff?.length || 0),
// //                 totalTeaching: teachingStaff?.length || 0,
// //                 totalNonTeaching: nonTeachingStaff?.length || 0,
// //             });
// //         };

// //         fetchData();
// //     }, []);

// //     const classData = Object.entries(stats.pupilsPerClass).map(([cls, count]) => ({ class: cls, count }));

// //     return (
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Total Pupils</h2>
// //                     <p className="text-2xl">{stats.totalPupils}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Male Pupils</h2>
// //                     <p className="text-2xl">{stats.malePupils}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Female Pupils</h2>
// //                     <p className="text-2xl">{stats.femalePupils}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Present Today</h2>
// //                     <p className="text-2xl">{stats.presentToday}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Absent Today</h2>
// //                     <p className="text-2xl">{stats.absentToday}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Total Staff</h2>
// //                     <p className="text-2xl">{stats.totalStaff}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Teaching Staff</h2>
// //                     <p className="text-2xl">{stats.totalTeaching}</p>
// //                 </CardContent>
// //             </Card>
// //             <Card>
// //                 <CardContent>
// //                     <h2 className="text-xl font-semibold">Non-Teaching Staff</h2>
// //                     <p className="text-2xl">{stats.totalNonTeaching}</p>
// //                 </CardContent>
// //             </Card>

// //             <div className="col-span-1 md:col-span-2 lg:col-span-4">
// //                 <h3 className="text-lg font-bold mb-2">Pupils Per Class</h3>
// //                 <ResponsiveContainer width="100%" height={300}>
// //                     <BarChart data={classData}>
// //                         <XAxis dataKey="class" />
// //                         <YAxis />
// //                         <Tooltip />
// //                         <Bar dataKey="count" fill="#4f46e5" />
// //                     </BarChart>
// //                 </ResponsiveContainer>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Dashboard;


// // // app/dashboard/page.tsx
// // import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// // import { cookies } from 'next/headers';

// // export default async function Dashboard() {
// //     const supabase = createServerComponentClient({ cookies });

// //     const { data: pupils } = await supabase.from('pupils').select('*');
// //     const { data: attendance } = await supabase.from('attendance').select('*');
// //     const { data: teachers } = await supabase.from('teachers').select('*');
// //     const { data: nonTeaching } = await supabase.from('non_teaching_staff').select('*');

// //     const totalPupils = pupils?.length || 0;
// //     const totalPresent = attendance?.filter((a) => a.status === 'Present').length || 0;
// //     const totalAbsent = attendance?.filter((a) => a.status === 'Absent').length || 0;
// //     const malePupils = pupils?.filter((p) => p.gender === 'Male').length || 0;
// //     const femalePupils = pupils?.filter((p) => p.gender === 'Female').length || 0;

// //     return (
// //         <div className="p-6 ml-64">
// //             <h1 className="text-2xl font-semibold mb-4">Dashboard Overview</h1>
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                 <StatCard title="Total Pupils" value={totalPupils} />
// //                 <StatCard title="Male Pupils" value={malePupils} />
// //                 <StatCard title="Female Pupils" value={femalePupils} />
// //                 <StatCard title="Present Today" value={totalPresent} />
// //                 <StatCard title="Absent Today" value={totalAbsent} />
// //                 <StatCard title="Teachers" value={teachers?.length || 0} />
// //                 <StatCard title="Non-teaching Staff" value={nonTeaching?.length || 0} />
// //             </div>
// //         </div>
// //     );
// // }

// // function StatCard({ title, value }: { title: string; value: number }) {
// //     return (
// //         <div className="bg-white shadow-md rounded-lg p-4">
// //             <h3 className="text-gray-600">{title}</h3>
// //             <p className="text-2xl font-bold text-gray-900">{value}</p>
// //         </div>
// //     );
// // }
