import fs from 'fs';
import ini from 'ini';
import mysql2 from 'mysql2/promise';

const CONFIG_FILE = 'rds-config.ini';

async function get_dbConn() {
  const config_data = fs.readFileSync(CONFIG_FILE, 'utf-8');
  const config = ini.parse(config_data);

  const dbConn = await mysql2.createConnection({
    host: config.rds.endpoint,
    port: parseInt(config.rds.port_number),
    user: config.rds.user_name,
    password: config.rds.user_pwd,
    database: config.rds.db_name,
  });

  return dbConn;
}

export { get_dbConn };
