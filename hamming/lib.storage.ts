/// <reference path="./lib.ts" />

type RawStorage = Storage;

namespace Lib{
	export class Storage{
		private readonly storage: RawStorage;
		private readonly base: string;
		public constructor(storage?: RawStorage, base?: string){
			if(storage == null){
				this.storage = localStorage;
			}else{
				this.storage = storage;
			}
			if(base == null){
				let pathname = window.location.pathname;
				let match = pathname.match(/\/[^\/]+$/);
				if(match != null && match.index){
					base = window.location.pathname.substr(0, match.index + 1);
				}else if(pathname.match(/\/$/) != null){
					base = window.location.pathname;
				}else{
					base = window.location.pathname + "/";
				}
			}
			this.base = base;
		}
		public save(name: string, obj: Lib.Something): void{
			this.storage.setItem(this.base + name, JSON.stringify(obj));
		}
		public load(name: string): Something | null{
			let data = this.storage.getItem(this.base + name);
			if(data != null){
				return JSON.parse(data);
			}else{
				return null;
			}
		}
		public save_form(name: string, id?: string): void{
			if(id == null){
				id = name;
			}
			let form = document.getElementById(id);
			if(form != null){
				let table: {[name: string]: Lib.Something} = {};
				Lib.for_all_children(form, function(element){
					let name = get_element_name(element);
					if(name != null && element instanceof HTMLInputElement){
						if(element.value){
							table[name] = element.value;
						}
					}
					return true;
				});
				this.save(name, table);
			}
		}
		public load_form(name: string, id?: string): void{
			if(id == null){
				id = name;
			}
			let form = document.getElementById(id);
			if(form != null){
				let table_tmp: Lib.Something | null = this.load(name);
				if(table_tmp){
					let table = table_tmp as Lib.Hash<Lib.Something>;
					Lib.for_all_children(form, function(element){
						let name = get_element_name(element);
						if(name && (element instanceof HTMLInputElement) && table[name]){
							element.value = table[name].toString();
						}
						return true;
					});
				}
			}
		}
		public static enumerateAsArray(array: Lib.Something, func: (item: Lib.Something)=> void){
			if(Array.isArray(array)){
				for(let i = 0; i < array.length; i ++){
					func(array[i]);
				}
			}else{
				throw "not array";
			}
		}
		public static enumerateAsHash(hash: Lib.Something, func: (name: string, value: Lib.Something)=> void){
			if(typeof(hash) === "object"){
				let _hash = hash as any;
				for(let name in _hash){
					let value = _hash[name];
					if(value){
						func(name, value);
					}
				}
			}else{
				throw "not hashtable";
			}
		}
	}
	
	let INPUTS_TO_BE_SAVED : {[type: string]: boolean}= {
		text: true,
		number: true,
	};
	
	function get_element_name(element: Node): string | null{
		if(element instanceof Element){
			if(element instanceof HTMLInputElement){
				if(!INPUTS_TO_BE_SAVED[element.type]){
					return null;
				}
			}else if(element instanceof HTMLSelectElement){
				if(element.name != null && element.name != ""){
					return element.name;
				}
				if(element.id != null && element.id != ""){
					return element.id;
				}
			}
		}
		return null;
	}
	
	
	Lib.Storage = Storage;
}
