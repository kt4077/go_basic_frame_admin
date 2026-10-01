# 管理端源码插件目录

插件页面统一放在：

```text
src/plugins/{plugin_id}/views/{view_path}/index.vue
```

数据库菜单路径统一使用：

```text
/plugin/{plugin_id}/{view_path}
```

例如菜单 `/plugin/news/article` 对应：

```text
src/plugins/news/views/article/index.vue
```

插件内部可以继续按现有规范创建 `api`、`types`、`enums`、`components` 和 `views`，必须复用统一请求封装、权限指令、主题变量、日期格式化和上传组件。

菜单和动态业务图标统一使用 `AppIcon`。历史 Element Plus 名称（如 `Setting`）保持兼容；新增外部图标使用 `iconpark:Home` 格式，图标来源为项目本地依赖的 IconPark，不允许运行时加载远程 SVG。插件需要自带图标时，可增加 `src/plugins/{plugin_id}/icons.ts`：

```ts
import type { Component } from 'vue'
import ArticleIcon from './assets/article-icon.vue'

export default {
  article: ArticleIcon,
} satisfies Record<string, Component>
```

对应菜单图标填写 `plugin:{plugin_id}:article`。插件图标必须是经过审查的本地 Vue/SVG 组件，不得把后端返回的 SVG 字符串直接插入页面。

插件是否展示由后端启用状态和菜单权限决定。新增插件页面后需要重新构建管理端，第一阶段不支持运行时加载远程 JavaScript。
