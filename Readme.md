# Decision Engine

A suite of microservices for credit evaluation and loan management, built with FastAPI, scikit-learn, ASP .NET Core + Duende IdentityServer, and deployed on Kubernetes.

---

## 📦 Contents

* **ai-service/**

  * Inference service exposing `/predict`
  * Trains a RandomForest model for **approve | pending | reject** decisions
* **identity-server/**

  * Duende IdentityServer + ASP .NET Identity for user management and OAuth2/OIDC
* **credit-bureau/**

  * (Optional) Client microservice querying a “Credit Bureau API”
* **loan-service/** *(coming soon)*

  * Loan request management
* **k8s/**

  * Manifests for Secrets, Deployments, Services, Ingress, StatefulSet (SQL Server), initialization Jobs, etc.

---

## 🚀 Architecture

```text
┌──────────────┐     ┌─────────────┐
│  Front-end   │◀──▶│ IdentitySrv │◀───┐
└──────────────┘     └──────┬──────┘    │
                              │          │
┌───────────────┐  Client     ▼   Client └─┐
│  Credit-Bureau│◀──────────▶│  AI-Service  │
└───────────────┘             └─────┬──────┘
                                      │
                                ┌─────▼────┐
                                │ SQL Server│ (Auth DB)
                                └───────────┘
```

* **IdentityServer**: Authentication/authorization via OIDC & OAuth2
* **AI-Service**: Machine learning inference
* **Credit-Bureau**: Credit data microservice
* **Loan-Service**: Loan management (in development)
* **SQL Server**: IdentityServer’s database
* **RabbitMQ**: Message broker (to integrate)

---

## ⚙️ Prerequisites

* [Docker](https://www.docker.com/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)
* Minikube / GKE / AKS / EKS
* .NET 9 SDK (for IdentityServer)
* Python 3.10+ (for ai-service)

---

## 🛠️ Local Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/your-user/decision-engine.git
   cd decision-engine
   ```
2. **Environment variables**

   ```bash
   export ConnectionStrings__AuthDb="Server=localhost;Database=AuthServerDb;User Id=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;MultipleActiveResultSets=true"
   export ASPNETCORE_ENVIRONMENT="Development"
   ```
3. **Run SQL Server locally**

   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourStrong@Passw0rd" \
     -p 1433:1433 --name mssql-local -d mcr.microsoft.com/mssql/server:2019-latest
   ```
4. **Apply EF Core migrations**

   ```bash
   cd identity-server
   dotnet ef database update
   ```
5. **Seed an admin user**

   ```bash
   dotnet run --project identity-server \
     -- SeedUser --UserName admin --Password Admin@123
   ```
6. **Build & run services**

   ```bash
   # AI-Service
   cd ai-service
   pip install -r requirements.txt
   python training.py
   uvicorn app:app --reload

   # IdentityServer
   cd ../identity-server
   dotnet run
   ```

---

## 📦 Docker & Kubernetes

1. **Build & push images**

   ```bash
   # AI-Service
   docker build -t yourrepo/ai-inference:latest ai-service/
   # IdentityServer
   docker build -t yourrepo/identity-server:latest identity-server/
   docker push yourrepo/ai-inference:latest
   docker push yourrepo/identity-server:latest
   ```
2. **Configure namespace**

   ```bash
   kubectl create ns decision-engine-dev
   kubectl config set-context --current --namespace=decision-engine-dev
   ```
3. **Deploy manifests**

   ```bash
   kubectl apply -f k8s/
   ```
4. **Verify**

   ```bash
   kubectl get all
   kubectl logs deployment/ai-inference
   kubectl logs deployment/identity-server
   kubectl port-forward svc/ai-inference 8000:8000
   ```

---

## 🔍 Testing

* **AI-Service Predict**

  ```bash
  curl http://localhost:8000/predict \
    -H "Content-Type: application/json" \
    -d '{"salary":5000000,"age":30,"credit_score":700,"total_debt":1000000,"payment_history":[{"month":"2025-06","status":"on_time"}]}'
  ```
* **IdentityServer Metadata**
  Visit `http://identity-server.local/.well-known/openid-configuration`

---

## 🎯 Best Practices

* Store secrets in **Kubernetes Secrets**
* Use **Helm** for parametrized deployments
* Integrate **CI/CD** (GitHub Actions, Azure Pipelines)
* Add **unit** & **integration tests**
* Monitor with **Prometheus** & **Grafana**

---

## 🛣 Roadmap

* Integrate **RabbitMQ** for loan orchestration
* Implement **Loan-Service** in ASP .NET Core
* Build a simple UI (React + Tailwind)
* Add monitoring & alerts
* Publish images to **Docker Hub**

---

## ⚖️ License

MIT © Cristian Mendoza
## LinkedIn

[![LinkedIn](https://img.shields.io/badge/LinkedIn-ctj01-blue?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/ctj01/)
```
