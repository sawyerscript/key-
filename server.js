const express = require("express");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(express.json());

const DB_FILE = "./keys.json";

// load db
function loadDB(){
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// generate key
function generateKey(){
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

// CALLBACK from Work.ink
app.get("/callback", (req,res)=>{
  const { device } = req.query; // fingerprint from client
  const db = loadDB();

  // already exists
  if (db[device]){
    return res.json({ key: db[device] });
  }

  const key = generateKey();
  db[device] = key;

  saveDB(db);

  res.json({ key });
});

// validate key for Roblox script
app.post("/validate", (req,res)=>{
  const { key, device } = req.body;
  const db = loadDB();

  if (db[device] && db[device] === key){
    return res.json({ valid: true });
  }

  return res.json({ valid: false });
});

app.listen(3000, ()=> console.log("Server running"));
