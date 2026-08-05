---
published: 2026-03-10
category: Unity
title: Unity POST 网络请求实现
tag: [Unity, 笔记]
---

#

## 前言

此文章只是 POST 请求，没有 GET、DELETE、PULL 等其它类型
为什么一开始是这个呢？因为这是我遇到的第一个问题

## 教程

代码使用系统的 Http 库
`using System.Net.Http;`

### 1.新建文件

在 Unity 项目内新建一个名为`GameApiClient.cs`的 C#代码文件。

### 2.输入以下内容

```cs
using System;
using System.Collections;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;


public class GameApiClient : MonoBehaviour
{
    public static GameApiClient Instance { get; private set; }
    private  HttpClient Client  = new HttpClient();
    private  string Domain = "https://api.io.hb.cn/api/";
    private  HttpResponseMessage response;
    void Awake()
    {

        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            Debug.Log("GameApiClient创建成功！");
        }
        else
        {
            Destroy(gameObject);
            Debug.Log("已存在GameApiClient，销毁重复的");
        }
    }

    public  async Task<HttpResponseMessage>  PostNetData(string path, string json)
    {

        var content = new StringContent(json, Encoding.UTF8, "application/json");
        Client.Timeout = TimeSpan.FromSeconds(5);
        response = await Client.PostAsync(Domain + path, content);

        return response;
    }
}

```

### 3.加载

在游戏第一个场景创建一个空游戏对象，绑定这个代码文件，启动游戏，如果游戏的日志有一条`GameApiClient创建成功！`，则代表以上步骤你都完成了

### 4.调用

一个应用应该写一个类来处理网络请求，在其它类中处理返回
要想在其他代码中发送 POST 请求，只需调用 `GameApiClient.Instance.PostNetData(string path, string json)`
::: warning 警告
网络请求是异步的，所以需要使用`await`来调用
在`GameApiClient.cs`中写了 API 的地址，这里是`https://api.io.hb.cn/api/`，你需要替换为自己服务器的地址。
:::

### 5.处理

该函数的返回格式是`HttpResponseMessage`，所以需要定义一个`HttpResponseMessage`类型的变量

```cs
using Newtonsoft.Json;
private string Path_BagGet = "/v1/bag/get";
public async Task<int> GetBagData()
{
    var data = new { uuid, token };
    string json = JsonConvert.SerializeObject(data);
    HttpResponseMessage response = await GameApiClient.Instance.PostNetData(Path_BagGet, json);
    string responseBody = await response.Content.ReadAsStringAsync();
    Debug.Log(response.StatusCode);
    switch (response.StatusCode)
    {
        case HttpStatusCode.OK:
            var bagData = JsonConvert.DeserializeObject<BagData>(responseBody);
            return int.Parse(bagData.level.ToLower());
        default:
            return -1;

    }
}
```

:::info 关于此代码
该代码取自 <a href="https://github.com/AeYunDian/Crossfire-Ys" style="text-decoration: none;">Crossfire: Ys</a> 的部分片段，可能无法直接运行
:::

`switch`语句处理需要根据服务器具体返回做判断， <a href="https://github.com/AeYunDian/Crossfire-Ys" style="text-decoration: none;">Crossfire: Ys</a> 的网络处理逻辑是专门写几个类，游戏启动时自动加载，在其他需要用户信息时直接调用，
我也推荐你使用这种做法，更加规范，如以后有变动，只需改几个文件，而不是在各个犄角旮旯一个个改。
