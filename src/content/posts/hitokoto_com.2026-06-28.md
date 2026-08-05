---
published: 2026-06-28
title: 为 VuePress 博客集成一言（Hitokoto）API
categories: VuePress
tags: [Vue, 组件设计, API 集成, 交互优化]
description: "在搭建 `undz.cn` 的过程中，我希望博客首页的 Hero 区域能有一些动态的人文气息，而不只是一句固定的标语。于是我在博客首页集成了**一言（Hitokoto）API**，让每次刷新页面或点击时，都能随机展示一句来自不同作品的名言。本文将分享我实现这一效果的 `Hitokoto.vue` 组件设计思路与完整代码。"
---

## 效果预览

- **首次加载**：组件从 `v1.hitokoto.cn` 获取随机一言，展示在博客 Hero 区域。
- **内容展示**：以「『  一言内容  』」的格式居中显示，下方右对齐显示出处（作者 + 来源作品）。
- **点击刷新**：点击任意文本区域，组件会重新获取新的一言，并伴随加载状态。
- **优雅降级**：若 API 请求失败或返回异常，自动切换为预设的网站标语（Tagline），保证页面内容不空缺。
- **加载状态**：数据加载过程中，显示友好的 "Please wait a moment..." 提示，避免界面空白。

## 组件功能概述

`Hitokoto.vue` 是一个轻量的 Vue 组件，负责从一言公共 API 获取名言数据并在博客首页展示。它的主要职责包括：

- 组件挂载时自动请求一言 API 并渲染内容。
- 提供点击刷新功能，用户点击任意文本即可触发新的请求。
- 管理加载状态（`loading`）和备用展示（`showTagline`），确保任何情况下页面都有内容可看。
- 对 API 响应进行校验，仅当返回数据包含 `hitokoto` 字段时才更新视图，否则优雅降级。

## 实现细节

### 1. API 请求与缓存控制

组件使用 `fetch` 发送 GET 请求，并通过添加时间戳参数 `_t=${Date.now()}` 来防止浏览器缓存，确保每次请求都能获取到最新的一言数据。

```ts
const API_URL = "https://v1.hitokoto.cn/?encode=json";

async function refresh() {
  loading.value = true;
  const response = await fetch(API_URL + `&_t=${Date.now()}`);
  const data = await response.json();
  // ...
}
```

一言官方 API 默认返回 JSON 格式，包含 `hitokoto`（内容）、`from`（来源）、`from_who`（作者）等字段，非常适合直接渲染。

### 2. 状态管理与错误处理

组件维护了三个核心响应式状态：

- `loading`：是否处于加载中，用于显示加载提示。
- `showTagline`：API 请求失败时，是否显示备用标语。
- `event`：成功获取到的一言数据对象。

在 `refresh` 函数中，使用 `try...catch...finally` 结构统一处理：

```ts
try {
  const data = await response.json();
  if (data.hitokoto != null) {
    event.value = data;
  } else {
    showTagline.value = true;
    console.error("Hitokoto:", data.msg || "Unknown error");
  }
} catch (e) {
  showTagline.value = true;
  console.error("Hitokoto:", e.message || e);
} finally {
  loading.value = false;
}
```

这种处理方式确保了：

- 请求成功且数据合法 → 展示一言。
- 请求失败或数据异常 → 展示备用标语，不影响用户体验。
- 无论成功与否，加载状态都会被正确关闭。

### 3. 模板中的条件渲染

组件模板根据状态展示不同的内容：

```vue
<template>
  <!-- 加载中 -->
  <div v-if="loading" class="hitokoto-loading">Please wait a moment...</div>

  <!-- API 失败，展示备用标语 -->
  <p
    v-else-if="showTagline"
    class="vp-blog-hero-description"
    @click="refresh()"
  >
    Do one thing and do it well
  </p>

  <!-- 正常展示一言 -->
  <div v-else>
    <p class="vp-blog-hero-description" @click="refresh()">
      『&nbsp;{{ event.hitokoto }}&nbsp;』
    </p>
    <p style="text-align: end; color: #fffc;" @click="refresh()">
      ——&nbsp;{{ event.from_who }}&nbsp;「&nbsp;{{ event.from }}&nbsp;」
    </p>
  </div>
</template>
```

三个分支清晰对应三种状态，每个可点击区域都绑定了 `@click="refresh()"`，让用户可以随时刷新内容。点击交互不仅提升了趣味性，也让用户对内容有一定掌控感。

### 4. 样式与主题适配

组件样式直接复用了 `vuepress-theme-hope` 主题提供的 `.vp-blog-hero-description` 类，确保字体、大小、颜色与 Hero 区域的其他文字保持一致。同时，通过 `text-align: end` 让出处右对齐，营造出“名言 + 署名”的文艺感。

此外，`cursor: pointer` 的添加让用户直观感知到可点击交互，提升了可用性。

## 在主题中集成

将该组件注册为全局组件后，在博客首页的 Hero 区域使用即可。在 `.vuepress/client.ts` 中：

```ts
import Hitokoto from "./components/Hitokoto.vue";

export default defineClientConfig({
  rootComponents: [
    Hitokoto,
    // 其他全局组件...
  ],
});
```

在 `Blog` 布局中，通过插槽将其放置在 Hero 信息区域：

```vue
<template #heroInfo>
  <div class="vp-blog-hero-info">
    <h1 class="vp-blog-hero-title">undz</h1>
    <Hitokoto />
  </div>
</template>
```

## 总结

一言 API 为静态博客注入了动态的生命力，而 `Hitokoto.vue` 组件以极简的代码实现了“加载-展示-刷新-容错”的完整闭环。整个组件不足 50 行核心逻辑，却兼顾了交互反馈、异常处理和视觉一致性，充分体现了“小而美”的设计理念。

如果你也在搭建个人站点，不妨用一言 API 为自己的博客添一抹人文色彩 —— 有时候，一句恰到好处的话，比任何炫酷的动效都更能打动人心。

> **相关资源**
>
> - [一言 API 官方文档](https://hitokoto.cn/api)
> - [vuepress-theme-hope 官方文档](https://theme-hope.vuejs.press/)
> - [Hitokoto.vue 在 GitHub 上的源码](https://github.com/AeYunDian/aeyundian.github.io/blob/main/src/.vuepress/components/Hitokoto.vue)
