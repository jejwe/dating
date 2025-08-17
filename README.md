# Vite to Next.js Migration Plan

## 项目概述
将现有的Vite + React + TypeScript应用转换为Next.js全栈应用，采用**前后端分离架构**部署到Cloudflare Workers。

## 当前架构分析

### 前端 (Vite)
- **技术栈**: React 18.3.1, TypeScript, React Router 6.21.0, Tailwind CSS 3.4.1
- **构建工具**: Vite 5.4.2
- **路由**: 基于React Router的SPA路由系统
- **状态管理**: React Context (AppContext)
- **API服务**: 自定义ApiService类，调用workers后端

### 后端 (Workers)
- **技术栈**: H3框架, Cloudflare Workers
- **数据库**: Supabase/Neon
- **存储**: R2 (图片存储)
- **API**: RESTful API设计

## 转换目标

### 1. 架构转换
- ✅ **SPA → Next.js App Router**: 从单页应用转换为Next.js现代路由
- ✅ **Client-side → Full-stack**: 利用Next.js的SSR/SSG/Edge Runtime能力
- ✅ **React Router → Next.js Router**: 使用Next.js的文件系统路由
- ✅ **前后端分离**: 前端和后端独立部署，通过API通信

### 2. 部署目标
- ✅ **Cloudflare Workers**: 使用Workers全栈能力替代Vite构建
- ✅ **分离部署**: 前端和后端分别部署为独立Worker
- ✅ **Edge Computing**: 利用Cloudflare的全球边缘网络
- ✅ **保持现有Workers后端**: 后端代码和逻辑保持不变

## 详细转换计划

### 阶段1: 项目初始化
1. **创建Next.js项目**
   ```bash
   npx create-next-app@latest nextjs --typescript --tailwind --app
   ```

2. **安装OpenNext适配器**
   ```bash
   cd nextjs
   npm install @opennextjs/cloudflare
   npm install -D wrangler
   ```

3. **配置Cloudflare Workers**
   - 设置`nextjs/wrangler.toml` for 前端Worker
   - 配置环境变量和API URL
   - 设置构建命令: `npm run deploy`
   - 配置Static Assets绑定

### 阶段2: 代码迁移

#### 2.1 项目结构设计
**推荐的项目结构**:
```
project/
├── nextjs/                    # Next.js前端 (Workers部署)
│   ├── app/                  # 页面路由
│   │   ├── page.tsx          # WelcomeScreen
│   │   ├── login/
│   │   │   └── page.tsx      # LoginScreen
│   │   ├── signup/
│   │   │   └── page.tsx      # SignupScreen
│   │   ├── profile-setup/
│   │   │   └── page.tsx      # ProfileSetupScreen
│   │   ├── discover/
│   │   │   └── page.tsx      # DiscoveryScreen
│   │   ├── profile/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # ProfileViewScreen
│   │   ├── match/
│   │   │   └── page.tsx      # MatchScreen
│   │   ├── messages/
│   │   │   └── page.tsx      # MessagesScreen
│   │   ├── chat/
│   │   │   └── [id]/
│   │   │       └── page.tsx  # ChatScreen
│   │   ├── my-profile/
│   │   │   └── page.tsx      # MyProfileScreen
│   │   ├── my-likes/
│   │   │   └── page.tsx      # MyLikesScreen
│   │   ├── settings/
│   │   │   └── page.tsx      # SettingsScreen
│   │   ├── moments/
│   │   │   └── page.tsx      # MomentsScreen
│   │   ├── create-moment/
│   │   │   └── page.tsx      # CreateMomentScreen
│   │   ├── subscription/
│   │   │   └── page.tsx      # SubscriptionScreen
│   │   └── subscription/
│   │       └── confirm/
│   │           └── page.tsx  # SubscriptionConfirmScreen
│   ├── components/           # React组件 (从vite/src/components/迁移)
│   │   ├── Layout/
│   │   ├── Navigation/
│   │   ├── Discovery/
│   │   ├── Chat/
│   │   ├── Moments/
│   │   ├── Common/
│   │   └── Auth/
│   ├── lib/                 # 前端工具函数
│   │   ├── api.ts          # API调用封装
│   │   └── utils.ts        # 工具函数
│   ├── hooks/               # React Hooks (从vite/src/hooks/迁移)
│   ├── context/             # React Context (从vite/src/context/迁移)
│   ├── styles/              # 样式文件
│   ├── public/              # 静态资源
│   ├── next.config.mjs      # Next.js配置
│   ├── wrangler.toml       # Workers配置 (前端)
│   ├── open-next.config.ts # OpenNext配置
│   └── package.json
│
├── workers/                 # 现有后端 (保持独立)
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── middleware/     # 中间件
│   │   ├── database/       # 数据库连接
│   │   ├── utils/         # 后端工具
│   │   └── users/         # 用户相关
│   ├── wrangler.toml       # Workers配置 (后端)
│   └── package.json
│
└── shared/                 # 共享类型和常量 (可选)
    ├── types/
    └── constants.ts
```

