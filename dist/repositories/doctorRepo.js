import Doctor from "../models/doctorModel.js";
class docRepo {
    async findDoc(email) {
        try {
            const existingDoc = await Doctor.findOne({ "personalInfo.email": email });
            return existingDoc;
        }
        catch (error) {
            console.error("Error finding the doctor by email:", error);
            throw error;
        }
    }
    async createDoc(doc) {
        if (!doc) {
            throw new Error("Invalid doctor data provided.");
        }
        try {
            const Doc = new Doctor(doc);
            await Doc.save();
            return Doc;
        }
        catch (error) {
            console.error("Error saving the document:", error);
            throw new Error("Error occurred while saving the doctor data.");
        }
    }
    async findDoctorById(docId) {
        try {
            const doctor = await Doctor.findById(docId);
            return doctor;
        }
        catch (error) {
            throw error;
        }
    }
    // Update Doctor Profile
    async updateProfile(docId, updateData) {
        try {
            const updatedProfile = await Doctor.findByIdAndUpdate(docId, updateData, {
                new: true,
                runValidators: true,
            });
            return updatedProfile;
        }
        catch (error) {
            throw error;
        }
    }
    async approval(docId, data) {
        try {
            const updatedData = {
                ...data,
                accountStatus: {
                    verificationStatus: "Pending",
                },
            };
            const applyApproval = await Doctor.findByIdAndUpdate(docId, { $set: updatedData }, { new: true });
            if (!applyApproval) {
                throw new Error("Doctor not found or update failed");
            }
            return { applyApproval };
        }
        catch (error) {
            throw error;
        }
    }
    async getDistinctSpecializations() {
        try {
            const uniqueSpecialization = await Doctor.distinct("professionalInfo.specialization");
            return uniqueSpecialization;
        }
        catch (error) {
            console.error("Error fetching specializations:", error);
            throw new Error("An error occurred while fetching specializations");
        }
    }
    async doctorsFiltering(filters) {
        try {
            const query = {};
            if (filters.consultationMode) {
                if (filters.consultationMode === "online") {
                    query["practiceInfo.consultationModes.online"] = true;
                    if (filters.consultationFee) {
                        query["financialInfo.consultationFees.online"] =
                            filters.consultationFee;
                    }
                }
                else if (filters.consultationMode === "offline") {
                    query["practiceInfo.consultationModes.offline"] = true;
                    if (filters.consultationFee) {
                        query["financialInfo.consultationFees.offline"] =
                            filters.consultationFee;
                    }
                }
                else if (filters.consultationMode === "both") {
                    2;
                    query["$and"] = [
                        { "practiceInfo.consultationModes.online": true },
                        { "practiceInfo.consultationModes.offline": true },
                    ];
                    if (filters.consultationFee) {
                        query["$or"] = [
                            {
                                "financialInfo.consultationFees.online": filters.consultationFee,
                            },
                            {
                                "financialInfo.consultationFees.offline": filters.consultationFee,
                            },
                        ];
                    }
                }
            }
            if (filters.experience !== undefined) {
                if (filters.experience === 0) {
                    query["professionalInfo.experience"] = { $lt: 5 };
                }
                else {
                    query["professionalInfo.experience"] = { $gte: filters.experience };
                }
            }
            if (filters.rating) {
                query.rating = { $gte: filters.rating };
            }
            if (filters.gender) {
                query["personalInfo.gender"] = filters.gender;
            }
            const filteredDoctors = await Doctor.find(query).exec();
            return filteredDoctors;
        }
        catch (error) {
            console.error("Error in doctorsFiltering repository:", error);
            throw error;
        }
    }
    async fetchingDoctors() {
        try {
            const fetchedDoctors = await Doctor.find();
            return fetchedDoctors;
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async showDoctorStatus(docId) {
        try {
            if (docId) {
                const doctorProfile = await Doctor.findOne({ _id: docId });
                if (doctorProfile) {
                    const doctorVerificationsStatus = doctorProfile.accountStatus?.verificationStatus;
                    if (doctorVerificationsStatus) {
                        return doctorVerificationsStatus;
                    }
                }
                return null;
            }
            throw new Error("Doctor ID is not provided");
        }
        catch (error) {
            console.log(error);
            throw new Error("An error occurred while fetching doctor status from repository");
        }
    }
    async approvingStatus(docId) {
        try {
            const approvedStatus = await Doctor.findOneAndUpdate({ _id: docId }, {
                $set: { "accountStatus.verificationStatus": "verified" },
            }, { new: true });
            return approvedStatus;
        }
        catch (error) {
            throw new Error("Failed to update the approval status");
        }
    }
    async rejectingDocProfile(docId) {
        try {
            const rejectededStatus = await Doctor.findOneAndUpdate({ _id: docId }, {
                $set: { "accountStatus.verificationStatus": "Rejected" },
            }, { new: true });
            if (!rejectededStatus) {
                throw new Error("Doctor not found or update failed");
            }
            return rejectededStatus;
        }
        catch (error) {
            throw new Error("Failed to update the approval status");
        }
    }
    async doctorBlock(docId) {
        try {
            const blockDoctor = await Doctor.findByIdAndUpdate({ _id: docId }, { $set: { isBlocked: true } }, { new: true });
            return blockDoctor;
        }
        catch (error) {
            throw error;
        }
    }
    async unBlockDoctor(docId) {
        try {
            const unBlockDoctor = await Doctor.findByIdAndUpdate({ _id: docId }, { $set: { isBlocked: false } }, { new: true });
            return unBlockDoctor;
        }
        catch (error) {
            throw error;
        }
    }
    async adminSearchDoctorData(data) {
        try {
            const regex = new RegExp(data, 'i');
            const filter = {
                $or: [
                    { 'personalInfo.name': { $regex: regex } },
                    { 'personalInfo.email': { $regex: regex } },
                    { 'personalInfo.phone': { $regex: regex } }
                ]
            };
            const doctors = await Doctor.find(filter).exec();
            return doctors;
        }
        catch (error) {
            throw new Error('Error in doctor repository');
        }
    }
    async changePassword(docId, newPass) {
        try {
            const updateResult = await Doctor.updateOne({ _id: docId }, { $set: { 'personalInfo.password': newPass } });
            return updateResult.modifiedCount > 0;
        }
        catch (error) {
            throw new Error("Database error while updating password");
        }
    }
    async updateProfileImage(docId, picPath) {
        try {
            const updatedProfile = await Doctor.findByIdAndUpdate({ _id: docId }, { 'personalInfo.profilePicture': picPath }, { new: true });
            if (!updatedProfile) {
                throw new Error('No doctor found with the given ID');
            }
            return updatedProfile;
        }
        catch (error) {
            console.error(error);
            throw new Error('Error updating profile picture: ' + error.message);
        }
    }
    async doctorFiltering(filter) {
        try {
            let query = {};
            switch (filter) {
                case 'pending':
                    query['accountStatus.accountVerification'] = 'pending';
                    break;
                case 'verified':
                    query['accountStatus.accountVerification'] = 'verified';
                    break;
                case 'rejected':
                    query['accountStatus.accountVerification'] = 'rejected';
                    break;
                case 'blocked':
                    query['isBlocked'] = true;
                    break;
                case 'unblocked':
                    query['isBlocked'] = false;
                    break;
                case 'all':
                default:
                    break;
            }
            const filteredDoctors = await Doctor.find(query).exec();
            return filteredDoctors;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchTotalDoctorsCount() {
        try {
            const totalDoctors = await Doctor.find({ 'accountStatus.verificationStatus': 'verified' }).countDocuments();
            return totalDoctors;
        }
        catch (error) {
            console.error('Error occurred in fetchTotalDoctorsCount repository:', error);
            throw new Error('Failed to fetch total doctors count');
        }
    }
    async fetchTotalMaleDoctorsAvailable() {
        try {
            const data = await Doctor.find({ 'personalInfo.gender': "Male" }).countDocuments();
            return data;
        }
        catch (error) {
            throw new Error(error);
            console.log(error);
        }
    }
    async fetchTotalFemaleDoctorsAvailable() {
        try {
            const data = await Doctor.find({ 'personalInfo.gender': "Female" }).countDocuments();
            return data;
        }
        catch (error) {
            throw new Error(error);
            console.log(error);
        }
    }
    async fetchOtherGender() {
        try {
            const OtherGender = await Doctor.find({ 'personalInfo.gender': 'Other' }).countDocuments();
            return OtherGender;
        }
        catch (error) {
            throw Error(error.message);
        }
    }
    async SearchDoctorData(specialization, location) {
        try {
            const matchQuery = {
                'accountStatus.verificationStatus': 'verified',
            };
            if (specialization) {
                matchQuery['professionalInfo.specialization'] = {
                    $regex: specialization,
                    $options: 'i',
                };
            }
            if (location) {
                matchQuery['personalInfo.address.city'] = {
                    $regex: location,
                    $options: 'i',
                };
            }
            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'feedbacks',
                        localField: '_id',
                        foreignField: 'doctorId',
                        as: 'feedback',
                    },
                },
                {
                    $unwind: {
                        path: '$feedback',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        doctor: { $first: '$$ROOT' },
                        averageRating: { $avg: '$feedback.rating' },
                    },
                },
                {
                    $addFields: {
                        'doctor.averageRating': { $ifNull: ['$averageRating', 0] },
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: '$doctor',
                    },
                },
            ];
            const doctors = await Doctor.aggregate(pipeline);
            return doctors;
        }
        catch (error) {
            throw new Error('Error occurred in the SearchDoctorData repository');
        }
    }
}
export default docRepo;
