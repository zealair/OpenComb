
OpenComb 将所有的辅助系统和工具都放到 helper 对象里了，包括记录日志、数据库、文件操作等等。

helper对象不需要 require() ，可以在源代码里直接访问调用。




---
## log




## db

helper.db 继承了 node-mongo


## fs

helper.fs helper 继承了 nodejs fs 模块的所有API函数，因此可以用 `helper.fs` 替代 `require("fs")` ；fs helper 还增加了几个函数：

### helper.fs.mv(source,destination[,callback])

nodejs 提供的 `fs.rename` 只能用于相同磁盘分区里的文件，在不同分区之间调用 `fs.rename` 会引发`EXDEV`错误， `helper.fs.mv` 能够处理不同的磁盘分区。

`helper.fs.mv` 和 `fs.rename` 的参数一致。

```javascript
helper.fs.mv("/tmp/xhs2123nd","/project/folder/files/filename",function(err){
	// todo ... ...
}) ;
```

### helper.fs.mkdirr(path[,mode[,callback]])

递归地创目录，`helper.fs.mkdirr`(末尾是两个"r") 和 `fs.mkdir` 参数一致，并且只在创建目录失败时报告错误（目录已经存在不报告错误）。


```javascript
helper.fs.mkdirr("/some/folder/name",0777,function(err){
	// todo ... ...
}) ;
```


---

## helper对象的单件和享元

很多 helper 是可以共享的，因此helper对象有四种共享级别：

1. 全局单件，例如 `helper.fs` ；在整个系统中共享同一个对象，它通常都没有状态。

2. 扩展享元，同一个扩展内的源代码访问的helper对象，共享同一个对象；状态在扩展内共享。例如： `helper.db`, `helper.log`。

以 `helper.db` 来说，数据集合(collection)的名称如果省略了扩展名前缀，会自动以源代码所属的扩展名来补充；因此，需要一个扩展共享的 db 对象，不同扩展使用不同的对象；同一个扩展内使用的对象相同。

3. 源代码文件享元。和 “扩展享元”类似，但他以文件为单位，同一个源代码文件内使用相同的对象。

例如，`helper.controller` 和 `helper.template` ，这两个 helper 需要处理 controller 和 template 的相对路径，因此以文件为享元区隔特征。

4. 无共享，每次访问都是一个独立的实例。
