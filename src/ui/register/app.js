const { Notification } = require('electron');  
const { getConnection } = require("../../database");  
const { encryptPassword } = require('../../encrypt'); 

document.addEventListener('DOMContentLoaded', () => {  
    const userForm = document.getElementById('userForm');  
    const backButton = document.getElementById('backButton');

    backButton.addEventListener('click', () => {  
        window.history.back();  
    });  

    async function createUser(new_user) {  
        try {  
            const conn = await getConnection();  
            new_user.password_user = await encryptPassword(new_user.password_user);  
            const result = await conn.query('CALL Register(?, ?, ?)', [new_user.username, new_user.email_user, new_user.password_user]);  
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO';  
            const NOTIFICATION_BODY = 'User added successfully';  

            new window.Notification(NOTIFICATION_TITLE, {    
                body: NOTIFICATION_BODY  
            }).onclick = () => {  
                document.getElementById('output').innerText = NOTIFICATION_BODY;  
            };  
            window.location.href = '../login/login.html';  
            return new_user;  
        } catch (error) {  
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO';  
            const NOTIFICATION_BODY = 'User already exists';

            new window.Notification(NOTIFICATION_TITLE, {   
                body: NOTIFICATION_BODY  
            }).onclick = () => {  
                document.getElementById('output').innerText = NOTIFICATION_BODY;  
            };  
            console.error(error);  
        }  
    }  

    userForm.addEventListener('submit', (e) => {  
        e.preventDefault();  

        const username = document.getElementById('username').value;  
        const email_user = document.getElementById('email_user').value;  
        const user_password = document.getElementById('password').value;  
        const confirm_password = document.getElementById('confirm_password').value;

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,15}$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;

        if (!emailRegex.test(email_user)) {
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO';  
            const NOTIFICATION_BODY = 'Invalid email format. Please enter a valid email address.'; 

            new window.Notification(NOTIFICATION_TITLE, {   
                body: NOTIFICATION_BODY  
            }).onclick = () => {  
                document.getElementById('output').innerText = NOTIFICATION_BODY;  
            };  
            return;
        }

        if (!passwordRegex.test(user_password)) {
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO';  
            const NOTIFICATION_BODY = 'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long'; 

            new window.Notification(NOTIFICATION_TITLE, {   
                body: NOTIFICATION_BODY  
            }).onclick = () => {  
                document.getElementById('output').innerText = NOTIFICATION_BODY;  
            };  
            return;
        }

        if (user_password !== confirm_password) {  
            const NOTIFICATION_TITLE = 'EduPlanner TO-DO';  
            const NOTIFICATION_BODY = 'Passwords do not match'; 

            new window.Notification(NOTIFICATION_TITLE, {   
                body: NOTIFICATION_BODY  
            }).onclick = () => {  
                document.getElementById('output').innerText = NOTIFICATION_BODY;  
            };  
            return; 
        }
        const new_user = {  
            username: username,  
            email_user: email_user,  
            password_user: user_password  
        };  
        createUser(new_user);  
    });  
});