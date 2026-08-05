import type { FullscreenWallpaperConfig } from "../types/config";

export const fullscreenWallpaperConfig: FullscreenWallpaperConfig = {
  enable: true,
  src: {
    desktop: [
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_1",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_2",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_3",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_4",
    ],
    mobile: [
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_1",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_2",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_3",
      "https://uapis.cn/api/v1/image/bing-daily?random=true&resolution=4k&format=redirect&_4",
    ],
  },
  position: "center",
  carousel: {
    enable: true,
    interval: 10,
  },
  zIndex: -1,
  opacity: 0.8,
  blur: 1,
  switchable: true,
  overlay: {
    opacity: 0.8, // 壁纸不透明度，0-1
    blur: 1.5, // 背景模糊半径（px）
    cardOpacity: 0.8, // 卡片不透明度，0-1
    switchable: {
      opacity: true,
      blur: true,
      cardOpacity: true,
    },
  },
  fullscreen: {
    switchable: {
      opacity: true,
      blur: true,
    },
  },
};
