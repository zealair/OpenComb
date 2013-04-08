
##hello world




## 目录结构约定



	opencomb目录/
		index.js
		config.js
		node_modules/
			你的项目目录/
				你的文件
				...				
			蜂巢依赖的其他模块
			...
	

## API 文档

### 1. 控制器

#### 定义一个controller

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

    

### 2. 视图和模板


### 3. 前端


