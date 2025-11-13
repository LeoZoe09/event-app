# CI/CD Pipeline Setup Guide

## Overview
This guide explains the updated CI/CD pipeline with staging environment, integration tests, and AWS Fargate deployment.

## Pipeline Flow

```
Lint & Unit Tests
       ↓
Build Docker Image
       ↓
Deploy to Staging
       ↓
Integration Tests (Cucumber)
       ↓
Manual Approval
       ↓
Deploy to Production
```

## AWS Fargate Setup

AWS Fargate is an excellent choice for this pipeline because:
- **Serverless**: No need to manage EC2 instances
- **Cost-effective**: Pay only for compute resources used
- **Scalable**: Automatically handles scaling
- **Secure**: Better isolation and security
- **Integration**: Seamless integration with ECS

### Required AWS Resources

#### 1. ECR Repository
```bash
aws ecr create-repository \
  --repository-name event-app \
  --region us-east-1
```

#### 2. VPC and Networking
- Create/Use a VPC with public and private subnets
- Create Security Group allowing:
  - Inbound: Port 3000 (application)
  - Outbound: All traffic (for external APIs)

#### 3. Staging Environment
```bash
# Create ECS Cluster
aws ecs create-cluster \
  --cluster-name event-app-cluster-staging \
  --region us-east-1

# Create CloudWatch Log Group
aws logs create-log-group \
  --log-group-name /ecs/event-app-staging \
  --region us-east-1
```

#### 4. Production Environment
```bash
# Create ECS Cluster
aws ecs create-cluster \
  --cluster-name event-app-cluster-prod \
  --region us-east-1

# Create CloudWatch Log Group
aws logs create-log-group \
  --log-group-name /ecs/event-app-prod \
  --region us-east-1
```

#### 5. Task Definition (Staging)
Create an ECS task definition JSON file:
```json
{
  "family": "event-app-task-staging",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "event-app-container",
      "image": "<ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/event-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "MONGODB_URI",
          "value": "your-staging-mongodb-uri"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/event-app-staging",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole"
}
```

Register the task definition:
```bash
aws ecs register-task-definition \
  --cli-input-json file://task-definition-staging.json \
  --region us-east-1
```

#### 6. ECS Service (Staging)
```bash
aws ecs create-service \
  --cluster event-app-cluster-staging \
  --service-name event-app-service-staging \
  --task-definition event-app-task-staging \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/xxx,containerName=event-app-container,containerPort=3000 \
  --region us-east-1
```

**Repeat steps 5-6 for production**, replacing `staging` with `prod`.

## GitHub Secrets Configuration

Set these secrets in your GitHub repository (Settings → Secrets → Actions):

```
AWS_ACCESS_KEY_ID           - Your AWS access key
AWS_SECRET_ACCESS_KEY       - Your AWS secret access key
STAGING_URL                 - Staging environment URL (e.g., http://staging.example.com)
STAGING_MONGODB_URI         - MongoDB connection string for staging
```

Optional (if needed):
```
PROD_MONGODB_URI            - MongoDB connection string for production
```

## Cucumber Integration Tests

### Installation

Add these packages to your `package.json`:

```bash
npm install --save-dev \
  @cucumber/cucumber \
  @types/cucumber \
  ts-node \
  typescript \
  axios
```

### Project Structure

```
features/
  ├── events.feature                 # Feature files in Gherkin syntax
  └── step_definitions/
      └── events.steps.ts            # Step implementations
cucumber.js                          # Cucumber configuration
```

### Running Tests Locally

```bash
# Install dependencies
npm install

# Run all Cucumber tests
npm run test:integration

# Run specific feature
npx cucumber-js features/events.feature

# Run with specific tags
npx cucumber-js --tags "@smoke"
```

### Add to package.json

```json
{
  "scripts": {
    "test:integration": "cucumber-js --format html:reports/cucumber-report.html --format json:reports/cucumber-report.json"
  }
}
```

## Deployment Flow Explanation

### 1. **Lint & Unit Tests** (PR and Main Branch)
- Runs ESLint for code quality
- Runs Jest unit tests
- Fails if there are errors

### 2. **Build Docker Image** (Main Branch Only)
- Builds multi-stage Docker image
- Pushes to ECR with commit SHA and `latest` tags

### 3. **Deploy to Staging** (Main Branch Only)
- Forces new deployment on staging ECS service
- Waits for deployment to stabilize

### 4. **Integration Tests** (Main Branch Only)
- Waits for staging service to be healthy
- Runs Cucumber integration tests
- Uploads test reports as artifacts

### 5. **Manual Approval** (Main Branch Only)
- Requires manual approval in GitHub to proceed to production
- Access via: Actions → specific workflow run → Review deployments

### 6. **Deploy to Production** (Main Branch Only)
- Only after manual approval
- Forces new deployment on production ECS service
- Waits for deployment to stabilize

## Monitoring and Troubleshooting

### View Logs
```bash
aws logs tail /ecs/event-app-staging --follow
aws logs tail /ecs/event-app-prod --follow
```

### Check Service Status
```bash
aws ecs describe-services \
  --cluster event-app-cluster-staging \
  --services event-app-service-staging

aws ecs describe-services \
  --cluster event-app-cluster-prod \
  --services event-app-service-prod
```

### View Task Logs
```bash
aws ecs describe-tasks \
  --cluster event-app-cluster-staging \
  --tasks <task-arn>
```

## Best Practices

1. **Always test in staging first** before production
2. **Monitor Cucumber test results** before approving production
3. **Use descriptive commit messages** to track changes
4. **Review CloudWatch logs** regularly for errors
5. **Set up alerts** for failed deployments
6. **Implement gradual rollout** (canary deployments) for high-traffic apps
7. **Keep task CPU/memory optimized** to control costs

## Cost Optimization Tips

1. Use Fargate Spot instances for non-critical workloads
2. Right-size task CPU/memory (start with 256 CPU, 512 memory)
3. Use Application Load Balancer only if needed
4. Monitor CloudWatch for unused resources
5. Consider RDS Proxy for database connection pooling
