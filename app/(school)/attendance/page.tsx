"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* helpers*/
function Select({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <select {...props} className="border p-2 w-full rounded">
                {children}
            </select>
        </div>
    );
}
function Button({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button {...props} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            {children}
        </button>
    );
}

/*static class list */
const classLabels = [
    "Baby Class",
    "Middle Class",
    "Top Class",
    "Primary One",
    "Primary Two",
    "Primary Three",
    "Primary Four",
    "Primary Five",
    "Primary Six",
    "Primary Seven",
];

/*pupil shape*/
interface Pupil {
    id: string;
    fullName: string;
    admissionNo: string;
    dob: string | null;
    gender: string | null;
    classGrade: string;
}

/* page */
export default function DailyAttendancePage() {
    const today = new Date().toISOString().slice(0, 10);
    const [classGrade, setClassGrade] = useState("");
    const [pupils, setPupils] = useState<Pupil[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, "Present" | "Absent">>({});
    const [submitted, setSubmitted] = useState(false);

    /* fetching pupils when class changes */
    useEffect(() => {
        if (!classGrade) return;
        (async () => {
            const { data, error } = await supabase
                .from("pupils")
                .select("id, fullName, admissionNo, dob, gender, classGrade")
                .eq("classGrade", classGrade)
                .order("fullName");
            if (error) return alert(error.message);
            setPupils((data as Pupil[]) || []);
            setStatusMap(Object.fromEntries((data || []).map((p) => [p.id, "Present"])) as any);
            setSubmitted(false);
        })();
    }, [classGrade]);

    /* helpers */
    const markAll = (choice: "Present" | "Absent") =>
        setStatusMap(Object.fromEntries(pupils.map((p) => [p.id, choice])) as any);

    const toggle = (id: string) =>
        setStatusMap((m) => ({ ...m, [id]: m[id] === "Present" ? "Absent" : "Present" }));

    /* submitting attendance */
    const handleSubmit = async () => {
        const rows = pupils.map((p) => ({
            pupil_id: p.id,
            classGrade,
            attendance_date: today,
            status: statusMap[p.id],
        }));
        const { error } = await supabase.from("attendance").upsert(rows, {
            onConflict: "pupil_id,attendance_date",
        });
        if (error) alert("Submit error: " + error.message);
        else setSubmitted(true);
    };

    /* counts */
    const presentCnt = pupils.filter((p) => statusMap[p.id] === "Present").length;
    const absentCnt = pupils.length - presentCnt;
    const presentM = pupils.filter((p) => p.gender === "Male" && statusMap[p.id] === "Present").length;
    const presentF = pupils.filter((p) => p.gender === "Female" && statusMap[p.id] === "Present").length;
    const absentM = pupils.filter((p) => p.gender === "Male" && statusMap[p.id] === "Absent").length;
    const absentF = pupils.filter((p) => p.gender === "Female" && statusMap[p.id] === "Absent").length;

    /* exporting PDF */
    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text(`Attendance Register – ${classGrade} – ${today}`, 14, 14);
        autoTable(doc, {
            startY: 22,
            head: [["#", "Full Name", "ID", "Gender", "Present?"]],
            body: pupils.map((p, i) => [
                i + 1,
                p.fullName,
                p.admissionNo,
                p.gender ?? "",
                statusMap[p.id],
            ]),
            styles: { fontSize: 8 },
        });
        const finalY = (doc as any).lastAutoTable?.finalY ?? 22; // 22 = fallback startY
        doc.text(
            `Totals ...`,
            14,
            finalY + 10
        );

        doc.save(`attendance_${classGrade.replace(/\s+/g, "_")}_${today}.pdf`);
    };

    return (
        <div className="p-4 space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold">Daily Attendance — {today}</h1>

            {/* class selector + bulk buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <Select label="Select Class" value={classGrade} onChange={(e) => setClassGrade(e.target.value)}>
                    <option value="">— Choose Class —</option>
                    {classLabels.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </Select>
                {classGrade && (
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={() => markAll("Present")}>
                            Mark All Present
                        </Button>
                        <Button type="button" onClick={() => markAll("Absent")}>
                            Mark All Absent
                        </Button>
                        <Button type="button" onClick={exportPDF}>
                            Export PDF
                        </Button>
                    </div>
                )}
            </div>

            {/* roster */}
            {pupils.length > 0 && (
                <>
                    <table className="w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 border">Present</th>
                                <th className="p-2 border">Full Name</th>
                                <th className="p-2 border">Student ID</th>
                                <th className="p-2 border">DOB</th>
                                <th className="p-2 border">Gender</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pupils.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-gray-50">
                                    <td className="p-2 border text-center">
                                        <input
                                            type="checkbox"
                                            checked={statusMap[p.id] === "Present"}
                                            onChange={() => toggle(p.id)}
                                        />
                                    </td>
                                    <td className="p-2 border">{p.fullName}</td>
                                    <td className="p-2 border">{p.admissionNo}</td>
                                    <td className="p-2 border">{p.dob}</td>
                                    <td className="p-2 border">{p.gender}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* totals + submit */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-2">
                        <div className="font-semibold leading-tight">
                            <p>
                                Present: {presentCnt} (M:{presentM} F:{presentF})
                                &nbsp;|&nbsp; Absent: {absentCnt} (M:{absentM} F:{absentF})
                            </p>
                        </div>
                        <Button onClick={handleSubmit}>Submit Attendance</Button>
                    </div>

                    {submitted && (
                        <div className="p-4 bg-green-100 text-green-800 rounded">
                            Attendance saved! Present: {presentCnt} (M:{presentM} F:{presentF}) &nbsp;
                            Absent: {absentCnt} (M:{absentM} F:{absentF})
                        </div>
                    )}
                </>
            )}

            {classGrade && pupils.length === 0 && (
                <p className="text-gray-500">No pupils found for {classGrade}.</p>
            )}
        </div>
    );
}

