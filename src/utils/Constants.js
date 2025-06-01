/**
 * Fantasy Pixel Adventure
 * Constants.js - Game-wide constants and configuration values
 * 
 * This file serves as the single source of truth for all game constants.
 * Any value that might be referenced in multiple places should be defined here.
 */

// =====================================================================
// GAME CONFIGURATION
// =====================================================================
export const GAME = {
    TITLE: 'Fantasy Pixel Adventure',
    VERSION: '1.0.0',
    WIDTH: 800,
    HEIGHT: 600,
    TARGET_FPS: 60,
    PIXEL_SCALE: 3,        // Each pixel in assets is rendered as 3x3 pixels
    DEBUG_MODE: false,     // Set to true to enable debug features
    DEFAULT_FONT: 'PixelFont',
    SAVE_KEY: 'fantasy_adventure_save',
    MAX_PLAYERS: 1,        // Single player game
    BACKGROUND_COLOR: 0x0a0a12
};

// =====================================================================
// PERFORMANCE SETTINGS
// =====================================================================
export const PERFORMANCE = {
    CULLING_DISTANCE: 200,           // Distance in pixels beyond which entities are culled
    MAX_PARTICLES: 500,              // Maximum number of particles allowed
    SPRITE_BATCH_SIZE: 2048,         // Sprite batch size for rendering
    ENABLE_LIGHTING: true,           // Whether to enable dynamic lighting
    SHADOW_QUALITY: 'medium',        // low, medium, high
    MAX_LIGHTS: 10,                  // Maximum number of dynamic lights
    ENABLE_WEATHER_EFFECTS: true     // Whether to enable weather particles
};

// =====================================================================
// PLAYER SETTINGS
// =====================================================================
export const PLAYER = {
    MOVE_SPEED: 150,                 // Pixels per second
    DIAGONAL_SPEED_MODIFIER: 0.7071, // Normalized diagonal movement (1/sqrt(2))
    SPRINT_MULTIPLIER: 1.5,          // Speed multiplier when sprinting
    COLLISION_RADIUS: 12,            // Collision circle radius
    INTERACTION_RADIUS: 40,          // Distance at which player can interact with objects/NPCs
    START_HEALTH: 100,
    MAX_HEALTH: 100,
    START_MANA: 50,
    MAX_MANA: 100,
    HEALTH_REGEN: 1,                 // Health points regenerated per second
    MANA_REGEN: 2,                   // Mana points regenerated per second
    INVENTORY_SLOTS: 24,
    DEFAULT_WEAPON: 'wooden_sword',
    DEFAULT_ARMOR: 'cloth_armor',
    FOOTSTEP_FREQUENCY: 250,         // Milliseconds between footstep sounds
    STARTING_GOLD: 50
};

// =====================================================================
// CAMERA SETTINGS
// =====================================================================
export const CAMERA = {
    FOLLOW_LERP: 0.1,                // Camera follow lerp factor (0-1)
    ZOOM_LEVEL: 2,                   // Default zoom level
    MIN_ZOOM: 1,                     // Minimum zoom level
    MAX_ZOOM: 4,                     // Maximum zoom level
    ZOOM_SPEED: 0.1,                 // Zoom speed when zooming in/out
    SHAKE_INTENSITY: 0.005,          // Default camera shake intensity
    SHAKE_DURATION: 100,             // Default camera shake duration in ms
    BOUNDS_PADDING: 50               // Padding from world bounds
};

