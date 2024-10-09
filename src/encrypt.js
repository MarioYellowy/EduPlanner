
const bcrypt = require('bcrypt');  

const saltRounds = 10; 

async function encryptPassword(password) {  
    const hashedPassword = await bcrypt.hash(password, saltRounds);  
    return hashedPassword;  
}  


async function comparePasswords(plainPassword, hashedPassword) {  
    const match = await bcrypt.compare(plainPassword, hashedPassword);  
    return match;  
}  

module.exports = {  
    encryptPassword,  
    comparePasswords  
};