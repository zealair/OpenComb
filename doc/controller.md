

## 定义一个controller


有三种方式定义一个contrller：

1. 最简单的方式，是exports一个函数，这个函数就是一个contrller，例如：
		todo ...

2. 通常还需要为controller提供更多的信息，例如其视图的模板文件，layout,action等（后文将会有专门的介绍），这时就需要 exports 一个JSON对象，而方法1所定义的函数，需要作为exports 的一项属性：process .例如

3. controller 完整的定义方式(较少用到，所以你也可以跳过这个部分)是从 ocPlatform/lib/mvc/Controller 类继承(关于ocClass的用法在专门的章节里介绍)，它其实和方法2很像，但是你会立刻得到新的Controller类，
