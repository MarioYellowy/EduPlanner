const { getConnection } = require("../../database");
let currentUserId = null;

const loginForm = document.getElementById('loginForm');


async function userValidate(userlog) {  
    try {  
        const conn = await getConnection();  
        const result_validate = await conn.query('CALL ValidateLogin(?, ?)', [userlog.email_user, userlog.password_user]);  

        console.log('Resultado de Validar:', result_validate);  
        
        if (result_validate.length > 0 && result_validate[0].length > 0) {  
            const { isValid, userId, message_out } = result_validate[0][0];  

            if (isValid) {  
                currentUserId = userId;  
                const data_user = await conn.query('CALL GetDataOfUser(?)', [userId]);  

                console.log(`Inicio de sesión exitoso: ${message_out}`);  
                console.log('Datos del usuario:', data_user);  
                window.location.href = '../home/home.html';  
                return data_user;  
            } else {  
                console.log(`Fallo en la validación: ${message_out}`);  
            }  
        } else {  
            console.log("No se recibieron resultados de la validación.");  
        }  
    } catch (error) {  
        console.error("Error en la validación:", error);    
    }  
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userlog = {
        email_user: document.getElementById('user_e').value,
        password_user: document.getElementById('user_pas').value
    };
    userValidate(userlog);

});
