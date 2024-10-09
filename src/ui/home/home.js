document.getElementById('logout-btn').addEventListener('click', function(event) {
    // Mostrar cuadro de confirmación
    const confirmLogout = window.confirm('¿Sure you want to logout?');

    // Si el usuario no confirma, previene la acción de logout
    if (!confirmLogout) {
        event.preventDefault(); // Evita cualquier acción predeterminada
    } else {
        console.log("Cerrando sesión...");
        // redirigir a la página de inicio de sesión
        window.location.href = "/login";
    }
});
