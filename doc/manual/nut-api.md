[返回文档首页](../../README.md)


## nut 的 API ：

* nut.write(content)
* nut.message(sentence[,args[,type[,title]]])
* nut.error(sentence[,args[,title]])
* nut.success(sentence[,args[,title]])
* nut.danger(sentence[,args[,title]])
* nut.info(sentence[,args[,title]])
* nut.warning(sentence[,args[,title]])
* nut.msgqueue.popup([tplname]) [仅前端可用]
* nut.msgqueue.renderAndAppendTo([eleOrSelector[,callback[,tplname]]]) [仅前端可用]
* nut.model
* nut.buff
* nut.view.disable()
* nut.view.enable()
* nut.title
* nut.keywords
* nut.description
* nut.makeTitle()
* nut.makeKeywords()
* nut.makeDescription()
* nut.crack(callback[,inWebpage])

---

* ___nut.write(content)___

	向浏览器输出内容。

* ___nut.message(sentence[,args[,type[,title]]])___

	创建一条给用户看的消息

	* sentence 消息内容的主体，允许你写更复杂的html内容
	* args (可选)如果提供args参数，相当于：sprintf(sentence,args) 。如果消息中有一些变量，应该把变量拿出来，放在args参数里，这样 sentence 参数就可以保持相同，便于本地化时 和语言包中的语句匹配。
	* type (可选)不同的类型会显示不同的样式。这个参数的值和很多流行的前端框架保持一致（例如 bootstrap），目前支持这些值：
		* undefined (默认)
		* "warning"
		* "error"
		* "info"
		* "success"
	* titile (可选)

	控制器：
	```javascript
	module.exports = function(seed,nut,earth){
		nut.message("hello world",[],"info") ;
		return true ;
	}
	module.exports.__as_controller = true ;
	```
	视图模板：
	```html
	<div>
		<msg>
	</div>
	```

	nut.message() 有5个简化版本（使用更少的参数）：

		* nut.error(sentence[,args[,title]])
		* nut.success(sentence[,args[,title]])
		* nut.danger(sentence[,args[,title]])
		* nut.info(sentence[,args[,title]])
		* nut.warning(sentence[,args[,title]])

* ___nut.msgqueue.popup([tplname])___ [仅前端可用]

	使用tplname指定的模板渲染消息队列中的所有消息，弹出显示，默认在屏幕的右下角，未来会提供更多参数

* ___nut.msgqueue.renderAndAppendTo([eleOrSelector[,callback[,tplname]]])___ [仅前端可用]

	使用tplname指定的模板渲染消息队列中的所有消息，并放入 eleOrSelector 元素，eleOrSelector可以是一个 Dom Element 对象，也可以是一个 jquery selector

* ___nut.model___

	视图的模型，在 nut.model 里设置的属性，在视图模板中做为变量访问。

	控制器：
	```javascript
	module.exports = function(seed,nut,earth){
		nut.model.foo = "bar" ;
		return true ;
	}
	module.exports.__as_controller = true ;
	```
	视图模板：
	```html
	<div>
		<span> {@foo} </span>
	</div>
	```

* ___nut.buff___

	在前端通过ajax请求控制器时，可以通过 nut.buff 访问后端process()执行时，用nut.write()函数写入的数据。

* ___nut.view.disable()___

	禁用视图，执行 nut.craft() 生成html时，忽略视图部分。

* ___nut.view.enable()___

	启用视图

* ___nut.title___

	默认等于控制器options.title，在控制器 process() 函数里为这个属性赋值，

* ___nut.keywords___

	默认等于控制器options.keywords

* ___nut.description___

	默认等于控制器options.description

* ___nut.makeTitle()___

	默认等于控制器options.title

* ___nut.makeKeywords()___

	默认等于控制器options.keywords

* ___nut.makeDescription()__

	默认等于控制器options.description

* ___nut.crack(callback[,inWebpage])___

	根据nut里的内容，渲染出一段最终的html代码。这个函数会由系统自动调用，而且这是一个“最终”函数，你可以调用它的“过程”函数来替代它。




[返回文档首页](../../README.md)