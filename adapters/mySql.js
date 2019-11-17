import mysql from "mysql";

export default class MySql {
  constructor() {
    this.connection = this._connect();
  }

  _connect() {
    return mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      insecureAuth : true
    });
  }

  query(query) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }
}