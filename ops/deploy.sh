#!/usr/bin/env bash
set -euo pipefail

kubectl apply -f k8s/manifests/namespace.yaml
kubectl apply -f k8s/manifests/config.yaml
kubectl apply -f k8s/manifests/postgres.yaml
kubectl apply -f k8s/manifests/app.yaml
kubectl apply -f k8s/manifests/cloudflare-tunnel.yaml

kubectl -n apex-link rollout status statefulset/postgres
kubectl -n apex-link rollout status deployment/apex-link-app
kubectl -n apex-link rollout status deployment/cloudflare-tunnel
