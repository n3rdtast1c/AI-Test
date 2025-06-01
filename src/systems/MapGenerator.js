/**
 * Fantasy Pixel Adventure
 * MapGenerator.js - Generates procedural map areas for quests and exploration.
 */

import { WORLD, PROC_GEN, QUEST, ASSETS } from '../utils/Constants.js';

// Tile type constants (example, should align with your tileset definitions)
const TILE_EMPTY = -1; // Or your engine's equivalent for no tile
const TILE_FLOOR = 0;  // Index from your generated tileset (e.g., a generic floor)
const TILE_WALL = 3;   // Index for a generic wall
const TILE_DOOR = 10;  // Example door tile index
const TILE_GRASS = 0;  // From town tileset
const TILE_DIRT = 1;   // From town tileset
const TILE_WATER = 2;  // From town tileset
const TILE_CAVE_FLOOR = 20; // Example, new tile index for cave floor
const TILE_CAVE_WALL = 21;  // Example, new tile index for cave wall
const TILE_OBJECTIVE = 50; // Example, a special tile for quest objectives

export class MapGenerator {
    constructor(scene) {
        this.scene = scene; // Phaser scene instance
        this.generatedAreas = new Map(); // Stores info about generated areas { id: areaData }
        this.nextAreaId = 1;

        // Placeholder for tileset mapping if generated maps use different tilesets
        // For now, assume a generic tileset or indices that map to existing ones.
        this.tilesetMapping = {
            'default_floor': TILE_FLOOR,
            'default_wall': TILE_WALL,
            'cave_floor': TILE_CAVE_FLOOR,
            'cave_wall': TILE_CAVE_WALL,
            'grass': TILE_GRASS,
            'dirt': TILE_DIRT,
            'water': TILE_WATER,
            // ... more mappings
        };

        console.log('MapGenerator initialized.');
    }

    /**
     * Main method to generate a new quest area.
     * @param {object} params - Parameters for generation (e.g., questId, theme, specificBuilding, difficulty).
     * @returns {object|null} Information about the generated area or null on failure.
     * Example params: { questId: 'Q1', theme: 'ruins', specificBuilding: 'building.small.abandoned', difficulty: 'easy', size: 'small' }
     */
    generateQuestArea(params) {
        const areaId = `gen_area_${this.nextAreaId++}`;
        let areaData = null;
        let areaName = params.locationNameHint || `Mysterious Area #${this.nextAreaId -1}`;

        const theme = params.theme || this.getThemeFromBuildingType(params.specificBuilding) || 'default';
        const size = params.size || this.getSizeFromDifficulty(params.difficulty) || 'medium'; // 'small', 'medium', 'large'

        console.log(`MapGenerator: Generating quest area. ID: ${areaId}, Theme: ${theme}, Size: ${size}, Building: ${params.specificBuilding}`);

        // Determine generation strategy based on theme/building type
        if (theme === 'cave' || (params.specificBuilding && params.specificBuilding.includes('cave'))) {
            areaName = params.locationNameHint || `Dark Cave for ${params.questId}`;
            areaData = this._generateCaveLayout(areaId, size, theme, params);
        } else if (params.specificBuilding && params.specificBuilding.startsWith('building.')) {
            areaName = params.locationNameHint || `${this.formatBuildingName(params.specificBuilding)} for ${params.questId}`;
            areaData = this._generateBuildingInterior(areaId, size, theme, params);
        } else {
            // Default to a small outdoor area or a generic room if type is unknown
            areaName = params.locationNameHint || `Clearing for ${params.questId}`;
            areaData = this._generateSmallOutdoorArea(areaId, size, theme, params);
        }

        if (!areaData || !areaData.tileData) {
            console.error(`MapGenerator: Failed to generate tile data for area ${areaId}.`);
            return null;
        }

        const generatedAreaInfo = {
            id: areaId,
            name: areaName,
            questId: params.questId,
            theme: theme,
            size: size,
            tileData: areaData.tileData, // 2D array of tile indices
            widthInTiles: areaData.widthInTiles,
            heightInTiles: areaData.heightInTiles,
            entryPoint: areaData.entryPoint || { x: 1, y: 1 }, // Default entry point
            exitPoint: areaData.exitPoint, // To return to the previous map { targetMapId: 'MainWorld', targetPos: {x, y} }
            objectives: areaData.objectives || [], // { type, pos, details }
            // We might need to create a new Phaser.Tilemaps.Tilemap object here or in the scene that uses this.
            // For now, we store the data. The scene loading this map will use `this.scene.make.tilemap({ data: tileData, ... })`
        };

        this._registerGeneratedArea(areaId, generatedAreaInfo);
        return generatedAreaInfo;
    }

