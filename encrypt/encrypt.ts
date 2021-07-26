/// <reference path="../mylib/mylib.dom.ts"/>

namespace Demo{
	const Dom = Lib.Dom;
	
	const ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	const UPPER2INDEX: Lib.Hash<number> = {};
	
	const GRAPH_WIDTH = 50;
	
	type Modes = "CAESAR" | "Substitution" | "Polyalphabetic";
	
	class Encryption{
		public static initialize(){
			new Encryption();
		}
		
		private replaceList: string[] = [];
		
		private makeSpan(c: string){
			return Dom.elem("span", { className: "not_assigned", dataset: { c : c } }, c);
		}
		
		private readonly elems = Dom.collect(
			HTMLInputElement, ["encrypt", "import", "toggle_dst", "toggle_src_panel1", "toggle_src_panel2", "input_dst", "input_src"],
			HTMLTextAreaElement, ["src"],
			HTMLSelectElement, ["mode"],
			HTMLElement, ["dst", "graph_1", "graph_2", "graph_3", "src_panel", "table", "guess"]
		);
		
		private import = ()=> {
			this.import_target_str(false);
		}
		private encrypt = ()=> {
			this.import_target_str(true);
		}
		private import_target_str(encrypt: boolean){
			const src = this.elems.src.value;
			Dom.clear(this.elems.dst);
			let dst_str = "";
			let curWord = null;
			for(let i = 0; i < src.length; i ++){
				const s = src[i];
				const sU = s.toUpperCase();
				const isLower = (sU !== s);
				const index = UPPER2INDEX[sU];
				if(index == undefined){
					Dom.append(this.elems.dst, s);
					curWord = null;
					if(s == ' ' || s == '.'){
						dst_str += s;
					}
				}else{
					let c = encrypt ? this.replaceList[(index + (this.mode == "Polyalphabetic" ? i : 0)) % ALPHABETS.length] : ALPHABETS[index];
					if(isLower){
						c = c.toLowerCase();
					}
					if(curWord == null){
						curWord = document.createElement("span");
						curWord.className = "word";
						Dom.append(this.elems.dst, curWord);
					}
					Dom.append(curWord, this.makeSpan(c));
					dst_str += c;
				}
			}
			
			const counts_1: Lib.Hash<number> = {};
			const counts_2: Lib.Hash<number> = {};
			const counts_3: Lib.Hash<number> = {};
			let c1 = "";
			let c2 = "";
			for(let i = 0; i < dst_str.length; i ++){
				let c0 = dst_str[i].toUpperCase();
				if(UPPER2INDEX[c0] !== undefined){
					if(counts_1[c0] == undefined){
						counts_1[c0] = 1;
					}else{
						counts_1[c0] ++;
					}
					if(i > 0 && UPPER2INDEX[c1] !== undefined){
						const p = c1 + c0;
						if(counts_2[p] == undefined){
							counts_2[p] = 1;
						}else{
							counts_2[p] ++;
						}
						if(i > 1 && UPPER2INDEX[c2] !== undefined){
							const t = c2 + p;
							if(counts_3[t] == undefined){
								counts_3[t] = 1;
							}else{
								counts_3[t] ++;
							}
						}
					}
				}
				c2 = c1;
				c1 = c0;
			}
			this.makeGraph(this.elems.graph_1, "出現回数", counts_1);
			this.makeGraph(this.elems.graph_2, "出現回数(2文字)", counts_2);
			this.makeGraph(this.elems.graph_3, "出現回数(3文字)", counts_3);
	
			this.hideSrcPanel();
			
			this.updateTables();
		}
		
