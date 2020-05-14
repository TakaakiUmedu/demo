
namespace Lib{
	export var gTouchDevice = false;
	
	export type Something = boolean | number | string | Object;
	export type Hash<V> = { [key: string]: V };
	export type GeneralHash = Hash<Something>;
	
	function set_user_agent(){
		if(window.ontouchstart){
			gTouchDevice = true;
		}
	}
	
	export function clone_object(obj: Object): Object{
		let ret = {};
		for(let name in obj){
			Object.defineProperty(ret, name, Object.getOwnPropertyDescriptor(obj, name));
		}
		return ret;
//		return Object.assign({}, obj);
	}
	
	export function to_px(val: number): string{
		if(val > 0.1){
			return "" + Math.round(val) + "px";
		}else if(val < -0.1){
			return "-" + Math.round(-val) + "px";
		}else{
			return "0px";
		}
	}
	
	
	var gDebgugWindow : HTMLElement | null = null;

	function arguments_to_message(...args: any[]): string{
		var message = "";
		if(args.length > 0){
			message = args[0];
			for(var i = 1; i < args.length; i ++){
				message += "," + args[i].toString();
			}
		}
		return message;
	}
	
	export function debug_output(...args: any[]): void{
		var message = arguments_to_message(args);
		var p_element = document.createElement("p");
		p_element.appendChild(document.createTextNode(message));

		var debug_window_div = document.getElementById("debug_window");
		if(debug_window_div){
			debug_window_div.appendChild(p_element);
		}else{
			if(gDebgugWindow == null){
				var div = document.createElement("div");
				div.style.position = "absolute";
				div.style.borderStyle = "solid";
				div.style.borderColor = "black";
				div.style.borderWidth = "2px";
				div.style.padding = "0px";
				div.style.backgroundColor = "white";
				div.style.color = "black";
				div.style.fontSize = "small";
				div.style.fontFamily = "monospace";
				
				document.body.appendChild(div);
				
				gDebgugWindow = div;
			}
			p_element.style.border = "0px";
			p_element.style.margin = "0px";
			p_element.style.padding = "0px";
			p_element.style.textIndent = "0px";
			gDebgugWindow.style.top = to_px(document.documentElement.scrollTop);
			if(gDebgugWindow.firstChild != null){
				gDebgugWindow.insertBefore(p_element,gDebgugWindow.firstChild);
			}else{
				gDebgugWindow.appendChild(p_element);
			}
		}
	}

	export function info_output(...args: any[]): void{
		var message = arguments_to_message(args);
		var p_element = document.createElement("p");
		p_element.appendChild(document.createTextNode(message));
		var info_div = document.getElementById("info");
		if(info_div){
			info_div.appendChild(p_element);
		}else{
			document.body.appendChild(p_element);
		}
	}
	
	export function do_nothing(...args: any[]): void{
	}

	function set_execute_on_load_handler(event_name: string, target: HTMLImageElement | Window, handler: ()=> void): void{
		if(document.readyState == "complete"){
			handler();
		}else{
			var initialized = false;
			var func = function(){
				if(initialized){
					return;
				}
				initialized = true;
				handler();
				target.removeEventListener(event_name, func, false);
			}
			target.addEventListener(event_name, func, false);
		}
	}

	export function execute_on_dom_load(handler: ()=> void, element: Document): void{
		set_execute_on_load_handler("DOMContentLoaded", window, handler);
	}

	export function execute_on_load(handler: (element?: HTMLImageElement)=> void, image: HTMLImageElement): void;
	export function execute_on_load(handler: ()=> void): void;
	export function execute_on_load(handler: ((element?: HTMLImageElement)=> void) | (()=> void), image?: HTMLImageElement): void{
		if(image === undefined){
			set_execute_on_load_handler("load", window, handler);
		}else{
			let new_handler: (element?: HTMLImageElement)=> void = handler;
			set_execute_on_load_handler("load", image, ()=>{ new_handler(image); });
		}
	}
	
	export function get_elements_with_id(...args: string[]): { [id: string] : Element}{
		var inputs: { [id: string] : Element} = {};
		for(var i = 0; i < args.length; i ++){
			var list = document.getElementsByTagName(args[i]);
			for(var j = 0; j < list.length; j ++){
				var item = list[j];
				if(item.id != null){
					inputs[item.id] = item;
				}
			}
		}
		return inputs;
	}
	
	export function for_all_children(element: Node, func: (element: Node) => boolean): boolean{
		if(func(element) == false){
			return false;
		}
		for(var child = element.firstChild; child != null; child = child.nextSibling){
			if(for_all_children(child, func) == false){
				return false;
			}
		}
		return true;
	}
	
	export function indexer(){
		var index = 0;
		return function(){
			return index ++;
		}
	}
	
	export function for_each_recursive(item: Something, callback: (item: Something) => void){
		if(Array.isArray(item)){
			for(var i = 0; i < item.length; i ++){
				for_each_recursive(item[i], callback);
			}
		}else{
			callback(item);
		}
	}

	export class StableHash<V>{
		private readonly list: string[];
		private readonly table: {[key: string]: V};
		public constructor(){
			this.list = [];
			this.table = {};
		}
		public push(key: string, value: V): void{
			if(this.table[key] == undefined){
				this.list.push(key);
				this.table[key] = value;
			}
		}
		public get(key: string): V | undefined{
			return this.table[key];
		}
		public forEach(callback: (key: string, value: V, index: number) => void | boolean): void{
			let list = this.list.concat();
			for(let i = 0; i < list.length; i ++){
				let key = list[i];
				if(callback(key, this.table[key], i) === false){
					break;
				}
			}
		}
		public remove(key: string): void{
			let index = this.list.indexOf(key);
			if(index >= 0){
				this.list.splice(index, 1);
			}
			if(this.table[key]){
				delete this.table[key];
			}
		}
		public keys(): string[]{
			return this.list.concat();
		}
		public values(): V[]{
			return this.list.map((key)=> { return this.table[key]; });
		}
		public count(): number{
			return this.list.length;
		}
		public map<T>(callback: (key: string, value: V, index: number)=> T): T[]{
			return this.list.map((key, index)=> {
				return callback(key, this.table[key], index);
			});
		}
		public freeze(){
			Object.freeze(this.list);
			Object.freeze(this.table);
		}
	}

	
	set_user_agent();
}
