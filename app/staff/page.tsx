export default function Staff() {
    return <div>Staff Page Coming Soon...</div>;
}

// // app/staff/page.tsx
// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';

// export default async function StaffPage() {
//     const supabase = createServerComponentClient({ cookies });
//     const { data: teachers } = await supabase.from('teachers').select('*');
//     const { data: nonTeaching } = await supabase.from('non_teaching_staff').select('*');

//     return (
//         <div className="p-6 ml-64">
//             <h2 className="text-2xl font-semibold mb-4">Teaching Staff</h2>
//             <StaffTable data={teachers || []} fields={['name', 'assigned_class', 'subject', 'contact']} />

//             <h2 className="text-2xl font-semibold mt-10 mb-4">Non-Teaching Staff</h2>
//             <StaffTable data={nonTeaching || []} fields={['name', 'role', 'department', 'contact']} />
//         </div>
//     );
// }

// function StaffTable({ data, fields }: { data: any[]; fields: string[] }) {
//     return (
//         <table className="w-full table-auto border mb-6">
//             <thead>
//                 <tr>
//                     {fields.map((f) => (
//                         <th key={f} className="border px-4 py-2 capitalize">{f.replace('_', ' ')}</th>
//                     ))}
//                 </tr>
//             </thead>
//             <tbody>
//                 {data.map((row) => (
//                     <tr key={row.id}>
//                         {fields.map((f) => (
//                             <td key={f} className="border px-4 py-2">{row[f]}</td>
//                         ))}
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     );
// }
