const axios = require("axios");
const querystring = require("querystring");

module.exports = class AlphaVantage {
    constructor() {
        this.url = "https://www.alphavantage.co/query?";
        this.key = "1VHN4J9EMO1GPG5O";
    }

    _makeRequest(data, handler) {
        axios
            .get(
                this.url +
                querystring.stringify(data)
            )
            .then(response => {
                console.log(response.data);
                handler(response.data);
            })
            .catch(error => {
                throw new Error(error);
            });
    }

    searchSymbol(keyword, handler) {
        const data = {
            function: "SYMBOL_SEARCH",
            apikey: this.key,
            keywords: keyword
        };

        this._makeRequest(data, handler);
    }
};