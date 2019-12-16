const axios = require("axios");
const querystring = require("querystring");
const moment = require("moment");

module.exports = class AlphaVantage {
  constructor() {
    this.url = "https://www.alphavantage.co/query?";
    this.key = "1VHN4J9EMO1GPG5O";
  }

  /**
   * Send request to API
   * @param {String} keyword
   * @param {Function} handler
   */
  symbolSearch(keyword, handler) {
    const params = {
      function: "SYMBOL_SEARCH",
      apikey: this.key,
      keywords: keyword
    };

    this._makeRequest(params, handler);
  }

  intraDayData(symbol, interval, handler) {
    const params = {
      function: "TIME_SERIES_INTRADAY",
      apikey: this.key,
      symbol: symbol,
      interval: interval
    };

    this._makeRequest(params, result => {
      if ("Error Message" in result) {
        throw new Error(result["Error Message"]);
      }

      const series = [
        {
          data: []
        } /*,
                {
                    data: [],
                }*/
      ];

      const metadata = {
        information: result["Meta Data"]["1. Information"],
        symbol: result["Meta Data"]["2. Symbol"],
        timestamp: moment(result["Meta Data"]["3. Last Refreshed"]),
        interval: result["Meta Data"]["4. Interval"],
        timezone: result["Meta Data"]["6. Time Zone"]
      };

      var row;
      var key;
      var firstTime = null;
      var time;
      for (key in result[`Time Series (${interval})`]) {
        row = result[`Time Series (${interval})`][key];
        if (firstTime === null) {
          firstTime = moment(key).valueOf();
        }
        time = moment(key);
        // only same day is considered
        if (!time.isSame(firstTime, "day")) {
          break;
        }

        series[0].data.push({
          x: time.valueOf(),
          y: [
            Number.parseFloat(row["1. open"]),
            Number.parseFloat(row["2. high"]),
            Number.parseFloat(row["3. low"]),
            Number.parseFloat(row["4. close"])
          ]
        });

        /*series[1].data.push({
                    x: moment(key),
                    y: [
                        Number.parseInt(row["5. volume"])
                    ]
                });*/
      }

      handler({
        series: series,
        metadata: metadata
      });
    });
  }

  /**
   * Generic method to prepare an API request
   * @param {Object} data
   * @param {Function} handler
   */
  _makeRequest(data, handler) {
    axios
      .get(this.url + querystring.stringify(data))
      .then(response => {
        handler(response.data);
      })
      .catch(error => {
        throw new Error(error);
      });
  }
};
