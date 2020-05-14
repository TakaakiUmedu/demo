
/// <reference path="./lib.ts" />

namespace Lib{
	function camelToSnake(str: string){
		return str.replace(/([A-Z])/g, (match, p1)=> "-" + p1.toLowerCase());
	}
	
	export namespace Dom{
		export type Attribute = Lib.Hash<boolean | number | string | EventListenerOrEventListenerObject | Lib.Hash<Lib.Something>>;
		export function elem(name: string, attributes?: Attribute | null, ...args: Lib.Something[]): HTMLElement{
			let element = document.createElement(name);
			setAttributes(element, attributes);
			add(element, args);
			return element;
		}
		
		export function setAttributes(element: HTMLElement, attributes?: Attribute | null){
			if(attributes){
				for(let a_name in attributes){
					let match;
					let a_value = attributes[a_name];
					if((a_name == "style" || a_name == "dataset") && typeof(a_value) === "object"){
						let sub_table = a_value as Lib.Hash<Lib.Something>;
						if(a_name == "style"){
							for(let s_name in sub_table){
								element.style[s_name as any] = sub_table[s_name].toString();
//								element.style.setProperty(camelToSnake(s_name), sub_table[s_name].toString());
							}
						}else{
							for(let s_name in sub_table){
								element.dataset[s_name] = sub_table[s_name].toString();
							}
						}
					}else if(a_name == "className"){
						element.className = a_value.toString();
					}else if(match = a_name.match(/^on(.*)/)){
						let event = match[1];
						let callback: EventListenerOrEventListenerObject;
						if(a_value instanceof Function){
							callback = a_value;
						}else if(typeof(a_value) === "object" && a_value.hasOwnProperty("handleEvent")){
							callback = a_value as EventListenerObject;
						}else{
							callback = new Function(a_value.toString()) as EventListener;
						}
						element.addEventListener(event, callback);
					}else{
						element.setAttribute(a_name, a_value.toString());
					}
				}
			}
		}
		
		export function input(type: string, attributes?: Attribute | null, ...args: Lib.Something[]): HTMLInputElement{
			let element = elem("input", attributes, args) as HTMLInputElement;
			element.type = type;
			return element;
		}
		export function form(attributes?: Attribute | null, ...args: Lib.Something[]): HTMLFormElement{
			return elem("form", attributes, args) as HTMLFormElement;
		}

		export function checkbox(label: Lib.Something, attributes?: Attribute | null){
			let checkbox = input("checkbox", attributes);
			let element = elem("label", null, checkbox, label);
			return {
				checkbox: checkbox,
				label: element,
			};
		}
		
		export function radio(label: Lib.Something, attributes?: Attribute | null){
			let radio = input("radio", attributes);
			let element = elem("label", null, radio, label);
			return {
				radio: radio,
				label: element,
			};
		}
		
		export type RadioData = {
			value: string,
			label? : Lib.Something,
			attributes?: Attribute,
		};
		
		export function radios(name: string, attributes?: Attribute | null, ...items: (RadioData | string)[]): {labels: HTMLElement[], radios: HTMLInputElement[]}{
			let first_radio: HTMLInputElement | null = null;
			let radios: HTMLInputElement[] = [];
			let labels: HTMLElement[] = [];
			let checked = false;
			
			for(let i = 0; i < items.length; i ++){
				let item = items[i];
				let value : string;
				let label : Lib.Something;
				let additional_attributes: Attribute | undefined;
				if(typeof(item) === "string"){
					value = label =item;
					additional_attributes = undefined;
				}else{
					value = item.value;
					if(item.label){
						label = item.label;
					}else{
						label = value;
					}
					additional_attributes = item.attributes;
				}
				let {radio, label: radio_label} = Dom.radio(label, attributes);
				radio.name = name;
				radio.value = value;
				setAttributes(radio, additional_attributes);
				
				if(radio.checked){
					checked = true;
				}
				if(!first_radio){
					first_radio = radio;
				}
				radios.push(radio);
				labels.push(radio_label);
			}
			if(!checked && first_radio){
				first_radio.checked = true;
			}
			
			return {labels, radios};
		}
		
		export function text(str: Lib.Something) : Text{
			return document.createTextNode(str.toString());
		}
		
		type Target = string | number | Element | Object;
		
		export function prepareTarget(target : Target): Element{
			if(target instanceof Element){
				return target;
			}else{
				let element = document.getElementById(target.toString());
				if(element){
					return element;
				}else{
					throw "cannot find target: " + target.toString();
				}
			}
		}
		
		export function get(id: string): HTMLElement{
			let element = document.getElementById(id);
			if(element){
				return element;
			}else{
				throw "cannot find target: " + id.toString();
			}
		}
		
		
		function add_one(element: Element, item: Lib.Something): void{
			if(item !== null && item !== undefined){
				element.appendChild(item instanceof Node ? item : text(item));
			}
		}

