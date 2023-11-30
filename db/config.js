import pkg from "pg";

const { Pool } = pkg;

const client = new Pool({
  user: "postgres",
  database: "lazzaro",
  port: 5432,
  host: "localhost",
  password: "2006",
});

client.connect();

export default client;
