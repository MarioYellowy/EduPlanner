document.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require('electron');
    const { getConnection } = require("../../database");
    let currentUserId;

    // Definir los colores
    const colors = ['#BDE8B3', '#E0B1D6', '#89E7ED'];
    let colorIndex = 0; // Índice para el color actual

    const btn_addSubject = document.querySelector(".add-subject-btn");
    const span = document.getElementById("closeModal");
    const modal = document.getElementById('addSubjectModal');
    const sidebarMenu = document.getElementById("sidebar"); 
    const sidepanel = document.getElementById("sidepanel");
    const btn_logout = document.getElementById("logoutBtn");

    btn_logout.addEventListener('click', () => {
        ipcRenderer.send('logout');
    });

    ipcRenderer.on('set-user-id', (event, userId) => {
        currentUserId = userId;
        console.log('ID de usuario recibido en home:', currentUserId);
        getUserSubjects(currentUserId);

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
    });

    sidebarMenu.addEventListener('click', () => {
        toggleMenu(); 
    });

    function toggleMenu() {
        sidepanel.classList.toggle("open"); 
    } 

    async function addSubject(id_user, subjectName, subjectDateStart, subjectDateEnd) {
        const conn = await getConnection();
        try {
            const [result] = await conn.query('CALL AddSubject(?,?,?,?,?)', [id_user, subjectName, subjectDateStart, subjectDateEnd, 1]);
            console.log('Resultado de la inserción:', result); // Imprimir el resultado para verificar
    
            const subjectId = result[0][0].subject_id; // Acceder al ID del nuevo subject
            if (!subjectId) {
                throw new Error('No se pudo obtener el ID de la materia agregada.');
            }
            
            console.log('Nueva materia agregada:', subjectName, 'ID:', subjectId);
    
            // Formatear las fechas
            const schedule = `${new Date(subjectDateStart).toLocaleDateString()} - ${new Date(subjectDateEnd).toLocaleDateString()}`;
            appendNewSubject(subjectName, schedule, subjectId); // Asegúrate de pasar el subjectId
    
            // Eliminar el mensaje "No subjects yet" si existe
            const noSubjectsMessage = document.getElementById('noSubjectsMessage');
            if (noSubjectsMessage) {
                noSubjectsMessage.remove();
            }
    
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
                } else {
                    alert('Error al agregar la materia. Por favor, inténtalo de nuevo.');
                }
            };
            resolve();
        });
    }

    function appendNewSubject(subjectName, schedule, subjectId) {
        const subjectList = document.querySelector('.subject-list');
    
        // Crear el contenedor de la tarjeta de la materia
        const subjectCard = document.createElement('div');
        subjectCard.classList.add('subject-card'); // Se asigna la clase
    
        // Asignar el color de la tarjeta
        subjectCard.style.backgroundColor = colors[colorIndex];
        
        // Actualizar el índice del color para la próxima tarjeta
        colorIndex = (colorIndex + 1) % colors.length;
    
        // Crear el contenedor de la información de la materia
        const subjectInfo = document.createElement('div');
        subjectInfo.classList.add('subject-info');
    
        // Crear los elementos de nombre y horario
        const subjectNameElem = document.createElement('p');
        subjectNameElem.classList.add('subject-name'); // Clase CSS para estilo
        subjectNameElem.textContent = subjectName;
    
        const scheduleElem = document.createElement('p');
        scheduleElem.classList.add('subject-schedule'); // Clase CSS para estilo
        scheduleElem.innerHTML = schedule;
    
        // Crear el botón de borrar
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn'); // Clase CSS para estilo
        const deleteImg = document.createElement('img');
        deleteImg.src = '../img/trash-black.png';
        deleteImg.alt = "Eliminar"; // Texto alternativo por accesibilidad
        deleteBtn.appendChild(deleteImg);
    
        // Añadir estos elementos al contenedor de la información de la materia
        subjectInfo.appendChild(subjectNameElem);
        subjectInfo.appendChild(scheduleElem);
        subjectInfo.appendChild(deleteBtn);
    
        // Añadir el contenedor de la información de la materia y el botón de borrar a la tarjeta
        subjectCard.appendChild(subjectInfo);
        // Añadir la tarjeta al contenedor de la lista de materias
        subjectList.appendChild(subjectCard);
    
        // Event listener para eliminar la materia
        deleteBtn.addEventListener('click', async function () {
            const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la materia "${subjectName}"?`);
            if (confirmDelete) {
                console.log('ID de la materia a eliminar:', subjectId); // Verifica el ID aquí
                await deleteSubject(subjectId, subjectCard);
            }
        });
    }
    
    async function getUserSubjects(userId) {
        const conn = await getConnection();
        try {
            const [results] = await conn.query('CALL GetUserSubjects(?)', [userId]);
            console.log('Subjects obtenidos:', results);
    
            const subjects = results[0]; // Acceder al primer array
            const subjectList = document.querySelector('.subject-list');
            subjectList.innerHTML = ''; // Limpiar la lista de subjects previos
    
            // Verificar si no hay subjects y mostrar el mensaje
            if (subjects.length === 0) {
                const noSubjectsMessage = document.createElement('p');
                noSubjectsMessage.id = 'noSubjectsMessage'; // Asigna un ID para referenciarlo después
                noSubjectsMessage.textContent = 'No subjects yet';
                subjectList.appendChild(noSubjectsMessage);
            } else {
                // Eliminar el mensaje si ya existe
                const noSubjectsMessage = document.getElementById('noSubjectsMessage');
                if (noSubjectsMessage) {
                    noSubjectsMessage.remove();
                }
                subjects.forEach(subject => {
                    const schedule = `${new Date(subject.start_date).toLocaleDateString()} - ${new Date(subject.end_date).toLocaleDateString()}`;
                    appendNewSubject(subject.name_subject, schedule, subject.subject_id);
                });
            }
        } catch (error) {
            console.error('Error al obtener los subjects:', error);
        }
    }
    
    async function deleteSubject(subjectId, subjectCard) {
        const conn = await getConnection();
        try {
            await conn.query('CALL DeleteSubject(?)', [subjectId]);
            console.log('Materia eliminada con ID:', subjectId);
            
            // Eliminar la tarjeta de la interfaz
            subjectCard.remove();
        } catch (error) {
            console.error('Error al eliminar la materia:', error.message); // Muestra el mensaje de error
            alert('Error al eliminar la materia. Inténtalo de nuevo.');
        }
    }
});
