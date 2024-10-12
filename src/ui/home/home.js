document.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require('electron');
    const { getConnection } = require("../../database");
    let currentUserId;

    // Botones y modal para agregar materia  
    const btn_addSubject = document.querySelector(".add-subject-btn");
    const span = document.getElementById("closeModal");
    const modal = document.getElementById('addSubjectModal');
    
    // Botones del modal para transiciones suaves
    const openModalBtn = document.querySelector('#openModalBtn');
    const closeModalBtn = document.querySelector('.close');

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
            closeModal();  // Uso de la función closeModal con transición
        }
    });

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
        } catch (error) {
            console.error('Error al agregar la materia:', error);
        }
    }

    function openAddSubject(modal) {
        return new Promise((resolve) => {
            openModal();  // Uso la función openModal para mostrar con transición
            document.getElementById("addSubjectForm").onsubmit = async function (event) {
                event.preventDefault();
                let subjectName = document.getElementById('subjectName').value;
                let subjectDateStart = document.getElementById('subjectDate').value;
                let subjectDateEnd = document.getElementById('subjectDateEnd').value;

                await addSubject(currentUserId, subjectName, subjectDateStart, subjectDateEnd);

                event.target.reset();
                closeModal();  // Uso la función closeModal para cerrar con transición
            };
            resolve();
        });
    }

    // Función para abrir el modal con transición suave
    function openModal() {
        modal.style.display = 'flex'; // Cambiar el display a 'flex' para mostrar el modal
        setTimeout(() => {
            modal.style.opacity = '1'; // Cambiar la opacidad a 1 para hacerlo visible
            modal.style.transform = 'translateY(0)'; // Restablecer la posición original
        }, 10); // Usar un pequeño retardo para activar la transición
    }

    // Función para cerrar el modal con transición suave
    function closeModal() {
        modal.style.opacity = '0'; // Cambiar la opacidad a 0 para ocultar
        modal.style.transform = 'translateY(-20px)'; // Mover hacia arriba
        setTimeout(() => {
            modal.style.display = 'none'; // Ocultar completamente el modal después de la transición
        }, 300); // La duración de la transición debe coincidir con el valor en el CSS (0.3s)
    }

    // Asignar eventos a los botones
    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
});
