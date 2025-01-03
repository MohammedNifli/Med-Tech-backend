import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class DoctorWalletController {
    doctorWalletService;
    constructor(doctorWalletService) {
        this.doctorWalletService = doctorWalletService;
    }
    async createWallet(req, res) {
        try {
            const doctorId = req.query.id;
            if (!doctorId) {
                return res.status(HttpStatusCode.BAD_REQUEST).json({ message: "Doctor ID is required" });
            }
            const createdWallet = await this.doctorWalletService.createWalletservice(doctorId);
            return res
                .status(HttpStatusCode.CREATED)
                .json({ message: "wallet created successfully ", createdWallet });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({
                message: "internal server error occured in the create wallet",
            });
        }
    }
    async addAmountToTheWallet(req, res) {
        try {
            const { doctorId, amount, transactionType } = req.body;
            if (!doctorId || !amount || !transactionType) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Missing required fields" });
            }
            const updatedWallet = await this.doctorWalletService.addAmountToTheWallet({
                doctorId,
                amount,
                transactionType,
            });
            return res.status(HttpStatusCode.OK).json({
                message: "Amount added successfully",
                wallet: updatedWallet,
            });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
    async getWalletDetails(req, res) {
        try {
            const doctorId = req.query.id;
            if (!doctorId) {
                return res
                    .status(HttpStatusCode.BAD_REQUEST)
                    .json({ message: "Doctor ID is required" });
            }
            const wallet = await this.doctorWalletService.getWalletDetails(doctorId);
            return res.status(HttpStatusCode.OK).json({ wallet });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
    async deductAmount(req, res) {
        try {
            const { doctorId, amount, transactionType } = req.body;
            const deductedAmount = await this.doctorWalletService.deductAmount({
                amount,
                doctorId,
                transactionType,
            });
            return res
                .status(HttpStatusCode.OK)
                .json({ message: "ok", deductedAmount });
        }
        catch (error) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal server error" });
        }
    }
}
export default DoctorWalletController;
