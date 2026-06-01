require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pos_system'
});

module.exports = connection.promise();