'use client';
type Pupil = {
    admissionNo: string;
    fullName: string;
    classGrade: string;
};

import { useState } from 'react';

import { supabase } from '@/lib/supabaseClient';


// Initial form data constant
const initialFormData = {
    fullName: '',
    dob: '',
    gender: '',
    nationality: '',
    tribe: '',
    religion: '',
    disability: '',
    homeLanguage: '',
    parentName: '',
    relationship: '',
    contact: '',
    altContact: '',
    email: '',
    occupation: '',
    address: '',
    location: '',
    admissionNo: '',
    classGrade: '',
    stream: '',
    enrollmentDate: '',
    previousSchool: '',
    specialNeeds: '',
    bloodGroup: '',
    allergies: '',
    medicalConditions: '',
    immunizationStatus: '',
    emergencyPerson: '',
    emergencyContact: '',
};

export default function PupilRegistrationForm() {
    const [formData, setFormData] = useState(initialFormData);

    // Updating form data when inputs change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // 1. Fetching all pupils in the same class
            const { data: existingPupils, error } = await supabase
                .from('pupils')
                .select('classGrade')
                .eq('classGrade', formData.classGrade);

            if (error) throw error;

            const currentYear = new Date().getFullYear();
            const sameClassCount = existingPupils?.length || 0;

            const classMap: { [key: string]: string } = {
                'Baby Class': 'B',
                'Middle Class': 'M',
                'Top Class': 'T',
                'Primary One': 'P1',
                'Primary Two': 'P2',
                'Primary Three': 'P3',
                'Primary Four': 'P4',
                'Primary Five': 'P5',
                'Primary Six': 'P6',
                'Primary Seven': 'P7',
            };

            const cleanedClass = formData.classGrade.trim();
            const classPrefix = classMap[cleanedClass] || 'UNK';
            const nextNumber = String(sameClassCount + 1).padStart(3, '0');
            const generatedAdmissionNo = `${String(currentYear).slice(-2)}${classPrefix}${nextNumber}`;

            const newPupil = { ...formData, admissionNo: generatedAdmissionNo };

            // 2. Inserting pupil into Supabase
            const { data, error: insertError } = await supabase
                .from('pupils')
                .insert([newPupil]);

            if (insertError) throw insertError;

            alert(`Pupil Registered Successfully with ID ${generatedAdmissionNo}`);
            setFormData(initialFormData);
        } catch (error) {
            console.error('Error registering pupil:', error);
            alert('There was an error saving the data.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold">🧒 Pupil Registration</h2>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    className="input"
                    value={formData.fullName}
                    onChange={handleChange}
                />
                <div>
                    <label htmlFor="dob" className="block">Date of Birth</label>
                    <input
                        type="date"
                        id="dob"
                        name="dob"
                        className="input"
                        value={formData.dob}
                        onChange={handleChange}
                    />
                </div>
                <select
                    name="gender"
                    className="input"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="">Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <input
                    type="text"
                    name="nationality"
                    placeholder="Nationality"
                    className="input"
                    value={formData.nationality}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="tribe"
                    placeholder="Tribe"
                    className="input"
                    value={formData.tribe}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="religion"
                    placeholder="Religion"
                    className="input"
                    value={formData.religion}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="disability"
                    placeholder="Any Disability (If any)"
                    className="input"
                    value={formData.disability}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="homeLanguage"
                    placeholder="Home Language"
                    className="input"
                    value={formData.homeLanguage}
                    onChange={handleChange}
                />
            </div>

            {/* Guardian Info */}
            <h3 className="text-xl font-semibold">👨‍👩‍👧 Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="parentName"
                    placeholder="Parent/Guardian Name"
                    className="input"
                    value={formData.parentName}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="relationship"
                    placeholder="Relationship to Student"
                    className="input"
                    value={formData.relationship}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="contact"
                    placeholder="Contact Number"
                    className="input"
                    value={formData.contact}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="altContact"
                    placeholder="Alternative Contact"
                    className="input"
                    value={formData.altContact}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    className="input"
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="occupation"
                    placeholder="Occupation"
                    className="input"
                    value={formData.occupation}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Home Address"
                    className="input"
                    value={formData.address}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    className="input"
                    value={formData.location}
                    onChange={handleChange}
                />
            </div>

            {/* Academic Info */}
            <h3 className="text-xl font-semibold">📘 Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="admissionNo"
                    placeholder="Admission Number"
                    className="input"
                    value={formData.admissionNo}
                    onChange={handleChange}
                />

                <select
                    name="classGrade"
                    className="input"
                    value={formData.classGrade}
                    onChange={handleChange}
                >
                    <option value="">Select Class/Grade</option>
                    <option value="Baby Class">Baby Class</option>
                    <option value="Middle Class">Middle Class</option>
                    <option value="Top Class">Top Class</option>
                    <option value="Primary One">Primary One</option>
                    <option value="Primary Two">Primary Two</option>
                    <option value="Primary Three">Primary Three</option>
                    <option value="Primary Four">Primary Four</option>
                    <option value="Primary Five">Primary Five</option>
                    <option value="Primary Six">Primary Six</option>
                    <option value="Primary Seven">Primary Seven</option>
                </select>

                <input
                    type="text"
                    name="stream"
                    placeholder="Stream"
                    className="input"
                    value={formData.stream}
                    onChange={handleChange}
                />
                <div>
                    <label htmlFor="enrollmentDate" className="block">Enrollment Date</label>
                    <input
                        type="date"
                        id="enrollmentDate"
                        name="enrollmentDate"
                        className="input"
                        value={formData.enrollmentDate}
                        onChange={handleChange}
                    />
                </div>
                <input
                    type="text"
                    name="previousSchool"
                    placeholder="Previous School"
                    className="input"
                    value={formData.previousSchool}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="specialNeeds"
                    placeholder="Special Needs (if any)"
                    className="input"
                    value={formData.specialNeeds}
                    onChange={handleChange}
                />
            </div>

            {/* Health Info */}
            <h3 className="text-xl font-semibold">🩺 Health & Emergency</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                    type="text"
                    name="bloodGroup"
                    placeholder="Blood Group"
                    className="input"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="allergies"
                    placeholder="Known Allergies"
                    className="input"
                    value={formData.allergies}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="medicalConditions"
                    placeholder="Medical Conditions"
                    className="input"
                    value={formData.medicalConditions}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="immunizationStatus"
                    placeholder="Immunization Status"
                    className="input"
                    value={formData.immunizationStatus}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="emergencyPerson"
                    placeholder="Emergency Contact Person"
                    className="input"
                    value={formData.emergencyPerson}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="emergencyContact"
                    placeholder="Emergency Contact Number"
                    className="input"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                />
            </div>

            <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded">
                Register Pupil
            </button>
        </form>
    );
}


