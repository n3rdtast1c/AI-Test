/**
 * Fantasy Pixel Adventure
 * MainScene.js - Core gameplay scene
 *
 * Handles:
 * - Player character creation and movement
 * - NPC spawning and basic AI
 * - Basic town layout with tiles
 * - Collision detection
 * - Player-NPC interaction system
 * - Integration with chat system
 */

import Phaser from 'phaser';
import { GAME, ASSETS, STATES, WORLD, PLAYER, NPC, CAMERA, UI, PHYSICS } from '../utils/Constants.js';

// Player class (can be moved to entities/Player.js later)
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.SPRITESHEETS.PLAYER, 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.body.setSize(PHYSICS.PLAYER_BODY_SIZE.width, PHYSICS.PLAYER_BODY_SIZE.height);
        this.body.setOffset(PHYSICS.PLAYER_BODY_SIZE.offsetX, PHYSICS.PLAYER_BODY_SIZE.offsetY);
        
        this.speed = PLAYER.MOVE_SPEED;
        this.sprintMultiplier = PLAYER.SPRINT_MULTIPLIER;
        this.facing = 'down'; // 'up', 'down', 'left', 'right'
        this.interactionRadius = PLAYER.INTERACTION_RADIUS;
        this.isInteracting = false;

        // Create animations if not already created (defensive)
        this.createPlayerAnimations(scene);
    }

    createPlayerAnimations(scene) {
        const anims = scene.anims;
        const playerKey = ASSETS.SPRITESHEETS.PLAYER;
        const frameRate = PLAYER.ANIM_FRAMERATE || 8; // Use constant or default

        if (!anims.exists('player_idle_down')) {
            const directions = ['down', 'left', 'right', 'up'];
            directions.forEach((dir, index) => {
                anims.create({
                    key: `player_idle_${dir}`,
                    frames: anims.generateFrameNumbers(playerKey, { start: index * 2, end: index * 2 }),
                    frameRate: frameRate / 2,
                    repeat: -1
                });
                anims.create({
                    key: `player_walk_${dir}`,
                    frames: anims.generateFrameNumbers(playerKey, { frames: [index * 2, index * 2 + 1] }),
                    frameRate: frameRate,
                    repeat: -1
                });
            });
        }
    }

    update(cursors, keys, delta) {
        if (this.isInteracting) {
            this.setVelocity(0, 0);
            this.play(`player_idle_${this.facing}`, true);
            return;
        }

        let velocityX = 0;
        let velocityY = 0;
        const currentSpeed = keys.SPACE.isDown ? this.speed * this.sprintMultiplier : this.speed;

        if (keys.A.isDown || cursors.left.isDown) {
            velocityX = -currentSpeed;
            this.facing = 'left';
        } else if (keys.D.isDown || cursors.right.isDown) {
            velocityX = currentSpeed;
            this.facing = 'right';
        }

        if (keys.W.isDown || cursors.up.isDown) {
            velocityY = -currentSpeed;
            this.facing = 'up';
        } else if (keys.S.isDown || cursors.down.isDown) {
            velocityY = currentSpeed;
            this.facing = 'down';
        }

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= PLAYER.DIAGONAL_SPEED_MODIFIER;
            velocityY *= PLAYER.DIAGONAL_SPEED_MODIFIER;
        }

        this.setVelocity(velocityX, velocityY);

        if (velocityX !== 0 || velocityY !== 0) {
            this.play(`player_walk_${this.facing}`, true);
        } else {
            this.play(`player_idle_${this.facing}`, true);
        }
    }

    startInteraction() {
        this.isInteracting = true;
    }

    endInteraction() {
        this.isInteracting = false;
    }
}

// NPC class (can be moved to entities/NPC.js later)
class SimpleNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key, frame, name, type, isStore = false) {
        super(scene, x, y, key, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true);
        this.setImmovable(true); // NPCs are usually static or have controlled movement
        this.body.setSize(PHYSICS.NPC_BODY_SIZE.width, PHYSICS.NPC_BODY_SIZE.height);
        this.body.setOffset(PHYSICS.NPC_BODY_SIZE.offsetX, PHYSICS.NPC_BODY_SIZE.offsetY);

        this.npcName = name;
        this.npcType = type;
        this.is_store = isStore;
        this.facing = 'down';
        this.dialogueContext = `This is ${name}, a ${type}.`;
        if (isStore) {
            this.dialogueContext += ` ${name} runs a store.`;
        }

        this.wanderTimer = scene.time.addEvent({
            delay: Phaser.Math.Between(3000, 7000),
            callback: this.startWandering,
            callbackScope: this,
            loop: true
        });
        this.isWandering = false;