#### 2.2 组件迁移策略
1. **公共组件** (`vite/src/components/` → `nextjs/components/`)
   - 直接迁移到 `nextjs/components/` 目录
   - 保持组件结构和逻辑不变
   - 适配Next.js的导入方式

2. **屏幕组件** (`vite/src/screens/` → `nextjs/app/*/page.tsx`)
   - 转换为页面组件 (`nextjs/app/*/page.tsx`)
   - 移除React Router相关的导航代码
   - 使用Next.js的`useRouter`进行导航
   - 添加`'use client'`指令给客户端组件

3. **Hooks迁移** (`vite/src/hooks/` → `nextjs/hooks/`)
   - 保持现有hooks逻辑
   - 适配Next.js的数据获取模式
   - 考虑使用`useSWR`或`React Query`进行数据管理

4. **Context迁移** (`vite/src/context/` → `nextjs/context/`)
   - 将`AppContext`转换为Next.js的Provider模式
   - 在`nextjs/app/layout.tsx`中配置全局Provider
   - 保持现有的状态管理逻辑

#### 2.3 API服务适配
1. **ApiService迁移** (`vite/src/services/api.ts` → `nextjs/lib/api.ts`)
   - 保持现有的API调用逻辑
   - 修改API基础URL为环境变量配置
   - 添加CORS错误处理

2. **环境变量配置**
   ```typescript
   // nextjs/wrangler.toml
   [env.production]
   vars = { API_BASE_URL = "https://dating-app-backend.your-subdomain.workers.dev" }
   
   [env.preview]
   vars = { API_BASE_URL = "https://dating-app-backend-preview.your-subdomain.workers.dev" }
   
   // nextjs/lib/api.ts
   const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8787';
   ```

#### 2.4 后端配置更新
1. **CORS配置** (`workers/src/middleware/cors.js` - 新增)
   ```javascript
   export function corsHeaders() {
     return {
       'Access-Control-Allow-Origin': '*', // 生产环境应该指定具体域名
       'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
     };
   }
   
   export function handleCors(request) {
     if (request.method === 'OPTIONS') {
       return new Response(null, { 
         status: 200,
         headers: corsHeaders()
       });
     }
     return null;
   }
   ```

2. **保持现有后端逻辑**
   - 所有API路由保持不变
   - 数据库连接保持不变
   - 文件上传逻辑保持不变

### 阶段3: 配置文件设置

#### 3.1 Next.js配置
1. **nextjs/next.config.mjs**
   ```javascript
   import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';
   
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // 保持现有配置
   };
   
   if (process.env.NODE_ENV === 'development') {
     await setupDevPlatform();
   }
   
   export default nextConfig;
   ```

2. **nextjs/open-next.config.ts**
   ```typescript
   import { defineCloudflareConfig } from "@opennextjs/cloudflare";
   
   export default defineCloudflareConfig();
   ```

3. **nextjs/wrangler.toml**
   ```toml
   name = "dating-app-frontend"
   compatibility_date = "2025-03-25"
   compatibility_flags = ["nodejs_compat"]
   
   [assets]
   directory = ".open-next/assets"
   binding = "ASSETS"
   
   main = ".open-next/worker.js"
   
   # 环境变量配置
   [env.production]
   vars = { API_BASE_URL = "https://dating-app-backend.your-subdomain.workers.dev" }
   
   [env.preview]
   vars = { API_BASE_URL = "https://dating-app-backend-preview.your-subdomain.workers.dev" }
   ```

