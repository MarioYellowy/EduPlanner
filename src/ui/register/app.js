const { Notification } = require('electron');
const { getConnection } = require("../../database");


const userForm = document.getElementById('userForm');
async function createUser(new_user) {
    try {
        const conn = await getConnection();
        const result = await conn.query('CALL Register(?, ?, ?)', [new_user.username, new_user.email_user, new_user.password_user]); // Ajusta los parámetros según corresponda  

        const NOTIFICATION_TITLE = 'EduPlanner TO-DO';
        const NOTIFICATION_BODY = 'User added successfully';
        const CLICK_MESSAGE = 'Ready';

        new window.Notification(NOTIFICATION_TITLE, {
            title: NOTIFICATION_TITLE,
            body: NOTIFICATION_BODY
        }).onclick = () => {
            document.getElementById('output').innerText = CLICK_MESSAGE;
        };

        window.location.href = '../login/login.html';

        return new_user;
    } catch (error) {
        const NOTIFICATION_TITLE = 'EduPlanner TO-DO';
        const NOTIFICATION_BODY = 'User already exists';

        new window.Notification(NOTIFICATION_TITLE, {
            title: NOTIFICATION_TITLE,
            body: NOTIFICATION_BODY
        }).onclick = () => {
            document.getElementById('output').innerText = NOTIFICATION_BODY;
        };

        console.error(error);
    }
}
userForm.addEventListener('submit',(e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email_user = document.getElementById('email_user').value;
    const user_password = document.getElementById('password').value;

    const new_user = {
        username: username,
        email_user: email_user,
        password_user: user_password
    };
    createUser(new_user);
});


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
        password_user: document.getElementById('user_pass').value
    };
    userValidate(userlog);

});