// =====================================================================
// NPC SETTINGS
// =====================================================================
export const NPC = {
    DEFAULT_MOVE_SPEED: 75,          // Pixels per second
    WANDER_RADIUS: 100,              // How far NPCs wander from their spawn point
    WANDER_PAUSE_TIME: 2000,         // Time in ms that NPCs pause between wandering
    SIGHT_RADIUS: 150,               // How far NPCs can "see" the player
    CHAT_COOLDOWN: 1000,             // Milliseconds before an NPC can be chatted with again
    TYPES: {
        VILLAGER: 'villager',
        GUARD: 'guard',
        MERCHANT: 'merchant',
        BLACKSMITH: 'blacksmith',
        INNKEEPER: 'innkeeper',
        FARMER: 'farmer',
        MAGE: 'mage',
        PRIEST: 'priest',
        BARD: 'bard',
        CHILD: 'child',
        ELDER: 'elder',
        NOBLE: 'noble',
        BEGGAR: 'beggar',
        MONSTER: 'monster'
    },
    STORE_TYPES: {
        GENERAL: 'general',          // General goods
        WEAPONS: 'weapons',          // Weapons and combat gear
        ARMOR: 'armor',              // Armor and protective gear
        MAGIC: 'magic',              // Spells and magical items
        ALCHEMY: 'alchemy',          // Potions and ingredients
        FOOD: 'food',                // Food and drink
        BLACKSMITH: 'blacksmith',    // Crafting materials and tools
        INN: 'inn'                   // Lodging and services
    },
    BEHAVIOR: {
        STATIC: 'static',            // NPC doesn't move
        WANDER: 'wander',            // NPC wanders randomly
        PATROL: 'patrol',            // NPC follows a patrol path
        FOLLOW: 'follow',            // NPC follows the player
        FLEE: 'flee',                // NPC runs away from the player
        AGGRESSIVE: 'aggressive'     // NPC attacks the player
    },
    DIALOGUE_BUBBLE_DURATION: 4000,  // How long dialogue bubbles stay visible in ms
    DIALOGUE_TYPING_SPEED: 30,       // Milliseconds per character for typing effect
    MAX_DIALOGUE_LENGTH: 150,        // Maximum characters in a dialogue bubble
    STORE_MARKUP: 1.5,               // Price multiplier for items sold by NPCs
    STORE_BUYBACK: 0.5               // Multiplier for selling items back to stores
};

// =====================================================================
// WORLD SETTINGS
// =====================================================================
export const WORLD = {
    TILE_SIZE: 16,                   // Size of a single tile in pixels
    CHUNK_SIZE: 16,                  // Number of tiles in a chunk (16x16)
    TOWN_WIDTH: 40,                  // Width of town in tiles
    TOWN_HEIGHT: 40,                 // Height of town in tiles
    TIME_SCALE: 60,                  // 1 real second = 60 game seconds
    DAY_LENGTH: 24,                  // Game hours in a full day
    STARTING_HOUR: 8,                // Game hour when new game starts
    DAWN_HOUR: 6,                    // Hour when dawn begins
    DUSK_HOUR: 18,                   // Hour when dusk begins
    WEATHER_CHANGE_CHANCE: 0.001,    // Chance per frame of weather changing
    WEATHER_TYPES: {
        CLEAR: 'clear',
        CLOUDY: 'cloudy',
        RAIN: 'rain',
        STORM: 'storm',
        FOG: 'fog',
        SNOW: 'snow'
    },
    BUILDING_TYPES: {
        HOUSE_SMALL: 'house_small',
        HOUSE_MEDIUM: 'house_medium',
        HOUSE_LARGE: 'house_large',
        SHOP: 'shop',
        BLACKSMITH: 'blacksmith',
        INN: 'inn',
        TAVERN: 'tavern',
        TEMPLE: 'temple',
        CASTLE: 'castle',
        TOWER: 'tower',
        RUINS: 'ruins',
        DUNGEON: 'dungeon',
        CAVE: 'cave',
        ABANDONED: 'abandoned'
    },
    BIOME_TYPES: {
        GRASSLAND: 'grassland',
        FOREST: 'forest',
        MOUNTAIN: 'mountain',
        DESERT: 'desert',
        SWAMP: 'swamp',
        SNOW: 'snow',
        VOLCANIC: 'volcanic',
        COAST: 'coast',
        LAKE: 'lake'
    },
    OBSTACLE_TYPES: {
        TREE: 'tree',
        ROCK: 'rock',
        BUSH: 'bush',
        FENCE: 'fence',
        WATER: 'water',
        LAVA: 'lava'
    }
};

