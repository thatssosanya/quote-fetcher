export const debugConf = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  },
  useNullAsDefault: true
};

export const cronConf = {
  client: 'mssql',
  connection: {
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    user: process.env.MSSQL_USERNAME,
    password: process.env.MSSQL_PASSWORD
  }
};
