/**
 * Fantasy Pixel Adventure
 * QuestSystem.js - Manages quests, parsing, and procedural generation triggers
 */

import { QUEST, GROK_API, WORLD } from '../utils/Constants.js';

export class QuestSystem {
    constructor(scene) {
        this.scene = scene; // Phaser scene instance, for accessing other systems and game world
        this.activeQuests = new Map(); // Map of questId to questObject
        this.completedQuests = new Map();
        this.nextQuestId = 1;

        // Regex patterns for parsing Grok responses
        this.patterns = {
            createQuest: QUEST.COMMAND_REGEX || /\(create\.quest:\s*(.*?)\)/i,
            description: QUEST.DESCRIPTION_REGEX || /\(quest description:\s*(.*?)\)/i,
            buildingType: QUEST.BUILDING_REGEX || /\(building\.type:\s*(.*?)\)/i,
            location: QUEST.LOCATION_REGEX || /\(location:\s*(.*?)\)/i,
            reward: QUEST.REWARD_REGEX || /\(reward:\s*(.*?)\)/i,
            difficulty: QUEST.DIFFICULTY_REGEX || /\(difficulty:\s*(.*?)\)/i,
            target: /\(target:\s*(.*?)\)/i,
            item: /\(item:\s*(.*?)\)/i,
            objective: /\(objective:\s*(.*?)\)/i,
            // Generic command pattern
            genericCommand: GROK_API.COMMAND_PATTERN || /\((.*?):\s*(.*?)\)/g,
        };

        console.log('QuestSystem initialized.');
    }

    /**
     * Parses a Grok response string and attempts to create a quest.
     * @param {string} grokResponseText - The text response from Grok.
     * @param {object} npcContext - Context about the NPC giving the quest.
     * @returns {object|null} The created quest object or null if no quest command found.
     */
    parseAndCreateQuest(grokResponseText, npcContext = {}) {
        const parsedCommands = this.extractCommands(grokResponseText);

        const questTitleCommand = parsedCommands['create.quest'];
        if (!questTitleCommand) {
            // console.log('No "create.quest" command found in Grok response.');
            return null;
        }

        const questId = `Q${this.nextQuestId++}`;
        const questData = {
            id: questId,
            title: questTitleCommand.trim(),
            description: (parsedCommands['quest description'] || 'No description provided.').trim(),
            status: 'active', // 'active', 'completed', 'failed'
            giver: npcContext.name || 'Unknown NPC',
            npcId: npcContext.id || null,
            objectives: [],
            rewards: this.parseRewards(parsedCommands.reward),
            difficulty: (parsedCommands.difficulty || QUEST.DIFFICULTIES.MEDIUM).trim().toLowerCase(),
            creationTime: Date.now(),
            locationHint: (parsedCommands.location || '').trim(),
            buildingTypeHint: (parsedCommands['building.type'] || '').trim(),
            targetHint: (parsedCommands.target || '').trim(),
            itemHint: (parsedCommands.item || '').trim(),
            rawCommands: parsedCommands,
            generatedLocation: null, // To be filled by procedural generation
        };

        // Infer quest type and objectives (basic inference for now)
        this.inferObjectives(questData);

        // Handle procedural generation if needed
        if (questData.buildingTypeHint || (questData.locationHint && !this.scene.mapManager.locationExists(questData.locationHint))) {
            const generatedArea = this.triggerProceduralGeneration(questData);
            if (generatedArea) {
                questData.generatedLocation = generatedArea;
                // Update objectives with specific location if applicable
                questData.objectives.forEach(obj => {
                    if (obj.needsGeneratedLocation) {
                        obj.targetLocation = generatedArea.name;
                        obj.targetCoordinates = generatedArea.entryPoint;
                    }
                });
            } else {
                console.warn(`Quest ${questId}: Failed to generate procedural area for building "${questData.buildingTypeHint}" or location "${questData.locationHint}". Quest might be uncompletable.`);
                // Potentially mark quest as failed or handle differently
            }
        }

        this.activeQuests.set(questId, questData);
        console.log(`QuestSystem: Created Quest - ID: ${questId}, Title: ${questData.title}`);
        this.scene.game.events.emit('questAccepted', questData);
        this.updateQuestLogUI();

        return questData;
    }

