# Fantasy Pixel Adventure

## 1. Project Overview & Key Features

**Fantasy Pixel Adventure** is a 2D top-down pixel art fantasy RPG developed by Jared. The game aims to deliver a classic RPG experience with modern AI-driven dynamic content. Players will explore a vibrant world, interact with intelligent NPCs, and embark on quests that can shape the game world itself.

**Key Features:**

*   **Dynamic Quest Generation**: NPCs, powered by Grok AI (via the `loveable.dev` backend), can create quests through natural conversation. The game parses these AI responses (e.g., `(create.quest: Fetch wedding ring)`) to generate new objectives and storylines.
*   **Procedural Content**: Quest interactions can trigger the procedural generation of new map areas, ensuring a unique experience and an ever-expanding world. For example, an NPC mentioning an "abandoned building" can lead to that building being generated on the map.
*   **AI-Powered NPCs**: NPCs utilize Grok for dialogue, providing rich, dynamic, and context-aware interactions.
*   **8-Bit Pixel Art Style**: Custom 8-bit pixel art assets create a nostalgic yet fresh visual experience, blending bright and darker fantasy themes.
*   **Phaser.js Game Engine**: Built with the robust and flexible Phaser.js framework, targeting a smooth 60fps performance.
*   **Web-Based Gameplay**: Designed to run directly in a web browser for easy accessibility.
*   **Core RPG Mechanics**: Includes player movement, NPC interaction, a chat system, inventory (planned), and a quest log. Store NPCs will have dedicated interaction options.
*   **Basic Town Environment**: Starts with a pre-designed town, serving as a hub before procedural areas are unlocked.

## 2. Technology Stack & Architecture

*   **Frontend (Client-Side):**
    *   **Game Engine**: [Phaser.js](https://phaser.io/) (v3.60.0)
    *   **Language**: JavaScript (ES6+)
    *   **UI**: DOM elements for chat interface, potentially React for more complex UI components if needed.
    *   **Build Tool**: Webpack (for development server and production builds)
    *   **Styling**: CSS
*   **Backend (Server-Side - `loveable.dev`):**
    *   *To be developed by Jared using `loveable.dev`.*
    *   Responsible for:
        *   Interfacing with the Grok AI API.
        *   Managing persistent game state (player progress, world state - TBD).
        *   Potentially handling complex procedural generation logic if offloaded from the client.
*   **AI Integration:**
    *   **Grok AI**: Used for generating NPC dialogue, dynamic quest creation, and potentially other narrative elements.
    *   **Communication Flow**:
        1.  Player interacts with NPC in the Phaser game.
        2.  Frontend sends player input and context to `loveable.dev` backend.
        3.  `loveable.dev` backend formats the request and queries Grok AI.
        4.  Grok AI returns a response.
        5.  `loveable.dev` backend processes Grok's response (e.g., logging, pre-parsing) and sends it to the frontend.
        6.  Frontend Phaser game displays NPC dialogue and parses commands (e.g., quest creation, procedural generation triggers) from the response.

**Architecture Overview:**

The game follows a client-server architecture. The Phaser.js client handles rendering, core game logic, player input, and frontend parsing of AI commands. The `loveable.dev` backend serves as an intermediary to the Grok AI, manages data, and potentially handles heavier computations.

```
[ Phaser.js Client ] <--> [ loveable.dev Backend ] <--> [ Grok AI API ]
       (Browser)                  (Server)                  (AI Service)
```

## 3. Installation and Setup Instructions

To set up and run Fantasy Pixel Adventure locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd fantasy-pixel-adventure
    ```
2.  **Install dependencies:**
    Ensure you have Node.js and npm installed.
    ```bash
    npm install
    ```
3.  **Run the development server:**
    This command will start a local development server (usually on `http://localhost:8080`) with hot reloading.
    ```bash
    npm start
    ```
4.  **Build for production:**
    This command will create an optimized build in the `dist/` directory.
    ```bash
    npm run build
    ```
5.  **Linting:**
    To check for code style issues:
    ```bash
    npm run lint
    ```

*(Note: Backend setup for `loveable.dev` will be separate and managed by Jared.)*

## 4. Game Controls & Gameplay

**Controls:**

*   **Movement**:
    *   `W`, `A`, `S`, `D` keys
    *   Arrow Keys (`Up`, `Left`, `Down`, `Right`)
*   **Interact**: `E` key (to talk to NPCs or interact with objects)
*   **Sprint**: `SPACE` key (hold to move faster)
*   **Quest Log**: `Q` key (toggle quest log display)
*   **Chat Input**: Type in the chatbox when interacting with NPCs, press `Enter` or click "Send".

**Gameplay Loop:**

1.  **Explore**: Navigate the game world, starting in the initial town.
2.  **Interact**: Talk to NPCs by approaching them and pressing `E`.
3.  **Dialogue & Quests**: Engage in conversations. NPCs may offer quests dynamically based on Grok AI responses. Quest commands like `(create.quest: Fetch X)` will be parsed by the game.
4.  **Procedural Generation**: Some quests may require new areas to be generated (e.g., `(building.type: building.small.abandoned)`). The game will create these new map sections for the player to explore.
5.  **Complete Objectives**: Follow quest objectives, which might involve fetching items, exploring locations, or talking to other NPCs.
6.  **Store Interaction**: NPCs marked as `is_store=true` will have a "View Store" button in the chat interface, allowing players to buy/sell items (inventory system to be implemented).
7.  **Progression**: Gain experience, gold, and items by completing quests.

## 5. Development Roadmap

This is an ongoing project. Future development plans include:

*   **Phase 1 (Current Focus - Core Foundation):**
    *   [x] Basic Phaser.js setup with player movement.
    *   [x] Placeholder 8-bit art assets.
    *   [x] Initial town layout.
    *   [x] NPC entity system.
    *   [x] DOM-based chat UI.
    *   [x] Frontend parsing for Grok quest commands (`(create.quest: ...)`, `(quest description: ...)`, `(building.type: ...)`).
    *   [x] Basic Quest System (`QuestSystem.js`).
    *   [x] Placeholder Map Generator (`MapGenerator.js`) for simple building/area stubs.
    *   [x] UI Scene (`UIScene.js`) for HUD elements (health, gold, basic quest log display).
*   **Phase 2 (Enhanced Gameplay & AI):**
    *   Full integration with `loveable.dev` backend for actual Grok API calls.
    *   Robust procedural map generation based on parsed Grok commands.
    *   Inventory system and item management.
    *   Store NPC functionality (buying/selling).
    *   Combat system (if planned).
    *   More diverse NPC behaviors and interactions.
    *   Saving and loading game progress.
*   **Phase 3 (World Expansion & Polish):**
    *   Expanded set of 8-bit art assets.
    *   More complex procedural generation algorithms for varied environments.
    *   Sound effects and music.
    *   Advanced quest types and branching narratives.
    *   Performance optimization and bug fixing.
    *   User authentication and persistent player data via `loveable.dev`.

## 6. API Integration Details (`loveable.dev` and Grok)

The frontend game client does **not** directly call the Grok AI API. All AI interactions are proxied through the `loveable.dev` backend service.

**Frontend (`APIHandler.js`):**

*   The `src/systems/APIHandler.js` class is responsible for making HTTP requests to the `loveable.dev` backend.
*   When a player sends a chat message to an NPC, the `ChatSystem.js` will use `APIHandler.js` to send a payload to a specific endpoint on `loveable.dev` (e.g., `/chat/grok`).
*   This payload includes:
    *   The player's message.
    *   Context about the NPC (name, type, personality hints, `is_store` flag).
    *   Conversation history.
    *   Relevant game state (e.g., player level, active quests).

**Backend (`loveable.dev` - To be implemented by Jared):**

*   Receives the request from the Phaser client.
*   Authenticates the request (if applicable).
*   Constructs a suitable prompt for the Grok AI API, incorporating the received context and any predefined system prompts for NPC personalities.
*   Sends the request to the Grok AI API.
*   Receives the raw response from Grok.
*   May perform some pre-processing, logging, or validation.
*   Sends a structured response back to the Phaser client, containing Grok's text output.

**Frontend Parsing (`QuestSystem.js`, `ChatSystem.js`):**

*   The `ChatSystem.js` displays the NPC's dialogue (Grok's response).
*   The `QuestSystem.js` (and potentially `MapGenerator.js` indirectly) parses the received text for specific command patterns:
    *   `(create.quest: <Quest Title>)`
    *   `(quest description: <Description Text>)`
    *   `(building.type: <building.subtype.variant>)` (e.g., `building.small.abandoned`)
    *   `(location: <Named Location>)`
    *   `(reward: <Gold Amount/Item Name>)`
    *   `(difficulty: <easy/medium/hard>)`
    *   Other custom commands as defined in `Constants.js` under `GROK_API.COMMAND_PATTERN`.
