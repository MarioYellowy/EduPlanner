const { getConnection } = require("../../database");

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    
    async function createUser(new_user) {
        try {
            const conn = await getConnection(); 
            const [result] = await conn.query('INSERT INTO Users SET ?', new_user);
            console.log(result);
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
