# 退休计划网页 - 项目说明

## 项目简介
退休计划网页是一个全栈应用，将 `1000-DAY RETIREMENT PLAN.xlsx` 网页化，支持在线查看和编辑，并集成 AI 助理（DeepSeek）。

## 功能特性
- ✅ 密码保护（简单密码验证）
- ✅ 实时读取金山文档 Excel 数据
- ✅ 在线编辑单元格，实时同步回 Excel
- ✅ AI 助理（DeepSeek API，流式输出）
- ✅ 响应式设计（Tailwind CSS + shadcn/ui）
- ✅ 侧边栏导航（体重板块、网文板块、投资板块、AI 助理）

## 技术栈
- **前端**: Next.js 16 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS 4 + shadcn/ui
- **后端**: Next.js API Routes
- **AI**: DeepSeek API
- **数据源**: 金山文档 ksheet API

## 项目结构
```
retirement-plan-web/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai/chat/route.ts      # AI 聊天 API
│   │   │   ├── auth/login/route.ts   # 登录 API
│   │   │   ├── auth/logout/route.ts  # 登出 API
│   │   │   ├── kdocs/read/route.ts  # 读取 Excel API
│   │   │   └── kdocs/write/route.ts # 写入 Excel API
│   │   ├── ai/page.tsx                # AI 助理页面
│   │   ├── login/page.tsx            # 登录页面
│   │   ├── weight/page.tsx           # 体重板块页面
│   │   ├── layout.tsx               # 全局布局
│   │   └── page.tsx                 # 首页（重定向到 /weight）
│   ├── components/
│   │   └── Sidebar.tsx             # 侧边栏导航
│   ├── lib/
│   │   ├── ai.ts                    # DeepSeek API 封装
│   │   ├── kdocs.ts                 # 金山文档 API 封装
│   │   └── utils.ts                 # 工具函数
│   └── app/globals.css             # 全局样式
├── middleare.ts                      # 密码保护中间件
├── .env.local                       # 环境变量（不提交到 Git）
└── package.json
```

## 环境变量
在 `.env.local` 中配置：
```
# 金山文档 API
KDOCS_ACCESS_TOKEN=your_kdocs_access_token_here
KDOCS_FILE_TOKEN=nUsmfSLW8xMKijLBXysz1xY2cS12ACWku

# DeepSeek AI API
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# 网站访问密码
SITE_PASSWORD=your_password_here
```

## 获取凭证

### 1. 金山文档 access_token
1. 登录金山文档网页版
2. 打开浏览器开发者工具（F12）→ Network 标签
3. 随便点击一个文档，查看请求头中的 `Authorization` 或 `access_token`
4. 复制 token，放在 `KDOCS_ACCESS_TOKEN` 环境变量中

### 2. DeepSeek API Key
1. 注册 DeepSeek 开放平台：https://platform.deepseek.com/
2. 创建 API Key
3. 复制 Key，放在 `DEEPSEEK_API_KEY` 环境变量中

### 3. 网站访问密码
设置一个简单密码，放在 `SITE_PASSWORD` 环境变量中

## 本地开发
```bash
cd /Users/zhaoyang/WorkBuddy/retirement-plan-web
npm run dev
```
访问 <http://localhost:3000>

## 构建
```bash
cd /Users/zhaoyang/WorkBuddy/retirement-plan-web
npm run build
```

## 部署到 Vercel
1. 推送代码到 GitHub
2. 登录 Vercel：https://vercel.com/
3. 导入 GitHub 项目
4. 配置环境变量（`DEEPSEEK_API_KEY`, `KDOCS_ACCESS_TOKEN`, `KDOCS_FILE_TOKEN`, `SITE_PASSWORD`）
5. 部署，获取公网地址（`.vercel.app` 域名）

## 待完善功能
- [ ] 网文板块页面（/writing）
- [ ] 投资板块页面（/investment）
- [ ] 更美观的 AI 聊天界面
- [ ] 数据可视化（图表）
- [ ] 移动端适配优化

## 已知问题
- 金山文档 API 的 `ksheet` 接口是 **beta 版本**，可能不稳定
- `access_token` 过期后需要手动更新
- 编辑功能目前只支持单个单元格编辑，不支持批量编辑

## 备用方案
如果金山文档 API 不稳定，可以：
1. 定期下载 Excel 到本地（`/public/data.xlsx`）
2. 网站读取本地文件（使用 `xlsx` 库解析）
3. 编辑功能改为修改本地文件，然后手动上传回金山文档
