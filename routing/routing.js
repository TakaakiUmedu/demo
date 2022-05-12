
//localStorage.clear();

(function(){
	var context;
	var dom = Lib.Dom;
	
	var map;
	
	var context_menu;
	var node_menu;
	var multiple_node_menu;
	var link_menu;
	
	function is_unique_name(new_name){
		for(var name in map.nodes){
			if(name == new_name){
				return false;
			}
		}
		return true;
	}
	
	function inc_str(str, min, max_char_code){
		var c = str.charCodeAt(str.length - 1);
		if(c < max_char_code){
			return str.substr(0, str.length - 1) + String.fromCharCode(c + 1);
		}else if(str.length > 0){
			return inc_str(str.substr(0, str.length - 1), min, max_char_code) + min;
		}else{
			return min;
		}
	}
	
	
	function create_unique_name(min, max){
		var name = min;
		while(!is_unique_name(name)){
			name = inc_str(name, min, max.charCodeAt(0));
		}
		return name;
	}
	
	function add_node(name, node){
		map.nodes[name] = node;
	}
	
	function add_link(name1, name2){
		if(map.links[name1] != null &&map.links[name1][name2] == true && map.links[name2] != null && map.links[name2][name1] == true){
			return;
		}
		if(map.links[name1] == null){
			map.links[name1] = {};
		}
		if(map.links[name2] == null){
			map.links[name2] = {};
		}
		map.links[name1][name2] = true;
		map.links[name2][name1] = true;
	}
	
	var context_menu_definition = {
		"New router": function(event){
			save_undo();
			var name = create_unique_name("A", "Z");
			
			add_node(name, {
				x: parseInt(context_menu.targetX),
				y: parseInt(context_menu.targetY),
				name: name,
				type: TYPE_ROUTER,
				hidden: false,
			});
			
			update_node_list();
			draw();
		},
		"New client": function(event){
			save_undo();
			var name = create_unique_name("a", "z");
			
			add_node(name, {
				x: parseInt(context_menu.targetX),
				y: parseInt(context_menu.targetY),
				name: name,
				type: TYPE_CLIENT,
				hidden: false,
			});
			update_node_list();
			draw();
		},
		"Clear": function(event){
			
			draw();
		}
	}
	
	var TYPE_ROUTER = "router";
	var TYPE_CLIENT = "client";
	
	var undo_list;
	var undo_index;
	
	function clear_undo(){
		undo_list = [];
		undo_index = 0;
	}
	
	function save_undo(){
		undo_list[undo_index] = JSON.stringify(map);
		undo_index ++;
		undo_list = undo_list.slice(0, undo_index);
		elements.undo.disabled = false;
		elements.redo.disabled = true;
	}
	
	function undo(){
		if(undo_index > 0){
			if(undo_index == undo_list.length){
				save_undo();
				undo_index --;
			}
			undo_index --;
			maps[elements.map_select.value] = map = JSON.parse(undo_list[undo_index]);
			drop_unbound_packets();
			if(undo_index == 0){
				elements.undo.disabled = true;
			}
			elements.redo.disabled = false;
		}
	}
	
	function redo(){
		if(undo_index < undo_list.length - 1){
			undo_index ++;
			maps[elements.map_select.value] = map = JSON.parse(undo_list[undo_index]);
			drop_unbound_packets();
			elements.undo.disabled = false;
			if(undo_index >= undo_list.length - 1){
				elements.redo.disabled = true;
			}
		}
	}
	
	
	function drop_unbound_packets(){
		for(var i = 0; i < packets.length; i ++){
			var packet = packets[i];
			if(map.nodes[packet.forward_from] == null || map.nodes[packet.forward_to] == null || map.links[packet.forward_from] == null || map.links[packet.forward_from][packet.forward_to] == null){
				drop_packet(packet);
			}
		}
		for(var forward_from in output_queues){
			for(var forward_to in output_queues[forward_from]){
				var queue = output_queues[forward_from][forward_to];
				if(queue.queue != null){
					reject(queue.queue, function(packet){
						return packet.dropping_x != null || packet.dropping_y != null;
					});
				}
			}
		}
		
		if(routing.value == ROUTING_SWITCH || routing.value == ROUTING_DISTANCE_VECTOR){
			for(var forward_from in routing_table){
				if(map.nodes[forward_from] == null){
					delete routing_table[forward_from];
				}else{
					for(var to in routing_table[forward_from]){
						if(routing.value == ROUTING_SWITCH){
							var table = routing_table[forward_from][to];
							for(var forward_to in table){
								if(map.nodes[forward_to] == null || map.links[forward_from] == null || map.links[forward_from][forward_to] == null){
									delete table[forward_to];
								}
							}
						}else{
							var forward_to = routing_table[forward_from][to].forward_to;
							if(map.nodes[forward_to] == null || map.links[forward_from] == null || map.links[forward_from][forward_to] == null){
								delete routing_table[forward_from][to];
							}
						}
					}
				}
			}
		}
		
	}
	
	
	var link_creating = false;
	
	function get_links(from){
		var link_table = map.links[from];
		if(link_table != null){
			return Object.keys(link_table);
		}else{
			return [];
		}
	}

	var node_menu_definition = {
		"New link": function(event){
			var node = search_pointed_node(node_menu.targetX, node_menu.targetY);
			if(node != null && can_have_more_links(node)){
				selected_node = node;
				link_creating = true;
				
				draw();
			}
		},
		"Delete": function(event){
			var node = search_pointed_node(node_menu.targetX, node_menu.targetY);
			if(node != null){
				save_undo();
				
				delete_node(node);
				
				drop_unbound_packets();
				
				update_node_list();
				draw();
			}
		},
		"Change visibility": function(event){
			var node = search_pointed_node(node_menu.targetX, node_menu.targetY);
			if(node != null){
				node.hidden = !node.hidden;
				draw();
			}
		},
		"Clear": function(event){
			draw();
		}
	}
	
	function delete_node(node){
		map.nodes = reject(map.nodes, node.name);
		var link_to_list = get_links(node.name);
		for(var i = 0; i < link_to_list.length; i ++){
			var link_to = link_to_list[i];
			delete_link(node.name, link_to);
			
		}
	}

	var multiple_node_menu_definition = {
		"Delete": function(event){
			if(multiple_selected_objs != null){
				save_undo();
				for(var name in multiple_selected_objs){
					delete_node(map.nodes[name]);
				}
				drop_unbound_packets();
				
				multiple_selected_objs = null;
				draw();
			}
		},
	}
	
	var link_menu_definition = {
		"Delete": function(event){
			if(pointed_link != null){
				save_undo();
				
				delete_link(pointed_link.node1, pointed_link.node2);
				
				drop_unbound_packets();
				
				multiple_selected_objs = null;
				draw();
			}
		},
	}

	function delete_link_dir(node1, node2){
		delete map.links[node1][node2];
		if(Object.keys(map.links[node1]).length == 0){
			delete map.links[node1];
		}
	}
	
	function delete_link(node1, node2){
		delete_link_dir(node1, node2);
		delete_link_dir(node2, node1);
	}
	
	var routing_table;
	
	function add_route(node, to, forward_to){
		var table = ensure(routing_table, node, new_table);
		table[to] = {};
		table[to][forward_to] = true;
	}
	
	function routing_changed(event){
		packets = [];
		output_queues = {};
		clear_routing_table();
		initialize_simulation();
		draw();
	}
	

	function MenuWindow(menu_definition){
		var self_obj = this;
		function execute_menu_item(event){
			menu_definition[event.currentTarget.value](event);
			self_obj.hide();
			event.preventDefault();
			return false;
		}
		
		menu_div = dom.elem("div", {style: {borderColor: "#88d", borderWidth: "2px", borderStyle: "solid", position: "absolute", left: 0, top: 0}});
		this.buttons = {};
		
		for(var name in menu_definition){
			var func = menu_definition[name];
			var button = dom.elem("input", {type: "button", value: name, style: {width: "100%"}});
			if(menu_div.firstChild != null){
				menu_div.appendChild(dom.elem("br"));
			}
			menu_div.appendChild(button);
			button.addEventListener("click", execute_menu_item, false);
			this.buttons[name] = button;
		}
		this.window = new DialogWindow(menu_div);;
		
//		this.hide();
		document.body.appendChild(menu_div);
	}
	
	MenuWindow.prototype = {
		hide: function(){
			this.window.close();
		},
	
		show: function(event){
			if(event != null){
				var x = Math.min(event.clientX, elements.canvas.parentNode.offsetWidth - this.width());
				var y = Math.min(event.clientY, elements.canvas.parentNode.offsetHeight - this.height());
				this.window.window.style.left = x + "px";
				this.window.window.style.top = y + "px";
				this.targetX = event.offsetX;
				this.targetY = event.offsetY;
			}
			this.window.show();
		},
		
		width: function(){
			return this.window.window.offsetWidth;
		},
	
		height: function(){
			return this.window.window.offsetHeight;
		},
	}
	
	var pointed_node;
	var pointed_link;
	var selected_node;
	var selected_info = {};
	
	function search_pointed_node(x, y){
		var min_dist2 = NODE_SIZE * NODE_SIZE / 4;
		var node_found = null;
		for(var name in map.nodes){
			var node = map.nodes[name];
			var dx = x - node.x;
			var dy = y - node.y;
			var dist2 = dx * dx + dy * dy
			if(dist2 < min_dist2){
				node_found = node;
				min_dist2 = dist2;
			}
		}
		return node_found;
	}
	
	var multiple_selection_info;
	
	function canvas_mouse_down(event){
		if(!link_creating){
			var x = event.offsetX;
			var y = event.offsetY;
			var node = search_pointed_node(x, y);
			if(node != null){
				selected_node = node;
				selected_info.x = x;
				selected_info.y = y;
				selected_info.moved = false;
				if(multiple_selected_objs != null && multiple_selected_objs[node.name] != true){
					multiple_selected_objs = null;
				}
				
				draw();
			}else{
				multiple_selected_objs = null;
				multiple_selection_info = {
					start_x: x,
					start_y: y,
					top: x,
					left: y,
					width: 0,
					height: 0,
				};
			}
		}
		return false;
	}
	var mouseX, mouseY;
	
	function canvas_mouse_move(event){
		mouseX = event.offsetX;
		mouseY = event.offsetY;
		var x = event.offsetX;
		var y = event.offsetY;
		if(multiple_selection_info != null){
			multiple_selection_info.left   = Math.min(multiple_selection_info.start_x, mouseX);
			multiple_selection_info.top    = Math.min(multiple_selection_info.start_y, mouseY);
			multiple_selection_info.width  = Math.abs(multiple_selection_info.start_x - mouseX);
			multiple_selection_info.height = Math.abs(multiple_selection_info.start_y - mouseY);
			var l = multiple_selection_info.left - NODE_SIZE / 2;
			var t = multiple_selection_info.top  - NODE_SIZE / 2;
			var r = multiple_selection_info.left + multiple_selection_info.width  + NODE_SIZE / 2;
			var b = multiple_selection_info.top  + multiple_selection_info.height + NODE_SIZE / 2;
			multiple_selection_info.moved = true;
			multiple_selected_objs = {};
			for(var name in map.nodes){
				var node = map.nodes[name];
				if(node.x >= l && node.x <= r && node.y >= t && node.y <= b){
					multiple_selected_objs[name] = true;
				}
			}
			
		}else if(selected_node != null){
			if(!link_creating){
				var dx = x - selected_info.x;
				var dy = y - selected_info.y;
				if(multiple_selected_objs != null){
					for(var name in multiple_selected_objs){
						var obj = map.nodes[name];
						obj.x += dx
						obj.y += dy
					}
				}else{
					selected_node.x += dx;
					selected_node.y += dy
				}
				selected_info.x = x;
				selected_info.y = y;
				selected_info.moved = true;
			}else{
				var obj = search_pointed_node(x, y);
				if(obj && can_have_more_links(obj)){
					pointed_node = obj;
				}else{
					pointed_node = null;
				}
			}
			draw();
		}else{
			var node = search_pointed_node(x, y);
			if(node != null){
				if(pointed_node != node){
					pointed_node = node;
					pointed_link = null;
					draw();
				}
			}else{
				var link  = get_pointed_link(x, y);
				if(link != null){
					if(pointed_link != link){
						pointed_link = link;
						pointed_node = null;
						draw();
					}
				}else{
					pointed_link = null;
					pointed_node = null;
				}
			}
		}
		return false;
	}
	
	function get_pointed_link(x, y){
		var mouse_pos = {x: x, y: y};
		var line = null;
		var min_distance = LINK_SELECTION_MARGIN;
		for(var name1 in map.links){
			var node1 = map.nodes[name1];
			for(var name2 in map.links[name1]){
				if(name1 < name2){
					var node2 = map.nodes[name2];
					
					var len = calc_distance_to_line(node1, node2, mouse_pos);
					if(len < min_distance){
						line = {node1: name1, node2: name2};
					}
				}
			}
		}
		return line;
	}

	var LINK_SELECTION_MARGIN = 5;

	function canvas_mouse_out(event){
		pointed_node = null;
		selected_node = null;
		multiple_selection_info = null;
//		multiple_selected_objs = null;
		return false;
	}
	
	function can_have_more_links(node){
		return node.type != TYPE_CLIENT || map.links[node.name] == null || Object.keys(map.links[node.name]).length == 0;
	}
	
	function canvas_mouse_up(event){
		if(multiple_selection_info != null){
			var moved = multiple_selection_info.moved;
			multiple_selection_info = null;
			if(moved){
				return;
			}
		}
		
		if(link_creating){
			var node = search_pointed_node(event.offsetX, event.offsetY);
			if(node != null && selected_node != node && can_have_more_links(node) && (selected_node.type != TYPE_CLIENT || node.type != TYPE_CLIENT)){
				save_undo();
				add_link(selected_node.name, node.name);
			}
			link_creating = false;
			selected_node = null;
			draw();
		}else if(selected_node != null){
			if(!selected_info.moved){
				if(multiple_selected_objs != null && Object.keys(multiple_selected_objs).length > 1){
					multiple_node_menu.show(event);
				}else{
					if(can_have_more_links(selected_node)){
						node_menu.buttons["New link"].disabled = false;
					}else{
						node_menu.buttons["New link"].disabled = true;
					}
					node_menu.show(event);
				}
			}
			selected_node = null;
			draw();
		}else if(pointed_link != null){
			link_menu.show(event);
		}else{
			context_menu.show(event);
		}
	}
	
	function calc_distance_to_line(p1, p2, p3){
		var v12 = vector_sub(p2, p1);
		var v13 = vector_sub(p3, p1);
		
		if(v12.len() == 0){
			return v13.len();
		}else{
			var v23 = vector_sub(p3, p2);
			
			var v12r = new Vector(v12.y, -v12.x).unit();
	
			var s = (v13.x * v12r.y - v13.y * v12r.x) / (v12.x * v12r.y - v12.y * v12r.x);
			if(s >= 0 && s <= 1){
				var t;
				if(v12.x != 0){
					t = (v13.x - s * v12.x) / v12r.x;
				}else{
					t = (v13.y - s * v12.y) / v12r.y;
				}
				return Math.abs(t);
			}else{
				return Math.min(v13.len(), v23.len());
			}
		}
	}
	
	function calc_canvas_size(){
		var div = elements.canvas.parentNode;
		var size = div.offsetHeight - 8; //
		for(var child = div.firstChild; child != null; child = child.nextSibling){
			if(child != elements.canvas){
				if(child.offsetHeight != null){
					size -= child.offsetHeight;
				}
			}
		}
		return size;
	}
	
	var maps = {};
	
	function rename_map(event){
		var name = prompt("New name for new map \"" + elements.map_select.value + "\"", elements.map_select.value);
		if(name != null && name != elements.map_select.value){
			var map = maps[elements.map_select.value];
			delete maps[elements.map_select.value];
			maps[name] = map;
			update_map_select();
			select_map(name);
		}
	}

	function delete_map(event){
		if(confirm("Are you sure to delete map \"" + elements.map_select.value + "\"?")){
			delete maps[elements.map_select.value];
			update_map_select();
			select_any_map();
		}
	}
	
	function create_new_map(event){
		var name = prompt("Name for new map", "");
		if(name != null){
			if(maps[name] != null){
				alert("Error: map exists");
			}else{
				create_map(name);
			}
		}
	}
	function create_map(name){
		if(maps[name] != null){
			select_map(name);
			return false;
		}else{
			maps[name] = {
				nodes: {},
				links: {},
			};
			elements.map_select.appendChild(dom.elem("option", {value: name}, name));
			select_map(name);
			return true;
		}
	}
	function clear_routing_table(){
		routing_table = {};
		dvrp_prev_send_times = null;
		if(routing.value == ROUTING_DISTANCE_VECTOR){
			for(var forward_from in map.links){
				if(map.nodes[forward_from].type == TYPE_ROUTER && map.links[forward_from] != null){
					for(var forward_to in map.links[forward_from]){
						if(map.nodes[forward_to].type == TYPE_CLIENT){
							var table = ensure(routing_table, forward_from, new_table);
							table[forward_to] = {
								forward_to: forward_to,
								distance: 1,
							};
						}
					}
				}
			}
		}
	}
	
	function initialize_simulation(){
		packets = [];
		output_queues = {};
		clear_routing_table();
		auto_stop.click();
		if(routing.value == ROUTING_DISTANCE_VECTOR){
			elements.routing_send.disabled = false;
			elements.routing_start.disabled = false;
			elements.routing_stop.disabled = true;
			dvrp_force_sending = 0;
		}else{
			elements.routing_send.disabled = true;
			elements.routing_start.disabled = true;
			elements.routing_stop.disabled = true;
		}
	}
	
	function enumerate_nodes(type){
		var ret = [];
		for(var name in map.nodes){
			if(map.nodes[name].type == type){
				ret.push(name);
			}
		}
		return ret;
	}
	
	function get_routers(){
		return enumerate_nodes(TYPE_ROUTER);
	}

	function get_clients(){
		return enumerate_nodes(TYPE_CLIENT);
	}
	
	var ADDRESS_ANY_BROADCAST   = "?*";
	var ADDRESS_ANY  = "?";
	var ADDRESS_BROADCAST = "*";
	
	function select_map(name){
		if(maps[name] != null){
			multiple_selection_info = null;
			multiple_selected_objs = null;

			prev_map_name = name;
			map = maps[name];
			elements.map_select.value = name;
			clear_packets();
			clear_undo();
			update_node_list();
			initialize_simulation();
			draw();
		}
	}
	
	function update_node_list(){
		dom.clear(elements.from);
		dom.clear(elements.to);
		var node_list = get_clients();
		node_list.sort();
		elements.from.appendChild(dom.elem("option", {value: ADDRESS_ANY}, "[any]"));
		elements.to.appendChild(dom.elem("option", {value: ADDRESS_ANY}, "[any]"));
		elements.to.appendChild(dom.elem("option", {value: ADDRESS_ANY_BROADCAST}, "[any or broadcast]"));
		for(var i = 0; i < node_list.length; i ++){
			var node = node_list[i];
			elements.from.appendChild(dom.elem("option", {value: node}, node));
			elements.to.appendChild(dom.elem("option", {value: node}, node));
		}
		elements.to.appendChild(dom.elem("option", {value: ADDRESS_BROADCAST}, "[broadcast]"));
	}
	
	function clear_packets(){
		packets = [];
		output_queues = {};
	}
	
	function selection_changed(event){
		select_map(elements.map_select.value);
	}
	
	
	function select_any_map(){
		var map_names = Object.keys(maps);
		if(map_names.length == 0){
			create_map("no name");
		}else{
			select_map(map_names[0]);
		}
	}
	
	var prev_map_name = null;
	
	function update_map_select(){
		dom.clear(elements.map_select);
		var names = Object.keys(maps);
		names.sort();
		for(var i = 0; i < names.length; i ++){
			var name = names[i];
			elements.map_select.appendChild(dom.elem("option", {value: name}, name));
		}
	}
	
	var routing;
	var elements;
	
	var export_window;
	var export_textarea;
	var export_head;
	var export_message;
	var export_buttons;
	
	function DialogWindow(div, button_handlers){
		if(DialogWindow.initialized != true){
			DialogWindow.shield = dom.elem("div", {style: {borderWidth: 0, padding: 0, margin : 0, width: "10px", height: "10px", top: 0, left: 0, position: "absolute", visiblity: "hidden", zIndex: -1}});
			DialogWindow.shield.addEventListener("click", DialogWindow.close_all_windows, false);
			document.body.appendChild(DialogWindow.shield);
			DialogWindow.windows = [];
			DialogWindow.initialized = true;
		}
		if(typeof(div) == "string"){
			this.window = document.getElementById(div);
		}else{
			this.window = div;
		}
		this.window.style.position = "absolute";
		this.window.style.visibility = "hidden";
		this.window.style.zIndex = -1;
		this.buttons = {};
		for(var id in button_handlers){
			var button = document.getElementById(id);
			button.addEventListener("click", button_handlers[id], false);
			this.buttons[id] = button;
		}
		DialogWindow.windows.push(this);
	}
	
	DialogWindow.close_all_windows = function(){
		for(var i = 0; i < DialogWindow.windows.length; i ++){
			DialogWindow.windows[i].close();
		}
	}
	
	DialogWindow.prototype = {
		show: function(left, top, width, height){
			if(this.shown != true){
				DialogWindow.close_all_windows();
				if(left != undefined){
					this.window.style.left = left + "px";
				}
				if(top != undefined){
					this.window.style.top = top + "px";
				}
				if(width != undefined){
					this.window.style.width = width + "px";
				}
				if(height != undefined){
					this.window.style.height = height + "px";
				}
				DialogWindow.shield.style.top    = 0;
				DialogWindow.shield.style.left   = 0;
				DialogWindow.shield.style.width  = document.body.offsetWidth + "px";
				DialogWindow.shield.style.height = document.body.offsetHeight + "px";
				DialogWindow.shield.style.visibility = "visible";
				DialogWindow.shield.style.zIndex = 1;
				this.window.style.visibility = "visible";
				this.window.style.zIndex = 2;
				this.shown = true;
			}
		},
		close: function(){
			if(this.shown == true){
				DialogWindow.shield.style.visibility = "hidden";
				DialogWindow.shield.style.zIndex = -1;
				this.window.style.visibility = "hidden";
				this.window.style.zIndex = -1;
				this.shown = false;
			}
		}
	}
	
	var import_hander_definition = {
		import_import: function(event){
			import_map(export_textarea.value);
			export_window.close();
		},
		import_cancel: function(event){
			export_window.close();
		},
		import_close: function(event){
			export_window.close();
		},
	};
	
	var EXPORT_WINDOW_MARGIN = 20;
	
	function import_map(data){
		try{
			var data = JSON.parse(data);
			var message = " maps imported\n";
			var num = 0;
			var first_name = null;
			for(var name in data){
				var new_name = name;
				if(maps[new_name] != null){
					var index = 0;
					var new_name;
					do{
						index ++;
						new_name = name + "(" + index + ")";
					}while(maps[new_name] != null);
					message += "\"" + name + "\" -> \"" + new_name + "\" (renamed)\n";
				}else{
					message += "\"" + name + "\"\n";
				}
				if(first_name == null){
					first_name = new_name;
				}
				maps[new_name] = data[name];
				num ++;
			}
			check_data();
			update_map_select();
			select_map(new_name);
			alert(message = "" + num + message);
		}catch(e){
			alert("Error: Cannot import. Data may be broken");
		}
	}
	
	function show_export_window(){
		export_textarea.style.width  = (document.body.offsetWidth - EXPORT_WINDOW_MARGIN * 2) + "px";
		export_textarea.style.height = (document.body.offsetHeight - EXPORT_WINDOW_MARGIN * 4 - export_buttons.offsetHeight) + "px";
		export_window.show(EXPORT_WINDOW_MARGIN, EXPORT_WINDOW_MARGIN);
	}
	
	function map_export_all(){
		export_head.firstChild.nodeValue = "Export all maps";
		export_message.firstChild.nodeValue = "Copy following exported data to anywhere";
		export_textarea.value = JSON.stringify(maps);
		export_window.buttons.import_import.style.display = "none";
		export_window.buttons.import_cancel.style.display = "none";
		export_window.buttons.import_close.style.display = "";
		show_export_window();
	}
	function map_export(){
		export_head.firstChild.nodeValue = "Export current map";
		export_message.firstChild.nodeValue = "Copy following exported data to anywhere";
		var obj = {};
		obj[map_select.value] = maps[map_select.value];
		export_textarea.value = JSON.stringify(obj);
		export_window.buttons.import_import.style.display = "none";
		export_window.buttons.import_cancel.style.display = "none";
		export_window.buttons.import_close.style.display = "";
		show_export_window();
	}
	function map_import(){
		export_head.firstChild.nodeValue = "Import maps";
		dom.add(export_message, "Copy data to be exported into the following textarea");
		export_textarea.value = "";
		export_window.buttons.import_import.style.display = "";
		export_window.buttons.import_cancel.style.display = "";
		export_window.buttons.import_close.style.display = "none";
		show_export_window();
	}
	
	function initialize(){
		routing_table = {};
		
		export_window = new DialogWindow("export_window", import_hander_definition);
		export_textarea = document.getElementById("export_textarea");
		export_buttons = document.getElementById("export_buttons");
		export_message = document.getElementById("export_message");
		export_head = document.getElementById("export_head");
		
		elements = Lib.get_elements_with_id("input", "select", "canvas");
		
		context = elements.canvas.getContext("2d");

		elements.canvas.addEventListener("mousedown", canvas_mouse_down, false);
		elements.canvas.addEventListener("mousemove", canvas_mouse_move, false);
		elements.canvas.addEventListener("mouseout",  canvas_mouse_out, false);
		elements.canvas.addEventListener("mouseup",   canvas_mouse_up, false);
		
		set_toggle_buttons(elements.auto_start, elements.auto_stop);
		elements.routing_send.addEventListener("click", send_routing_packets, false);
		set_toggle_buttons(elements.routing_start, elements.routing_stop);
		elements.send.addEventListener("click", send_new_packet, false);
		elements.clear_packets.addEventListener("click", clear_packets, false);
		
		set_toggle_buttons(elements.simulation_start, elements.simulation_stop);
		
		elements.map_select.addEventListener("change", selection_changed, false);
		elements.map_create.addEventListener("click", create_new_map, false);
		elements.map_rename.addEventListener("click", rename_map, false);
		elements.map_delete.addEventListener("click", delete_map, false);
		elements.undo.addEventListener("click", undo, false);
		elements.redo.addEventListener("click", redo, false);

		elements.map_export_all.addEventListener("click", map_export_all, false);
		elements.map_export.addEventListener("click", map_export, false);
		elements.map_import.addEventListener("click", map_import, false);

		
		routing = elements.routing;
		routing.addEventListener("change", routing_changed, false);	
		elements.routing_reset.addEventListener("click", clear_routing_table, false);
		
		speed_ratio_select = elements.speed_ratio;

		context_menu = new MenuWindow(context_menu_definition);
		node_menu = new MenuWindow(node_menu_definition);
		multiple_node_menu = new MenuWindow(multiple_node_menu_definition);
		link_menu = new MenuWindow(link_menu_definition);
		
//		clear_network();
		
		storage = new Lib.Storage();
		maps = storage.load("map data");
		if(maps == null){
			var default_data = Lib.download("defalut_maps.json", {synchronous: true});
			maps = JSON.parse(default_data);
		}
		if(maps != null){
			check_data();
			update_map_select();
		}else{
			maps = {};
		}
		storage.load_form("setting");
		select_map(elements.map_select.value);
		if(map == null){
			select_any_map();
		}
		routing_changed();
		
		window.addEventListener("unload", save, false);
		
		prev_time = new Date();
		update_packets();
		draw();
	}
	var storage;
	
	function check_data(){
		var modified = false;
		for(var name in maps){
			var map = maps[name];
			for(var node_name in map.nodes){
				var node = map.nodes[node_name];
				if(typeof(node.x) != "number"){
					node.x = 0;
					modified = true;
				}
				if(typeof(node.y) != "number"){
					node.y = 0;
					modified = true;
				}
				if(node.name != node_name){
					node.name = node_name;
					modified = true;
				}
				if(node.type != TYPE_ROUTER && node.type != TYPE_CLIENT){
					node.type = TYPE_ROUTER;
					modified = true;
				}
				for(var entry_name in node){
					if(entry_name != "x" && entry_name != "y" && entry_name != "name" && entry_name != "type" && entry_name != "hidden"){
						delete node[entry_name];
						modified = true;
					}
				}
			}
			for(var node1 in map.links){
				if(map.nodes[node1] == null){
					delete map.links[node1];
					modified = true;
				}else{
					for(var node2 in map.links[node1]){
						if(node1 == node2){
							delete map.links[node1][node2];
							modified = true;
						}else if(map.nodes[node2] == null){
							delete map.links[node1][node2];
							modified = true;
						}else{
							var node = map.links[node1][node2];
							if(!(node === true || node === false)){
								map.links[node1][node2] = node ? true : false;
								modified = true;
							}
						}
					}
				}
			}
		}
		if(modified){
			alert("Some data errors are modified");
		}
	}
	
	var prev_time;

	function save(){
		storage.save("map data", maps);
		storage.save_form("setting");
	}
	
	var NODE_SIZE = 30;
	var NODE_FONT_SIZE = 20;
	
	var INTERVAL = 33;
	
	
	var datalist_nodes;
	
	
	var packets = [];
	
	function send_packet(from ,to, options){
		var packet = {from: from, to: to};
		var ttl = parseInt(elements.ttl.value);
		if(ttl > 0){
			packet.ttl = ttl + 1;
		}
		if(options != null){
			for(var name in options){
				packet[name] = options[name];
			}
		}
		receive_packet(from, packet);
		packets.push(packet);
	}
	
	var QUEUE_TIME = 100;
	
	var QUEUE_LENGTH = 5;
	var PACKET_FORWARDING_TIME = 1000;

	var QUEUE_OFFSET = 10;
	var QUEUE_POSITION = 10;
	
	
	var PACKET_WIDTH = 40;
	var PACKET_HEIGHT = 20;
	var PACKET_FONT_SIZE = 16;
	
	var PACKET_FORWARD_INTERVAL = 500;
	var PACKET_QUEUE_TIME = 500;
	var PACKET_QUEUEING_SPEED = 3 / PACKET_HEIGHT / INTERVAL;
	var PACKET_SPEED = 5 / INTERVAL;
	var PACKET_DROP_SPEED = 15 / INTERVAL;
	
	var output_queues = {};
	
	function drop_packet(packet){
		if(packet.x != null && packet.y != null){
			packet.dropping_x = packet.x;
			packet.dropping_y = packet.y;
		}
	}

	function accept_packet(packet){
		packet.accepting_offset = 0;
	}
	
	var dvrp_prev_send_times;
	
	
	function route_packet(packet, node){
		switch(routing.value){
		case ROUTING_SWITCH:
			var list = null;
			if(packet.to != ADDRESS_BROADCAST && routing_table[node] != null && routing_table[node][packet.to] != null){
				list = reject(Object.keys(routing_table[node][packet.to]), packet.forward_from);
			}
			if(list != null && list.length > 0){
				return list;
			}else if(map.links[node] != null){
				return reject(Object.keys(map.links[node]), packet.forward_from);
			}
			break;
		case ROUTING_REPEATER:
			return reject(Object.keys(map.links[node]), packet.forward_from);
		case ROUTING_DISTANCE_VECTOR:
			if(packet.to == ADDRESS_BROADCAST && map.links[node] != null){
				return reject(Object.keys(map.links[node]), function(node){
					return map.nodes[node].type == TYPE_CLIENT;
				});
			}else if(map.nodes[node].type == TYPE_ROUTER){
				var table = routing_table[node];
				if(table != null){
					var entry = table[packet.to];
					if(entry != null){
						return [entry.forward_to];
					}
				}
			}else{
				if(map.links[node] != null){
					return Object.keys(map.links[node]);
				}
			}
			break;
		case ROUTING_RANDOM_WALK:
			var connected_nodes = get_links(node);
			var forward_to = null;
			if(connected_nodes.length > 0){
				if(connected_nodes.length == 1){
					forward_to = connected_nodes[0];
				}else{
					for(var j = 0; j < connected_nodes.length; j ++){
						if(packet.to == connected_nodes[j]){
							forward_to = connected_nodes[j];
							break;
						}
					}
					if(forward_to == null){
						connected_nodes = reject(connected_nodes, packet.prev_node);
						forward_to = connected_nodes[Math.floor(connected_nodes.length * Math.random())];
					}
				}
				return [forward_to];
			}
		}
		return [];
	}
	
	function ensure(table, key, new_item_func){
		var item = table[key];
		if(item == null){
			item = table[key] = new_item_func();
		}
		return item;
	}
	
	function new_table(){
		return {};
	}

	function new_array(){
		return [];
	}
	function new_output_queue(){
		return {
			wait: 0,
			queue: [],
		};
	}

	function receive_packet(node, packet){
		switch(routing.value){
		case ROUTING_SWITCH:
			if(packet.forward_from != null){
				add_route(node, packet.from, packet.forward_from);
			}
			break;
		case ROUTING_DISTANCE_VECTOR:
			if(packet.from != node && packet.to == ADDRESS_BROADCAST){
				var table = ensure(routing_table, node, new_table);
				for(var to in packet.table){
					if(to == node){
						continue;
					}
					var distance = packet.table[to] + 1;
					var entry = table[to];
					if(entry == null){
						table[to] = {
							forward_to: packet.from,
							distance: distance,
						};
					}else{
						if(entry.distance > distance || entry.forward_to == packet.from){
							entry.forward_to = packet.from;
							entry.distance = distance;
						}
					}
				}
				for(var to in table){
					if(table[to].forward_to == packet.from && packet.table[to] == null){
						delete table[to];
					}
				}
				packet.deleted = true;
				return;
			}
		}

		if(packet.to == node || map.nodes[node].type == TYPE_CLIENT && packet.to == ADDRESS_BROADCAST && packet.from != node){
//			alert("received");
			packet.forward_from = node;
			accept_packet(packet);
		}else{
			if(packet.ttl != null){
				packet.ttl --;
				if(packet.ttl == 0){
					drop_packet(packet);
					return;
				}
			}
			packet.prev_node = packet.forward_from;
			var forward_to_list = route_packet(packet, node);
			packet.forward_from = node;
			packet.x = map.nodes[node].x;
			packet.y = map.nodes[node].y;
			packet.forward_to = null;
			packet.queue_offset = 0;
			
			var queue_length = routing.value == ROUTING_REPEATER ? 1 : QUEUE_LENGTH;
			
			if(forward_to_list.length == 0){
				drop_packet(packet);
			}else{
				var dropped = false;
				var forwarded = false;
				var queue_table = ensure(output_queues, node, new_table);
				for(var i = 0; i < forward_to_list.length; i ++){
					var forward_to = forward_to_list[i];
					var queue = ensure(queue_table, forward_to, new_output_queue);
	
					if(queue.queue.length < queue_length){
						if(forwarded){
							packet = Lib.clone_object(packet);
							packets.push(packet);
						}else{
							forwarded = true;
						}
						queue.queue.push(packet);
						packet.forward_to = forward_to;
						packet.forwarding_distance = 0;
						packet.queued = true;
						packet.waiting_for_queued = true;
					}else{
						dropped = true;
					}
				}
				if(dropped){
					if(forwarded){
						packet = Lib.clone_object(packet);
						packets.push(packet);
					}
					drop_packet(packet);
				}
			}
		}
	}
	
	function reject(array, condition){
		var is_rejected;
		if(typeof(condition) == "function"){
			is_rejected = condition;
		}else{
			is_rejected = function(item){
				return item == condition;
			}
		}
		if(Array.isArray(array)){
			var new_array = [];
			for(var i = 0; i < array.length; i ++){
				if(!is_rejected(array[i])){
					new_array.push(array[i]);
				}
			}
			return new_array;
		}else{
			var new_obj = {};
			for(var name in array){
				if(!is_rejected(name)){
					new_obj[name] = array[name];
				}
			}
			return new_obj;
		}
	}
	
	var auto_packet_send_wait = null;
	
//	var DVRP_INTERVAL = 3000;
	var dvrp_force_sending;
	
	function get_routing_interval(){
		return parseInt(elements.routing_interval.value);
	}
	
	function send_routing_packets(){
		var dvrp_interval = get_routing_interval();
		var min = dvrp_interval, max = 0;
		if(dvrp_prev_send_times == null){
			dvrp_prev_send_times = {};
		}
		for(var node in map.nodes){
			if(map.nodes[node].type == TYPE_ROUTER){
				var t = dvrp_prev_send_times[node];
				if(t == null || t > dvrp_interval){
					t = dvrp_prev_send_times[node] = Math.floor(dvrp_interval * Math.random());
				}
				min = Math.min(min, t);
				max = Math.max(max, t);
			}
		}
		for(var node in dvrp_prev_send_times){
			dvrp_prev_send_times[node] -= min;
		}
		dvrp_force_sending = max - min;
		elements.routing_send.disabled = true;
	}
	
	function set_toggle_buttons(button1, button2){
		button1.dataset.toggle = button2.id;
		button2.dataset.toggle = button1.id;
		button1.addEventListener("click", toggle_button, false);
		button2.addEventListener("click", toggle_button, false);
	}
	
	function toggle_button(event){
		var button = event.currentTarget;
		document.getElementById(button.dataset.toggle).disabled = false;
		button.disabled = true;
		event.preventDefault();
		return false;
	}
	
	var speed_ratio_select;
	
	function dvrp_payload_to_texts(){
		var texts = [];
		for(var name in this.table){
			texts.push(name + "(" + this.table[name] + ")");
		}
		return rearrange_texts(texts);
	}
	
	function update_packets(){
		var cur_time = new Date();
		var interval;
		if(elements.simulation_start.disabled == true){
			interval = cur_time - prev_time;
			var speed_ratio = parseFloat(speed_ratio_select.value);
			if(speed_ratio <= 0){
				speed_ratio = 1;
			}
			interval *= speed_ratio;
		}else{
			interval = 0;
		}
		prev_time = cur_time;
		
		var dvrp_interval = get_routing_interval();
		if(routing.value == ROUTING_DISTANCE_VECTOR && (elements.routing_start.disabled == true || dvrp_force_sending > 0) && dvrp_interval > 0){
			dvrp_force_sending -= interval;
			if(dvrp_force_sending < 0){
				dvrp_force_sending = 0;
				elements.routing_send.disabled = false;
			}
			if(dvrp_prev_send_times == null){
				dvrp_prev_send_times = {};
			}
			var routers = get_routers();
			for(var i = 0; i < routers.length; i ++){
				var from = routers[i];
				var t = dvrp_prev_send_times[from];
				if(t == null || t > dvrp_interval){
					t = dvrp_prev_send_times[from] = Math.floor(dvrp_interval * Math.random());
				}
				t -= interval;
				if(t < 0){
					if(map.links != null){
						var sending_table = {};
						var table = ensure(routing_table, from, new_table);
						for(var to in map.links[from]){
							if(map.nodes[to].type == TYPE_CLIENT){
								if(table[to] == null){
									table[to] = {
										distance: 1,
										forward_to: to,
									};
								}else{
									table[to].distance = 1;
								}
							}
						}
						for(var to in table){
							sending_table[to] = table[to].distance;
						}
						if(Object.keys(sending_table).length > 0){
							send_packet(from, ADDRESS_BROADCAST, {
								payload: dvrp_payload_to_texts,
								table: sending_table,
								color: ["#800", "#fdd", "#800"],
							});
						}
					}
					dvrp_prev_send_times[from] = dvrp_interval;
				}else{
					dvrp_prev_send_times[from] = t;
				}
			}
		}
		
		if(elements.auto_start.disabled){
			var packet_send_interval = parseInt(elements.interval.value);
			if(auto_packet_send_wait == null){
				auto_packet_send_wait = 0;
			}else{
				auto_packet_send_wait -= interval;
			}
			if(packet_send_interval != 0 && auto_packet_send_wait < 0){
				send_new_packet();
				auto_packet_send_wait = packet_send_interval;
			}else if(auto_packet_send_wait > packet_send_interval){
				auto_packet_send_wait = packet_send_interval;
			}
		}
		
		
		for(var forward_from in output_queues){
			for(var forward_to in output_queues[forward_from]){
				var queue = output_queues[forward_from][forward_to];
				for(var i = 0; i < queue.queue.length; i ++){
					var packet = queue.queue[i];
					packet.forwarding_distance += PACKET_SPEED * interval;
					var max = QUEUE_POSITION + QUEUE_OFFSET * (QUEUE_LENGTH - i - 1);
					if(packet.forwarding_distance > max){
						packet.forwarding_distance = max;
						if(i == 0){
							packet.waiting_for_queued = false;
						}
					}
				}
				queue.wait -= interval;
				if(queue.wait < 0){
					if(queue.queue.length > 0 && queue.queue[0].waiting_for_queued == false){
						var packet = queue.queue.shift();
						packet.queued = false;
						queue.wait = PACKET_FORWARD_INTERVAL;
					}else{
						queue.wait = 0;
					}
				}
			}
		}
		
		var new_packets = [];
		for(var i = 0; i < packets.length; i ++){
			var packet = packets[i];
			var node_from = map.nodes[packet.forward_from];
			if(packet.dropping_x != null || packet.dropping_y != null){
				packet.dropping_y += PACKET_DROP_SPEED * interval;
				packet.x = packet.dropping_x;
				packet.y = packet.dropping_y;
				if(packet.dropping_y > elements.canvas.height + PACKET_HEIGHT){
					packet.deleted = true;
				}
			}else if(packet.accepting_offset != null){
				packet.accepting_offset += PACKET_DROP_SPEED * interval;
				packet.x = node_from.x;
				packet.y = node_from.y - packet.accepting_offset;
				if(packet.y < - PACKET_HEIGHT){
					packet.deleted = true;
				}
			}else if(packet.forward_to != null){
				var node_to = map.nodes[packet.forward_to];
				var vec = vector_sub(node_to, node_from);
				var len = vec.len();
				if(len == 0){
					len = 0.01;
				}
				var vec_unit = vec.div(len);

				var distance;
				if(packet.queued != true){
					packet.forwarding_distance += PACKET_SPEED * interval;
					distance = packet.forwarding_distance;
					if(packet.forwarding_distance > len){
						receive_packet(packet.forward_to, packet);
					}
				}else{
					distance = packet.forwarding_distance
				}
				if(distance > len){
					distance = len;
				}
				var pos = vector_add(node_from, vec_unit.mul(distance));
				packet.x = pos.x;
				packet.y = pos.y;
			}
			if(!packet.deleted){
				new_packets.push(packet);
			}
		}
		packets = new_packets;
		
		draw();
		setTimeout(update_packets, INTERVAL);
	}
	
	function send_new_packet(){
		var names = get_clients();
		if(names.length >= 2){
			var from = elements.from.value;
			var to = elements.to.value;
			
			if(from == ADDRESS_ANY){
				var names_from;
				if(to == ADDRESS_ANY || to == ADDRESS_ANY || to == ADDRESS_BROADCAST){
					names_from = names;
				}else{
					names_from = reject(names, to);
				}
				from = names_from[Math.floor(names_from.length * Math.random())];
			}
			if(to == ADDRESS_ANY || to == ADDRESS_ANY_BROADCAST){
				var names_to = reject(names, from);
				if(to == ADDRESS_ANY_BROADCAST){
					names_to.push(ADDRESS_BROADCAST);
				}
				to = names_to[Math.floor(names_to.length * Math.random())];
			}
			
			if(from != to){
				send_packet(from, to);
			}
		}
	}
	
	
	function packet_sorter(p1, p2){
		var o1 = p1.forwarding_distance;
		var o2 = p2.forwarding_distance;
		if(o1 == null && o2 == null){
			return 0;
		}else if(o1 == null){
			return 1;
		}else if(o2 == null){
			return -1;
		}else if(o1 < o2){
			return -1;
		}else if(o1 > o2){
			return 1;
		}else{
			return 0;
		}
	}
	
	var ROUTING_TABLE_NO_ENTRY_FONT = "normal normal 14px 'Sans serif'";
	var ROUTING_TABLE_FONT = "normal normal 14px monospace";
	var ROUTING_TABLE_OFFSET = NODE_SIZE / 2 + 5;
	var ROUTING_TABLE_PADDING = 3;
	var ROUTING_TABLE_HEIGHT = 15;
	
	var ROUTING_SWITCH = "switch";
	var ROUTING_REPEATER = "repeater";
	var ROUTING_RANDOM_WALK = "random walk";
	var ROUTING_DISTANCE_VECTOR = "dvrp";
	
	function Vector(x, y){
		this.x = x;
		this.y = y;
	}
	Vector.prototype = {
		len: function(){
			return Math.sqrt(this.x * this.x + this.y * this.y);
		},
		div: function(value){
			return new Vector(this.x / value, this.y / value);
		},
		mul: function(value){
			return new Vector(this.x * value, this.y * value);
		},
		add: function(vec){
			return new Vector(this.x + vec.x, this.y + vec.y);
		},
		sub: function(vec){
			return new Vector(this.x - vec.x, this.y - vec.y);
		},
		unit: function(){
			var len = this.len();
			if(len == 0){
				return new Vector(0, 0);
			}else{
				return this.div(len);
			}
		},
	};
	
	
	function vector_sub(obj1, obj2){
		return new Vector(obj1.x - obj2.x, obj1.y - obj2.y);
	}

	function vector_add(obj1, obj2){
		return new Vector(obj1.x + obj2.x, obj1.y + obj2.y);
	}
	
	function stroke_line(p1, p2){
		context.beginPath();
		context.moveTo(p1.x, p1.y);
		context.lineTo(p2.x, p2.y);
		context.stroke();
	}
	
	function calc_text_box_width(texts){
		var width = 0;
		for(var i = 0; i < texts.length;i ++){
			var w = context.measureText(texts[i]).width;
			if(w > width){
				width = w;
			}
		}
		return width;
	}
	
	function draw_text_box(texts, x, y, width, height, padding, stroke_style, fill_style, text_style){
		context.fillStyle = fill_style;
		context.strokeStyle = stroke_style;
		context.fillRect(x - padding, y - padding, width + padding * 2, height * texts.length+ padding * 2);
		context.strokeRect(x - padding, y - padding, width + padding * 2, height * texts.length+ padding * 2);
		
		context.textAlign = "left";
		context.textBaseline = "top";
		context.fillStyle = text_style;
		for(var i = 0; i < texts.length;i ++){
			context.fillText(texts[i], x, y + i * height);
		}
	}
	
	function draw(){
		elements.canvas.width = elements.canvas.offsetWidth;
		elements.canvas.height = calc_canvas_size();
		elements.canvas.style.height = elements.canvas.height + "px";

		context.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

		var queue_length = QUEUE_LENGTH * QUEUE_OFFSET + QUEUE_POSITION;
		for(var name1 in map.links){
			for(var name2 in map.links[name1]){
				if(name1 < name2){
					var line_selected = (pointed_link != null && pointed_link.node1 == name1 && pointed_link.node2 == name2);
					var n1 = map.nodes[name1];
					var n2 = map.nodes[name2];
					var vec = vector_sub(n2, n1);
					var len = vec.len();
					if(len > NODE_SIZE){
						var p1, p2;
						if(len < queue_length * 2){
							p1 = p2 = vector_add(n1, vec.div(2));
						}else{
							var queue_vec = vec.mul(queue_length / len);
							var p1 = vector_add(n1, queue_vec);
							var p2 = vector_sub(n2, queue_vec);
						}

						if((line_selected && !n1.hidden) || selected_node == n1 || pointed_node == n1){
							context.lineWidth = 8;
							context.strokeStyle = "#f88";
						}else{
							if(n1.hidden){
								context.lineWidth = 2;
								context.strokeStyle = "#aaa";
							}else{
								context.lineWidth = 5;
								context.strokeStyle = "#88f";
							}
						}
						stroke_line(n1, p1);

						if((line_selected && !n2.hidden) || selected_node == n2 || pointed_node == n2){
							context.lineWidth = 8;
							context.strokeStyle = "#f88";
						}else{
							if(n2.hidden){
								context.lineWidth = 2;
								context.strokeStyle = "#aaa";
							}else{
								context.lineWidth = 5;
								context.strokeStyle = "#88f";
							}
						}
						stroke_line(p2, n2);
						
						if(line_selected){
							context.lineWidth = 4;
							context.strokeStyle = "#daa";
						}else{
							context.lineWidth = 2;
							context.strokeStyle = "#aaa";
						}
						stroke_line(p1, p2);
					}
				}
			}
		}
		
		if(link_creating && selected_node != null){
			context.lineWidth = 4;
			context.strokeStyle = "#f00";
			context.beginPath();
			context.moveTo(selected_node.x, selected_node.y);
			context.lineTo(mouseX, mouseY);
			context.stroke();
		}
		
		context.lineWidth = 2;
		if(routing.value == ROUTING_SWITCH || routing.value == ROUTING_DISTANCE_VECTOR){
			for(var name in map.nodes){
				if(map.nodes[name].type == TYPE_CLIENT){
					continue;
				}
				var node = map.nodes[name];
				var table = routing_table[name];
				
				if(routing_table_display.value == "each"){
					var rev_table = {};
					if(routing.value == ROUTING_SWITCH){
						for(var to in table){
							for(var connected_link in table[to]){
								ensure(rev_table, connected_link, new_array).push(to);
							}
						}
					}else{
						for(var to in table){
							var entry = table[to];
							ensure(rev_table, entry.forward_to, new_array).push(to + "(" + entry.distance + ")");
						}
					}
					for(var connected_link in map.links[name]){
						var entries = rev_table[connected_link];
						var texts;
						if(entries == null){
							context.font = ROUTING_TABLE_NO_ENTRY_FONT;
							texts = ["no entry"];
						}else{
							context.font = ROUTING_TABLE_FONT;
							texts = rearrange_texts(entries);
						}
						var w = calc_text_box_width(texts);
						var h = texts.length * ROUTING_TABLE_HEIGHT;
						var vec = vector_sub(map.nodes[connected_link], node);
						var len = vec.len();
						var offset;
						if(len == 0){
							offset = 0;
						}else if(len < queue_length * 2){
							offset = 0.5;
						}else{
							offset = queue_length / len;
						}
						var pos = vector_add(node, vec.mul(offset));
						draw_text_box(texts, pos.x - w / 2, pos.y - h / 2, w, ROUTING_TABLE_HEIGHT, ROUTING_TABLE_PADDING, "#880", "#ffd", "#440");
					}
				}else{
					var entries;
					if(table != null){
						entries = Object.keys(table);
					}else{
						entries = [];
					}
					var x = node.x + ROUTING_TABLE_OFFSET;
					var y = node.y;
					var texts = [];
	
					if(entries.length == 0){
						context.font = ROUTING_TABLE_NO_ENTRY_FONT;
						texts.push("no entry");
					}else{
						context.font = ROUTING_TABLE_FONT;
						entries.sort();
						for(var i = 0; i < entries.length; i ++){
							var forward_from = entries[i];
							if(routing.value == ROUTING_SWITCH){
								var forward_to_list = Object.keys(table[forward_from]);
								forward_to_list.sort();
								texts.push(forward_from + ": " + forward_to_list.join(","));
							}else{
								var entry = table[forward_from];
								texts.push(forward_from + ": " + entry.forward_to + "(" + entry.distance + ")");
							}
						}
					}
					draw_text_box(texts, x, y - texts.length * ROUTING_TABLE_HEIGHT / 2, calc_text_box_width(texts), ROUTING_TABLE_HEIGHT, ROUTING_TABLE_PADDING, "#880", "#ffd", "#440");
				}
			}
		}
		
		
		context.font = "" + NODE_FONT_SIZE + "px 'monospace'";
		context.textAlign = "center";
		context.textBaseline = "middle";
		for(var name in map.nodes){
			var node = map.nodes[name];
			if(node.hidden && selected_node != node && pointed_node != node){
				continue;
			}
			
			if(is_selected(node)){
				context.lineWidth = 4;
				context.strokeStyle = "#f88";
				context.fillStyle = "#f88";
			}else if(pointed_node == node){
				context.lineWidth = 4;
				context.strokeStyle = "#f88";
				context.fillStyle = "#fdd";
			}else{
				context.lineWidth = 2;
				context.strokeStyle = "#88f";
				context.fillStyle = "#ddf";
			}
			
			if(node.type == TYPE_ROUTER){
				context.fillRect(node.x - NODE_SIZE / 2, node.y - NODE_SIZE / 2, NODE_SIZE, NODE_SIZE);
				context.strokeRect(node.x - NODE_SIZE / 2, node.y - NODE_SIZE / 2, NODE_SIZE, NODE_SIZE);
			}else{
				context.beginPath();
				context.arc(node.x, node.y, NODE_SIZE / 2, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				context.stroke();
			}
			
			if(is_selected(node)){
				context.fillStyle = "#fff";
			}else if(pointed_node == node){
				context.fillStyle = "#f00";
			}else{
				context.fillStyle = "#00f";
			}
			if(routing.value != ROUTING_SWITCH || node.type == TYPE_CLIENT){
				context.fillText(name, node.x, node.y);
			}
		}
		
		if(multiple_selection_info != null){
			context.strokeStyle = "#888";
			context.lineWidth = 1;
			context.strokeRect(multiple_selection_info.left, multiple_selection_info.top, multiple_selection_info.width, multiple_selection_info.height);
		}
		
		
		context.lineWidth = 2;
		packets.sort(packet_sorter);
		for(var i = 0; i < packets.length; i ++){
			var packet = packets[i];
			draw_packet(packet, packet.x, packet.y);
		}
	}
	
	function is_selected(node){
		if(selected_node == node){
			return;
		}
		if(multiple_selected_objs != null){
			return multiple_selected_objs[node.name];
		}
		return false;
	}
	
	
	function rearrange_texts(texts){
		texts.sort();
		var length = 0;
		for(var i = 0; i < texts.length; i ++){
			length += texts[i].length;
		}

		var n = Math.floor(Math.sqrt(length));
		var new_texts = [];
		for(var i = 0; i < texts.length; i ++){
			var text = texts[i];
			if(i == 0){
				new_texts[0] = text;
			}else{
				new_texts[new_texts.length - 1] += ",";
				if(new_texts[new_texts.length - 1].length >= n){
					new_texts.push("");
				}
				new_texts[new_texts.length - 1] += text;
			}
		}
		return new_texts;
	}
	
	
	function draw_packet(packet, x, y){
		var texts = [packet.from + "→" + packet.to];
		if(packet.payload != null && elements.control_packet_display.value == "detailed"){
			texts = texts.concat(packet.payload());
		}
		if(packet.ttl != null){
 			texts[0] += "[" + packet.ttl + "]";
 		}
		
		context.font = "" + PACKET_FONT_SIZE + "px 'monospace'";
		
		var w = calc_text_box_width(texts);
		var h = PACKET_FONT_SIZE * texts.length;
		
		var col1, col2, col3;
		if(packet.color != null){
			col1 = packet.color[0];
			col2 = packet.color[1];
			col3 = packet.color[2];
		}else{
			col1 = "#080";
			col2 = "#dfd";
			col3 = "#080";
		}
		
		draw_text_box(texts, x - w / 2, y - h / 2, w, PACKET_FONT_SIZE, 2, col1, col2, col3);

	}
	
	
	function clear_network(){
		pointet_obj = null;
		map.nodes = {};
		map.links = {};
	}
	
	
	Lib.execute_on_load(initialize);
})();
