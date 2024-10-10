const { ipcRenderer } = require('electron');   
let currentUserId;   

ipcRenderer.on('set-user-id', (event, userId) => {  
    currentUserId = userId;   
    console.log('ID de usuario recibido en home:', currentUserId);  
    useCurrentUserId(); 
});  

function useCurrentUserId() {  
    if (currentUserId) {  
        console.log('Usando ID de usuario:', currentUserId);  
    } else {  
        console.log('currentUserId aún no está definido.');  
    }  
}  
