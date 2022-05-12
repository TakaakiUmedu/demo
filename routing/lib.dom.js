
if(self.Lib == undefined){
	Lib = new Object();
}

(function(){
	function elem(name, attributes){
		var element = document.createElement(name);
		if(attributes != null){
			for(var a_name in attributes){
				if(a_name == "style"){
					var style = attributes[a_name]
					for(var s_name in style){
						element.style[s_name] = style[s_name];
					}
				}else{
					element[a_name] = attributes[a_name];
				}
			}
		}
		if(arguments.length > 2){
			for(var i = 2; i < arguments.length; i ++){
				add(element, arguments[i]);
			}
		}
		return element;
	}
	function text(str){
		return document.createTextNode(str);
	}
	function add(element){
		for(var i = 1; i < arguments.length; i ++){
			var item = arguments[i];
			if(item != null){
				if(typeof(item) == "string" || typeof(item) == "number"){
					item = text(item);
				}
				element.appendChild(item);
			}
		}
	}
	
	function clear(element){
		var c;
		while(c = element.firstChild){
			element.removeChild(c);
		}
	}
	
	function has_class(element, value){
		return element.className != undefined && (" " + element.className + " ").indexOf(" " + value + " ") >= 0;
	}
	
	function append_class(element, value){
		if(element.className == undefined || element.className == ""){
			return element.className = value;
		}else if(has_class(element, value)){
			return element.className;
		}else{
			return element.className += " " + value;
		}
	}

	function delete_class(element, value){
		if(element.className == undefined || element.className == ""){
			return "";
		}else{
			var classNames = element.className.split(" ");
			var new_classNames = [];
			for(var i = 0; i < classNames.length; i ++){
				var name = classNames[i];
				if(name.length > 0 && name != value){
					new_classNames.push(name);
				}
			}
			return element.className = new_classNames.join(" ");
		}
	}
	
	
	Lib.Dom = {
		elem: elem,
		text: text,
		add: add,
		clear: clear,
		has_class: has_class,
		append_class: append_class,
		delete_class: delete_class,
	}
	
})();
