/**
 * Fantasy Pixel Adventure
 * APIHandler.js - Manages all communication with the backend (loveable.dev)
 *
 * Features:
 * - Generic HTTP request methods (GET, POST)
 * - Error handling with retry logic
 * - Environment configuration
 * - Specific methods for chat/Grok API calls via backend
 * - Session management placeholders
 * - Response caching for GET requests
 */

import { GROK_API, API_CONFIG as defaultConfig } from '../utils/Constants.js'; // Assuming API_CONFIG is defined in Constants

const DEFAULT_RETRY_ATTEMPTS = defaultConfig?.RETRY_ATTEMPTS || 3;
const DEFAULT_RETRY_DELAY_MS = defaultConfig?.RETRY_DELAY_MS || 1000;
const DEFAULT_TIMEOUT_MS = defaultConfig?.TIMEOUT_MS || 15000; // 15 seconds
const DEFAULT_CACHE_TTL_MS = defaultConfig?.CACHE_TTL_MS || 5 * 60 * 1000; // 5 minutes

export class APIHandler {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.baseUrl = this.config.baseUrl || this.getBaseUrlForEnv();
        this.apiKey = this.config.apiKey || null; // For loveable.dev if it uses API keys
        this.authToken = null; // For session-based authentication
        this.cache = new Map(); // For GET request caching

