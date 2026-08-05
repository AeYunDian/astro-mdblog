---
description: "在搭建 undz.cn 的过程中，我希望博客首页能有一个沉浸式的Hero，并且导航栏在滚动时能够平滑过渡，同时在非首页时恢复正常的样式。本文将分享我实现这一效果的 TopNavBeautify 组件的设计思路与完整代码。"
published: 2026-06-13
title: 为 VuePress 主题添加动态导航栏美化
categories: VuePress
tags: [Vue, 主题定制, SCSS, 滚动效果]
---

# 为 VuePress 主题添加动态导航栏美化

## 效果预览

- **首页滚动到顶部**：导航栏背景透明，无阴影，无毛玻璃。
- **向下滚动离开 Hero**：导航栏自动添加背景模糊（毛玻璃），文字颜色变浅，并出现阴影。
- **非首页（文章页、关于页等）**：导航栏保持正常的主题样式，不受滚动影响。
- **侧边栏切换按钮**：同样跟随滚动状态改变颜色。

## 组件功能概述

`TopNavBeautify` 是一个无渲染组件（不产生实际 UI 元素），通过监听滚动事件和路由变化，动态为 `.theme-container` 添加/移除特定的 CSS 类，从而触发导航栏的样式变化。它的主要作用包括：

- 检测当前页面是否为博客首页（是否存在 `.vp-blog-hero` 元素）。
- 监听滚动位置，当滚动距离 `< 60px` 时添加 `ayund-scroll-top` 类。
- 在首页时，根据滚动距离是否小于 Hero 高度减去 30px，添加 `ayund-scroll-blog-hero-inner` 类。
- 监听路由变化，离开首页时移除首页专属的样式类。
- 为侧边栏切换按钮绑定事件，确保每次打开/关闭侧边栏后重新检测滚动状态。

## 实现细节

### 1. 检测博客 Hero

```ts
const blogHeroElms = document.getElementsByClassName("vp-blog-hero");
const hasHero = blogHeroElms.length > 0;
if (hasHero) {
  themeElm.classList.add("ayund-blog-hero");
} else {
  themeElm.classList.remove("ayund-blog-hero");
}
```

`vuepress-theme-hope` 的主题中，博客首页会自动生成 `vp-blog-hero` 容器。我们通过它的存在来判断当前页面是否为博客首页。

### 2. 滚动监听与类切换

```ts
const scrollTop = document.documentElement.scrollTop;
if (scrollTop < 60) {
  themeElm.classList.add("ayund-scroll-top");
} else {
  themeElm.classList.remove("ayund-scroll-top");
}
```

滚动距离小于 60px 时，我们认为导航栏位于“顶部透明区域”，此时移除阴影和背景。这个阈值可以根据您的页面布局微调。

对于首页 Hero，我们还需要一个更精细的控制：当滚动距离小于 Hero 高度减 30px 时，导航栏文字使用亮色（适合深色 Hero 背景）；超过该距离后，导航栏恢复默认文字颜色。

```ts
if (scrollTop < blogHeroElm.clientHeight - 30) {
  themeElm.classList.add("ayund-scroll-blog-hero-inner");
} else {
  themeElm.classList.remove("ayund-scroll-blog-hero-inner");
}
```

### 3. 路由变化后

使用 `vue-router` 的 `afterEach` 钩子，在每次路由跳转后重新执行样式检测。由于 DOM 更新可能有延迟，使用 `nextTick` 加 `setTimeout` 等待 50ms。

```ts
router.afterEach(() => {
  nextTick(() => {
    setTimeout(() => {
      CheckScrollTopClass();
    }, 50);
  });
});
```

另外，`checkRootPath` 函数会在离开首页时强制移除 `ayund-scroll-blog-hero-inner` 类，避免样式残留。

### 4. 侧边栏切换的适配

当用户点击移动端的侧边栏切换按钮时，页面布局会变化，滚动位置可能不变，但我们需要重新检测是否仍满足“滚动距离小于 60px”的条件。因此，我们为 `.vp-toggle-sidebar-button` 绑定了 `click` 事件。

```ts
toggleSidebarElm.removeEventListener("click", CheckSidebarOpen);
toggleSidebarElm.addEventListener("click", CheckSidebarOpen);
```

这里先移除再添加是为了防止重复绑定。

## 样式适配要点

在 SCSS 中，我们定义了几个关键的样式规则：

- 当同时存在 `ayund-scroll-top` 和 `ayund-blog-hero` 时，导航栏 `box-shadow: none`。
- 首页时，导航栏背景默认透明（`background: transparent`）。
- 在 `ayund-scroll-blog-hero-inner` 状态下，导航栏内的链接、图标、按钮颜色都改为浅色（`#eee`），并添加文字阴影，以适应深色 Hero。
- 暗色模式（`[data-theme='dark']`）下，我们隐藏了下拉箭头（`.arrow`），保持界面整洁。

## 在主题中集成

该组件需要被注册为全局组件。在 `.vuepress/client.ts` 或 `.vuepress/config.ts` 中通过 `rootComponents` 引入：

```ts
import TopNavBeautify from "./components/TopNavBeautify.vue";

export default defineClientConfig({
  rootComponents: [
    TopNavBeautify,
    // 其他全局组件...
  ],
});
```

组件的 `<template>` 中只包含一个隐藏的占位元素，不会影响页面布局。

## 总结

`TopNavBeautify` 组件，以极低的成本实现了导航栏的动态美化，提升了博客首页的视觉体验。这种“无渲染组件 + CSS 类切换”的模式非常适合对第三方主题进行轻量级定制，而无需 fork 整个主题。如果您也在使用 VuePress，希望这篇文章能给您带来一些用途。

> **相关资源**
>
> - [vuepress-theme-hope 官方文档](https://theme-hope.vuejs.press/)
> - [TopNavBeautify.vue 在 GitHub 上的源码](https://github.com/AeYunDian/aeyundian.github.io/blob/main/src/.vuepress/components/TopNavBeautify.vue)
