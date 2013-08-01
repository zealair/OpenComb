ing[返回文档首页](../../README.md)

# 使用控制器

![responsive layout banner](../../public/images/controller.png)

## 定义控制器

在 OpenComb 下定义控制器很简单：

在扩展的 `controllers` 目录下写一个js文件，在文件用 exports 导出一个函数，这个函数就是控制器。


```javascript
// 定义控制器
module.exports = {

	title: "my first opencomb page"

	, keywords: ["foo","bar"]

	, process: function(seed,nut,earth)
	{
		nut.write('hello world') ;

		return true ;
	}
}
```

定义控制器的options对象里，最重要的成员就是 `process` 函数，请求一个控制器，实际上就是在执行其`process`函数。

因此，也可以直接将 exports 定义为一个函数：

```javascript
// 定义一个函数作为控制器
module.exports = function(seed,nut,earth)
{
    nut.write('hello world') ;

    return true ;
}
module.exports.__as_controller = true ;
```

___这个options对象里的所有属性都是可以省略的，包括`process`函数。___

> [控制器options 所有属性](../api/controller-options.md)

## 访问控制器

将上例中定义控制器的代码，保存以下文件里：

```
opencomb/node_modules/example/lib/hello.js
```

然后重启蜂巢，就可以在浏览器里，通过url: `http://127.0.0.1:6060/exmaple/hello` 来访问了。

控制器的路径规则是这样的：

控制器文件可以放在你的扩展目录内的任意位置，例如：
```
<蜂巢目录>/node_modules/<你的扩展名称>/lib/<控制器名称>.js
```

系统会从 `<蜂巢目录>/node_modules/` 目录下开始查找你的控制器，因此，访问这个控制器的的url就是：

```
http://127.0.0.1:6060/<你的扩展名称>/lib/<控制器名称>.js
```

在这个路径中，扩展目录下的名为`lib`的目录可以省略，扩展名`.js`也可以省略，所以简短的 url 应该是：

```
http://127.0.0.1:6060/<你的扩展名称>/<控制器名称>
```

使用简单的路径，对搜索引擎更友好。

> 不同于其他开发框架，你的代码必须做为蜂巢的扩展放在 `<蜂巢目录>/node_modules`下，启动蜂巢时，会加载所有扩展；不能直接执行你的程序，由你的程序加载蜂巢。


## 使用视图模板

* ### 视图模板文件的默认位置

	控制器文件: opencomb/node_modules/example/lib/hello.js

	```javascript
	// 定义一个函数作为控制器
	module.exports = function(seed,nut,earth)
	{
		nut.model.message = 'hello world' ;

		return true ;
	}

	module.exports.__as_controller = true ;
	```

	html 模板文件: opencomb/node_modules/example/lib/hello.html

	```html
	<div>
		<span>{@message}</span>
	</div>
	```

	重新启动蜂巢，在浏览器里访问：http://127.0.0.1:6060/exmaple/hello 。

	默认情况下，控制器会找所在目录下的同名html文件做为视图的模板文件。


* ### 用 `view` 属性指定模板文件

	```javascript
	// 定义一个函数作为控制器
	module.exports = {

		// 用 view 属性指定一个模板文件
		view: 'example/templates/hello.html'

		, function(seed,nut,earth)
		{
			nut.model.message = 'hello world' ;

			return true ;
		}

	}

	module.exports.__as_controller = true ;
	```

	html 模板文件: opencomb/node_modules/example/templates/hello.html

	```html
	<div>
		<span>{@message}</span>
	</div>
	```

	模板文件的路径规则和控制器类似，都是从 `<蜂巢目录>/node_modules` 开始，但不会省略 `lib` 和 扩展名 `.html`。

	> 当扩展里的 js文件较多时，把控制器和模板放在一起会使目录看上去混乱，我们建议将模板集中放在扩展目录下的 templates 目录里。


## 种子，果实和土壤

控制器函数会接收到3个参数，他们的命名很有趣：

* seed（“种子”） 做为控制器的输入，来自浏览器的 GET/POST 参数都在里面

* nut（“果实”） 控制器的输出，你可以往里面：

	* 写任意字符串
	* 创建几条给用户看的消息
	* 在视图的模型(model)里设置变量

	系统根据你写到nut里的内容生成网页

* earth（“土壤”） 提供了其它所需的接口：session，数据库，原始的 http req/res 对象，等等

希望这些“比喻”能让你印象深刻，一次就能记住它们，以后再也不用查手册 :)

