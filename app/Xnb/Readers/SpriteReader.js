const BaseReader = require('./BaseReader');
const BufferReader = require('../../BufferReader');
const BufferWriter = require('../../BufferWriter');
const StringReader = require('./StringReader');
const Texture2DReader = require('./Texture2DReader');

/**
 * Sprite Reader for MonoGame.Aseprite Sprite type.
 * 
 * Binary format:
 * - string: name (sprite name)
 * - Texture2D: inline texture data (via Texture2DReader)
 * 
 * @class
 * @extends BaseReader
 */
class SpriteReader extends BaseReader {
    /**
     * Reads Sprite from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
    read(buffer, resolver) {
        const stringReader = new StringReader();

        // Read the sprite name
        const name = stringReader.read(buffer);

        // Read the texture via resolver (Texture2D)
        const texture = resolver.read(buffer);

        return {
            name,
            texture
        };
    }

    /**
     * Writes Sprite into buffer.
     * @param {BufferWriter} buffer
     * @param {object} content
     * @param {ReaderResolver} resolver
     */
    write(buffer, content, resolver) {
        const stringReader = new StringReader();
        const texture2DReader = new Texture2DReader();

        // Write the type index
        this.writeIndex(buffer, resolver);

        // Write the sprite name
        stringReader.write(buffer, content.name, null);

        // Write the texture via Texture2DReader
        texture2DReader.write(buffer, content.texture, resolver);
    }

    isValueType() {
        return false;
    }
}

module.exports = SpriteReader;
