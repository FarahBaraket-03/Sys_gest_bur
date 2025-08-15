import mysql from 'mysql2';
import 'dotenv/config';


const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});


db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});


export default db;
