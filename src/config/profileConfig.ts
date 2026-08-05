import type { ProfileConfig } from "../types/config";

// 个人资料配置
export const profileConfig: ProfileConfig = {
  avatar: "assets/images/avatar.webp", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
  name: "AeYunDian",
  bio: "Do one thing and do it well",
  typewriter: {
    enable: false, // 启用个人简介打字机效果
    speed: 80, // 打字速度（毫秒）
  },
  links: [
    {
      name: "Bilibili",
      icon: "fa7-brands:bilibili",
      url: "https://space.bilibili.com/3494370328185235",
    },
    {
      name: "GitHub",
      icon: "fa7-brands:github",
      url: "https://github.com/AeYunDian/",
    },
    {
      name: "FoxMail",
      icon: "ic:mail",
      url: "mailto:aeyundian@foxmail.com",
    },
    {
      name: "QQ",
      icon: "fa7-brands:qq",
      url: "https://api.undz.cn/addqq?uid=2768223712",
    },
    {
      name: "Gmail",
      icon: "mdi:gmail",
      url: "mailto:zhanghaoyu19281@gmail.com",
    },
  ],
};
