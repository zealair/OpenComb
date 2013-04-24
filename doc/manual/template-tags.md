# 标签

* ___<if>___

	* condition， 条件表达式。如果 condiition 属性不是以@开始，会当做字符串而不是表达式。

* ___<elseif>___

	* condition，条件表达式

* ___<else>___

* ___<loop>___

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

* ___<foreach>___

	* for, 对象或数组，需要用@开头，表示该属性是一个表达式
	* key(可选), 元素键名
	* var(可选), 元素指针变量的名称
	
	```javascript
	<foreach for="@['a','b','c']" var="item" key="key">
		<p>{@key} = {@item}</p>
	</foreach>
	```

* ___<continue>___

* ___<break>___

* ___<include>___

	* file 可以是表示模板文件路径的普通字符串，也可以使用@开头，使用一个表达式，表达式的结果当做模板文件的路径
	* model(可选)，引用的模板文件，和当前模板文件的 model 是分离的，当前模板文件中的变量在 include 模板中无法访问，需用用 model 属性传给被引用的模板。


	```javascript
	<!-- include另一个模板文件，将当面模板中的变量整个传第给那个模板 -->
	<include file="example/template/anotherTemplate.html" model="@$model" >
	```
