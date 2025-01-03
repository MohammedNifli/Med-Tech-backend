export interface IPatient{
    name: string;
    email: string;
    dateOfBirth:Date,
    age: number;
    gender: "Male" | "Female" | "Other";
    phone:string;
    address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    createdAt: Date;
    updatedAt: Date; 
}