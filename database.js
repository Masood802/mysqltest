const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");
var path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");

const port = process.env.port || 4000;
app = express();
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(cors());
app.use(express.json());
// app.use(express.static("public"));
// app.use("images", express.static("images"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(port, () => {
  console.log(`server is running at:${port}`);
});
//connection instance
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "M@sood1435",
  database: "recipies",
});
//connecting to database
connection.connect((err) => {
  if (err) throw err;
  console.log("database Connected!");
});
//multer storage to store image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });
app.use((req, res, err, next) => {
  res.status(err.status || 500).json({ error: err.message });
});
app.get("/", (req, res) => {
  res.render("index");
});
//get all the categories of recipies in the database
app.get("/all", async (req, res) => {
  try {
    connection.query(`select * from categories`, (err, result, fields) => {
      if (err) {
        console.log(err);
      }
      console.log(result);
      res.send(result);
    });
  } catch (error) {
    next(error);
  }
});
//post request to list of meals in specific category..
app.get("/recipie", async (req, res) => {
  const category = req.body.category;
  try {
    connection.query(
      `select * from recipie where Category="${category}"`,
      (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(category);
        res.send(result);
      }
    );
  } catch (error) {
    next(error);
  }
});
// to get the details of a recipie with the id
app.post("/details", async (req, res) => {
  const id = req.body.id;
  try {
    connection.query(
      `select * from recipie where recipieID="${id}"`,
      (err, result, fields) => {
        if (err) {
          res.send(err);
        }
        if (result.length > 0) {
          res.send(result);
        } else {
          console.log(req.body);
          res.send(`NO match found for this recipie id:${id}`);
        }
      }
    );
  } catch (error) {
    next(error);
  }
});
//post request to add recipie to the database..
app.post("/addrecipie", upload.single("image"), (req, res) => {
  const name = req.body.recipieName;
  const category = req.body.Category;
  const instruction = req.body.instruction;
  const image = req.file.path;
  console.log(image);
  const id = Math.floor(Math.random() * 1000);
  var query = `INSERT INTO recipie (recipieId,recipieName,Category,image,instruction) 
  values ?`;
  var values = [[id, name, category, image, instruction]];
  try {
    connection.query(query, [values], (err, result) => {
      res.send("record added successfully");
      console.log(image);
    });
  } catch (err) {
    console.log(err);
  }
});
