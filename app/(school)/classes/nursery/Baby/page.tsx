'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ClassStudentsPage() {
    const [students, setStudents] = useState([]);
    const params = useParams();
    const className = decodeURIComponent((params.className as string) || '');

    useEffect(() => {
        const data = localStorage.getItem('pupilData');
        if (data) {
            const allStudents = JSON.parse(data);
            const classStudents = allStudents.filter((s: any) => s.classGrade.toLowerCase() === className.toLowerCase());
            setStudents(classStudents);
        }
    }, [className]);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-blue-600 mb-4">📘 Pupils in {className}</h1>
            {students.length === 0 ? (
                <p>No students registered in this class yet.</p>
            ) : (
                <ul className="space-y-2">
                    {students.map((student: any, index: number) => (
                        <li key={index} className="bg-gray-100 rounded p-3">
                            <p><strong>Name:</strong> {student.fullName}</p>
                            <p><strong>Admission No:</strong> {student.admissionNo}</p>
                            <p><strong>Stream:</strong> {student.stream}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
