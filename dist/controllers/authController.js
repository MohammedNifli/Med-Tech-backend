import authService from "../services/authService.js";
import { HttpStatusCode } from "../enums/httpStatusCodes.js";
class RefreshTokenController {
    async refreshToken(req, res) {
        try {
            const { token: refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token required" });
            }
            const { accessToken, error } = await authService.refreshToken(refreshToken);
            if (error) {
                return res.status(error.status).json({ message: error.message });
            }
            return res.json({ accessToken });
        }
        catch (err) {
            return res
                .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({ message: "Internal Server Error" });
        }
    }
}
export default new RefreshTokenController();
