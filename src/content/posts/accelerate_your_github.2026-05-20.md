---
published: 2026-05-20
category: GitHub
tag: [加速, GitHub]
title: GitHub 加速与代理服务使用指南
description: "本文讲述了 AeYunDian 提供的 GitHub 加速服务及其使用方法。"
---

[!WARNING]
此面向公众的为 GitHub 加速服务，不是 VPN，请注意区分！

在国内访问 GitHub 及其相关资源（如 raw、gist、各类 assets）时，经常遇到速度慢、甚至无法打开的问题。本文介绍一个基于 Cloudflare Worker 实现的代理服务，提供两种代理模式：**无需授权的 GitHub 专用加速** 和 **需要授权的通用代理**，帮助你稳定、快速地访问 GitHub 生态资源。

---

## 服务地址

代理服务由 `api.undz.cn` 提供，支持 HTTPS 访问。

---

## 一、GitHub 专用加速模式（无需授权）

该模式专为 GitHub 及其关联域名设计，**无需任何密钥**，直接通过特定路径前缀即可代理请求。

### 可用前缀

| 前缀       | 功能                                                         |
| ---------- | ------------------------------------------------------------ |
| `/gh/`     | 普通代理，直接返回原始内容（不重写页面）                     |
| `/gh_fix/` | 智能代理，自动重写 HTML 中的链接、资源路径，解决样式丢失问题 |

### 使用方式

1. 方法一： 将你要访问的 GitHub 原始 URL 前面添加 （下载文件时推荐）：
   https://api.undz.cn/gh/
   或者 （访问 GitHub 网页时推荐）
   https://api.undz.cn/gh_fix/

2. 方法二： 将你要访问的 GitHub 原始 URL 转换为以下格式：
   https://api.undz.cn/gh/[类型]/[剩余路径]
   其中 `[类型]` 支持以下简写（自动映射到真实的 GitHub 域名）：

| 简写           | 对应域名                                  | 说明                  |
| -------------- | ----------------------------------------- | --------------------- |
| `www`          | github.com                                | GitHub 主站           |
| `raw`          | raw.githubusercontent.com                 | 原始文件下载          |
| `gist`         | gist.github.com                           | Gist 代码片段         |
| `api`          | api.github.com                            | GitHub API            |
| `io`           | github.io                                 | GitHub Pages          |
| `camo`         | camo.githubusercontent.com                | 图片缓存              |
| `avatars`      | avatars.githubusercontent.com             | 用户头像              |
| `usercontent`  | user-content.githubusercontent.com        | 用户生成内容          |
| `assets`       | assets-cdn.github.com                     | 资源 CDN              |
| `ghs`          | github.global.ssl.fastly.net              | GitHub 全球加速节点   |
| `greasyfork`   | greasyfork.org                            | GreasyFork 脚本站     |
| `upgf`         | update.greasyfork.org                     | GreasyFork 更新源     |
| `dev`          | github.dev                                | GitHub Web 编辑器     |
| `githubassets` | github.githubassets.com                   | GitHub 静态资源       |
| `support`      | support-assets.githubassets.com           | GitHub 支持资源       |
| `edu`          | education.github.com                      | GitHub 教育           |
| `res`          | resources.github.com                      | GitHub 资源           |
| `upload`       | uploads.github.com                        | GitHub 上传服务       |
| `ap`           | archiveprogram.github.com                 | GitHub 归档计划       |
| `guc`          | githubusercontent.com                     | GitHub 用户内容泛域名 |
| `cloud`        | cloud.githubusercontent.com               | 云图片缓存            |
| `avatars0`     | avatars0.githubusercontent.com            | 头像 0 号节点         |
| `avatars1`     | avatars1.githubusercontent.com            | 头像 1 号节点         |
| `avatars2`     | avatars2.githubusercontent.com            | 头像 2 号节点         |
| `avatars3`     | avatars3.githubusercontent.com            | 头像 3 号节点         |
| `avatars4`     | avatars4.githubusercontent.com            | 头像 4 号节点         |
| `userimg`      | user-images.githubusercontent.com         | 用户上传图片          |
| `objects`      | objects.githubusercontent.com             | 对象存储              |
| `pui`          | private-user-images.githubusercontent.com | 私有用户图片          |
| `pages`        | pages.github.com                          | GitHub Pages 信息     |
| `app`          | githubapp.com                             | GitHub 应用域名       |

