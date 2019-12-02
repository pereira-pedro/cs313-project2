const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const AlphaVantage = require("./models/alpha-vantage.js");
const User = require("./models/user.js");

app
    .use(express.static(path.join(__dirname, "public")))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .set("port", (process.env.PORT || 3000))
    .set("views", path.join(__dirname, "views"))
    .set("view engine", "ejs")
    .get("/", (req, res) => res.render("index"))
    .get("/query", queryKeyword)
    .get("/retrieve", listStocks)
    .get("/stock", queryData)
    .post("/save", saveStock)
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

/**
 * Query API intraday stock data
 * @param {Object} req 
 * @param {Object} res 
 */
function queryData(req, res) {

    if (req.query.symbol === "") {
        res.status(500).send("Invalid symbol.");
        return;
    }

    if (req.query.interval === "") {
        res.status(500).send("Invalid interval.");
        return;
    }

    if (req.query.method === "") {
        res.status(500).send("Invalid method.");
        return;
    }

    try {

        const model = new AlphaVantage();
        model[`${req.query.method}Data`](req.query.symbol, req.query.interval, result => {
            res.json(result);
            res.end();
        });
    } catch (error) {
        res.status(500).send(error.message);

    }

}

function saveStock(req, res) {
    if (req.body.stock_symbol === "") {
        res.status(500).send("Stock symbol cannot be empty.");
        return;
    }

    if (req.body.stock_name === "") {
        res.status(500).send("Stock name cannot be empty.");
        return;
    }

    if (req.body.id === "" || req.body.email === "") {
        res.status(500).send("Either ID or email must be provided.");
        return;
    }

    try {
        const model = new User();

        const data = {
            stock: {
                symbol: req.body.stock_symbol,
                name: req.body.stock_name
            }
        };

        if ('id' in req.body) {
            data.id = req.body.id;
        }

        if ('email' in req.body) {
            data.email = req.body.email;
        }

        model.saveStock(data, result => {
            res.json(result);
            res.end();
            return;
        });

    } catch (error) {
        res.status(500).send(error.message);

    }
}

function listStocks(req, res) {
    if (req.query.id === "" || req.query.email === "") {
        res.status(500).send("User ID or email cannot be empty.");
        return;
    }
    const query = {
        key: 'id' in req.query ? req.query.id : req.query.email,
        type: 'id' in req.query ? 'id' : 'email'
    };
    try {
        const model = new User();

        model.retrieve(query, result => {
            res.json(result);
            res.end();
        });
    } catch (error) {
        res.status(500).send(error.message);

    }

}
/*
function retrieve(req, res) {
    if (req.body.stock === "") {
        res.status(500).send("Stock symbol cannot be empty.");
        return;
    }

    if (req.body.id === "" ) {
        res.status(500).send("User ID cannot be empty.");
        return;
    }

    const model = new User();

        model.retrieveStock(req.body.id, req.body.stock, result => {
            res.json(result);
            res.end();
            return;
        });
    }
}*/