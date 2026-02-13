import React, { useState } from "react";

export const RoiSelector = ({ roi, onRoiChange }) => {
  const [localRoi, setLocalRoi] = useState(roi);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = {
      ...localRoi,
      [name]: Math.max(0, parseInt(value) || 0),
    };
    setLocalRoi(updated);
    onRoiChange(updated);
  };

  return (
    <div className="control-panel">
      <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
        Region of Interest (ROI)
      </h3>

      <div className="control-group">
        <label className="control-label">Position X</label>
        <input
          type="number"
          name="x"
          value={localRoi.x}
          onChange={handleChange}
          min="0"
          style={{ width: "100%" }}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Position Y</label>
        <input
          type="number"
          name="y"
          value={localRoi.y}
          onChange={handleChange}
          min="0"
          style={{ width: "100%" }}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Width</label>
        <input
          type="number"
          name="width"
          value={localRoi.width}
          onChange={handleChange}
          min="50"
          style={{ width: "100%" }}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Height</label>
        <input
          type="number"
          name="height"
          value={localRoi.height}
          onChange={handleChange}
          min="50"
          style={{ width: "100%" }}
        />
      </div>

      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
        You can drag the ROI rectangle in the video to reposition it.
      </div>
    </div>
  );
};

export default RoiSelector;
