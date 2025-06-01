/**
 * Fantasy Pixel Adventure
 * ChatSystem.js - Manages NPC conversations, backend integration, and UI updates.
 */

import { CHAT, GROK_API, QUEST } from '../utils/Constants.js';

export class ChatSystem {
    constructor(scene) {
        this.scene = scene; // Phaser scene (e.g., MainScene instance to access game systems)
        this.conversationHistory = [];
        this.currentNpc = null; // Stores the NPC object the player is talking to
        this.isWaitingForResponse = false;

        // UI Elements (assuming these IDs exist in index.html)
        this.chatMessagesContainer = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.npcNameDisplay = document.getElementById('npc-name');
        this.storeButton = document.getElementById('store-button');
        // Close button is handled by main.js, but we might need to react to it

        // Ensure QuestSystem is available
        if (!window.GAME_SYSTEMS || !window.GAME_SYSTEMS.quest) {
            console.error('ChatSystem: QuestSystem not found on window.GAME_SYSTEMS. Quest parsing will fail.');
        }
        this.questSystem = window.GAME_SYSTEMS ? window.GAME_SYSTEMS.quest : null;


        console.log('ChatSystem initialized.');
    }

    /**
     * Starts a new conversation with an NPC.
     * Called by main.js when the chat overlay is shown.
     * @param {object} npc - The NPC object from the game (e.g., instance of SimpleNPC).
     */
    startConversation(npc) {
        this.currentNpc = npc;
        this.conversationHistory = [];
        this.isWaitingForResponse = false;

        if (this.chatMessagesContainer) this.chatMessagesContainer.innerHTML = ''; // Clear previous messages
        if (this.npcNameDisplay) this.npcNameDisplay.textContent = npc.npcName || 'NPC';
        
        if (this.storeButton) {
            if (npc.is_store) {
                this.storeButton.classList.remove('hidden');
            } else {
                this.storeButton.classList.add('hidden');
            }
        }
        
        // Optional: Send an initial greeting or prompt to the backend
        // For example, to get an opening line from Grok:
        // this.sendMessageToBackend("Hello", npc, true); // true indicates initial prompt
        this.displayMessage(`You started a conversation with ${npc.npcName}.`, 'system');
        if (this.chatInput) this.chatInput.focus();
    }

    /**
     * Handles player sending a message from the UI.
     * @param {string} playerMessageText - The text entered by the player.
     */
    handlePlayerMessage(playerMessageText) {
        if (!playerMessageText.trim() || this.isWaitingForResponse || !this.currentNpc) {
            return;
        }

        this.displayMessage(playerMessageText, 'player');
        this.manageConversationHistory(playerMessageText, 'player');
        this.sendMessageToBackend(playerMessageText, this.currentNpc);
        if (this.chatInput) this.chatInput.value = '';
    }

    /**
     * Sends the player's message and conversation context to the backend (loveable.dev).
     * @param {string} messageText - The player's current message.
     * @param {object} npcContext - Context about the current NPC.
     * @param {boolean} isInitialPrompt - If true, this is an initial greeting.
     */
    async sendMessageToBackend(messageText, npcContext, isInitialPrompt = false) {
        if (!this.currentNpc) return;
        this.isWaitingForResponse = true;
        if (this.sendButton) this.sendButton.disabled = true;
        if (this.chatInput) this.chatInput.disabled = true;

        // Simulate typing indicator for NPC
        this.displayTypingIndicator(true);

        const payload = {
            message: messageText,
            npc: {
                name: npcContext.npcName,
                type: npcContext.npcType,
                is_store: npcContext.is_store,
                // You might want to include NPC-specific personality prompts or lore here
                // e.g., npcContext.personalityPrompt || GROK_API.DEFAULT_SYSTEM_PROMPT
                system_prompt: npcContext.dialogueContext || GROK_API.DEFAULT_SYSTEM_PROMPT,
            },
            history: this.conversationHistory.slice(-CHAT.MAX_HISTORY_LENGTH), // Send recent history
            game_context: { // Optional: Pass current game state if relevant for Grok
                player_level: this.scene.registry.get('playerLevel'),
                current_quests: this.questSystem ? this.questSystem.getActiveQuests().map(q => q.title) : [],
                time_of_day: this.scene.registry.get('gameTime') ? new Date(this.scene.registry.get('gameTime') * 1000).getHours() : 12,
            }
        };

        // --- SIMULATED BACKEND CALL ---
        // In a real app, this would be:
        // const apiHandler = window.GAME_SYSTEMS.api;
        // apiHandler.postToLoveableDev('/chat', payload)
        //   .then(response => this.handleApiResponse(response))
        //   .catch(error => this.handleApiError(error));

        console.log('ChatSystem: Sending to backend (simulated):', payload);
        await new Promise(resolve => setTimeout(resolve, Phaser.Math.Between(CHAT.MIN_RESPONSE_TIME, CHAT.MAX_RESPONSE_TIME))); // Simulate network delay

        // Simulated response structure from your backend after Grok processing
        const simulatedGrokResponse = this.generateSimulatedGrokResponse(messageText, npcContext);
        const simulatedBackendResponse = {
            success: true,
            grok_response: simulatedGrokResponse,
            timestamp: Date.now()
        };
        // --- END SIMULATION ---

        this.displayTypingIndicator(false);
        this.handleApiResponse(simulatedBackendResponse);
        
        this.isWaitingForResponse = false;
        if (this.sendButton) this.sendButton.disabled = false;
        if (this.chatInput) this.chatInput.disabled = false;
        if (this.chatInput) this.chatInput.focus();
    }

