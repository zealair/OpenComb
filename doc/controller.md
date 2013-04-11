## hello world

定义一个控制器最简单的方式就是写个函数：

```javascript
// 定义一个函数作为控制器
module.exports = function(seed,nut,earth)
{
	nut.write('hello') ;
	nut.model.whom = 'world' ;
	return true ;
}

module.exports.__as_controller = true ;
```

保存为文件：

```
<你的网站目录>/node_modules/example/hello.js
```

在<你的网站目录>下启动蜂巢：

```
$ node index.js
```

然后用浏览器访问下面的 url ，你就会立刻看到 hello.js 输出的单词：“hello”

```
http://127.0.0.1:6060/example/hello
```

只想在浏览器里打印一行"hello"，不需要太复杂，以上就是全部步骤。

实际上，蜂巢鼓励开发者将任何复杂的功能分解为独立的控制器，而控制器*永远*就是个函数这么简单，即使有时你可能需要声明几个额外的选项。




## 一个控制器对应一个视图

默认情况下，控制器会找相同目录下的同名html文件做为视图的模板文件（如果找不到，控制器就创建一个空的视图）。

```html
, <span><% whom %></span>
```

将上面这段简单的html代码保存到文件：

```
<你的网站目录>/node_modules/example/hello.html
```

然后重新按两次 Ctrl+C ，再重新启动蜂巢，刷新刚才的网页，你就看到完整的句子了。




## 种子，果实和土壤

控制器函数会接收到3个有趣（也非常有用）的参数：

* seed（“种子”） 控制器的输入，来自浏览器的 GET/POST 参数都在里面

* nut（“果实”） 控制器的输出，你可以往里面任意写一些字符串，创建几条给用户看的消息，视图的模型(model)也在nut里

* earth（“土壤”） 提供了你所需要其它内容：session，数据库，以及原始的 http req 和 res 对象，等等


这3个变量构成一组非常形象的“隐喻”：

* seed （“种子”） 代表控制器的输入；

* nut（“果实”）代表控制器的输出；

* 而 earth（“土壤”）则准备好了控制器所依赖的整个运行环境。

希望这能让你印象深刻，一次就能记住它们，以后再也不用查手册 :)

我们用这3个对象，将你的控制器的所有依赖，都“注入”了进来，从而解除了控制器对其依赖的硬耦合（[依赖注入](http://www.google.com/search?q=Dependency%20Injection)）。

让我们详细了解一下，这3个对象的 api

### seed

seed 非常的简单，他是一个键值对格式的对象，GET/POST 来的参数，都已经整理好存在里了.

例如 GET 请求： http://127.0.0.1:6060/example/hello?foo=ooo&bar=xxx

在控制器函数里，你会接收的 seed ，是这个样子：

```javascript
seed = {
	foo: "ooo"
	, bar: "xxx"
}
```

如果POST 和 GET 存在同名的参数，POST值会覆盖 GET值 。

### nut






## 控制器的定义选项

完整的控制器选项都在这里：


```javascript
// 为控制器定义一个完整的 options 对象
module.exports = {

	// process 属性就是前一个例子里的函数，它是控制器的执行函数
	process: function(seed,nut,earth)
	{
		nut.write('hello') ;

		// 返回 true 很重要
		return true ;
	}

	// 在另一个控制器内 显示自己的输出内容
	, layout: "weblayout"

	// 将其他控制器作为自己的子控制器，连同一起执行
	, children: {
		foo: function(seed,nut,earth)
		{
			nut.write("foo") ;
			return ;
		}
		, bar: "example/lib/bar.js"
	}

	// 在蜂巢里 action 也是控制器，但不会在执行控制器时自动执行
	, actions: {
		foo: function(seed,nut,earth)
		{
			nut.write("foo") ;
			return ;
		}
		, bar: "example/lib/bar.js"
	}

	// 控制器视图的模板文件
	, view: "example/templates/hello.html"

	// 视图放置到网页上时执行的事件函数 （这个函数是在 浏览器里 执行的！）
	, viewIn: function()
	{
	}

	// 视图从网页移除时执行的事件函数（这个函数是在 浏览器里 执行的！）
	, viewOut: function()
	{
	}

	// 默认的标题，关键词，以及描述，他们对应网页上的meta信息，会自动赋值给 process() 的 nut，
	, title: "标题"
	, keywords: []
	, description: ""

	// 只用作为 layout 的时候会用到
	, titleTemplate: ""
}

module.exports.__as_controller = true ;
```



### 写控制器时容易遇到的陷阱：

1. 你应该注意到，在前面的例子里，都有固定的最后一行代码：

> module.exports.__as_controller = true ;

这是告诉框架，这个文件导出的是一个控制器，处于安全考虑，只有声明过 “__as_controller = true” 的文件，
才会在浏览器访问的时候做为控制器自动加载。


2. 返回 true 很重要
另外一个细节是：process() 函数总是返回 true，这是因为 nodejs 是异步执行的，所以蜂巢需要知道一个控制器会在何时结束它的全部工作。
返回 true 就是告诉蜂巢：这个控制器已经执行完毕；

有时候 process() 执行完毕，但是任务并没有结束，那就不要返回 true，蜂巢会让浏览器一直等待，直到调用一次 earth.release() 方法。
例如：

```javascript
module.exports = function(seed,nut,earth)
	{
		fs.readFile(__filename,function(err,buff){

			nut.write( buff ) ;

			// 控制器结束
			earth.release() ;
		}) ;

		// 没有返回 true，浏览器会等待 直到调用 earth.release()
	}

module.exports.__as_controller = true ;
```


3. children, actions 和 layout 结构有所不同


4. viewIn 和 viewOut 函数是在浏览器内执行的！