		private makeGraph(graph: HTMLElement, caption: string, data: Lib.Hash<number>){
			const list: [string, number][] = [];
			let max = 0;
			for(let c in data){
				let count = data[c];
				list.push([c, count]);
				if(max < count){
					max = count;
				}
			}
			list.sort((a, b) => {
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
			});
	
			const itemCount = Math.min(ALPHABETS.length, list.length);
	
//			const graph = document.getElementById(id);
			Dom.clear(graph);
			Dom.append(graph, Dom.elem("caption", caption));
	
			for(let i = 0; i < itemCount; i ++){
				const c = list[i][0];
				const count = list[i][1];
				const tr = Dom.elem("tr");
				const td = Dom.elem("td");
				for(let j = 0; j < c.length; j ++){
					Dom.append(td, this.makeSpan(c[j]));
				}
				td.appendChild(document.createTextNode(":" + count));
				tr.appendChild(td);
				const width = Math.floor(GRAPH_WIDTH * count / max);
				Dom.append(tr, Dom.elem("td", {style: {
					backgroundColor: "cyan", 
					width: "" + width + "px", 
					borderColor: "white", 
					borderWidth: "0 " + (GRAPH_WIDTH - width) + "px 0 0"
				}}));
				Dom.append(graph, tr);
			}
		}
		
		private prevUpdatedInput: HTMLInputElement | null = null;
		private prevUpdateInputValue: string | null = null;
		
		private updateGuess = (event: Event)=> {
			const target = event.target;
			if(target === null || !(target instanceof HTMLInputElement) || target === this.prevUpdatedInput && target.value === this.prevUpdateInputValue){
				return;
			}
			
			this.prevUpdateInputValue = target.value;
			this.prevUpdatedInput = target;
			
			for(const cU of ALPHABETS){
				this.guessTableS2D[cU] = undefined;
				this.guessTableD2S[cU] = undefined;
			}
			this.updateTables();
		};
		private updateTables(){
			const srcTable = this.elems.input_dst.checked ? this.guessTableS2D : this.guessTableD2S;
			const dstTable = this.elems.input_dst.checked ? this.guessTableD2S : this.guessTableS2D;
			
			Dom.clear(this.unused);
			if(this.mode === "CAESAR"){
				const value = this.guessInputs[0].value.toUpperCase();
				const index = UPPER2INDEX[value];
				if(index !== undefined){
					for(let i = 0; i < ALPHABETS.length; i ++){
						const c = ALPHABETS[i];
						const value = ALPHABETS[(i + index) % ALPHABETS.length];
						this.guessInputs[i].value = value;
						srcTable[c] = value;
						dstTable[value] = c;
					}
				}else{
					for(let i = 0; i < ALPHABETS.length; i ++){
						const input = Dom.getInput("guess_" + ALPHABETS[i]);
						if(input !== this.guessInputs[0]){
							input.value = '';
						}
					}
					Dom.setText(this.unused, ALPHABETS.join(", "));
				}
			}else{
				const errors = new Set<string>();
				
				for(let i = 0; i < ALPHABETS.length; i ++){
					const src = ALPHABETS[i];
					const dstRaw = this.guessInputs[i].value;
					const dst = dstRaw.toUpperCase();
					if(dst !== ""){
						if(dst !== dstRaw){
							this.guessInputs[i].value = dst;
						}
						if(dstTable[dst] == undefined){
							dstTable[dst] = src;
						}else{
							errors.add(dst);
						}
					}
				}
				for(let i = 0; i < ALPHABETS.length; i ++){
					const dst = this.guessInputs[i].value.toUpperCase();
					if(errors.has(dst)){
						Dom.appendClass(this.guessInputs[i], "error");
						dstTable[dst] = undefined;
					}else{
						Dom.removeClass(this.guessInputs[i], "error");
						if(dst !== ""){
							srcTable[ALPHABETS[i]] = dst;
						}
					}
				}
				if(errors.size > 0){
					Dom.append(this.unused, Dom.elem("span", { style: { color: "red" } }, "割り当てが重複しています"));
				}else{
					Dom.append(this.unused, ALPHABETS.filter((c)=> dstTable[c] === undefined).join(", "));
				}
			}
			this.updateContent();
		}
		
