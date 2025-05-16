import Link from 'next/link';

export default function StudentsPage() {
    return (
        <div className="bg-white p-8 rounded-xl shadow-md max-w-3xl mx-auto mt-6">
            <h1 className="text-2xl font-bold mb-4">👧 Students Management</h1>
            < p > Add or manage student information here.</p >
            <Link href="/students/register" className="text-blue-600 underline">
                Register a New Pupil
            </Link>
            <div>
                <Link href="/students/list" className="text-blue-600 underline">
                    View all Pupils
                </Link>
            </div>

        </div >
    );
}


