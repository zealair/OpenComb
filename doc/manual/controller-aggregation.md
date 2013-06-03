[返回文档首页](../../README.md)

## layout

控制器的 `layout` 属性可以引用另一个控制器，控制器自己的视图会在 layout的视图内部显示。

在 `layout` 的视图模板里使用 `<views>` 标签可以指定控制器视图的显示位置，否则显示在 layout视图的最后位置。

网站中通常会有一些重复出现的固定区域，例如网页顶部的导航条，logo，banner，网页底部的版权声明什么的，有时候还有两侧的一些banner或菜单。

可以将这些区域写成独立的控制器，然后在其他的控制器里通过 `layout` 属性来引用。

___也就是说显示网页正文部分的控制器使用`layout`属性引用另一个控制器，被引用的 layout控制器负责生成网页的“外围”区域___

举个栗子

用于layout的控制器：opencomb/node_modules/example/lib/layout.js
```javascript
module.exports = {
	view : "example/templates/layout.html"
	, process: function(seed,nut,earth)
	{
		// 什么都没有做，只是输出视图模板
		return true ;
	}
}
module.exports = true ;
```

layout控制器的视图模板：opencomb/node_modules/example/templates/layout.html
```html
<div>
	<!-- 这里是网页的顶部，应该有个导航菜单什么的 -->
	<ul>
		<li><a href="/">首页</a>
	</ul>
</div>

<!-- 网页的主要区域 -->
<div>
	<views>
</div>

<div>
	<!-- 这里是网页的底部 -->
	Copyright YourCompany 2013
</div>
```

以上是layout控制和视图，然后是网页正文的控制器：

控制器：opencomb/node_modules/example/lib/hello.js
```javascript
module.exports = {
	layout: "example/lib/layout.js"
	, view : "example/templates/hello.html"
	, process: function(seed,nut,earth)
	{
		nut.model.message = "hello world." ;

		return true ;
	}
}
module.exports = true ;
```

视图模板：opencomb/node_modules/example/templates/hello.html
```html
<span>
	{@ message }
</span>
```

访问：http://127.0.0.1:6060/example/hello , 控制器 hello.js 输出的内容，显示在 layout.js 视图模板中的 `<views>` 所在位置。

## layout 链

layout 和普通的控制器没有区别，这意味着 layout 控制器也可以有个 layout 属性，结果就是 layout 的视图模板外，再套上一个 layout 视图。

一个控制器的`layout`属性引用另一个控制器，被引用的控制器的`layout`属性再引用下一个控制器，形成了一个“链”。

控制器的视图总是在其layout的视图内部显示，这个“链”导致一层套一层，“链”的起点套在最里面，“终点”套在最外面。

> 如果循环引用，会导致死循环，蜂巢目前的版本没有自动检查循环引用，因此需要开发者避免。

这个机制，对cms类型的网站很有用：整个网站都有相同的顶部和底部，就是说套在最外面的 layout 都相同；不同的栏目下的网页往往有相同的部分，栏目之间有所不同。
使用蜂巢的 layout 链机制，你就可以容易地将相同的部分抽出来，写成独立的控制器，然后用 `layout`属性 灵活地将他们组织起来。


## 定义 layout

layout 属性可以有多种类型的值：

* [字符串] 控制器的路径
* [字符串] 控制器路径的别名
* [function] 控制器函数
* [object] 控制器定义 options

也就是说，你可以`layout`属性可以是另一个控制器的路径，也可以直接给layout属性赋值控制器定义对象

```javascript
// 将前面例子中的 layout.js 和 hello.js 合并成了一个文件
module.exports = {

	// layout上直接定义一个控制器
	layout: {
        view : "example/templates/layout.html"
        , process: function(seed,nut,earth)
        {
            // 什么都没有做，只是输出视图模板
            return true ;
        }
    }

	, view : "example/templates/hello.html"
	, process: function(seed,nut,earth)
	{
		nut.model.message = "hello world." ;

		return true ;
	}
}
module.exports = true ;
```

`layout`的默认值是 `"weblayout"`, 它是 "ocplatform/lib/mvc/controllers/layout/WebLayout" 的别名；如果你不想使用 layout ，让 `layout=null` 而不是省略 `layout` 属性 。

---

## children

控制器的 `children` 属性是一个对象，该对象里的每个属性都是一个“子控制器”，属性名做为子控制器的名称。

子控制器的定义方式`layout`相同。

```javascript
mmodule.exports = {
	view : "example/templates/hello.html"
	, process: function(seed,nut,earth)
	{
		nut.model.message = "hello world." ;

		return true ;
	}

	// 声明两个子控制器：foo 和 bar
	, children: {

		// 定义名为 foo 的子控制器
		foo: {
			view: "example/templates/hello.html"
			, process: function()
			{
				return true ;
			}
		}

		// 通过控制器路径，引用另一个控制器作为子控制器 bar
		, bar: "example/lib/otherController.js"
	}
}
module.exports = true ;
```

执行控制器会自动执行所有子控制器。子控制器的视图显示在控制器的视图内，可以在“父控制器”的视图模板里使用 `<view name='foo' >` 来指定子控制器视图的显示位置。
没有指定位置的子控制器视图，会显示在“父控制器”视图的末尾。

