## 定义一个controller

写 controller 是你在蜂巢下完成开发工作最主要的任务。controller 是一个类，它必须有一个方法process()，执行一个controller对象，实际上就是执行这个函数。对你来说，controller.process() 函数就是任务执行的入口，而你需要的所有API 和 对象，都会作为process()的参数传给你。

有三种方式定义一个contrller：

1. 最简单的方式，是通过exports变量导出一个函数，这个函数就是controller的process()方法，至于controller类以及其他部分，系统都会帮你处理好。举个栗子：

	```javascript
	// exports 一个函数作为控制器的 process 方法
	module.exports = function(seed,nut,earth)
	{
		nut.message('hello') ;
		return true ;
	}
	```

2. 通常还需要为controller提供更多的信息，例如其视图的模板文件，layout,action等（后文将会专门介绍layout和action），这时就需要 exports 一个JSON对象，而方法1所定义的函数，则要作为 JSON 的一项属性：process。这很好理解，对吧？举个栗子：

	```javascript
	// exports的是一个JSON对象
	module.exports = {
		process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```

	由于exports变量本来就是一个对象，所以下面的写法效果和上面的完全一样：

	```javascript
	exports.process = function(seed,nut,earth)
	{
		nut.message('hello') ;
		return true ;
	}
	```

3. controller 完整的定义方式(较少用到，所以你也可以跳过这个部分)是从 ocplatform/lib/mvc/Controller 类继承(关于occlass的用法在专门的章节里介绍)，它其实和方法2很像，但是你会立刻得到新的Controller类，

	```javascript
	// 载入 Controller 基类
	var Controller = require("ocplatform/lib/mvc/controller/Controller") ;
	
	// 从 Controller 基类中派生出一个子类，然后导出
	module.exports = Controller.extend({
		process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}) ;
	```




## layout

在蜂巢中，layout 用来生成和显示网页上重复出现的固定区域，例如网页顶部的导航条，logo，banner，网页底部的版权声明什么的，有时候还有两侧的一些banner或菜单。

layout实际上就是一个普通的控制器，也需要process()方法，并且生成视图显示在网页上。


### 如何声明 layout

控制器可以通过自己的 "layout" 属性去引用另外一个控制器，然后，自己的视图就会显示在 layout控制器的视图内。

为一个控制器声明layout有以下方法 (或者说控制器的 layout 属性接受的参数类型)：

1. 一个表示 controller path 的字符串，例如：

	```javascript
	module.exports = {
	
		// 用一个路径来引用 layout 
		layout: "ocplatform/lib/mvc/controller/layout/WebLayout.js"
	
		, process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```

2. 一个表示 controller 别名的字符串，例如：

	```javascript
	module.exports = {
	
		// "weblayout" 是 "ocplatform/lib/mvc/controller/layout/WebLayout.js" 的别名
		layout: "weblayout"
	
		, process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```

	这和前面一个里的意义完全一样，"weblayout" 就是 "ocplatform/lib/mvc/controller/layout/WebLayout.js" 的别名

3. 一个将作为 layout 控制器的函数：

	```javascript
	// 你的控制器
	module.exports = {
	
		// 用一个函数来定义一个匿名的 layout 控制器
		layout: function(seed,nut,earth)
		{
			nut.write("from layout") ;
		}
	
		, process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```

4. 用一个完整的 json 定义 layout，这个json的结构你在定义控制器的时候，是完全一样的

	```javascript
	// 你的控制器
	module.exports = {
	
		// 用一个函数来定义一个匿名的 layout 控制器
		layout: {
			process: function(seed,nut,earth)
			{
				nut.write("from layout") ;
			}
		}
	
		, process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```

5. null 和 undefined（默认）是不同的，null表示不要使用 layout， undefined （在你没有提供这个属性时）表示使用默认的 layout ，也就是 "weblayout" 。

	```javascript
	// 你的控制器
	module.exports = {
	
		// 不要使用 layout ，如果缺少 layout属性，默认值是 "weblayout"
		layout: null
	
		, process: function(seed,nut,earth)
		{
			nut.message('hello') ;
			return true ;
		}
	}
	```


layout完全是一个普通的控制器，所以，你既可以用 controller path （或它的别名）来引用一个在其他文件中定义的控制器作为layout，
也可以在 layout属性的冒号后，直接定义一个匿名的控制器；而且，做为匿名控制器，也一样可以被引用到其他控制器里，作为其他控制器的 layout 或 children, action 。
—— 蜂巢的控制器重用性非常的强，他们可以在任何地方执行。

layout 既然只是一个普通的控制器，所以，她也可以提供 process() 函数，动态地生成视图，而不是死板地生成固定内容。

### 控制器 和 layout 的视图关系

控制器“拥有”(has a)layout之间，所以，控制器“了解”layout（耦合），而layout 不“了解”引用它的控制器（解耦）。
layout 甚至不应该知道自己是一个 layout，它只要把自己当做一个普通的控制器去执行即可，这是保证它可以为任何控制器服务的前提——layout对客户必须是解耦的。

但是，它们的视图之间的关系却正好相反，layout的视图“拥有”（has a）控制器的视图，这样一来，控制器的视图，就会在 layout的视图内显示，layout的视图包在控制器的视图外面。

> 高级：由于视图树的装备过程，是在运行时通过反射来实现的，所以layout和客户控制器之间反转的视图“相知”关系，不会破坏 layout 对 客户控制器的解耦状态。

在layout的模板中，放置一个 <views/>标签，控制器的视图就会显示在这个位置；否则显示在 layout 视图的最后。

```html
<!-- 这是网站顶部的菜单 -->
<div class="top-navigation">
	<ul>
		<li>...</li>
		<li>...</li>
		<li>...</li>
	</ul>
</div>

<div class="container">
	<!-- 控制器的视图会显示在这里 -->
	<views />
</div>

<div class="footer">
	...
</div>
```

