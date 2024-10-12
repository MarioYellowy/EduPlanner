document.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require('electron');
    const { getConnection } = require("../../database");
    let currentUserId;

    // Botones y modal para agregar materia  
    const btn_addSubject = document.querySelector(".add-subject-btn");
    const span = document.getElementById("closeModal");
    const modal = document.getElementById('addSubjectModal');


    ipcRenderer.on('set-user-id', (event, userId) => {
        currentUserId = userId;
        console.log('ID de usuario recibido en home:', currentUserId);
        useCurrentUserId();

        // Bloque para agregar materias  
        btn_addSubject.addEventListener('click', async () => {
            if (modal) {
                await openAddSubject(modal);
            } else {
                console.error('Modal no encontrado');
            }
        });

        span.onclick = function () {
            modal.style.display = "none";
        }
    });

function useCurrentUserId() {  
    if (currentUserId) {  
        console.log('Usando ID de usuario:', currentUserId);  
    } else {  
        console.log('currentUserId aún no está definido.');  
    }  
}  

function toggleMenu() {
    const sidebar = document.getElementById("sidebar_menu");
    sidebar.classList.toggle("open");
}

    async function addSubject(id_user, subjectName, subjectDateStart, subjectDateEnd) {
        const conn = await getConnection();

        try {

            await conn.query('CALL addSubject(?,?,?,?,?)', [id_user, subjectName, subjectDateStart, subjectDateEnd, 1]);
            console.log('Nueva materia agregada:', subjectName, 'Fecha inicio:', subjectDateStart, 'Fecha fin:', subjectDateEnd);
        } catch (error) {
            console.error('Error al agregar la materia:', error);
        }
    }

    function openAddSubject(modal) {
        return new Promise((resolve) => {
            modal.style.display = "block";
            document.getElementById("addSubjectForm").onsubmit = async function (event) {
                event.preventDefault();

                let subjectName = document.getElementById('subjectName').value;
                let subjectDateStart = document.getElementById('subjectDate').value;
                let subjectDateEnd = document.getElementById('subjectDateEnd').value;

                await addSubject(currentUserId, subjectName, subjectDateStart, subjectDateEnd);

                event.target.reset();
                modal.style.display = "none";
            };
            resolve();
        });
    }
});