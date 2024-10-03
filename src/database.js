const mysql = require('mysql2/promise');

async function getConnection() {
    const connection = await mysql.createConnection({
    host: 'eduplanner.mysql.database.azure.com',
    user: 'eduplanner',
    password: 'proyecto123P',
    database: 'eduplanner'
});
return connection;
}

module.exports = {getConnection}
