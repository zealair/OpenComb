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

在 `~/opencomb` 目录下部署蜂巢：

```
git clone git@github.com:OpenComb/OpenComb.git opencomb
```

安装蜂巢的依赖：

```
cd opencomb && npm i
```

安装一个 blog 扩展

```
npm i ocxblog
```

启动 mongodb

```
mongod &
```

启动蜂巢

```
node index.js
```

在浏览器里访问 url `http://127.0.0.1:6060`


## 安装部署开发版本

如果你想为蜂巢贡献代码，或是使用最新版本，可以使用以下方法。


从github clone OpenComb 库
```
git clone https://github.com/OpenComb/OpenComb.git
cd OpenComb
```

切换到对应版本
```
git checkout 0.9.1
```

执行部署脚本：
```
node script/deployFromGithub.js
```

启动蜂巢
```
node index.js
```


---

# 开发者资源

* [框架ocFramework文档](doc/manual/README.md)