#### 3.2 后端配置更新
1. **workers/wrangler.toml** (保持现有配置，添加CORS)
   ```toml
   name = "dating-app-backend"
   compatibility_date = "2024-09-23"
   compatibility_flags = ["nodejs_compat"]
   
   # 保持现有数据库、存储配置
   [[d1_databases]]
   binding = "DB"
   database_name = "dating-app"
   database_id = "your-database-id"
   
   [[r2_buckets]]
   binding = "PHOTOS"
   bucket_name = "dating-app-photos"
   ```

#### 3.3 Package.json脚本
1. **nextjs/package.json**
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
       "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
       "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
       "lint": "next lint"
     }
   }
   ```

2. **workers/package.json** (保持现有脚本)
   ```json
   {
     "scripts": {
       "dev": "npx wrangler dev",
       "deploy": "npx wrangler deploy",
       "build": "npx wrangler deploy --dry-run"
     }
   }
   ```

### 阶段4: 样式和资源迁移

#### 4.1 Tailwind CSS配置
1. **保持现有配置**
   - 迁移`vite/tailwind.config.js`到`nextjs/tailwind.config.js`
   - 保持现有的设计系统和颜色方案
   - 适配Next.js的CSS导入方式

2. **全局样式**
   - 迁移`vite/src/index.css`到`nextjs/app/globals.css`
   - 迁移`vite/src/styles/mobile.css`到`nextjs/styles/mobile.css`
   - 在`nextjs/app/layout.tsx`中导入全局样式

#### 4.2 静态资源
1. **图片和图标**
   - 迁移到`nextjs/public/`目录
   - 更新组件中的图片路径引用
   - 使用Next.js的Image组件优化

#### 4.3 布局组件
1. **nextjs/app/layout.tsx**
   ```typescript
   import './globals.css';
   import { AppProvider } from '@/context/AppContext';
   
   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="zh-CN">
         <body>
           <AppProvider>
             {children}
           </AppProvider>
         </body>
       </html>
     );
   }
   ```

### 阶段5: 部署和测试

#### 5.1 开发环境
1. **前端开发**
   ```bash
   cd nextjs
   npm run dev  # Next.js开发服务器
   ```

2. **后端开发** (保持现有)
   ```bash
   cd workers
   npm run dev  # Workers开发服务器
   ```

3. **预览环境**
   ```bash
   cd nextjs
   npm run preview  # 在Workers Runtime中预览
   ```

#### 5.2 部署流程
1. **独立部署**
   ```bash
   # 部署后端 (保持现有流程)
   cd workers
   npm run deploy
   
   # 部署前端 (新流程)
   cd ../nextjs
   npm run deploy
   ```

2. **CI/CD配置**
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   
   jobs:
     deploy-backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - name: Deploy Backend
           run: |
             cd workers
             npm install
             npm run deploy
   
     deploy-frontend:
       runs-on: ubuntu-latest
       needs: deploy-backend
       steps:
         - uses: actions/checkout@v4
         - name: Deploy Frontend
           run: |
             cd nextjs
             npm install
             npm run deploy
   ```

#### 5.3 测试验证
1. **功能测试**
   - 验证所有页面路由正常工作
   - 测试API调用与后端的集成
   - 验证用户认证流程
   - 测试文件上传功能

2. **性能测试**
   - 验证页面加载性能
   - 测试边缘缓存效果
   - 验证SSR/SSG性能优势

3. **兼容性测试**
   - 测试不同浏览器兼容性
   - 验证移动端适配
   - 测试离线功能

## 转换检查清单

### ✅ 项目结构
- [ ] 创建nextjs项目结构
- [ ] 迁移所有组件到nextjs正确目录
- [ ] 配置nextjs Tailwind CSS
- [ ] 设置nextjs环境变量
- [ ] 保持workers目录独立

### ✅ 路由系统
- [ ] 转换所有页面路由到Next.js App Router
- [ ] 实现动态路由 ([id])
- [ ] 配置layout.tsx全局布局
- [ ] 测试路由导航
- [ ] 添加'use client'指令给客户端组件

