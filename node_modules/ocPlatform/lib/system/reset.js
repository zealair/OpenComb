
Error.prototype.toString = function()
{
	// Error.stack 会调用 toString
	if(this.toStringCalling)
	{
		return '' ;
	}
	this.toStringCalling = true ;

	var string = this.name + ": " + this.message + "\r\n" ;
	if(this.lineNumber!==undefined || this.fileName!==undefined)
	{
		string+= "    line: "+ this.lineNumber + " file: "+this.fileName + "\r\n"
	}
	string+= this.stack + "\r\n" ;


	// 错误链
	if(this.cause)
	{
		string+= "\r\n  cause> " + this.cause.toString() ;
	}


	// 错误队列
	if(this.prev)
	{
		string+= "\r\n------------------------\r\n\r\n" + this.prev.toString() ;
	}

	delete this.toStringCalling ;

	return string ;
}
