
# API：控制器属性

* __view__ string/null/undefined

    视图模板的路径，例如 `"example/templates/hello.html"`.

    view 属性等于 null和省略具有不同的意义:
        * view = null ,表示不使用视图
        * view = undefined 或省略，会从定义结构的上级控制器继承view值

* ___layout___ string/function/object

    layout属性将另一个控制器作为当前控制器的显示“外框”，当前控制器输出的内容会被嵌入自己的layout控制器内。任何控制器都可以作为其他控制器的 layout 。

    layout 属性支持以下类型：

    * 字符串类型，作为`控制器路径`引用另一个文件中定义的控制器

    * function类型，作为控制器的 `process()` 函数，直接定义一个控制器

    * 以及完整的控制器定义对象（和当前控制器形成递归关系）

* ___children___ object

    children 是一个对象，每项成员都是一个控制器，类型和 layout 属性一致；成员对应的属性名称是该控制器的名称。

* ___actions___ object

    和 children 属性一致

* ___title___ string

    控制器的说明标题，也可以在 process() 函数内，动态地设置给 nut.title 。通常用于 html 的<title>标签

* ___titleTemplate___ string

    标题的模板，只有作为其他控制器的 layout 时用到

* ___keywords___ array

    控制器的关键词，通常用于 html 的 <meta name="keywords"> 标签

* ___description___ string

    控制器的描述，通常用于 html 的 <meta name="description"> 标签


