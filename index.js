require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const webSocket = require("ws");
const crypto = require("crypto");

//Date variable :
const expressPort = process.env.PORT || 3000;
const d = new Date();
const date = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
let clients = {};
let games = {
  lolrandomxd: {
    gameId: "lolrandomxd",
    clients: [],
  },
};

// Serverts/Database connection :
const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) throw error;
  console.log("DataBase connected !");
});

//Middlewares :
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token === "null") {
    return res.status(404).send();
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).send();
    }
    req.user = user;
    next();
  });
};

//Query Functions :
const verifyUseName = (req, res, next) => {
  const username = req.body.username;
  db.query("select username from accounts", (err, results) => {
    for (let i = 0; i < results.length; i++) {
      if (username === results[i].username) {
        return res.status(406).send();
      }
    }
    next();
  });
};

const server = express()
  .use(express.static(path.join(__dirname, "./public")))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(cors())
  // Get request :
  .get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/home.html"));
  })
  .get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/offline.html"));
  })
  .get("/pvp", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/pvp.html"));
  })
  .get("/pvb", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/pvb.html"));
  })
  .get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/profile.html"));
  })
  .get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/signUp.html"));
  })
  .get("/usersCount", (req, res) => {
    db.query("select count(accountID) as users from accounts", (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.send(JSON.stringify(data[0]));
      }
    });
  })
  .post("/getuser", verifyToken, (req, res) => {
    db.query(
      "select accountID, firstname, date, lastname from accounts where username like '" +
        req.user.username +
        "'",
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const userInfos = {
            userID: data[0].accountID,
            username: req.user.username,
            firstname: data[0].firstname,
            lastname: data[0].lastname,
            date: data[0].date,
          };
          res.status(200).send(JSON.stringify(userInfos));
        }
      }
    );
  })
  .post("/getMatchHistory", (req, res) => {
    db.query(
      "select accounts.username, results.matchID, results.result from results join accounts on accounts.accountID like results.accountID where matchID in (select matchID from matches where matchID in (select matchID from results where accountID like '" +
        req.body.userID +
        "'));",
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send(JSON.stringify(data));
        }
      }
    );
  })
  .post("/getMatchesPlayed", (req, res) => {
    db.query(
      "select resultID, result from results where accountID like '" +
        req.body.userID +
        "'",
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          res.send(JSON.stringify(data));
        }
      }
    );
  })
  .post("/insertUser", verifyUseName, async (req, res) => {
    body = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(body.password, salt);
    db.query(
      "insert into accounts (accountID, firstname , lastname, username, password, date) values ( '" +
        crypto.randomBytes(5).toString("hex") +
        "', '" +
        body.firstName +
        "' , '" +
        body.lastName +
        "', '" +
        body.username +
        "', '" +
        hashedPassword +
        "', '" +
        date +
        "')",
      (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log("new account created");
        }
      }
    );
    const user = {
      username: body.username,
      password: hashedPassword,
    };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    res.send(JSON.stringify(accessToken));
  })
  .post("/login", async (req, res) => {
    const asycnSql = require("mysql2/promise");
    const conn = await asycnSql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE,
    });
    const query = await conn.execute(
      "select username, password from accounts where username like'" +
        req.body.username +
        "'"
    );
    const user = query[0][0];
    if (user == null) {
      return res.status(404).send();
    }
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
        res.status(200).send(JSON.stringify(accessToken));
      } else {
        res.status(403).send();
      }
    } catch {
      res.status(500).send();
    }
    await conn.end();
  })
  .post("/insertResult", (req, res) => {
    const result = req.body.result ? 1 : 0;
    db.query(
      "insert into results(matchID, accountID, result) values ('" +
        req.body.gameId +
        "', '" +
        req.body.userID +
        "', '" +
        result +
        "')",
      (err, data) => {
        if (err) {
          console.log(err);
        }
      }
    );
  })
  .get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./public/error.html"));
  })
  .listen(expressPort, (err) => {
    if (err) throw err;
    console.log(`server listning to port ${expressPort}`);
  });

