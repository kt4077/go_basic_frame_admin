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

插件是否展示由后端启用状态和菜单权限决定。新增插件页面后需要重新构建管理端，第一阶段不支持运行时加载远程 JavaScript。
