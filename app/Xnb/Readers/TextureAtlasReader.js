const BaseReader = require('./BaseReader');
const StringReader = require('./StringReader');
const Int32Reader = require('./Int32Reader');
const RectangleReader = require('./RectangleReader');

/**
 * TextureAtlas Reader for MonoGame.Aseprite TextureAtlas type.
 * 
 * Binary format:
 * - string: name (atlas name)
 * - Texture2D: texture (via resolver)
 * - int32: regionCount
 * - for each region:
 *   - string: name
 *   - Rectangle: bounds (x, y, width, height)
 * 
 * @class
 * @extends BaseReader
 */
class TextureAtlasReader extends BaseReader {
    /**
     * Reads TextureAtlas from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
    read(buffer, resolver) {
        const stringReader = new StringReader();
        const int32Reader = new Int32Reader();
        const rectangleReader = new RectangleReader();

        // Read the atlas name
        const name = stringReader.read(buffer);

        // Read the texture via resolver (Texture2D)
        const texture = resolver.read(buffer);

        // Read region count
        const regionCount = int32Reader.read(buffer);

        // Read all regions
        const regions = [];
        for (let i = 0; i < regionCount; i++) {
            const regionName = stringReader.read(buffer);
            const bounds = rectangleReader.read(buffer);
            regions.push({
                name: regionName,
                bounds
            });
        }

        return {
            name,
            texture,
            regions
        };
    }

    /**
     * Writes TextureAtlas into buffer.
     * @param {BufferWriter} buffer
     * @param {object} content
     * @param {ReaderResolver} resolver
     */
    write(buffer, content, resolver) {
        const stringReader = new StringReader();
        const int32Reader = new Int32Reader();
        const rectangleReader = new RectangleReader();
        const Texture2DReader = require('./Texture2DReader');
        const texture2DReader = new Texture2DReader();

        // Write the type index
        this.writeIndex(buffer, resolver);

        // Write the atlas name
        stringReader.write(buffer, content.name, null);

        // Write the texture
        texture2DReader.write(buffer, content.texture, resolver);

        // Write region count
        int32Reader.write(buffer, content.regions.length, null);

        // Write all regions
        for (const region of content.regions) {
            stringReader.write(buffer, region.name, null);
            rectangleReader.write(buffer, region.bounds, null);
        }
    }

    isValueType() {
        return false;
    }
}

module.exports = TextureAtlasReader;
