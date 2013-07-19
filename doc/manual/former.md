# Former

Former 是OpenComb框架中最重要的特性之一，Former通过反射视图模板中的<form>,<input>,<select>,<textarea>标签信息，来自动处理对数据表的“增删改查”操作。

## 一个简单的例子

模板: exmaple/templates/bookForm.html
```html
<form method="post" collection="books" action="exmaple/book?_id={@$model._id}">

	<div>
		书名：<input type="text" name="name" />
	</div>

	<div>
		作者：<input type="text" name="author" />
	</div>

	<div>
		ISBN：<input type="text" name="isbn" />
	</div>

	<div>
		<input type="submit" name="保存" />
	</div>

</form>
```

控制器：exmaple/controllers/book.js
```javascript
module.exports = {

	view: "exmaple/templates/bookForm.html"

	, process: function(seed,nut){

		// 如果请求网页时提供 _id 参数，则从数据库内加载对应的记录，并用来填充表单，提交表单可在数据表里修改对应的记录
		// 否则，现实一个空的表单，提交后新建一笔记录
		nut.model._id = seed._id ;

		this.former().load(this.hold()) ;
	}

	, actions:{
		// 保存数据
		save: function(seed,nut){
			this.former().save(this.hold()) ;
		}

		, remove: function(seed,nut){
			// 从数据库删除文档
			this.former().remove(this.hold()) ;
		}

	}

}
```

如你所见，Former 让 MIS 里最常见的工作（“增删改查”）变得如此简单，Former 会如何工作，是由模板文件 form.html 里的标签决定。

而 OpenComb 的模板引擎(ocTemplate) 支持完整的jQuery DOM操作，这样一来，你就可以在其他扩展中控制模板文件中表单(<form>)的结构，从而扩展表单内容，这不需要修改任何源代码。

因此，你应该尽量使用 former 。



## 标签属性

Former 的秘密都集中在模板的标签上。

### <form> 标签可用的属性

Former 通过 <form> 标签的属性获悉数据表信息。

* [必须] collection 数据表名称，如果缺少这个属性，Former 不会做任何操作。
	> 在你debug的时候，应该优先检查这个属性

* [可选] keys='_id', Former.load()/save()/remve() 等操作查找doc的主键，可以是一个普通属性值表示字段名称（默认为 _id），也可以是一个表达式，返回数组格式的多个字段名称。

```javascript
<!-- 两个字段作为数据库查询依据 -->
<form collection="books" keys="@['author','bookName']">
	... ...
</form>
```

* [可选] autoIncreaseId, 自增型主键名称。

* [可选] name, 表单的名称，一个模板里可能有多个<form>，创建Former对象时可以指定<form>的名称

### <input>, <textarea>, <select> 标签可用的属性

Former 从 <form> 内的输入控件（<input>, <textarea>, <select> 等标签）中搜集对应的文档（document）字段信息。

* [必须] name 该<input>(或 <textarea>, <select>)对应的文档(document)字段。如果缺少name属性，Former 忽略该输入控件
	> 在你debug的时候，应该优先检查这个属性

* [可选] value, 输入控件的默认值，如果执行过 Former.load()/fillForm()，则文档中的数据会替代value中的值。

#### Former 支持的输入控件类型：

* <input type="text" >

* <input type="hidden" >

* <input type="radio" >

* <input type="checkbox" >

* <select>

* <select list>

* <textarea>


其他形式的html高级输入控件（例如富文本编辑器），实际上可以通过 <input type="hidden"> 将和 Former 协作。
