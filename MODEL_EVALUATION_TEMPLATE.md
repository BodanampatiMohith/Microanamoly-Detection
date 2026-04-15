# Model Evaluation Template

Use this template after running:

```powershell
python backend/src/anomaly/evaluate_models.py `
  --normal-data data/recordings/features/normal `
  --abnormal-data data/recordings/features/abnormal
```

## Dataset Summary

- Normal samples:
- Abnormal samples:
- Test split:
- Features used:

## Comparison Table

| Model | Accuracy | Precision (Abnormal) | Recall (Abnormal) | F1 (Abnormal) | False Alarm Rate | Miss Rate | Avg Inference (ms/sample) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Rule-Based |  |  |  |  |  |  |  |
| One-Class SVM |  |  |  |  |  |  |  |
| Isolation Forest |  |  |  |  |  |  |  |

## Faculty-Facing Interpretation

1. Best model by F1 (abnormal class):
2. Model with lowest false alarm rate:
3. Model with lowest miss rate:
4. Model with fastest inference:
5. Final model selected for deployment:

## Notes / Limitations

1. Dataset collection conditions (lighting, distance, camera stability):
2. Machine type tested (fan/turbine/etc.):
3. Any class imbalance issues:
4. Future improvement plan:
