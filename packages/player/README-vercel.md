# Player 服务 Vercel 部署指南

## 部署步骤

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **在项目根目录部署**
   ```bash
   cd packages/player
   vercel
   ```

4. **配置环境变量**
   在 Vercel 仪表板中设置以下环境变量：
   - `OPENAI_API_KEY`: 你的 OpenAI API 密钥
   - `LANGFUSE_SECRET_KEY`: Langfuse 密钥 (可选)
   - `LANGFUSE_PUBLIC_KEY`: Langfuse 公钥 (可选)
   - `LANGFUSE_BASEURL`: Langfuse 实例 URL (可选)
   - `NODE_ENV`: production

## API 端点

部署后，你的 API 端点将是：
- `https://your-deployment.vercel.app/api/player/start-game`
- `https://your-deployment.vercel.app/api/player/speak`
- `https://your-deployment.vercel.app/api/player/vote`
- `https://your-deployment.vercel.app/api/player/use-ability`
- `https://your-deployment.vercel.app/api/player/last-words`
- `https://your-deployment.vercel.app/api/player/status`

## 注意事项

1. **Serverless 限制**: Vercel Functions 有 30 秒执行时间限制
2. **冷启动**: 第一次调用可能较慢，这是 serverless 的正常行为
3. **配置**: 使用默认配置，不支持命令行配置参数
4. **日志**: 可在 Vercel 仪表板查看函数日志

## 本地测试

```bash
# 安装依赖
bun install

# 本地开发
vercel dev
```