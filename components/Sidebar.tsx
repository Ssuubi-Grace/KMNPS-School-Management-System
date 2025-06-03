// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Staff', href: '/staff' },
    { name: 'Visitors', href: '/visitors' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-screen bg-gray-900 text-white p-4 fixed">
            <div className="text-2xl font-bold mb-8">📊 Admin Panel</div>
            <ul className="space-y-4">
                {links.map((link) => (
                    <li key={link.name}>
                        <Link
                            href={link.href}
                            className={`block px-4 py-2 rounded hover:bg-gray-700 ${pathname === link.href ? 'bg-gray-700' : ''
                                }`}
                        >
                            {link.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