// =====================================================================
// PROCEDURAL GENERATION SETTINGS
// =====================================================================
export const PROC_GEN = {
    SEED: 'fantasy-adventure',       // Default seed for random generation
    NOISE_SCALE: 0.1,                // Scale factor for Perlin noise
    RIVER_THRESHOLD: 0.7,            // Threshold for river generation
    MOUNTAIN_THRESHOLD: 0.8,         // Threshold for mountain generation
    FOREST_DENSITY: 0.6,             // Density of trees in forest biomes
    BUILDING_SPACING: 5,             // Minimum tiles between buildings
    MAX_BUILDINGS_PER_TOWN: 20,      // Maximum number of buildings in a town
    ROAD_WIDTH: 2,                   // Width of roads in tiles
    DUNGEON_ROOM_MIN_SIZE: 4,        // Minimum room size in dungeon generation
    DUNGEON_ROOM_MAX_SIZE: 10,       // Maximum room size in dungeon generation
    DUNGEON_MAX_ROOMS: 15,           // Maximum number of rooms in a dungeon
    QUEST_LOCATION_MIN_DISTANCE: 10, // Minimum distance for quest locations in chunks
    QUEST_LOCATION_MAX_DISTANCE: 30  // Maximum distance for quest locations in chunks
};

// =====================================================================
// ANIMATION SETTINGS
// =====================================================================
export const ANIMATIONS = {
    FRAMERATE: 8,                    // Default frames per second for animations
    PLAYER_WALK_FRAMERATE: 10,       // Frames per second for player walk animation
    PLAYER_RUN_FRAMERATE: 12,        // Frames per second for player run animation
    PLAYER_IDLE_FRAMERATE: 5,        // Frames per second for player idle animation
    PLAYER_ATTACK_FRAMERATE: 15,     // Frames per second for player attack animation
    NPC_WALK_FRAMERATE: 8,           // Frames per second for NPC walk animation
    NPC_IDLE_FRAMERATE: 4,           // Frames per second for NPC idle animation
    EFFECT_FRAMERATE: 12,            // Frames per second for effect animations
    WATER_FRAMERATE: 3,              // Frames per second for water animation
    TORCH_FRAMERATE: 8,              // Frames per second for torch animation
    COIN_SPIN_FRAMERATE: 10,         // Frames per second for coin spin animation
    CHEST_OPEN_FRAMERATE: 10,        // Frames per second for chest opening
    DOOR_OPEN_FRAMERATE: 10,         // Frames per second for door opening
    TRANSITION_DURATION: 500,        // Duration of scene transitions in ms
    FADE_DURATION: 300               // Duration of fade effects in ms
};

// =====================================================================
// QUEST SYSTEM
// =====================================================================
export const QUEST = {
    MAX_ACTIVE_QUESTS: 10,           // Maximum number of active quests
    MAX_COMPLETED_QUESTS: 100,       // Maximum number of completed quests to track
    TYPES: {
        FETCH: 'fetch',              // Retrieve an item
        KILL: 'kill',                // Defeat enemies
        ESCORT: 'escort',            // Escort an NPC
        DELIVER: 'deliver',          // Deliver an item
        EXPLORE: 'explore',          // Discover a location
        GATHER: 'gather',            // Collect multiple items
        TALK: 'talk',                // Talk to an NPC
        CRAFT: 'craft',              // Craft an item
        PUZZLE: 'puzzle'             // Solve a puzzle
    },
    DIFFICULTIES: {
        TRIVIAL: 'trivial',
        EASY: 'easy',
        MEDIUM: 'medium',
        HARD: 'hard',
        EPIC: 'epic',
        LEGENDARY: 'legendary'
    },
    DEFAULT_EXPIRY_TIME: 604800,     // 7 days in seconds
    REWARD_SCALING: 1.5,             // Multiplier for rewards based on difficulty
    COMMAND_REGEX: /\(create\.quest:\s*(.*?)\)/i,  // Regex to extract quest title
    DESCRIPTION_REGEX: /\(quest description:\s*(.*?)\)/i, // Regex to extract quest description
    BUILDING_REGEX: /\(building\.type:\s*(.*?)\)/i, // Regex to extract building type
    LOCATION_REGEX: /\(location:\s*(.*?)\)/i, // Regex to extract location name
    REWARD_REGEX: /\(reward:\s*(.*?)\)/i, // Regex to extract reward
    DIFFICULTY_REGEX: /\(difficulty:\s*(.*?)\)/i, // Regex to extract difficulty
    XP_REWARDS: {
        TRIVIAL: 50,
        EASY: 100,
        MEDIUM: 250,
        HARD: 500,
        EPIC: 1000,
        LEGENDARY: 2500
    }
};