// //LOCAL STORAGE CODE

// 'use client';
// type Pupil = {
//     admissionNo: string;
//     fullName: string;
//     classGrade: string;

// };

// import { useState } from 'react';

// // Initial form data constant
// const initialFormData = {
//     fullName: '',
//     dob: '',
//     gender: '',
//     nationality: '',
//     tribe: '',
//     religion: '',
//     disability: '',
//     homeLanguage: '',
//     parentName: '',
//     relationship: '',
//     contact: '',
//     altContact: '',
//     email: '',
//     occupation: '',
//     address: '',
//     location: '',
//     admissionNo: '',
//     classGrade: '',
//     stream: '',
//     enrollmentDate: '',
//     previousSchool: '',
//     specialNeeds: '',
//     bloodGroup: '',
//     allergies: '',
//     medicalConditions: '',
//     immunizationStatus: '',
//     emergencyPerson: '',
//     emergencyContact: '',
// };

// export default function PupilRegistrationForm() {
//     const [formData, setFormData] = useState(initialFormData);

//     // Updating form data when inputs change
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();

//         try {
//             const existingData = localStorage.getItem('pupilData');
//             const parsedData = Array.isArray(JSON.parse(existingData || '[]'))
//                 ? (JSON.parse(existingData || '[]') as Pupil[])
//                 : [];

//             const currentYear = new Date().getFullYear(); // Get current year (e.g., 2025)

//             // Filteing students by class to get the count for auto-generation
//             const sameClassStudents = parsedData.filter(
//                 (student) => student.classGrade === formData.classGrade
//             );

//             // Determining class prefix based on class selection
//             const classMap: { [key: string]: string } = {
//                 'Baby Class': 'B',
//                 'Middle Class': 'M',
//                 'Top Class': 'T',
//                 'Primary One': 'P1',
//                 'Primary Two': 'P2',
//                 'Primary Three': 'P3',
//                 'Primary Four': 'P4',
//                 'Primary Five': 'P5',
//                 'Primary Six': 'P6',
//                 'Primary Seven': 'P7',
//             };

//             const cleanedClass = formData.classGrade.trim();
//             const classPrefix = classMap[cleanedClass] || 'UNK';

//             // Generating the unique admission number by incrementing last 3 digits
//             const nextNumber = String(sameClassStudents.length + 1).padStart(3, '0');

//             // Combining year (last two digits), class prefix, and the next number
//             const generatedAdmissionNo = `${String(currentYear).slice(-2)}${classPrefix}${nextNumber}`;

//             // Creating the new student object with generated admission number
//             const newStudent = { ...formData, admissionNo: generatedAdmissionNo };

//             // Saving the updated student list to localStorage
//             const updatedData = [...parsedData, newStudent];
//             localStorage.setItem('pupilData', JSON.stringify(updatedData));

//             // Resetting the form data
//             setFormData(initialFormData);

//             // Alerting the user with the generated ID
//             alert(`Pupil Registered Successfully with ID ${generatedAdmissionNo}`);
//         } catch (error) {
//             console.error('Failed to save pupil data:', error);
//             alert('There was an error saving the data.');
//         }
//     };
//     ``

//     return (
//         <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-4">
//             <h2 className="text-2xl font-bold">🧒 Pupil Registration</h2>

