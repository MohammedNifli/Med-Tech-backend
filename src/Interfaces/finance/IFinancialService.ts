
export  interface IFinancialService{

    addOnlineAmount(amount:number):Promise<any>
    addOfflineAmount(amount:number):Promise<any>
    addPremiumAmount(amount:number):Promise<any>
    showAmountsService():Promise<any>
    addAmount(userId: string, amount: number): Promise<any>
    financialService(time:string):Promise<any>
}