# Vercel环境变量配置指南

## 通过Vercel CLI配置

### 1. 安装Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 配置环境变量
```bash
# 添加Google Maps API Key
vercel env add GOOGLE_MAPS_API_KEY

# 添加API Keys配置
vercel env add API_KEYS

# 添加速率限制配置
vercel env add DEFAULT_RATE_LIMIT
vercel env add DEFAULT_RATE_WINDOW

# 添加日志配置
vercel env add LOG_LEVEL
vercel env add ENABLE_REQUEST_LOGGING
```

### 4. 批量导入环境变量
如果你有很多环境变量，可以通过文件导入：

```bash
# 创建环境变量文件 (注意：不要提交到git)
cat > .env.production << 'EOF'
GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key
API_KEYS=your_api_key_1:user1:maps,geocode;your_api_key_2:user2:maps
DEFAULT_RATE_LIMIT=100
DEFAULT_RATE_WINDOW=3600
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=true
EOF

# 使用vercel env pull拉取现有环境变量
vercel env pull .env.vercel

# 手动在Vercel Dashboard中添加变量
```

## 方法3：通过vercel.json配置

你也可以在vercel.json中配置一些环境变量（仅限非敏感数据）：

```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production",
    "DEFAULT_RATE_LIMIT": "100",
    "DEFAULT_RATE_WINDOW": "3600",
    "LOG_LEVEL": "info",
    "ENABLE_REQUEST_LOGGING": "true"
  }
}
```

**注意：敏感信息（如API Keys）不应该放在vercel.json中，应该通过Dashboard或CLI配置。**

## 部署流程

### 1. 首次部署
```bash
# 确保已配置环境变量
vercel --prod
```

### 2. 后续部署
```bash
# 推送代码后自动部署，或手动触发
git push origin main
# 或
vercel --prod
```

## 验证环境变量

部署后，你可以通过健康检查端点验证配置：

```bash
curl https://your-app.vercel.app/api/health
```

如果配置正确，应该返回：
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-14T...",
    "version": "1.0.0",
    "services": {
      "google-maps": "available"
    }
  }
}
```

## 常见问题

### 1. 环境变量不生效
- 确保变量名正确（区分大小写）
- 重新部署项目：`vercel --prod --force`

### 2. Google Maps API Key问题
- 确保API Key有效且已启用Geocoding API
- 检查API Key的域名限制设置

### 3. 认证问题
- 确保API_KEYS格式正确：`key:name:permissions`
- 多个key用分号分隔 