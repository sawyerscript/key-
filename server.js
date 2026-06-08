const express = require("express");
const crypto = require("crypto");
const fs = require("fs");

const app = express();
app.use(express.json());

const DB_FILE = "./db.json";

function loadDB(){
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function saveDB(db){
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function genKey(){
  return crypto.randomBytes(6).toString("hex").toUpperCase();
}

app.get("/callback", (req,res)=>{
  const { uid } = req.query;

  if (!uid) return res.send("Missing UID");

  let db = loadDB();

  // already generated for this uid
  if (db[uid]){
    return res.send(`Your Key: ${db[uid]}`);
  }

  const key = genKey();
  db[uid] = key;

  saveDB(db);

  res.send(`
    <h1>Your Key</h1>
    <p>${key}</p>
    <script>
      navigator.clipboard.writeText("${key}");
    </script>
  `);
});

app.listen(3000, ()=>console.log("running"));