// =====================================================================
// CHAT SYSTEM
// =====================================================================
export const CHAT = {
    MAX_MESSAGE_LENGTH: 200,         // Maximum length of a chat message
    MAX_HISTORY_LENGTH: 50,          // Maximum number of messages to keep in history
    TYPING_INDICATOR_DELAY: 1000,    // Delay before showing typing indicator in ms
    MIN_RESPONSE_TIME: 500,          // Minimum time before NPC responds in ms
    MAX_RESPONSE_TIME: 2000,         // Maximum time before NPC responds in ms
    RESPONSE_TIMEOUT: 10000,         // Timeout for API response in ms
    CHAT_BUBBLE_FADE_TIME: 200,      // Time for chat bubbles to fade in/out in ms
    CHAT_BUBBLE_MAX_WIDTH: 250,      // Maximum width of chat bubbles in pixels
    CHAT_BUBBLE_PADDING: 10,         // Padding inside chat bubbles in pixels
    CHAT_BUBBLE_OFFSET_Y: -40,       // Vertical offset for chat bubbles in pixels
    CHAT_BUBBLE_LINE_HEIGHT: 18,     // Line height for text in chat bubbles
    CHAT_BUBBLE_FONT_SIZE: 14,       // Font size for text in chat bubbles
    CHAT_BUBBLE_BACKGROUND: 0x222222,// Background color for chat bubbles
    CHAT_BUBBLE_TEXT_COLOR: 0xffffff,// Text color for chat bubbles
    CHAT_BUBBLE_ALPHA: 0.8,          // Alpha transparency for chat bubbles
    CHAT_BUBBLE_BORDER_RADIUS: 8,    // Border radius for chat bubbles in pixels
    CHAT_BUBBLE_BORDER_WIDTH: 2,     // Border width for chat bubbles in pixels
    CHAT_BUBBLE_BORDER_COLOR: 0x7b68ee, // Border color for chat bubbles
    CHAT_BUBBLE_TAIL_HEIGHT: 10,     // Height of the speech bubble "tail" in pixels
    FALLBACK_RESPONSES: [            // Fallback responses if API fails
        "I'm sorry, I can't talk right now.",
        "Hmm, I seem to be lost in thought.",
        "Let's talk again later.",
        "Excuse me, I need a moment.",
        "The connection seems weak. Try again?"
    ]
};

// =====================================================================
// INVENTORY & ITEMS
// =====================================================================
export const INVENTORY = {
    SLOT_SIZE: 48,                   // Size of inventory slots in pixels
    SLOT_PADDING: 4,                 // Padding between slots in pixels
    MAX_STACK_SIZE: 99,              // Maximum number of items in a stack
    MAX_WEIGHT: 100,                 // Maximum weight player can carry
    GOLD_ICON: 'gold_coin',          // Icon for gold currency
    DRAG_OPACITY: 0.7,               // Opacity of items being dragged
    TOOLTIP_DELAY: 500,              // Delay before showing tooltips in ms
    TOOLTIP_PADDING: 8,              // Padding inside tooltips in pixels
    TOOLTIP_BACKGROUND: 0x222222,    // Background color for tooltips
    TOOLTIP_TEXT_COLOR: 0xffffff,    // Text color for tooltips
    TOOLTIP_ALPHA: 0.9,              // Alpha transparency for tooltips
    TOOLTIP_BORDER_RADIUS: 4,        // Border radius for tooltips in pixels
    TOOLTIP_BORDER_WIDTH: 1,         // Border width for tooltips in pixels
    TOOLTIP_BORDER_COLOR: 0x7b68ee,  // Border color for tooltips
    TOOLTIP_MAX_WIDTH: 300,          // Maximum width of tooltips in pixels
    ITEM_RARITY: {
        COMMON: 'common',
        UNCOMMON: 'uncommon',
        RARE: 'rare',
        EPIC: 'epic',
        LEGENDARY: 'legendary',
        ARTIFACT: 'artifact'
    },
    RARITY_COLORS: {
        COMMON: 0xffffff,            // White
        UNCOMMON: 0x1eff00,          // Green
        RARE: 0x0070dd,              // Blue
        EPIC: 0xa335ee,              // Purple
        LEGENDARY: 0xff8000,         // Orange
        ARTIFACT: 0xe6cc80           // Gold
    },
    ITEM_TYPES: {
        WEAPON: 'weapon',
        ARMOR: 'armor',
        CONSUMABLE: 'consumable',
        MATERIAL: 'material',
        QUEST: 'quest',
        TREASURE: 'treasure',
        KEY: 'key'
    }
};

