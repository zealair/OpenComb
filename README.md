![opencomb logo](public/images/logo.png)

OpenComb
===

OpenComb 是一个Nodejs框架，她实现了许多有趣的事情。

## 依赖环境

* [Node.js](http://nodejs.org/)
* [MongoDB](http://www.mongodb.org/)
> 在ubuntu上安装最新版本的mongodb：[http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/]
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

* [OpenComb框架文档](doc/manual/README.md)



