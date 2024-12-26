import {IDoctorWalletRepo  } from "../Interfaces/doctorWallet/IDoctorWalletRepo.js";
import { IDoctorWalletService } from "../Interfaces/doctorWallet/IDoctorWalletService.js";
class DoctorWalletService implements IDoctorWalletService{
    private doctorWalletRepo:IDoctorWalletRepo
    constructor(doctorWalletRepo:IDoctorWalletRepo){
        this.doctorWalletRepo=doctorWalletRepo;

    }


    public async createWalletservice(doctorId:string):Promise<any>{
        try{
            const createdWallet=await this.doctorWalletRepo.createWalletRepo(doctorId)
            return createdWallet;

        }catch(error){
            console.log(error);
            throw Error('error occured in the createWalletSrvice')
        }
    }

    public async addAmountToTheWallet(data: { doctorId: string; amount: number; transactionType: string }): Promise<any> {
        try {
          const { doctorId, amount, transactionType } = data;
    
          const updatedWallet = await this.doctorWalletRepo.addAmountToTheWallet({
            doctorId,
            amount,
            transactionType,
          });
    
          return updatedWallet;
        } catch (error) {
          console.error("Error in addAmountToTheWallet service:", error);
          throw new Error("Failed to add amount to wallet");
        }
      }
    
      // Get wallet details
      public async getWalletDetails(doctorId: string): Promise<any> {
        try {
          const wallet = await this.doctorWalletRepo.getWalletBalance(doctorId);
          return wallet;
        } catch (error) {
          console.error("Error in getWalletDetails service:", error);
          throw new Error("Failed to fetch wallet details");
        }
      }
    
      public async deductAmount(data:{amount:number,doctorId:string,transactionType:string}):Promise<any>{
        try{

            const { doctorId, amount, transactionType } = data;

            const deductedAmount=await this.doctorWalletRepo.deductAmountFromWallet({amount,doctorId,transactionType})
            return deductedAmount

        }catch(error){
            console.log(error)
        }
      }




    }

export default DoctorWalletService