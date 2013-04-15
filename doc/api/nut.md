
## nut 的 API ：

* nut.write(content)
* nut.message(sentence[,args[,type[,title]]])
* nut.msgqueue.popup([tplname]) [仅前端可用]
* nut.msgqueue.renderAndAppendTo([eleOrSelector[,callback[,tplname]]]) [仅前端可用]
* nut.model
* nut.view.disable()
* nut.view.enable()
* nut.title
* nut.keywords
* nut.description
* nut.crack(callback[,inWebpage])

---

* ___nut.write(content)___

	向浏览器输出内容

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

* ___nut.msgqueue.popup([tplname])___ [仅前端可用]

	使用tplname指定的模板渲染消息队列中的所有消息，弹出显示，默认在屏幕的右下角，未来会提供更多参数

* ___nut.msgqueue.renderAndAppendTo([eleOrSelector[,callback[,tplname]]])___ [仅前端可用]

	使用tplname指定的模板渲染消息队列中的所有消息，并放入 eleOrSelector 元素，eleOrSelector可以是一个 Dom Element 对象，也可以是一个 jquery selector

* ___nut.model___

	视图的模型

* ___nut.view.disable()___

	禁用视图

* ___nut.view.enable()___

	启用视图

* ___nut.title___

	默认等于控制器options.title

* ___nut.keywords___

	默认等于控制器options.keywords

* ___nut.description___

	默认等于控制器options.description

* ___nut.crack(callback[,inWebpage])___

	根据nut里的内容，渲染出一段最终的html代码。这个函数会由系统自动调用，而且这是一个“最终”函数，你可以调用它的“过程”函数来替代它。

---