如果 layout 也拥有 children，那么在layout的模板里，还可以使用 <view name="foo" /> 来指定这个 child 视图的位置，它和 <views /> 不会冲突。

> 高级：<views /> 其实等价于 <view name="*" mode="week" /> ， mode=week 说明这是一个很弱的引用，而 <view name="foo" /> 里默认 mode=soft ，也就是说指定名称的引用，强于被通配符"*"匹配到的引用。
> <view> 和 <views> 没有区别。

### layout 链

一个 layout 也可以有自己的 layout 属性，引用（或定义）另一个控制器，作为自己的 layout 。结果，这些 layout 引用，就形成了一个引用链，直到其中一个layout ，她的 layout 属性为 null。

layout链是一个简单却很使用的机制，蜂巢的很多实现，都依赖这个机制


## children



## action




## controller path

由于蜂巢要求所有的程序都以扩展的形式提供给框架，所以，其实代码都别分存放在 <网站目录>/node_modules 下的各个目录里，node_modules 以外只有一个用于启动系统的index.js 程序。
所以，文件的引用，查找，都是以 node_modules 为根目录的，而不是以网站目录为根目录，这样做是为了完全兼容 nodejs 的 require 路径查找规则。

一个控制器的路径也是如此，它应该是这个样子：

```
<扩展名称>/lib/folder path/<控制器文件名>.js
```

<扩展名称> 就是 <网站目录>/node_modules 目录下的子目录名称。

例如，控制器文件 <网站目录>/node_modules/example/lib/Hello.js , 可以在浏览器地址栏里，通过以下url访问：

```
http://www.your-domain.com/example/lib/Hello.js
```

其中，"lib" 和 ".js" 可以省略，结果就是这样：

```
http://www.your-domain.com/example/Hello
```


### controller path 中的子控制器

由于 layout, child, action ，他们其实也都是再普通不过的控制器，而他们有时候不是在独立的文件中定义，而是在其他的控制器内部面定义的，
因此，我们需要扩展一下 controller path 的格式，以便能够访问到这些“内部控制器”。

controller path 指向一个控制器的成员控制器（layout，child， action），以及这些成员的成员，以及成员的成员的成员（……无限递归中）。
其格式是这样的：

```
<扩展名称>/lib/folder path/Foo.js:bar
```
bar 可以是控制器 Foo 的 child 或 action ，如果同名的 child 和 action 共存（你应该避免），action 优先。

layout 只有一个，不需要命名，所有访问 layout的时候就是这样
```
<扩展名称>/lib/folder path/Foo.js:layout
```

指向成员的成员

```
<扩展名称>/lib/folder path/Foo.js:layout:bar
```

那么下面这种情况，就不用我解释了：

```
<扩展名称>/lib/folder path/Foo.js:layout:layout:bar:ooo:xxx
```

#### “殊途同归”？

你可能已经意识到，在这个机制里，有一个有趣的现象：不同的 controller path 可能指向一个相同的控制器。
举个例子：

```javascript
// 文件: ocxexample/lib/Hello.js
module.exports = function()
{
	process: function(seed,nut,earth)
	{
		nut.message("hello") ;
	}
}
```

```javascript
// 文件: ocxexample/lib/SayHello.js
module.exports = function()
{
	process: function(seed,nut,earth)
	{
		nut.write( "<a href='ocxexample/SayHello:say' direct>say</a>" ) ;
	}
	, action: {
		say: "ocxexample/lib/Hello.js"
	}
}
```

这个例子很能说明问题，控制器 SayHello.js 显示一个链接，点击这个链接，就在网页上执行自己的一个名为"say"的 action，而这个action，实际上引用了另一个控制器 Hello.js 。
结果，你可以直接访问 Hello.js ，也可以在 SayHello.js 的页面上点击链接。

我要说的是，现在有两个不同的 controller path ,他们都指向 Hello.js :

```
ocxexample/Hello.js
ocxexample/SayHello.js:hello
```

这是一个问题吗？对蜂巢来说，不是。蜂巢需要靠 controller path 找到控制器，但不介意它们是否唯一对应。所以，这个现象除了可能会轻微地诱发强迫症外，并没有什么坏处。反而，它让框架变得轻盈、灵活。



### controller path 的用途

controller path 会用在：

1. url 里，蜂巢的路由机制，会从浏览器请求的 url 里识别出 controller path，并执行对应的控制器

2. 程序里引入一个控制器类，例如，你需要引用另一个控制器作为 layout, children, actions 时


### 简化 controller path

为了在url里能够短一点，controller path 可以做一些简化，框架一样能够找到对应的控制器：

1. <扩展名称>/lib 后的目录，如果是"lib" ，那么这 lib 可以省略；

2. 文件的扩展名".js" 可以省略。

例如：

```
ocxblog/lib/blog.js
```

可以简化为：

```
ocxblog/blog
```

当他作为一个 url 的时候，省略版本显得更像一个 url ：
	
```
http://www.youdomin.com/ocxblog/blog
```

> 【约定】我们建议：
>
> 1. 在前端链接的 href 属性里面，尽量使用省略版本的controller path，这样做，无论是对用户（他们有时要复制这些链接，分享给别人）,
> 还是对搜索引擎都更加友好；但是在程序代码里，则尽量使用完整的 controller path ，便于阅读代码的程序员 和 智能IDE（点击一个看上去是路径的字符串，IDE会帮你打开对应的文件）找到对应的文件。
>
> 2. 在搜索引擎可见的链接中，使用一致的 url （当然，最好是省略版本），以便搜索引擎把他们当做同一个url。


### controller path 的别名

TODO ...

###


## 向 layout, children 传递参数


