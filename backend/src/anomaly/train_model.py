"""
Feature extraction and model training for ML-based anomaly detection.
This script helps collect data and train models offline.
"""
import os
import sys
import numpy as np
import pickle
from pathlib import Path

# For .mat file support
import h5py

from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split


def collect_features_from_folder(folder_path: str, label: str) -> list:
    """
    Collect feature vectors from JSON files in a folder.
    
    Expected structure: folder/frame_features_*.json
    Each JSON: {"rms": ..., "dominant_frequency": ..., ...}
    """
    features_list = []
    
    folder = Path(folder_path)
    for json_file in folder.glob("*.json"):
        try:
            import json
            with open(json_file) as f:
                features = json.load(f)
                features["label"] = label
                features_list.append(features)
        except Exception as e:
            print(f"Error reading {json_file}: {e}")
    
    return features_list

def collect_features_from_mat(mat_path: str, label: str) -> list:
    """
    Collect feature vectors from a MATLAB .mat (v7.3/HDF5) file.
    Expects a dataset named 'featureAll' with shape (1, N) or (N, M).
    Each row is a feature vector.
    """
    features_list = []
    with h5py.File(mat_path, 'r') as f:
        if 'featureAll' not in f:
            raise ValueError("featureAll not found in .mat file")
        data = f['featureAll']
        arr = data[()]
        # If shape is (1, N), transpose to (N,)
        if arr.shape[0] == 1:
            arr = arr[0]
        # If still 1D, wrap as list of lists
        if arr.ndim == 1:
            arr = arr.reshape(-1, 1)
        # Use generic feature names
        feature_names = [f"f{i+1}" for i in range(arr.shape[1])]
        for row in arr:
            feat = {fname: float(val) for fname, val in zip(feature_names, row)}
            feat["label"] = label
            features_list.append(feat)
    return features_list


def prepare_training_data(normal_features: list, abnormal_features: list = None):
    """
    Prepare training data for anomaly detection.
    
    Args:
        normal_features: List of feature dicts from normal operation
        abnormal_features: List of feature dicts from abnormal operation
    
    Returns:
        X_train, y_train numpy arrays and feature names
    """
    all_data = []
    labels = []
    
    # Add normal samples
    for feat in normal_features:
        all_data.append(feat)
        labels.append(1)  # 1 = normal
    
    # Add abnormal samples if provided
    if abnormal_features:
        for feat in abnormal_features:
            all_data.append(feat)
            labels.append(0)  # 0 = abnormal
    
    # Extract feature names (exclude label if present)
    if all_data:
        feature_names = [k for k in all_data[0].keys() if k != "label"]
    else:
        raise ValueError("No features provided")
    
    # Build feature matrix
    X = []
    for feat_dict in all_data:
        row = [feat_dict.get(fname, 0.0) for fname in feature_names]
        X.append(row)
    
    X = np.array(X, dtype=np.float32)
    y = np.array(labels, dtype=np.int32)
    
    return X, y, feature_names


def train_oneclass_svm(X_normal: np.ndarray, feature_names: list, nu: float = 0.05):
    """
    Train One-Class SVM on normal data.
    
    Args:
        X_normal: Feature matrix (N, M) - normal samples only
        feature_names: List of feature names
        nu: One-class SVM nu parameter (fraction of outliers)
    
    Returns:
        Trained model and scaler
    """
    print(f"Training One-Class SVM with {len(X_normal)} samples...")
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_normal)
    
    # Train
    model = OneClassSVM(kernel='rbf', gamma='auto', nu=nu)
    model.fit(X_scaled)
    
    print(f"Model trained. Support vectors: {len(model.support_vectors_)}")
    
    return model, scaler, feature_names


def train_isolation_forest(X_train: np.ndarray, feature_names: list, contamination: float = 0.1):
    """
    Train Isolation Forest on mixed data.
    
    Args:
        X_train: Feature matrix (N, M) - mixed normal/abnormal
        feature_names: List of feature names
        contamination: Expected fraction of abnormal samples
    
    Returns:
        Trained model and scaler
    """
    print(f"Training Isolation Forest with {len(X_train)} samples...")
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_train)
    
    # Train
    model = IsolationForest(contamination=contamination, random_state=42)
    model.fit(X_scaled)
    
    print(f"Model trained.")
    
    return model, scaler, feature_names


def save_model(model, scaler, feature_names: list, output_path: str):
    """Save model and scaler to pickle file."""
    model_dict = {
        "model": model,
        "scaler": scaler,
        "feature_names": feature_names,
    }
    
    output_dir = os.path.dirname(output_path)
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
    
    with open(output_path, "wb") as f:
        pickle.dump(model_dict, f)
    
    print(f"Model saved to {output_path}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Train anomaly detection model")
    parser.add_argument("--normal-data", required=True, help="Folder with normal operation features or .mat file")
    parser.add_argument("--abnormal-data", help="Folder with abnormal operation features or .mat file")
    parser.add_argument("--mat", action="store_true", help="Set this flag if input is a .mat file (v7.3)")
    parser.add_argument("--model-type", choices=["svm", "isolation"], default="svm",
                       help="Model type to train")
    parser.add_argument("--output", default="anomaly_model.pkl", help="Output model path")
    
    args = parser.parse_args()
    
    # Collect data
    print("Collecting normal operation features...")
    if args.mat:
        normal_features = collect_features_from_mat(args.normal_data, "normal")
    else:
        normal_features = collect_features_from_folder(args.normal_data, "normal")
    print(f"Found {len(normal_features)} normal samples")

    abnormal_features = []
    if args.abnormal_data:
        print("Collecting abnormal operation features...")
        if args.mat:
            abnormal_features = collect_features_from_mat(args.abnormal_data, "abnormal")
        else:
            abnormal_features = collect_features_from_folder(args.abnormal_data, "abnormal")
        print(f"Found {len(abnormal_features)} abnormal samples")
    
    # Prepare data
    if args.model_type == "svm":
        X_normal, _, feature_names = prepare_training_data(normal_features)
        model, scaler, feature_names = train_oneclass_svm(X_normal, feature_names)
    else:  # isolation forest
        X_train, y_train, feature_names = prepare_training_data(normal_features, abnormal_features)
        model, scaler, feature_names = train_isolation_forest(X_train, feature_names)
    
    # Save
    save_model(model, scaler, feature_names, args.output)
