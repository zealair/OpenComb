[返回文档首页](../../README.md)

# HTML 模板

```javascript
var tplcaches = require("octemplate") ;

// 加载模板文件
tplcache.template("example/templates/hello.html",function(err,tpl){

	if(err)
	{
		console.log(err) ;
	}

	else
	{
		var model = {

			message: 'hellp world'
			, color: 'red'
			, i: 3

		} ;

		// 渲染模板
		// render() 函数的第一个参数，是传递到模板中的变量。
		// 该对象里的属性，可以在模板的表达式中作为同名变量直接访问。
		tpl.render(model,function(err,html){

			if(err)
			{
				console.log(err) ;
			}
			else
			{
				// 打印模板渲染结果
				console.log(html) ;
			}

		}) ;
	}

}) ;
```

文件：<蜂巢目录>/node_modules/example/templates/hello.html
```html
<loop end="@i">
<div style="color:{@color}">

	{@ /*判断 i 大于 1 */ }
	<if condition="@ $helper.gt(i,1) ">
		<hr />
	</if>

	loop {@i} : {@ message}

</div>
</loop>
```

## 模板的路径规则

支持两种格式：绝对路径，和相对路径从 `<蜂巢目录>/node_modules` 开始。

不支持 `.` , `..`


## 表达式

模板表达式的格式是：`{@ expression }` ，它的作用是将括号内的代码当做 javascript表达式执行，并将结果输出到所在位置。

> 注意：在 `{@ expression }` 的括号内写多行表达式是没有意义的，只有第一行表达式会被执行和输出。如果需要执行多行，可以使用 (function(){ ...; }){} 格式来包装。

```html
<div>
	{@ (function(){ var message="hello"; message+= " world!" ; return message ; })() }
</div>
```


## 属性表达式

标签的属性如果以"@"符号开头，则该属性会被当做表达式执行，并返回（或输出）结果，例如：

```html
<div style="@ 'color:'+color ">
	hello world.
<div>
```

```html
<if condition="@ 'color:'+color ">
	hello world.
<div>
```

> 注意：对 <if>标签的 condision 这样的属性来说，是否以 @ 开头，有很大的却别，缺少 @ ，引号内的值会被当做字符串，而不是表达式。对非空字符串进行 if 判断，总是返回 true 。
这是一个很常见的陷阱。

属性表达可以被 `{@ expression }` 替代

```html
<div style="color{@color}">
	hello world.
<div>
```

{@ expression } 返回的 undefined 和 null 意外的任何值，都会 toString() 后输出。 遇到 undefined，null 不会输出任何内容，当中空字符串处理。

## 注释

由于 {@ expression } 不会将 undefined 强转成字符串 "undefind" 输出，所以可以用以下格式作为模板上的注释：

{@ /* same words here */ }


## 比较大小

在标签属性中使用“<”或“>” 这两个符号，会干扰 htmlparser 的解析，被误判为标签的边界符号。

可以使用模板预定义变量 $helper 提供的几个比较函数，例如

 ```html
<if condition="@$helper.gt(i,1)">
	... ...
</if>
 ```

## $model

你可以在模板中使用预定义变量 $model 来访问 model 中的变量，例如：

```html
<div>
	{@ $model.message || "hello world !!! (from template)"}
</div>
```

当你在模板中使用一个不存在的变量时，模板引擎会抛出异常，并停止执行；但是访问不存在的属性是安全的，当你不确定变量是否存在时，可以使用 $model 。


## $helper

最好不要在模板中调用函数，因为蜂巢的模板是可以在浏览器中渲染的，但是无法保证你的函数在前端可用。




## 内置的标签
# 标签

* ___&lt;if&gt;___

	* condition， 条件表达式。如果 condiition 属性不是以@开始，会当做字符串而不是表达式。

* ___&lt;elseif&gt;___

	* condition，条件表达式

* ___&lt;else&gt;___

* ___&lt;loop&gt;___

	* start(可选)，循环开始值，默认:1
	* end，循环结束值
	* step(可选)，循环步长，默认:1
	* var(可选)，循环变量的变量名

	只有参数 end 是必须的。

	```javascript
	<loop end="" var="i">
		<p>第 {@i} 次循环。</p>
	</loop>
	```

* ___&lt;foreach&gt;___

	* for, 对象或数组，需要用@开头，表示该属性是一个表达式
	* key(可选), 元素键名
	* var(可选), 元素指针变量的名称
	
	```javascript
	<foreach for="@['a','b','c']" var="item" key="key">
		<p>{@key} = {@item}</p>
	</foreach>
	```

* ___&lt;continue&gt;___

* ___&lt;break&gt;___

