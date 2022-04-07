var express = require("express");
var cors = require("cors");
var app = express();
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const saltRounds = 10;
var jwt = require("jsonwebtoken");
const secret = "Login";

app.use(cors());
app.use(express.json());

const mysql = require("mysql2");
const { createConnection } = require("net");
// create the connection to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "esan-temple",
});

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "esan-temple",
});

app.get("/search", (req, res) => {
  db.query("SELECT * FROM temple", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/alltemple", (req, res) => {
  db.query("SELECT * FROM temple", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/allevent", (req, res) => {
  db.query("SELECT * FROM temple_event", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.get("/allreview", (req, res) => {
  db.query("SELECT * FROM temple_review", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

app.post("/register", jsonParser, function (req, res, next) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    connection.execute(
      "INSERT INTO user (user_id, username, password, user_firstname, user_lastname, user_role_id) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.body.user_id,
        req.body.username,
        hash,
        req.body.user_firstname,
        req.body.user_lastname,
        req.body.user_role_id,
      ],
      function (err, results, fields) {
        if (err) {
          res.json({ status: "error", message: err });
          return;
        }
        res.json({ status: "ok" });
      }
    );
  });
});

app.post("/admintemple", (req, res) => {
  const temple_type_id = req.body.temple_type_id;
  const temple_name = req.body.temple_name;
  const temple_description = req.body.temple_description;
  const temple_address = req.body.temple_address;
  const temple_create_by = req.body.temple_create_by;
  db.query(
    "INSERT INTO temple (temple_type_id, temple_name, temple_description, temple_address, temple_create_by) VALUES (?, ?, ?, ?, ?)",
    [temple_type_id, temple_name, temple_description, temple_address,temple_create_by],
    (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send("Values inserted");
      }
    }
  );
});

app.put("/update", (req, res) => {
  const temple_id = req.body.temple_id;
  const temple_type_id = req.body.temple_type_id;
  const temple_name = req.body.temple_name;
  const temple_description = req.body.temple_description;
  const temple_address = req.body.temple_address;
  db.query(
    "UPDATE temple SET temple_type_id = ?, temple_name = ?, temple_description = ?, temple_address = ? WHERE temple_id = ?",
    [temple_type_id, temple_name, temple_description, temple_address,temple_id], (err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.send(result);
      }
    }
  );
});

// app.post("/admintemple", jsonParser, function (req, res, next) {
//   bcrypt.hash(req.body.temple_type_id, saltRounds, function (err, hash) {
//     connection.execute(
//       "INSERT INTO temple (temple_type_id, temple_name, temple_description, temple_address) VALUES (?, ?, ?, ?)",
//       [
//         req.body.user_id,
//         req.body.username,
//         hash,
//         req.body.user_firstname,
//         req.body.user_lastname,
//         req.body.user_role_id,
//       ],
//       function (err, results, fields) {
//         if (err) {
//           res.json({ status: "error", message: err });
//           return;
//         }
//         res.json({ status: "ok" });
//       }
//     );
//   });
// });

app.post("/login", jsonParser, function (req, res, next) {
  connection.execute(
    "SELECT * FROM user WHERE username=?",
    [req.body.username],
    function (err, user, fields) {
      if (err) {
        res.json({ status: "error", message: err });
        return;
      }
      if (user.length == 0) {
        res.json({ status: "error", message: "no user found" });
        return;
      }
      bcrypt.compare(
        req.body.password,
        user[0].password,
        function (err, isLogin) {
          if (isLogin) {
            var token = jwt.sign({ username: user[0].username }, secret, {
              expiresIn: "1h",
            });
            res.json({ status: "ok", message: "login success", user, token });
          } else {
            res.json({ status: "error", message: "login failed" });
          }
        }
      );
    }
  );
});

app.post("/authen", jsonParser, function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, secret);
    res.json({ status: "ok", decoded });
    res.json({ decoded });
  } catch (err) {
    res.json({ status: "error", message: err.message });
  }
});

app.listen(3333, function () {
  console.log("CORS-enabled web server listening on port 3333");
});
