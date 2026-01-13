
import sqlite3 from "sqlite3";
export const db = new sqlite3.Database("data.db");

db.run("CREATE TABLE IF NOT EXISTS meta (token TEXT, phone_id TEXT)");
db.run("CREATE TABLE IF NOT EXISTS knowledge (content TEXT)");
