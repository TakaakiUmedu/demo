///<reference path="mylib/mylib.ts"/>
///<reference path="mylib/mylib.dom.ts"/>

namespace Table{
	const ID = "TABLE_DIV"
	const NO_GRIDS = "NO_GRIDS"
	const MONOSPACE = "MONOSPACE"
	const TAB = "TAB";
	const TAB_WIDTH = 4;
	const Dom = Lib.Dom;
	function makeToggleCheckboxCallback(checkbox: HTMLInputElement, checkFunc: ()=> void, uncheckFunc: ()=> void){
		return ()=> {
			if(checkbox.checked){
				checkFunc();
			}else{
				uncheckFunc();
			}
		};
	}
	function makeToggleCheckbox(label: string, checkFunc: ()=> void, uncheckFunc: ()=> void, checked: boolean = true){
		const checkbox = Dom.input("checkbox", { checked: checked });
		const callback = makeToggleCheckboxCallback(checkbox, checkFunc, uncheckFunc);
		Dom.addEventListener(checkbox, "click", callback);
		callback();
		return Dom.elem("label", {}, checkbox, label);
	}
	class Main{
		public static initialize(){
			document.write("<div id=\"" + ID + "\"></div>")
			Lib.executeOnDomLoad(()=>{
				new Main();
			});
		}
		private div = Dom.getElement(ID);
		private textarea: HTMLTextAreaElement;
		private table: HTMLTableElement;
		private drawGrids: HTMLInputElement;
		private constructor(){
			if(document.head !== null){
				Dom.append(document.head, Dom.elem("link", {rel: "stylesheet", href: "table.css"}));
			}
			this.textarea = Dom.elem("textarea", {cols: 80, rows: 20}, "ここにチェックしたいテキストをコピー&ペースト\n\n+-------------------+\n| 例えば  | 2,980円 |\n| example |   300円 |\n+-------------------+\n|  合計   | 3,280円 |\n+-------------------+\n");
			this.table = Dom.elem("table");
			const button = Dom.input("button", {value: "↓チェック↓", onclick: this.check});
			const drawGrids = makeToggleCheckbox("↓に罫線を表示", ()=> Dom.removeClass(this.table, NO_GRIDS), ()=> Dom.appendClass(this.table, NO_GRIDS));
			const monospace = makeToggleCheckbox("↑を(なるべく)等幅フォントで表示", ()=> Dom.appendClass(this.textarea, MONOSPACE), ()=> Dom.removeClass(this.textarea, MONOSPACE));
			Dom.append(this.div, Dom.elem("p", null, "出力チェッカー"), this.textarea, Dom.elem("p", null, button, drawGrids, monospace), this.table);
		}
		private readonly check = ()=> {
			Dom.clear(this.table);
			const firstTr = Dom.elem("tr", null, Dom.elem("th", null, ""));
			const widthList: number[] = [];
			const trList: HTMLTableRowElement[] = [];
			Dom.append(this.table, firstTr);
			let maxWidth = 1;
			let count = 1;
			for(const line of this.textarea.value.split("\n")){
				const tr = Dom.elem("tr", null, Dom.elem("th", null, ""  + (count % 10)));
				let width = 0;
				for(const c of line.split("")){
					const code = c.charCodeAt(0);
					if(code == 0x09){
						const td = Dom.elem("td", { className: TAB }, "\u21E5")
						Dom.append(tr, td);
						width ++;
						let w = 1;
						while(width % TAB_WIDTH != 0){
							width ++;
							w ++;
						}
						td.colSpan = w;
						Dom.appendClass(td, "w" + w);
					}else{
						const td = Dom.elem("td", null, c);
						Dom.append(tr, td);
						if(code > 0xff){
							td.colSpan = 2;
							width += 2;
						}else{
							width ++;
						}
					}
				}
				if(maxWidth < width){
					maxWidth = width;
				}
				widthList[count] = width;
				trList[count] = tr;
				Dom.append(this.table, tr);
				count += 1;
			}
			for(let i = 0; i < maxWidth; i ++){
				Dom.append(firstTr, Dom.elem("th", null, ""  + (i % 10)));
			}
			for(let i = 0; i < count; i ++){
				const tr = trList[count];
				const width = maxWidth - widthList[i];
				for(let j = 0; j < width; j ++){
					Dom.append(trList[i], Dom.elem("td"));
				}
			}
		};
	}
	
	Main.initialize()
}

