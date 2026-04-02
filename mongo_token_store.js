'use strict';

var util = require('util');
var bcrypt = require('bcryptjs');
var TokenStore = require('passwordless-tokenstore');
var MongoClient = require('mongodb').MongoClient;

function MongoStore(connection, options) {
    if (arguments.length === 0 || typeof arguments[0] !== 'string') {
        throw new Error('A valid connection string has to be provided');
    }

    TokenStore.call(this);

    this._options = options || {};
    this._collectionName = 'passwordless-token';
    this._uri = connection;
    this._client = null;
    this._collection = null;
}

util.inherits(MongoStore, TokenStore);

MongoStore.prototype.authenticate = function(token, uid, callback) {
    if (!token || !uid || !callback) {
        throw new Error('TokenStore.authenticate called with invalid parameters');
    }

    this._getCollection(function(err, collection) {
        if (err) {
            return callback(err, false, null);
        }

        collection.findOne({ uid: uid, ttl: { $gt: new Date() } })
            .then(function(item) {
                if (!item) {
                    callback(null, false, null);
                    return;
                }

                bcrypt.compare(token, item.hashedToken, function(compareErr, valid) {
                    if (compareErr) {
                        callback(compareErr, false, null);
                    } else if (valid) {
                        callback(null, true, item.originUrl);
                    } else {
                        callback(null, false, null);
                    }
                });
            })
            .catch(function(findErr) {
                callback(findErr, false, null);
            });
    });
};

MongoStore.prototype.storeOrUpdate = function(token, uid, msToLive, originUrl, callback) {
    if (!token || !uid || !msToLive || !callback) {
        throw new Error('TokenStore.storeOrUpdate called with invalid parameters');
    }

    this._getCollection(function(err, collection) {
        if (err) {
            return callback(err);
        }

        bcrypt.hash(token, 10, function(hashErr, hashedToken) {
            if (hashErr) {
                callback(hashErr);
                return;
            }

            collection.replaceOne(
                { uid: uid },
                {
                    hashedToken: hashedToken,
                    uid: uid,
                    ttl: new Date(Date.now() + msToLive),
                    originUrl: originUrl
                },
                { upsert: true }
            ).then(function() {
                callback();
            }).catch(function(writeErr) {
                callback(writeErr);
            });
        });
    });
};

MongoStore.prototype.invalidateUser = function(uid, callback) {
    if (!uid || !callback) {
        throw new Error('TokenStore.invalidateUser called with invalid parameters');
    }

    this._getCollection(function(err, collection) {
        if (err) {
            return callback(err);
        }

        collection.deleteMany({ uid: uid })
            .then(function() {
                callback();
            })
            .catch(function(deleteErr) {
                callback(deleteErr);
            });
    });
};

MongoStore.prototype.clear = function(callback) {
    if (!callback) {
        throw new Error('TokenStore.clear called with invalid parameters');
    }

    this._getCollection(function(err, collection) {
        if (err) {
            return callback(err);
        }

        collection.deleteMany({})
            .then(function() {
                callback();
            })
            .catch(function(deleteErr) {
                callback(deleteErr);
            });
    });
};

MongoStore.prototype.length = function(callback) {
    this._getCollection(function(err, collection) {
        if (err) {
            callback(err);
            return;
        }

        collection.countDocuments({})
            .then(function(count) {
                callback(null, count);
            })
            .catch(function(countErr) {
                callback(countErr);
            });
    });
};

MongoStore.prototype._getCollection = function(callback) {
    var self = this;

    if (self._collection) {
        callback(null, self._collection);
        return;
    }

    self._connect(function(err, client) {
        if (err) {
            callback(err);
            return;
        }

        var dbName;

        try {
            dbName = new URL(self._uri).pathname.replace(/^\//, '') || undefined;
        } catch (parseErr) {
            callback(parseErr);
            return;
        }

        if (!dbName) {
            callback(new Error('MongoDB URI must include a database name'));
            return;
        }

        self._collection = client.db(dbName).collection(self._collectionName);
        self._ensureIndex(function(indexErr) {
            callback(indexErr, self._collection);
        });
    });
};

MongoStore.prototype._connect = function(callback) {
    var self = this;

    if (self._client) {
        callback(null, self._client);
        return;
    }

    MongoClient.connect(self._uri)
        .then(function(client) {
            self._client = client;
            callback(null, client);
        })
        .catch(function(err) {
            callback(err);
        });
};

MongoStore.prototype._ensureIndex = function(callback) {
    this._collection.createIndex({ ttl: 1 }, { expireAfterSeconds: 0 })
        .then(function() {
            callback(null);
        })
        .catch(function(err) {
            callback(err);
        });
};

module.exports = MongoStore;
