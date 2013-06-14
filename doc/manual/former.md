
# 增删改查

模板: exmaple/templates/form.html
```html


```


控制器：exmaple/lib/form.js
```javascript

module.exports = {

	view: "exmaple/templates/form.html"

	, process: function(seed,nut){
		// 从数据库加载文档填充表单，或显示新文档表单
		helper.former().load(this) ;
	}

	, actions:{

		save: function(seed,nut){
			// 向数据库增加文档
			helper.former().save(this) ;
		}

		, remove: function(seed,nut){
			// 从数据库删除文档
			helper.former().remove(this) ;
		}

		, update: function(seed,nut){
			// 更新数据库里的文档
			helper.former().update(seed) ;
		}

	}

	__as_controller: true
}

```