// =====================================================================
// AUDIO SETTINGS
// =====================================================================
export const AUDIO = {
    MUSIC_VOLUME: 0.3,               // Default music volume (0-1)
    SFX_VOLUME: 0.5,                 // Default sound effects volume (0-1)
    MASTER_VOLUME: 0.7,              // Default master volume (0-1)
    FADE_DURATION: 1000,             // Duration of audio fades in ms
    MUSIC_CROSSFADE: 2000,           // Crossfade duration between tracks in ms
    FOOTSTEP_VOLUME: 0.2,            // Volume for footstep sounds
    UI_SOUND_VOLUME: 0.4,            // Volume for UI sounds
    AMBIENT_VOLUME: 0.2,             // Volume for ambient sounds
    MUSIC_TRACKS: {
        TITLE: 'music_title',
        TOWN: 'music_town',
        FOREST: 'music_forest',
        DUNGEON: 'music_dungeon',
        COMBAT: 'music_combat',
        VICTORY: 'music_victory',
        GAME_OVER: 'music_game_over',
        TAVERN: 'music_tavern',
        NIGHT: 'music_night',
        BOSS: 'music_boss'
    }
};

// =====================================================================
// UI SETTINGS
// =====================================================================
export const UI = {
    FONT_SIZES: {
        SMALL: 12,
        MEDIUM: 16,
        LARGE: 24,
        XLARGE: 32
    },
    COLORS: {
        PRIMARY: 0x7b68ee,           // Main UI color (purple)
        SECONDARY: 0x4deeea,         // Secondary UI color (cyan)
        TEXT_LIGHT: 0xe6e6fa,        // Light text color
        TEXT_DARK: 0x1a1a2e,         // Dark text color
        WARNING: 0xfbbf24,           // Warning color (yellow)
        DANGER: 0xf87171,            // Danger color (red)
        SUCCESS: 0x4ade80,           // Success color (green)
        BACKGROUND_DARK: 0x0a0a12,   // Dark background
        BACKGROUND_MEDIUM: 0x1a1a2e, // Medium background
        BACKGROUND_LIGHT: 0x2a2a3e   // Light background
    },
    PADDING: {
        SMALL: 4,
        MEDIUM: 8,
        LARGE: 16,
        XLARGE: 24
    },
    BORDER_RADIUS: 4,                // Default border radius in pixels
    BORDER_WIDTH: 2,                 // Default border width in pixels
    TRANSITION_SPEED: 200,           // Default transition speed in ms
    TOOLTIP_DELAY: 500,              // Delay before showing tooltips in ms
    NOTIFICATION_DURATION: 3000,     // Duration of notifications in ms
    DIALOG_BACKDROP_OPACITY: 0.7,    // Opacity of dialog backdrops
    HEALTH_BAR_HEIGHT: 12,           // Height of health bars in pixels
    HEALTH_BAR_WIDTH: 100,           // Width of health bars in pixels
    HEALTH_BAR_COLOR: 0xf87171,      // Color of health bars
    MANA_BAR_COLOR: 0x7b68ee,        // Color of mana bars
    EXPERIENCE_BAR_COLOR: 0x4deeea,  // Color of experience bars
    MINIMAP_SIZE: 150,               // Size of minimap in pixels
    MINIMAP_ZOOM: 0.2,               // Zoom level of minimap
    MINIMAP_OPACITY: 0.8,            // Opacity of minimap
    DIALOG_Z_INDEX: 100,             // Z-index for dialog boxes
    NOTIFICATION_Z_INDEX: 110,       // Z-index for notifications
    TOOLTIP_Z_INDEX: 120,            // Z-index for tooltips
    MODAL_Z_INDEX: 130,              // Z-index for modal dialogs
    LOADING_Z_INDEX: 140             // Z-index for loading screens
};