### ✅ 组件迁移
- [ ] 迁移所有公共组件 (components/)
- [ ] 转换屏幕组件为页面 (app/*/page.tsx)
- [ ] 适配组件导入方式
- [ ] 测试组件功能
- [ ] 迁移Hooks和Context

### ✅ 状态管理
- [ ] 迁移Context Provider到layout.tsx
- [ ] 适配认证状态管理
- [ ] 测试状态同步
- [ ] 验证数据流
- [ ] 保持localStorage token存储

### ✅ API集成
- [ ] 适配ApiService到Next.js环境
- [ ] 配置nextjs环境变量
- [ ] 添加workers后端CORS支持
- [ ] 测试API调用
- [ ] 验证错误处理

### ✅ 样式系统
- [ ] 迁移全局样式到globals.css
- [ ] 适配Tailwind配置
- [ ] 更新图片路径到public/
- [ ] 测试响应式设计
- [ ] 验证移动端适配

### ✅ 部署配置
- [ ] 配置nextjs wrangler.toml
- [ ] 配置open-next.config.ts
- [ ] 设置nextjs package.json脚本
- [ ] 配置workers CORS中间件
- [ ] 测试nextjs部署流程
- [ ] 测试workers部署流程

### ✅ 测试验证
- [ ] 前端功能测试
- [ ] 后端API测试
- [ ] 前后端集成测试
- [ ] 性能测试
- [ ] 部署环境测试

## 风险评估与缓解

### 主要风险
1. **API兼容性**: Next.js与现有Workers API的集成可能存在CORS问题
   - 缓解: 在Workers后端添加CORS中间件，测试所有API端点

2. **状态管理适配**: 现有Context可能不兼容Next.js的SSR环境
   - 缓解: 添加'use client'指令，保持客户端渲染模式

3. **环境配置**: 前后端分离部署的环境变量管理可能复杂
   - 缓解: 使用wrangler environments，统一环境变量管理

4. **构建复杂度**: OpenNext适配器可能增加构建复杂度
   - 缓解: 使用create-cloudflare CLI生成标准配置

### 迁移策略
1. **渐进式迁移**: 先迁移基础页面，再迁移复杂功能
2. **并行开发**: 保持Vite版本运行，逐步迁移功能
3. **充分测试**: 每个阶段完成后进行全面测试

## 成功标准
- ✅ 所有页面在nextjs中正常工作
- ✅ API调用与workers后端正常集成
- ✅ 在Cloudflare Workers上成功部署nextjs前端
- ✅ workers后端保持独立且功能正常
- ✅ 前后端分离架构稳定运行
- ✅ 性能不低于原Vite版本
- ✅ 所有功能测试通过

## 后续优化
1. **SSR/SSG**: 考虑将静态页面转换为SSG
2. **Edge Runtime**: 利用Next.js的Edge Runtime优化性能
3. **图片优化**: 使用Next.js Image组件 + Cloudflare Images
4. **缓存策略**: 利用Cloudflare Cache优化资源加载
5. **监控集成**: 集成性能监控工具
6. **API整合**: 评估是否需要将部分API迁移到Next.js API Routes

## 技术选型说明

### 为什么选择Workers + @opennextjs/cloudflare？
1. **完整功能支持**: 支持所有Next.js特性 (SSR/SSG/ISR/等)
2. **官方推荐**: Cloudflare官方推荐使用Workers而非Pages
3. **开发活跃**: Workers是Cloudflare的主要发展方向
4. **性能优越**: 支持Edge Runtime和更多优化
5. **架构灵活**: 前后端分离，便于扩展和维护

### 为什么保持前后端分离？
1. **降低风险**: 渐进式迁移，不会破坏现有功能
2. **团队协作**: 前后端团队可以独立工作
3. **独立扩展**: 前后端可以独立扩展和部署
4. **技术栈灵活**: 后端可以继续使用H3框架，前端使用Next.js
5. **维护成本**: 分离架构更容易维护和调试

### 为什么不选择其他方案？
- **Cloudflare Pages**: 功能受限，不支持SSR和API Routes
- **合并架构**: 代码复杂度高，维护困难，团队协作不便
- **Vercel**: 需要迁移到其他云服务商，增加成本和复杂度