/// <reference path="../script/lib.ts" />
/// <reference path="../script/lib.dom.ts" />

namespace Lib{
	const Dom = Lib.Dom;

	export class DialogWindow{
		private static createShield(){
			let shield = Dom.elem("div", {style: {borderWidth: 0, padding: 0, margin : 0, width: "10px", height: "10px", top: 0, left: 0, position: "absolute", visible: "hidden", zIndex: -1}});
			shield.addEventListener("click", DialogWindow.close_callback, false);
			shield.style.top    = "0";
			shield.style.left   = "0";
//			shield.style.display = "none";
			shield.style.zIndex = "1";
			return shield;
		}
		private static resized_callback(){
			DialogWindow.shield.style.width  = document.body.offsetWidth + "px";
			DialogWindow.shield.style.height = document.body.offsetHeight + "px";
		};
		private static close_callback(){
			let dialog = DialogWindow.dialogs_shown[DialogWindow.dialogs_shown.length - 1];
			if(dialog){
				dialog.close();
			}
		}
		
		
		private static readonly shield: HTMLElement = DialogWindow.createShield();
		private static readonly dialogs_shown : DialogWindow[] = [];
		private static shield_shown: boolean = false;
		
		private static show_shield(){
			if(!DialogWindow.shield_shown){
				window.addEventListener("resize", DialogWindow.resized_callback, true);
				DialogWindow.resized_callback();
				document.body.appendChild(DialogWindow.shield);
				DialogWindow.shield_shown = true;
			}
		}
		private static hide_shield(){
			if(DialogWindow.shield_shown){
				document.body.removeChild(DialogWindow.shield);
				window.removeEventListener("resize", DialogWindow.resized_callback, true);
				DialogWindow.shield_shown = false;
			}
		}

		
		private readonly window: HTMLElement;
		private readonly buttons: Lib.Hash<HTMLElement>;
		private shown: boolean;
		private close_callback: DialogWindow.CallbackFunction | undefined | null;
		
		public constructor(div: HTMLElement, button_handlers: Lib.Hash<EventListenerOrEventListenerObject>){

			if(typeof(div) == "string"){
				this.window = document.getElementById(div) as HTMLElement;
			}else{
				this.window = div;
			}
			this.window.style.position = "absolute";
			this.window.style.display = "none";
			this.window.style.zIndex = "-1";
			this.buttons = {};
			this.shown = false;
			for(var id in button_handlers){
				var button = document.getElementById(id);
				if(button){
					button.addEventListener("click", button_handlers[id], false);
					this.buttons[id] = button;
				}
			}
		}
		

		private show_message_queue: DialogWindow.ShowOption[] = [];
		
		public show(show_option?: DialogWindow.ShowOption){
			if(!show_option){
				show_option = {};
			}
			if(this.shown){
				this.show_message_queue.push(show_option);
				this.close();
			}else{
				const style = this.window.style;
				this.close_callback = show_option.close_callback;
				DialogWindow.show_shield();
				DialogWindow.dialogs_shown.push(this);
				if(show_option.width !== undefined){
					style.width = show_option.width + "px";
				}
				if(show_option.height !== undefined){
					style.height = show_option.height + "px";
				}
				
				style.zIndex = "2";
				style.visibility = "hidden";
				style.display = "";

				if(show_option.left === "center"){
					style.left = (window.innerWidth / 2 - this.window.offsetWidth / 2) + "px";
				}else if(show_option.left !== undefined){
					style.left = "0px";
					style.left = Math.max(0, Math.min(show_option.left, document.body.offsetWidth - this.window.offsetWidth)) + "px";
				}
				if(show_option.top === "center"){
					style.top = (window.innerHeight / 2 - this.window.offsetHeight / 2) + "px";
				}else if(show_option.top !== undefined){
					style.top = "0px";
					style.top = Math.max(0, Math.min(show_option.top, document.body.offsetHeight - this.window.offsetHeight)) + "px";
				}
				style.visibility = "visible";
				this.shown = true;
			}
		}
		
		public close(data?: Lib.Something | null){
			if(this.shown){
				this.window.style.display = "none";
				this.window.style.zIndex = "-1";
				this.shown = false;
				let index = DialogWindow.dialogs_shown.indexOf(this);
				if(index >= 0){
					DialogWindow.dialogs_shown.splice(index, 1);
					if(DialogWindow.dialogs_shown.length == 0){
						DialogWindow.hide_shield();
					}
				}
				let close_callback = this.close_callback;
				if(close_callback){
					this.close_callback = null;
					close_callback(data);
				}
				let show_option = this.show_message_queue.shift();
				if(show_option){
					this.show(show_option);
				}
			}
		}
	}

	export namespace DialogWindow{
		export type CallbackFunction = (data?: Lib.Something | null)=> void;
		export type ShowOption = {
			left?: number | "center",
			top?: number | "center",
			width?: number,
			height?: number,
			close_callback?: DialogWindow.CallbackFunction | null,
		};
	}
}