### 示例

1. **访问 GitHub 仓库首页**  
   原始地址：`https://github.com/octocat/Hello-World`  
   代理地址：`https://api.undz.cn/gh/www/octocat/Hello-World`

2. **下载 raw 文件**  
   原始地址：`https://raw.githubusercontent.com/octocat/Hello-World/master/README`  
   代理地址：`https://api.undz.cn/gh/raw/octocat/Hello-World/master/README`

3. **查看 Gist**  
   原始地址：`https://gist.github.com/username/abc123`  
   代理地址：`https://api.undz.cn/gh/gist/username/abc123`

4. **GitHub API 调用**  
   原始地址：`https://api.github.com/users/octocat`  
   代理地址：`https://api.undz.cn/gh/api/users/octocat`

> 💡 如果代理后页面出现样式错乱或图片缺失，请尝试使用 **`/gh_fix/`** 前缀，它会自动重写页面内的链接，修复相对路径和 CSP 限制。

---

## 二、通用代理模式

[!info]
此代理不面向公众开放

---

## 三、工作原理

代理服务基于 Cloudflare Workers 实现：

- **请求拦截**：根据路径前缀识别代理请求，提取目标 URL。
- **内容获取**：使用自定义 User-Agent 向上游发起请求，跟随重定向。
- **智能重写**（`*_fix` 模式）：对返回的 HTML 进行解析，重写所有 `script`、`link`、`img`、`a` 等标签的链接，使其再次通过代理，同时移除 `integrity` 属性以避免 SRI 校验失败，并删除 CSP 头防止浏览器拦截。
- **GitHub 专用优化**：内置 30+ 个 GitHub 相关域名的自动转换，支持短路径写法。

---

## 四、注意事项与合理使用提醒

代理服务为公共或半公共服务，请遵守以下准则：

1. **尊重版权与法律**  
   请勿利用代理访问或传播侵权内容、违反中国法律法规或 GitHub 服务条款的材料。

2. **禁止滥用**  
   不要使用代理进行大规模爬虫、压力测试、暴力破解、刷流量等行为，以免影响他人正常使用。

3. **密钥安全**  
   如需使用通用代理，密钥为个人凭证，请勿上传至公开代码仓库、聊天记录或截图中。密钥泄露可导致他人滥用您的授权。

4. **服务可用性**  
   代理服务由个人维护，不保证 100% 可用。如遇到响应缓慢或错误，可稍后重试或尝试切换 `/gh_fix/` 与 `/gh/` 模式。

5. **隐私说明**  
   代理服务会记录访问的 IP 地址和请求路径，用于排查问题和防止滥用。完整 URL 可能会经过服务端，请勿传递敏感信息（如包含 Token 的私有链接）。

6. **GitHub 专用模式无需授权**，但也请合理使用，避免对上游 GitHub 造成过量请求。

---

## 五、故障排除

| 现象                 | 可能原因                  | 解决办法                                            |
| -------------------- | ------------------------- | --------------------------------------------------- |
| 返回 403 Forbidden   | 访问通用代理但未授权      | 先完成 `/auth-proxy` 授权流程                       |
| 返回 400 Bad Request | 代理路径格式错误          | 检查是否漏掉协议（`http://` 或 `https://`）         |
| 页面样式丢失         | HTML 中的相对路径未被转换 | 改用 `*_fix` 模式（如 `/gh_fix/` 或 `/proxy_fix/`） |
| 授权成功后依然 403   | Cookie 未携带或已过期     | 清除浏览器缓存/重试授权，或重新获取密钥             |
| 返回 5xx 错误        | 上游服务或代理内部错误    | 稍后重试，或联系服务提供者                          |

---

## 六、写在最后

本代理服务旨在为开发者提供一个便捷的 GitHub 访问加速方案，适合在科研、学习、开源贡献等场景下使用。如果你觉得有用，可以分享给需要的朋友，但请一并转发本文的使用规范。

**快乐编码，从流畅访问 GitHub 开始！**
