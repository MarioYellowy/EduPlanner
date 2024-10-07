document.addEventListener('DOMContentLoaded', () => {
    const summit = document.getElementById('summit'); 
    const NOTIFICATION_TITLE = "Forgot password";
    const NOTIFICATION_BODY = "The email was sent successfully.";

    const showNotification = (title, body) => {
        const notification = new window.Notification(title, {
            body: body
        });

        notification.onclick = () => { 
            document.getElementById('output').innerText = CLICK_MESSAGE; 
        };
    };

    summit.addEventListener('click', (e) => {
        e.preventDefault();

        if (Notification.permission === 'granted') {
            showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY);
                }
            });
        }
        window.location.href = '../login/login.html';
    });
});
