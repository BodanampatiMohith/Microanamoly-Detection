/**
 * API Service - Handles communication with Flask backend
 */

const API_BASE = "http://localhost:5000/api";

export const apiService = {
  /**
   * Check backend health
   */
  async health() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
  },

  /**
   * Get configuration
   */
  async getConfig() {
    const response = await fetch(`${API_BASE}/config`);
    return response.json();
  },

  /**
   * Get current ROI
   */
  async getROI() {
    const response = await fetch(`${API_BASE}/roi`);
    return response.json();
  },

  /**
   * Update ROI
   */
  async updateROI(roi) {
    const response = await fetch(`${API_BASE}/roi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roi),
    });
    return response.json();
  },

  /**
   * Process single frame
   */
  async processFrame(imageBase64, roi = null) {
    const payload = {
      image: imageBase64,
    };

    if (roi) {
      payload.roi = roi;
    }

    const response = await fetch(`${API_BASE}/process_frame`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Get pipeline statistics
   */
  async getStatistics() {
    const response = await fetch(`${API_BASE}/statistics`);
    return response.json();
  },

  /**
   * Reset pipeline
   */
  async resetPipeline() {
    const response = await fetch(`${API_BASE}/reset`, {
      method: "POST",
    });
    return response.json();
  },
};
