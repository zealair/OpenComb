
exports.fillWidget = function(widget,model,defaultValue)
{
	return (model && model[ widget.name ]!==undefined) ?
						model[ widget.name ] :
						defaultValue ;
}

exports.toDoc = function()
{

}
