/**
 * LZ4 compression/decompression wrapper using lz4js (pure JavaScript implementation).
 * @module Presser/Lz4
 */

const lz4js = require('lz4js');

// Hash table size for LZ4 compression (1 << 16 = 65536)
const HASH_SIZE = 65536;

/**
 * Creates a fresh hash table for LZ4 compression.
 * @returns {Uint32Array}
 */
const createHashTable = () => new Uint32Array(HASH_SIZE);

/**
 * LZ4 compression and decompression utilities.
 * @class
 */
class Lz4 {
    /**
     * Decodes an LZ4 compressed block.
     * @param {Buffer} input - The compressed input buffer.
     * @param {Buffer} output - The output buffer to write decompressed data to.
     * @returns {number} The number of bytes written to output.
     */
    static decodeBlock(input, output) {
        return lz4js.decompressBlock(input, output, 0, input.length, 0);
    }

    /**
     * Encodes a block using LZ4 compression.
     * @param {Buffer} input - The uncompressed input buffer.
     * @param {Buffer} output - The output buffer to write compressed data to.
     * @returns {number} The number of compressed bytes written.
     */
    static encodeBlock(input, output) {
        const hashTable = createHashTable();
        return lz4js.compressBlock(input, output, 0, input.length, hashTable);
    }

    /**
     * Returns the maximum output size for a given input size when compressing.
     * @param {number} inputSize - The size of the input data.
     * @returns {number} The maximum possible compressed size.
     */
    static encodeBound(inputSize) {
        if (lz4js.compressBound) {
            return lz4js.compressBound(inputSize);
        }
        // Fallback calculation if compressBound is not available
        return inputSize + Math.ceil(inputSize / 255) + 16;
    }
}

module.exports = Lz4;
