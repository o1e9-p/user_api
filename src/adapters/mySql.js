import mysql from "mysql";
let instance = null;

export default class MySql {
  constructor(connection) {
    this.connection = connection;
    connection.connect();
  }

  async query(query) {
    console.log(query);
    return new Promise((res, rej) => {
      this.connection.query(query, (err, results) => {
        if (err) {
          rej(err);
          console.log(err);
        } else {
          res(results)
        }
      });
    });
  }

  static getInstance() {
    if (!instance) {
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PWD,
        database: process.env.DB_NAME,
        insecureAuth : true
      });
      instance = new MySql(connection);
    }

    return instance
  }
}