		export function insert_first(target: Target, ...args: Lib.Something[]): void{
			let list: Lib.Something[] = [];
			Lib.for_each_recursive(args, (item) => list.push(item));
			let element = prepareTarget(target);
			for(let i = list.length - 1; i >= 0; i --){
				element.insertBefore(to_element(list[i]), element.firstChild);
			}
		}

		
		export function add(target: Target, ...args: Lib.Something[]): void{
			let element = prepareTarget(target);
			Lib.for_each_recursive(args, (item) => add_one(element, item));
		}
		
		export function to_element(item: Lib.Something): Node{
			if(item instanceof Node){
				return item;
			}else{
				return text(item.toString());
			}
		}
		
		export function clear(target: Target): void{
			let element = prepareTarget(target);
			let c: Node | null;
			while(c = element.firstChild){
				element.removeChild(c);
			}
		}
		
		export function has_class(target: Target, value: string): boolean{
			let element = prepareTarget(target);
			return element.className != undefined && (" " + element.className + " ").indexOf(" " + value + " ") >= 0;
		}
		
		export function addClass(target: Target, value: string): string{
			let element = prepareTarget(target);
			if(element.className == undefined || element.className == ""){
				return element.className = value;
			}else if(has_class(element, value)){
				return element.className;
			}else{
				return element.className += " " + value;
			}
		}
	
		export function deleteClass(target: Target, value: string): string{
			let element = prepareTarget(target);
			if(element.className == undefined || element.className == ""){
				return "";
			}else{
				let classNames = element.className.split(" ");
				let new_classNames: string[] = [];
				for(let i = 0; i < classNames.length; i ++){
					let name = classNames[i];
					if(name.length > 0 && name != value){
						new_classNames.push(name);
					}
				}
				return element.className = new_classNames.join(" ");
			}
		}
		
		export function for_each(name: string, func: (element: Element)=>void, element?: Element | Document){
			if(element === undefined){
				element = document;
			}
			let children = element.getElementsByTagName(name);
			for(let i = 0; i < children.length; i ++){
				func(children[i]);
			}
		}
		
		export function clone(element: Node, clone_id: boolean = true): Node | null{
			if(element instanceof HTMLElement){
				let new_element = elem(element.nodeName.toLowerCase());
				for(let i = 0; i < element.attributes.length; i ++){
					let attribute = element.attributes[i];
					if(attribute.name == "id" && !clone_id){
						continue;
					}
					if(attribute.name == "style"){
						let sub_table = element.style;
						for(let s_name in sub_table){
							new_element.style[s_name] = sub_table[s_name];
						}
					}else{
						let match = attribute.name.match(/^data-(.*)/);
						if(match == null){
							new_element.setAttribute(attribute.name, attribute.value);
						}
					}
				}
				if(element instanceof HTMLElement){
					for(let name in element.dataset){
						new_element.dataset[name] = element.dataset[name];
					}
				}
				for(let child = element.firstChild; child != null; child = child.nextSibling){
					let new_child = clone(child, clone_id);
					if(new_child){
						new_element.appendChild(new_child);
					}
				}
				return new_element;
			}else if(element instanceof Text){
				return text(element.nodeValue || "");
			}else{
				return null;
			}
		}
		export function br(){
			return elem("br");
		}
		
		export function canvas(): HTMLCanvasElement{
			return document.createElement("canvas") as HTMLCanvasElement;
		}
		export function canvas2D(): {canvas: HTMLCanvasElement, context: CanvasRenderingContext2D}{
			let canvas = Dom.canvas();
			let context = canvas.getContext("2d") as CanvasRenderingContext2D;
			return {canvas, context};
		}
		
		export class ElementWithText{
			public readonly elem: HTMLElement;
			public readonly text: Text;
			public constructor(tagName: string, text: string, attributes?: Attribute | null){
				this.text = Dom.text(text);
				this.elem = elem(tagName, attributes, this.text);
			}
			public setText(text: string){
				this.text.nodeValue = text;
			}
			public getText(): string{
				return this.text.nodeValue || "";
			}
		}
		
		export function setText(elem: Node, text: any): boolean{
			if(elem instanceof HTMLElement){
				let child = elem.firstChild;
				while(child !== null){
					if(child instanceof Node && setText(child, text)){
						return true;
					}
					child = child.nextSibling;
				}
			}else if(elem instanceof Text){
				let str: string;
				if(typeof(text) === "string"){
					str = text;
				}else{
					str = text.toString();
				}
				elem.nodeValue = str;
			}
			return false;
		}
	}
}
