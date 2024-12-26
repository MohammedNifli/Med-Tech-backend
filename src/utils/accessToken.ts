import jwt from 'jsonwebtoken';

function accessToken(Id: string, role: string) {
    const secretKey = process.env.JWT_ACCESS_TOKEN_SECRET as string;

    // Token with an expiration of 1 day (24 hours)
    const token = jwt.sign(
        { Id, role },
        secretKey,
        { expiresIn: '1d' } // Expiry set to 1 day
    );

    return token;
}

export default accessToken;
