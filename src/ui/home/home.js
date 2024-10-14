document.addEventListener("DOMContentLoaded", () => {
    const { ipcRenderer } = require('electron');
    const { getConnection } = require("../../database");
    let currentUserId;

    const colors = ['#BDE8B3', '#E0B1D6', '#89E7ED'];
    let colorIndex = 0;
    const btn_addSubject = document.querySelector(".add-subject-btn");
    const span = document.getElementById("closeModal");
    const modal = document.getElementById('addSubjectModal');
    const sidebarMenu = document.getElementById("sidebar");
    const sidepanel = document.getElementById("sidepanel");
    const btn_logout = document.getElementById("logoutBtn");
    const btn_addTask = document.getElementById("openTaskModal");
    const btnCloseTaskModal = document.getElementById("closeModal-task");
    const modalTask = document.getElementById("addTaskModal");
    const closeButton = document.getElementById('closeModalTask');

    btn_logout.addEventListener('click', () => {
        ipcRenderer.send('logout');
    });

    ipcRenderer.on('set-user-id', (event, userId) => {
        currentUserId = userId;
        console.log('ID de usuario recibido en home:', currentUserId);
        getUserSubjects(currentUserId);

        loadInitialTasks(currentUserId)




        closeButton.onclick = function () {
            const modal = document.getElementById('editTaskModal');
            modal.style.display = 'none';
        };


        window.onclick = function (event) {
            const modal = document.getElementById('editTaskModal');
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };


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
            const [result] = await conn.query('CALL AddSubject(?,?,?,?,?)', [id_user, subjectName, subjectDateStart, subjectDateEnd, 1]);
            console.log('Resultado de la inserción:', result);
            const subjectId = result[0][0].subject_id;
            if (!subjectId) {
                throw new Error('No se pudo obtener el ID de la materia agregada.');
            }
            console.log('Nueva materia agregada:', subjectName, 'ID:', subjectId);
            const schedule = `${new Date(subjectDateStart).toLocaleDateString()} - ${new Date(subjectDateEnd).toLocaleDateString()}`;
            appendNewSubject(subjectName, schedule, subjectId);
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
                let subjectDateStart = document.getElementById('subjectDateStart').value;
                let subjectDateEnd = document.getElementById('subjectDateEnd').value;
    
                let success = await addSubject(currentUserId, subjectName, subjectDateStart, subjectDateEnd);
                if (success) {
                    event.target.reset();
                    modal.classList.remove("show");
                } else {
                    alert('Error al agregar la materia. Por favor, inténtalo de nuevo.');
                }
            };
    
            document.getElementById("closeModal").onclick = function() {
                modal.classList.remove("show");
                document.getElementById("addSubjectForm").reset(); 
            };
    
            resolve();
        });
    }

    function appendNewSubject(subjectName, schedule, subjectId) {
        const subjectList = document.querySelector('.subject-list');

        const subjectCard = document.createElement('div');
        subjectCard.classList.add('subject-card');
        subjectCard.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;

        const subjectInfo = document.createElement('div');
        subjectInfo.classList.add('subject-info');
        subjectInfo.setAttribute('data-id', subjectId);

        const subjectNameElem = document.createElement('p');
        subjectNameElem.classList.add('subject-name');
        subjectNameElem.textContent = subjectName;

        const scheduleElem = document.createElement('p');
        scheduleElem.classList.add('subject-schedule');
        scheduleElem.innerHTML = schedule;

        const editBtn = document.createElement('button')
        editBtn.innerHTML = '<button class="edit-btn-subject"><img src="../img/edit.png"></button>';
        editBtn.classList.add('edit-btn-subject')


        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');

        const deleteImg = document.createElement('img');
        deleteImg.src = '../img/trash-black.png';
        deleteImg.alt = "Eliminar";
        deleteBtn.appendChild(deleteImg);


        subjectInfo.appendChild(subjectNameElem);
        subjectInfo.appendChild(scheduleElem);
        subjectInfo.appendChild(editBtn);
        subjectInfo.appendChild(deleteBtn);


        subjectCard.appendChild(subjectInfo);

        subjectList.appendChild(subjectCard);

        editBtn.addEventListener('click', function () {
            const currentSubjectData = {
                name: subjectName,
                schedule: schedule,
                id: subjectId,
            };
            console.log('Abriendo modal de edición con:', currentSubjectData); 
            openEditModal(currentSubjectData.name, currentSubjectData.schedule, currentSubjectData.id);
        });

        deleteBtn.addEventListener('click', async function (event) {
            event.stopPropagation();
            const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar la materia "${subjectName}"?`);
            if (confirmDelete) {
                await deleteSubject(subjectId, subjectCard);
            }
        });
    }

    function openEditModal(subjectName, schedule, subjectId) {
      
        const modal = document.getElementById('editSubjectModal');
        const editSubjectName = document.getElementById('editSubjectName');
        const editSubjectDateStart = document.getElementById('editSubjectDateStart');
        const editSubjectDateEnd = document.getElementById('editSubjectDateEnd');

        editSubjectName.value = '';
        editSubjectDateStart.value = '';
        editSubjectDateEnd.value = '';

        const [startDate, endDate] = schedule.split(' - ');

        editSubjectName.value = subjectName;
        editSubjectDateStart.value = convertDateFormat(startDate);
        editSubjectDateEnd.value = convertDateFormat(endDate);

        modal.classList.add('show'); 

        
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function () {
            modal.classList.remove('show');
            editSubjectName.value = '';
            editSubjectDateStart.value = '';
            editSubjectDateEnd.value = '';
        };

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.classList.remove('show');
            }
        };

        const form = document.getElementById('editSubjectForm');
        form.onsubmit = async function (event) {
            event.preventDefault();

            const subjectName = editSubjectName.value;
            const subjectDateStart = editSubjectDateStart.value;
            const subjectDateEnd = editSubjectDateEnd.value;

            const success = await updateSubject(subjectId, subjectName, subjectDateStart, subjectDateEnd);
            if (success) {
                updateSubjectInDOM(subjectId, subjectName, subjectDateStart, subjectDateEnd);
                getUserSubjects(currentUserId);  
                modal.classList.remove('show');  
            }
        };
    }

    function updateSubjectInDOM(subjectId, subjectName, subjectDateStart, subjectDateEnd) {
        const subjectList = document.querySelector('.subject-list');

        const subjectCard = Array.from(subjectList.children).find(card => {
            return card.querySelector('.subject-info').dataset.id == subjectId;
        });

        if (subjectCard) {
            const schedule = `${new Date(subjectDateStart).toLocaleDateString()} - ${new Date(subjectDateEnd).toLocaleDateString()}`;

            const scheduleElem = subjectCard.querySelector('.subject-schedule');
            const nameElem = subjectCard.querySelector('.subject-name');

            nameElem.textContent = subjectName;
            scheduleElem.innerHTML = schedule;

            console.log(`Materia actualizada: ${subjectId}, Nombre: ${subjectName}, Horario: ${schedule}`);
        } else {
            console.error("No se encontró la materia en la lista del DOM. ID:", subjectId);
        }
    }

    function convertDateFormat(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }

    async function updateSubject(subjectId, subjectName, subjectDateStart, subjectDateEnd) {
        const conn = await getConnection();
        try {
            const newStatus = 1;

            const [result] = await conn.query('CALL UpdateSubject(?,?,?,?,?,?)',
                [currentUserId, subjectId, newStatus, subjectName, subjectDateStart, subjectDateEnd]);

            console.log('Resultado de la actualización:', result);
            alert('Materia actualizada con éxito');
            return true;
        } catch (error) {
            console.error('Error al actualizar la materia:', error);
            alert('Error al actualizar la materia. Por favor, inténtalo de nuevo.');
            return false;
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    async function getUserSubjects(userId) {
        const conn = await getConnection();
        try {
            const [results] = await conn.query('CALL GetUserSubjects(?)', [userId]);
            console.log('Subjects obtenidos:', results);

            const subjects = results[0];
            const subjectList = document.querySelector('.subject-list');
            subjectList.innerHTML = '';

            if (subjects.length === 0) {
                const noSubjectsMessage = document.createElement('p');
                noSubjectsMessage.id = 'noSubjectsMessage';
                noSubjectsMessage.textContent = 'No subjects yet';
                subjectList.appendChild(noSubjectsMessage);
            } else {
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

            subjectCard.remove();

            const subjectList = document.querySelector('.subject-list');
            if (subjectList.children.length === 0) {
                const noSubjectsMessage = document.createElement('p');
                noSubjectsMessage.id = 'noSubjectsMessage';
                noSubjectsMessage.textContent = 'No subjects yet';
                subjectList.appendChild(noSubjectsMessage);
            }
        } catch (error) {
            console.error('Error al eliminar la materia:', error.message);
            alert('Error al eliminar la materia. Inténtalo de nuevo.');
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    async function addTask(name_task, note_task, start_date, end_date, category, status, priority, id_user) {
        const conn = await getConnection();
        try {
            await conn.query('CALL InsertTask(?,?,?,?,?,?,?,?, @p_task_id)', 
                [name_task, note_task, start_date, end_date, category, status, priority, id_user]);
    
            const [taskIdResult] = await conn.query('SELECT @p_task_id AS task_id');
            const newTaskId = taskIdResult[0].task_id; 
    
            const newTask = { id: newTaskId, name_task, category, priority, start_date, status }; 
            console.log('Nueva tarea:', JSON.stringify(newTask, null, 2)); 
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
    }

    function addLastTaskToInterface(task) {
        const taskList = document.querySelector('.task-list tbody');
        if (!taskList) {
            console.error('No se pudo encontrar el tbody para agregar la tarea.');
            return;
        }

        // Asegúrate de que estés utilizando la propiedad correcta para el ID  
        const newRow = taskList.insertRow(-1);
        newRow.id = `task-${task.task_id}`; // Asegúrate de que aquí esté task.task_id si eso es lo que necesitas  

        const cellId = newRow.insertCell(0);
        const cellName = newRow.insertCell(1);
        const cellCategory = newRow.insertCell(2);
        const cellPriority = newRow.insertCell(3);
        const cellDate = newRow.insertCell(4);
        const cellStatus = newRow.insertCell(5);
        const cellEdit = newRow.insertCell(6);
        const cellDelete = newRow.insertCell(7);

        cellName.className = 'task-name';
        cellCategory.className = 'task-category';
        cellPriority.className = 'task-priority';
        cellDate.className = 'task-date';
        cellStatus.className = 'task-status';

        // Corrige el ID que se muestra en la celda  
        cellId.textContent = task.task_id;
        cellName.textContent = task.name_task;
        cellCategory.textContent = task.category;
        cellPriority.textContent = task.priority;
        cellDate.textContent = task.start_date;
        cellStatus.innerHTML = `<input type="checkbox" ${task.status === 'Concluded' ? 'checked' : ''} />`;
        cellDelete.innerHTML = '<button class="delete-btn-task"><img src="../img/trash-task.png" alt="delete"></button>';
        cellEdit.innerHTML = '<button class="edit-btn"><img src="../img/edit.png" alt="Edit"></button>';
        const editButton = newRow.querySelector('.edit-btn');
        console.log(task.task_id)

        if (task.task_id) {
            editButton.onclick = () => openEditTaskModal(task.task_id, currentUserId);
        } else {
            console.error("task_id es nulo o indefinido.");
        }

    
        const deleteButton = newRow.querySelector('.delete-btn-task');
        deleteButton.onclick = async () => {
            console.log(`Task objeto:`, task); // Verifica la estructura de task
            console.log(`ID de tarea a eliminar: ${task.task_id}`); // Usa taskId en lugar de task.id o task.task_id
            
            const confirmed = confirm('¿Estás seguro de que deseas eliminar esta tarea?');
            if (confirmed) {
                const success = await deleteTask(task.task_id); // Usa taskId para la eliminación en la base de datos
                if (success) {
                    const rowToDelete = document.getElementById(`task-${task.task_id}`); // Usa taskId
                    console.log(`Fila a eliminar:`, rowToDelete);
                    if (rowToDelete) {
                        rowToDelete.remove(); // Elimina la fila de la interfaz
                    } else {
                        console.error(`No se encontró la fila con el ID: task-${task.task_id}`);
                    }
                } else {
                    alert('No se pudo eliminar la tarea. Inténtalo de nuevo más tarde.');
                }
            }
        };
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
            console.log(listOfTask)
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

    function openEditTaskModal(taskId, currentUserId) {
        const modal = document.getElementById('editTaskModal');
        modal.classList.add('show');

        const taskRow = document.getElementById(`task-${taskId}`);

        if (!taskRow) {
            console.error('El elemento de tarea no fue encontrado en el DOM.');
            return;
        } else
        {
            document.getElementById('editTaskName').value = taskRow.querySelector('.task-name').textContent;
            document.getElementById('editTaskDate').value = taskRow.querySelector('.task-date').textContent;
            document.getElementById('editTaskCategory').value = taskRow.querySelector('.task-category').textContent;
            document.getElementById('editTaskStatus').value = taskRow.querySelector('.task-status input').checked ? 'Concluded' : 'Pending';
            document.getElementById('editTaskPriority').value = taskRow.querySelector('.task-priority').textContent;
        }
      

        document.getElementById('editTaskForm').onsubmit = async function (event) {
            event.preventDefault();
            await updateTask(taskId, currentUserId);
            modal.classList.remove('show');
        };

        document.getElementById("closeModal").onclick = () => modal.classList.remove('show');
    }

    async function updateTask(taskId, currentUserId) {
        const taskName = document.getElementById('editTaskName').value;
        const taskNotes = document.getElementById('editTaskNotes').value;
        const taskDateStart = document.getElementById('editTaskDate').value;
        const taskDateEnd = document.getElementById('editTaskDateEnd').value;
        const taskCategory = document.getElementById('editTaskCategory').value;
        const taskStatus = document.getElementById('editTaskStatus').value;
        const taskPriority = document.getElementById('editTaskPriority').value;

        const conn = await getConnection();
        try {
            await conn.query('CALL UpdateTask(?,?,?,?,?,?,?,?,?)',
                [currentUserId, taskId, taskName, taskStatus, taskNotes, taskCategory, taskPriority, taskDateStart, taskDateEnd]);

            updateTaskInInterface(taskId, taskName, taskStatus, taskNotes, taskCategory, taskPriority, taskDateStart, taskDateEnd);
            console.log('Tarea actualizada con éxito');
        } catch (error) {
            console.error('Error al actualizar la tarea:', error);
        } finally {
            if (conn) {
                conn.end();
            }
        }
    }

    function updateTaskInInterface(taskId, taskName, taskStatus, taskNotes, taskCategory, taskPriority, taskDateStart, taskDateEnd) {
        const taskRow = document.getElementById(`task-${taskId}`);

        if (taskRow) {
            taskRow.querySelector('.task-name').textContent = taskName;
            taskRow.querySelector('.task-category').textContent = taskCategory;
            taskRow.querySelector('.task-priority').textContent = taskPriority;
            taskRow.querySelector('.task-start-date').textContent = taskDateStart;
            taskRow.querySelector('.task-status input').checked = (taskStatus === 'Concluded');
            taskRow.querySelector('.task-end-date').textContent = taskDateEnd;
            taskRow.querySelector('.task-notes').textContent = taskNotes;
        }
    }

    async function deleteTask(taskId) {
        const conn = await getConnection();
        try {
            await conn.query('CALL DeleteTaskById(?)', [taskId]); // Envía taskId a la base de datos
            console.log('Tarea con ID ' + taskId + ' eliminada con éxito');
            return true; // Devuelve verdadero si la eliminación fue exitosa
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
            return false; // Devuelve falso si hubo un error
        } finally {
            if (conn) {
                conn.end(); // Asegúrate de cerrar la conexión
            }
        }
    }
});