// =====================================================================
// ASSET KEYS
// =====================================================================
export const ASSETS = {
    SPRITESHEETS: {
        PLAYER: 'player_sheet',
        VILLAGERS: 'villagers_sheet',
        MERCHANTS: 'merchants_sheet',
        GUARDS: 'guards_sheet',
        MONSTERS: 'monsters_sheet',
        ITEMS: 'items_sheet',
        EFFECTS: 'effects_sheet',
        UI: 'ui_sheet'
    },
    TILESETS: {
        TOWN: 'town_tiles',
        INTERIOR: 'interior_tiles',
        DUNGEON: 'dungeon_tiles',
        FOREST: 'forest_tiles',
        WATER: 'water_tiles',
        MOUNTAINS: 'mountain_tiles',
        DESERT: 'desert_tiles'
    },
    IMAGES: {
        LOGO: 'game_logo',
        TITLE_BACKGROUND: 'title_background',
        LOADING_BACKGROUND: 'loading_background',
        INVENTORY_BACKGROUND: 'inventory_background',
        DIALOG_BACKGROUND: 'dialog_background',
        BUTTON: 'button',
        BUTTON_HOVER: 'button_hover',
        BUTTON_PRESSED: 'button_pressed',
        HEALTH_BAR: 'health_bar',
        MANA_BAR: 'mana_bar',
        EXPERIENCE_BAR: 'experience_bar',
        MINIMAP_FRAME: 'minimap_frame',
        QUEST_ICON: 'quest_icon',
        STORE_ICON: 'store_icon',
        GOLD_ICON: 'gold_icon',
        CHAT_ICON: 'chat_icon'
    },
    AUDIO: {
        MUSIC: {
            TITLE: 'music_title',
            TOWN: 'music_town',
            FOREST: 'music_forest',
            DUNGEON: 'music_dungeon',
            COMBAT: 'music_combat'
        },
        SFX: {
            BUTTON_CLICK: 'sfx_button_click',
            FOOTSTEP_GRASS: 'sfx_footstep_grass',
            FOOTSTEP_STONE: 'sfx_footstep_stone',
            FOOTSTEP_WOOD: 'sfx_footstep_wood',
            ITEM_PICKUP: 'sfx_item_pickup',
            INVENTORY_OPEN: 'sfx_inventory_open',
            INVENTORY_CLOSE: 'sfx_inventory_close',
            DIALOG_OPEN: 'sfx_dialog_open',
            DIALOG_CLOSE: 'sfx_dialog_close',
            QUEST_ACCEPT: 'sfx_quest_accept',
            QUEST_COMPLETE: 'sfx_quest_complete',
            CHAT_MESSAGE: 'sfx_chat_message',
            DOOR_OPEN: 'sfx_door_open',
            DOOR_CLOSE: 'sfx_door_close',
            CHEST_OPEN: 'sfx_chest_open',
            GOLD_PICKUP: 'sfx_gold_pickup',
            LEVEL_UP: 'sfx_level_up',
            ERROR: 'sfx_error'
        }
    },
    FONTS: {
        PIXEL: 'pixel_font'
    }
};

// =====================================================================
// GAME STATES
// =====================================================================
export const STATES = {
    BOOT: 'BootScene',
    PRELOAD: 'PreloadScene',
    TITLE: 'TitleScene',
    MAIN: 'MainScene',
    UI: 'UIScene',
    CHAT: 'ChatScene',
    INVENTORY: 'InventoryScene',
    QUEST_LOG: 'QuestLogScene',
    STORE: 'StoreScene',
    GAME_OVER: 'GameOverScene',
    PAUSE: 'PauseScene',
    LOADING: 'LoadingScene',
    CREDITS: 'CreditsScene'
};

