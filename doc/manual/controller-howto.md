# 简单使用控制器

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

这3个变量构成一组形象的“隐喻”：seed（“种子”）代表控制器的输入，nut（“果实”）代表控制器的输出，而 earth（“土壤”）则为你准备好了控制器所依赖的整个运行环境。

希望这能让你印象深刻，一次就能记住它们，以后再也不用查手册 :)

> [高级] 我们用这3个对象，将你的控制器的所有依赖都“注入”了进来，从而解除了控制器对其依赖的硬耦合（[依赖注入](http://www.google.com/search?q=Dependency%20Injection)）。

### 第1个参数：seed

seed 非常的简单，他是一个哈希数组(键值对)的对象，GET/POST 来的参数，都已经整理好存在里了.

例如当用户访问这个url时： http://127.0.0.1:6060/example/hello?foo=ooo&bar=xxx

在控制器函数里，你会接收的 seed ，是这个样子：

```javascript
seed = {
	foo: "ooo"
	, bar: "xxx"
}
```

如果POST 和 GET 存在同名的参数，POST值会覆盖 GET值 。

seed 对象里只有数据，没有任何方法。


### 第2个参数：nut

nut 主要就是做3件事：输出字符，创建消息，以及设置视图的model

```javascript
module.exports = function(seed,nut,earth)
{
	// 直接向浏览器输出
	nut.write('hello') ;

	// 设置模型变量 "say"，然后就可以在视图模板中使用变量 say
	nut.model.say = 'hello' ;

	// 创建一个消息
	nut.message("hello") ;

	return true ;
}

module.exports.__as_controller = true ;
```

如果在前端浏览器里通过ajax函数($.request()等函数)访问控制器，返回的将是一个完整的 nut 对象。


我们使用nut(“坚果”)这个单词，正是这个意思：在服务器后端执行控制器的时候，
向nut 放入各种类型的东西(消息,模型数据,输出任意字符串)，然后封装进一个“严密”的果壳里。

这个果壳，既可以在后端立刻打开，由服务器渲染生成用户请求的网页(html)；也可以通过ajax 取回到浏览器前端，在前端完成网页的生成渲染。

这是一种简单却强大的开发体验：在后端填充一个nut，在前端 ajax 的回调函数里拿到这个 nut ，使用一致的 api 剥开果壳，取得甜美的果肉！

``` javascript

// 在浏览器中 访问一个控制器的 action
$.request('example/sameController:sameAction',function(nut){

	// 不管 action 返回了什么，总之弹出 alert 给用户看
	nut.msgqueue.popup() ;

	// 或者把这些消息显示到网页上指定的地方
	nut.msgqueue.renderAndAppendTo("div.show-messages") ;

}) ;

```

[详见 nut 的 api](../api/nut.md)

### 第3个参数：earth

* earth.req
* earth.rsn
* earth.session
* earth.session.idmgr
* earth.session.idmgr.current()
* earth.session.idmgr.signin(username)
* earth.session.idmgr.signout(username)
* earth.session.idmgr.id(username)
* earth.session.idmgr.length()
* earth.db
* earth.db.collection(name[,extname])
* earth.db.objectId(stringId)
* earth.hold()
* earth.release()

---

* req 和 rsn 是原始的 http 对象，

* session 是一个对象