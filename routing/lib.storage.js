if(self.Lib == undefined){
	Lib = new Object;
}
(function(){
	
	function Storage(storage, base){
		if(storage == null){
			this.storage = localStorage;
		}else{
			this.storage = storage;
		}
		if(base == null){
			var pathname = window.location.pathname;
			var match = pathname.match(/\/[^\/]+$/);
			if(match != null){
				base = window.location.pathname.substr(0, match.index + 1);
			}else if(pathname.match(/\/$/) != null){
				base = window.location.pathname;
			}else{
				base = window.location.pathname + "/";
			}
		}
		this.base = base;
	}
	Storage.prototype = {
		save: function(name, obj){
			this.storage.setItem(this.base + name, JSON.stringify(obj));
		},
		load: function(name){
			var data = this.storage.getItem(this.base + name);
			if(data != null){
				return JSON.parse(data);
			}else{
				return null;
			}
		},
		save_form: function(name, id){
			if(id == null){
				id = name;
			}
			var form = document.getElementById(id);
			if(form != null){
				var table = {};
				Lib.for_all_children(form, function(element){
					var name = get_element_name(element);
					if(name != null && element.value != null){
						table[name] = element.value;
					}
				});
				this.save(name, table);
			}
		},
		load_form: function(name, id){
			if(id == null){
				id = name;
			}
			var form = document.getElementById(id);
			if(form != null){
				var table = this.load(name);
				if(table != null){
					Lib.for_all_children(form, function(element){
						var name = get_element_name(element);
						if(name != null && table[name] != null){
							element.value = table[name];
						}
					});
				}
			}
		},
	}
	
	var INPUTS_TO_BE_SAVED = {
		text: true,
		number: true,
	};
	
	function get_element_name(element){
		if(element.tagName == "INPUT"){
			if(!INPUTS_TO_BE_SAVED[element.type]){
				return null;
			}
		}else if(element.tagName != "SELECT"){
			return null;
		}
		if(element.name != null && element.name != ""){
			return element.name;
		}
		if(element.id != null && element.id != ""){
			return element.id;
		}
		return null;
	}
	
	
	Lib.Storage = Storage;
})();
