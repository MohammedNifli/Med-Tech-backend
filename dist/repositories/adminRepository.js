import Admin from '../models/adminModel.js';
class AdminRepository {
    async findAdminByEmail(email) {
        try {
            const admin = await Admin.findOne({ email });
            return admin;
        }
        catch (error) {
            console.error('Error in findAdminByEmail:', error);
            throw error;
        }
    }
    async registerAdmin(data) {
        try {
            const newAdmin = new Admin(data);
            const savedAdmin = await newAdmin.save();
            return savedAdmin;
        }
        catch (error) {
            console.error('Error in registerAdmin:', error);
            throw error;
        }
    }
}
export default AdminRepository;
