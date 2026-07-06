# Sentinel Vision Systems

## Project ID
PROJ-ML-002-PROD

## Summary
Real-time computer vision pipeline for automated defect detection on manufacturing lines.

## Details
Developed an end-to-end MLOps pipeline for deploying and monitoring computer vision models at the edge. The system ingests high-definition video feeds from factory lines and performs real-time defect classification using optimized YOLOv8 models. 

To handle the complexity of continuous model improvement, we implemented a data flywheel that automatically captures edge-case inputs where the model has low confidence, sending them back to a centralized data lake for human annotation and automated retraining. The entire infrastructure is managed via Kubernetes to guarantee uptime and zero-downtime model swaps.

## Architecture
Edge inference managed by Kubernetes, syncing with a centralized feature store and model registry via AWS SageMaker.

## Tech Stack
- Python
- PyTorch
- OpenCV
- AWS
- Kubernetes
- Docker
- TensorFlow

## Links
- Repository: [https://github.com/example/sentinel]
