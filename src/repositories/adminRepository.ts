
import { IAdminRepo } from "../Interfaces/admin/IAdminRepo.js";
import Admin, { IAdmin, IAdminInput } from '../models/adminModel.js';

class AdminRepository implements IAdminRepo {
  public async findAdminByEmail(email: string): Promise<IAdmin | null> {
    try {
      const admin = await Admin.findOne({ email });
      return admin;
    } catch (error) {
      console.error('Error in findAdminByEmail:', error);
      throw error;
    }
  }

  public async registerAdmin(data: IAdminInput): Promise<IAdmin> {
    try {
      const newAdmin = new Admin(data);
      const savedAdmin = await newAdmin.save();
      return savedAdmin;
    } catch (error) {
      console.error('Error in registerAdmin:', error);
      throw error;
    }
  }
}

export default AdminRepository;