    /**
     * Generates a simulated Grok response for testing.
     */
    generateSimulatedGrokResponse(playerMessage, npcContext) {
        const lowerMessage = playerMessage.toLowerCase();
        if (lowerMessage.includes("quest") || lowerMessage.includes("help") || lowerMessage.includes("task")) {
            if (npcContext.npcName === "Lost Lady Lira") {
                return `Oh, thank goodness you're here! I've lost my precious wedding ring! I think it was near that old abandoned building south of town. (create.quest: Fetch Wedding Ring) (quest description: Retrieve Lira's lost wedding ring from the abandoned building.) (building.type: building.small.abandoned) (difficulty: easy) (reward: 50 gold, 100 XP)`;
            }
            return `Ah, a quest you seek? Perhaps I can help... (create.quest: Find the Lost Kitten) (quest description: A small kitten has gone missing from the village. Find it!) (location: Town Square) (reward: 20 gold)`;
        }
        if (lowerMessage.includes("store") || lowerMessage.includes("buy") || lowerMessage.includes("sell")) {
            if (npcContext.is_store) {
                return "Welcome to my shop! Feel free to browse my wares. You can click the 'View Store' button.";
            } else {
                return "A store? I don't have anything to sell, I'm afraid.";
            }
        }
        if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
            return `Greetings, traveler! How can I help you today, ${npcContext.npcName === 'Old Man Willow' ? 'young one?' : ''}`;
        }
        return `Hmm, that's an interesting question. I'll have to think on that. The weather is quite ${this.scene.registry.get('weather')} today, isn't it?`;
    }

    /**
     * Processes the response from the backend (which includes Grok's output).
     * @param {object} apiResponse - The response object from loveable.dev.
     */
    handleApiResponse(apiResponse) {
        if (!apiResponse || !apiResponse.success || !apiResponse.grok_response) {
            console.error('ChatSystem: Invalid API response structure.', apiResponse);
            this.handleApiError(new Error('Invalid API response from backend.'));
            return;
        }

        const grokResponseText = apiResponse.grok_response;
        this.displayMessage(grokResponseText, 'npc');
        this.manageConversationHistory(grokResponseText, 'npc');

        // Trigger quest parsing if QuestSystem is available
        if (this.questSystem) {
            const createdQuest = this.questSystem.parseAndCreateQuest(grokResponseText, this.currentNpc);
            if (createdQuest) {
                this.displayMessage(`Quest offered: "${createdQuest.title}"! Check your quest log.`, 'system', 'quest_offer');
                // UI could highlight this message or add an "Accept Quest" button if needed.
            }
        }
    }

    /**
     * Displays a message in the chat UI.
     * @param {string} text - The message content.
     * @param {string} sender - 'player', 'npc', or 'system'.
     * @param {string} messageType - 'text', 'quest_offer', 'error', etc. for styling.
     */
    displayMessage(text, sender, messageType = 'text') {
        if (!this.chatMessagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender.toLowerCase());
        if (messageType !== 'text') {
            messageElement.classList.add(`message-${messageType.toLowerCase()}`);
        }
        
        // Sanitize text before inserting (basic example, consider a proper library for security)
        // For now, assuming text is safe or backend sanitizes.
        // For quest commands, we might want to render them differently or hide them.
        // This version will display the raw Grok response including commands.
        messageElement.textContent = text;

        this.chatMessagesContainer.appendChild(messageElement);
        this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight; // Scroll to bottom
    }

    /**
     * Shows/hides a typing indicator for the NPC.
     * @param {boolean} show - True to show, false to hide.
     */
    displayTypingIndicator(show) {
        let typingIndicator = document.getElementById('npc-typing-indicator');
        if (show) {
            if (!typingIndicator) {
                typingIndicator = document.createElement('div');
                typingIndicator.id = 'npc-typing-indicator';
                typingIndicator.classList.add('message', 'npc', 'typing-indicator');
                typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>'; // Animated dots
                if (this.chatMessagesContainer) this.chatMessagesContainer.appendChild(typingIndicator);
            }
            typingIndicator.style.display = 'block';
            if (this.chatMessagesContainer) this.chatMessagesContainer.scrollTop = this.chatMessagesContainer.scrollHeight;
        } else {
            if (typingIndicator) {
                typingIndicator.style.display = 'none';
            }
        }
    }

    /**
     * Adds a message to the conversation history.
     * @param {string} text - The message content.
     * @param {string} sender - 'player' or 'npc'.
     */
    manageConversationHistory(text, sender) {
        this.conversationHistory.push({
            sender: sender,
            text: text,
            timestamp: Date.now()
        });

        // Keep history to a manageable size
        if (this.conversationHistory.length > CHAT.MAX_HISTORY_LENGTH) {
            this.conversationHistory.shift(); // Remove oldest message
        }
    }

    /**
     * Handles errors from the API call.
     * @param {Error} error - The error object.
     */
    handleApiError(error) {
        console.error('ChatSystem: API Error -', error);
        this.isWaitingForResponse = false; // Reset flag
        if (this.sendButton) this.sendButton.disabled = false;
        if (this.chatInput) this.chatInput.disabled = false;
        this.displayTypingIndicator(false);

        const fallbackResponses = CHAT.FALLBACK_RESPONSES || ["I'm sorry, I can't talk right now."];
        const fallbackMessage = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        this.displayMessage(fallbackMessage, 'npc', 'error');
        this.manageConversationHistory(fallbackMessage, 'npc'); // Log the fallback as NPC response
    }

    /**
     * Called when the chat UI is closed.
     */
    endConversation() {
        this.currentNpc = null;
        this.isWaitingForResponse = false;
        // The actual hiding of the overlay and scene resumption is handled in main.js
        console.log('ChatSystem: Conversation ended.');
    }

    /**
     * Called when the "View Store" button is clicked.
     * This would typically open a new UI panel or scene for the store.
     */
    openStore() {
        if (!this.currentNpc || !this.currentNpc.is_store) return;

        console.log(`ChatSystem: Opening store for ${this.currentNpc.npcName}`);
        this.displayMessage(`Opening ${this.currentNpc.npcName}'s store...`, 'system');
        
        // Hide chat, show store UI (this logic might live in UIScene or a dedicated StoreScene)
        if (window.toggleChat) window.toggleChat(false); // Close chat UI first
        
        // Example: Launch a StoreScene if using Phaser scenes for UI
        if (this.scene && this.scene.scene.get(CHAT.STORE_SCENE_KEY || 'StoreScene')) {
             this.scene.scene.launch(CHAT.STORE_SCENE_KEY || 'StoreScene', { npc: this.currentNpc });
        } else if (this.scene && this.scene.uiScene && this.scene.uiScene.showStorePanel) {
            this.scene.uiScene.showStorePanel(this.currentNpc);
        } else {
            console.warn('ChatSystem: No store UI handling implemented.');
            // For now, just a message
            alert(`${this.currentNpc.npcName}'s store would open here! (Store UI not implemented)`);
            // Re-open chat if store UI isn't modal or doesn't pause main scene
            // if (window.toggleChat) window.toggleChat(true, this.currentNpc.npcName, this.currentNpc.is_store, this.currentNpc);
        }
    }
}
