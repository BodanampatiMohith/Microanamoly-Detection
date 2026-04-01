/**
 * API Service - Handles communication with the Flask backend.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

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
  const response = await fetch(`${API_BASE}${path}`, options);
  return parseResponse(response);
};

export const apiService = {
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