        if (!this.baseUrl) {
            console.error('APIHandler: Base URL is not configured. API calls will likely fail.');
        }
        console.log(`APIHandler initialized for environment: ${this.config.env || 'development'}. Base URL: ${this.baseUrl}`);
    }

    getBaseUrlForEnv() {
        const env = this.config.env || process.env.NODE_ENV || 'development';
        switch (env) {
            case 'production':
                return defaultConfig?.PRODUCTION_URL || 'https://api.loveable.dev/v1'; // Example prod URL
            case 'staging':
                return defaultConfig?.STAGING_URL || 'https://staging.api.loveable.dev/v1';
            case 'development':
            default:
                return defaultConfig?.DEVELOPMENT_URL || 'http://localhost:3000/api/v1'; // Example local dev URL
        }
    }

    /**
     * Sets the authentication token for session-based auth.
     * @param {string|null} token - The authentication token.
     */
    setAuthToken(token) {
        this.authToken = token;
        console.log('APIHandler: Auth token updated.');
    }

    /**
     * Clears the authentication token (logout).
     */
    clearAuthToken() {
        this.authToken = null;
        console.log('APIHandler: Auth token cleared.');
    }

    /**
     * Core request method with error handling and retry logic.
     * @param {string} endpoint - The API endpoint (e.g., '/users').
     * @param {object} options - Fetch options (method, headers, body, etc.).
     * @param {number} attempts - Current retry attempt number.
     * @returns {Promise<object>} The JSON response from the API.
     * @private
     */
    async _request(endpoint, options, attempts = 0) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(this.apiKey && { 'X-API-Key': this.apiKey }),
            ...(this.authToken && { 'Authorization': `Bearer ${this.authToken}` }),
            ...options.headers,
        };

        // Abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || DEFAULT_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: response.statusText };
                }
                const error = new Error(`API Error: ${response.status} ${response.statusText} at ${url}`);
                error.status = response.status;
                error.response = response;
                error.data = errorData;
                throw error;
            }

            // Handle cases where response might be empty (e.g., 204 No Content)
            const contentType = response.headers.get('content-type');
            if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
                return {}; // Or null, or a specific success object
            }

            return await response.json();

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') { // Timeout
                console.warn(`APIHandler: Request to ${url} timed out.`);
                error.message = `Request timed out after ${options.timeout || DEFAULT_TIMEOUT_MS}ms`;
            }

            if (attempts < (options.retries || DEFAULT_RETRY_ATTEMPTS) && this._isRetryableError(error)) {
                const delay = Math.pow(2, attempts) * (options.retryDelay || DEFAULT_RETRY_DELAY_MS);
                console.warn(`APIHandler: Retrying request to ${url} (attempt ${attempts + 1}/${options.retries || DEFAULT_RETRY_ATTEMPTS}). Waiting ${delay}ms. Error: ${error.message}`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this._request(endpoint, options, attempts + 1);
            }
            console.error(`APIHandler: Failed request to ${url} after ${attempts +1} attempts.`, error.data || error.message);
            throw error; // Re-throw the error after all retries or if not retryable
        }
    }

    /**
     * Checks if an error is retryable.
     * @param {Error} error - The error object.
     * @returns {boolean} True if the error is retryable.
     * @private
     */
    _isRetryableError(error) {
        // Retry on network errors or specific server errors (e.g., 500, 502, 503, 504, 429 Too Many Requests)
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            return true;
        }
        return error.status && [429, 500, 502, 503, 504].includes(error.status);
    }

    /**
     * Makes a GET request.
     * @param {string} endpoint - The API endpoint.
     * @param {object} [params={}] - URL query parameters.
     * @param {object} [options={}] - Additional fetch options (e.g., headers, cache TTL).
     * @returns {Promise<object>} The JSON response.
     */
    async get(endpoint, params = {}, options = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;

        // Cache handling
        const useCache = options.useCache !== undefined ? options.useCache : true;
        if (useCache) {
            const cached = this.cache.get(fullEndpoint);
            if (cached && (Date.now() - cached.timestamp < (options.cacheTTL || DEFAULT_CACHE_TTL_MS))) {
                console.log(`APIHandler: Serving GET ${fullEndpoint} from cache.`);
                return Promise.resolve(cached.data); // Return a new promise to match async behavior
            }
        }

        const response = await this._request(fullEndpoint, { method: 'GET', ...options });

        if (useCache && response) { // Cache successful responses
            this.cache.set(fullEndpoint, { data: response, timestamp: Date.now() });
            // Optional: Implement cache size limit
            if (this.cache.size > (this.config.maxCacheSize || 50)) {
                const oldestKey = this.cache.keys().next().value;
                this.cache.delete(oldestKey);
            }
        }
        return response;
    }

    /**
     * Makes a POST request.
     * @param {string} endpoint - The API endpoint.
     * @param {object} [body={}] - The request body.
     * @param {object} [options={}] - Additional fetch options.
     * @returns {Promise<object>} The JSON response.
     */
    async post(endpoint, body = {}, options = {}) {
        return this._request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
        });
    }

    /**
     * Makes a PUT request.
     * @param {string} endpoint - The API endpoint.
     * @param {object} [body={}] - The request body.
     * @param {object} [options={}] - Additional fetch options.
     * @returns {Promise<object>} The JSON response.
     */
    async put(endpoint, body = {}, options = {}) {
        return this._request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options,
        });
    }

    /**
     * Makes a DELETE request.
     * @param {string} endpoint - The API endpoint.
     * @param {object} [options={}] - Additional fetch options.
     * @returns {Promise<object>} The JSON response.
     */
    async delete(endpoint, options = {}) {
        return this._request(endpoint, {
            method: 'DELETE',
            ...options,
        });
    }

    /**
     * Clears the entire response cache.
     */
    clearCache() {
        this.cache.clear();
        console.log('APIHandler: Cache cleared.');
    }

    /**
     * Invalidates a specific cache entry.
     * @param {string} endpointWithQuery - The full endpoint string including query parameters.
     */
    invalidateCacheEntry(endpointWithQuery) {
        if (this.cache.has(endpointWithQuery)) {
            this.cache.delete(endpointWithQuery);
            console.log(`APIHandler: Cache invalidated for ${endpointWithQuery}.`);
        }
    }

    // --- Specific methods for loveable.dev and Grok integration ---

    /**
     * Sends a chat message to the backend for Grok processing.
     * @param {object} payload - The chat payload (e.g., { message, npcContext, history, game_context }).
     *                           Matches the structure expected by ChatSystem.sendMessageToBackend.
     * @returns {Promise<object>} The backend's response, typically including Grok's reply.
     */
    async sendChatMessage(payload) {
        const chatEndpoint = this.config.chatEndpoint || GROK_API.CHAT_ENDPOINT || '/chat/grok'; // Configurable endpoint
        try {
            const response = await this.post(chatEndpoint, payload, {
                timeout: GROK_API.RESPONSE_TIMEOUT || DEFAULT_TIMEOUT_MS * 2, // Longer timeout for AI
                retries: GROK_API.MAX_RETRIES !== undefined ? GROK_API.MAX_RETRIES : 1, // Fewer retries for AI potentially
            });
            // The backend (loveable.dev) should return a structured response.
            // Example: { success: true, grok_response: "Hello there!", processed_commands: [], timestamp: ... }
            return response;
        } catch (error) {
            console.error('APIHandler: Error sending chat message:', error.data || error.message);
            // Return a structured error response for ChatSystem to handle
            return {
                success: false,
                error: error.message,
                status: error.status,
                data: error.data,
            };
        }
    }

    /**
     * Placeholder for user login.
     * @param {string} username
     * @param {string} password
     * @returns {Promise<object>} API response with user data and token.
     */
    async login(username, password) {
        const loginEndpoint = this.config.loginEndpoint || '/auth/login';
        try {
            const response = await this.post(loginEndpoint, { username, password });
            if (response && response.token) {
                this.setAuthToken(response.token);
                // Store user data if needed
            }
            return response;
        } catch (error) {
            console.error('APIHandler: Login failed', error.data || error.message);
            throw error;
        }
    }

    /**
     * Placeholder for user logout.
     * @returns {Promise<object>} API response.
     */
    async logout() {
        const logoutEndpoint = this.config.logoutEndpoint || '/auth/logout';
        try {
            // Server might invalidate token; client also clears it.
            const response = await this.post(logoutEndpoint, {}, { headers: { 'Authorization': `Bearer ${this.authToken}` }});
            this.clearAuthToken();
            return response;
        } catch (error) {
            console.error('APIHandler: Logout failed', error.data || error.message);
            // Clear token even if server call fails, as it might be invalid
            this.clearAuthToken();
            throw error;
        }
    }

    /**
     * Placeholder for fetching game configuration from the backend.
     * @returns {Promise<object>} Game configuration data.
     */
    async getGameConfiguration() {
        const configEndpoint = this.config.gameConfigEndpoint || '/game/config';
        // This should typically be cached
        return this.get(configEndpoint, {}, { useCache: true, cacheTTL: 3600 * 1000 }); // Cache for 1 hour
    }
}

// Example usage (typically instantiated once and shared or accessed via a global/service locator)
// const apiHandler = new APIHandler({ env: 'development', apiKey: 'your-dev-api-key' });
// window.GAME_SYSTEMS = window.GAME_SYSTEMS || {};
// window.GAME_SYSTEMS.api = apiHandler;
