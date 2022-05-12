if(self.Lib == undefined){
	Lib = new Object;
}

(function(){

	var gXMLHttpRequests = [];
	
	function clear_http_requests(){
		gXMLHttpRequests = [];
	}
	
	function download(url, param){
		if(param == undefined){
			param = {}
		}
		var method       = param.method      == undefined ? "GET"          : param.pemthod;
		var onsuccess    = param.onsuccess   == undefined ? Lib.do_nothing : param.onsuccess;
		var onerror      = param.onerror     == undefined ? Lib.do_nothing : param.onerror;
		var onrequest    = param.onrequest   == undefined ? Lib.do_nothing : param.onrequest;
		var onprogress   = param.onprogress  == undefined ? Lib.do_nothing : param.onprogress;
		var asynchronous = param.synchronous == undefined ? true           : !param.synchronous;
		var postdata;
		if(param.postdata != undefined){
			method = "POST";
			postdata = param.postdata;
		}else{
			postdata = "";
		}
		
		if(param.include_filter == undefined){
			return asynchronous_get(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, postdata);
		}else{
			return asynchronous_get_with_include(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, param.include_filter);
		}
	}
	
	function asynchronous_get(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, postdata){
		var e;
		var request = create_http_request();
		if(!request){
			onerror("Ajax not available");
		}
		try{
			request.open(method, url, asynchronous);
		}catch(e){
			onerror(e);
		}
		
		var result = null;
		
		request.onreadystatechange = function() {
			onprogress(request);
			if(request.readyState != 4){
				return;
			}
			if(request.status == 200){
				result = request.responseText;
				onsuccess(request.responseText);
			}else{
				onerror("onerror(" + request.status + ") : " + request.statusText, request.status);
			}
//			request.abort();
			gXMLHttpRequests.push(request);
		};
		onrequest(request);
		
		try{
			request.send(postdata);
			if(asynchronous == false){
				return result;
			}
		}catch(e){
			onerror(e);
			return null;
		}
	}
	
	function join_including_files(including_data, filename){
		var parsed_text = including_data.files[filename];
		var ret = "";
		for(var i = 0; i < parsed_text.length - 1; i ++){
			ret += parsed_text[i].text + join_including_files(including_data, parsed_text[i].filename);
		}
		ret += parsed_text[parsed_text.length - 1].text;
		return ret;
	}
	
	function simple_include_filter(text, regexp){
		var match = regexp.exec(text);
		if(match){
			return [
				text.substring(0, match.index > 0 ? match.index : 0),
				match[1],
				text.substring(regexp.lastIndex),
			];
		}else{
			return null;
		}
	}
	
	function asynchronous_get_with_include_recursive(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, include_filter, including_data, included_from){
		included_from = Lib.clone_object(included_from);
		included_from[url] = true;
		
		asynchronous_get(method, url, function(text){
			including_data.waiging_count --;
			var match;
			var parsed_text = [];
			including_data.files[url] = parsed_text;
			while(match = include_filter(text)){
				var including_file = match[1];
				if(included_from[including_file]){
					alert("looped including");
				}
				parsed_text.push({
					text: match[0],
					filename: including_file
				});
				text = match[2];
				if(!including_data.files[including_file]){
					asynchronous_get_with_include_recursive(method, including_file, onsuccess, onerror, onrequest, onprogress, asynchronous, include_filter, including_data, included_from);
				}
			}
			parsed_text.push({
				text: text
			});
			if(including_data.waiging_count == 0){
				onsuccess(join_including_files(including_data, including_data.main));
			}
		}, onerror, onrequest, onprogress, asynchronous);
		
		including_data.waiging_count ++;
	}
	
	function asynchronous_get_with_include(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, include_filter){
		var including_data = {main: url, waiging_count: 0, files: {}};
		var included_from = {};
		if(include_filter.type == "string"){
			var regexp = include_filter;
			include_filter = function(text){
				return simple_include_filter(text, regexp);
			}
		}
		asynchronous_get_with_include_recursive(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, include_filter, including_data, included_from);
	}


	function create_http_request(){
		if(gXMLHttpRequests.length > 0){
			return gXMLHttpRequests.pop();
		}
		if(XMLHttpRequest){
			return new XMLHttpRequest();
		}else if(window.ActiveXObject){
			try {
				return new ActiveXObject("Msxml2.XMLHTTP");
			}catch(e) {
				try{
					return new ActiveXObject("Microsoft.XMLHTTP");
				}catch(e2) {
					return null;
				}
			}
		}else if(window.XMLHttpRequest){
			return new XMLHttpRequest();
		}else{
			return null;
		}
	}
	
	Lib.download = download;
	
})();

