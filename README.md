![opencomb logo](doc/images/logo.png)

蜂巢(OpenComb)
===

蜂巢(OpenComb) 不只是一个 Node.js 的 Web 框架。


```javascript
module.exports = function(seed,nut,earth)
{
	nut.write("hello world") ;
	return true ;
}
module.exports.__as_controller = true ;
```

## 快速开始

在 `~/opencomb` 目录下部署蜂巢

```
npm i opencomb && cd ~/opencomb
```

安装 blog 扩展

```
npm i ocxblog
```

启动蜂巢

```
node index.js
```

在浏览器里访问 url `http://127.0.0.1:6060`


## 特性

* 最小程度更新网页，而不是刷新整个网页
* 服务器仅向前端传送数据
* 支持浏览器的History和地址栏
* 对搜索引擎友好，不干扰SEO
* 控制器（以及视图）能够自由组合
* 模板引擎在后端支持jQuery操作
* AOP
* 完全基于扩展
* 响应式布局(Responsive Layout)
* 内容协商(Content Negotiation)
* 兼容 PC/移动设备 的不同屏幕尺寸和体验


## 概念和原则


1. 扩展驱动

* “一切皆扩展” —— 所有的功能都由扩展来提供，

* 对扩展进行扩展，

2. 拒绝修改源代码

3. 面向二次开发

4. 简单而优雅

5. 重视体验

	蜂巢同时重视开发体验和用户体验。

6. 敏捷同时健壮

	敏捷：
		* 约定优于配置
		* 工作总是从写一个函数开始
		* jQuery 前端/后端(模板)

	健壮：
		* 配置高于约定
		* 依赖注入
		* 高内聚的控制器
		* 低耦合的控制器组合
		* Dont Repeat Your Self !


7. 拥抱社区






---

## 文档目录

### 开发者手册

1. 安装和部署

2. 控制器

3. 视图和模板

4. 前端开发

5. 扩展

### API

	* 控制器
		* earth
		* nut
	* 模板
	* 前端 API







