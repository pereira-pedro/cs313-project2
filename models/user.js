const mongoose = require("mongoose");
const uuid = require('uuid/v1');

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
        mongoose.connect('mongodb+srv://cs313:fyhwxS5QbYslXv8Q@cluster0-ca8if.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
        const db = mongoose.connection;
        db.on('error', () => {
            throw new Error("Error connecting to database.")
        });

        db.once('open', () => {
            //console.log('Connected to database.')
        });

        this._User = mongoose.model('User', UserSchema);
    }

    saveStock(data, handler) {
        if ('id' in data) {
            this._saveStockById(data, handler);
            return;
        }

        if ('email' in data) {
            this._saveStockByEmail(data, handler);
            return;
        }
    }

    retrieve(query, handler) {
        if (query.type === 'email') {
            this._User.findOne({ email: query.key }, (err, user) => {
                if (err) {
                    return handleError(err);
                }
                if (user !== null) {
                    this._listStocks(user.id, handler);
                }
            });
        }
        else {
            this._listStocks(query.key, handler);
        }

    }

    _listStocks(userId, handler) {
        if (!userId) {
            throw new Error('User id cannot be empty.');
        }

        this._User.find({ id: userId }, (err, rows) => {
            if (err) {
                return handleError(err);
            }
            if (rows === null) {
                return;
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

    _save(user, handler) {

        user.save((error, user) => {
            if (error) {
                throw new Error(error);
            }

            this._listStocks(user.id, (result) => {
                handler(result)
            });

        });
    }

    _saveStockByEmail(data, handler) {
        if (!data.email) {
            throw new Error('Email cannot be empty.');
        }

        const msg = this._isStockInvalid(data.stock)

        if (msg) {
            throw new Error(msg);
        }

        this._User.findOne({ email: data.email }, (err, user) => {
            if (err) {
                return handleError(err);
            }

            data.id = user === null ? uuid() : user.id;
            const newUser = new this._User(data);

            // finally save user
            this._save(newUser, handler);
        });
    }

    _saveStockById(data, handler) {
        if (!data.id) {
            throw new Error('User id cannot be empty.');
        }

        const msg = this._isStockInvalid(data.stock)

        if (msg) {
            throw new Error(msg);
        }

        this._User.findOne({ id: data.id }, (err, user) => {
            if (err) {
                return handleError(err);
            }

            if (user === null) {
                throw new Error("User not found.")
            }

            data.email = user.email;
            const newUser = new this._User(data);

            // finally save user
            this._save(newUser, handler);

        });

    }

    _isStockInvalid(stock) {
        if (stock.symbol === '') {
            return 'Stock symbol cannot be empty.';
        }

        if (stock.name === '') {
            return 'Stock name cannot be empty.';
        }

        return false;
    }
}