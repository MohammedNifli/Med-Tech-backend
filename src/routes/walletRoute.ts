import express from 'express'
import UserWalletController from '../controllers/userWalletController.js'
import UserWalletService from '../services/userWalletService.js'
import WalletRepo from '../repositories/userWalletRepo.js'
import walletRepo from '../repositories/userWalletRepo.js'

const walletRoute=express.Router()

const userWalletRepo=new walletRepo()
const userWalletService=new UserWalletService(userWalletRepo);
const userWalletController=new UserWalletController(userWalletService);


walletRoute.post('/create',userWalletController.createWallet.bind(userWalletController))
walletRoute.post('/credit',userWalletController.creditInWallet.bind(userWalletController))
walletRoute.get('/fetch-wallet',userWalletController.fetchWalletDetails.bind(userWalletController))


export default walletRoute;
