/**
 * Fantasy Pixel Adventure
 * BootScene.js - Initial game loading and asset generation (Concise Version)
 *
 * This scene handles:
 * - Loading and creating essential placeholder game assets
 * - Generating simple placeholder pixel art for development
 * - Creating basic animation definitions
 * - Transitioning to the main game scene
 */

import Phaser from 'phaser';
import { GAME, ASSETS, STATES, WORLD, ANIMATIONS, UI, PLAYER, NPC } from '../utils/Constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: STATES.BOOT });
        this.loadingProgress = 0;
    }

    preload() {
        this.loadingBar = document.getElementById('loading-bar');
        this.loadingText = document.getElementById('loading-text');

        this.updateLoadingText('Initializing...');

        this.load.on('progress', (value) => {
            this.loadingProgress = Math.floor(value * 100);
            if (this.loadingBar) {
                this.loadingBar.style.width = `${this.loadingProgress}%`;
            }
            this.updateLoadingText(`Loading assets: ${this.loadingProgress}%`);
        });

        this.load.on('complete', () => {
            this.updateLoadingText('Creating game world...');
        });

        this.updateLoadingText('Generating placeholder assets...');
        this.generatePlaceholderAssets();
        this.loadPixelFont();
    }

    create() {
        this.updateLoadingText('Creating animations...');
        this.createAnimations();
        this.initGameSystems();

        this.updateLoadingText('Starting adventure...');
        this.game.events.emit('ready');

        this.time.delayedCall(500, () => { // Reduced delay for faster startup
            this.scene.start(STATES.MAIN);
            // Also start UI scene in parallel
            if (!this.scene.get(STATES.UI)) {
                this.scene.add(STATES.UI, this.scene.get(STATES.UI) || Phaser.Scene, true); // Ensure UIScene is added if not already
            } else {
                 this.scene.launch(STATES.UI);
            }
        });
    }

    updateLoadingText(text) {
        if (this.loadingText) {
            this.loadingText.textContent = text;
        }
        // console.log(`BootScene: ${text}`); // Optional: for console logging
    }

    generatePlaceholderAssets() {
        this.generatePlayerSpritesheet();
        this.generateNPCSpritesheet(ASSETS.SPRITESHEETS.VILLAGERS, 0x8888ff, 4); // Light Blue Villagers
        this.generateNPCSpritesheet(ASSETS.SPRITESHEETS.MERCHANTS, 0xff8888, 2); // Light Red Merchants
        this.generateNPCSpritesheet(ASSETS.SPRITESHEETS.GUARDS, 0x88ff88, 2);    // Light Green Guards
        this.generateTownTileset();
        this.generateItemsSpritesheet();
        this.generateUIElements();
    }

    loadPixelFont() {
        // Using a system font as a fallback pixel font
        const fontStyle = document.createElement('style');
        fontStyle.textContent = `
            @font-face {
                font-family: '${GAME.DEFAULT_FONT}';
                src: local('Courier New'), local('Consolas'), local('Monaco'), monospace;
                font-weight: normal;
                font-style: normal;
            }
        `;
        document.head.appendChild(fontStyle);
        this.updateLoadingText('Pixel font ready (system fallback).');
    }

    initGameSystems() {
        this.physics.world.setBounds(0, 0, WORLD.TOWN_WIDTH * WORLD.TILE_SIZE, WORLD.TOWN_HEIGHT * WORLD.TILE_SIZE);
        this.cameras.main.setBounds(0, 0, WORLD.TOWN_WIDTH * WORLD.TILE_SIZE, WORLD.TOWN_HEIGHT * WORLD.TILE_SIZE);
        this.cameras.main.setBackgroundColor(GAME.BACKGROUND_COLOR);


        this.registry.set('playerGold', PLAYER.STARTING_GOLD);
        this.registry.set('playerLevel', 1);
        this.registry.set('playerXp', 0);
        this.registry.set('activeQuests', []);
        this.registry.set('completedQuests', []);
        this.registry.set('discoveredLocations', ['town_center']);
        this.registry.set('gameTime', WORLD.STARTING_HOUR * 3600);
        this.registry.set('weather', WORLD.WEATHER_TYPES.CLEAR);
        this.updateLoadingText('Game systems initialized.');
    }

    // --- Simplified Asset Generation ---

    generatePlayerSpritesheet() {
        const frameWidth = 16;
        const frameHeight = 16; // Simplified to 16x16
        const sheetWidth = frameWidth * 2; // 2 frames (idle, walk)
        const sheetHeight = frameHeight * 4; // 4 directions
        const canvas = this.textures.createCanvas(ASSETS.SPRITESHEETS.PLAYER, sheetWidth, sheetHeight);
        if (!canvas) return;
        const ctx = canvas.context;

        const colors = {
            skin: '#ffcc99',
            hair: '#663300',
            shirt: '#0099cc',
            pants: '#333399'
        };

        for (let dir = 0; dir < 4; dir++) { // 0:down, 1:left, 2:right, 3:up
            for (let frame = 0; frame < 2; frame++) { // 0:idle, 1:walk
                const x = frame * frameWidth;
                const y = dir * frameHeight;

                ctx.fillStyle = 'rgba(0,0,0,0)'; // Transparent background
                ctx.fillRect(x, y, frameWidth, frameHeight);

                // Simple body
                ctx.fillStyle = colors.shirt;
                ctx.fillRect(x + 4, y + 6, 8, 6); // Torso
                ctx.fillStyle = colors.pants;
                ctx.fillRect(x + 4, y + 12, 8, 4); // Legs

                // Simple head
                ctx.fillStyle = colors.skin;
                ctx.fillRect(x + 5, y + 2, 6, 4); // Face
                ctx.fillStyle = colors.hair;
                ctx.fillRect(x + 4, y + 0, 8, 3); // Hair

                // Basic animation indication (e.g., slight color change for walk)
                if (frame === 1) {
                    ctx.fillStyle = Phaser.Display.Color.HexStringToColor(colors.shirt).lighten(10).rgba;
                    ctx.fillRect(x + 4, y + 6, 8, 6);
                }

                // Eyes based on direction
                ctx.fillStyle = '#000000';
                if (dir === 0) { // Down
                    ctx.fillRect(x + 6, y + 4, 1, 1);
                    ctx.fillRect(x + 9, y + 4, 1, 1);
                } else if (dir === 1) { // Left
                    ctx.fillRect(x + 5, y + 4, 1, 1);
                } else if (dir === 2) { // Right
                    ctx.fillRect(x + 10, y + 4, 1, 1);
                }
                // Up: No eyes visible from back
            }
        }
        canvas.refresh();
        this.updateLoadingText('Player spritesheet generated.');
    }

    generateNPCSpritesheet(key, color, numVariants = 1) {
        const frameWidth = 16;
        const frameHeight = 16;
        const sheetWidth = frameWidth * 2; // 2 frames (idle, walk)
        const sheetHeight = frameHeight * 4 * numVariants; // 4 directions per variant
        const canvas = this.textures.createCanvas(key, sheetWidth, sheetHeight);
        if (!canvas) return;
        const ctx = canvas.context;

        const baseColor = Phaser.Display.Color.ValueToColor(color);

        for (let variant = 0; variant < numVariants; variant++) {
            const variantColor = Phaser.Display.Color.HSLToColor(
                (baseColor.h + variant * 0.1) % 1, // Vary hue for different variants
                baseColor.s,
                baseColor.l
            );

            for (let dir = 0; dir < 4; dir++) {
                for (let frame = 0; frame < 2; frame++) {
                    const x = frame * frameWidth;
                    const y = (variant * 4 + dir) * frameHeight;

                    ctx.fillStyle = 'rgba(0,0,0,0)';
                    ctx.fillRect(x, y, frameWidth, frameHeight);

                    // NPC Body
                    ctx.fillStyle = variantColor.rgba;
                    ctx.fillRect(x + 4, y + 4, 8, 10); // Simple rectangle body

                    // NPC Head
                    ctx.fillStyle = Phaser.Display.Color.ValueToColor(0xcccccc).rgba; // Grey head
                    ctx.fillRect(x + 5, y + 1, 6, 4);

                    if (frame === 1) { // Walk frame indication
                        ctx.fillStyle = Phaser.Display.Color.ValueToColor(variantColor).lighten(20).rgba;
                        ctx.fillRect(x + 4, y + 4, 8, 10);
                    }
                }
            }
        }
        canvas.refresh();
        this.updateLoadingText(`${key} spritesheet generated.`);
    }

    generateTownTileset() {
        const tileSize = WORLD.TILE_SIZE; // 16
        const sheetWidth = tileSize * 4; // 4 basic tiles
        const sheetHeight = tileSize * 1;
        const canvas = this.textures.createCanvas(ASSETS.TILESETS.TOWN, sheetWidth, sheetHeight);
        if (!canvas) return;
        const ctx = canvas.context;

        // Tile 0: Grass
        ctx.fillStyle = '#33cc33'; // Green
        ctx.fillRect(0 * tileSize, 0, tileSize, tileSize);
        // Tile 1: Dirt
        ctx.fillStyle = '#996633'; // Brown
        ctx.fillRect(1 * tileSize, 0, tileSize, tileSize);
        // Tile 2: Water
        ctx.fillStyle = '#3366ff'; // Blue
        ctx.fillRect(2 * tileSize, 0, tileSize, tileSize);
        // Tile 3: Wall
        ctx.fillStyle = '#999999'; // Grey
        ctx.fillRect(3 * tileSize, 0, tileSize, tileSize);
        // Add dark lines for definition
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        for(let i=0; i<4; ++i) {
            ctx.strokeRect(i * tileSize + 0.5, 0.5, tileSize-1, tileSize-1);
        }

        canvas.refresh();
        this.updateLoadingText('Town tileset generated.');
    }

    generateItemsSpritesheet() {
        const itemSize = 16;
        const sheetWidth = itemSize * 3; // 3 basic items
        const sheetHeight = itemSize * 1;
        const canvas = this.textures.createCanvas(ASSETS.SPRITESHEETS.ITEMS, sheetWidth, sheetHeight);
        if (!canvas) return;
        const ctx = canvas.context;

        // Item 0: Sword
        ctx.fillStyle = '#c0c0c0'; // Silver
        ctx.fillRect(0 * itemSize + 7, 0 * itemSize + 2, 2, 10); // Blade
        ctx.fillStyle = '#964B00'; // Brown
        ctx.fillRect(0 * itemSize + 6, 0 * itemSize + 11, 4, 2); // Hilt

        // Item 1: Potion
        ctx.fillStyle = '#ff0000'; // Red
        ctx.beginPath();
        ctx.arc(1 * itemSize + 8, 1 * itemSize + 10, 5, 0, Math.PI * 2); // Bottle body
        ctx.fill();
        ctx.fillRect(1 * itemSize + 6, 1 * itemSize + 2, 4, 4); // Neck

        // Item 2: Coin
        ctx.fillStyle = '#ffd700'; // Gold
        ctx.beginPath();
        ctx.arc(2 * itemSize + 8, 2 * itemSize + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f0c000'; // Darker gold for detail
        ctx.fillText('$', 2 * itemSize + 6, 2 * itemSize + 10);


        canvas.refresh();
        this.updateLoadingText('Items spritesheet generated.');
    }

    generateUIElements() {
        const buttonWidth = 64;
        const buttonHeight = 24;
        const canvas = this.textures.createCanvas(ASSETS.IMAGES.BUTTON, buttonWidth, buttonHeight);
        if (!canvas) return;
        const ctx = canvas.context;

        // Simple button
        ctx.fillStyle = UI.COLORS.PRIMARY_HEX || '#7b68ee'; // Default to purple if not defined
        ctx.fillRect(0, 0, buttonWidth, buttonHeight);
        ctx.strokeStyle = UI.COLORS.TEXT_DARK_HEX || '#1a1a2e';
        ctx.strokeRect(1, 1, buttonWidth - 2, buttonHeight - 2);
        ctx.fillStyle = UI.COLORS.TEXT_LIGHT_HEX || '#e6e6fa';
        ctx.font = `10px ${GAME.DEFAULT_FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Button', buttonWidth / 2, buttonHeight / 2);

        canvas.refresh();
        this.updateLoadingText('UI elements generated.');
    }

    // --- Animation Creation ---

    createAnimations() {
        // Player Animations
        const playerKey = ASSETS.SPRITESHEETS.PLAYER;
        const frameRate = ANIMATIONS.FRAMERATE;

        // Directions: 0:down, 1:left, 2:right, 3:up
        // Frames: 0:idle, 1:walk
        const directions = ['down', 'left', 'right', 'up'];
        directions.forEach((dir, index) => {
            this.anims.create({
                key: `player_idle_${dir}`,
                frames: this.anims.generateFrameNumbers(playerKey, { start: index * 2, end: index * 2 }),
                frameRate: frameRate / 2,
                repeat: -1
            });
            this.anims.create({
                key: `player_walk_${dir}`,
                frames: this.anims.generateFrameNumbers(playerKey, { frames: [index * 2, index * 2 + 1] }),
                frameRate: frameRate,
                repeat: -1
            });
        });

        // NPC Animations (example for villagers)
        const npcTypes = [
            { key: ASSETS.SPRITESHEETS.VILLAGERS, prefix: 'villager' },
            { key: ASSETS.SPRITESHEETS.MERCHANTS, prefix: 'merchant' },
            { key: ASSETS.SPRITESHEETS.GUARDS, prefix: 'guard' },
        ];

        npcTypes.forEach(npcTypeInfo => {
            const npcSheet = this.textures.get(npcTypeInfo.key);
            if (npcSheet && npcSheet.customData && npcSheet.customData.numVariants !== undefined) {
                 // This part is problematic as canvas textures don't have customData like this.
                 // Assuming numVariants is known or can be derived. For now, let's assume 1 variant if not specified.
                 const numVariants = npcSheet.customData.numVariants || 1; // Fallback if not set

                for (let variant = 0; variant < numVariants; variant++) {
                    directions.forEach((dir, dirIndex) => {
                        const baseFrame = (variant * 4 + dirIndex) * 2;
                        this.anims.create({
                            key: `${npcTypeInfo.prefix}_${variant}_idle_${dir}`,
                            frames: this.anims.generateFrameNumbers(npcTypeInfo.key, { start: baseFrame, end: baseFrame }),
                            frameRate: frameRate / 2,
                            repeat: -1
                        });
                        this.anims.create({
                            key: `${npcTypeInfo.prefix}_${variant}_walk_${dir}`,
                            frames: this.anims.generateFrameNumbers(npcTypeInfo.key, { frames: [baseFrame, baseFrame + 1] }),
                            frameRate: frameRate,
                            repeat: -1
                        });
                    });
                }
            } else { // Fallback if numVariants is not available - assume single variant NPCs
                 directions.forEach((dir, dirIndex) => {
                    const baseFrame = dirIndex * 2; // Assumes 4 directions, 2 frames each for a single variant
                     this.anims.create({
                        key: `${npcTypeInfo.prefix}_0_idle_${dir}`, // Assume variant 0
                        frames: this.anims.generateFrameNumbers(npcTypeInfo.key, { start: baseFrame, end: baseFrame }),
                        frameRate: frameRate / 2,
                        repeat: -1
                    });
                    this.anims.create({
                        key: `${npcTypeInfo.prefix}_0_walk_${dir}`,
                        frames: this.anims.generateFrameNumbers(npcTypeInfo.key, { frames: [baseFrame, baseFrame + 1] }),
                        frameRate: frameRate,
                        repeat: -1
                    });
                });
            }
        });


        this.updateLoadingText('Animations created.');
    }
}
