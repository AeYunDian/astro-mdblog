---
description: "在搭建 undz.cn 的过程中，我需要确保网站符合 GDPR 及国内相关隐私法规的要求，尤其是在使用 Cookie 和第三方服务时。本文分享了 PrivacyMessaging.vue 组件的设计思路与实现细节，它提供了一个可配置的隐私同意横幅，帮助用户在阅读协议后自主选择 Cookie 偏好。"
published: 2026-06-27
title: 为 VuePress 站点添加隐私政策同意横幅
categories: VuePress
tags: [Vue, 隐私合规, GDPR, 组件设计]
---

## 效果预览

- **首次访问**：页面底部（或移动端贴底）显示隐私同意卡片，遮罩全屏。
- **协议阅读**：卡片内嵌《隐私政策》《Cookie 政策》《服务条款》的快速预览模态框，用户需分别点击“我已阅读并理解”才能启用同意复选框。
- **同意选项**：用户可以选择“接受全部（协议及所有 Cookie）”或“接受协议和仅必要 Cookie”。
- **状态持久化**：同意记录存入 `localStorage`，并附带版本号，方便未来政策更新时重新征求同意。
- **豁免路径**：在隐私政策、服务条款等页面自动隐藏横幅，避免用户陷入循环。
- **响应式适配**：在移动端以底部抽屉样式呈现，与原生 App 风格类似。

## 组件功能概述

`PrivacyMessaging` 是一个包含完整 UI 的功能组件，负责管理用户隐私同意的整个生命周期，包括：

- 检测当前路由是否为豁免路径（如隐私政策页本身），自动隐藏横幅。
- 从 `localStorage` 读取同意记录，根据版本号判断是否需要重新显示。
- 展示协议摘要模态框，强制用户逐一点击确认阅读，方可勾选同意复选框。
- 提供两种同意粒度：“全部 Cookie” 与 “仅必要 Cookie”。
- 将用户选择持久化，并触发后续的 Cookie 实际控制逻辑（可扩展）。
- 在路由变化时自动重新评估显示状态，确保行为一致。

该组件不依赖外部库，仅使用 Vue 核心功能和浏览器原生 API，易于集成到任何 Vue 3 项目中。

## 实现细节

### 1. 路由豁免与状态恢复

组件在 `mounted` 时检查当前路径是否属于豁免列表（如 `/privacy_policy/`），如果是则直接隐藏横幅（`consentGiven = true`），不读取任何存储。否则，从 `localStorage` 尝试读取 `cookieConsent`，若存在且版本号匹配，则标记为已同意。

```js
checkRouteAndSetConsent() {
  if (this.isExemptPath()) {
    this.consentGiven = true;
    return;
  }
  const stored = localStorage.getItem('cookieConsent');
  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.version === this.PrivacyVersion) {
        this.consentGiven = true;
        return;
      }
    } catch (e) { /* 忽略解析错误 */ }
  }
  this.consentGiven = false;
}
```

### 2. 协议阅读确认机制

为了满足“明确同意”的要求，我们设计了三个独立的阅读状态（`privacyPolicyRead`、`cookiePolicyRead`、`termsPolicyRead`），初始均为 `false`。只有当用户点击对应的“我已阅读并理解”按钮后，相应的状态才变为 `true`。这三个状态通过计算属性 `canEnableCheckbox` 联合控制复选框的可用性，从而保证用户确实浏览过协议摘要。

```js
computed: {
  canEnableCheckbox() {
    return this.privacyPolicyRead && this.cookiePolicyRead && this.termsPolicyRead;
  }
}
```

模态框内容使用简单的 HTML 字符串，并提供了指向完整政策页面的链接（在新窗口打开）。

### 3. 同意选项与存储结构

两个按钮分别调用 `acceptAll` 和 `acceptNecessaryOnly`，构造同意对象并写入 `localStorage`：

```js
const consentData = {
  type: "all", // 或 'necessary'
  preferences: { necessary: true, analytics: true, advertising: true },
  version: this.PrivacyVersion,
  timestamp: Date.now(),
};
localStorage.setItem("cookieConsent", JSON.stringify(consentData));
this.consentGiven = true;
```

这里预留了 `preferences` 字段，未来可以扩展更细粒度的 Cookie 分类控制。

### 4. 路由变化监听

使用 `vue-router` 的 `afterEach` 钩子，在每次路由跳转后重新执行 `checkRouteAndSetConsent`，确保从豁免路径返回正常页面时，横幅能正确显示。

```js
if (this.$router) {
  this.routerUnsubscribe = this.$router.afterEach(() => {
    this.checkRouteAndSetConsent();
  });
}
```

同时，在组件销毁前清理监听器，避免内存泄漏。

### 5. 响应式布局与动画

卡片采用固定定位 + `flex` 垂直居底，并通过 `@keyframes slideUp` 实现从底部滑入的动效。移动端媒体查询将卡片圆角调整为顶部圆角，并移除边距，达到沉浸式底栏效果。

```css
.privacy-consent-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  /* ... */
}
```

## 样式适配要点

- **CSS 变量**：使用 `var(--vp-c-bg)`、`var(--vp-c-text)` 等变量，自动适配 VitePress 或 vuepress-theme-hope 的亮色/暗色模式。
- **按钮交互**：主按钮采用主题强调色（`--vp-c-accent`），次要按钮使用灰色背景，符合常见设计规范。
- **警告信息**：在复选框未启用时，显示红色提示文字，引导用户阅读协议。
- **模态框**：独立于主卡片之上，`z-index` 更高，包含滚动内容和关闭按钮。

## 在主题中集成

该组件需要被注册为全局组件，以便在任意页面都能生效。在 `.vuepress/client.ts` 中通过 `rootComponents` 引入：

```ts
import PrivacyMessaging from "./components/PrivacyMessaging.vue";

export default defineClientConfig({
  rootComponents: [
    PrivacyMessaging,
    // 其他全局组件...
  ],
});
```

组件自身不依赖任何外部状态，开箱即用，但您可以根据需要调整豁免路径、版本号或文本内容。

## 总结

`PrivacyMessaging` 组件以极低的集成成本，为 VuePress 站点提供了符合隐私法规的同意管理界面。它通过确认阅读、版本化存储、路由感知等设计，确保了用户知情权和选择权。同时，其响应式布局和主题变量适配，使其能够无缝融入现有设计体系。如果您也在搭建需要合规 Cookie 管理的站点，希望本文能为您提供一些参考。

> **相关资源**
>
> - [GDPR 合规指南](https://gdpr-info.eu/)
> - [vuepress-theme-hope 官方文档](https://theme-hope.vuejs.press/)
> - [PrivacyMessaging.vue 在 GitHub 上的源码](https://github.com/AeYunDian/aeyundian.github.io/blob/main/src/.vuepress/components/PrivacyMessaging.vue)
