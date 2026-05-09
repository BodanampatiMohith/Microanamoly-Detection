# Model Evaluation Results

## Summary
- Normal samples: 80
- Abnormal samples: 80
- Test size: 0.3
- Features used: rms, variance, dominant_frequency, spectral_entropy, peak_to_peak

## Comparison Table

| Model | Accuracy | Precision (Abnormal) | Recall (Abnormal) | F1 (Abnormal) | False Alarm Rate | Miss Rate | Avg Inference (ms/sample) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Rule-Based | 87.50% | 100.00% | 75.00% | 85.71% | 0.00% | 25.00% | 0.0028 |
| One-Class SVM | 77.08% | 68.57% | 100.00% | 81.36% | 45.83% | 0.00% | 0.0175 |
| Isolation Forest | 62.50% | 60.00% | 75.00% | 66.67% | 50.00% | 25.00% | 0.4668 |