> [高级] 我们用这3个对象，将你的控制器的所有依赖都“注入”了进来，从而解除了控制器对其依赖的硬耦合（[依赖注入](http://www.google.com/search?q=Dependency%20Injection)）。

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

seed 对象里只有数据，没有任何方法。


### 参数：nut

nut 主要就是做3件事：输出字符串到缓冲区，创建消息，以及保存视图的模型(model)。

```javascript
module.exports = function(seed,nut,earth)
{
	// 直接向浏览器输出
	nut.write('hello') ;

	// 设置模型变量 "say"，然后就可以在视图模板中使用变量 say
	nut.model.say = 'hello' ;

	// 创建一个消息
	nut.message("hello") ;

	// 反回true 表示控制器执行已经结束
	return true ;
}

module.exports.__as_controller = true ;
```

控制器执行完后，系统根据 nut 里的内容生成网页。消息默认在最前面，然后是缓冲区里的内容，最后是视图模板渲染的html。

也可以在模板里面使用 <msg> 标签指定消息的显示位置：

```html
<div>
	<msg>
</div>
```

> [nut 的 api](../api/nut.md)

### 参数：earth

earth 提供了你需要的所有接口，

```javascript
module.exports = function(seed,nut,earth)
{
	// 读写 session
	earth.session.name = 'alee chou' ;

	// earth.session.idmgr用来管理用户登陆后的身份信息
	// 取得用户身份
	var id = earth.session.idmgr.current() ;

	// earth.db 是一个数据库对象
	// 写入数据表(collection)
	var book = {name:'xxx',author:'ooo'} ;
	earth.db.collection('books').insert(book,function(err){

		nut.message("book: %s 信息已经保存",[book.name],"success") ;

		// 控制器结束
		earth.release() ;
	}) ;
}

module.exports.__as_controller = true ;
```

> [earth 的 api](../api/earth.md)


## __as_controller 声明

必须在文件导出的对象 `exports` 里声明：`__as_controller = true`，否则系统会拒绝浏览器访问此文件里定义的控制器。

以下两种方式是一个意思：

```javascript
module.exports = {
	process: function()
	{
		// ...
	}
}

// 在全局代码中
module.exports.__as_controller = true ;
```

以及

```javascript
module.exports = {
	process: function()
	{
		// ... ...
	}

	// 放在控制器的 options 对象里
	, __as_controller = true
}
```

## 控制器的结束

因为 nodejs 是异步执行的，所以蜂巢需要知道一个控制器会在何时结束它的全部工作。
返回 true 就是告诉蜂巢：这个控制器已经执行完毕；

有时候 process() 执行完毕，但是任务并没有结束，那就不要返回 true，蜂巢会让浏览器一直等待，直到调用一次 earth.release() 方法。

* 如果控制器不必等待任何回调函数，此时立即返回 true ，表示控制器已经结束。

	```javascript
	module.exports = function(seed,nut,earth)
	{
		// 同步读取文件
		var buff = fs.readFileSync("file/path") ;
		console.log(buff.toString()) ;

		// 返回 true ，表示控制器已经完成
		return true ;
	}
	```

* 如果控制器需要等到某些异步操作的回调函数（例如：fs.readFile('file/path',callback)），不要返回 true ，
然后在所有操作都结束后，也就是最后一个回调函数里，调用 `earth.release()`，通知系统该控制器器已经结束。

	```javascript
	module.exports = function(seed,nut,earth)
	{
		// 异步读取文件
		fs.readFile('file/path', function(err,buff){

			console.log(buff.toString()) ;

			// 通知系统，控制器任务已经完成
			earth.release() ;
		}) ;

		// not return true here
	}
	```

### 成对使用 `earth.hold()` 和 `earth.release()`

蜂巢在earth内部设置了一个计数器，调用`earth.hold()`计时器加1，调用`earth.release()`计时器减1 ；
当计数器减至0时，认为控制器执行完毕。

系统在调用控制器函数前，已经调用了`earth.hold()`一次，计数为1。

控制器函数如果返回 true ，则系统自动调用`earth.release()`，否则一直等待`earth.release()`被调用。

根据这个机制，你可以在每个顺序无关的异步操作前调用一次`earth.hold()`，在它们的回调函数里调用`earth.release()`，并且控制器函数返回 true 。

```javascript
// 系统在调用控制器函数前，调用了 earth.hold()
module.exports = function(seed,nut,earth)
{
	// 异步读取文件 a.txt
	earth.hold()
	fs.readFile('same/folder/a.txt', function(err,buff){

		console.log('a.txt',buff.toString()) ;

		// 通知系统，控制器任务已经完成
		earth.release() ;
	}) ;

	// 异步读取文件 b.txt
	earth.hold()
	fs.readFile('same/folder/b.txt', function(err,buff){

		console.log('b.txt',buff.toString()) ;

		// 通知系统，控制器任务已经完成
		earth.release() ;
	}) ;

	// 返回true，系统自动调用 earth.release()
	return true ;
}
```



[返回文档首页](../../README.md)
