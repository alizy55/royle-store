// Simple notification system
const notifications = [];

export const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = {
        id,
        message,
        type,
        timestamp: new Date()
    };

    notifications.push(notification);

    // You can implement a toast or alert system here
    if (type === 'success') {
        alert(`✅ ${message}`);
    } else if (type === 'error') {
        alert(`❌ ${message}`);
    } else if (type === 'warning') {
        alert(`⚠️ ${message}`);
    } else {
        alert(`ℹ️ ${message}`);
    }

    return id;
};

export const getNotifications = () => notifications;