控制器只能有一个`layout`属性，而 `children` 是一个对象，每个控制器可以拥有多个子控制器，这些子控制器还可以拥有子控制器。
因此，layout是一个“链”，而children是一棵“树”。

关于 layout 和 children，你需要清楚以下规则：

1. 反问一个控制器，会自动执行“layout链”和“children树”上的所有控制器，然后组合他们的视图，最后生成网页；

2. 子控制器的视图在父控制器的视图内部显示；

3. layout的情况相反，控制器的视图，在其layout的视图内部显示；

4. layout 和 child 都是控制器，可以直接访问，没有甚么特殊之处；layout 也可以拥有自己的 children，一个 child 也可以拥有 layout；

5. layout 的 children 会自动执行，但 child 的 layout 会被忽略（除非直接访问child）；

6. 主控制器的 seed 参数里的值，来自 GET/POST 请求，而 layout 和 children 的 seed，由主控制器提供；

---

## 向 layout 和 child 传递参数

你可以在控制器的process()函数执行时，向参数 seed 里存入属性 "@layout" 和 "@<子控制器名称>" ，作为传递给 layout 和 children 的 seed 。

控制器：opencomb/example/lib/hello.js
```javascript
mmodule.exports = {
	view : "example/templates/hello.html"
	, process: function(seed,nut,earth)
	{
		// 向子控制器 foo 传递参数 message
		seed["@foo"].message = "hello world." ;

		return true ;
	}

	// 声明两个子控制器：foo 和 bar
	, children: {

		// 定义名为 foo 的子控制器
		foo: {
			view: "example/templates/hello.html"
			, process: function(seed,nut,earth)
			{
				// 参数 message 可能来自父控制器，也可能来自用户请求
				nut.write( seed.message ) ;

				return true ;
			}
		}
	}
}
module.exports = true ;
```

子控制器的参数 message 可能来自父控制器传入，也可能来自用户请求，例如当用户访问：
```
http://127.0.0.1:6060/example/hello:foo?message=hello+world
```
注意url中的`:foo`部分，它表示名为foo的子控制器。

因此，任何控制器都不应该关心参数的来源，只要接收和使用即可。

---

## actions

控制的属性 `actions` 结构和 `children` 相同。但是访问一个控制器，不会自动执行它的 `actions` 。actions 和 主控制器之间是彼此独立的，只能单独访问这些 actions 。actions 只是为了“就近实现”相关的业务，及时没有声明action，也一样可以完成任务。

控制器：opencomb/example/lib/hello.js
```javascript
mmodule.exports = {
	view : "example/templates/hello.html"
	, process: function(seed,nut,earth)
	{
		return true ;
	}

	// 声明一个 actions 控制器：say
	, actions: {

		// 定义名一个控制器作为 hello 的 say action
		say: {
			, process: function(seed,nut,earth)
			{
				nut.message( "hello world" ) ;
				return true ;
			}
		}
	}
}
module.exports = true ;
```

控制器：opencomb/example/templates/hello.html
```html
<div>
	<a onclick="$.requestAction('/example/hello:say',function(err,nut){ nut.msgqueue.popup() })">say</a>
</div>
```

可以通过访问 url 执行 action "say" ：

```javascript
htp://127.0.0.1:6060/example/hello:say
```

用 ajax 方式访问一个action，前端ajax请求的回调函数，会接收后端 process() 执行时输出的 nut对象，然后可以做更多事情。
上面这个例子的效果是：当用户点击链接后，会在网页的右下角弹出一个漂亮的消息框，显示action “say”的process()函数所创建的消息。

> 调用`nut.msgqueue.popup()`方法会弹出所有nut里的消息。

和 layout, child 一样，action 本身也是控制器，只在被其他控制器引用时才做为他们的action。因此 action 可以有自己的 layout, children 和 actions 。

action 通常可以用于响应用户在网页上的一些操作：提交表单，删除文章等等。 蜂巢的控制器/action机制，使得 action 对 ajax 详单友好，我们会在专门的章节里介绍。


## 控制器路径

控制器访问路径的格式，是这样的：
```
<扩展目录名称>/<子目录>/<控制器名称>.js:layout|<child名称>|<action名称>
```

扩展目录是固定在蜂巢目录的 node_modules 下面。

路径中，扩展目录下的 `lib` 目录可以省略，文件扩展名 ".js" 可省略。

冒号后面是 "layout", 或者 child、action的名称，这个部分可以重复出现，例如

```
exmaple/hello:say:sayAgain
```

在程序里，使用`控制器路径`能够引用、加载任何控制器，也可以在 url 里面直接使用`控制器路径`来访问控制器。用于 url 时请省略所有可以省略的部分，使url简短，这样对搜索引擎和用户都更友好。

另外，由于 `:名称` 的语法，控制器路径会出现`殊途同归`的效果，不同的控制器路径其实是指向同一个控制器。请在 url 中尽量路径一致，以便搜索引擎视为同一个网页。





[返回文档首页](../../README.md)