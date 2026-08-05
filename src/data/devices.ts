// 设备数据配置文件

export interface Device {
  name: string;
  image: string;
  specs: string;
  description: string;
  link: string;
}

// 设备类别类型，支持品牌和自定义类别
export type DeviceCategory = Record<string, Device[]> & {
  自定义?: Device[];
};

export const devicesData: DeviceCategory = {
  移动端: [
    {
      name: "VIVO X21A",
      image: "/images/device/vivox21a.webp",
      specs: "白色 /  6GB + 128GB",
      description: "",
      link: "https://www.jd.com/jxinfo/5a65e52c08b5836d.html",
    },
    {
      name: "Readboy C70Pro",
      image: "https://static.readboy.com/web/products/C70/pc/10.jpg",
      specs: "8GB + 256GB",
      description: "性价比超低，建议买同价小米平板，同价格，高性能",
      link: "https://www.readboy.com/product/c70pro",
    },
  ],
};
