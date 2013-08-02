# Former

Former 是OpenComb框架中最重要的特性之一，Former通过反射视图模板中的&lt;form&gt;,&lt;input&gt;,&lt;select&gt;,&lt;textarea&gt;标签信息，来自动处理对数据表的“增删改查”操作。

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

如你所见，Former 让 MIS 里最常见的工作（“增删改查”）变得如此简单：Former 如何工作，这是由模板文件 form.html 里的&lt;form&gt;标签和&lt;input&gt;等控件标签定义的，不需要你写繁琐又重复的业务代码。

OpenComb 的模板引擎(ocTemplate) 支持完整的jQuery DOM操作，这样一来，你就可以在其他扩展中控制表单(&lt;form&gt;)的结构，从而扩展表单内容，这不需要修改任何源代码。

就是说，你可以在不修改模板(html文件)和控制器(js文件)的源代码的情况下，往任何表单里增加几个控件；系统能够正确地处理这些新表单的“增删改查”各种操作。而做这些事情，jQuery是唯一的工具!

这就是 OpenComb 的风格，我们提供了完全不同的“二次开发”体验。

因此，你应该尽量使用 Former 。


## 创建Former对象

### 为控制器自己&lt;form&gt;创建 Former 对象

最常用的做法是在控制器的`process()`方法里调用 `former()` 方法，就是上面例子里的用法。

former() 函数的原型是：`ControllerInstance.former([formName])`，参数 formName 是模板里面&lt;form&gt;标签的 `name` 属性，通常一个模板只有一个&lt;form&gt;，因此允许省略 formName 参数，表示对应第一个&lt;form&gt; 。


### 为其他控制器的&lt;form&gt; 创建 Former 对象

但是，有时候你需要其他控制器或模板里的Former对象，创建过程为：

```javascript
module.exports = {

	view: "exmaple/templates/bookForm.html"

	, process: function(seed,nut){

		helper.template("exmaple/templates/bookForm.html",this.hold(function(err,tpl){

			// err ...

			var former = new Former(this,tpl) ;

			var doc = former.doc() ;
			console.log("document is ",doc) ;

			// todo ...

		}))
	}
}
```

其过程并不复杂：加载对应的模板，用模板对象作为 Former类构造函数的参数。


> Former 是依赖控制器实例，所以创建Former对象，需要跟正在请求的控制器实例相关。每一个 Former 实例都针对一次控制器请求实例，它们都是一次性的消耗品。


---

## Former 的 API

Former 的最常用的4个方法：

	* save() 将用户提交上来的数据保存进数据库。能够依据是否提交了主键值判断是执行 insert 还是 update；能够处理用户上传来的文件。

	* load() 从数据库里查询对应的文档，并填充表单

	* remove() 从数据库里删除对应的文档

	* validate() 检查用户提交的数据是否合法（参考 Validator 章节）

这4个方法都不是最小可分解的、内聚性的操作，他们是很多操作的集合，你可以单独执行那些操作：

	* fillForm() 用传入的文档对象填充表单

	* doc() 从用户提交来的数据里，根据&lt;form&gt;的定义创建一个文档对象，以便随后保存到数据库，或进行其他操作

	* condition() 根据表单定义的主键信息（&lt;form&gt;的keys属性），从用户提交的数据里创建一个用于数据库find操作的条件对象； save(), load(), remove() 等方法，会调用Former.condition()来创建条件对象。


下面是这些方法的详细的API说明：

### Former.save()

	将用户提交的内容保存到数据库里。如果提交了主键数据，则执行 update, 否则 insert，例如主键为 _id ，则GET/POST数据中存在_id，则执行update。

	save()方法有好几个重载版本：

	* Former.save([opts])
	* Former.save(done[,opts])
	* Former.save(before,done[,opts])

	参数说明：

	* done = function(err,doc) : 执行完成后的回调函数。作为做为回调函数，你应该用 `this.hold()` 对其包装，否则控制器不会等待 done 的触发；当然，也有时候你可能不需要控制器等待 save() 就离开回应用户。

	* before = function(doc) : Former在写入数据库调用，传入的 doc 参数是即将写入数据库的文档对象，你可以在 before 里面更改 doc 里的内容。如果 before 返回 false ，则会终止 save() 操作，并且不会触发 done 。

	* opts ， 参数 opts 和 opts内的所有属性，都是可选的:

		* condition (object) : update 条件，缺省根据&lt;form&gl;标签的keys(缺省:_id)属性，从控制器的seed里面取值创建。

		* keys (string,array,object) : 主键名，可以是一个表示名称的字符串，或是多个字段名称的数组，或者控件名到字段名映射的对象。缺省值等于&lt;form&gt;标签的keys属性。

		* doc (object) : 保存到数据库里的文档对象，缺省通过 Former.doc() 方法自动创建。

		* before (function) : before 参数，你也可以写在 opts 对象里。 作为独立参数的before优先级高于opts内before属性。

		* done (function) : done 参数，你也可以写在 opts 对象里。 作为独立参数的done优先级高于opts内done属性。

		* msg.insert.success="内容已经保存成功" (string) : 执行insert成功的消息文本

		* msg.insert.error="系统在保存内容时遇到错误" (string) : 执行insert出错时的消息文本

		* msg.insert.duplicate="保存的内容已经存在" (string) : 执行insert时遇到唯一索引重复的消息文本

		* msg.update.success="内容已经保存成功" (string) : 执行update成功的消息文本

		* msg.update.error="系统在保存内容时遇到错误" (string) : 执行update出错的消息文本

		* msg.update.fail="内容没有保存，可能是因为指定的文档并不存在" (string) : 执行update但没有存储任何内容时的消息文本

		* msg.update.duplicate="保存的内容已经存在" (string) : 执行update时遇到唯一索引重复的消息文本

		* msg.upload.file.success 参考 Former.saveFile() 方法

		* msg.upload.file.error 参考 Former.saveFile() 方法

		* func.file.archive 参考 Former.saveFile() 方法

		> 以上所有的属性都是完整的字符串， `opts["msg.upload.file.error"]` 而不是 `opts.msg.upload.file.error`

