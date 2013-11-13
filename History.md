

==================
* fix bug: conflict of root path("/") and bower components routement
* template/view 增加 `<require>` 标签
* remove public/lib/3party (moved to bower)


0.9.7 2013.11.5
==================
* fix bug: forward/backward of frontend histroy for pjax 
* + config.frontend.enableStay
* rename $oc to $opencomb
* supports bower(important!)


0.9.6 2013.10.29
==================

* fixed bug: validation for select element
* + jQuery.fn.validate() 能够处理结果集里的所有元素，而不仅仅是第一个
* 对select multiple=false 元素进行长度校验时，如果 selectedIndex=-1 则返回 0，否则都返回 1
* validator 增加 v:failedclass 属性
* validator 后端实现(unit test)
* + validator: int, num, telnumber, mobilenumber
* 将 bootstrap / jquery-ui/ messenger 从 opencomb 中移除


0.9.5 2013.10.16
==================
* + helper.template.createFromString()

0.9.2
==================

* 取消 __as_controller, 改为注册的方式
* + 约定：controllers 自动注册为controller目录
* 引入 typex(https://github.com/coryandrew1988/overload-jQuery-extension) 库
* + Nut.error()/success()/warning()/info()/danger()
* 重新设计了 Former 的接口和行为，使其更加易用
