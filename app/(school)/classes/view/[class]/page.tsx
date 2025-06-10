'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PupilsTable from '@/components/PupilsTable';
import { Pupil } from '@/types/pupil';
import { supabase } from '@/lib/supabaseClient';

export default function ViewClassPage() {
    const params = useParams();
    const selectedClass = decodeURIComponent(params.class as string);
    const [filteredPupils, setFilteredPupils] = useState<Pupil[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPupilsByClass = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('pupils')
                .select('*')
                .eq('classGrade', selectedClass);

            if (error) {
                console.error('Error fetching pupils from Supabase:', error.message);
            } else {
                setFilteredPupils(data as Pupil[]);
            }

            setLoading(false);
        };

        if (selectedClass) {
            fetchPupilsByClass();
        }
    }, [selectedClass]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">📘 Pupils in {selectedClass}</h2>

            {loading ? (
                <p className="text-gray-500">Loading pupils...</p>
            ) : filteredPupils.length > 0 ? (
                <PupilsTable pupils={filteredPupils} selectedClass={selectedClass} />
            ) : (
                <p className="text-gray-600">No students registered in this class yet.</p>
            )}
        </div>
    );
}


// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import PupilsTable from '@/components/PupilsTable';
// import { Pupil } from '@/types/pupil';

// export default function ViewClassPage() {
//     const params = useParams();
//     const selectedClass = decodeURIComponent(params.class as string);
//     const [filteredPupils, setFilteredPupils] = useState<Pupil[]>([]);

//     useEffect(() => {
//         //const stored = localStorage.getItem('pupils');
//         const stored = localStorage.getItem('pupilData'); // not 'pupils'

//         if (stored) {
//             const allPupils: Pupil[] = JSON.parse(stored);
//             const classPupils = allPupils.filter(p => p.classGrade === selectedClass);
//             setFilteredPupils(classPupils);
//         }
//     }, [selectedClass]);

//     return (
//         <div className="p-6">
//             <h2 className="text-2xl font-bold mb-4">📘 Pupils in {selectedClass}</h2>
//             {filteredPupils.length > 0 ? (
//                 <PupilsTable pupils={filteredPupils} selectedClass={selectedClass} />

//             ) : (
//                 <p className="text-gray-600">No students registered in this class yet.</p>
//             )}
//         </div>
//     );
// }
