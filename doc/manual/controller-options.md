
# 完整的控制器定义 options


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

