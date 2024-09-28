const mysql = require('promise-mysql')
const connection = mysql.createConnection({
    host:"eduplanner.mysql.database.azure.com", 
    user:"eduplanner", 
    password:"proyecto123P", 
    database:"eduplanner", 
   });
function getConnection(){
    return connection
}

module.exports = {getConnection}