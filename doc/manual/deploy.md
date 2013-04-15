# 如何部署蜂巢

### 准备

首先你需要安装 nodejs 和 mongodb , 在 ubuntu、osx 上非常简单，下载最新的源代码，然后用标准的 `./configure`; `make`; `make install` “三部曲”就完成了，所以这里就不重复介绍了。
总之在 google 和 baidu上能找到大量帮助。


### 部署和启动蜂巢

部署和维护蜂巢的方式，在 linux, OSX, windows 上是一致的 。

首先，执行下面的命令，部署蜂巢及其依赖包

```
npm i opencomb
```

> 如果提示找不到命令 npm ，那是因为 nodejs 没有正确安装


启动 mongodb
```
mongod &
```

进入蜂巢目录，并启动
```
cd opencomb
node index.js
```

这时，打开浏览器，访问 `http://127.0.0.1:6060` ，你就会看到一个简单的初始页面


### 安装扩展

但是，蜂巢除了这个初始界面外，还没有任何“有用”的功能，我们继续为蜂巢安装一个 blog 扩展。

连续按两次 Ctrl+C ，关闭蜂巢进程，然后执行

```
npm i ocxblog
```

然后再重新启动蜂巢

```
node index.js
```

刷新刚才那个网页，你会看到顶部的导航菜单里面多了一项 "Blog"，它是刚刚安装的 ocxblog 扩展添加进去的。

我们很简单地就为蜂巢加入了 blog 的功能。

你可以用默认的账号 root(密码：111111)登陆，并尝试写一篇blog文章。

> 我想你大概已经意识到了：蜂巢的扩展，其实就是一个 npm 的包。


### 新建扩展

接下来，我们自己创建一个扩展试试看，毕竟蜂巢是一个开发框架，如何在蜂巢下“敏捷”地实现我们的需求，才是我们最关心的。

创建扩展目录，以及扩展内的 lib 目录：

```
mkdir node_modules/example
mkdir node_modules/example/lib
```

然后新建文件： node_modules/example/lib/hello.js ，复制下面的代码并保存：

```javascript
module.exports = function(seed,nut,earth)
{
	nut.write("hello world") ;
	return true ;
}

module.exports.__as_controller = true ;
```

重启蜂巢，然后浏览器里访问 url : http://127.0.0.1:6060/example/hello ，看看你新写的控制器。

一个简单的蜂巢扩展写好了，这个扩展为蜂巢提供了 hello world 网页。


接下来我将向你演示，怎么控制器的链接添加到导航菜单里，就向 ocxblog 扩展的效果一样。

在新扩展 exmaple 目录下，建一个文件 extension.js ，然后写入以下代码：

```javascript
var tplCahces = require("octemplate") ;

module.exports = function(platform)
{
	// 载入模板
	tplCahces.template('ocplatform/templates/WebLayout',function(err,tpl){
		if(!err)
		{
			// 用 jQuery 找到导航菜单，向里面添加 hello 控制器的链接
			tpl.$('ul.nav-top').append('<li class="menu-item"><a href="/example/hello">hello</a></li>') ;
		}
	}) ;
}
```

重启蜂巢，并刷新网页，网页顶部的导航菜单里，就出现了你的链接：“hello”

观察一下 `extension.js` 文件的代码，为了向导航菜单里加入一项链接，我们用到了 jQuery !

没错，蜂巢的模板引擎允许你使用 jQuery 来控制和修改模板结构。

> 这是一个相当有用的特性，你能改变其他包的模板，而不必直接修改他们的源代，这样依赖，当你的扩展被安装到蜂巢里时，这些“修改”就会生效，将你的扩展移除，效果就会还原，对系统和其他包没有任何“副作用”。
