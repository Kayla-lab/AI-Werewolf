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

3. **在 player 目录部署**
   ```bash
   cd packages/player
   vercel
   ```

4. **配置环境变量**
   在 Vercel 仪表板中设置以下环境变量：
   - `OPENAI_API_KEY`: 你的 OpenAI API 密钥 (必需)
   - `LANGFUSE_SECRET_KEY`: Langfuse 密钥 (可选)
   - `LANGFUSE_PUBLIC_KEY`: Langfuse 公钥 (可选)
   - `LANGFUSE_BASEURL`: Langfuse 实例 URL (可选)
   - `NODE_ENV`: production

## 项目结构

```
packages/player/
├── api/
│   └── index.ts          # Vercel serverless 函数入口
├── src/
│   ├── types/            # 复制的类型定义
│   ├── lib/              # 复制的工具库
│   └── ...               # 其他源码
├── vercel.json           # Vercel 配置
├── package.json          # Bun 项目配置
└── bun.lockb            # Bun 锁定文件
```

## API 端点

部署后，API 端点：
- `https://your-deployment.vercel.app/api/player/start-game`
- `https://your-deployment.vercel.app/api/player/speak`
- `https://your-deployment.vercel.app/api/player/vote`
- `https://your-deployment.vercel.app/api/player/use-ability`
- `https://your-deployment.vercel.app/api/player/last-words`
- `https://your-deployment.vercel.app/api/player/status`

## 技术特点

1. **Bun 项目**: 使用 Bun 作为包管理器和运行时
2. **独立部署**: 已内嵌所有依赖，不需要 monorepo 结构
3. **TypeScript**: 完整的类型支持
4. **Serverless**: 转换为 Vercel Functions

## 注意事项

1. **执行时间**: Functions 最多 30 秒执行时间
2. **冷启动**: 第一次调用会有延迟
3. **配置**: 使用默认配置，不支持命令行参数
4. **日志**: 在 Vercel 仪表板查看运行日志

## 本地开发

```bash
# 安装依赖
bun install

# 本地构建测试
bun run build

# 本地 Vercel 开发
vercel dev
```

## 故障排除

如果部署失败：
1. 检查 `bun.lockb` 文件存在
2. 确认 `vercel.json` 配置正确
3. 验证环境变量设置
4. 查看 Vercel 构建日志