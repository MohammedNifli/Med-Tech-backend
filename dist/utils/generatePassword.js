import crypto from 'crypto';
function generatePassword() {
    const randomNumber = crypto.randomInt(0, 1000000);
    const password = randomNumber.toString().padStart(6, '0');
    return password;
}
export default generatePassword;
