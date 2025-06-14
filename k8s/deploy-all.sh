#!/bin/bash

# Hata durumunda scripti durdur
set -e

echo "=============================="
echo "Minikube ve Nginx Ingress yapılandırması"
echo "=============================="

# Minikube başlat
minikube start #--driver=docker --memory=4096 --cpus=4

# Nginx Ingress etkinleştir
minikube addons enable ingress

# Minikube IP adresini al
MINIKUBE_IP=$(minikube ip)
echo "Minikube IP adresi: $MINIKUBE_IP"

echo "📝 Hosts dosyası güncelleniyor..."
if grep -q "myapp.local" /etc/hosts; then
    echo "⚠️  myapp.local zaten hosts dosyasında mevcut"
    # Eski girişi kaldır ve yenisini ekle
    sudo sed -i '/myapp.local/d' /etc/hosts
fi

echo "$MINIKUBE_IP myapp.local" | sudo tee -a /etc/hosts
echo "✅ Hosts dosyası güncellendi"

echo "=============================="
echo "Docker imajları oluşturuluyor..."
echo "=============================="

# Minikube docker env'i ayarla
eval $(minikube docker-env)

# Uygulamaları Docker ile minikube içinde oluşturun
docker build -t test-app-frontend:latest ../frontend/
docker build -t test-app-auth-service:latest ../backend/auth-service/
docker build -t test-app-analytics-service:latest ../backend/analytics-service/
docker build -t test-app-storage-service:latest ../backend/storage-service/
docker build -t test-app-test-service:latest ../backend/test-service/

echo "=============================="
echo "Kubernetes kaynakları oluşturuluyor..."
echo "=============================="

# Namespace oluştur (eğer yoksa)
kubectl create namespace exam-app --dry-run=client -o yaml | kubectl apply -f -

# MongoDB (StatefulSet ve Service)
kubectl apply -f mongodb-data-persistentvolume.yaml
kubectl apply -f mongodb-statefulset.yaml
kubectl apply -f mongodb-service.yaml

# Diğer servislerin beklemesi için MongoDB'nin hazır olmasını bekleyin
echo "MongoDB hazır olana kadar bekleniyor..."
kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s

# PersistentVolumeClaim (storage-service için)
kubectl apply -f storage-service-persistentvolume.yaml
kubectl apply -f storage-service-persistentvolumeclaim.yaml

# Services
kubectl apply -f auth-service-service.yaml
kubectl apply -f analytics-service-service.yaml
kubectl apply -f storage-service-service.yaml
kubectl apply -f test-service-service.yaml
kubectl apply -f frontend-service.yaml

# Deployments
kubectl apply -f auth-service-deployment.yaml
kubectl apply -f analytics-service-deployment.yaml
kubectl apply -f storage-service-deployment.yaml
kubectl apply -f test-service-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# HorizontalPodAutoscalers
kubectl apply -f auth-service-hpa.yaml
kubectl apply -f analytics-service-hpa.yaml
kubectl apply -f storage-service-hpa.yaml
kubectl apply -f test-service-hpa.yaml
kubectl apply -f frontend-hpa.yaml
kubectl apply -f mongodb-hpa.yaml

# Ingress en son uygula (hizmetler hazır olduğunda)
kubectl apply -f microservice-exam-app-ingress.yaml

echo "=============================="
echo "Kubernetes kaynakları başarıyla oluşturuldu!"
echo "=============================="
echo "Uygulamaya erişmek için hosts dosyanızı düzenleyin ve şunu ekleyin:"
echo "$MINIKUBE_IP myapp.local"
echo "Ardından tarayıcınızdan http://myapp.local/ adresine gidebilirsiniz."
echo "veya http://$MINIKUBE_IP/ adresinden de erişebilirsiniz."
echo "=============================="
