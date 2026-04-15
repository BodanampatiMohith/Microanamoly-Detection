"""
Evaluate anomaly detection models on labeled feature JSON data.

Expected input:
- normal folder:   JSON files from normal operation
- abnormal folder: JSON files from abnormal operation

Each JSON should include numeric feature keys such as:
- rms
- variance
- dominant_frequency
- spectral_entropy
- peak_to_peak
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import OneClassSVM

# Add backend/ to path so `src.*` imports resolve consistently.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from src.anomaly.rules import RuleBasedDetector

PREFERRED_FEATURE_ORDER = [
    "rms",
    "variance",
    "dominant_frequency",
    "spectral_entropy",
    "peak_to_peak",
    "mean",
    "std_dev",
    "max_value",
    "min_value",
]


def _is_numeric(value) -> bool:
    return isinstance(value, (int, float, np.integer, np.floating))


def collect_features_from_folder(folder_path: str, label: int) -> List[Dict]:
    """Collect numeric feature dictionaries from JSON files recursively."""
    samples: List[Dict] = []
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError(f"Folder not found: {folder_path}")

    for json_file in folder.rglob("*.json"):
        try:
            with open(json_file, "r", encoding="utf-8") as handle:
                payload = json.load(handle)

            numeric_features = {
                key: float(value) for key, value in payload.items() if _is_numeric(value)
            }

            if not numeric_features:
                continue

            numeric_features["label"] = int(label)  # 1=normal, 0=abnormal
            samples.append(numeric_features)
        except Exception as exc:
            print(f"Skipping {json_file}: {exc}")

    return samples


def derive_feature_names(samples: List[Dict]) -> List[str]:
    """Derive a stable numeric feature list present in all samples."""
    if not samples:
        raise ValueError("No samples were collected.")

    feature_sets = []
    for sample in samples:
        keys = {key for key in sample.keys() if key != "label"}
        feature_sets.append(keys)

    common = set.intersection(*feature_sets) if feature_sets else set()
    if not common:
        raise ValueError("No common numeric feature keys found across all samples.")

    ordered = [name for name in PREFERRED_FEATURE_ORDER if name in common]
    remaining = sorted(common - set(ordered))
    return ordered + remaining


def build_matrix(samples: List[Dict], feature_names: List[str]) -> Tuple[np.ndarray, np.ndarray]:
    """Build X/y arrays from samples and feature order."""
    X = []
    y = []
    for sample in samples:
        X.append([sample.get(name, 0.0) for name in feature_names])
        y.append(int(sample["label"]))

    return np.asarray(X, dtype=np.float32), np.asarray(y, dtype=np.int32)


def measure_metrics(y_true: np.ndarray, y_pred: np.ndarray, inference_ms: float) -> Dict[str, float]:
    """
    Compute metrics with anomaly-centric precision/recall/F1.
    Abnormal class is treated as positive class.
    """
    abnormal_true = (y_true == 0).astype(np.int32)
    abnormal_pred = (y_pred == 0).astype(np.int32)

    normal_mask = y_true == 1
    abnormal_mask = y_true == 0

    false_alarm_rate = (
        float(np.mean(y_pred[normal_mask] == 0)) if np.any(normal_mask) else 0.0
    )
    miss_rate = (
        float(np.mean(y_pred[abnormal_mask] == 1)) if np.any(abnormal_mask) else 0.0
    )

    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision_abnormal": float(
            precision_score(abnormal_true, abnormal_pred, zero_division=0)
        ),
        "recall_abnormal": float(recall_score(abnormal_true, abnormal_pred, zero_division=0)),
        "f1_abnormal": float(f1_score(abnormal_true, abnormal_pred, zero_division=0)),
        "false_alarm_rate": false_alarm_rate,
        "miss_rate": miss_rate,
        "avg_inference_ms_per_sample": float(inference_ms),
    }


def evaluate_rule_based(
    X_train: np.ndarray, y_train: np.ndarray, X_test: np.ndarray, y_test: np.ndarray, feature_names: List[str]
) -> Dict[str, float]:
    detector = RuleBasedDetector()

    normal_train = X_train[y_train == 1]
    normal_train_features = [dict(zip(feature_names, row.tolist())) for row in normal_train]
    detector.update_baseline(normal_train_features)

    predictions = []
    start = time.perf_counter()
    for row in X_test:
        status, _score = detector.detect(dict(zip(feature_names, row.tolist())))
        predictions.append(1 if status == "Normal" else 0)
    elapsed_ms = (time.perf_counter() - start) * 1000

    y_pred = np.asarray(predictions, dtype=np.int32)
    metrics = measure_metrics(y_test, y_pred, inference_ms=elapsed_ms / max(1, len(X_test)))
    return {"model": "Rule-Based", **metrics}


def evaluate_one_class_svm(
    X_train: np.ndarray, y_train: np.ndarray, X_test: np.ndarray, y_test: np.ndarray, nu: float
) -> Dict[str, float]:
    normal_train = X_train[y_train == 1]

    scaler = StandardScaler()
    X_normal_scaled = scaler.fit_transform(normal_train)
    X_test_scaled = scaler.transform(X_test)

    model = OneClassSVM(kernel="rbf", gamma="scale", nu=nu)
    model.fit(X_normal_scaled)

    start = time.perf_counter()
    raw_pred = model.predict(X_test_scaled)  # 1=inlier(normal), -1=outlier(abnormal)
    elapsed_ms = (time.perf_counter() - start) * 1000

    y_pred = np.where(raw_pred == 1, 1, 0).astype(np.int32)
    metrics = measure_metrics(y_test, y_pred, inference_ms=elapsed_ms / max(1, len(X_test)))
    return {"model": "One-Class SVM", **metrics}


def evaluate_isolation_forest(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    n_estimators: int,
) -> Dict[str, float]:
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    contamination = float(np.mean(y_train == 0))
    contamination = min(0.49, max(0.001, contamination))

    model = IsolationForest(
        n_estimators=n_estimators,
        contamination=contamination,
        random_state=42,
    )
    model.fit(X_train_scaled)

    start = time.perf_counter()
    raw_pred = model.predict(X_test_scaled)  # 1=inlier(normal), -1=outlier(abnormal)
    elapsed_ms = (time.perf_counter() - start) * 1000

    y_pred = np.where(raw_pred == 1, 1, 0).astype(np.int32)
    metrics = measure_metrics(y_test, y_pred, inference_ms=elapsed_ms / max(1, len(X_test)))
    return {"model": "Isolation Forest", **metrics}


def format_percent(value: float) -> str:
    return f"{value * 100:.2f}%"


def markdown_table(rows: List[Dict[str, float]]) -> str:
    header = (
        "| Model | Accuracy | Precision (Abnormal) | Recall (Abnormal) | "
        "F1 (Abnormal) | False Alarm Rate | Miss Rate | Avg Inference (ms/sample) |\n"
        "|---|---:|---:|---:|---:|---:|---:|---:|"
    )

    lines = [header]
    for row in rows:
        lines.append(
            "| "
            f"{row['model']} | "
            f"{format_percent(row['accuracy'])} | "
            f"{format_percent(row['precision_abnormal'])} | "
            f"{format_percent(row['recall_abnormal'])} | "
            f"{format_percent(row['f1_abnormal'])} | "
            f"{format_percent(row['false_alarm_rate'])} | "
            f"{format_percent(row['miss_rate'])} | "
            f"{row['avg_inference_ms_per_sample']:.4f} |"
        )
    return "\n".join(lines)


def save_outputs(output_dir: Path, rows: List[Dict[str, float]], meta: Dict) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    json_path = output_dir / "evaluation_results.json"
    csv_path = output_dir / "evaluation_results.csv"
    md_path = output_dir / "evaluation_results.md"

    with open(json_path, "w", encoding="utf-8") as handle:
        json.dump({"meta": meta, "results": rows}, handle, indent=2)

    with open(csv_path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "model",
                "accuracy",
                "precision_abnormal",
                "recall_abnormal",
                "f1_abnormal",
                "false_alarm_rate",
                "miss_rate",
                "avg_inference_ms_per_sample",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    md_table = markdown_table(rows)
    with open(md_path, "w", encoding="utf-8") as handle:
        handle.write("# Model Evaluation Results\n\n")
        handle.write("## Summary\n")
        handle.write(f"- Normal samples: {meta['normal_samples']}\n")
        handle.write(f"- Abnormal samples: {meta['abnormal_samples']}\n")
        handle.write(f"- Test size: {meta['test_size']}\n")
        handle.write(f"- Features used: {', '.join(meta['feature_names'])}\n\n")
        handle.write("## Comparison Table\n\n")
        handle.write(md_table)
        handle.write("\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate anomaly models on labeled features.")
    parser.add_argument("--normal-data", required=True, help="Folder with normal feature JSON files.")
    parser.add_argument("--abnormal-data", required=True, help="Folder with abnormal feature JSON files.")
    parser.add_argument("--test-size", type=float, default=0.3, help="Test split ratio (default: 0.3).")
    parser.add_argument("--svm-nu", type=float, default=0.05, help="One-Class SVM nu (default: 0.05).")
    parser.add_argument(
        "--iforest-estimators",
        type=int,
        default=200,
        help="Isolation Forest n_estimators (default: 200).",
    )
    parser.add_argument(
        "--output-dir",
        default="backend/evaluation",
        help="Directory to save evaluation outputs.",
    )

    args = parser.parse_args()

    normal_samples = collect_features_from_folder(args.normal_data, label=1)
    abnormal_samples = collect_features_from_folder(args.abnormal_data, label=0)

    if not normal_samples or not abnormal_samples:
        raise ValueError(
            "Need both normal and abnormal samples. "
            f"Found normal={len(normal_samples)}, abnormal={len(abnormal_samples)}."
        )

    all_samples = normal_samples + abnormal_samples
    feature_names = derive_feature_names(all_samples)
    X, y = build_matrix(all_samples, feature_names=feature_names)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=args.test_size,
        random_state=42,
        stratify=y,
    )

    results = [
        evaluate_rule_based(X_train, y_train, X_test, y_test, feature_names=feature_names),
        evaluate_one_class_svm(X_train, y_train, X_test, y_test, nu=args.svm_nu),
        evaluate_isolation_forest(
            X_train,
            y_train,
            X_test,
            y_test,
            n_estimators=args.iforest_estimators,
        ),
    ]

    meta = {
        "normal_samples": len(normal_samples),
        "abnormal_samples": len(abnormal_samples),
        "test_size": args.test_size,
        "feature_names": feature_names,
    }

    output_dir = Path(args.output_dir)
    save_outputs(output_dir, results, meta)

    print("\nModel Comparison:")
    print(markdown_table(results))
    print(f"\nSaved outputs to: {output_dir.resolve()}")


if __name__ == "__main__":
    main()
