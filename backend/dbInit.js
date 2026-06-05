const mysql = require('mysql2/promise');
require('dotenv').config();

const initDB = async () => {
  const connection = await mysql.createConnection({
    host: process.env.TIDB_HOST || 'gateway01.aws.tidbcloud.com',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_NAME || 'job_board',
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      companyName VARCHAR(255) NOT NULL,
      location VARCHAR(255) NOT NULL,
      jobType VARCHAR(50) NOT NULL,
      minSalary INT,
      maxSalary INT,
      currency VARCHAR(10) DEFAULT 'INR',
      tags TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  console.log('TiDB Database Tables Initialized Successfully!');
  await connection.end();
};

if (require.main === module) {
  initDB().catch(console.error);
}

module.exports = initDB;
