const express = require("express");

const app = express();

app.set("port", (process.env.PORT || 3000));

app.get("/", getData);

app.listen(app.get("port"), () => {
    console.log(`The server is listening on port ${app.get("port")}`);
});

function getData(req, res) {
    console.log("Getting data.");

    res.json({ name: "Jonhn" });
    res.end();
}