    formatBuildingName(buildingTypeKey) {
        if (!buildingTypeKey) return "Mysterious Building";
        return buildingTypeKey.replace('building.', '').replace(/\./g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
    }

    /**
     * Generates a simple building interior (e.g., a few connected rooms).
     * @private
     */
    _generateBuildingInterior(areaId, size, theme, params) {
        let widthInTiles, heightInTiles;
        let numRooms;

        switch (size) {
            case 'small':
                widthInTiles = PROC_GEN.BUILDING_SMALL_W || 15;
                heightInTiles = PROC_GEN.BUILDING_SMALL_H || 10;
                numRooms = Phaser.Math.Between(1, 2);
                break;
            case 'medium':
                widthInTiles = PROC_GEN.BUILDING_MEDIUM_W || 25;
                heightInTiles = PROC_GEN.BUILDING_MEDIUM_H || 20;
                numRooms = Phaser.Math.Between(2, 4);
                break;
            case 'large':
                widthInTiles = PROC_GEN.BUILDING_LARGE_W || 40;
                heightInTiles = PROC_GEN.BUILDING_LARGE_H || 30;
                numRooms = Phaser.Math.Between(4, 6);
                break;
            default:
                widthInTiles = 20; heightInTiles = 15; numRooms = 2;
        }

        const tileData = this._createEmptyMap(widthInTiles, heightInTiles, this.tilesetMapping.default_wall);
        const rooms = [];
        let entryPoint = null;
        const objectives = [];

        // Create rooms
        for (let i = 0; i < numRooms; i++) {
            const roomW = Phaser.Math.Between(PROC_GEN.ROOM_MIN_SIZE || 4, PROC_GEN.ROOM_MAX_SIZE || 8);
            const roomH = Phaser.Math.Between(PROC_GEN.ROOM_MIN_SIZE || 4, PROC_GEN.ROOM_MAX_SIZE || 8);
            const roomX = Phaser.Math.Between(1, widthInTiles - roomW - 1);
            const roomY = Phaser.Math.Between(1, heightInTiles - roomH - 1);
            const newRoom = { x: roomX, y: roomY, width: roomW, height: roomH, id: i };

            // Check for overlap (simple check, can be improved)
            let overlaps = false;
            for (const room of rooms) {
                if (this._roomsOverlap(newRoom, room)) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps && i > 0) { // Allow first room to always place
                // i--; // Retry creating this room
                // continue;
                // For simplicity, we'll just skip if it overlaps too much, or allow some overlap
            }

            this._carveRoom(tileData, newRoom, this.tilesetMapping.default_floor);
            rooms.push(newRoom);

            if (i === 0) { // First room is entry point
                entryPoint = { x: roomX + Math.floor(roomW / 2), y: roomY + Math.floor(roomH / 2) };
            }

            // Connect to previous room (if any)
            if (i > 0 && rooms.length > 1) {
                this._connectRooms(tileData, rooms[i - 1], newRoom, this.tilesetMapping.default_floor, TILE_DOOR);
            }
        }
        
        // Place an objective in the last room
        if (rooms.length > 0 && params.questId) { // Only if tied to a quest
            const lastRoom = rooms[rooms.length - 1];
            const objX = lastRoom.x + Math.floor(lastRoom.width / 2);
            const objY = lastRoom.y + Math.floor(lastRoom.height / 2);
            if (tileData[objY][objX] === this.tilesetMapping.default_floor) { // Ensure it's on a floor tile
                tileData[objY][objX] = TILE_OBJECTIVE; // Special tile for objective
                objectives.push({
                    type: 'interact', // or 'item_pickup'
                    pos: { x: objX, y: objY },
                    details: `Objective for ${params.questId}`
                });
            }
        }


        // Ensure entry point is valid
        if (!entryPoint && rooms.length > 0) entryPoint = { x: rooms[0].x + 1, y: rooms[0].y + 1};
        if (!entryPoint) entryPoint = {x:1, y:1}; // Fallback
        if (tileData[entryPoint.y][entryPoint.x] === this.tilesetMapping.default_wall) {
            tileData[entryPoint.y][entryPoint.x] = this.tilesetMapping.default_floor; // Ensure entry is walkable
        }


        // Create an exit point, could be back at entry or a different spot
        const exitPoint = {
            targetMapId: params.returnMapId || 'MainWorld', // ID of the map to return to
            targetPos: params.returnPos || { x: 0, y: 0 }   // Coordinates on the return map
        };
        // For simplicity, let's assume the entry point also serves as the exit trigger for now.
        // A dedicated exit tile could be placed, e.g., in the first room.

        return { tileData, widthInTiles, heightInTiles, entryPoint, exitPoint, objectives };
    }

    _roomsOverlap(room1, room2, buffer = 1) {
        return room1.x < room2.x + room2.width + buffer &&
               room1.x + room1.width + buffer > room2.x &&
               room1.y < room2.y + room2.height + buffer &&
               room1.y + room1.height + buffer > room2.y;
    }

    _carveRoom(tileData, room, floorTile) {
        for (let y = room.y; y < room.y + room.height; y++) {
            for (let x = room.x; x < room.x + room.width; x++) {
                if (x > 0 && x < tileData[0].length -1 && y > 0 && y < tileData.length -1) { // Bounds check
                     tileData[y][x] = floorTile;
                }
            }
        }
    }

    _connectRooms(tileData, room1, room2, corridorTile, doorTile) {
        const c1x = room1.x + Math.floor(room1.width / 2);
        const c1y = room1.y + Math.floor(room1.height / 2);
        const c2x = room2.x + Math.floor(room2.width / 2);
        const c2y = room2.y + Math.floor(room2.height / 2);

        // Carve horizontal corridor
        for (let x = Math.min(c1x, c2x); x <= Math.max(c1x, c2x); x++) {
            if (tileData[c1y] && tileData[c1y][x] !== undefined) tileData[c1y][x] = corridorTile;
        }
        // Carve vertical corridor
        for (let y = Math.min(c1y, c2y); y <= Math.max(c1y, c2y); y++) {
             if (tileData[y] && tileData[y][c2x] !== undefined) tileData[y][c2x] = corridorTile;
        }

        // Place doors (simple placement at room edges along corridor path)
        // This needs refinement to ensure doors are on actual wall segments.
        // For now, a door is placed at the connection points.
        if (tileData[c1y] && tileData[c1y][c1x] !== undefined) tileData[c1y][c1x] = doorTile; // Door in room1 towards corridor
        if (tileData[c2y] && tileData[c2y][c2x] !== undefined) tileData[c2y][c2x] = doorTile; // Door in room2 towards corridor
    }


    /**
     * Generates a simple cave layout using random walk or cellular automata.
     * @private
     */
    _generateCaveLayout(areaId, size, theme, params) {
        let widthInTiles, heightInTiles;
        let iterations;

        switch (size) {
            case 'small':
                widthInTiles = PROC_GEN.CAVE_SMALL_W || 20;
                heightInTiles = PROC_GEN.CAVE_SMALL_H || 20;
                iterations = 3;
                break;
            case 'medium':
                widthInTiles = PROC_GEN.CAVE_MEDIUM_W || 35;
                heightInTiles = PROC_GEN.CAVE_MEDIUM_H || 35;
                iterations = 5;
                break;
            case 'large':
                widthInTiles = PROC_GEN.CAVE_LARGE_W || 50;
                heightInTiles = PROC_GEN.CAVE_LARGE_H || 50;
                iterations = 7;
                break;
            default:
                widthInTiles = 30; heightInTiles = 30; iterations = 4;
        }

        // Initialize with solid walls
        const tileData = this._createEmptyMap(widthInTiles, heightInTiles, this.tilesetMapping.cave_wall);

        // Cellular Automata for cave generation (simplified)
        // Step 1: Randomly place floor tiles
        for (let y = 1; y < heightInTiles - 1; y++) {
            for (let x = 1; x < widthInTiles - 1; x++) {
                if (Math.random() < (PROC_GEN.CAVE_FILL_PERCENT || 0.45)) {
                    tileData[y][x] = this.tilesetMapping.cave_floor;
                }
            }
        }

        // Step 2: Apply automata rules for several iterations
        for (let i = 0; i < iterations; i++) {
            const newTileData = tileData.map(arr => arr.slice()); // Create a copy
            for (let y = 1; y < heightInTiles - 1; y++) {
                for (let x = 1; x < widthInTiles - 1; x++) {
                    const wallNeighbors = this._countNeighbors(tileData, x, y, this.tilesetMapping.cave_wall);
                    if (tileData[y][x] === this.tilesetMapping.cave_wall) {
                        if (wallNeighbors < (PROC_GEN.CAVE_SMOOTH_WALL_MIN || 4)) newTileData[y][x] = this.tilesetMapping.cave_floor;
                    } else {
                        if (wallNeighbors > (PROC_GEN.CAVE_SMOOTH_FLOOR_MIN || 4)) newTileData[y][x] = this.tilesetMapping.cave_wall;
                    }
                }
            }
            tileData.splice(0, tileData.length, ...newTileData); // Replace original with smoothed
        }

        // Find a suitable entry point (a floor tile near an edge)
        let entryPoint = null;
        for (let y = 1; y < heightInTiles -1; y++) {
            if (tileData[y][1] === this.tilesetMapping.cave_floor) { entryPoint = {x:1, y:y}; break; }
            if (tileData[y][widthInTiles-2] === this.tilesetMapping.cave_floor) { entryPoint = {x:widthInTiles-2, y:y}; break; }
        }
        if (!entryPoint) { // If no edge floor tiles, pick one from the middle
            for (let y = Math.floor(heightInTiles/2); y < heightInTiles -1; y++) {
                 for (let x = Math.floor(widthInTiles/2); x < widthInTiles -1; x++) {
                     if (tileData[y][x] === this.tilesetMapping.cave_floor) { entryPoint = {x,y}; break; }
                 }
                 if(entryPoint) break;
            }
        }
        if (!entryPoint) entryPoint = { x: Math.floor(widthInTiles/2), y: Math.floor(heightInTiles/2) }; // Absolute fallback
        tileData[entryPoint.y][entryPoint.x] = this.tilesetMapping.cave_floor; // Ensure walkable

        // Place objective
        const objectives = [];
        if (params.questId) {
            let placed = false;
            for (let attempts = 0; attempts < 50; attempts++) { // Try to find a good spot
                const objX = Phaser.Math.Between(Math.floor(widthInTiles * 0.25), Math.floor(widthInTiles * 0.75));
                const objY = Phaser.Math.Between(Math.floor(heightInTiles * 0.25), Math.floor(heightInTiles * 0.75));
                if (tileData[objY] && tileData[objY][objX] === this.tilesetMapping.cave_floor) {
                    tileData[objY][objX] = TILE_OBJECTIVE;
                    objectives.push({ type: 'item_pickup', pos: { x: objX, y: objY }, details: `Cave Treasure for ${params.questId}` });
                    placed = true;
                    break;
                }
            }
            if (!placed) console.warn(`MapGenerator: Could not place objective in cave ${areaId}`);
        }
        
        const exitPoint = {
            targetMapId: params.returnMapId || 'MainWorld',
            targetPos: params.returnPos || { x: 0, y: 0 }
        };

        return { tileData, widthInTiles, heightInTiles, entryPoint, exitPoint, objectives };
    }

    _countNeighbors(map, x, y, tileType) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nX = x + i;
                const nY = y + j;
                if (nX >= 0 && nX < map[0].length && nY >= 0 && nY < map.length) {
                    if (map[nY][nX] === tileType) count++;
                } else {
                    count++; // Consider out-of-bounds as walls for smoothing edges
                }
            }
        }
        return count;
    }

    /**
     * Generates a small themed outdoor area.
     * @private
     */
    _generateSmallOutdoorArea(areaId, size, theme, params) {
        let widthInTiles, heightInTiles;
        switch (size) {
            case 'small': widthInTiles = 20; heightInTiles = 15; break;
            case 'medium': widthInTiles = 30; heightInTiles = 25; break;
            case 'large': widthInTiles = 45; heightInTiles = 35; break;
            default: widthInTiles = 25; heightInTiles = 20;
        }

        let baseTile = this.tilesetMapping.grass;
        if (theme === 'desert') baseTile = this.tilesetMapping.dirt; // Assuming dirt can be sand
        // Add more theme-based tile choices

        const tileData = this._createEmptyMap(widthInTiles, heightInTiles, baseTile);
        const objectives = [];

        // Example: Add a small feature like a pond or a clearing
        if (theme === 'forest_clearing' || Math.random() < 0.3) {
            const clearX = Phaser.Math.Between(5, widthInTiles - 10);
            const clearY = Phaser.Math.Between(5, heightInTiles - 10);
            const clearW = Phaser.Math.Between(3, 6);
            const clearH = Phaser.Math.Between(3, 6);
            for (let y = clearY; y < clearY + clearH; y++) {
                for (let x = clearX; x < clearX + clearW; x++) {
                    if (tileData[y] && tileData[y][x] !== undefined) tileData[y][x] = this.tilesetMapping.dirt;
                }
            }
        }
        
        // Place objective if quest related
        if (params.questId) {
            const objX = Phaser.Math.Between(Math.floor(widthInTiles * 0.25), Math.floor(widthInTiles * 0.75));
            const objY = Phaser.Math.Between(Math.floor(heightInTiles * 0.25), Math.floor(heightInTiles * 0.75));
            if (tileData[objY] && tileData[objY][objX] !== undefined) {
                tileData[objY][objX] = TILE_OBJECTIVE;
                 objectives.push({ type: 'location_marker', pos: { x: objX, y: objY }, details: `Explore point for ${params.questId}` });
            }
        }

        const entryPoint = { x: 1, y: Math.floor(heightInTiles / 2) };
        tileData[entryPoint.y][entryPoint.x] = baseTile; // Ensure entry is clear

        const exitPoint = {
            targetMapId: params.returnMapId || 'MainWorld',
            targetPos: params.returnPos || { x: 0, y: 0 }
        };

        return { tileData, widthInTiles, heightInTiles, entryPoint, exitPoint, objectives };
    }

    _createEmptyMap(width, height, defaultTile = TILE_EMPTY) {
        const map = [];
        for (let y = 0; y < height; y++) {
            map[y] = [];
            for (let x = 0; x < width; x++) {
                map[y][x] = defaultTile;
            }
        }
        return map;
    }

    _registerGeneratedArea(areaId, areaData) {
        this.generatedAreas.set(areaId, areaData);
        console.log(`MapGenerator: Registered generated area "${areaData.name}" (ID: ${areaId})`);
        // Potentially, this is where you'd make the tilemap available to Phaser if not done by the scene
        // e.g., by creating a Phaser.Tilemaps.Tilemap object and storing it, or adding it to scene cache.
    }

    getGeneratedArea(areaId) {
        return this.generatedAreas.get(areaId);
    }

    // --- Helper methods from QuestSystem (could be moved to a shared util or duplicated if simple) ---
    getThemeFromBuildingType(buildingTypeKey) {
        if (!buildingTypeKey) return 'default';
        const lowerType = buildingTypeKey.toLowerCase();
        if (lowerType.includes('abandoned') || lowerType.includes('ruin')) return 'ruins';
        if (lowerType.includes('cave') || lowerType.includes('mine')) return 'cave';
        if (lowerType.includes('forest') || lowerType.includes('grove')) return 'forest';
        if (lowerType.includes('tower')) return 'tower';
        if (lowerType.includes('dungeon') || lowerType.includes('crypt')) return 'dungeon'; // Could be similar to cave or building
        return 'building_generic'; // Default for other building types
    }

    getSizeFromDifficulty(difficulty) {
        switch (difficulty) {
            case QUEST.DIFFICULTIES.EASY: case QUEST.DIFFICULTIES.TRIVIAL: return 'small';
            case QUEST.DIFFICULTIES.MEDIUM: return 'medium';
            case QUEST.DIFFICULTIES.HARD: return 'large';
            case QUEST.DIFFICULTIES.EPIC: case QUEST.DIFFICULTIES.LEGENDARY: return 'vast'; // Vast might need more complex generation
            default: return 'medium';
        }
    }

    /**
     * Checks if a named location (e.g., "Town Square") exists on the main map or known areas.
     * This is a placeholder. A more robust system would query a world state manager.
     * @param {string} locationName
     * @returns {boolean}
     */
    locationExists(locationName) {
        // Simple check against predefined important locations or already generated areas
        const predefinedLocations = ['town_center', 'main_square', 'elder_hut']; // Example
        if (predefinedLocations.includes(locationName.toLowerCase().replace(/\s+/g, '_'))) {
            return true;
        }
        for (const area of this.generatedAreas.values()) {
            if (area.name.toLowerCase() === locationName.toLowerCase()) {
                return true;
            }
        }
        return false;
    }

    // --- Save/Load Functionality (Example Structure) ---
    getSaveData() {
        // Need to serialize tileData if it's very large, or regenerate based on seed/params
        // For now, assuming tileData is manageable or maps are re-generated on load if not critical to save verbatim
        const serializableAreas = new Map();
        this.generatedAreas.forEach((area, id) => {
            serializableAreas.set(id, { ...area, tileData: "refer_to_seed_or_params" }); // Indicate tileData should be re-genned
        });

        return {
            nextAreaId: this.nextAreaId,
            generatedAreas: Array.from(serializableAreas.entries()), // Convert Map to array for JSON
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.nextAreaId = data.nextAreaId || 1;
        
        const loadedAreas = new Map(data.generatedAreas || []);
        this.generatedAreas.clear();

        loadedAreas.forEach((areaStub, id) => {
            // Here, you would ideally re-generate the map if tileData was not saved.
            // This requires saving the original generation parameters (params).
            // For simplicity, if tileData was saved directly (not recommended for large maps):
            // this.generatedAreas.set(id, areaStub);
            // Otherwise, you'd need to call a re-generation function:
            // const reGeneratedArea = this.regenerateAreaFromStub(id, areaStub);
            // this.generatedAreas.set(id, reGeneratedArea);
            console.warn(`MapGenerator: Loading area ${id} - full map regeneration from stub not yet implemented. Storing stub.`);
            this.generatedAreas.set(id, areaStub); // Storing stub for now
        });
        console.log('MapGenerator: Loaded save data (area stubs).');
    }
}
