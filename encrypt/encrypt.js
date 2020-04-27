(function(){
	function clear(element){
		while(element.firstChild){
			element.removeChild(element.firstChild);
		}
	}
	
	var ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	var LOWER2INDEX = {};
	var UPPER2INDEX = {};
	
	function create_element(name, attributes){
		var element = document.createElement(name);
		if(attributes){
			for(var name in attributes){
				if(name == "style"){
					for(var style in attributes["style"]){
						element.style[style] = attributes["style"][style];
					}
				}else{
					var value = attributes[name];
					if(name == "className"){
						name = "class";
					}
					element.setAttribute(name, value);
				}
			}
		}
		for(var i = 2; i < arguments.length; i ++){
			var child = arguments[i];
			if(typeof(child) == "string"){
				element.appendChild(document.createTextNode(child));
			}else{
				element.appendChild(child);
			}
		}
		return element;
	}
	
	var replace_list;
	
	function make_span(c){
		var span = create_element("span", {className: "not_assigned"}, c);
		span.dataset.c = c;
		return span;
	}
	
	function clear_dst(){
		var dst = document.getElementById("dst");
		clear(dst);
	}
	
	function encrypt(){
		var src = document.getElementById("src").value;
		var dst = document.getElementById("dst");
		clear_dst();
		var dst_str = "";
		var cur_word = null;
		for(var i = 0; i < src.length; i ++){
			var s = src[i];
			var index_l = LOWER2INDEX[s];
			var index_u = UPPER2INDEX[s];
			if(index_l == undefined && index_u == undefined){
				dst.appendChild(document.createTextNode(s));
				cur_word = null;
				if(s == ' ' || s == '.'){
					dst_str += s;
				}
			}else{
				var index = (index_l != undefined ? index_l : index_u);
				var c = replace_list[(index + (mode == MODE_Polyalphabetic ? i : 0)) % ALPHABETS.length];
				if(index_l != undefined){
					c = c.toLowerCase();
				}
				if(cur_word == null){
					cur_word = document.createElement("span");
					cur_word.className = "word";
					dst.appendChild(cur_word);
				}
				cur_word.appendChild(make_span(c));
				dst_str += c;
			}
		}

		var counts_1 = {};
		var counts_2 = {};
		var counts_3 = {};
		for(var i = 0; i < dst_str.length; i ++){
			var c = dst_str[i];
			if(c == ' '){
				c = '_';
			}
			if(c != '_' && c != '.'){
				if(counts_1[c] == undefined){
					counts_1[c] = 1;
				}else{
					counts_1[c] ++;
				}
			}
			if(i > 0){
				var c0 = dst_str[i - 1];
				c = (c0 == ' ' ? '_' : c0) + c;
				if(counts_2[c] == undefined){
					counts_2[c] = 1;
				}else{
					counts_2[c] ++;
				}
				if(i > 1){
					var c0 = dst_str[i - 2];
					c = (c0 == ' ' ? '_' : c0) + c;
					if(counts_3[c] == undefined){
						counts_3[c] = 1;
					}else{
						counts_3[c] ++;
					}
				}
			}
		}
		make_graph("graph_1", "出現回数", counts_1);
		make_graph("graph_2", "出現回数(2文字)", counts_2);
		make_graph("graph_3", "出現回数(3文字)", counts_3);

		hide_src_panel();
	}
	
	function make_graph(id, caption, data){
		var list = [];
		var max = 0;
		for(var c in data){
			var count = data[c];
			list.push([c, count]);
			if(max < count){
				max = count;
			}
		}
		list.sort(compare_func);

		var item_count = ALPHABETS.length > list.length ? list.length : ALPHABETS.length;

		var graph = document.getElementById(id);
		clear(graph);
		graph.appendChild(create_element("caption", null, caption));

		for(var i = 0; i < item_count; i ++){
			var c = list[i][0];
			var count = list[i][1];
			var tr = create_element("tr");
			var td = create_element("td", null);
			for(var j = 0; j < c.length; j ++){
				td.appendChild(make_span(c[j]));
			}
			td.appendChild(document.createTextNode(":" + count));
			tr.appendChild(td);
			var width = parseInt(GRAPH_WIDTH * count / max);
			tr.appendChild(create_element("td", {style: {
				backgroundColor: "cyan", 
				width: "" + width + "px", 
				borderColor: "white", 
				borderWidth: "0 " + (GRAPH_WIDTH - width) + "px 0 0"
			}}));
			graph.appendChild(tr);
		}
	}
	
	
	var GRAPH_WIDTH = 50;
	
	function compare_func(a, b){
		if(a[1] < b[1]){
			return 1;
		}else if(a[1] > b[1]){
			return -1;
		}else{
			if(a[0] > b[0]){
				return 1;
			}else if(a[0] < b[0]){
				return -1;
			}else{
				return 0;
			}
		}
	}
	
	function set_event_listener(id, event, listener){
		document.getElementById(id).addEventListener(event, listener, false);
	}
	
	var prev_updated_input, prev_update_input_value;
	
	function update_guess(event){
		if(event.target == prev_updated_input && event.target.value == prev_update_input_value){
			return;
		}
		
		prev_update_input_value = event.target.value;
		prev_updated_input = event.target;
		var table;
		
		if(mode == MODE_CAESAR){
			var value = document.getElementById("guess_A").value[0];
			var shift = (value == undefined ? undefined : ALPHABETS.indexOf(value.toUpperCase()));
			if(shift != undefined && shift >= 0){
				table = {};
				for(var i = 0; i < ALPHABETS.length; i ++){
					var c = ALPHABETS[i];
					var value = ALPHABETS[(i + shift) % ALPHABETS.length];
					var input = document.getElementById("guess_" + c);
					input.value = value;
					table[value.toUpperCase()] = c.toUpperCase();
					table[value.toLowerCase()] = c.toLowerCase();
				}
			}else{
				for(var i = 0; i < ALPHABETS.length; i ++){
					var input = document.getElementById("guess_" + ALPHABETS[i]);
					if(input != event.target){
						input.value = '';
					}
				}
			}
		}else{
			var table_org = [];
			for(var i = 0; i < ALPHABETS.length; i ++){
				var c = ALPHABETS[i];
				var input = document.getElementById("guess_" + c);
				var value = input.value[0];
				if(value != null){
					value = value.toUpperCase();
				}
				table_org[i] = value;
			}
			if(mode == MODE_Substitution){
				table = {};
				for(var i = 0; i < ALPHABETS.length; i ++){
					var value = table_org[i];
					if(value != undefined){
						var c = ALPHABETS[i];
						table[value] = c;
						table[value.toLowerCase()] = c.toLowerCase();
					}
				}
			}else{
				table = [];
				for(var i = 0; i < ALPHABETS.length; i ++){
					table[i] = {};
					
					for(var j = 0; j < ALPHABETS.length; j ++){
						var c = ALPHABETS[j];
						var value = table_org[(j + i) % ALPHABETS.length];
						if(value != undefined){
							table[i][value] = c;
							table[i][value.toLowerCase()] = c.toLowerCase();
						}
					}
				}
			}
		}
		
		var dst = document.getElementById("dst");
		var i = 0;
		for(var word = dst.firstChild; word != null; word = word.nextSibling){
			if(word.nodeType == 3){
				i ++;
				if(i >= ALPHABETS.length){
					i = 0;
				}
			}else{
				for(var span = word.firstChild; span != null; span = span.nextSibling){
					var c = span.dataset.c;
					var value;
					if(table != undefined){
						if(mode == MODE_Polyalphabetic){
							value = table[i][c];
						}else{
							value = table[c];
						}
					}
					if(span.className == "not_assigned"){
						if(value != undefined){
							span.firstChild.nodeValue = value;
							span.className = "assigned";
						}
					}else{
						if(value == undefined){
							span.firstChild.nodeValue = span.dataset.c;
							span.className = "not_assigned";
						}
					}
					i ++;
					if(i >= ALPHABETS.length){
						i = 0;
					}
				}
			}
		}
	}
	
	function create_replace_list(){
		if(mode == MODE_CAESAR){
			var shift = 1 + Math.floor(Math.random() * (ALPHABETS.length - 1));
			replace_list = [];
			for(var i = 0; i < ALPHABETS.length; i ++){
				replace_list[i] = ALPHABETS[(i + shift) % ALPHABETS.length];
			}
		}else{
			do{
				replace_list = [].concat(ALPHABETS);
				for(var i = 0; i < ALPHABETS.length; i ++){
					var j = Math.floor(Math.random() * ALPHABETS.length);
					var tmp = replace_list[j];
					replace_list[j] = replace_list[i];
					replace_list[i] = tmp;
				}
				var failed = false;
				for(var i = 0; i < ALPHABETS.length; i ++){
					if(replace_list[i] == ALPHABETS[i]){
						failed = true;
						break;
					}
				}
			}while(failed);
		}
		
		replace_table = {};
		for(var i = 0; i < ALPHABETS.length; i ++){
			var src = ALPHABETS[i];
			var dst = replace_list[i];
			replace_table[src] = dst;
		}
	}
	
	function create_replace_table_column(title, list, offset){
		if(offset == undefined){
			offset = 0;
		}
		var tr = create_element("tr");
		tr.appendChild(create_element("th", null, title));
		
		for(var i = 0; i < list.length; i ++){
			tr.appendChild(create_element("td", null, list[(i + offset) % list.length]));
		}
		return tr;
	}
	
	function create_replace_table(){
		var table = document.getElementById("table");
		clear(table);
		
		create_replace_list();
		
		table.appendChild(create_replace_table_column("置換元", ALPHABETS));
		if(mode == MODE_Polyalphabetic){
			for(var i = 0; i < ALPHABETS.length; i ++){
				table.appendChild(create_replace_table_column("置換先" + (i + 1), replace_list, i));
			}
		}else{
			table.appendChild(create_replace_table_column("置換先", replace_list));
		}
	}
	
	
	function init(){
		for(var i = 0; i < ALPHABETS.length; i ++){
			var c = ALPHABETS[i];
			UPPER2INDEX[c] = i;
			LOWER2INDEX[c.toLowerCase()] = i;
		}
		set_event_listener("encrypt", "click", encrypt);
		set_event_listener("toggle_dst", "click", toggle_dst);
		set_event_listener("toggle_src_panel1", "click", toggle_src_panel);
		set_event_listener("toggle_src_panel2", "click", toggle_src_panel);
		set_event_listener("mode", "change", change_mode);
		
		change_mode();
	}
	
	function create_guess_table(){
		var tr = create_element("tr");
		
		tr.appendChild(create_element("th", null, "置換元"));
		
		for(var i = 0; i < ALPHABETS.length; i ++){
			var c = ALPHABETS[i];
			var input = create_element("input", {type: "text", size: "1", maxlength: "1", id: "guess_" + c, style: {width: "2em"}});
			input.dataset.c = c;
			tr.appendChild(create_element("td", null, input));
			if(mode == MODE_CAESAR && i > 0){
				input.disabled = true;
			}else{
				input.addEventListener("keyup", update_guess, false);
			}
		}

		var table = document.getElementById("guess");
		clear(table);

		table.appendChild(create_replace_table_column("置換先", ALPHABETS));
		table.appendChild(tr);
	}
	
	
	var MODE_CAESAR = "CAESAR";
	var MODE_Substitution = "Substitution";
	var MODE_Polyalphabetic = "Polyalphabetic";
	var mode = null;
	
	function change_mode(){
		var new_mode = document.getElementById("mode").value;
		
		if(new_mode != mode){
			switch(new_mode){
			case MODE_CAESAR:
			case MODE_Substitution:
			default:
			}
			mode = new_mode;
			create_replace_table();
			create_guess_table();
			clear_dst();
			show_src_panel();
		}
	}
	
	
	function toggle_message(element){
		var alt = element.dataset.alt;
		element.dataset.alt = element.value;
		element.value = alt;
	}
	
	function toggle_dst(event){
		toggle_message(event.target);
		var p = document.getElementById("dst");
		if(p.className == "show"){
			p.className = "hide";
		}else{
			p.className = "show";
		}
	}
	
	function show_src_panel(){
		var p = document.getElementById("src_panel");
		if(p.style.display == "none"){
			toggle_src_panel();
		}
	}

	function hide_src_panel(){
		var p = document.getElementById("src_panel");
		if(p.style.display == ""){
			toggle_src_panel();
		}
	}
	
	function toggle_src_panel(){
		var toggle_buttons = ["toggle_src_panel1", "toggle_src_panel2"];
		var p = document.getElementById("src_panel");
		if(p.style.display == ""){
			p.style.display = "none";
		}else{
			p.style.display = "";
		}
		
		for(var i = 0; i < toggle_buttons.length; i ++){
			var button = document.getElementById(toggle_buttons[i]);
			if(p.style.display == "none"){
				button.value = button.dataset.mes + "表示";
			}else{
				button.value = button.dataset.mes + "隠す";
			}
		}
	}
	
	
	window.addEventListener("load", init, false);
	
})();
