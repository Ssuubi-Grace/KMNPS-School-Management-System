'use client';

import Link from 'next/link';

export default function PrimaryClasses() {
    const primaryClasses = ['Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'];

    return (
        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
            <h1 className="text-2xl font-bold mb-4">📚 Primary Classes</h1>
            <ul className="list-disc pl-6 text-gray-700">
                {primaryClasses.map(cls => (
                    <li key={cls}>
                        <Link href={`/classes/view/${encodeURIComponent(cls)}`} className="text-blue-600 hover:underline">
                            {cls}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}




