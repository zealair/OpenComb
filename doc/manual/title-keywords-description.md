[返回文档首页](../../README.md)

系统会在执行控制器的 process()函数之前，将控制器定义options中的 title, keywords, description 属性复制到 nut 里，
开发者可以在process()函数中动态修改 nut 里面的这三项属性，或保持固定值。

系统在生成网页时，使用 nut 中的值，而不是 options 里面的。

```javascript
module.exports = {

	title: 'foo'
	, keywords: ['foo','bar']
	, description: 'foo bar'

	, process: function(seed,nut,earth)
	{
		console.log( nut.title, nut.keywords, nut.description ) ;

		// 根据执行情况，动态改变 title, keywords, description
		nut.title = 'ooo' ;
		nut.keywords.push('xxx') ;
		nut.description = "ooxx" ;

		return true ;
	}
}

module.exports.__as_controller = true ;
```

系统还会将控制器 nut 里面的属性值和 layout 里面的做合并处理，也就是说，网页的title 等属性，还会受 layout的影响。

对 layout 的处理，这三个属性各有不同

## 关键词

keywords是一个数组，系统会将控制器的nut.keywords属性，和layout链上所有的nut.keywords属性合并，然后用“,”拼接。

## 描述

系统会依次找控制器和layout链上的所有nut.description属性，直到第一个不为空的值，用于网页的 description

## 标题

title 稍微复杂一点。

layout 的 options 和 nut 还可以使用一个额外的属性 `titleTemplate`，`titleTemplate`字符串里必须有`%s`记号，否则无效。

title 的具体套用规则是：

* 首先在控制器的 nut.title, 和 layout的 nut.title, nut.titleTemplate 三者之间确定 title。
	* 如果控制器的nut.title为空，则使用layout的nut.title
	* 如果控制器的nut.title非空，layout的nut.titleTemplate有效，则用控制器的nut.title替换layout的nut.titleTemplate
	* 如果控制器的nut.title非空，layout的nut.titleTemplate无效或为空，直接使用控制器的 nut.title

* 然后将结果临时作为 layout 的 title，再和 layout 的 layout 计算

在 layout链上 递归下去，最后的结果作为网页的 title



[返回文档首页](../../README.md)