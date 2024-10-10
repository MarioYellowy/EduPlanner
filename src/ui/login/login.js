const { getConnection } = require("../../database");  
const { comparePasswords } = require('../../encrypt.js'); 

document.addEventListener('DOMContentLoaded', () => {  
    async function userValidate(userlog) {  
        let conn;  
        try {  
            conn = await getConnection();  
            const result_validate = await conn.query('CALL ValidateLoginHash(?)', [userlog.email_user]);  

            if (result_validate.length > 0 && result_validate[0].length > 0) {  
                const { hashedPassword, userId, message_out } = result_validate[0][0][0];  

                const isValid = await comparePasswords(userlog.password_user, hashedPassword);  

                if (isValid) {  
                    console.log(`Inicio de sesión exitoso: ${message_out}`);  
                    window.location.href = '../home/home.html';
                    return userId;  
                } else {  
                    console.log(`Fallo en la validación: ${message_out}`);  
                    return null;  
                }  
            } else {  
                console.log("No se recibieron resultados de la validación.");  
                return null;  
            }  
        } catch (error) {  
            console.error("Error en la validación:", error);  
            return null;  
        } finally {  
            if (conn) {  
                conn.end();  
            }  
        }  
    }  

    const loginForm = document.getElementById('loginForm');  
    loginForm.addEventListener('submit', async (e) => {  
        e.preventDefault();  
        const userlog = {  
            email_user: document.getElementById('user_e').value,  
            password_user: document.getElementById('user_pas').value  
        };  

        if (!userlog.email_user || !userlog.password_user) {  
            console.log("Por favor, complete todos los campos.");  
            return;  
        }  

        const currentUserId = await userValidate(userlog);  

        if (currentUserId != null) {  
            console.log(`ID de usuario actual: ${currentUserId}`);  
        } else {  
            console.log("Error en la validación o no se encontraron datos.");  
        }  
    });  
});