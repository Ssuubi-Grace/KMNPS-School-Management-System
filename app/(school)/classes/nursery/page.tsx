'use client';

import Link from 'next/link';

export default function NurseryClasses() {
    const nurseryClasses = ['Baby Class', 'Middle Class', 'Top Class'];

    return (
        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-4">🍼 Nursery Classes</h1>
            <ul className="list-disc pl-6 text-gray-700">
                {nurseryClasses.map(cls => (
                    <li key={cls}>
                        <Link href={`/classes/view/${encodeURIComponent(cls)}`} className="text-blue-600 hover:underline">
                            {cls} Class
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}