* ___&lt;include&gt;___

	* file 可以是表示模板文件路径的普通字符串，也可以使用@开头，使用一个表达式，表达式的结果当做模板文件的路径
	* model(可选)，引用的模板文件，和当前模板文件的 model 是分离的，当前模板文件中的变量在 include 模板中无法访问，需用用 model 属性传给被引用的模板。


	```javascript
	<!-- include另一个模板文件，将当面模板中的变量整个传第给那个模板 -->
	<include file="example/template/anotherTemplate.html" model="@$model" >
	```

* ___&lt;view&gt;___

	模板文件中的 &lt;view&gt; 标签用于指定子视图的显示位置。

	* name(可选), 子视图的名称，默认为"*"，表示所有未指定位置的子视图，通常用于 layout 视图。
	* mode(可选), 可用值为： "unuse", "week", "soft"(默认), "hard", 优先级由低到高。 同一个视图，被多个 <view> 指定，mode值的优先级高的生效。 &lt;view&gt; 的属性 name="*" 时，mode 的默认值为 "unuse"，name为其他值时，mode的默认值为 "soft"。所以，&lt;view&gt;（或 &lt;view name="*"&gt;）时，只有未被指定位置的视图，会被安置在&lt;view&gt;所在位置。


* ___&lt;msg&gt;___

	* 显示 nut.message() 创建的消息，如果模板中没有 &lt;msg&gt; 标签，这些消息会被自动放到视图的前部。

---

# 视图

模板通常做为控制器的视图使用，每个控制器拥有一个视图。

控制器加载模板的机制是：

1. 检查是否存在 view 属性，将 view 作为模板文件的路径

2. 如果没有 view 属性，则检查控制器所在目录内有无同名的 html 文件，例如控制器 hello.js 会自动加载 hello.html 做为视图模板。

3. 也没有同名的 html ，则控制器使用一个空模板


## 视图事件 "viewIn" 和 "viewOut"

可以在控制器里，为视图定义事件函数：`viewIn`, `viewOut` 。当网页打开时触发所有视图的 `viewIn` 事件；`pjax`更新网页上的视图时，触发新视图的`viewIn`，和被替换的视图的`viewOut`。

```javascript
module.exports = {
	
	view: "example/templates/hello.html"
	, process: function()
	{
		return true ;
	}

	, viewIn: function()
	{
		// 可以使用 require 载入服务器上的js文件，但该文件必须注册为 ship down
		var foo = require("./bar.js") ;

		$("div.sameclass").html("hi, this message come from viewIn function") ;
	}
	, viewOut: function()
	{
		// 在浏览器的控制器打印
		console.log("im leaving") ;
	}
}
```

在控制器中定义 `viewIn` 和 `viewOut` 事件函数，需要注意的是：

1. 闭包变量是无效的。蜂巢只是将 `viewIn` 和 `viewOut` 这两个函数复制到客户端，重新解释执行，因此无法在这两个函数中访问闭包变量。例如：

	```javascript

	var foo = "bar" ;

	module.exports = {
		process: function()
		{
			// foo 变量有效
			console.log( foo ) ;

			return true ;
		}

		// viewIn 函数会复制到浏览器里重新解释执行
		, viewIn: function()
		{
			// foo 变量未定义
			console.log( foo ) ;
		}
	}
	```
2. 可以使用 jQuery ，但是 $ 被做了限制，selector 只能在视图内部查找元素。这是因为蜂巢的控制器是可以组合的，同一个控制器的视图能在网页上出现多次。这种情况下，如果 jQuery 在整个网页范围内查找元素，那么操作的元素，总是第一个视图里的。

	于是，蜂巢对 `viewIn` 和 `viewOut` 这两个闭包环境上的 $ 做了限制：只在视图范围内查找元素，不会误影响到视图以外的元素。如果需要对视图外的元素操作，可以使用 jQuery 变量，不过，视图之间的访问，我建议使用jQuery的自定义事件，以避免耦合。

3. 可以在视图事件函数里使用 require 加载其它文件，这些文件会随着事件函数一起 ship down 到浏览器执行，因此这些文件需要事先声明为 shippable 。

	通常在 extension.js 文件的 onload 函数里声明 shippable ：

	文件：example/extension.js
	```javascript

	module.exports.onload = function(){

		// 声明一个路径下的所有文件，均可以 shipdown 到浏览器
		$opencomb.shipper.registerAllowFolder(path_prefix) ;

		// 注册一个正则表达式，匹配该表达式的文件路径，均可以shipdown 到浏览器
		$opencomb.shipper.registerAllowFilter(regexp) ;
		
	}
	```


[返回文档首页](../../README.md)