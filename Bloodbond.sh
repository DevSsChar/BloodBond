================================================================================
KUBERNETES DEPLOYMENT GUIDE - BLOODBOND APPLICATION
Complete Step-by-Step Instructions
================================================================================

STEP 1: INSTALL KUBECTL
--------------------------------------------------------------------------------
sudo apt-get update
sudo snap install kubectl --classic
kubectl version --client


STEP 2: INSTALL DOCKER
--------------------------------------------------------------------------------
sudo apt-get install -y docker.io
sudo usermod -aG docker $USER
newgrp docker
docker ps


STEP 3: INSTALL MINIKUBE
--------------------------------------------------------------------------------
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
minikube version


STEP 4: START MINIKUBE CLUSTER
--------------------------------------------------------------------------------
minikube start --driver=docker
# Wait 2-3 minutes for cluster to start

kubectl cluster-info
kubectl get nodes


STEP 5: DEPLOY YOUR APPLICATION
--------------------------------------------------------------------------------
cd ~/BloodBond

# Apply in order:
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml


STEP 6: VERIFY DEPLOYMENT
--------------------------------------------------------------------------------
kubectl get namespace bloodbond
kubectl get pods -n bloodbond
kubectl get pods -n bloodbond -w
# Press Ctrl+C to exit watch mode

kubectl get svc -n bloodbond
kubectl logs -n bloodbond -l app=bloodbond1


STEP 7: ACCESS YOUR APPLICATION
--------------------------------------------------------------------------------
# Method 1: Get Minikube service URL
minikube service bloodbond-svc -n bloodbond --url

# Method 2: Port forward to localhost
kubectl port-forward -n bloodbond svc/bloodbond-svc 8080:80
# Then access: http://localhost:8080


STEP 8: MONITORING COMMANDS
--------------------------------------------------------------------------------
# View all resources
kubectl get all -n bloodbond

# Describe pod
kubectl describe pod -n bloodbond -l app=bloodbond1

# Real-time logs
kubectl logs -n bloodbond -l app=bloodbond1 -f

# Check deployment status
kubectl rollout status deployment/bloodbond1 -n bloodbond

# Open Minikube dashboard
minikube dashboard


TROUBLESHOOTING COMMANDS
--------------------------------------------------------------------------------
# Pod not starting
kubectl describe pod -n bloodbond -l app=bloodbond1

# Check events
kubectl get events -n bloodbond --sort-by='.lastTimestamp'

# Restart deployment
kubectl rollout restart deployment/bloodbond1 -n bloodbond

# Delete and recreate
kubectl delete -f k8s/
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/service.yml


CLEANUP COMMANDS
--------------------------------------------------------------------------------
# Delete application
kubectl delete -f k8s/

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Start again
minikube start


IMPORTANT NOTES
--------------------------------------------------------------------------------
1. Your application uses:
   - Image: devs12/frontend1:latest
   - Container Port: 3000
   - Service NodePort: 30000
   - Namespace: bloodbond

2. Service selector should match deployment labels (currently mismatched)
   Fix in k8s/service.yml: Change selector to "app: bloodbond1"

3. For AWS EC2 access from outside:
   - Configure Security Group to allow inbound traffic on port 30000
   - Use: http://<EC2-PUBLIC-IP>:30000

4. Check if pod is Running before accessing the application
   kubectl get pods -n bloodbond

5. If using port-forward, keep the terminal open while accessing

================================================================================
END OF GUIDE
================================================================================