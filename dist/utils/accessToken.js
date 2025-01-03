import jwt from 'jsonwebtoken';
function accessToken(Id, role) {
    const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET;
    // Token with an expiration of 1 day (24 hours)
    const token = jwt.sign({ Id, role }, secretKey, { expiresIn: '1d' } // Expiry set to 1 day
    );
    return token;
}
export default accessToken;
