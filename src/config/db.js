// require('dotenv').config();
// const mysql = require('mysql2');

// const connection = mysql.createPool({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'pos_system'
// });

// module.exports = connection.promise();

// ឧទាហរណ៍នៅក្នុង config/db.js របស់អ្នក
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  // 💡 បន្ថែមបន្ទាត់ខាងក្រោមនេះ ប្រសិនបើវាលោត Error ទាក់ទងនឹង SSL
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;