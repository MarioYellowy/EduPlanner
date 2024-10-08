const { Notification } = require('electron');
const { getConnection } = require("../../database");

document.addEventListener('DOMContentLoaded', () => {
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
