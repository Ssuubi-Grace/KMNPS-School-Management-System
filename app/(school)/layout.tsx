// app/(school)/layout.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Ensure all necessary Lucide icons are imported
import { ChevronDown, ChevronUp, Menu, X, Home, Users, Briefcase, DollarSign, Wallet, Clipboard, Search, BarChart } from 'lucide-react';

// Your existing sidebarNavLinks definition with icons
const sidebarNavLinks = [
    { href: '/dashboard', label: 'Dashboard', type: 'link', icon: Home },
    { href: '/attendance', label: 'Attendance', type: 'link', icon: Clipboard },
    {
        label: 'Students',
        type: 'dropdown',
        slug: 'students',
        icon: Users,
        subLinks: [
            { href: '/students/register', label: 'Add New Pupil' },
            { href: '/students/list', label: 'View All Pupils' },
        ],
    },
    {
        label: 'Staff',
        type: 'dropdown',
        slug: 'staff',
        icon: Briefcase,
        subLinks: [
            { href: '/staff', label: 'Add New Staff' },
            { href: '/Allstaff', label: 'View All Staff' },
        ],
    },
    { href: '/classes/nursery', label: 'Nursery', type: 'link', icon: Users },
    { href: '/classes/primary', label: 'Primary', type: 'link', icon: Users },
    {
        label: 'Payments',
        type: 'dropdown',
        slug: 'payments',
        icon: DollarSign,
        subLinks: [
            { href: '/payments', label: 'Make Payment' },
            { href: '/Allpayments', label: 'View All Payments' },
            { href: '/Allpayments/LatestPaymentsSummary', label: 'Payments Summary' },
        ],
    },
    {
        label: 'Salaries',
        type: 'dropdown',
        slug: 'salaries',
        icon: Wallet,
        subLinks: [
            { href: '/salary/paySalary', label: 'Pay Salary' },
            { href: '/salary/salaryRecords', label: 'View Salary Records' },
            { href: '/salary/salaryRecords/SalaryRecordsSummary', label: 'Salary Records Summary' },
        ],
    },
    {
        label: 'Visitors',
        type: 'dropdown',
        slug: 'visitors',
        icon: Search,
        subLinks: [
            { href: '/visitors', label: 'Add Visitor' },
            { href: '/Allvisitors', label: 'View All Visitors' },
        ],
    },
    { href: '/reports', label: 'Reports', type: 'link', icon: BarChart },
];


interface SchoolLayoutProps {
    children: React.ReactNode;
}

