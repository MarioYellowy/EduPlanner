document.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require('electron');
    const { getConnection } = require("../../database");
    let currentUserId;

    const btn_addSubject = document.querySelector(".add-subject-btn");
    const span = document.getElementById("closeModal");
    const modal = document.getElementById('addSubjectModal');
    const sidebarMenu = document.getElementById("sidebar");
    const sidepanel = document.getElementById("sidepanel");
    const btn_logout = document.getElementById("logoutBtn");

    btn_logout.addEventListener('click', () => {
        ipcRenderer.send('logout');
    });

    ipcRenderer.on('set-user-id', async (event, userId) => {
        currentUserId = userId;
        console.log('ID de usuario recibido en home:', currentUserId);
        useCurrentUserId();

        btn_addSubject.addEventListener('click', async () => {
            if (modal) {
                await openAddSubject(modal);
            } else {
                console.error('Modal no encontrado');
            }
        });

        span.onclick = function () {
            modal.classList.remove("show");
        }


        await loadAllSubjects(currentUserId);
    });

    sidebarMenu.addEventListener('click', () => {
        toggleMenu();
    });

    function toggleMenu() {
        sidepanel.classList.toggle("open");
    }

    function useCurrentUserId() {
        if (currentUserId) {
            console.log('Usando ID de usuario:', currentUserId);
        } else {
            console.log('currentUserId aún no está definido.');
        }
    }

    async function addSubject(id_user, subjectName, subjectDateStart, subjectDateEnd) {
        const conn = await getConnection();
        try {
            await conn.query('CALL addSubject(?,?,?,?,?)', [id_user, subjectName, subjectDateStart, subjectDateEnd, 1]);
            console.log('Nueva materia agregada:', subjectName, 'Fecha inicio:', subjectDateStart, 'Fecha fin:', subjectDateEnd);
            return true;
        } catch (error) {
            console.error('Error al agregar la materia:', error);
            return false;
        }
    }

    function openAddSubject(modal) {
        return new Promise((resolve) => {
            modal.classList.add("show");
            document.getElementById("addSubjectForm").onsubmit = async function (event) {
                event.preventDefault();

                let subjectName = document.getElementById('subjectName').value;
                let subjectDateStart = document.getElementById('subjectDate').value;
                let subjectDateEnd = document.getElementById('subjectDateEnd').value;

                let success = await addSubject(currentUserId, subjectName, subjectDateStart, subjectDateEnd);
                if (success) {
                    event.target.reset();
                    modal.classList.remove("show");
                    await loadAllSubjects(currentUserId);
                } else {
                    alert('Error al agregar la materia. Por favor, inténtalo de nuevo.');
                }
            };
            resolve();
        });
    }

    async function getAllSubjects(user_id) {
        const conn = await getConnection();
        try {
            const result = await conn.query('CALL getUserSubjects(?)', [user_id]);
            const listOfSubject = result[0][0];
            return listOfSubject;
        } catch (error) {
            console.error('Error al obtener las materias:', error);
            throw error;
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    async function loadAllSubjects(userId) {
        try {
            const allSubjects = await getAllSubjects(userId);
            console.log('Materias obtenidas:', allSubjects);
        } catch (error) {
            console.error('Error al obtener las materias:', error);
        }
    }
});