const express = require("express");
const path = require("path");
const app = express();
const AlphaVantage = require("./alpha-vantage.js");

app
    .use(express.static(path.join(__dirname, "public")))
    .set("port", (process.env.PORT || 3000))
    .set("views", path.join(__dirname, "views"))
    .set("view engine", "ejs")
    .get("/", (req, res) => res.render("index"))
    .get("/query", queryKeyword)
    .listen(app.get("port"), () => {
        console.log(`The server is listening on port ${app.get("port")}`);
    });

/**
 * Query API a keyword (name or symbol)
 * @param {Object} req 
 * @param {Object} res 
 */
function queryKeyword(req, res) {

    if (req.query.keyword === "") {
        res.status(500).send("Invalid keyword.");
        return;
    }

    const model = new AlphaVantage();

    model.symbolSearch(req.query.keyword, result => {
        res.json(result);
        res.end();
    });

}