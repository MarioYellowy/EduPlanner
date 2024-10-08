const { getConnection } = require("../../database");  
let currentUserId = null;  
let currentUserData = null; 

const loginForm = document.getElementById('loginForm');  

document.addEventListener('DOMContentLoaded', () => {  
    async function userValidate(userlog) {  
        let conn;  
        try {  
            conn = await getConnection(); 
            const result_validate = await conn.query('CALL ValidateLogin(?, ?)', [userlog.email_user, userlog.password_user]);  
            console.log(userlog.email_user,userlog.password_user)
            console.log(result_validate[0][0])

            console.log('Resultado de Validar:', result_validate);  

            if (result_validate.length > 0 && result_validate[0].length > 0) {  
                const { isValid, userId, message_out } = result_validate[0][0][0];  
                console.log(isValid, userId, message_out);  

                if (isValid) {  
                    currentUserId = userId;  
                    const data_user = await conn.query('CALL GetDataOfUser(?)', [userId]);  

                    console.log(`Inicio de sesión exitoso: ${message_out}`);  
                    console.log('Datos del usuario:', data_user);  

                    currentUserData = data_user;
                   // window.location.href = '../home/home.html'; 
                    return data_user; 
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

    loginForm.addEventListener('submit', async (e) => {  
        e.preventDefault();  
        const userlog = {  
            email_user: document.getElementById('user_e').value,  
            password_user: document.getElementById('user_pas').value  
        };  
        const userData = await userValidate(userlog); 

        if (userData) {   
            console.log("Datos del usuario después de la validación:", userData);  
            
        } else {  
            console.log("Error en la validación o no se encontraron datos.");  
        }  
    });  
});

