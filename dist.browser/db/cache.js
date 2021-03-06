"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lru_cache_1 = __importDefault(require("lru-cache"));
/**
 * Simple LRU Cache that allows for keys of type Buffer
 * @hidden
 */
var Cache = /** @class */ (function () {
    function Cache(opts) {
        this._cache = new lru_cache_1.default(opts);
    }
    Cache.prototype.set = function (key, value) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.set(key, value);
    };
    Cache.prototype.get = function (key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        return this._cache.get(key);
    };
    Cache.prototype.del = function (key) {
        if (key instanceof Buffer) {
            key = key.toString('hex');
        }
        this._cache.del(key);
    };
    return Cache;
}());
exports.default = Cache;
//# sourceMappingURL=cache.js.map