    /**
     * Extracts all commands in the format (key: value) from a string.
     * @param {string} text - The text to parse.
     * @returns {object} An object where keys are command names and values are their content.
     */
    extractCommands(text) {
        const commands = {};
        let match;
        // Use the generic command pattern from constants
        const regex = new RegExp(this.patterns.genericCommand);
        while ((match = regex.exec(text)) !== null) {
            const key = match[1].trim().toLowerCase();
            const value = match[2].trim();
            commands[key] = value;
        }
        return commands;
    }

    /**
     * Infers objectives based on quest title and other hints.
     * @param {object} questData - The quest data object.
     */
    inferObjectives(questData) {
        // Basic inference logic. This can be expanded significantly.
        const titleLower = questData.title.toLowerCase();
        let objectiveText = questData.rawCommands.objective || questData.description;

        if (titleLower.includes('fetch') || titleLower.includes('retrieve') || titleLower.includes('get')) {
            questData.type = QUEST.TYPES.FETCH;
            const item = questData.itemHint || this.extractNounPhrase(questData.title, ['fetch', 'retrieve', 'get']);
            questData.objectives.push({
                text: `Fetch ${item}`,
                type: QUEST.TYPES.FETCH,
                targetItem: item,
                targetLocation: questData.locationHint,
                buildingType: questData.buildingTypeHint,
                status: 'incomplete',
                needsGeneratedLocation: !!questData.buildingTypeHint || (questData.locationHint && !this.scene.mapManager.locationExists(questData.locationHint)),
            });
        } else if (titleLower.includes('kill') || titleLower.includes('defeat') || titleLower.includes('slay')) {
            questData.type = QUEST.TYPES.KILL;
            const target = questData.targetHint || this.extractNounPhrase(questData.title, ['kill', 'defeat', 'slay']);
            questData.objectives.push({
                text: `Defeat ${target}`,
                type: QUEST.TYPES.KILL,
                targetEnemy: target,
                count: questData.rawCommands.count ? parseInt(questData.rawCommands.count) : 1,
                targetLocation: questData.locationHint,
                buildingType: questData.buildingTypeHint,
                status: 'incomplete',
                needsGeneratedLocation: !!questData.buildingTypeHint || (questData.locationHint && !this.scene.mapManager.locationExists(questData.locationHint)),
            });
        } else if (titleLower.includes('talk to') || titleLower.includes('speak with')) {
            questData.type = QUEST.TYPES.TALK;
            const targetNPC = questData.targetHint || this.extractNounPhrase(questData.title, ['talk to', 'speak with']);
            questData.objectives.push({
                text: `Talk to ${targetNPC}`,
                type: QUEST.TYPES.TALK,
                targetNPC: targetNPC,
                status: 'incomplete',
            });
        } else if (titleLower.includes('deliver')) {
            questData.type = QUEST.TYPES.DELIVER;
            const item = questData.itemHint || this.extractNounPhrase(questData.title, ['deliver']);
            const recipient = questData.targetHint || 'the quest giver';
            questData.objectives.push({
                text: `Deliver ${item} to ${recipient}`,
                type: QUEST.TYPES.DELIVER,
                itemToDeliver: item,
                recipient: recipient,
                status: 'incomplete',
            });
        } else if (titleLower.includes('explore') || titleLower.includes('find') || titleLower.includes('discover')) {
            questData.type = QUEST.TYPES.EXPLORE;
            const location = questData.locationHint || questData.buildingTypeHint || this.extractNounPhrase(questData.title, ['explore', 'find', 'discover']);
            questData.objectives.push({
                text: `Explore ${location}`,
                type: QUEST.TYPES.EXPLORE,
                targetLocation: location,
                buildingType: questData.buildingTypeHint,
                status: 'incomplete',
                needsGeneratedLocation: !!questData.buildingTypeHint || (questData.locationHint && !this.scene.mapManager.locationExists(questData.locationHint)),
            });
        } else {
            // Default objective if type is unclear
            questData.type = QUEST.TYPES.GENERIC || 'generic';
            questData.objectives.push({
                text: objectiveText || questData.title,
                type: questData.type,
                status: 'incomplete',
                needsGeneratedLocation: !!questData.buildingTypeHint || (questData.locationHint && !this.scene.mapManager.locationExists(questData.locationHint)),
            });
        }
    }