//             {/* Personal Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                     type="text"
//                     name="fullName"
//                     placeholder="Full Name"
//                     className="input"
//                     value={formData.fullName}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="date"
//                     name="dob"
//                     className="input"
//                     value={formData.dob}
//                     onChange={handleChange}
//                 />
//                 <select
//                     name="gender"
//                     className="input"
//                     value={formData.gender}
//                     onChange={handleChange}
//                 >
//                     <option value="">Gender</option>
//                     <option value="Male">Male</option>
//                     <option value="Female">Female</option>
//                 </select>
//                 <input
//                     type="text"
//                     name="nationality"
//                     placeholder="Nationality"
//                     className="input"
//                     value={formData.nationality}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="tribe"
//                     placeholder="Tribe"
//                     className="input"
//                     value={formData.tribe}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="religion"
//                     placeholder="Religion"
//                     className="input"
//                     value={formData.religion}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="disability"
//                     placeholder="Any Disability (If any)"
//                     className="input"
//                     value={formData.disability}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="homeLanguage"
//                     placeholder="Home Language"
//                     className="input"
//                     value={formData.homeLanguage}
//                     onChange={handleChange}
//                 />
//             </div>

//             {/* Guardian Info */}
//             <h3 className="text-xl font-semibold">👨‍👩‍👧 Guardian Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                     type="text"
//                     name="parentName"
//                     placeholder="Parent/Guardian Name"
//                     className="input"
//                     value={formData.parentName}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="relationship"
//                     placeholder="Relationship to Student"
//                     className="input"
//                     value={formData.relationship}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="contact"
//                     placeholder="Contact Number"
//                     className="input"
//                     value={formData.contact}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="altContact"
//                     placeholder="Alternative Contact"
//                     className="input"
//                     value={formData.altContact}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="email"
//                     name="email"
//                     placeholder="Email Address"
//                     className="input"
//                     value={formData.email}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="occupation"
//                     placeholder="Occupation"
//                     className="input"
//                     value={formData.occupation}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="address"
//                     placeholder="Home Address"
//                     className="input"
//                     value={formData.address}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="location"
//                     placeholder="Location"
//                     className="input"
//                     value={formData.location}
//                     onChange={handleChange}
//                 />
//             </div>

//             {/* Academic Info */}
//             <h3 className="text-xl font-semibold">📘 Academic Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                     type="text"
//                     name="admissionNo"
//                     placeholder="Admission Number"
//                     className="input"
//                     value={formData.admissionNo}
//                     onChange={handleChange}
//                 />
//                 {/* <input
//                     type="text"
//                     name="classGrade"
//                     placeholder="Class/Grade"
//                     className="input"
//                     value={formData.classGrade}
//                     onChange={handleChange}
//                 /> */}
//                 <select
//                     name="classGrade"
//                     className="input"
//                     value={formData.classGrade}
//                     onChange={handleChange}
//                 >
//                     <option value="">Select Class/Grade</option>
//                     <option value="Baby Class">Baby Class</option>
//                     <option value="Middle Class">Middle Class</option>
//                     <option value="Top Class">Top Class</option>
//                     <option value="Primary One">Primary One</option>
//                     <option value="Primary Two">Primary Two</option>
//                     <option value="Primary Three">Primary Three</option>
//                     <option value="Primary Four">Primary Four</option>
//                     <option value="Primary Five">Primary Five</option>
//                     <option value="Primary Six">Primary Six</option>
//                     <option value="Primary Seven">Primary Seven</option>
//                 </select>

//                 <input
//                     type="text"
//                     name="stream"
//                     placeholder="Stream"
//                     className="input"
//                     value={formData.stream}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="date"
//                     name="enrollmentDate"
//                     className="input"
//                     value={formData.enrollmentDate}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="previousSchool"
//                     placeholder="Previous School"
//                     className="input"
//                     value={formData.previousSchool}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="specialNeeds"
//                     placeholder="Special Needs (if any)"
//                     className="input"
//                     value={formData.specialNeeds}
//                     onChange={handleChange}
//                 />
//             </div>

//             {/* Health Info */}
//             <h3 className="text-xl font-semibold">🩺 Health & Emergency</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <input
//                     type="text"
//                     name="bloodGroup"
//                     placeholder="Blood Group"
//                     className="input"
//                     value={formData.bloodGroup}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="allergies"
//                     placeholder="Known Allergies"
//                     className="input"
//                     value={formData.allergies}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="medicalConditions"
//                     placeholder="Medical Conditions"
//                     className="input"
//                     value={formData.medicalConditions}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="immunizationStatus"
//                     placeholder="Immunization Status"
//                     className="input"
//                     value={formData.immunizationStatus}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="emergencyPerson"
//                     placeholder="Emergency Contact Person"
//                     className="input"
//                     value={formData.emergencyPerson}
//                     onChange={handleChange}
//                 />
//                 <input
//                     type="text"
//                     name="emergencyContact"
//                     placeholder="Emergency Contact Number"
//                     className="input"
//                     value={formData.emergencyContact}
//                     onChange={handleChange}
//                 />
//             </div>

//             <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded">
//                 Register Pupil
//             </button>
//         </form>
//     );
// }