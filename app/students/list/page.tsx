//Supabase Code
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';


export default function PupilListPage() {
    const [pupils, setPupils] = useState<any[]>([]);
    const [filteredPupils, setFilteredPupils] = useState<any[] | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPupils = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('pupils').select('*');

            if (error) {
                console.error('Error fetching pupils:', error.message);
            } else {
                setPupils(data);
                setFilteredPupils(data);
            }
            setLoading(false);
        };

        fetchPupils();
    }, []);

    const handleSearch = () => {
        const term = searchTerm.trim().toLowerCase();

        if (!term) {
            setFilteredPupils(pupils);
            return;
        }

        const match = pupils.filter(p =>
            p.fullName?.toLowerCase().includes(term) ||
            p.admissionNo?.toLowerCase().includes(term)
        );

        setFilteredPupils(match.length > 0 ? match : []);
    };

    if (loading) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold">📋 Registered Pupil</h2>
                <p>Loading pupil data...</p>
            </div>
        );
    }

    if (!loading && pupils.length === 0) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-2xl font-semibold">📋 Registered Pupil</h2>
                <p>No pupil data found. Please register a pupil first.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">📋 Registered Pupil Details</h2>

            {/* 🔍 Search Input */}
            <div className="mb-6 w-full max-w-4xl flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSearch();
                    }}
                    className="flex-1 border p-2 rounded"
                />
                <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Search
                </button>
                <button
                    onClick={() => {
                        setSearchTerm('');
                        setFilteredPupils(pupils);
                    }}
                    className="bg-white text-black border px-4 py-2 rounded hover:bg-gray-300"
                >
                    Clear
                </button>
            </div>

            {/* No match found */}
            {filteredPupils !== null && filteredPupils.length === 0 && (
                <p className="text-red-600 mb-4">No matching pupil found.</p>
            )}

            {/* 📋 Pupils Table */}
            {filteredPupils && filteredPupils.length > 0 && (
                <table className="min-w-full border border-gray-300 text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            {[
                                'Full Name', 'Date of Birth', 'Gender', 'Nationality', 'Tribe', 'Religion', 'Disability', 'Home Language',
                                'Parent Name', 'Relationship', 'Contact', 'Alt Contact', 'Email', 'Occupation', 'Address', 'Location',
                                'Admission No', 'Class Grade', 'Stream', 'Enrollment Date', 'Previous School', 'Special Needs', 'Blood Group',
                                'Allergies', 'Medical Conditions', 'Immunization Status', 'Emergency Person', 'Emergency Contact'
                            ].map((header, i) => (
                                <th key={i} className="px-4 py-2 border">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPupils.map((pupil, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-4 py-2 border">{pupil.fullName}</td>
                                <td className="px-4 py-2 border">{pupil.dob}</td>
                                <td className="px-4 py-2 border">{pupil.gender}</td>
                                <td className="px-4 py-2 border">{pupil.nationality}</td>
                                <td className="px-4 py-2 border">{pupil.tribe}</td>
                                <td className="px-4 py-2 border">{pupil.religion}</td>
                                <td className="px-4 py-2 border">{pupil.disability}</td>
                                <td className="px-4 py-2 border">{pupil.homeLanguage}</td>
                                <td className="px-4 py-2 border">{pupil.parentName}</td>
                                <td className="px-4 py-2 border">{pupil.relationship}</td>
                                <td className="px-4 py-2 border">{pupil.contact}</td>
                                <td className="px-4 py-2 border">{pupil.altContact}</td>
                                <td className="px-4 py-2 border">{pupil.email}</td>
                                <td className="px-4 py-2 border">{pupil.occupation}</td>
                                <td className="px-4 py-2 border">{pupil.address}</td>
                                <td className="px-4 py-2 border">{pupil.location}</td>
                                <td className="px-4 py-2 border">{pupil.admissionNo}</td>
                                <td className="px-4 py-2 border">{pupil.classGrade}</td>
                                <td className="px-4 py-2 border">{pupil.stream}</td>
                                <td className="px-4 py-2 border">{pupil.enrollmentDate}</td>
                                <td className="px-4 py-2 border">{pupil.previousSchool}</td>
                                <td className="px-4 py-2 border">{pupil.specialNeeds}</td>
                                <td className="px-4 py-2 border">{pupil.bloodGroup}</td>
                                <td className="px-4 py-2 border">{pupil.allergies}</td>
                                <td className="px-4 py-2 border">{pupil.medicalConditions}</td>
                                <td className="px-4 py-2 border">{pupil.immunizationStatus}</td>
                                <td className="px-4 py-2 border">{pupil.emergencyPerson}</td>
                                <td className="px-4 py-2 border">{pupil.emergencyContact}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

//LOCAL STORAGE CODE
// 'use client';

// import { useEffect, useState } from 'react';

// export default function PupilListPage() {
//     const [pupils, setPupils] = useState<any[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filteredPupils, setFilteredPupils] = useState<any[] | null>(null);

//     useEffect(() => {
//         const data = localStorage.getItem('pupilData');
//         if (data) {
//             try {
//                 const parsed = JSON.parse(data);
//                 const loadedPupils = Array.isArray(parsed) ? parsed : [parsed];
//                 setPupils(loadedPupils);
//                 setFilteredPupils(loadedPupils);
//             } catch (e) {
//                 console.error('Failed to parse pupilData:', e);
//             }
//         }
//     }, []);

//     const handleSearch = () => {
//         const term = searchTerm.trim().toLowerCase();

//         if (!term) {
//             setFilteredPupils(pupils);
//             return;
//         }

//         const match = pupils.filter(p =>
//             p.fullName?.toLowerCase().includes(term) ||
//             p.admissionNo?.toLowerCase().includes(term)
//         );

//         setFilteredPupils(match.length > 0 ? match : []);
//     };


//     // const handleSearch = () => {
//     //     if (!searchTerm.trim()) {
//     //         setFilteredPupils(pupils);
//     //         return;
//     //     }

//     //     const match = pupils.filter(p =>
//     //         p.fullName.toLowerCase() === searchTerm.toLowerCase() ||
//     //         p.admissionNo.toLowerCase() === searchTerm.toLowerCase()
//     //     );

//     //     setFilteredPupils(match.length > 0 ? match : []);
//     // };

//     if (pupils.length === 0) {
//         return (
//             <div className="p-6 text-center">
//                 <h2 className="text-2xl font-semibold">📋 Registered Pupil</h2>
//                 <p>No pupil data found. Please register a pupil first.</p>
//             </div>
//         );
//     }

//     return (
//         <div className="p-6 max-w-7xl mx-auto overflow-x-auto">
//             <h2 className="text-2xl font-bold mb-4">📋 Registered Pupil Details</h2>

//             {/* 🔍 Search Input */}
//             <div className="mb-6 w-full max-w-4xl flex items-center space-x-2">
//                 <input
//                     type="text"
//                     placeholder="Search by name or admission number..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === 'Enter') handleSearch();
//                     }}
//                     className="flex-1 border p-2 rounded"
//                 />
//                 <button
//                     onClick={handleSearch}
//                     className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//                 >
//                     Search
//                 </button>
//                 <button
//                     onClick={() => {
//                         setSearchTerm('');
//                         setFilteredPupils(pupils);
//                     }}
//                     className="bg-white text-black border px-4 py-2 rounded hover:bg-gray-300"
//                 >
//                     Clear
//                 </button>
//             </div>

//             {/* <div className="mb-6 max-w-md">
//                 <input
//                     type="text"
//                     placeholder="Search by name or admission number..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     onKeyDown={(e) => {
//                         if (e.key === 'Enter') handleSearch();
//                     }}
//                     className="w-full border p-2 rounded"
//                 />
//                 <button
//                     onClick={() => {
//                         setSearchTerm('');
//                         setFilteredPupils(pupils);
//                     }}
//                     className="bg-white text-black border  px-4 py-2 rounded hover:bg-gray-500"
//                 >
//                     Clear Search
//                 </button>
//             </div> */}

//             {/* Show message if no match found */}
//             {filteredPupils !== null && filteredPupils.length === 0 && (
//                 <p className="text-red-600 mb-4">No matching pupil found.</p>
//             )}

//             {/* 📋 Pupils Table */}
//             {filteredPupils && filteredPupils.length > 0 && (
//                 <table className="min-w-full border border-gray-300 text-sm text-left">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             {[
//                                 'Full Name', 'Date of Birth', 'Gender', 'Nationality', 'Tribe', 'Religion', 'Disability', 'Home Language',
//                                 'Parent Name', 'Relationship', 'Contact', 'Alt Contact', 'Email', 'Occupation', 'Address', 'Location',
//                                 'Admission No', 'Class Grade', 'Stream', 'Enrollment Date', 'Previous School', 'Special Needs', 'Blood Group',
//                                 'Allergies', 'Medical Conditions', 'Immunization Status', 'Emergency Person', 'Emergency Contact'
//                             ].map((header, i) => (
//                                 <th key={i} className="px-4 py-2 border">{header}</th>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {filteredPupils.map((pupil, index) => (
//                             <tr key={index} className="hover:bg-gray-50">
//                                 <td className="px-4 py-2 border">{pupil.fullName}</td>
//                                 <td className="px-4 py-2 border">{pupil.dob}</td>
//                                 <td className="px-4 py-2 border">{pupil.gender}</td>
//                                 <td className="px-4 py-2 border">{pupil.nationality}</td>
//                                 <td className="px-4 py-2 border">{pupil.tribe}</td>
//                                 <td className="px-4 py-2 border">{pupil.religion}</td>
//                                 <td className="px-4 py-2 border">{pupil.disability}</td>
//                                 <td className="px-4 py-2 border">{pupil.homeLanguage}</td>
//                                 <td className="px-4 py-2 border">{pupil.parentName}</td>
//                                 <td className="px-4 py-2 border">{pupil.relationship}</td>
//                                 <td className="px-4 py-2 border">{pupil.contact}</td>
//                                 <td className="px-4 py-2 border">{pupil.altContact}</td>
//                                 <td className="px-4 py-2 border">{pupil.email}</td>
//                                 <td className="px-4 py-2 border">{pupil.occupation}</td>
//                                 <td className="px-4 py-2 border">{pupil.address}</td>
//                                 <td className="px-4 py-2 border">{pupil.location}</td>
//                                 <td className="px-4 py-2 border">{pupil.admissionNo}</td>
//                                 <td className="px-4 py-2 border">{pupil.classGrade}</td>
//                                 <td className="px-4 py-2 border">{pupil.stream}</td>
//                                 <td className="px-4 py-2 border">{pupil.enrollmentDate}</td>
//                                 <td className="px-4 py-2 border">{pupil.previousSchool}</td>
//                                 <td className="px-4 py-2 border">{pupil.specialNeeds}</td>
//                                 <td className="px-4 py-2 border">{pupil.bloodGroup}</td>
//                                 <td className="px-4 py-2 border">{pupil.allergies}</td>
//                                 <td className="px-4 py-2 border">{pupil.medicalConditions}</td>
//                                 <td className="px-4 py-2 border">{pupil.immunizationStatus}</td>
//                                 <td className="px-4 py-2 border">{pupil.emergencyPerson}</td>
//                                 <td className="px-4 py-2 border">{pupil.emergencyContact}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// }




