#!/bin/bash

if [ -z "$1" ]; then
    echo "❌ Environment parameter is required! Please use: ./build.sh [development|production|test]"
    exit 1
fi

ENV=$1
ENV_FILE=".env.$ENV"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Environment file $ENV_FILE does not exist!"
    exit 1
fi

# 清理旧的构建文件
echo "🧹 Cleaning up old build files..."
rm -rf dist/
rm -rf .aws-sam/
rm -rf layer/

# 创建必要的目录
mkdir -p dist/
mkdir -p layer/nodejs

# 使用webpack构建应用
echo "🏗️ Building application with webpack..."
yarn run build

# 设置 Lambda Layer
echo "📦 Setting up Lambda layer..."
cat > layer/nodejs/package.json << EOF
{
  "dependencies": {
    "awilix": "^12.0.4",
    "awilix-koa": "^11.1.0",
    "koa": "^2.15.4",
    "koa-router": "^13.0.1",
    "koa-static": "^5.0.0",
    "koa-swig": "^2.2.1",
    "koa2-connect-history-api-fallback": "^0.1.3",
    "lodash": "^4.17.21",
    "log4js": "^6.9.1",
    "module-alias": "^2.2.3",
    "serverless-http": "^3.2.0"
  }
}
EOF

# 在layer中安装依赖
cd layer/nodejs
echo "📦 Installing layer dependencies..."
yarn install --production --frozen-lockfile

echo "📊 Final layer size:"
du -sh node_modules/
cd ../../

# 准备函数部署包
echo "📦 Preparing function package..."
cp "$ENV_FILE" "dist/.env"

# 执行 sam build 和部署
echo "🚀 Running sam build..."
sam build --skip-pull-image

if [ $? -eq 0 ]; then
    if [ "$ENV" = "production" ] || [ "$ENV" = "test" ]; then
        echo "🚀 Deploying to production..."
        sam deploy -g
    else
        echo "🌍 Starting local API..."
        sam local start-api --warm-containers EAGER
    fi
else
    echo "❌ Sam build failed!"
    exit 1
fi

# 获取 S3 桶名并上传静态资源
echo "🔍 Getting S3 bucket name..."
STACK_NAME=$(aws cloudformation describe-stacks --query "Stacks[?contains(StackName, 'bff-stack')].StackName" --output text)

if [ -z "$STACK_NAME" ]; then
    echo "⚠️ Could not find stack name. Please upload static assets manually."
else
    S3_BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" --output text)

    if [ -z "$S3_BUCKET_NAME" ]; then
        echo "⚠️ Could not find S3 bucket name. Please upload static assets manually."
    else
        echo "📤 Uploading static assets to S3 bucket: $S3_BUCKET_NAME..."

        # 检查 assets 目录是否存在
        if [ -d "assets" ]; then
            # 上传静态资源到 S3
            aws s3 cp assets/ s3://$S3_BUCKET_NAME/ --recursive --acl public-read
            echo "✅ Static assets uploaded to S3"
        else
            echo "⚠️ Assets directory not found. Nothing to upload."
        fi
    fi
fi

echo "🎉 Deployment completed!"