		private updateContent(){
			let i = 0;
			for(const word of Dom.iterateChildNodes(this.elems.dst)){
				if(word instanceof Text){
					i ++;
					if(i >= ALPHABETS.length){
						i = 0;
					}
				}else if(word instanceof HTMLElement){
					for(const span of Dom.iterateChildElements(word)){
						let c = span.dataset.c;
						if(c !== undefined){
							const cU = c.toUpperCase();
							const isLower = (c !== cU);
							const n = UPPER2INDEX[cU]
							let value = this.guessTableD2S[cU];
							if(value !== undefined){
								if(this.mode == "Polyalphabetic"){
									value = ALPHABETS[(ALPHABETS.length + UPPER2INDEX[value] - i) % ALPHABETS.length];
								}
								if(isLower){
									value = value.toLowerCase();
								}
							}
							if(span.className == "not_assigned"){
								if(value != undefined){
									Dom.setText(span, value);
									span.className = "assigned";
								}
							}else{
								if(value == undefined){
									Dom.setText(span, c);
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
		};
		
		private createReplaceList(){
			if(this.mode == "CAESAR"){
				const shift = 1 + Math.floor(Math.random() * (ALPHABETS.length - 1));
				this.replaceList = [];
				for(let i = 0; i < ALPHABETS.length; i ++){
					this.replaceList[i] = ALPHABETS[(i + shift) % ALPHABETS.length];
				}
			}else{
				while(true){
					this.replaceList = ALPHABETS.concat([]);
					for(let i = 0; i < ALPHABETS.length; i ++){
						let j = Math.floor(Math.random() * ALPHABETS.length);
						let tmp = this.replaceList[j];
						this.replaceList[j] = this.replaceList[i];
						this.replaceList[i] = tmp;
					}
					let failed = false;
					for(let i = 0; i < ALPHABETS.length; i ++){
						if(this.replaceList[i] == ALPHABETS[i]){
							failed = true;
							break;
						}
					}
					if(failed){
						break;
					}
				}
			}
			
			const replaceTable: Lib.Hash<string> = {};
			for(let i = 0; i < ALPHABETS.length; i ++){
				let src = ALPHABETS[i];
				let dst = this.replaceList[i];
				replaceTable[src] = dst;
			}
		}
		
		private createReplaceTableColumn(title: string, list: string[], offset?: number | undefined){
			if(offset === undefined){
				offset = 0;
			}
			const tr = Dom.elem("tr", Dom.elem("th", title));
			
			for(let i = 0; i < list.length; i ++){
				Dom.append(tr, Dom.elem("td", list[(i + offset) % list.length]));
			}
			return tr;
		}
		
		private createReplaceTable(){
			Dom.clear(this.elems.table);
			
			this.createReplaceList();
			
			Dom.append(this.elems.table, this.createReplaceTableColumn("置換元", ALPHABETS));
			if(this.mode === "Polyalphabetic"){
				for(let i = 0; i < ALPHABETS.length; i ++){
					Dom.append(this.elems.table, this.createReplaceTableColumn("置換先" + (i + 1), this.replaceList, i));
				}
			}else{
				Dom.append(this.elems.table, this.createReplaceTableColumn("置換先", this.replaceList));
			}
		}
		
		
		private constructor(){
			for(let i = 0; i < ALPHABETS.length; i ++){
				UPPER2INDEX[ALPHABETS[i]] = i;
			}
			Dom.addEventListener(this.elems.encrypt, "click", this.encrypt);
			Dom.addEventListener(this.elems.import, "click", this.import);
			Dom.addEventListener(this.elems.toggle_dst, "click", this.toggleDst);
			Dom.addEventListener(this.elems.toggle_src_panel1, "click", this.toggleSrcPanel);
			Dom.addEventListener(this.elems.toggle_src_panel2, "click", this.toggleSrcPanel);
			Dom.addEventListener(this.elems.mode, "change", this.changeMode);
			Dom.addEventListener(this.elems.input_dst, "change", this.changeTableMode);
			Dom.addEventListener(this.elems.input_src, "change", this.changeTableMode);
			
			this.changeMode();
		}
		
		private readonly changeTableMode = ()=> {
			this.createGuessTable();
		};
		private guessInputs: HTMLInputElement[] = [];
		private readonly guessTableS2D: Lib.Hash<string | undefined> = {};
		private readonly guessTableD2S: Lib.Hash<string | undefined> = {};
		
		private createGuessTable(){
			Dom.clear(this.elems.guess);
			
			let trSrc: HTMLTableRowElement;
			let trDst: HTMLTableRowElement;
			let trInputs: HTMLTableRowElement;
			let table: Lib.Hash<string | undefined>;
			this.guessInputs = [];
			if(this.elems.input_dst.checked){
				trSrc = this.createReplaceTableColumn("置換元", ALPHABETS);
				trInputs = trDst = Dom.elem("tr", Dom.elem("th", "置換先"));
				table = this.guessTableS2D;
			}else{
				trDst = this.createReplaceTableColumn("置換先", ALPHABETS)
				trInputs = trSrc = Dom.elem("tr", Dom.elem("th", "置換元"));
				table = this.guessTableD2S;
			}
			for(let i = 0; i < ALPHABETS.length; i ++){
				const c = ALPHABETS[i];
				const input = Dom.elem("input", { type: "text", size: 1, maxLength: 1, id: "guess_" + c, style: {width: "2em"}, dataset: { c: c }});
				const guess = table[c];
				if(guess !== undefined){
					input.value = guess;
				}
				Dom.append(trInputs, Dom.elem("td", input));
				if(this.mode == "CAESAR" && i > 0){
					input.disabled = true;
				}else{
					Dom.addEventListener(input, "keyup", this.updateGuess);
				}
				this.guessInputs[i] = input;
			}
	
			Dom.append(this.elems.guess, trSrc);
			Dom.append(this.elems.guess, Dom.elem("tr", Dom.elem("th"), ALPHABETS.map(()=> Dom.elem("th", "↓"))));
			Dom.append(this.elems.guess, trDst);
			this.unused = Dom.elem("td", { className: "unused", colSpan: ALPHABETS.length });
			Dom.append(this.elems.guess, Dom.elem("tr"));
			Dom.append(this.elems.guess, Dom.elem("tr", Dom.elem("th", "未割り当て"), this.unused));
			
			this.updateTables();
		}
		
		private unused: HTMLElement;
		private mode: Modes | null = null;
		
		private readonly changeMode = ()=> {
			const newMode = this.elems.mode.value;
			
			if((newMode === "CAESAR" || newMode === "Substitution" || newMode === "Polyalphabetic") && newMode != this.mode){
				this.mode = newMode;
				this.createReplaceTable();
				for(const cU of ALPHABETS){
					this.guessTableD2S[cU] = undefined;
					this.guessTableS2D[cU] = undefined;
				}
				this.createGuessTable();
				Dom.clear(this.elems.dst);
				this.showSrcPanel();
			}
		};
		
		
		private toggleMessage(element: HTMLInputElement){
			const alt = element.dataset.alt;
			if(alt !== undefined){
				element.dataset.alt = element.value;
				element.value = alt;
			}
		}
		
		private toggleDst = (event: Lib.Dom.EventWith<MouseEvent, HTMLInputElement>)=> {
			this.toggleMessage(event.currentTarget);
			if(Dom.hasClass(this.elems.dst, "show")){
				Dom.removeClass(this.elems.dst, "show");
				Dom.appendClass(this.elems.dst, "hide");
			}else{
				Dom.removeClass(this.elems.dst, "hide");
				Dom.appendClass(this.elems.dst, "show");
			}
		};
		
		private showSrcPanel(){
			if(this.elems.src_panel.style.display == "none"){
				this.toggleSrcPanel();
			}
		}
	
		private hideSrcPanel(){
			if(this.elems.src_panel.style.display == ""){
				this.toggleSrcPanel();
			}
		}
		
		private toggleSrcPanel = () => {
			let mes: string;
			if(this.elems.src_panel.style.display == ""){
				this.elems.src_panel.style.display = "none";
				mes = "表示";
			}else{
				this.elems.src_panel.style.display = "";
				mes = "隠す";
			}
			
			for(const button of [this.elems.toggle_src_panel1, this.elems.toggle_src_panel2]){
				button.value = button.dataset.mes + mes;
			}
		};
	}
	
	
	Lib.executeOnDomLoad(Encryption.initialize);
	
}
