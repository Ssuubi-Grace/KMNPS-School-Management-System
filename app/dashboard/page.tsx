
export default function Dashboard() {
    return <div>Dashboard Page Coming Soon...</div>;
}

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
