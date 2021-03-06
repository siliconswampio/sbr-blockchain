"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
var rlp = __importStar(require("rlp"));
var sbr_util_1 = require("sbr-util");
var block_1 = require("@sbr/block");
var cache_1 = __importDefault(require("./cache"));
var operation_1 = require("./operation");
var level = require('level-mem');
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
var DBManager = /** @class */ (function () {
    function DBManager(db, common) {
        this._db = db;
        this._common = common;
        this._cache = {
            td: new cache_1.default({ max: 1024 }),
            header: new cache_1.default({ max: 512 }),
            body: new cache_1.default({ max: 256 }),
            numberToHash: new cache_1.default({ max: 2048 }),
            hashToNumber: new cache_1.default({ max: 2048 }),
        };
    }
    /**
     * Fetches iterator heads from the db.
     */
    DBManager.prototype.getHeads = function () {
        return __awaiter(this, void 0, void 0, function () {
            var heads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(operation_1.DBTarget.Heads)];
                    case 1:
                        heads = _a.sent();
                        Object.keys(heads).forEach(function (key) {
                            heads[key] = Buffer.from(heads[key]);
                        });
                        return [2 /*return*/, heads];
                }
            });
        });
    };
    /**
     * Fetches header of the head block.
     */
    DBManager.prototype.getHeadHeader = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get(operation_1.DBTarget.HeadHeader)];
            });
        });
    };
    /**
     * Fetches head block.
     */
    DBManager.prototype.getHeadBlock = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.get(operation_1.DBTarget.HeadBlock)];
            });
        });
    };
    /**
     * Fetches clique signers.
     */
    DBManager.prototype.getCliqueLatestSignerStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signerStates, states, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get(operation_1.DBTarget.CliqueSignerStates)];
                    case 1:
                        signerStates = _a.sent();
                        states = rlp.decode(signerStates);
                        return [2 /*return*/, states.map(function (state) {
                                var blockNum = new sbr_util_1.BN(state[0]);
                                var addrs = state[1].map(function (buf) { return new sbr_util_1.Address(buf); });
                                return [blockNum, addrs];
                            })];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.type === 'NotFoundError') {
                            return [2 /*return*/, []];
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches clique votes.
     */
    DBManager.prototype.getCliqueLatestVotes = function () {
        return __awaiter(this, void 0, void 0, function () {
            var signerVotes, votes, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get(operation_1.DBTarget.CliqueVotes)];
                    case 1:
                        signerVotes = _a.sent();
                        votes = rlp.decode(signerVotes);
                        return [2 /*return*/, votes.map(function (vote) {
                                var blockNum = new sbr_util_1.BN(vote[0]);
                                var signer = new sbr_util_1.Address(vote[1][0]);
                                var beneficiary = new sbr_util_1.Address(vote[1][1]);
                                var nonce = vote[1][2];
                                return [blockNum, [signer, beneficiary, nonce]];
                            })];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2.type === 'NotFoundError') {
                            return [2 /*return*/, []];
                        }
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches snapshot of clique signers.
     */
    DBManager.prototype.getCliqueLatestBlockSigners = function () {
        return __awaiter(this, void 0, void 0, function () {
            var blockSigners, signers, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.get(operation_1.DBTarget.CliqueBlockSigners)];
                    case 1:
                        blockSigners = _a.sent();
                        signers = rlp.decode(blockSigners);
                        return [2 /*return*/, signers.map(function (s) {
                                var blockNum = new sbr_util_1.BN(s[0]);
                                var signer = new sbr_util_1.Address(s[1]);
                                return [blockNum, signer];
                            })];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3.type === 'NotFoundError') {
                            return [2 /*return*/, []];
                        }
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    DBManager.prototype.getBlock = function (blockId) {
        return __awaiter(this, void 0, void 0, function () {
            var number, hash, header, body, error_4, blockData, opts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof blockId === 'number' && Number.isInteger(blockId)) {
                            blockId = new sbr_util_1.BN(blockId);
                        }
                        if (!Buffer.isBuffer(blockId)) return [3 /*break*/, 2];
                        hash = blockId;
                        return [4 /*yield*/, this.hashToNumber(blockId)];
                    case 1:
                        number = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        if (!sbr_util_1.BN.isBN(blockId)) return [3 /*break*/, 4];
                        number = blockId;
                        return [4 /*yield*/, this.numberToHash(blockId)];
                    case 3:
                        hash = _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error('Unknown blockId type');
                    case 5: return [4 /*yield*/, this.getHeader(hash, number)];
                    case 6:
                        header = (_a.sent()).raw();
                        body = [[], []];
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.getBody(hash, number)];
                    case 8:
                        body = _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        error_4 = _a.sent();
                        if (error_4.type !== 'NotFoundError') {
                            throw error_4;
                        }
                        return [3 /*break*/, 10];
                    case 10:
                        blockData = __spread([header], body);
                        opts = { common: this._common, hardforkByBlockNumber: true };
                        return [2 /*return*/, block_1.Block.fromValuesArray(blockData, opts)];
                }
            });
        });
    };
    /**
     * Fetches body of a block given its hash and number.
     */
    DBManager.prototype.getBody = function (blockHash, blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(operation_1.DBTarget.Body, { blockHash: blockHash, blockNumber: blockNumber })];
                    case 1:
                        body = _a.sent();
                        return [2 /*return*/, rlp.decode(body)];
                }
            });
        });
    };
    /**
     * Fetches header of a block given its hash and number.
     */
    DBManager.prototype.getHeader = function (blockHash, blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var encodedHeader, opts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(operation_1.DBTarget.Header, { blockHash: blockHash, blockNumber: blockNumber })];
                    case 1:
                        encodedHeader = _a.sent();
                        opts = { common: this._common, hardforkByBlockNumber: true };
                        return [2 /*return*/, block_1.BlockHeader.fromRLPSerializedHeader(encodedHeader, opts)];
                }
            });
        });
    };
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    DBManager.prototype.getTotalDifficulty = function (blockHash, blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var td;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(operation_1.DBTarget.TotalDifficulty, { blockHash: blockHash, blockNumber: blockNumber })];
                    case 1:
                        td = _a.sent();
                        return [2 /*return*/, new sbr_util_1.BN(rlp.decode(td))];
                }
            });
        });
    };
    /**
     * Performs a block hash to block number lookup.
     */
    DBManager.prototype.hashToNumber = function (blockHash) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get(operation_1.DBTarget.HashToNumber, { blockHash: blockHash })];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, new sbr_util_1.BN(value)];
                }
            });
        });
    };
    /**
     * Performs a block number to block hash lookup.
     */
    DBManager.prototype.numberToHash = function (blockNumber) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (blockNumber.ltn(0)) {
                    throw new level.errors.NotFoundError();
                }
                return [2 /*return*/, this.get(operation_1.DBTarget.NumberToHash, { blockNumber: blockNumber })];
            });
        });
    };
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    DBManager.prototype.get = function (dbOperationTarget, key) {
        return __awaiter(this, void 0, void 0, function () {
            var dbGetOperation, cacheString, dbKey, dbOpts, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dbGetOperation = operation_1.DBOp.get(dbOperationTarget, key);
                        cacheString = dbGetOperation.cacheString;
                        dbKey = dbGetOperation.baseDBOp.key;
                        dbOpts = dbGetOperation.baseDBOp;
                        if (!cacheString) return [3 /*break*/, 3];
                        if (!this._cache[cacheString]) {
                            throw new Error("Invalid cache: " + cacheString);
                        }
                        value = this._cache[cacheString].get(dbKey);
                        if (!!value) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._db.get(dbKey, dbOpts)];
                    case 1:
                        value = (_a.sent());
                        this._cache[cacheString].set(dbKey, value);
                        _a.label = 2;
                    case 2: return [2 /*return*/, value];
                    case 3: return [2 /*return*/, this._db.get(dbKey, dbOpts)];
                }
            });
        });
    };
    /**
     * Performs a batch operation on db.
     */
    DBManager.prototype.batch = function (ops) {
        return __awaiter(this, void 0, void 0, function () {
            var convertedOps;
            var _this = this;
            return __generator(this, function (_a) {
                convertedOps = ops.map(function (op) { return op.baseDBOp; });
                // update the current cache for each operation
                ops.map(function (op) { return op.updateCache(_this._cache); });
                return [2 /*return*/, this._db.batch(convertedOps)];
            });
        });
    };
    return DBManager;
}());
exports.DBManager = DBManager;
//# sourceMappingURL=manager.js.map