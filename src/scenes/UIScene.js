/**
 * Fantasy Pixel Adventure
 * UIScene.js - Handles the game's Heads-Up Display (HUD) and UI panels.
 *
 * Features:
 * - Player health and mana bars
 * - Gold display
 * - Quest log (toggle with 'Q')
 * - Mini-map/Compass (placeholder)
 * - Notification system
 * - Buttons for Inventory & Settings (placeholders)
 */

import Phaser from 'phaser';
import { GAME, ASSETS, STATES, UI, PLAYER, QUEST, INVENTORY } from '../utils/Constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: STATES.UI });

        this.healthBar = null;
        this.manaBar = null;
        this.goldText = null;
        this.questLogPanel = null;
        this.questLogVisible = false;
        this.questLogContent = null;
        this.notificationText = null;
        this.miniMap = null;
    }

    preload() {
        // Preload any UI specific assets if not already loaded in BootScene
        // For example, if there are dedicated UI icon spritesheets:
        // this.load.spritesheet(ASSETS.SPRITESHEETS.UI_ICONS, 'assets/sprites/ui_icons.png', { frameWidth: 16, frameHeight: 16 });
    }

    create() {
        console.log('UIScene created');
        this.cameras.main.setBackgroundColor('rgba(0,0,0,0)'); // Transparent background

        // --- Create UI Elements ---
        this.createHealthBar();
        this.createManaBar();
        this.createGoldDisplay();
        this.createQuestLog();
        this.createMiniMap(); // Placeholder
        this.createNotificationArea();
        this.createButtons(); // Inventory, Settings

        // --- Input Handling ---
        this.input.keyboard.on('keydown-Q', this.toggleQuestLog, this);

        // --- Event Listeners ---
        // Listen to events from other scenes or global game events
        const gameEvents = this.game.events;
        gameEvents.on('playerHealthChanged', this.updateHealthBar, this);
        gameEvents.on('playerManaChanged', this.updateManaBar, this);
        gameEvents.on('playerGoldChanged', this.updateGoldDisplay, this);
        gameEvents.on('questAccepted', (quest) => this.showNotification(`New Quest: ${quest.title}`), this);
        gameEvents.on('questObjectiveComplete', (quest) => this.showNotification(`Objective Complete: ${quest.title}`), this);
        gameEvents.on('questCompleted', (quest) => this.showNotification(`Quest Complete: ${quest.title}!`, UI.COLORS.SUCCESS, 5000), this);
        gameEvents.on('questFailed', (quest) => this.showNotification(`Quest Failed: ${quest.title}`, UI.COLORS.DANGER, 5000), this);
        gameEvents.on('questLogNeedsUpdate', this.updateQuestLogDisplay, this); // Custom event if MainScene manages quests

        // Initial UI update based on registry or default values
        this.updateHealthBar(this.registry.get('playerHealth') || PLAYER.START_HEALTH, PLAYER.MAX_HEALTH);
        this.updateManaBar(this.registry.get('playerMana') || PLAYER.START_MANA, PLAYER.MAX_MANA);
        this.updateGoldDisplay(this.registry.get('playerGold') || PLAYER.STARTING_GOLD);
        
        // Ensure this scene is on top
        this.scene.bringToTop();
    }

    createHealthBar() {
        const barWidth = UI.HEALTH_BAR_WIDTH || 150;
        const barHeight = UI.HEALTH_BAR_HEIGHT || 20;
        const x = UI.PADDING.MEDIUM || 10;
        const y = UI.PADDING.MEDIUM || 10;

        // Background
        this.healthBarBg = this.add.graphics();
        this.healthBarBg.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.BACKGROUND_DARK_HEX || '#333333').color, 0.8);
        this.healthBarBg.fillRect(x, y, barWidth, barHeight);
        this.healthBarBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(UI.COLORS.TEXT_DARK_HEX || '#111111').color);
        this.healthBarBg.strokeRect(x, y, barWidth, barHeight);

        // Health fill
        this.healthBar = this.add.graphics();
        this.healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.HEALTH_BAR_COLOR_HEX || '#ff0000').color);
        this.healthBar.fillRect(x, y, barWidth, barHeight); // Initial full health

        this.healthText = this.add.text(x + barWidth / 2, y + barHeight / 2, '', {
            fontFamily: GAME.DEFAULT_FONT,
            fontSize: `${UI.FONT_SIZES.SMALL || 12}px`,
            color: UI.COLORS.TEXT_LIGHT_HEX || '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    updateHealthBar(current, max) {
        if (!this.healthBar || max <= 0) return;
        const barWidth = UI.HEALTH_BAR_WIDTH || 150;
        const x = UI.PADDING.MEDIUM || 10;
        const y = UI.PADDING.MEDIUM || 10;
        const percentage = Phaser.Math.Clamp(current / max, 0, 1);

        this.healthBar.clear();
        this.healthBar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.HEALTH_BAR_COLOR_HEX || '#ff0000').color);
        this.healthBar.fillRect(x, y, barWidth * percentage, UI.HEALTH_BAR_HEIGHT || 20);
        if (this.healthText) this.healthText.setText(`${current}/${max}`);
        
        this.registry.set('playerHealth', current); // Keep registry updated
    }

    createManaBar() {
        const barWidth = UI.MANA_BAR_WIDTH || 120;
        const barHeight = UI.MANA_BAR_HEIGHT || 18;
        const x = UI.PADDING.MEDIUM || 10;
        const y = (UI.PADDING.MEDIUM || 10) + (UI.HEALTH_BAR_HEIGHT || 20) + (UI.PADDING.SMALL || 5);

        this.manaBarBg = this.add.graphics();
        this.manaBarBg.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.BACKGROUND_DARK_HEX || '#333333').color, 0.8);
        this.manaBarBg.fillRect(x, y, barWidth, barHeight);
        this.manaBarBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(UI.COLORS.TEXT_DARK_HEX || '#111111').color);
        this.manaBarBg.strokeRect(x, y, barWidth, barHeight);

        this.manaBar = this.add.graphics();
        this.manaBar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.MANA_BAR_COLOR_HEX || '#0000ff').color);
        this.manaBar.fillRect(x, y, barWidth, barHeight); // Initial full mana

        this.manaText = this.add.text(x + barWidth / 2, y + barHeight / 2, '', {
            fontFamily: GAME.DEFAULT_FONT,
            fontSize: `${UI.FONT_SIZES.SMALL || 12}px`,
            color: UI.COLORS.TEXT_LIGHT_HEX || '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
    }

    updateManaBar(current, max) {
        if (!this.manaBar || max <= 0) return;
        const barWidth = UI.MANA_BAR_WIDTH || 120;
        const x = UI.PADDING.MEDIUM || 10;
        const y = (UI.PADDING.MEDIUM || 10) + (UI.HEALTH_BAR_HEIGHT || 20) + (UI.PADDING.SMALL || 5);
        const percentage = Phaser.Math.Clamp(current / max, 0, 1);

        this.manaBar.clear();
        this.manaBar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.MANA_BAR_COLOR_HEX || '#0000ff').color);
        this.manaBar.fillRect(x, y, barWidth * percentage, UI.MANA_BAR_HEIGHT || 18);
        if (this.manaText) this.manaText.setText(`${current}/${max}`);
        
        this.registry.set('playerMana', current);
    }

    createGoldDisplay() {
        const x = this.scale.width - (UI.PADDING.MEDIUM || 10);
        const y = (UI.PADDING.MEDIUM || 10);
        // Use a gold coin icon if available, otherwise just text
        // this.goldIcon = this.add.image(x - 100, y + 10, ASSETS.IMAGES.GOLD_ICON).setOrigin(1, 0);
        
        this.goldText = this.add.text(x, y, `Gold: 0`, {
            fontFamily: GAME.DEFAULT_FONT,
            fontSize: `${UI.FONT_SIZES.MEDIUM || 16}px`,
            color: UI.COLORS.GOLD_HEX || '#ffd700', // Gold color
            align: 'right'
        }).setOrigin(1, 0);
    }

    updateGoldDisplay(amount) {
        if (this.goldText) this.goldText.setText(`Gold: ${amount}`);
        this.registry.set('playerGold', amount);
    }

    createQuestLog() {
        const panelWidth = (this.scale.width * 0.4) > 400 ? 400 : (this.scale.width * 0.4); // Max 400px or 40% of screen
        const panelHeight = (this.scale.height * 0.6) > 500 ? 500 : (this.scale.height * 0.6);
        const panelX = (this.scale.width - panelWidth) / 2;
        const panelY = (this.scale.height - panelHeight) / 2;

        this.questLogPanel = this.add.container(panelX, panelY);
        this.questLogPanel.setDepth(UI.DIALOG_Z_INDEX || 100); // Ensure it's above other UI

        const background = this.add.graphics();
        background.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.BACKGROUND_MEDIUM_HEX || '#2a2a3e').color, 0.95);
        background.fillRect(0, 0, panelWidth, panelHeight);
        background.lineStyle(UI.BORDER_WIDTH || 2, Phaser.Display.Color.HexStringToColor(UI.COLORS.PRIMARY_HEX || '#7b68ee').color);
        background.strokeRect(0, 0, panelWidth, panelHeight);
        this.questLogPanel.add(background);

        const titleText = this.add.text(panelWidth / 2, (UI.PADDING.MEDIUM || 10), 'Quest Log (Q to close)', {
            fontFamily: GAME.DEFAULT_FONT,
            fontSize: `${UI.FONT_SIZES.LARGE || 20}px`,
            color: UI.COLORS.TEXT_LIGHT_HEX || '#e6e6fa',
            align: 'center'
        }).setOrigin(0.5, 0);
        this.questLogPanel.add(titleText);

        // Content area for quests (scrollable)
        // Using a mask for scrolling
        const contentAreaHeight = panelHeight - (UI.PADDING.LARGE || 24) * 2 - (UI.FONT_SIZES.LARGE || 20);
        const contentAreaY = (UI.PADDING.LARGE || 24) + (UI.FONT_SIZES.LARGE || 20);
        
        this.questLogContent = this.add.container(UI.PADDING.MEDIUM || 10, contentAreaY);
        this.questLogPanel.add(this.questLogContent);

        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.beginPath();
        maskShape.fillRect(panelX + (UI.PADDING.MEDIUM || 10), panelY + contentAreaY, panelWidth - (UI.PADDING.MEDIUM || 10) * 2, contentAreaHeight);
        this.questLogContent.setMask(maskShape.createGeometryMask());

        // Scrollbar (basic visual representation)
        this.questScrollbar = this.add.graphics({ x: panelWidth - (UI.PADDING.SMALL || 5) - 5, y: contentAreaY });
        this.questLogPanel.add(this.questScrollbar);
        this._drawScrollbar(0, contentAreaHeight, contentAreaHeight); // Initially full scroll

        // Input for scrolling (mouse wheel)
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.questLogVisible && this.questLogContent.list.length > 0) {
                const scrollAmount = deltaY * 0.5;
                this.questLogContent.y -= scrollAmount;
                
                // Clamp scrolling
                const contentHeight = this.questLogContent.getBounds().height;
                const maxScroll = 0; // Top position
                const minScroll = contentAreaHeight - contentHeight; // Bottom position
                
                this.questLogContent.y = Phaser.Math.Clamp(this.questLogContent.y, minScroll, maxScroll);
                this._drawScrollbar(Math.abs(this.questLogContent.y), contentHeight, contentAreaHeight);
            }
        });


        this.questLogPanel.setVisible(false);
    }

    _drawScrollbar(scrollTop, contentHeight, visibleHeight) {
        this.questScrollbar.clear();
        if (contentHeight <= visibleHeight) return; // No scrollbar needed

        const scrollbarTrackHeight = visibleHeight - (UI.PADDING.SMALL || 5) * 2;
        const scrollbarThumbHeight = Math.max(20, scrollbarTrackHeight * (visibleHeight / contentHeight));
        const scrollbarThumbY = (scrollTop / (contentHeight - visibleHeight)) * (scrollbarTrackHeight - scrollbarThumbHeight);

        this.questScrollbar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.BACKGROUND_DARK_HEX || '#111').color, 0.5);
        this.questScrollbar.fillRect(0, UI.PADDING.SMALL || 5, 5, scrollbarTrackHeight);
        
        this.questScrollbar.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.PRIMARY_HEX || '#7b68ee').color, 0.8);
        this.questScrollbar.fillRect(0, (UI.PADDING.SMALL || 5) + scrollbarThumbY, 5, scrollbarThumbHeight);
    }

    toggleQuestLog() {
        this.questLogVisible = !this.questLogVisible;
        this.questLogPanel.setVisible(this.questLogVisible);
        if (this.questLogVisible) {
            this.updateQuestLogDisplay();
        }
        // Pause/resume MainScene if quest log is modal
        // this.scene.get(STATES.MAIN).scene.pause(this.questLogVisible);
    }

    updateQuestLogDisplay() {
        if (!this.questLogVisible || !this.questLogContent) return;

        this.questLogContent.removeAll(true); // Clear previous entries
        let yPos = 0;

        // Fetch active quests from QuestSystem (assuming it's on global game systems)
        const questSystem = window.GAME_SYSTEMS ? window.GAME_SYSTEMS.quest : null;
        const activeQuests = questSystem ? questSystem.getActiveQuests() : this.registry.get('activeQuests') || [];

        if (activeQuests.length === 0) {
            const noQuestsText = this.add.text(0, yPos, 'No active quests.', {
                fontFamily: GAME.DEFAULT_FONT,
                fontSize: `${UI.FONT_SIZES.MEDIUM || 16}px`,
                color: UI.COLORS.TEXT_SECONDARY_HEX || '#aaaaaa',
                wordWrap: { width: (this.questLogPanel.getBounds().width) - (UI.PADDING.MEDIUM || 10) * 3 }
            });
            this.questLogContent.add(noQuestsText);
            return;
        }

        activeQuests.forEach(quest => {
            const questTitle = this.add.text(0, yPos, quest.title || 'Unknown Quest', {
                fontFamily: GAME.DEFAULT_FONT,
                fontSize: `${UI.FONT_SIZES.MEDIUM || 16}px`,
                color: UI.COLORS.TEXT_LIGHT_HEX || '#ffffff',
                fontStyle: 'bold'
            });
            this.questLogContent.add(questTitle);
            yPos += (UI.FONT_SIZES.MEDIUM || 16) + (UI.PADDING.SMALL || 5);

            const questDesc = this.add.text(UI.PADDING.SMALL || 5, yPos, quest.description || 'No description.', {
                fontFamily: GAME.DEFAULT_FONT,
                fontSize: `${UI.FONT_SIZES.SMALL || 12}px`,
                color: UI.COLORS.TEXT_SECONDARY_HEX || '#dddddd',
                wordWrap: { width: (this.questLogPanel.getBounds().width) - (UI.PADDING.MEDIUM || 10) * 4 }
            });
            this.questLogContent.add(questDesc);
            yPos += questDesc.getBounds().height + (UI.PADDING.SMALL || 5);

            (quest.objectives || []).forEach(obj => {
                const objectiveText = this.add.text(UI.PADDING.MEDIUM || 10, yPos, `- ${obj.text} (${obj.status || 'incomplete'})`, {
                    fontFamily: GAME.DEFAULT_FONT,
                    fontSize: `${UI.FONT_SIZES.SMALL || 12}px`,
                    color: (obj.status === 'complete' ? UI.COLORS.SUCCESS_HEX : UI.COLORS.TEXT_SECONDARY_HEX) || '#cccccc',
                     wordWrap: { width: (this.questLogPanel.getBounds().width) - (UI.PADDING.MEDIUM || 10) * 5 }
                });
                this.questLogContent.add(objectiveText);
                yPos += objectiveText.getBounds().height + (UI.PADDING.XSMALL || 2);
            });
            yPos += (UI.PADDING.MEDIUM || 10); // Spacer between quests
        });
        
        // Reset scroll position and update scrollbar
        this.questLogContent.y = 0;
        const contentHeight = this.questLogContent.getBounds().height;
        const visibleHeight = this.questLogPanel.getBounds().height - (UI.PADDING.LARGE || 24) * 2 - (UI.FONT_SIZES.LARGE || 20);
        this._drawScrollbar(0, contentHeight, visibleHeight);
    }

    createMiniMap() {
        const mapSize = UI.MINIMAP_SIZE || 100;
        const x = this.scale.width - mapSize - (UI.PADDING.MEDIUM || 10);
        const y = this.scale.height - mapSize - (UI.PADDING.MEDIUM || 10);

        this.miniMap = this.add.graphics();
        this.miniMap.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.BACKGROUND_DARK_HEX || '#000000').color, 0.7);
        this.miniMap.fillRect(x, y, mapSize, mapSize);
        this.miniMap.lineStyle(1, Phaser.Display.Color.HexStringToColor(UI.COLORS.PRIMARY_HEX || '#7b68ee').color);
        this.miniMap.strokeRect(x, y, mapSize, mapSize);

        // Placeholder for player dot or compass needle
        this.miniMapPlayerDot = this.add.graphics();
        this.miniMapPlayerDot.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.ACCENT_SECONDARY_HEX || '#4deeea').color); // Player color
        this.miniMapPlayerDot.fillCircle(x + mapSize / 2, y + mapSize / 2, 3); // Center dot
        
        // Compass (simple N text)
        this.compassText = this.add.text(x + mapSize / 2, y + (UI.PADDING.SMALL || 5), 'N', {
             fontFamily: GAME.DEFAULT_FONT, fontSize: `${UI.FONT_SIZES.SMALL || 10}px`, color: UI.COLORS.TEXT_LIGHT_HEX || '#fff'
        }).setOrigin(0.5,0);
    }

    // updateMiniMap() { /* Logic to update mini-map based on player position/rotation */ }

    createNotificationArea() {
        this.notificationText = this.add.text(
            this.scale.width / 2,
            (UI.PADDING.LARGE || 24),
            '',
            {
                fontFamily: GAME.DEFAULT_FONT,
                fontSize: `${UI.FONT_SIZES.MEDIUM || 16}px`,
                color: UI.COLORS.TEXT_LIGHT_HEX || '#ffffff',
                backgroundColor: UI.COLORS.BACKGROUND_MEDIUM_HEX || '#2a2a3eAA', // Semi-transparent background
                padding: { x: UI.PADDING.MEDIUM || 10, y: UI.PADDING.SMALL || 5 },
                align: 'center',
                fixedWidth: this.scale.width * 0.6, // Max width for notification
                wordWrap: { width: this.scale.width * 0.6 - 20 }
            }
        ).setOrigin(0.5, 0).setDepth(UI.NOTIFICATION_Z_INDEX || 110).setVisible(false);
    }

    showNotification(message, color = UI.COLORS.TEXT_LIGHT_HEX || '#ffffff', duration = UI.NOTIFICATION_DURATION || 3000) {
        if (!this.notificationText) return;

        this.notificationText.setText(message);
        this.notificationText.setColor(color);
        this.notificationText.setVisible(true);
        this.notificationText.setAlpha(1);

        // Clear any existing tweens
        if (this.notificationTween) this.notificationTween.stop();
        if (this.notificationTimer) this.notificationTimer.remove();

        this.notificationTimer = this.time.delayedCall(duration - 500, () => { // Start fade out 500ms before end
            this.notificationTween = this.tweens.add({
                targets: this.notificationText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.notificationText.setVisible(false);
                }
            });
        });
    }

    createButtons() {
        const buttonY = this.scale.height - (UI.PADDING.MEDIUM || 10) - (UI.BUTTON_HEIGHT || 30);
        const buttonSpacing = (UI.BUTTON_WIDTH || 80) + (UI.PADDING.MEDIUM || 10);

        // Inventory Button
        this.inventoryButton = this._createPlaceholderButton(
            (UI.PADDING.MEDIUM || 10),
            buttonY,
            'Inv (I)',
            () => {
                this.showNotification('Inventory Clicked (Scene not implemented)');
                // this.scene.launch(STATES.INVENTORY);
                // this.scene.pause(STATES.MAIN);
            }
        );

        // Settings Button
        this.settingsButton = this._createPlaceholderButton(
            (UI.PADDING.MEDIUM || 10) + buttonSpacing,
            buttonY,
            'Menu (Esc)',
            () => {
                this.showNotification('Settings Clicked (Scene not implemented)');
                // this.scene.launch(STATES.SETTINGS_MENU);
                // this.scene.pause(STATES.MAIN);
            }
        );
    }

    _createPlaceholderButton(x, y, text, callback) {
        const btnWidth = UI.BUTTON_WIDTH || 80;
        const btnHeight = UI.BUTTON_HEIGHT || 30;

        const buttonContainer = this.add.container(x, y);

        const graphics = this.add.graphics();
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.PRIMARY_HEX || '#7b68ee').color, 0.8);
        graphics.fillRect(0, 0, btnWidth, btnHeight);
        graphics.lineStyle(1, Phaser.Display.Color.HexStringToColor(UI.COLORS.TEXT_DARK_HEX || '#111111').color);
        graphics.strokeRect(0, 0, btnWidth, btnHeight);
        buttonContainer.add(graphics);

        const buttonText = this.add.text(btnWidth / 2, btnHeight / 2, text, {
            fontFamily: GAME.DEFAULT_FONT,
            fontSize: `${UI.FONT_SIZES.SMALL || 12}px`,
            color: UI.COLORS.TEXT_LIGHT_HEX || '#ffffff',
            align: 'center'
        }).setOrigin(0.5);
        buttonContainer.add(buttonText);

        buttonContainer.setSize(btnWidth, btnHeight).setInteractive({ useHandCursor: true });
        buttonContainer.on('pointerdown', callback);
        buttonContainer.on('pointerover', () => graphics.fillGradientStyle(0x9c88ff, 0x9c88ff, 0x7b68ee, 0x7b68ee, 1)); // Lighter on hover
        buttonContainer.on('pointerout', () => graphics.fillStyle(Phaser.Display.Color.HexStringToColor(UI.COLORS.PRIMARY_HEX || '#7b68ee').color, 0.8));


        return buttonContainer;
    }

    update(time, delta) {
        // Update dynamic UI elements if needed (e.g., compass rotation)
        // this.updateMiniMap();
    }
}
