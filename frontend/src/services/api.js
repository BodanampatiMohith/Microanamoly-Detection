/**
 * API service for the Flask backend.
 *
 * We prefer same-origin `/api` first so Vite can proxy requests in development
 * and Flask can serve the built frontend in production. If that candidate
 * returns a non-API payload such as HTML, we treat it as a failed probe and
 * fall back to explicit local backend URLs.
 */

const normalizeApiBase = (base) => {
  if (!base) {
    return null;
  }

  const trimmed = base.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const configuredApiBase = normalizeApiBase(import.meta.env.VITE_API_BASE_URL);
const defaultApiCandidates = ["/api", "http://127.0.0.1:5000/api", "http://localhost:5000/api"];
const API_CANDIDATES = (configuredApiBase ? [configuredApiBase] : defaultApiCandidates).filter(Boolean);

let activeApiBase = API_CANDIDATES[0];

const getCandidateOrder = () => {
  const ordered = [activeApiBase, ...API_CANDIDATES];
  return [...new Set(ordered.filter(Boolean))];
};

const parseResponse = async (response, requestUrl) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === "object" && data !== null && (data.error || data.message)) ||
      response.statusText ||
      "Request failed";
    throw new Error(message);
  }

  if (!isJson) {
    throw new Error(`Invalid API response from ${requestUrl}: expected JSON but received ${contentType || "unknown content type"}`);
  }

  if (typeof data === "object" && data !== null && "data" in data) {
    return data.data;
  }

  if (typeof data !== "object" || data === null) {
    throw new Error(`Invalid API response from ${requestUrl}: expected a JSON object`);
  }

  return data;
};

const request = async (path, options = {}) => {
  let lastError = null;

  for (const base of getCandidateOrder()) {
    const url = `${base}${path}`;

    try {
      const response = await fetch(url, options);
      const data = await parseResponse(response, url);
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