    /**
     * Helper to extract a noun phrase after certain verbs. Very basic.
     * @param {string} text - The text to parse.
     * @param {string[]} verbs - Array of verbs to look after.
     * @returns {string}
     */
    extractNounPhrase(text, verbs) {
        for (const verb of verbs) {
            const regex = new RegExp(`${verb}\\s+(?:the\\s+|a\\s+|an\\s+)?(.*?)(?:\\s+at|\\s+in|\\s+from|\\s+near|$)`, 'i');
            const match = text.match(regex);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        // Fallback: return a generic part of the title if no specific phrase found
        return text.split(' ').slice(-2).join(' ') || 'something important';
    }


    /**
     * Parses reward string into a structured object.
     * Example: "100 gold, Potion of Healing, 500 XP"
     * @param {string} rewardString - The reward string from Grok.
     * @returns {object} Parsed rewards (gold, items, xp).
     */
    parseRewards(rewardString) {
        const rewards = { gold: 0, items: [], xp: 0 };
        if (!rewardString) return rewards;

        const parts = rewardString.split(',').map(part => part.trim());
        parts.forEach(part => {
            const lowerPart = part.toLowerCase();
            if (lowerPart.includes('gold')) {
                rewards.gold += parseInt(lowerPart.replace(/\D/g, '')) || 0;
            } else if (lowerPart.includes('xp')) {
                rewards.xp += parseInt(lowerPart.replace(/\D/g, '')) || 0;
            } else if (part) {
                rewards.items.push(part); // Item name
            }
        });
        // Default XP if not specified by Grok
        if (rewards.xp === 0 && QUEST.XP_REWARDS) {
            rewards.xp = QUEST.XP_REWARDS[this.difficulty] || QUEST.XP_REWARDS.medium || 250;
        }
        return rewards;
    }

    /**
     * Triggers procedural generation for a quest requirement.
     * @param {object} questData - The quest data containing hints like buildingType or location.
     * @returns {object|null} Information about the generated area (e.g., map key, entry point) or null on failure.
     */
    triggerProceduralGeneration(questData) {
        if (!this.scene.mapManager || !this.scene.mapManager.generateQuestArea) {
            console.error('QuestSystem: MapManager or generateQuestArea method not found on scene.');
            return null;
        }

        const genParams = {
            questId: questData.id,
            difficulty: questData.difficulty,
            // Determine biome/theme based on hints, e.g., "abandoned building" -> "ruins" biome
            theme: questData.buildingTypeHint ? this.getThemeFromBuildingType(questData.buildingTypeHint) : 'default',
            size: this.getSizeFromDifficulty(questData.difficulty), // e.g., 'small', 'medium', 'large'
            specificBuilding: questData.buildingTypeHint,
            locationNameHint: questData.locationHint,
            // Add more parameters as MapGenerator evolves
        };

        try {
            const generatedAreaInfo = this.scene.mapManager.generateQuestArea(genParams);
            if (generatedAreaInfo) {
                console.log(`QuestSystem: Procedurally generated area for quest ${questData.id}:`, generatedAreaInfo);
                // Example: { mapKey: 'quest_area_Q1', entryPoint: { x: 10, y: 15 }, name: "The Abandoned Shack" }
                return generatedAreaInfo;
            } else {
                console.warn(`QuestSystem: MapManager failed to generate area for quest ${questData.id} with params:`, genParams);
                return null;
            }
        } catch (error) {
            console.error(`QuestSystem: Error during procedural generation for quest ${questData.id}:`, error);
            return null;
        }
    }

    getThemeFromBuildingType(buildingType) {
        const lowerType = buildingType.toLowerCase();
        if (lowerType.includes('abandoned') || lowerType.includes('ruin')) return WORLD.BIOME_TYPES.RUINS || 'ruins';
        if (lowerType.includes('cave') || lowerType.includes('mine')) return WORLD.BIOME_TYPES.CAVE || 'cave';
        if (lowerType.includes('forest') || lowerType.includes('grove')) return WORLD.BIOME_TYPES.FOREST || 'forest';
        if (lowerType.includes('tower')) return WORLD.BIOME_TYPES.SORCERER_TOWER || 'tower'; // Example
        // Add more mappings
        return WORLD.BIOME_TYPES.GRASSLAND || 'grassland'; // Default
    }

    getSizeFromDifficulty(difficulty) {
        switch (difficulty) {
            case QUEST.DIFFICULTIES.EASY: return 'small';
            case QUEST.DIFFICULTIES.MEDIUM: return 'medium';
            case QUEST.DIFFICULTIES.HARD: return 'large';
            case QUEST.DIFFICULTIES.EPIC: return 'vast';
            default: return 'medium';
        }
    }

    /**
     * Updates a specific objective within a quest.
     * @param {string} questId
     * @param {number} objectiveIndex
     * @param {object} updates - e.g., { status: 'complete', currentProgress: 5 }
     */
    updateObjective(questId, objectiveIndex, updates) {
        const quest = this.activeQuests.get(questId);
        if (quest && quest.objectives[objectiveIndex]) {
            Object.assign(quest.objectives[objectiveIndex], updates);
            console.log(`QuestSystem: Updated objective ${objectiveIndex} for quest ${questId}. New status: ${quest.objectives[objectiveIndex].status}`);
            this.checkQuestCompletion(questId);
            this.updateQuestLogUI();
        }
    }

    /**
     * Checks if all objectives for a quest are complete. If so, marks quest as completable.
     * @param {string} questId
     */
    checkQuestCompletion(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest || quest.status !== 'active') return;

        const allObjectivesComplete = quest.objectives.every(obj => obj.status === 'complete');

        if (allObjectivesComplete) {
            quest.status = 'completable'; // Ready to be turned in
            console.log(`QuestSystem: All objectives for quest ${questId} complete. Ready for turn-in.`);
            this.scene.game.events.emit('questObjectivesComplete', quest);
            // UI notification: "Return to [Quest Giver] to complete [Quest Title]"
            if (this.scene.uiScene && this.scene.uiScene.showNotification) {
                this.scene.uiScene.showNotification(`Return to ${quest.giver} to complete: ${quest.title}`);
            }
        }
    }

