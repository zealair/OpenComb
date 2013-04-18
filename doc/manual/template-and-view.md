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

### 模板的路径规则

支持两种格式：绝对路径，和相对路径从 `<蜂巢目录>/node_modules` 开始。

不支持 `.` , `..`


### 表达式

模板表达式的格式是：`{@ expression }` ，它的作用是将括号内的代码当做 javascript表达式执行，并将结果输出到所在位置。

> 注意：在 `{@ expression }` 的括号内写多行表达式是没有意义的，只有第一行表达式会被执行和输出。如果需要执行多行，可以使用 (function(){ ...; }){} 格式来包装。

```html
<div>
	{@ (function(){ var message="hello"; message+= " world!" ; return message ; })() }
</div>
```


### 属性表达式

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

### 注释

由于 {@ expression } 不会将 undefined 强转成字符串 "undefind" 输出，所以可以用以下格式作为模板上的注释：

{@ /* same words here */ }


### 比较大小

在标签属性中使用“<”或“>” 这两个符号，会干扰 htmlparser 的解析，被误判为标签的边界符号。

可以使用模板预定义变量 $helper 提供的几个比较函数，例如

 ```html
<if condition="@$helper.gt(i,1)">
	... ...
</if>
 ```

### $model

你可以在模板中使用预定义变量 $model 来访问 model 中的变量，例如：

```html
<div>
	{@ $model.message || "hello world !!! (from template)"}
</div>
```

当你在模板中使用一个不存在的变量时，模板引擎会抛出异常，并停止执行；但是访问不存在的属性是安全的，当你不确定变量是否存在时，可以使用 $model 。


### $helper

最好不要在模板中调用函数，因为蜂巢的模板是可以在浏览器中渲染的，但是无法保证你的函数在前端可用。


API

---

# 视图

模板通常做为控制器的视图使用，每个控制器拥有一个视图。

控制器加载模板的机制是：

1. 检查是否存在 view 属性，将 view 作为模板文件的路径

2. 如果没有 view 属性，则检查控制器所在目录内有无同名的 html 文件，例如控制器 hello.js 会自动加载 hello.html 做为视图模板。

3. 也没有同名的 html ，则控制器使用一个空模板


## <view> 标签

可以在作为视图的模板中使用 <view> 标签来决定 控制器的 child 的视图显示位置。

<蜂巢目录>/node_modules/example/hello.js
```javascript
module.exports = {



}
```

## <msg> 标签