export default function SchoolLayout({ children }: SchoolLayoutProps) {
    const pathname = usePathname();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleDropdown = (slug: string) => {
        setOpenDropdown(openDropdown === slug ? null : slug);
    };

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex flex-1 min-h-0 bg-gray-100 pt-16">
            {/* Sidebar Navigation */}
            {/* Key changes: `sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto` */}
            {/* `h-[calc(100vh-4rem)]` makes it full viewport height minus the 64px (4rem) of the top navbar. */}
            {/* `overflow-y-auto` ensures the sidebar itself scrolls if its content is too long. */}
            <nav className={`
                ${isSidebarCollapsed ? 'w-20' : 'w-64'}
                bg-gray-800 text-white p-6 shadow-lg flex-shrink-0
                hidden md:flex flex-col
                transition-all duration-300 ease-in-out
                sticky top-0 h-[calc(100vh-4rem)] overflow-y-auto
            `}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${isSidebarCollapsed ? 'hidden' : 'block'}`}>

                        📘 School Manager
                    </h2>
                    <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-700">
                        {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>
                <ul className="space-y-2 flex-grow"> {/* `flex-grow` ensures the ul takes available height */}
                    <li>
                        <Link href="/">
                            <p className={`flex items-center px-3 py-2 rounded transition-colors duration-200 ${pathname === '/' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
                                <span className={isSidebarCollapsed ? 'mx-auto' : 'mr-3'}>
                                    <Home size={20} />
                                </span>
                                <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>Home</span>
                            </p>
                        </Link>
                    </li>
                    {sidebarNavLinks.map((item) => (
                        <li key={item.label}>
                            {item.type === 'link' ? (
                                <Link href={item.href || '#'}>
                                    <p className={`flex items-center px-3 py-2 rounded transition-colors duration-200 ${pathname === item.href ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
                                        <span className={isSidebarCollapsed ? 'mx-auto' : 'mr-3'}>
                                            {item.icon && <item.icon size={20} />}
                                        </span>
                                        <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                            {item.label}
                                        </span>
                                    </p>
                                </Link>
                            ) : (
                                <div className="relative">
                                    <button
                                        onClick={() => toggleDropdown(item.slug || '')}
                                        className={`w-full text-left flex items-center justify-between px-3 py-2 rounded transition-colors duration-200 ${pathname.startsWith(`/${item.slug}`) ? 'bg-blue-700' : 'hover:bg-gray-700'
                                            }`}
                                    >
                                        <span className="flex items-center">
                                            <span className={isSidebarCollapsed ? 'mx-auto' : 'mr-3'}>
                                                {item.icon && <item.icon size={20} />}
                                            </span>
                                            <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                        </span>
                                        <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                            {openDropdown === item.slug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </span>
                                    </button>
                                    {openDropdown === item.slug && (
                                        <ul className={`pl-4 mt-2 space-y-1 bg-gray-700 rounded-md py-1 ${isSidebarCollapsed ? 'hidden' : 'block'}`}>
                                            {item.subLinks?.map((subLink) => (
                                                <li key={subLink.href}>
                                                    <Link href={subLink.href}>
                                                        <p className={`block px-3 py-2 rounded transition-colors duration-200 ${pathname === subLink.href ? 'bg-blue-600' : 'hover:bg-gray-600'}`}>
                                                            {subLink.label}
                                                        </p>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Main Content Area */}
            {/* This remains largely the same, its `flex-1` will adjust to the sidebar's width. */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}







// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation'; // Hook to get current path for active link styling

// interface SchoolLayoutProps {
//     children: React.ReactNode;
// }

// export default function SchoolLayout({ children }: SchoolLayoutProps) {
//     const pathname = usePathname(); // Getting the current URL path

//     const navLinks = [
//         { href: '/dashboard', label: 'Dashboard' },
//         { href: '/attendance', label: 'Attendance' },
//         { href: '/students', label: 'Students' },
//         { href: '/staff', label: 'Staff' },
//         { href: '/nursery', label: 'Nursery' },
//         { href: '/primary', label: 'Primary' },
//         { href: '/payments', label: 'Payments' },
//         { href: '/salaries', label: 'Salaries' },
//         { href: '/visitors', label: 'Visitors' },
//         { href: '/reports', label: 'Reports' },
//     ];

//     return (
//         <div className="flex min-h-screen bg-gray-100">
//             {/* Sidebar Navigation */}
//             <nav className="w-64 bg-gray-800 text-white p-6 space-y-4 h-screen sticky top-0 shadow-lg">
//                 <h2 className="text-xl font-bold mb-6">🎓 School Manager</h2>
//                 <ul className="space-y-2">
//                     <li>
//                         <Link href="/"> {/* Link back to the home page if it's separate */}
//                             <p className={`block px-3 py-2 rounded transition-colors duration-200 ${pathname === '/' ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
//                                 Home
//                             </p>
//                         </Link>
//                     </li>
//                     {navLinks.map((link) => (
//                         <li key={link.href}>
//                             <Link href={link.href}>
//                                 <p className={`block px-3 py-2 rounded transition-colors duration-200 ${pathname === link.href ? 'bg-blue-700' : 'hover:bg-gray-700'}`}>
//                                     {link.label}
//                                 </p>
//                             </Link>
//                         </li>
//                     ))}
//                 </ul>
//             </nav>

//             {/* Main Content Area */}
//             <main className="flex-1 p-4 overflow-auto">
//                 {children} {/* This is where your individual page content will be rendered */}
//             </main>
//         </div>
//     );
// }