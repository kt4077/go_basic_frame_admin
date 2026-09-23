# Go Backend Frame · Admin Client

基于 Vue 3、TypeScript、Vite 和 Element Plus 的后台管理端。前端菜单和页面路由由后端权限菜单动态生成，支持接口级按钮权限、明暗主题、标签页、操作日志、多渠道配置和平台品牌配置。

> 本项目与 `server_api` 管理端服务配套使用，当前仍在持续完善中。

配套仓库：

- 管理端：[go_basic_frame_admin](https://gitee.com/open-source-project-open/go_basic_frame_admin)
- 接口端：[go_basic_frame_api](https://gitee.com/open-source-project-open/go_basic_frame_api)

## 特性

- Vue 3 Composition API + TypeScript。
- 后端菜单驱动的动态路由和多级导航。
- 页面访问权限与按钮接口权限协同控制。
- JWT 登录、登录失效处理和个人资料维护。
- 明暗主题、全屏、水印、标签页和响应式布局。
- 系统名称及 Logo 可通过平台配置动态更新。
- 统一 Axios 请求封装和业务错误提示。
- 文件上传统一返回相对路径，业务保存时不持久化访问域名。
- 所有日期时间统一显示到秒，不展示毫秒。
- 纯 ES6+ 写法，函数统一使用箭头函数。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3.5 |
| 语言 | TypeScript 5.6 |
| 构建 | Vite 6 |
| UI | Element Plus |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 请求 | Axios |
| 图表 | ECharts |
| 包管理 | pnpm（推荐） |

## 项目结构

```text
admin_client/
├── src/
│   ├── api/                 # 按业务模块封装后端请求
│   ├── components/          # 通用组件
│   ├── directives/          # 权限、水印等指令
│   ├── enums/               # 前端业务枚举
│   ├── layout/              # 顶栏、菜单、标签栏和内容布局
│   ├── router/              # 静态路由和动态路由注册
│   ├── store/               # Pinia 状态
│   ├── styles/              # 全局主题和 UI 规范
│   ├── types/               # 请求与响应类型
│   ├── utils/               # 认证、日期、图表等工具
│   └── views/               # 页面模块
├── .env.development        # 开发环境配置
├── .env.production         # 生产环境配置
├── .env.example            # 环境变量示例
├── vite.config.ts
└── package.json
```

## 环境要求

- Node.js 20+
- pnpm 9+（推荐使用项目锁文件对应版本）
- 已启动的 `server_api service admin`

## 快速开始

### 1. 安装依赖

```bash
git clone https://gitee.com/open-source-project-open/go_basic_frame_admin.git
cd go_basic_frame_admin
pnpm install
```

项目同时存在 npm 锁文件，但协作开发时建议统一使用 pnpm，避免不同包管理器造成依赖树漂移。

### 2. 配置后端地址

开发环境读取 `.env.development`：

```dotenv
VITE_ADMIN_API_BASE_URL=http://127.0.0.1:8001
```

生产环境读取 `.env.production`，默认使用当前站点域名：

```dotenv
VITE_ADMIN_API_BASE_URL=/
```

也可以在 CI/CD 构建环境中覆盖该变量。变量必须以 `VITE_` 开头，修改后需要重新启动开发服务或重新构建。

### 3. 启动开发服务

```bash
pnpm dev
```

默认访问地址：<http://localhost:5173>

Vite 不再代理 `/admin` 或 `/api`，所有管理端请求均由 `VITE_ADMIN_API_BASE_URL` 决定。跨域部署时需要后端正确配置 CORS。

### 4. 构建与预览

```bash
pnpm build
pnpm preview
```

构建产物输出到 `dist/`。

## 登录与权限

登录成功后，前端会并发加载：

- 当前管理员信息；
- 当前角色菜单树；
- 当前角色接口权限。

后端菜单树决定动态路由和左侧导航，菜单路径按照以下约定解析页面：

```text
/system/user
  → src/views/system/user/index.vue
  → src/views/system/user.vue
  → 404 页面
```

按钮权限使用请求方法和接口路径：

```vue
<el-button v-perm="'POST:/admin/user/add'">新增</el-button>
```

前端权限只负责界面展示，真正的安全边界仍由后端 `Permission` 中间件保证。

## 请求约定

所有请求通过 `src/api/http.ts`：

- `baseURL` 来自 `VITE_ADMIN_API_BASE_URL`；
- 自动携带 `Authorization: Bearer <token>`；
- 统一解析后端 `{ code, msg, data }`；
- HTTP 或业务码 `401` 时清除登录态并跳转登录页；
- 并发错误提示会在短时间内去重。

新增接口时应在 `src/api/<module>.ts` 中封装，并在 `src/types/<module>.ts` 中定义请求和响应类型。

## 页面与组件规范

- 页面保持与现有设计系统一致，优先使用 `src/styles/index.css` 中的颜色和间距变量。
- 页面主体优先使用 `.page-card`、`.toolbar`、`.table-operations` 等公共样式。
- 明暗主题必须同时可用，禁止只针对白色背景硬编码颜色。
- 页面应支持常用桌面宽度，并为窄屏提供合理降级。
- `param` 和响应字段在 TypeScript 中明确建模，避免使用 `any`。
- 枚举集中放在 `src/enums`，值与后端保持一致并从 `1` 开始。
- 日期时间统一通过 `src/utils/datetime.ts` 格式化到秒。
- 文件上传使用通用上传组件和接口，提交业务数据时使用相对路径。
- 新页面路由由数据库菜单驱动，不要重复写入静态业务路由。

## 新增页面

以 `/config/example` 为例：

1. 新建 `src/views/config/example/index.vue`。
2. 在 `src/api` 和 `src/types` 中增加对应模块文件。
3. 在后端 `sys_menu` 增加菜单页面、查询权限和操作按钮权限。
4. 确保菜单 `path` 为 `/config/example`。
5. 将菜单权限分配给角色，重新登录或刷新权限数据。

## 开发检查

```bash
# TypeScript 与 Vue 类型检查
pnpm exec vue-tsc --noEmit

# 生产构建
pnpm build
```

提交前还应确认：

- 页面在亮色和暗色主题下显示正常；
- 无权限角色看不到对应按钮且后端接口返回 403；
- 列表加载、空状态、错误状态和重复提交处理正确；
- 新增字段与后端请求、响应结构保持一致；
- 没有提交 `.env.local`、构建产物或真实密钥。

## 部署

`pnpm build` 生成静态文件，可部署到 Nginx、Caddy 或对象存储静态站点。

Vue Router 使用 History 模式，Web 服务器必须将未知前端路由回退到 `index.html`。Nginx 示例：

```nginx
server {
    listen 80;
    server_name admin.example.com;
    root /var/www/admin_client/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

如果前后端不同域，请配置 HTTPS、CORS 和正确的 `VITE_ADMIN_API_BASE_URL`。不要在前端环境变量中存放任何密钥，因为构建后的变量对浏览器用户可见。

## 参与贡献

1. Fork 仓库并创建功能分支。
2. 遵循现有 UI、目录和 ES6+ 代码风格。
3. 提交前完成类型检查和生产构建。
4. Pull Request 中附上功能说明、关联接口和必要的页面截图。

安全漏洞请通过维护者提供的私密渠道报告，不要直接公开披露。

## 微信交流

如需交流项目使用、功能建议或参与贡献，可以扫描下方二维码：

<p align="left">
  <img src="./images/wechat.png" width="280" height="350" alt="微信交流二维码" />
</p>

## License

本项目基于 [Apache License 2.0](LICENSE) 开源。
