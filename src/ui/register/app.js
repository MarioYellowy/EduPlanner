const { Notification } = require('electron').remote;
const { getConnection } = require("../../database");
const { encryptPassword } = require('../../encrypt');

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const backButton = document.getElementById('backButton');

    backButton.addEventListener('click', () => {
        window.history.back();
    });

    function showNotification(title, body) {
        const notification = new Notification({ 
            title: title,
            body: body
        });
        notification.onclick = () => {
            document.getElementById('output').innerText = body;
        };
        notification.show(); 
    }

    async function createUser(new_user) {
        try {
            const user_password_verification = document.getElementById('confirm_password').value;
            if (user_password_verification !== new_user.password_user) {
                document.getElementById('output').innerText = "Las contraseñas no coinciden.";
                return; 
            }

            if (!new_user.username || !new_user.email_user) {
                document.getElementById('output').innerText = "Por favor, completa todos los campos.";
                return;
            }

            const conn = await getConnection();
            new_user.password_user = await encryptPassword(new_user.password_user);
            const result = await conn.query('CALL Register(?, ?, ?)', [new_user.username, new_user.email_user, new_user.password_user]);

            showNotification('EduPlanner TO-DO', 'Usuario agregado correctamente');
            window.location.href = 'EduPlanner/src/ui/login/login.html';
            return new_user;

        } catch (error) {
            const errorMessage = error.message || 'Error al crear el usuario';
            showNotification('EduPlanner TO-DO', errorMessage);
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
