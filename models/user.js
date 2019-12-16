const mongoose = require("mongoose");
const uuid = require("uuid/v1");

const UserSchema = new mongoose.Schema({
  id: String,
  email: String,
  stock: {
    name: String,
    symbol: String
  }
});

module.exports = class User {
  constructor() {
    mongoose.connect(
      "mongodb+srv://cs313:fyhwxS5QbYslXv8Q@cluster0-ca8if.mongodb.net/test?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      }
    );
    const db = mongoose.connection;
    db.on("error", () => {
      throw new Error("Error connecting to database.");
    });

    db.once("open", () => {
      //console.log('Connected to database.')
    });

    this._User = mongoose.model("User", UserSchema);
  }

  saveStock(data, handler, next) {
    if ("id" in data) {
      this._saveStockById(data, handler, next);
      return;
    }

    if ("email" in data) {
      this._saveStockByEmail(data, handler, next);
      return;
    }
  }

  deleteStock(data, handler, next) {
    if ("id" in data) {
      this._deleteStockById(data, handler, next);
      return;
    }

    if ("email" in data) {
      this._deleteStockByEmail(data, handler, next);
      return;
    }
  }

  retrieve(query, handler, next) {
    if (query.type === "email") {
      this._User.findOne({ email: query.key }, (err, user) => {
        if (err) {
          return next(err);
        }
        if (user !== null) {
          this._listStocks(user.id, handler, next);
        }
      });
    } else {
      this._listStocks(query.key, handler, next);
    }
  }

  _listStocks(userId, handler, next) {
    if (!userId) {
      return next("User id cannot be empty.");
    }

    this._User.find({ id: userId }, (err, rows) => {
      if (err) {
        return next(err);
      }

      if (rows === null || rows.length === 0) {
        return handler({
          id: "",
          email: "",
          stocks: []
        });
      }

      const result = {
        id: rows[0].id,
        email: rows[0].email,
        stocks: []
      };

      rows.forEach((row, idx) => {
        result.stocks.push({
          symbol: row.stock.symbol,
          name: row.stock.name
        });
      });

      handler(result);
    });
  }

  _save(user, handler, next) {
    user.save((error, user) => {
      if (error) {
        return next(error);
      }

      this._listStocks(
        user.id,
        result => {
          handler(result);
        },
        next
      );
    });
  }

  _delete(query, handler, next) {
    this._User.findOneAndRemove(query, (err, user) => {
      if (err) {
        return next(err);
      }

      if (user === null) {
        return next("Stock not found.");
      }

      this._listStocks(
        user.id,
        result => {
          handler(result);
        },
        next
      );
    });
  }

  _saveStockByEmail(data, handler, next) {
    if (!data.email) {
      return next("Email cannot be empty.");
    }

    const msg = this._isStockInvalid(data.stock);

    if (msg) {
      return next(msg);
    }

    this._User.findOne({ email: data.email }, (err, user) => {
      if (err) {
        return next(err);
      }

      data.id = user === null ? uuid() : user.id;
      const newUser = new this._User(data);

      // finally save user
      this._save(newUser, handler, next);
    });
  }

  _saveStockById(data, handler, next) {
    if (!data.id) {
      return next("User id cannot be empty.");
    }

    const msg = this._isStockInvalid(data.stock);

    if (msg) {
      return next(msg);
    }

    this._User.findOne({ id: data.id }, (err, user) => {
      if (err) {
        return next(err);
      }

      if (user === null) {
        return next("User not found.");
      }

      data.email = user.email;
      const newUser = new this._User(data);

      // finally save user
      this._save(newUser, handler, next);
    });
  }

  _deleteStockByEmail(data, handler, next) {
    if (!data.email) {
      return next("Email cannot be empty.");
    }
    this._delete(
      { email: data.email, "stock.symbol": data.stock.symbol },
      handler,
      next
    );
  }

  _deleteStockById(data, handler, next) {
    if (!data.id) {
      return next("User id cannot be empty.");
    }

    this._delete(
      { id: data.id, "stock.symbol": data.stock.symbol },
      handler,
      next
    );
  }

  _isStockInvalid(stock) {
    if (stock.symbol === "") {
      return "Stock symbol cannot be empty.";
    }

    if (stock.name === "") {
      return "Stock name cannot be empty.";
    }

    return false;
  }
};