// =====================================================================
// PHYSICS SETTINGS
// =====================================================================
export const PHYSICS = {
    GRAVITY: 0,                      // No gravity for top-down game
    PLAYER_BODY_SIZE: {
        width: 12,
        height: 12,
        offsetX: 2,
        offsetY: 4
    },
    NPC_BODY_SIZE: {
        width: 12,
        height: 12,
        offsetX: 2,
        offsetY: 4
    },
    COLLISION_CATEGORIES: {
        NONE: 0,
        PLAYER: 0x0001,
        NPC: 0x0002,
        ENEMY: 0x0004,
        OBJECT: 0x0008,
        PROJECTILE: 0x0010,
        TRIGGER: 0x0020,
        WALL: 0x0040,
        ITEM: 0x0080
    }
};

// =====================================================================
// GROK API INTEGRATION
// =====================================================================
export const GROK_API = {
    RESPONSE_TIMEOUT: 10000,         // Timeout for API response in ms
    MAX_TOKENS: 1000,                // Maximum tokens for API response
    TEMPERATURE: 0.7,                // Temperature for API response
    MAX_RETRIES: 3,                  // Maximum number of retries for API calls
    RETRY_DELAY: 1000,               // Delay between retries in ms
    CONTEXT_LENGTH: 10,              // Number of previous messages to include as context
    QUEST_COMMAND_PREFIX: 'create.quest:',  // Prefix for quest creation commands
    QUEST_DESCRIPTION_PREFIX: 'quest description:',  // Prefix for quest descriptions
    BUILDING_TYPE_PREFIX: 'building.type:',  // Prefix for building types
    LOCATION_PREFIX: 'location:',     // Prefix for locations
    REWARD_PREFIX: 'reward:',         // Prefix for rewards
    DIFFICULTY_PREFIX: 'difficulty:',  // Prefix for difficulty
    COMMAND_PATTERN: /\((.*?):\s*(.*?)\)/g,  // Pattern to extract commands from API responses
    DEFAULT_SYSTEM_PROMPT: `You are an NPC in a fantasy world. Respond in character and keep responses concise. 
You can create quests for the player by using the format: (create.quest: Quest Title) (quest description: Brief description) 
(building.type: building.type.subtype) (difficulty: easy/medium/hard) (reward: gold/item)`,
    PERSONALITY_TRAITS: [
        'friendly',
        'mysterious',
        'grumpy',
        'wise',
        'eccentric',
        'suspicious',
        'helpful',
        'noble',
        'cowardly',
        'brave',
        'greedy',
        'generous',
        'scholarly',
        'religious',
        'mischievous'
    ]
};

// =====================================================================
// DEBUGGING
// =====================================================================
export const DEBUG = {
    SHOW_FPS: false,                 // Show FPS counter
    SHOW_HITBOXES: false,            // Show physics hitboxes
    SHOW_PATHFINDING: false,         // Show pathfinding debug info
    LOG_LEVEL: 'warn',               // none, error, warn, info, debug
    INVINCIBLE_PLAYER: false,        // Player takes no damage
    UNLIMITED_RESOURCES: false,      // Player has unlimited resources
    UNLOCK_ALL_AREAS: false,         // All areas are unlocked
    FAST_DIALOGUE: false,            // Skip dialogue typing animation
    SHOW_TILE_COORDINATES: false,    // Show coordinates on tiles
    SHOW_NPC_STATE: false,           // Show NPC state above NPCs
    SHOW_QUEST_MARKERS: true,        // Show markers for quest objectives
    TELEPORT_ENABLED: false,         // Enable teleportation for testing
    SPAWN_RATE_MULTIPLIER: 1,        // Multiplier for enemy spawn rates
    PERFORMANCE_MONITOR: false       // Show performance monitoring
};

// Export a default object with all constants for easy importing
export default {
    GAME,
    PERFORMANCE,
    PLAYER,
    CAMERA,
    NPC,
    WORLD,
    PROC_GEN,
    ANIMATIONS,
    QUEST,
    CHAT,
    INVENTORY,
    AUDIO,
    UI,
    ASSETS,
    STATES,
    PHYSICS,
    GROK_API,
    DEBUG
};
