/**
 * API Service - Handles communication with the Flask backend.
 *
 * Prefer the same-origin `/api` path so Vite can proxy requests in dev and the
 * built app can talk to Flask directly in production. If that path fails,
 * fall back to common local Flask URLs.
 */

const configuredApiBase = import.meta.env.VITE_API_BASE_URL;
const defaultApiCandidates = ["/api", "http://127.0.0.1:5000/api", "http://localhost:5000/api"];
const API_CANDIDATES = configuredApiBase ? [configuredApiBase] : defaultApiCandidates;

let activeApiBase = API_CANDIDATES[0];

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === "object" && (data.error || data.message)) ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    return data.data;
  }

  return data;
};

const request = async (path, options = {}) => {
  let lastError = null;

  for (const base of API_CANDIDATES) {
    try {
      const response = await fetch(`${base}${path}`, options);
      const data = await parseResponse(response);
      activeApiBase = base;
      return data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error(`Unable to reach backend via ${activeApiBase}${path}`);
};

export const apiService = {
  getActiveApiBase() {
    return activeApiBase;
  },

  async health() {
    return request("/health");
  },

  async getConfig() {
    return request("/config");
  },

  async getROI() {
    return request("/roi");
  },

  async updateROI(roi) {
    return request("/roi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roi),
    });
  },

  async processFrame(imageBase64, roi = null) {
    const payload = { image: imageBase64 };

    if (roi) {
      payload.roi = roi;
    }

    return request("/process_frame", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  async getStatistics() {
    return request("/statistics");
  },

  async getRuntimeEvm() {
    const response = await request("/runtime/evm");
    return response.evm || response;
  },

  async updateRuntimeEvm(params) {
    const response = await request("/runtime/evm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return response.evm || response;
  },

  async updateAmplification(amplificationFactor) {
    return this.updateRuntimeEvm({ amplification_factor: amplificationFactor });
  },

  async updateFrequencyBand({ low, high }) {
    return this.updateRuntimeEvm({
      cutoff_freq_low: low,
      cutoff_freq_high: high,
    });
  },

  async resetPipeline() {
    return request("/reset", {
      method: "POST",
    });
  },
};
