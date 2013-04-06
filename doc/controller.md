
## 定义一个controller

写 controller 是你在蜂巢下完成开发工作最主要的任务。controller 是一个类，它必须有一个方法process()，执行一个controller对象，实际上就是执行这个函数。对你来说，controller.process() 函数就是任务执行的入口，而你需要的所有API 和 对象，都会作为process()的参数传给你。

有三种方式定义一个contrller：

1. 最简单的方式，是通过exports变量导出一个函数，这个函数就是controller的process()方法，至于controller类以及其他部分，系统都会帮你处理好。举个栗子：
	
	todo ...

2. 通常还需要为controller提供更多的信息，例如其视图的模板文件，layout,action等（后文将会专门介绍layout和action），这时就需要 exports 一个JSON对象，而方法1所定义的函数，则要作为 JSON 的一项属性：process。这很好理解，对吧？举个栗子：

	todo ...

3. controller 完整的定义方式(较少用到，所以你也可以跳过这个部分)是从 ocPlatform/lib/mvc/Controller 类继承(关于ocClass的用法在专门的章节里介绍)，它其实和方法2很像，但是你会立刻得到新的Controller类，
