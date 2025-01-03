import { IFinancialService } from "../Interfaces/finance/IFinancialService.js";
import { IFinancialRepository } from "../Interfaces/finance/IFinancialRepository.js";

class FinancialService implements IFinancialService{
    private financialRepo:IFinancialRepository;
    constructor(financialRepo:IFinancialRepository){
        this.financialRepo=financialRepo
    }


    public async addOnlineAmount(amount:number):Promise<any>{
        try{
            const addedAmount=await this.financialRepo.addOnlineAmount(amount)
            return addedAmount

        }catch(error:any){
            throw Error(error.message)
        }
    }

    public async addOfflineAmount(amount:number):Promise<any>{
        try{
            const addedAmount=await this.financialRepo.addOfflineAmount(amount)
            return addedAmount

        }catch(error:any){
            throw Error(error.message)
        }
    }

    public async addPremiumAmount(amount:number):Promise<any>{
        try{
            const addedAmount=await this.financialRepo.addPremiumAmount(amount)
            return addedAmount

        }catch(error:any){
            throw Error(error.message)
        }
    }

    public async showAmountsService():Promise<any>{
        try{
            const amounts=await this.financialRepo.showAmounts();
            return amounts;

        }catch(error:any){
            throw Error(error.message)
        }
    }

    
    public async addAmount(userId: string, amount: number): Promise<any> {
        try {
      
          const updatedRevenue = await this.financialRepo.addAmount(userId, amount);
      
          if (!updatedRevenue) {
            throw new Error('Failed to update revenue');
          }
      
          return updatedRevenue;
        } catch (error: any) {
          throw new Error(`Error in service: ${error.message}`);
        }
      }
      

      public async financialService(time:string):Promise<any>{
        try{
            const data=await this.financialRepo.RevenueGraphData(time)
            return data;

        }catch(error:any){
            throw new Error('error occured in the ',error)
        }
      }



}

export default FinancialService;
