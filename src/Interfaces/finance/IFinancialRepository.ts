export interface IFinancialRepository{
    addOnlineAmount(amount: number): Promise<any> 
    addOfflineAmount(amount: number): Promise<any>
    addPremiumAmount(amount: number): Promise<any>
    showAmountsRepo(): Promise<any>
    addAmountToRepo(userId: string, amount: number): Promise<any>
     RevenueGraphData(time:string): Promise<any>
}