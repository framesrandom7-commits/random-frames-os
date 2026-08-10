require('ts-node/register');
const { syncAutomatedNotifications } = require('./app/actions/notifications.ts');
syncAutomatedNotifications().then(() => console.log('success')).catch(console.error);
