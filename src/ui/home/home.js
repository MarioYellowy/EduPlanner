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
    const btn_addTask = document.getElementById("openTaskModal");
    const btnCloseTaskModal = document.getElementById("closeModal-task");
    const modalTask = document.getElementById("addTaskModal");

    btn_logout.addEventListener('click', () => {
        ipcRenderer.send('logout');
    });

    ipcRenderer.on('set-user-id', (event, userId) => {
        currentUserId = userId;
        console.log('ID de usuario recibido en home:', currentUserId);
        loadInitialTasks(currentUserId)
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
        btn_addTask.addEventListener('click', async () => {
            if (modalTask) {
                await openTask(modalTask)
            } else {
                console.log('No se encontro el modal')
            }
        })

        btnCloseTaskModal.addEventListener('click', () => {
            modalTask.classList.remove('show');
        });

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
            await conn.query('CALL addSubject(?,?,?,?,?)', [id_user, subjectName, subjectDateStart, subjectDateEnd, 1]);
            console.log('Nueva materia agregada:', subjectName, 'Fecha inicio:', subjectDateStart, 'Fecha fin:', subjectDateEnd);
            
            // Si la materia se agregó con éxito, actualiza la interfaz con los valores del formulario
            const schedule = `${new Date(subjectDateStart).toLocaleDateString()} - ${new Date(subjectDateEnd).toLocaleDateString()}`; // Mostrar el rango de fechas como horario
            appendNewSubject(subjectName, schedule); // Actualizar el DOM con la nueva materia
            
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
        subjectCard.classList.add('subject-card', 'green'); // Se asigna la clase y color
    
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
                await deleteSubject(subjectId, subjectCard); // Asegúrate de que subjectId está disponible aquí
            }
        });
    }
    async function getUserSubjects(userId) {
        const conn = await getConnection();
        try {
            const [subjects] = await conn.query('CALL GetUserSubjects(?)', [userId]);
            console.log('Subjects obtenidos:', subjects); // Verificar qué datos se están recibiendo
        
            const subjectList = document.querySelector('.subject-list');
            subjectList.innerHTML = ''; // Limpiar la lista de subjects previos
        
            if (subjects[0].length === 0) {  // Asegúrate de usar `subjects[0]`
                const noSubjectsMessage = document.createElement('p');
                noSubjectsMessage.textContent = 'No subjects yet';
                subjectList.appendChild(noSubjectsMessage);
            } else {
                subjects[0].forEach(subject => { // Usar `subjects[0]`
                    const schedule = `${new Date(subject.start_date).toLocaleDateString()} - ${new Date(subject.end_date).toLocaleDateString()}`;
                    appendNewSubject(subject.name_subject, schedule, subject.subject_id);  // Usar `name_subject`, `start_date`, `end_date`
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
            console.error('Error al eliminar la materia:', error);
            alert('Error al eliminar la materia. Inténtalo de nuevo.');
        }
    }

    async function addTask(name_task, note_task, start_date, end_date, category, status, priority, id_user) {
        const conn = await getConnection();
        try {

            const [result] = await conn.query('CALL InsertTask(?,?,?,?,?,?,?,?, @p_task_id)',
                [name_task, note_task, start_date, end_date, category, status, priority, id_user]);

            const [taskIdResult] = await conn.query('SELECT @p_task_id AS task_id');
            const newTaskId = taskIdResult[0].task_id;

            const newTask = { id: newTaskId, name_task, category, priority, start_date, status };

            addLastTaskToInterface(newTask);
            return true;
        } catch (error) {
            console.error('Error al agregar la tarea:', error);
            return false;
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }//

    async function deleteTask(taskId) {
        const conn = await getConnection();
        try {
            await conn.query('CALL DeleteTaskById(?)', [taskId]);
            console.log('Tarea con ID ' + taskId + ' eliminada con éxito');
            return true;
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            return false;
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    function addLastTaskToInterface(task) {
        const taskList = document.querySelector('.task-list tbody');

        const newRow = taskList.insertRow(-1);

        const cellName = newRow.insertCell(0);
        const cellCategory = newRow.insertCell(1);
        const cellPriority = newRow.insertCell(2);
        const cellDate = newRow.insertCell(3);
        const cellStatus = newRow.insertCell(4);
        const cellEdit = newRow.insertCell(5);
        const cellDelete = newRow.insertCell(6);

        cellName.textContent = task.name_task;
        cellCategory.textContent = task.category;
        cellPriority.textContent = task.priority;
        cellDate.textContent = task.start_date;
        cellStatus.innerHTML = '<input type="checkbox"' + (task.status === 'Concluded' ? ' checked' : '') + '>';
        cellEdit.innerHTML = '<button class="edit-btn"><img src="../img/edit.png" alt="Edit"></button>';

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.className = 'delete-btn';
        deleteButton.onclick = async () => {
            const confirmed = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
            if (confirmed) {
                const success = await deleteTask(task.id);
                if (success) {

                    taskList.deleteRow(newRow.rowIndex);
                } else {
                    alert('No se pudo eliminar la tarea. Inténtalo de nuevo más tarde.');
                }
            }
        };
        cellDelete.appendChild(deleteButton);
    }

    function openTask(modal) {
        return new Promise((resolve) => {
            modal.classList.add('show');
            document.getElementById("addTaskForm").onsubmit = async function (event) {
                event.preventDefault();

                let taskName = document.getElementById('taskName').value;
                let taskNotes = document.getElementById('taskNotes').value;
                let taskDateStart = document.getElementById('taskDate').value;
                let taskDateEnd = document.getElementById('taskDateEnd').value;
                let taskCategory = document.getElementById('taskCategory').value;
                let taskStatus = document.getElementById('taskStatus').value;
                let taskPriority = document.getElementById('taskPriority').value;

                let success = await addTask(taskName, taskNotes, taskDateStart, taskDateEnd, taskCategory, taskStatus, taskPriority, currentUserId);
                if (success) {
                    event.target.reset();
                    modal.classList.remove("show");
                } else {
                    alert('Error al agregar la tarea. Por favor, inténtalo de nuevo.');
                }
            };
            resolve();
        });
    }

    async function getTaskUser(user_id) {
        const conn = await getConnection();
        try {
            const result = await conn.query('CALL GetUserTask(?)', [user_id]);
            const listOfTask = result[0][0];
            return listOfTask;
        } catch (error) {
            console.error('Error al obtener las tareas:', error);
            throw error;
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    async function loadInitialTasks(user_id) {
        try {
            const tasks = await getTaskUser(user_id);
            tasks.forEach(task => {
                addLastTaskToInterface(task);
            });
        } catch (error) {
            console.error('Error al cargar las tareas iniciales:', error);
        }
    }
});
