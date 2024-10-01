const {Notification} = require('electron');
const { getConnection } = require("../../database");

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');   
    
    async function createUser(new_user) {
        try {
            const conn = await getConnection(); 
            const [result] = await conn.query('INSERT INTO Users SET ?', new_user);
            console.log(result);
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO'
            const NOTIFICATION_BODY = 'User added succesfully'
            const CLICK_MESSAGE = 'Notification clicked!'

            new window.Notification(NOTIFICATION_TITLE, {  
                body: NOTIFICATION_BODY 
            }).onclick = () => { 
                document.getElementById('output').innerText = CLICK_MESSAGE }       
        } catch (error) {
            console.error('Error al insertar el usuario:', error);
        }
    }

    userForm.addEventListener('submit', (e) => {
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
});