        // Create animations if not already created
        this.createNpcAnimations(scene, key, type);
        this.play(`${this.npcType}_0_idle_${this.facing}`, true);
    }

    createNpcAnimations(scene, key, typePrefix) {
        const anims = scene.anims;
        const frameRate = NPC.ANIM_FRAMERATE || 6; // Use constant or default

        if (!anims.exists(`${typePrefix}_0_idle_down`)) {
            const directions = ['down', 'left', 'right', 'up'];
            // Assuming 1 variant (0) for simplicity here, as BootScene might create more
            const variant = 0; 
            directions.forEach((dir, index) => {
                const baseFrame = (variant * 4 + index) * 2; // From BootScene logic
                 if (scene.textures.get(key).frameTotal > baseFrame + 1) { // Check if frames exist
                    anims.create({
                        key: `${typePrefix}_${variant}_idle_${dir}`,
                        frames: anims.generateFrameNumbers(key, { start: baseFrame, end: baseFrame }),
                        frameRate: frameRate / 2,
                        repeat: -1
                    });
                    anims.create({
                        key: `${typePrefix}_${variant}_walk_${dir}`,
                        frames: anims.generateFrameNumbers(key, { frames: [baseFrame, baseFrame + 1] }),
                        frameRate: frameRate,
                        repeat: -1
                    });
                }
            });
        }
    }


    startWandering() {
        if (this.isWandering || !this.active) return;
        this.isWandering = true;

        const wanderX = this.x + Phaser.Math.Between(-NPC.WANDER_RADIUS / 2, NPC.WANDER_RADIUS / 2);
        const wanderY = this.y + Phaser.Math.Between(-NPC.WANDER_RADIUS / 2, NPC.WANDER_RADIUS / 2);

        // Determine direction
        const dx = wanderX - this.x;
        const dy = wanderY - this.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.facing = dx > 0 ? 'right' : 'left';
        } else {
            this.facing = dy > 0 ? 'down' : 'up';
        }
        this.play(`${this.npcType}_0_walk_${this.facing}`, true);


        this.scene.physics.moveTo(this, wanderX, wanderY, NPC.DEFAULT_MOVE_SPEED);

        this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
            if(this.active) {
                this.setVelocity(0, 0);
                this.play(`${this.npcType}_0_idle_${this.facing}`, true);
                this.isWandering = false;
            }
        });
    }

    update() {
        if (this.body.velocity.x === 0 && this.body.velocity.y === 0 && !this.isWandering) {
             this.play(`${this.npcType}_0_idle_${this.facing}`, true);
        }
    }

    destroy(fromScene) {
        if (this.wanderTimer) this.wanderTimer.destroy();
        super.destroy(fromScene);
    }
}


