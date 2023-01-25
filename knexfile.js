import * as dotenv from "dotenv";
dotenv.config();

export const debugConf = {
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3'
  },
  useNullAsDefault: true
};

export const cronConf = debugConf;
