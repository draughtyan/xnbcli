const BaseReader = require('./BaseReader');
const StringReader = require('./StringReader');
const Int32Reader = require('./Int32Reader');
const BooleanReader = require('./BooleanReader');
const RectangleReader = require('./RectangleReader');

/**
 * SpriteSheet Reader for MonoGame.Aseprite SpriteSheet type.
 * 
 * Binary format:
 * - string: name (spritesheet name)
 * - TextureAtlas (inline):
 *   - string: atlasName
 *   - Texture2D: texture (via resolver)
 *   - int32: regionCount
 *   - for each region:
 *     - string: name
 *     - Rectangle: bounds (x, y, width, height)
 * - int32: animationTagCount
 * - for each tag:
 *   - string: name
 *   - int32: loopCount
 *   - bool: isReversed
 *   - bool: isPingPong
 *   - int32: frameCount
 *   - for each frame:
 *     - int32: frameIndex
 *     - double: durationMilliseconds
 * 
 * @class
 * @extends BaseReader
 */
class SpriteSheetReader extends BaseReader {
    /**
     * Reads SpriteSheet from buffer.
     * @param {BufferReader} buffer
     * @param {ReaderResolver} resolver
     * @returns {object}
     */
    read(buffer, resolver) {
        const stringReader = new StringReader();
        const int32Reader = new Int32Reader();
        const boolReader = new BooleanReader();
        const rectangleReader = new RectangleReader();

        // Read the spritesheet name
        const name = stringReader.read(buffer);

        // Read TextureAtlas inline: atlas name
        const atlasName = stringReader.read(buffer);
        
        // Read the texture via resolver (Texture2D)
        const texture = resolver.read(buffer);

        // Read region count
        const regionCount = int32Reader.read(buffer);

        // Read all regions
        const regions = [];
        for (let i = 0; i < regionCount; i++) {
            const regionName = stringReader.read(buffer);
            const bounds = rectangleReader.read(buffer);
            
            // Read slice count (slices per region, typically 0)
            const sliceCount = int32Reader.read(buffer);
            const slices = [];
            for (let s = 0; s < sliceCount; s++) {
                // Slice format: name, bounds (Rectangle), origin (Vector2), color (Color as 4 bytes)
                const sliceName = stringReader.read(buffer);
                const sliceBounds = rectangleReader.read(buffer);
                const originX = buffer.readSingle();
                const originY = buffer.readSingle();
                const colorR = buffer.readByte();
                const colorG = buffer.readByte();
                const colorB = buffer.readByte();
                const colorA = buffer.readByte();
                slices.push({
                    name: sliceName,
                    bounds: sliceBounds,
                    origin: { x: originX, y: originY },
                    color: { r: colorR, g: colorG, b: colorB, a: colorA }
                });
            }
            
            regions.push({
                name: regionName,
                bounds,
                slices
            });
        }

        // Read animation tag count
        const animationTagCount = int32Reader.read(buffer);

        // Read all animation tags
        const animationTags = [];
        for (let i = 0; i < animationTagCount; i++) {
            const tagName = stringReader.read(buffer);
            const loopCount = int32Reader.read(buffer);
            const isReversed = boolReader.read(buffer);
            const isPingPong = boolReader.read(buffer);
            
            // Read frames
            const frameCount = int32Reader.read(buffer);
            const frames = [];
            for (let j = 0; j < frameCount; j++) {
                const frameIndex = int32Reader.read(buffer);
                const durationMs = int32Reader.read(buffer); // Duration in milliseconds as int32
                frames.push({
                    frameIndex,
                    durationMs
                });
            }

            animationTags.push({
                name: tagName,
                loopCount,
                isReversed,
                isPingPong,
                frames
            });
        }

        return {
            name,
            textureAtlas: {
                name: atlasName,
                texture,
                regions
            },
            animationTags
        };
    }

    /**
     * Writes SpriteSheet into buffer.
     * @param {BufferWriter} buffer
     * @param {object} content
     * @param {ReaderResolver} resolver
     */
    write(buffer, content, resolver) {
        const stringReader = new StringReader();
        const int32Reader = new Int32Reader();
        const boolReader = new BooleanReader();
        const rectangleReader = new RectangleReader();
        const Texture2DReader = require('./Texture2DReader');
        const texture2DReader = new Texture2DReader();

        // Write the type index
        this.writeIndex(buffer, resolver);

        // Write the spritesheet name
        stringReader.write(buffer, content.name, null);

        // Write TextureAtlas inline
        stringReader.write(buffer, content.textureAtlas.name, null);
        
        // Write the texture
        texture2DReader.write(buffer, content.textureAtlas.texture, resolver);

        // Write region count
        int32Reader.write(buffer, content.textureAtlas.regions.length, null);

        // Write all regions
        for (const region of content.textureAtlas.regions) {
            stringReader.write(buffer, region.name, null);
            rectangleReader.write(buffer, region.bounds, null);
            
            // Write slice count (and slices if any)
            const slices = region.slices || [];
            int32Reader.write(buffer, slices.length, null);
            for (const slice of slices) {
                stringReader.write(buffer, slice.name, null);
                rectangleReader.write(buffer, slice.bounds, null);
                buffer.writeSingle(slice.origin.x);
                buffer.writeSingle(slice.origin.y);
                buffer.writeByte(slice.color.r);
                buffer.writeByte(slice.color.g);
                buffer.writeByte(slice.color.b);
                buffer.writeByte(slice.color.a);
            }
        }

        // Write animation tag count
        int32Reader.write(buffer, content.animationTags.length, null);

        // Write all animation tags
        for (const tag of content.animationTags) {
            stringReader.write(buffer, tag.name, null);
            int32Reader.write(buffer, tag.loopCount, null);
            boolReader.write(buffer, tag.isReversed, null);
            boolReader.write(buffer, tag.isPingPong, null);

            // Write frames
            int32Reader.write(buffer, tag.frames.length, null);
            for (const frame of tag.frames) {
                int32Reader.write(buffer, frame.frameIndex, null);
                int32Reader.write(buffer, frame.durationMs, null); // Duration as int32 milliseconds
            }
        }
    }

    isValueType() {
        return false;
    }
}

module.exports = SpriteSheetReader;
