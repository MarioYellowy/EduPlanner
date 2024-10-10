const { ipcRenderer } = require('electron');   
let currentUserId;   

// Este listener se define para recibir el ID de usuario  
ipcRenderer.on('set-user-id', (event, userId) => {  
    currentUserId = userId;   
    console.log('ID de usuario recibido en home:', currentUserId);  
    useCurrentUserId(); // Llama a la función después de recibir el ID  
});  

function useCurrentUserId() {  
    if (currentUserId) {  
        console.log('Usando ID de usuario:', currentUserId);  
    } else {  
        console.log('currentUserId aún no está definido.');  
    }  
}  

// Inicialmente, no es necesario llamar a useCurrentUserId() aquí,  
// ya que currentUserId puede ser undefined.
// Puedes llamar a esta función en respuesta a otros eventos o acciones

// Aquí puedes usar `currentUserId` donde lo necesites dentro de `home.js`

/*document.getElementById('logout-btn').addEventListener('click', function(event) {
    const confirmLogout = window.confirm('¿Sure you want to logout?');
    if (!confirmLogout) {
        event.preventDefault(); 
    } else {
        console.log("Cerrando sesión...");
      
        window.location.href = "../login/login.html";
    }
});*/
