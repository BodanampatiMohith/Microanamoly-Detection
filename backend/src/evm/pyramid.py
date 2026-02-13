"""
Gaussian and Laplacian pyramid implementations for EVM.
"""
import cv2
import numpy as np
from typing import List, Tuple


class PyramidLevel:
    """Single level of pyramid."""

    def __init__(self, image: np.ndarray, level: int = 0):
        """Initialize pyramid level.

        Args:
            image: Image data for this level
            level: Level number (0 is finest)
        """
        self.image = image.astype(np.float32)
        self.level = level

    def get_shape(self) -> Tuple[int, int]:
        """Get image shape."""
        return self.image.shape[:2]


class GaussianPyramid:
    """Gaussian pyramid for spatial decomposition."""

    def __init__(self, levels: int = 4):
        """Initialize Gaussian pyramid.

        Args:
            levels: Number of pyramid levels
        """
        self.levels = levels
        self.pyramid: List[PyramidLevel] = []

    def build(self, image: np.ndarray) -> None:
        """Build Gaussian pyramid from image.

        Args:
            image: Input image
        """
        self.pyramid = []
        current = image.astype(np.float32)

        for level in range(self.levels):
            self.pyramid.append(PyramidLevel(current, level))
            if level < self.levels - 1:
                # Downsample
                current = cv2.pyrDown(current)

    def get_level(self, level: int) -> np.ndarray:
        """Get image at pyramid level.

        Args:
            level: Pyramid level (0-based)

        Returns:
            Image at specified level
        """
        if level < len(self.pyramid):
            return self.pyramid[level].image
        return None

    def __len__(self) -> int:
        """Get number of levels."""
        return len(self.pyramid)


class LaplacianPyramid:
    """Laplacian pyramid (band-pass decomposition)."""

    def __init__(self, levels: int = 4):
        """Initialize Laplacian pyramid.

        Args:
            levels: Number of pyramid levels
        """
        self.levels = levels
        self.pyramid: List[PyramidLevel] = []

    def build(self, image: np.ndarray) -> None:
        """Build Laplacian pyramid from image.

        Args:
            image: Input image
        """
        # Build Gaussian pyramid first
        gaussian = GaussianPyramid(self.levels)
        gaussian.build(image)

        # Compute Laplacian levels
        self.pyramid = []

        for level in range(self.levels - 1):
            current = gaussian.get_level(level)
            next_level = gaussian.get_level(level + 1)

            # Upsample next level and subtract
            upsampled = cv2.pyrUp(next_level)

            # Ensure same size
            h, w = current.shape[:2]
            upsampled = upsampled[:h, :w]

            laplacian = current - upsampled
            self.pyramid.append(PyramidLevel(laplacian, level))

        # Last level is copy of last Gaussian level
        last = gaussian.get_level(self.levels - 1)
        self.pyramid.append(PyramidLevel(last, self.levels - 1))

    def get_level(self, level: int) -> np.ndarray:
        """Get Laplacian band at level.

        Args:
            level: Pyramid level (0-based)

        Returns:
            Laplacian band at specified level
        """
        if level < len(self.pyramid):
            return self.pyramid[level].image
        return None

    def reconstruct(self) -> np.ndarray:
        """Reconstruct image from Laplacian pyramid.

        Returns:
            Reconstructed image
        """
        if not self.pyramid:
            return None

        # Start from last level and work backwards
        result = self.pyramid[-1].image.copy()

        for level in range(len(self.pyramid) - 2, -1, -1):
            # Upsample result
            result = cv2.pyrUp(result)

            # Ensure same size as current Laplacian
            lap = self.pyramid[level].image
            h, w = lap.shape[:2]
            result = result[:h, :w]

            # Add Laplacian band
            result = result + lap

        return result

    def __len__(self) -> int:
        """Get number of levels."""
        return len(self.pyramid)
