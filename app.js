import express from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise'
import bodyParser from 'body-parser';
import multer from 'multer';
import http from 'http';
import { WebSocketServer }  from 'ws';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import { 
  phoneLogin,
  otpLogin,
  authCheck,
  getUserData,
} from './processor.js';


dotenv.config();

const app = express();
const port = process.env.PORT;
const tempFilesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'temp'+Date.now()+'-'+file.originalname);
  }
})
const upload = multer({ storage: tempFilesStorage });
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const activeWsConnections = new Map();
let database;

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.any()); 
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.redirect("http://ararat.com");
});

(async function() {
  database = await mysql.createConnection({
    host: process.env.MYSQL_DB_HOST, 
    user: process.env.MYSQL_DB_USER, 
    database: process.env.MYSQL_DB_NAME, 
    password: process.env.MYSQL_DB_PASSWORD
  });
})();

function restrictToLocalhost(req, res, next) {
  next();
  // const remoteAddress = req.connection.remoteAddress;
  // if (remoteAddress === '::1' || remoteAddress === '127.0.0.1') {
  //   // Allow access for localhost requests
  //   next();
  // } else {
  //   res.status(403).send('Access forbidden');
  // }
}

app.post('/api/phone-login', async (req, res) => {
  let input = req.body;
  await phoneLogin(input, database).then((result) => {
    res.json(result);
  })
})


app.post('/api/otp-login', async (req, res) => {
  let input = req.body;
  await otpLogin(input, database).then((result) => {
    res.json(result);
  })
})

app.post('/api/auth-check', async (req, res) => {
  let input = req.body;
  await authCheck(input, database).then((result) => {
    res.json(result);
  })
})

app.post('/api/get-user-data', async (req, res) => {
  let input = req.body;
  await getUserData(input, database).then((result) => {
    res.json(result);
  })
})


server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

process.on('uncaughtException', (err, origin) => {
  // Perform necessary actions, such as logging the error
  console.error('Uncaught Exception:', err);
  // You can also perform other actions here, such as graceful shutdown
  process.exit(1); // Exit the process with an error code
});