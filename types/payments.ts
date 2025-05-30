export interface Payment {
    id: number;
    date: string;
    fullName: string;
    admissionNo: string;
    classGrade: string;
    term: string;
    year: number;
    totalFee: number;
    amountPaid: number;
    balance: number; // ✅ I added this line

    requirements: {
        [key: string]: boolean;
    };
}
