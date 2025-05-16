'use client';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
            <div className="font-bold text-lg">📘 School Manager</div>
            <div className="space-x-4 text-sm md:text-base">
                <Link href="/">Home</Link>
                <Link href="/students">Students</Link>
                <Link href="/classes/nursery">Nursery</Link>
                <Link href="/classes/primary">Primary</Link>
                <Link href="/payments">Payments</Link>
            </div>
        </nav>
    );
}
