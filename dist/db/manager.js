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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
const rlp = __importStar(require("rlp"));
const sbr_util_1 = require("sbr-util");
const block_1 = require("@sbr/block");
const cache_1 = __importDefault(require("./cache"));
const operation_1 = require("./operation");
const level = require('level-mem');
/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
class DBManager {
    constructor(db, common) {
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
    async getHeads() {
        const heads = await this.get(operation_1.DBTarget.Heads);
        Object.keys(heads).forEach((key) => {
            heads[key] = Buffer.from(heads[key]);
        });
        return heads;
    }
    /**
     * Fetches header of the head block.
     */
    async getHeadHeader() {
        return this.get(operation_1.DBTarget.HeadHeader);
    }
    /**
     * Fetches head block.
     */
    async getHeadBlock() {
        return this.get(operation_1.DBTarget.HeadBlock);
    }
    /**
     * Fetches clique signers.
     */
    async getCliqueLatestSignerStates() {
        try {
            const signerStates = await this.get(operation_1.DBTarget.CliqueSignerStates);
            const states = rlp.decode(signerStates);
            return states.map((state) => {
                const blockNum = new sbr_util_1.BN(state[0]);
                const addrs = state[1].map((buf) => new sbr_util_1.Address(buf));
                return [blockNum, addrs];
            });
        }
        catch (error) {
            if (error.type === 'NotFoundError') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Fetches clique votes.
     */
    async getCliqueLatestVotes() {
        try {
            const signerVotes = await this.get(operation_1.DBTarget.CliqueVotes);
            const votes = rlp.decode(signerVotes);
            return votes.map((vote) => {
                const blockNum = new sbr_util_1.BN(vote[0]);
                const signer = new sbr_util_1.Address(vote[1][0]);
                const beneficiary = new sbr_util_1.Address(vote[1][1]);
                const nonce = vote[1][2];
                return [blockNum, [signer, beneficiary, nonce]];
            });
        }
        catch (error) {
            if (error.type === 'NotFoundError') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Fetches snapshot of clique signers.
     */
    async getCliqueLatestBlockSigners() {
        try {
            const blockSigners = await this.get(operation_1.DBTarget.CliqueBlockSigners);
            const signers = rlp.decode(blockSigners);
            return signers.map((s) => {
                const blockNum = new sbr_util_1.BN(s[0]);
                const signer = new sbr_util_1.Address(s[1]);
                return [blockNum, signer];
            });
        }
        catch (error) {
            if (error.type === 'NotFoundError') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Fetches a block (header and body) given a block id,
     * which can be either its hash or its number.
     */
    async getBlock(blockId) {
        if (typeof blockId === 'number' && Number.isInteger(blockId)) {
            blockId = new sbr_util_1.BN(blockId);
        }
        let number;
        let hash;
        if (Buffer.isBuffer(blockId)) {
            hash = blockId;
            number = await this.hashToNumber(blockId);
        }
        else if (sbr_util_1.BN.isBN(blockId)) {
            number = blockId;
            hash = await this.numberToHash(blockId);
        }
        else {
            throw new Error('Unknown blockId type');
        }
        const header = (await this.getHeader(hash, number)).raw();
        let body = [[], []];
        try {
            body = await this.getBody(hash, number);
        }
        catch (error) {
            if (error.type !== 'NotFoundError') {
                throw error;
            }
        }
        const blockData = [header, ...body];
        const opts = { common: this._common, hardforkByBlockNumber: true };
        return block_1.Block.fromValuesArray(blockData, opts);
    }
    /**
     * Fetches body of a block given its hash and number.
     */
    async getBody(blockHash, blockNumber) {
        const body = await this.get(operation_1.DBTarget.Body, { blockHash, blockNumber });
        return rlp.decode(body);
    }
    /**
     * Fetches header of a block given its hash and number.
     */
    async getHeader(blockHash, blockNumber) {
        const encodedHeader = await this.get(operation_1.DBTarget.Header, { blockHash, blockNumber });
        const opts = { common: this._common, hardforkByBlockNumber: true };
        return block_1.BlockHeader.fromRLPSerializedHeader(encodedHeader, opts);
    }
    /**
     * Fetches total difficulty for a block given its hash and number.
     */
    async getTotalDifficulty(blockHash, blockNumber) {
        const td = await this.get(operation_1.DBTarget.TotalDifficulty, { blockHash, blockNumber });
        return new sbr_util_1.BN(rlp.decode(td));
    }
    /**
     * Performs a block hash to block number lookup.
     */
    async hashToNumber(blockHash) {
        const value = await this.get(operation_1.DBTarget.HashToNumber, { blockHash });
        return new sbr_util_1.BN(value);
    }
    /**
     * Performs a block number to block hash lookup.
     */
    async numberToHash(blockNumber) {
        if (blockNumber.ltn(0)) {
            throw new level.errors.NotFoundError();
        }
        return this.get(operation_1.DBTarget.NumberToHash, { blockNumber });
    }
    /**
     * Fetches a key from the db. If `opts.cache` is specified
     * it first tries to load from cache, and on cache miss will
     * try to put the fetched item on cache afterwards.
     */
    async get(dbOperationTarget, key) {
        const dbGetOperation = operation_1.DBOp.get(dbOperationTarget, key);
        const cacheString = dbGetOperation.cacheString;
        const dbKey = dbGetOperation.baseDBOp.key;
        const dbOpts = dbGetOperation.baseDBOp;
        if (cacheString) {
            if (!this._cache[cacheString]) {
                throw new Error(`Invalid cache: ${cacheString}`);
            }
            let value = this._cache[cacheString].get(dbKey);
            if (!value) {
                value = await this._db.get(dbKey, dbOpts);
                this._cache[cacheString].set(dbKey, value);
            }
            return value;
        }
        return this._db.get(dbKey, dbOpts);
    }
    /**
     * Performs a batch operation on db.
     */
    async batch(ops) {
        const convertedOps = ops.map((op) => op.baseDBOp);
        // update the current cache for each operation
        ops.map((op) => op.updateCache(this._cache));
        return this._db.batch(convertedOps);
    }
}
exports.DBManager = DBManager;
//# sourceMappingURL=manager.js.map