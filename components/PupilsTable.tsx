import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Pupil } from '@/types/pupil';

interface PupilsTableProps {
    pupils: Pupil[];
    selectedClass: string;
}

export default function PupilsTable({ pupils, selectedClass }: PupilsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const pupilsPerPage = 10;
    const indexOfLast = currentPage * pupilsPerPage;
    const indexOfFirst = indexOfLast - pupilsPerPage;

    const filteredPupils = pupils.filter((p) =>
        p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.admissionNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentPupils = filteredPupils.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredPupils.length / pupilsPerPage);

    function exportToExcel() {
        const worksheet = XLSX.utils.json_to_sheet(pupils);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, selectedClass || 'Pupils');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(data, `${selectedClass}_Pupils_List.xlsx`);
    }

    return (
        <div className="p-4">
            {/* <h2 className="text-xl font-bold mb-4">📘 Pupils in {selectedClass}</h2> */}

            <input
                type="text"
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 p-2 border rounded w-full max-w-md"
            />

            <button
                onClick={exportToExcel}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
                Export to Excel
            </button>

            {pupils.length === 0 ? (
                <p className="text-gray-500">No students registered in this class yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-300 text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                {[ /* same headers as before */
                                    'id', 'Created_at', 'Full Name', 'Date of Birth', 'Gender', 'Nationality', 'Tribe', 'Religion', 'Disability', 'Home Language',
                                    'Parent Name', 'Relationship', 'Contact', 'Alt Contact', 'Email', 'Occupation', 'Address', 'Location',
                                    'Admission No', 'Class Grade', 'Stream', 'Enrollment Date', 'Previous School', 'Special Needs', 'Blood Group',
                                    'Allergies', 'Medical Conditions', 'Immunization Status', 'Emergency Person', 'Emergency Contact'
                                ].map((header, i) => (
                                    <th key={i} className="px-4 py-2 border whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentPupils.map((pupil, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    {Object.values(pupil).map((value, i) => (
                                        <td key={i} className="px-4 py-2 border">{value}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="mt-4 flex gap-3 items-center">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                        >
                            Prev
                        </button>

                        <span>Page {currentPage} of {totalPages}</span>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
