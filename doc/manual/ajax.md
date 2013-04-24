[返回文档首页](../../README.md)


## “剥开果壳”

蜂巢的控制器机制对 Ajax 非常友好。

当请求一个控制器时，系统会执行他的process()函数，并递归执行他的 layout 和 所有children 的 process()函数。
每次执行一个 process() 时，系统都创建一个 nut 对象传递给 process() 函数，后者将输出的内容存在 nut 中。

然后系统判断请求的方式，如果不是一个Ajax请求，就根据nut里的内容立即生成网页并输出给浏览器；

如果是一个 Ajax 请求，就将这些 nut 对象以JSON格式传回前端，由前端负责后续处理：既可以生成html更新网页上的某个区域，也可以只是读取nut里面的内容做其他的处理（弹个消息框什么的）。
无论是在后端，还是在前端，根据nut生成的html都是完全一致的。


> 我们使用nut(“坚果”)这个单词，正是这个意思：在后端执行控制器的时候，
> 我们向 nut 放入各种类型的东西(消息,模型数据,输出任意字符串)，然后封装进一个“严密”的果壳里。
> 
> 这个果壳，既可以在后端立刻打开，由服务器渲染生成用户请求的网页(html)；也可以通过ajax 取回到浏览器前端，在前端完成网页的生成渲染。
> 
> 这是一种简单却强大的开发体验：在后端填充一个nut，在前端 ajax 的回调函数里拿到这个 nut ，使用一致的 api 剥开果壳，取得甜美的果肉！


## Ajax 访问

蜂巢也提供基础的前端框架，前端框架基于流行的 jQuery 。

```javascript
mmodule.exports = {
	view : "example/templates/hello.html"

	, process: function(seed,nut,earth)
	{
		return true ;
	}

	, actions: {
		say: {
			, process: function(seed,nut,earth)
			{
				nut.message( "hello world" ) ;
				nut.model.message = "hello world" ;
				nut.write("hello world") ;

				return true ;
			}
		}
	}

	// 前端的视图事件
	, viewIn: function()
	{
		$("a.say").click(

			// 将这个链接做为 ajax 请求发送给服务器
			$.request("/example/hello:say",function(err,nut){

				if(err)
				{
					throw err ;
				}

				// 在指定的位置显示消息
				nut.msgqueue.renderAndAppendTo("div.msgqueue") ;

				// 弹出消息框
				nut.msgqueue.popup() ;

				// 打印 nut 里的内容
				console.log( "from nut.model", nut.model.message ) ;
				console.log( "from nut.write()", nut.buff ) ;
			}) ;
		) ;
	}
}
module.exports = true ;
```

```html
<div>

	<!-- 用于显示action "say"输出的消息 -->
	<div class="msgqueue"></div>

	<a class="say" href="javascript:void(0)">say</a>

</div>
```

> 当视图显示在网页上时，执行控制器里的 `viewIn` 函数，`viewIn` 是在浏览器里执行的。

`$.request(ajaxOptions,thenOptions)`的两个参数可以有多种形态


* 参数 ajaxOptions
	* 作为url的字符串
	* 作为$.ajax()函数参数的 options 对象


* 参数 thenOptions

	* 可以是一个字符串，会自动根据控制器返回的 nut 生成一段html，更新网页上的指定部分：
		* "body"  更新整个网页body
		* "lazy"  最小程度更新网页里的内容
		* 一个 jQuery selector，找到的一个dom元素会被替换
		
		```javascript
		// 请求控制器，根据返回的nut生成html,替换掉网页匹配 "div.sameclassname" selector 的第一个元素
		$.request("example/hello","div.sameclassname") ;
		```

	* Dom Element，指定被替换的网页元素

	* 传入一个回调函数处理控制器返回的 nut

	* 或者一个 options 对象，可以拥有以下属性：

		* 属性target: 请求完成后，根据nut生成html，更新网页中的内容，可以是这些值: "top","lazy",jQuery selector, Dom Element
		* 属性callback: 请求完成后的回调函数
		* 属性switch: 在 $.switcher注册过的动画名称

`$.controller(url,data,callback)` 和 `$.action(url,data,callback)` 是 `$.request()` 的参数简化版本。如果省略 callback ，$.controller() 则自动根据返回的nut生成 html 更新当前网页上的主控制器视图；`$.action()`在省略callback的情况下，弹出 nut 里的消息。



[返回文档首页](../../README.md)