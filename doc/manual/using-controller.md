ing[返回文档首页](../../README.md)

# 使用控制器

![responsive layout banner](../../public/images/controller.png)

## 定义控制器

在 OpenComb 下定义控制器很简单：

在扩展的 `controllers` 目录下写一个js文件，在文件中用 exports 导出一个函数，这个函数就是控制器。


```javascript
// 定义控制器
module.exports = {
	title: "my first opencomb page"
	, keywords: ["foo","bar"]
	, process: function(seed,nut)
	{
		nut.write('hello world') ;
	}
}
```

控制器的定义通常都是一个这样的options对象，其中最重要的成员是 `process` 函数，请求一个控制器，实际上就是在执行其`process`函数。

因此，也可以直接将 exports 定义为一个函数：

```javascript
// 定义一个函数作为控制器
module.exports = function(seed,nut,earth)
{
    nut.write('hello world') ;
}
```

___这个options对象里的所有属性都是可以省略的，包括`process`函数。___


> [控制器options 所有属性](../api/controller-options.md)


## 访问控制器

在 `opencomb/node_modules` 下新建一个目录 `example`，这个目录对OpenComb来说就是一个“扩展”。

然后将上例中定义控制器的代码，保存以下文件里：

```
opencomb/node_modules/example/controllers/hello.js
```

重启蜂巢，在浏览器里访问url: `http://127.0.0.1:6060/exmaple/hello`，你会看到浏览器上输出的 `hello world`。


### 控制器的路径规则：

控制器文件只有放在扩展的`controllers`目录内，才能被浏览器访问，例如：

```
<蜂巢目录>/node_modules/<你的扩展名称>/controllers/<控制器名称>.js
```

系统到 `<蜂巢目录>/node_modules/` 目录下查找你的控制器，因此，访问这个控制器的的url就是：

```
http://127.0.0.1:6060/<你的扩展名称>/controllers/<控制器名称>.js
```

在这个路径中，扩展目录下的名为`controllers`的目录可以省略，扩展名`.js`也可以省略，所以简短的 url 应该是：

```
http://127.0.0.1:6060/<你的扩展名称>/<控制器名称>
```

路径越简短，对搜索引擎越友好。

> 不同于其他开发框架，你的代码必须做为蜂巢的扩展放在 `<蜂巢目录>/node_modules`下，启动蜂巢时，会加载所有扩展；不能直接执行你的程序，由你的程序加载蜂巢。

> `controllers` 是一个约定，可以通过配置来修改。OpenComb遵循：“约定优于配置，配置高于约定”的原则。


## 在控制器中使用视图模板

每个控制器对应一个视图，控制器的`process`函数执行完毕后，系统自动渲染视图并输出。

### 视图模板文件的默认位置

	控制器文件: opencomb/node_modules/example/controllers/hello.js

	```javascript
	// 定义一个函数作为控制器
	module.exports = function(seed,nut,earth)
	{
		// nut.model 对象里的属性会做为视图模版里变量
		// 模版里会有一个名为 message 的变量
		nut.model.message = 'hello world' ;
	}
	```

	html 模板文件: opencomb/node_modules/example/controllers/hello.html

	```html
	<div>
		<span>{@message}</span>
	</div>
	```

	重新启动蜂巢，在浏览器里访问：http://127.0.0.1:6060/exmaple/hello 。

	默认情况下，控制器会找所在目录下的同名html文件做为视图的模板文件。


### 用 `view` 属性指定模板文件

	```javascript
	// 定义一个函数作为控制器
	module.exports = {

		// 用 view 属性指定一个模板文件
		view: 'example/templates/hello.html'

		, function(seed,nut,earth)
		{
			nut.model.message = 'hello world' ;
		}

	}
	```

	html 模板文件: opencomb/node_modules/example/templates/hello.html

	```html
	<div>
		<span>{@message}</span>
	</div>
	```

	模板文件的路径规则和控制器类似，都是从 `<蜂巢目录>/node_modules` 开始，但不会省略 `controllers` 和 扩展名 `.html`。

	> 当扩展里的 js文件较多时，把控制器和模板放在一起会使目录看上去混乱，我们建议将模板集中放在扩展目录下的 templates 目录里。


## 种子和果实

控制器的`process(seed,nut)`函数会接收到2个参数，他们的命名很有趣：

* seed（“种子”） 做为控制器的输入，通常是来自浏览器的 GET/POST 参数。

* nut（“果实”） 控制器的输出，你可以往里面：

	1. 写任意字符串

	2. 创建几条给用户看的消息

	3. 在视图的模型(model)里设置变量

系统根据你写到nut里的内容生成网页，或用作其他事情（后文会介绍）。

希望这些“比喻”能让你印象深刻，一次就能记住它们，以后再也不用查手册 :)

> [高级] 我们用这2个对象，将控制器的所有依赖都“注入”了进来，从而解除了控制器对其依赖的硬耦合（[依赖注入](http://www.google.com/search?q=Dependency%20Injection)）。

### 参数：seed

seed 是一个`键值对`的对象，来自Http GET/POST 的参数，会自动放在里面.

例如请求url： http://127.0.0.1:6060/example/hello?foo=ooo&bar=xxx

控制器接收到的 seed ，是这个样子：

```javascript
seed = {
	foo: "ooo"
	, bar: "xxx"
}
```

> 如果POST 和 GET 存在同名的参数，POST值会覆盖 GET值 。

seed 也可能是系统其他地方 mockup 创建的数据，控制器不应该关心 seed 数据的来源。

### 参数：nut

你主要对 nut 做3件事（根据你的需要）：
	1. 创建消息到nut里的消息队列;
	2. 输出字符串到到nut里的缓冲区;
	3. 给nut的模型(nut.model)设置变量。

你放在 nut 中的这些内容，主要有两中用途：
	1. 普通的http访问，系统根据你放在nut中的内容生成网页(html)：
		nut的消息队列默认在最前面，然后是`nut.write()`写入缓冲区里的内容，最后才是视图模板渲染的html；
		nut.model 里的属性会作为视图模版的模版变量
	2. ajax访问控制器时，服务器返回地就是 nut 对象。在前端决定如何处理nut里的内容。

> 这就是“坚果”这个隐喻的含义：控制器输出的内容被“硬果壳”严密地封装在一个“坚果”(nut)里。这个“坚果”既可以在服务器端处理，也可以被ajax带到前端，在前端环境里面破开果壳，取得里面的“果肉”。
> 而这只取决于访问控制器的方式（ajax or not），跟控制器本身的逻辑无关。



```javascript
module.exports = function(seed,nut,earth)
{
	// 直接向浏览器输出
	nut.write('hello') ;

	// 设置模型变量 "say"，然后就可以在视图模板中使用变量 say；如果通过ajax请求控制器，前端也可以拿到这些变量
	nut.model.say = 'hello' ;

	// 创建一个消息
	nut.message("hello") ;
}
```

也可以在模板里面使用 <msgqueue> 标签指定消息的显示位置：

```html
<div>
	<msgqueue>
</div>
```

> 通过ajax访问控制器时，服务器返回的是完整的 nut，因此，不要在nut里保存敏感内容。

> [nut 的 api](../api/nut.md)



[返回文档首页](../../README.md)
