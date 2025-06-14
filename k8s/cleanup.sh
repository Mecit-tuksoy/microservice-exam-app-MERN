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
kubectl delete pvc mongodb-data mongodb-data-mongodb-0 storage-volume
kubectl delete pv storage-service-pv mongodb-pv 

echo "=============================="
echo "Kubernetes kaynakları başarıyla temizlendi!"
echo "=============================="
echo "Minikube'u tamamen sıfırlamak için 'minikube delete' komutu kullanabilirsiniz."
echo "=============================="
