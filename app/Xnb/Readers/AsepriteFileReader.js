const BaseReader = require('./BaseReader');
const BufferReader = require('../../BufferReader');
const BufferWriter = require('../../BufferWriter');
const Int32Reader = require('./Int32Reader');
const BooleanReader = require('./BooleanReader');
const StringReader = require('./StringReader');

/**
 * AsepriteFile Reader
 * Reads MonoGame.Aseprite AsepriteFile content type.
 * 
 * Binary format:
 * - string: name (asset name)
 * - bool: premultiplyAlpha flag
 * - int32: data length
 * - byte[]: raw .aseprite file bytes
 * 
 * @class
 * @extends BaseReader
 */
class AsepriteFileReader extends BaseReader {
    /**
     * Reads AsepriteFile from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
    read(buffer, resolver) {
        const stringReader = new StringReader();
        const booleanReader = new BooleanReader();
        const int32Reader = new Int32Reader();

        // Read the asset name
        const name = stringReader.read(buffer);
        // Read the premultiply alpha flag
        const premultiplyAlpha = booleanReader.read(buffer);
        // Read the size of the data block
        const size = int32Reader.read(buffer);
        // Read the raw aseprite file data
        const data = buffer.read(size);

        // Return the data with export marker for Porter.js
        return {
            name,
            premultiplyAlpha,
            export: {
                type: this.type,
                data
            }
        };
    }

    /**
     * Writes AsepriteFile into buffer.
     * @param {BufferWriter} buffer
     * @param {object} content
     * @param {ReaderResolver} resolver
     */
    write(buffer, content, resolver) {
        const stringReader = new StringReader();
        const booleanReader = new BooleanReader();
        const int32Reader = new Int32Reader();

        // Write the type index
        this.writeIndex(buffer, resolver);

        // Write the asset name
        stringReader.write(buffer, content.name, null);
        // Write the premultiply alpha flag
        booleanReader.write(buffer, content.premultiplyAlpha, null);
        // Write the data length and data
        int32Reader.write(buffer, content.data.length, null);
        buffer.concat(content.data);
    }

    isValueType() {
        return false;
    }
}

module.exports = AsepriteFileReader;