### Former.saveFile()

	保存用户上传的文件。saveFile()会根据&lt;form&gl;里的&lt;input type="file"&gl;控件，将上传上来的文件归档到对应的目录内，并在 doc 对象里的对应字段上记录归档后的路径。

	save()方法会自动调用saveFile()方法，因此通常你不必主动调用saveFile()，但如果你暂时不想将数据保存到数据库，只想将文件归档到对应目录里，可以单独使用这个函数。重复调用saveFile()，回调函数done回到一个文件系统找不到文件的错误（第一次执行saveFile()对文件归档时已经将文件转移走了）。

	saveFile() 的重载版本：

	* function([opts])

	* function(doc,[opts])

	* function(done,[opts])

	* function(doc,done,[opts])

	参数说明：

	* done=function(err,doc) : 执行完成后的回调函数。同样 done 需要 `this.hold` 已确保控制器等待 done 触发后回应用户（参考 Former.save() 参数 done）。

	* doc : 用于保存的文档对象，缺省通过 Former.doc() 方法创建

	* opts 对象的可用属性：

		* done=function(err,doc) : done 参数，你也可以写在 opts 对象里。 作为独立参数的done优先级高于opts内done属性。

		* doc : doc 参数，你也可以写在 opts 对象里。 作为独立参数的doc优先级高于opts内doc属性。

		* msg.upload.file.success="上传文件：%s" (string) : 上传文件成功的消息文本, 消息参数： [<文件名>] 。

		* msg.upload.file.error="系统在上传文件时遇到错误：%s" (string) : 上传文件遇到错误的消息文本, 消息参数： [<文件名>] 。

		* func.file.archive ( function(file,callback) ) : 文件归档函数，默认函数会将上传的文件归档到: <root dir>/public/files/<year>/<month>/<hash>!<文件名> ，你可以在 opts 里提供这个函数改变系统缺省的行为

			该函数收到的file参数是一个对象：

				* name: 原始文件名

				* path: 上传到服务器后的临时存放路径（你需要在归档后删除他）

		> 以上所有的属性都是完整的字符串， `opts["msg.upload.file.error"]` 而不是 `opts.msg.upload.file.error`


### Former.remove()

### Former.load()

    从数据库里加载文档并填充表单。数据库find()操作的条件用

### Former.doc()



### Former.validate()

### Former.fillForm()




---

## 标签属性

Former 的秘密都集中在模板的标签上。

### &lt;form&gt; 标签可用的属性

Former 通过 &lt;form&gt; 标签的属性获悉数据表信息。

* [必须] collection 数据表名称，如果缺少这个属性，Former 不会做任何操作。
	&gt; 在你debug的时候，应该优先检查这个属性

* [可选] keys='_id', Former.load()/save()/remve() 等操作查找doc的主键，可以是一个普通属性值表示字段名称（默认为 _id），也可以是一个表达式，返回数组格式的多个字段名称。

```javascript
<!-- 两个字段作为数据库查询依据 -->
<form collection="books" keys="@['author','bookName']">
	... ...
</form>
```

* [可选] autoIncreaseId, 自增型主键名称。

* [可选] name, 表单的名称，一个模板里可能有多个&lt;form&gt;，创建Former对象时可以指定&lt;form&gt;的名称

### &lt;input&gt;, &lt;textarea&gt;, &lt;select&gt; 标签可用的属性

Former 从 &lt;form&gt; 内的输入控件（&lt;input&gt;, &lt;textarea&gt;, &lt;select&gt; 等标签）中搜集对应的文档（document）字段信息。

* [必须] name 该&lt;input&gt;(或 &lt;textarea&gt;, &lt;select&gt;)对应的文档(document)字段。如果缺少name属性，Former 忽略该输入控件
	&gt; 在你debug的时候，应该优先检查这个属性

* [可选] value, 输入控件的默认值，如果执行过 Former.load()/fillForm()，则文档中的数据会替代value中的值。

#### Former 支持的输入控件类型：

* &lt;input type="text" &gt;

* &lt;input type="hidden" &gt;

* &lt;input type="radio" &gt;

* &lt;input type="checkbox" &gt;

	Former 会将该控件内的值保存为一个数组

* &lt;select&gt;

* &lt;select list&gt;

	如果控件的属性 multiple="multiple",Former 会将该控件内的值保存为一个数组

* &lt;textarea&gt;


其他形式的html高级输入控件（例如富文本编辑器），实际上可以通过 &lt;input type="hidden"&gt; 将和 Former 协作。
