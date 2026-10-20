/**
 * ==============================================================================
 * 9Perfume - Environment & API Configuration
 * ==============================================================================
 * 👉 PASTE YOUR SERVER OR CLOUDFLARE TUNNEL URL HERE (ONLY 1 TIME) 👈
 * 
 * Both index.html and products/product.html will automatically use this URL.
 * 
 * Examples:
 *   - Cloudflare Tunnel: "https://your-tunnel-name.trycloudflare.com"
 *   - Localhost ASP.NET: "http://localhost:5000" or "https://localhost:7001"
 *   - Production Server: "https://api.yourdomain.com"
 * ==============================================================================
 */

window.APP_CONFIG = {
  // PASTE YOUR SERVER API URL HERE:
  API_BASE_URL: "https://fresh-extending-advocacy-tune.trycloudflare.com",
};

/**
 * Helper to get the active API base URL.
 * Automatically removes any trailing slash.
 * Priority:
 *   1. ?api=... query parameter (great for testing or dynamic Telegram links)
 *   2. localStorage override (set via browser console using setApiUrl)
 *   3. window.APP_CONFIG.API_BASE_URL (configured above)
 */
window.getApiBaseUrl = function () {
  // 1. Check URL query parameter (e.g. ?api=https://...)
  try {
    if (typeof window !== "undefined" && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const queryApi = params.get("api");
      if (queryApi && queryApi.trim()) {
        return queryApi.trim().replace(/\/+$/, "");
      }
    }
  } catch (e) {
    // ignore
  }

  // 2. Check localStorage override
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("API_BASE_URL");
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, "");
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Fallback to APP_CONFIG
  const configUrl = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL) || "";
  return configUrl.trim().replace(/\/+$/, "");
};

/**
 * Convenience helper to change API URL on the fly in browser DevTools:
 * Usage in Console:
 *   setApiUrl("https://your-tunnel.trycloudflare.com"); // sets override
 *   setApiUrl(); // resets to config.js default
 */
window.setApiUrl = function (url) {
  if (!url) {
    localStorage.removeItem("API_BASE_URL");
    console.log("Reset API URL to default config.js:", window.getApiBaseUrl());
  } else {
    localStorage.setItem("API_BASE_URL", url);
    console.log("Updated API URL to:", window.getApiBaseUrl());
  }
};
