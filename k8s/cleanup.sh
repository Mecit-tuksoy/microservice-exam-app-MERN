#!/bin/bash

echo "=============================="
echo "Kubernetes kaynaklarını temizleme"
echo "=============================="

# Tüm kaynakları temizle
kubectl delete ingress microservice-exam-app-ingress

# HorizontalPodAutoscalers sil
kubectl delete hpa auth-service-hpa analytics-service-hpa storage-service-hpa test-service-hpa frontend-hpa mongodb-hpa

# Deployments sil
kubectl delete deployment auth-service analytics-service storage-service test-service frontend

# Services sil
kubectl delete service auth-service analytics-service storage-service test-service frontend mongodb

# StatefulSet sil
kubectl delete statefulset mongodb

# PersistentVolumeClaims sil
kubectl delete pvc storage-service-claim0 mongodb-data-0

echo "=============================="
echo "Kubernetes kaynakları başarıyla temizlendi!"
echo "=============================="
echo "Minikube'u tamamen sıfırlamak için 'minikube delete' komutu kullanabilirsiniz."
echo "=============================="
