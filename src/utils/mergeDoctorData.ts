import { DoctorInput } from "../models/doctorModel.js"; 

// Helper function to merge nested objects or arrays (e.g., qualifications, languages)
const mergeNestedArray = <T>(existingArray: T[], updateArray?: T[]) => {
    return updateArray ? updateArray : existingArray;
};

const mergeDoctorData = (existingData: DoctorInput, updateData: Partial<DoctorInput>) => {
    return {
        // Merge personalInfo
        personalInfo: {
            ...existingData.personalInfo,
            ...updateData.personalInfo,
            address: {
                ...existingData.personalInfo.address,
                ...updateData.personalInfo?.address,
            },
        },
        // Merge professionalInfo
        professionalInfo: {
            ...existingData.professionalInfo,
            ...updateData.professionalInfo,
            qualifications: mergeNestedArray(
                existingData.professionalInfo.qualifications,
                updateData.professionalInfo?.qualifications
            ),
            languages: mergeNestedArray(
                existingData.professionalInfo.languages,
                updateData.professionalInfo?.languages
            ),
        },
        // Merge practiceInfo
        practiceInfo: {
            ...existingData.practiceInfo,
            ...updateData.practiceInfo,
            clinics: mergeNestedArray(
                existingData.practiceInfo.clinics,
                updateData.practiceInfo?.clinics
            ),
        },
        // Merge financialInfo
        financialInfo: {
            ...existingData.financialInfo,
            ...updateData?.financialInfo,  // Safely access updateData.financialInfo
            consultationFees: {
                online: updateData?.financialInfo?.consultationFees?.online ?? existingData.financialInfo?.consultationFees?.online,
                offline: updateData?.financialInfo?.consultationFees?.offline ?? existingData.financialInfo?.consultationFees?.offline,
            }
        },
        // Merge accountStatus
        accountStatus: {
            ...existingData.accountStatus,
            ...updateData.accountStatus,
        },
        // Ensure timestamps are not overridden if they are not provided
        createdAt: existingData.createdAt,
        updatedAt: new Date(), // Update the updatedAt field to reflect the new modification
    };
};

export default mergeDoctorData;