    /**
     * Finalizes a quest, gives rewards, and moves it to completed.
     * Typically called when player talks to the quest giver after objectives are met.
     * @param {string} questId
     * @returns {boolean} True if quest was successfully completed.
     */
    completeQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (!quest || (quest.status !== 'active' && quest.status !== 'completable')) {
            console.warn(`QuestSystem: Quest ${questId} cannot be completed or not found. Status: ${quest ? quest.status : 'N/A'}`);
            return false;
        }

        // Double check objectives if status is just 'active'
        if (quest.status === 'active') {
            const allObjectivesComplete = quest.objectives.every(obj => obj.status === 'complete');
            if (!allObjectivesComplete) {
                 console.warn(`QuestSystem: Tried to complete quest ${questId} but not all objectives are met.`);
                 if (this.scene.uiScene && this.scene.uiScene.showNotification) {
                    this.scene.uiScene.showNotification(`Objectives for "${quest.title}" are not yet complete.`);
                }
                 return false;
            }
        }
        
        quest.status = 'completed';
        quest.completionTime = Date.now();

        // Grant rewards
        if (this.scene.player) { // Assuming player system is accessible
            if (quest.rewards.gold > 0) {
                this.scene.player.addGold(quest.rewards.gold);
                console.log(`QuestSystem: Player received ${quest.rewards.gold} gold.`);
            }
            if (quest.rewards.xp > 0) {
                this.scene.player.addXP(quest.rewards.xp);
                console.log(`QuestSystem: Player received ${quest.rewards.xp} XP.`);
            }
            quest.rewards.items.forEach(itemName => {
                this.scene.player.inventory.addItem(itemName, 1); // Assuming addItem method
                console.log(`QuestSystem: Player received item: ${itemName}.`);
            });
        } else {
            console.warn('QuestSystem: Player object not found on scene, cannot grant rewards.');
        }

        this.activeQuests.delete(questId);
        this.completedQuests.set(questId, quest);

