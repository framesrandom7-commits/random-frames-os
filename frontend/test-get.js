require('ts-node').register({ transpileOnly: true });
const { getNotifications } = require('./app/actions/notifications.ts');
getNotifications().then(data => console.log('All:', data.length)).catch(console.error);
getNotifications({ status: 'PENDING' }).then(data => console.log('Pending:', data.length)).catch(console.error);
