"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBOp = exports.DBTarget = void 0;
var constants_1 = require("./constants");
var DBTarget;
(function (DBTarget) {
    DBTarget[DBTarget["Heads"] = 0] = "Heads";
    DBTarget[DBTarget["HeadHeader"] = 1] = "HeadHeader";
    DBTarget[DBTarget["HeadBlock"] = 2] = "HeadBlock";
    DBTarget[DBTarget["HashToNumber"] = 3] = "HashToNumber";
    DBTarget[DBTarget["NumberToHash"] = 4] = "NumberToHash";
    DBTarget[DBTarget["TotalDifficulty"] = 5] = "TotalDifficulty";
    DBTarget[DBTarget["Body"] = 6] = "Body";
    DBTarget[DBTarget["Header"] = 7] = "Header";
    DBTarget[DBTarget["CliqueSignerStates"] = 8] = "CliqueSignerStates";
    DBTarget[DBTarget["CliqueVotes"] = 9] = "CliqueVotes";
    DBTarget[DBTarget["CliqueBlockSigners"] = 10] = "CliqueBlockSigners";
})(DBTarget = exports.DBTarget || (exports.DBTarget = {}));
/**
 * The DBOp class aids creating database operations which is used by `level` using a more high-level interface
 */
var DBOp = /** @class */ (function () {
    function DBOp(operationTarget, key) {
        this.operationTarget = operationTarget;
        this.baseDBOp = {
            key: '',
            keyEncoding: 'binary',
            valueEncoding: 'binary',
        };
        switch (operationTarget) {
            case DBTarget.Heads: {
                this.baseDBOp.key = constants_1.HEADS_KEY;
                this.baseDBOp.valueEncoding = 'json';
                break;
            }
            case DBTarget.HeadHeader: {
                this.baseDBOp.key = constants_1.HEAD_HEADER_KEY;
                break;
            }
            case DBTarget.HeadBlock: {
                this.baseDBOp.key = constants_1.HEAD_BLOCK_KEY;
                break;
            }
            case DBTarget.HashToNumber: {
                this.baseDBOp.key = constants_1.hashToNumberKey(key.blockHash);
                this.cacheString = 'hashToNumber';
                break;
            }
            case DBTarget.NumberToHash: {
                this.baseDBOp.key = constants_1.numberToHashKey(key.blockNumber);
                this.cacheString = 'numberToHash';
                break;
            }
            case DBTarget.TotalDifficulty: {
                this.baseDBOp.key = constants_1.tdKey(key.blockNumber, key.blockHash);
                this.cacheString = 'td';
                break;
            }
            case DBTarget.Body: {
                this.baseDBOp.key = constants_1.bodyKey(key.blockNumber, key.blockHash);
                this.cacheString = 'body';
                break;
            }
            case DBTarget.Header: {
                this.baseDBOp.key = constants_1.headerKey(key.blockNumber, key.blockHash);
                this.cacheString = 'header';
                break;
            }
            case DBTarget.CliqueSignerStates: {
                this.baseDBOp.key = constants_1.CLIQUE_SIGNERS_KEY;
                break;
            }
            case DBTarget.CliqueVotes: {
                this.baseDBOp.key = constants_1.CLIQUE_VOTES_KEY;
                break;
            }
            case DBTarget.CliqueBlockSigners: {
                this.baseDBOp.key = constants_1.CLIQUE_BLOCK_SIGNERS_KEY;
                break;
            }
        }
    }
    DBOp.get = function (operationTarget, key) {
        return new DBOp(operationTarget, key);
    };
    // set operation: note: value/key is not in default order
    DBOp.set = function (operationTarget, value, key) {
        var dbOperation = new DBOp(operationTarget, key);
        dbOperation.baseDBOp.value = value;
        dbOperation.baseDBOp.type = 'put';
        if (operationTarget == DBTarget.Heads) {
            dbOperation.baseDBOp.valueEncoding = 'json';
        }
        else {
            dbOperation.baseDBOp.valueEncoding = 'binary';
        }
        return dbOperation;
    };
    DBOp.del = function (operationTarget, key) {
        var dbOperation = new DBOp(operationTarget, key);
        dbOperation.baseDBOp.type = 'del';
        return dbOperation;
    };
    DBOp.prototype.updateCache = function (cacheMap) {
        if (this.cacheString && cacheMap[this.cacheString] && Buffer.isBuffer(this.baseDBOp.value)) {
            if (this.baseDBOp.type == 'put') {
                cacheMap[this.cacheString].set(this.baseDBOp.key, this.baseDBOp.value);
            }
            else if (this.baseDBOp.type == 'del') {
                cacheMap[this.cacheString].del(this.baseDBOp.key);
            }
            else {
                throw new Error('unsupported db operation on cache');
            }
        }
    };
    return DBOp;
}());
exports.DBOp = DBOp;
//# sourceMappingURL=operation.js.map