export default class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: STATES.MAIN });
        this.player = null;
        this.npcs = null;
        this.map = null;
        this.cursors = null;
        this.keys = null;
        this.interactingNPC = null;
    }

    init(data) {
        // Player starting position can be passed via data
        this.startPos = data.startPos || { x: WORLD.TOWN_WIDTH * WORLD.TILE_SIZE / 2, y: WORLD.TOWN_HEIGHT * WORLD.TILE_SIZE / 2 };
    }

    create() {
        this.cameras.main.setBackgroundColor(GAME.BACKGROUND_COLOR);
        this.createMap();
        this.createPlayer();
        this.createNPCs();
        this.setupCollisions();
        this.setupCamera();
        this.setupInput();

        // Launch UI Scene in parallel
        if (!this.scene.isActive(STATES.UI)) {
            this.scene.launch(STATES.UI);
        }

        this.events.on('resume', this.onResume, this);
        this.events.on('pause', this.onPause, this);
    }

    onResume() {
        if (this.player) this.player.endInteraction();
        this.interactingNPC = null;
        // Re-enable input if necessary, though Phaser usually handles this well
        if (this.keys) {
            Object.values(this.keys).forEach(key => key.reset());
        }
        if (this.cursors) {
            Object.values(this.cursors).forEach(key => key.reset());
        }
    }
    
    onPause() {
        if (this.player) this.player.startInteraction(); // Visually stop player
    }

    createMap() {
        // Simple map data: 0 = grass, 1 = path, 3 = wall
        const mapData = [
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
            [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
            [3, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 3],
            [3, 0, 1, 0, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 0, 1, 0, 0, 3],
            [3, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 3],
            [3, 0, 1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 3],
            [3, 0, 1, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 3, 0, 0, 1, 0, 0, 3],
            [3, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 3],
            [3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3],
            [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        ];
        
        this.map = this.make.tilemap({ data: mapData, tileWidth: WORLD.TILE_SIZE, tileHeight: WORLD.TILE_SIZE });
        const tileset = this.map.addTilesetImage(ASSETS.TILESETS.TOWN, ASSETS.TILESETS.TOWN, WORLD.TILE_SIZE, WORLD.TILE_SIZE, 0, 0);

        this.groundLayer = this.map.createLayer(0, tileset, 0, 0);
        // Create a separate layer for obstacles if needed, or use properties
        // For this simple map, we can use createFromTiles for obstacles
        this.obstacleLayer = this.map.createLayer(0, tileset, 0, 0); // Re-use layer for collision
        this.map.setCollision(3, true, true, 0); // Tile index 3 is collidable

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    createPlayer() {
        this.player = new Player(this, this.startPos.x, this.startPos.y);
    }

    createNPCs() {
        this.npcs = this.physics.add.group({
            classType: SimpleNPC,
            runChildUpdate: true // So each NPC's update method is called
        });

        // Spawn some NPCs
        this.npcs.add(new SimpleNPC(this, this.startPos.x + 60, this.startPos.y, ASSETS.SPRITESHEETS.VILLAGERS, 0, 'Old Man Willow', 'villager'));
        this.npcs.add(new SimpleNPC(this, this.startPos.x - 60, this.startPos.y + 30, ASSETS.SPRITESHEETS.MERCHANTS, 0, 'Sarah the Seller', 'merchant', true));
        this.npcs.add(new SimpleNPC(this, this.startPos.x, this.startPos.y - 50, ASSETS.SPRITESHEETS.GUARDS, 0, 'Guard Gregor', 'guard'));
    
        // Example of an NPC that might give a quest
        const questGiver = new SimpleNPC(this, this.startPos.x + 100, this.startPos.y + 50, ASSETS.SPRITESHEETS.VILLAGERS, 0, 'Lost Lady Lira', 'villager');
        questGiver.dialogueContext = "This is Lira. She seems distressed and might have lost something important.";
        this.npcs.add(questGiver);
    }

    setupCollisions() {
        this.physics.add.collider(this.player, this.obstacleLayer);
        this.physics.add.collider(this.npcs, this.obstacleLayer);
        this.physics.add.collider(this.player, this.npcs, this.handlePlayerNpcCollision, null, this);
        this.physics.add.collider(this.npcs, this.npcs); // NPCs collide with each other
    }

    handlePlayerNpcCollision(player, npc) {
        // Can add logic here if collision itself should do something,
        // e.g., stop NPC wandering when bumped.
        // For interaction, we use proximity and key press.
    }

    setupCamera() {
        this.cameras.main.startFollow(this.player, true, CAMERA.FOLLOW_LERP, CAMERA.FOLLOW_LERP);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(CAMERA.ZOOM_LEVEL);
        // If using pixel art assets that are 1x and need scaling:
        // this.cameras.main.setZoom(GAME.PIXEL_SCALE * CAMERA.ZOOM_LEVEL);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            E: Phaser.Input.Keyboard.KeyCodes.E,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.input.keyboard.on('keydown-E', this.tryInteract, this);
    }

    tryInteract() {
        if (this.player.isInteracting) return; // Already interacting or chat is open

        let closestNpc = null;
        let minDistance = this.player.interactionRadius;

        this.npcs.getChildren().forEach(npc => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestNpc = npc;
            }
        });

        if (closestNpc) {
            this.interactingNPC = closestNpc;
            this.player.startInteraction(); // Stop player movement

            // Face the NPC
            const dx = closestNpc.x - this.player.x;
            const dy = closestNpc.y - this.player.y;
            if (Math.abs(dx) > Math.abs(dy)) {
                this.player.facing = dx > 0 ? 'right' : 'left';
            } else {
                this.player.facing = dy > 0 ? 'down' : 'up';
            }
            this.player.play(`player_idle_${this.player.facing}`, true);


            // Open chat UI (handled by main.js DOM manipulation)
            // Pass NPC data to the chat system
            window.toggleChat(true, closestNpc.npcName, closestNpc.is_store, closestNpc);
            
            // The main.js toggleChat function should pause this scene.
            // this.scene.pause(); // This will be handled by toggleChat
            // this.scene.launch(STATES.CHAT, { npc: closestNpc }); // If using a Phaser scene for chat
        }
    }

    update(time, delta) {
        if (!this.player || !this.npcs) return;

        this.player.update(this.cursors, this.keys, delta);
        
        // NPCs update method is called by the group if runChildUpdate is true
        // this.npcs.getChildren().forEach(npc => npc.update(time, delta));
    }
}
