/**
 * Fantasy Pixel Adventure
 * A 2D top-down pixel fantasy game with Grok-powered NPCs
 * 
 * main.js - Game entry point and configuration
 */

import Phaser from 'phaser';

// Import scenes (these will be created in separate files)
import BootScene from './scenes/BootScene.js';
import MainScene from './scenes/MainScene.js';
import UIScene from './scenes/UIScene.js';
import ChatScene from './scenes/ChatScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import QuestLogScene from './scenes/QuestLogScene.js';

// Import core systems
import { QuestSystem } from './systems/QuestSystem.js';
import { ChatSystem } from './systems/ChatSystem.js';
import { MapGenerator } from './systems/MapGenerator.js';
import { APIHandler } from './systems/APIHandler.js';

// Game configuration constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PIXEL_ART_SCALE = 3; // Each pixel in assets is rendered as 3x3 pixels
const TARGET_FPS = 60;

// Initialize core systems
const questSystem = new QuestSystem();
const chatSystem = new ChatSystem();
const mapGenerator = new MapGenerator();
const apiHandler = new APIHandler();

// Make systems globally available (could use a proper dependency injection system in a larger game)
window.GAME_SYSTEMS = {
    quest: questSystem,
    chat: chatSystem,
    map: mapGenerator,
    api: apiHandler
};

// Phaser game configuration
const config = {
    type: Phaser.AUTO, // Let Phaser decide between WebGL and Canvas based on browser support
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: '#0a0a12', // Dark background matching CSS
    pixelArt: true, // Enable pixel art mode (disables image smoothing)
    roundPixels: true, // Avoid pixel interpolation
    antialias: false, // Disable antialiasing for crisp pixel rendering
    powerPreference: 'high-performance', // Request high-performance GPU settings
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for top-down game
            debug: false, // Set to true during development to see physics bodies
            fps: TARGET_FPS // Target 60 FPS for smooth gameplay
        }
    },
    scale: {
        mode: Phaser.Scale.FIT, // Scale to fit inside the parent container
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    render: {
        batchSize: 2048, // Increase sprite batch size for better performance
        pipeline: {
            name: 'MainPipeline',
            antialias: false, // Disable antialiasing in the render pipeline
        }
    },
    fps: {
        target: TARGET_FPS, // Target 60 FPS
        forceSetTimeOut: false, // Use requestAnimationFrame by default
        deltaHistory: 10 // How many frames to calculate average delta
    },
    scene: [
        BootScene,
        MainScene,
        UIScene,
        ChatScene,
        InventoryScene,
        QuestLogScene
    ]
};

// Initialize the game when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create the Phaser game instance
    const game = new Phaser.Game(config);
    
    // Store game instance globally for debugging
    window.game = game;
    
    // Handle loading screen
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const loadingText = document.getElementById('loading-text');
    
    // Update loading progress
    game.events.on('boot', () => {
        loadingText.textContent = 'Booting game engine...';
    });
    
    game.events.on('filecomplete', (progress) => {
        loadingBar.style.width = `${progress}%`;
        loadingText.textContent = `Loading assets: ${Math.floor(progress)}%`;
    });
    
    // Hide loading screen when game is ready
    game.events.once('ready', () => {
        loadingText.textContent = 'Starting adventure...';
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    });
    
    // Handle window resize events
    window.addEventListener('resize', () => {
        game.scale.refresh();
    });
    
    // Handle visibility change (pause game when tab is inactive)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            game.scene.getScenes(true).forEach(scene => {
                if (scene.scene.isActive()) {
                    scene.scene.pause();
                }
            });
        } else {
            game.scene.getScenes(true).forEach(scene => {
                if (scene.scene.isPaused()) {
                    scene.scene.resume();
                }
            });
        }
    });
    
    // Initialize chat UI event listeners
    const chatOverlay = document.getElementById('chat-overlay');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');
    const closeButton = document.getElementById('close-chat');
    const storeButton = document.getElementById('store-button');
    
    // Close chat when close button is clicked
    closeButton.addEventListener('click', () => {
        chatOverlay.classList.add('hidden');
        game.scene.resume('MainScene');
    });
    
    // Send message when send button is clicked or Enter is pressed
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message) {
            // Notify the game about the new message
            const activeScene = game.scene.getScene('ChatScene');
            if (activeScene && activeScene.handlePlayerMessage) {
                activeScene.handlePlayerMessage(message);
            }
            chatInput.value = '';
        }
    };
    
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Store button functionality
    storeButton.addEventListener('click', () => {
        const activeScene = game.scene.getScene('ChatScene');
        if (activeScene && activeScene.openStore) {
            activeScene.openStore();
        }
    });
    
    // Expose a method to show/hide the chat overlay
    window.toggleChat = (show, npcName = '', isStore = false) => {
        if (show) {
            document.getElementById('npc-name').textContent = npcName;
            chatOverlay.classList.remove('hidden');
            chatInput.focus();
            
            // Show/hide store button based on NPC type
            if (isStore) {
                storeButton.classList.remove('hidden');
            } else {
                storeButton.classList.add('hidden');
            }
            
            // Clear previous messages
            document.getElementById('chat-messages').innerHTML = '';
            
            // Pause the main game scene while chatting
            game.scene.pause('MainScene');
        } else {
            chatOverlay.classList.add('hidden');
            game.scene.resume('MainScene');
        }
    };
    
    // Debug performance monitor (only in development)
    if (process.env.NODE_ENV === 'development') {
        game.plugins.add({
            key: 'PerformanceMonitor',
            plugin: Phaser.Plugins.PerformanceMonitor,
            mapping: 'performanceMonitor',
            start: true
        });
    }
    
    console.log('Fantasy Pixel Adventure initialized successfully!');
});

// Handle errors gracefully
window.addEventListener('error', (e) => {
    console.error('Game Error:', e.error);
    // You could add error reporting to your backend here
});

// Export game configuration for use in other modules
export const gameConfig = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    pixelScale: PIXEL_ART_SCALE,
    targetFps: TARGET_FPS
};
