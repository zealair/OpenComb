![opencomb logo](public/images/logo.png)

ocFramework（蜂巢平台的核心框架）
===

ocFramework 是一个Nodejs框架，它是OpenComb平台的核心代码，几乎所有OpenComb平台上的关键特性都由ocFramework实现。
OpenComb实际上只是 ocFramework 和其他一些扩展（例如 ocUser,ocAuth 等）的集合。

ocFramework 也可以脱离OpenComb单独使用。

## 依赖环境

* [Node.js](http://nodejs.org/)
* [MongoDB](http://www.mongodb.org/)
* [Git](http://git-scm.com/)

它们都是流行的开源项目，支持几乎所有平台，安装也很简单，你可以直接访问它们的主页，或google。

在开始使用蜂巢以前，你需要花10分钟准备好蜂巢依赖的环境。

## 快速开始

1. 安装 opencomb-cli 
```
sudo npm install -g opencomb-cli
```


2. 创建项目目录：
```
mkdir ~/opencomb.app
cd ~/opencomb.app
```

3. 在项目目录里创建 opencomb app
```
opencomb init
```

> opencomb 命令由 opecomb-cli 提供，因此需要已全局方式(`-g`)安装 opencomb-cli

4. 启动 mongodb
```
mongod &
```

5. 启动蜂巢
```
node index.js
```

6. 在浏览器里访问 url `http://127.0.0.1:6060`


---

# 开发者资源

* [框架ocFramework文档](doc/manual/README.md)