        console.log(`QuestSystem: Quest ${questId} "${quest.title}" completed!`);
        this.scene.game.events.emit('questCompleted', quest);
        this.updateQuestLogUI();
        if (this.scene.uiScene && this.scene.uiScene.showNotification) {
            this.scene.uiScene.showNotification(`Quest Completed: ${quest.title}!`);
        }
        return true;
    }

    failQuest(questId, reason = "Unknown reason") {
        const quest = this.activeQuests.get(questId);
        if (quest) {
            quest.status = 'failed';
            quest.failureReason = reason;
            // Potentially move to a failedQuests map or just mark it
            console.log(`QuestSystem: Quest ${questId} "${quest.title}" failed. Reason: ${reason}`);
            this.scene.game.events.emit('questFailed', quest);
            this.updateQuestLogUI();
            if (this.scene.uiScene && this.scene.uiScene.showNotification) {
                this.scene.uiScene.showNotification(`Quest Failed: ${quest.title}`);
            }
        }
    }

    abandonQuest(questId) {
        const quest = this.activeQuests.get(questId);
        if (quest) {
            quest.status = 'abandoned';
            this.activeQuests.delete(questId); // Or move to an abandoned list
            console.log(`QuestSystem: Quest ${questId} "${quest.title}" abandoned.`);
            this.scene.game.events.emit('questAbandoned', quest);
            this.updateQuestLogUI();
        }
    }

    getQuestById(questId) {
        return this.activeQuests.get(questId) || this.completedQuests.get(questId);
    }

    getActiveQuests() {
        return Array.from(this.activeQuests.values());
    }

    getCompletedQuests() {
        return Array.from(this.completedQuests.values());
    }

    updateQuestLogUI() {
        if (this.scene.uiScene && this.scene.uiScene.updateQuestLog) {
            this.scene.uiScene.updateQuestLog(this.getActiveQuests());
        } else {
            // console.warn('QuestSystem: uiScene or updateQuestLog method not found for UI update.');
        }
    }

    // Called by game events or direct interaction
    playerObtainedItem(itemName, quantity = 1) {
        this.activeQuests.forEach(quest => {
            if (quest.status === 'active') {
                quest.objectives.forEach((obj, index) => {
                    if (obj.type === QUEST.TYPES.FETCH && obj.targetItem === itemName && obj.status === 'incomplete') {
                        obj.currentProgress = (obj.currentProgress || 0) + quantity;
                        if (obj.currentProgress >= (obj.requiredCount || 1)) {
                            this.updateObjective(quest.id, index, { status: 'complete' });
                        } else {
                            this.updateObjective(quest.id, index, { currentProgress: obj.currentProgress });
                        }
                    }
                });
            }
        });
    }

    playerKilledEnemy(enemyType, quantity = 1) {
        this.activeQuests.forEach(quest => {
            if (quest.status === 'active') {
                quest.objectives.forEach((obj, index) => {
                    if (obj.type === QUEST.TYPES.KILL && obj.targetEnemy === enemyType && obj.status === 'incomplete') {
                        obj.currentProgress = (obj.currentProgress || 0) + quantity;
                        if (obj.currentProgress >= obj.count) {
                            this.updateObjective(quest.id, index, { status: 'complete' });
                        } else {
                             this.updateObjective(quest.id, index, { currentProgress: obj.currentProgress });
                        }
                    }
                });
            }
        });
    }

    playerReachedLocation(locationNameOrId) {
         this.activeQuests.forEach(quest => {
            if (quest.status === 'active') {
                quest.objectives.forEach((obj, index) => {
                    if (obj.type === QUEST.TYPES.EXPLORE && obj.targetLocation === locationNameOrId && obj.status === 'incomplete') {
                        this.updateObjective(quest.id, index, { status: 'complete' });
                    }
                });
            }
        });
    }


    // --- Save/Load Functionality (Example Structure) ---
    getSaveData() {
        return {
            nextQuestId: this.nextQuestId,
            activeQuests: Array.from(this.activeQuests.entries()),
            completedQuests: Array.from(this.completedQuests.entries()),
        };
    }

    loadSaveData(data) {
        if (!data) return;
        this.nextQuestId = data.nextQuestId || 1;
        this.activeQuests = new Map(data.activeQuests || []);
        this.completedQuests = new Map(data.completedQuests || []);
        this.updateQuestLogUI();
        console.log('QuestSystem: Loaded save data.');
    }
}
