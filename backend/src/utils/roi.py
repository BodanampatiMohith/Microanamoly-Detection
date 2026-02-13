"""
ROI (Region of Interest) utilities for frame processing.
"""
import cv2
import numpy as np
from typing import Tuple, Optional, Dict


class ROI:
    """Region of Interest handler."""

    def __init__(self, x: int, y: int, width: int, height: int):
        """Initialize ROI with coordinates.

        Args:
            x: Top-left x coordinate
            y: Top-left y coordinate
            width: ROI width
            height: ROI height
        """
        self.x = max(0, x)
        self.y = max(0, y)
        self.width = max(10, width)
        self.height = max(10, height)

    def extract(self, frame: np.ndarray) -> np.ndarray:
        """Extract ROI from frame.

        Args:
            frame: Input frame

        Returns:
            ROI region as numpy array
        """
        h, w = frame.shape[:2]
        x2 = min(self.x + self.width, w)
        y2 = min(self.y + self.height, h)

        return frame[self.y : y2, self.x : x2]

    def update(self, x: int, y: int, width: int, height: int):
        """Update ROI coordinates.

        Args:
            x: Top-left x coordinate
            y: Top-left y coordinate
            width: ROI width
            height: ROI height
        """
        self.x = max(0, x)
        self.y = max(0, y)
        self.width = max(10, width)
        self.height = max(10, height)

    def to_dict(self) -> Dict:
        """Convert ROI to dictionary.

        Returns:
            Dictionary representation of ROI
        """
        return {
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
        }

    @classmethod
    def from_dict(cls, roi_dict: Dict) -> "ROI":
        """Create ROI from dictionary.

        Args:
            roi_dict: Dictionary with x, y, width, height

        Returns:
            ROI instance
        """
        return cls(
            roi_dict.get("x", 0),
            roi_dict.get("y", 0),
            roi_dict.get("width", 300),
            roi_dict.get("height", 200),
        )


def draw_roi_on_frame(frame: np.ndarray, roi: ROI, thickness: int = 2) -> np.ndarray:
    """Draw ROI rectangle on frame.

    Args:
        frame: Input frame
        roi: ROI object
        thickness: Line thickness

    Returns:
        Frame with drawn ROI
    """
    frame_copy = frame.copy()
    cv2.rectangle(
        frame_copy,
        (roi.x, roi.y),
        (roi.x + roi.width, roi.y + roi.height),
        (0, 165, 255),
        thickness,
    )
    return frame_copy
