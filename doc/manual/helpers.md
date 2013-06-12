


## log



## db


## fs

fs helper 继承了 nodejs fs 模块的所有API函数，因此可以用 `helper.fs` 替代 `require("fs")` ；fs helper 增加了几个函数：

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


##

