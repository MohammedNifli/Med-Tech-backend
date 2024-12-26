import { IAdmin, IAdminInput } from "../../models/adminModel.js";

export interface IAdminRepo {
  findAdminByEmail(email: string): Promise<IAdmin | null>;
  registerAdmin(data: IAdminInput): Promise<IAdmin>;
 
}