*   Based on these parsed commands, the `QuestSystem` creates new quests, and the `MapGenerator` (called by `QuestSystem`) can be triggered to create new map areas.

## 7. File Structure Explanation

```
/
├── assets/                 # Static game assets (sprites, tilesets, UI elements, audio)
│   ├── sprites/
│   ├── tiles/
│   └── ui/
├── dist/                   # Production build output (generated by webpack)
├── src/                    # Source code for the game
│   ├── scenes/             # Phaser scenes (BootScene, MainScene, UIScene, etc.)
│   │   ├── BootScene.js    # Handles initial asset loading and setup
│   │   ├── MainScene.js    # Core gameplay scene
│   │   └── UIScene.js      # Handles HUD and UI panels
│   ├── entities/           # Game entities (Player, NPC, Building - planned)
│   │   ├── Player.js       # (Currently integrated in MainScene, to be separated)
│   │   └── NPC.js          # (Currently integrated in MainScene, to be separated)
│   ├── systems/            # Core game logic systems
│   │   ├── QuestSystem.js  # Manages quests and parses AI commands
│   │   ├── ChatSystem.js   # Handles NPC chat UI and backend communication logic
│   │   ├── MapGenerator.js # Responsible for procedural map generation
│   │   └── APIHandler.js   # Manages communication with the loveable.dev backend
│   ├── utils/              # Utility functions and constants
│   │   ├── AssetManager.js # (Planned for managing asset loading/keys)
│   │   └── Constants.js    # Game-wide constants and configurations
│   └── main.js             # Main entry point for the Phaser game, game configuration
├── styles/                 # CSS stylesheets
│   └── main.css            # Main stylesheet for HTML elements (chat UI, loading screen)
├── index.html              # Main HTML file that hosts the Phaser game
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Exact versions of dependencies
├── webpack.config.js       # Webpack build configuration (TBD, if not using a template)
└── README.md               # This file
```

## 8. Contributing Guidelines

This project is currently primarily developed by Jared. However, if contributions are opened in the future:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/issue-description`.
3.  **Follow existing coding style** and conventions (ESLint is set up for linting).
4.  **Write clear and concise commit messages.**
5.  **Ensure your changes do not break existing functionality.** (Testing guidelines TBD).
6.  **Update `README.md`** or other documentation if your changes affect setup, gameplay, or architecture.
7.  **Push your branch** to your fork and submit a Pull Request to the main repository.
8.  **Clearly describe your changes** in the Pull Request.

Please ensure that any AI-related contributions align with the established interaction patterns with `loveable.dev` and Grok, particularly the command parsing system.

---

Happy adventuring and coding!
