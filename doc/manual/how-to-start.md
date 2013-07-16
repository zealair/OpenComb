[返回文档首页](../../README.md)

# 如何开始？

## 部署和启动蜂巢

> 部署和维护蜂巢的方式在 linux, OSX, windows 上是一致的。

首先，执行下面的命令，在 opencomb 目录下部署蜂巢最新的稳定版本：

```
git clone git@github.com:OpenComb/OpenComb.git opencomb
```

进入蜂巢目录，安装蜂巢依赖的模块：

```
cd opencomb && npm i
```

> 如果提示找不到命令 npm ，那是因为 nodejs 没有正确安装


启动 MongoDB
```
mongod &
```

启动蜂巢
```
node index.js
```

这时，打开浏览器，访问 `http://127.0.0.1:6060` ，你就会看到一个简单的初始页面。




## 安装扩展

但是，蜂巢除了少数基本界面外，还没有任何“有用”的功能，我们接着为蜂巢安装一个“用户系统”扩展。

连续按两次 `Ctrl+C` ，关闭蜂巢进程，然后执行

```
npm i ocuser
```

再重新启动蜂巢

```
node index.js
```

刷新刚才那个网页，你会看到网页的右上角多了一个用户登陆的表单。

你可以用默认的账号 root(密码：111111)登陆。

> 我想你大概已经意识到了：蜂巢的扩展，其实就是一个 npm 的包。


## 新建扩展

接下来，我们自己创建一个扩展试试看，毕竟如何在蜂巢下“敏捷”地实现我们自己的需求，才是我们最关心的。

创建扩展目录，和扩展内的 lib 目录：

```
mkdir node_modules/example
mkdir node_modules/example/lib
```

然后新建文件： opencomb/node_modules/example/lib/hello.js ，复制下面的代码并保存：

```javascript
module.exports = function(seed,nut,earth)
{
	nut.title = "My first page" ;
	nut.write("hello world") ;
	return true ;
}
module.exports.__as_controller = true ;
```

重启蜂巢，然后浏览器里访问 url : http://127.0.0.1:6060/example/hello ，看看你新写的控制器。

一个简单的蜂巢扩展就写出来了，这个扩展为蜂巢提供了一个 hello world 网页。


## 增加导航链接

接下来我将向你演示，怎么将控制器的链接添加到导航菜单里，这用到了蜂巢框架的重要特性。

在新扩展 exmaple 目录下，建一个文件 extension.js ，然后写入以下代码：

```javascript
module.exports = {

	// 扩展的加载事件，在蜂巢启动时被调用
	onload: function(platform,callback)
	{
		// 载入模板
		helper.template('ocplatform/templates/WebLayout',function(err,tpl){
			if(!err)
			{
				// 用 jQuery 找到导航菜单，
				var $ul = tpl.$('ul.nav-top') ;

				// 检查菜单是否存在
				if($ul.length)
				{
					// 向导航ul里面添加 hello 控制器的链接
					$ul.append('<li class="menu-item"><a href="/example/hello">hello</a></li>') ;
				}
				else
				{
					console.log("没有找到导航菜单") ;
				}
			}
		}) ;

		callback && callback() ;
	}
}
```

重启蜂巢，并刷新网页，网页顶部的导航菜单里就出现了你的链接：“hello”

观察一下 `extension.js` 文件的代码，为了向导航菜单里加入一项链接，我们用到了 jQuery !

没错，蜂巢的模板引擎允许你在后端的Nodejs环境里使用 jQuery 来控制和修改模板结构。

> 这是一个相当有用的特性，你能改变其他包的模板，而不必直接修改他们的源代。当你的扩展被安装到蜂巢里时，这些“修改”就会生效，将你的扩展移除，效果就会还原，对系统和其他包没有任何“副作用”。

[返回文档首页](./README.md)