// webSocket requests :
const wss = new webSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("new client connected");

  const clientId = crypto.randomBytes(4).toString("hex");
  clients[clientId] = {
    clientId: clientId,
    socket: ws,
  };

  let payLoad = {
    method: "connect",
    clientId: clientId,
  };

  ws.send(JSON.stringify(payLoad));

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (
      data.method === "move" ||
      data.method === "castle" ||
      data.method === "promote"
    ) {
      const game = games[data.gameId];
      const client = data.clientId;

      for (let i = 0; i < game.clients.length; i++) {
        if (game.clients[i] !== client) {
          clients[game.clients[i]].socket.send(JSON.stringify(data));
        }
      }
    } else if (data.method === "close") {
      const game = data.gameId;
      const client = data.clientId;

      console.log(`client ${client} has disconnected`);
      delete clients[client];

      if (
        typeof games[game] !== "undefined" &&
        games[game].clients.length === 2
      ) {
        for (let i = 0; i < games[game].clients.length; i++) {
          if (games[game].clients[i] !== client) {
            const payLoad = {
              method: "serverMessage",
              content: "- Your opponent quit the game ! u win, I guess...",
            };
            const payLoad1 = {
              method: "opponentQuit",
            };

            clients[games[game].clients[i]].socket.send(
              JSON.stringify(payLoad)
            );
            clients[games[game].clients[i]].socket.send(
              JSON.stringify(payLoad1)
            );
          }
        }

        console.log(`Game ${game} has been deleted`);
        delete games[game];
      }
    } else if (
      data.method === "message" ||
      data.method === "log" ||
      data.method === "pause"
    ) {
      const game = games[data.gameId];
      for (let i = 0; i < game.clients.length; i++) {
        clients[game.clients[i]].socket.send(JSON.stringify(data));
      }
    } else if (data.method === "create") {
      const client = data.clientId;
      const newGameId = crypto.randomBytes(4).toString("hex");

      games[newGameId] = {
        gameId: newGameId,
        clients: [],
      };

      const payLoad = {
        method: "create",
        gameId: newGameId,
      };

      clients[client].socket.send(JSON.stringify(payLoad));

      console.log(`new game created with ID : ${newGameId}`);
    } else if (data.method === "join") {
      const client = data.clientId;
      const game = games[data.gameId];

      if (game == null) {
        const payLoad = {
          method: "serverMessage",
          content: "- Game is not found !!",
        };

        clients[client].socket.send(JSON.stringify(payLoad));
        console.log("game not found !");
        return;
      }

      if (game.clients.length === 2) {
        const payLoad = {
          method: "serverMessage",
          content: "- The Game you're trying to join is full !!",
        };

        clients[client].socket.send(JSON.stringify(payLoad));
        console.log("game full !");
        return;
      }

      game.clients.push(client);

      const player = { 1: "white", 2: "black" }[game.clients.length];

      const payLoad = {
        method: "join",
        gameId: data.gameId,
        player: player,
      };

      clients[client].socket.send(JSON.stringify(payLoad));

      if (game.clients.length === 1) {
        const payLoad = {
          method: "serverMessage",
          content: "- 1/2 player, Waiting for one more player",
        };

        clients[client].socket.send(JSON.stringify(payLoad));
      } else {
        db.query(
          "insert into matches (matchID, replay, date) values ('" +
            data.gameId +
            "', 'qb3 pf3 kh5 rb6 pa3 pb3', '" +
            date +
            "')",
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              console.log("new game !");
            }
          }
        );
        const payLoad = {
          method: "startGame",
          content: "- 2/2 players, Game has started !",
        };

        for (let i = 0; i < game.clients.length; i++) {
          clients[game.clients[i]].socket.send(JSON.stringify(payLoad));
        }
      }

      console.log(
        `client : ${client} joined game : ${data.gameId} with color : ${player}`
      );
    } else if (data.method === "gameOver") {
      const game = games[data.gameId];
      if (typeof game === "undefined") {
        return;
      }
      console.log(`game : ${data.gameId} is over`);
      delete games[data.gameId];
    }
  });
});
