/// <reference path="source/demo.ts"/>

namespace RSADemo{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger;
	type BigInteger = Lib.BigInteger;
	
	{
		function initialize(checkParam: (name: string, defaultValue: string)=> string){
			const p = BigInteger.parse(13);
			
			Dom.get(HTMLInputElement, "p").value = checkParam("p", "" + p);
			
			return { p };
		}
		
		function reload(): ReturnType<typeof initialize>{
			const p = BigInteger.parse(Dom.get(HTMLInputElement, "p").value);
			
			return { p };
		}
		
		function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){
			const { p } = vars;
			
			{
				const Dom = Lib.Dom;
				const BigInteger = Lib.BigInteger;
				BigInteger.setLimitLength(50);
				
				class Calc{
					private static readonly LIMIT = 100;
			
					private readonly elem = Dom
						.collect(HTMLInputElement, "calculate", "p", "mod")
						.collect(HTMLSelectElement, "count")
						.collect(HTMLElement, "result")
					.table;
					
					public static initialize(){
						new Calc();
					}
					
					public constructor(){
						Dom.addEventListener(this.elem.calculate, "click", ()=>{
							this.calc(false);
						});
					}
					
					private p = 0;
					private xMax = 0;
					private yMax = 0;
					private trs: HTMLTableRowElement[] = [];
					private tbody: HTMLTableSectionElement = Dom.elem("tbody");
					private tfoot_tr: HTMLTableRowElement = Dom.elem("tr");
					private explanation = Dom.getElement("explanation");
					private calc(fast: boolean){
						this.p = parseInt(this.elem.p.value);
						this.yMax = this.p;
						this.xMax = 0;
						Dom.clear(this.elem.result);
						Dom.clear(this.tbody)
						Dom.clear(this.tfoot_tr)
						this.trs = [];
						
						const explanation = Dom.elem("div", { id: "demo"} );
						Dom.clear(this.explanation);
						Dom.append(this.explanation, explanation);
						const p = Dom.elem("p", { className: "demo-typeset" }, this.elem.mod.checked ? "$\\displaystyle x$ の $\\displaystyle y$ 乗 を $\\displaystyle p$ で割った余り、 $\\displaystyle x^y \\ \\% \\ p$" : "$\\displaystyle x$ の $\\displaystyle y$ 乗、$\\displaystyle x^y$", " を計算");
						Lib.MathDemo.getMathDemo().then((demo)=> {
							demo.modify(()=> {
								Dom.append(explanation, p);
								demo.typeset(p);
							});
						});
						const table = Dom.elem("table");
						Dom.append(this.elem.result, table);
						
						const tr = Dom.elem("tr", {}, Dom.elem("th", "x ＼ y"));
						Dom.append(tr, Dom.elem("th", { onclick: this.calcNextColumn }, Dom.elem("input", {type: "button", value: "続きを計算…"})));
						Dom.append(table, Dom.elem("thead", tr));
						Dom.append(table, this.tbody);
						this.trs.push(tr);
						for(let i = 0; i < this.yMax; i ++){
							const raw: HTMLTableDataCellElement[] = [];
							const tr = Dom.elem("tr", {}, Dom.elem("th", {}, i));
							Dom.append(tr, Dom.elem("td", {}, "…"));
							this.trs.push(tr);
							Dom.append(this.tbody, tr);
						}
						Dom.append(this.tfoot_tr, Dom.elem("th", Dom.elem("button", { type: "button", onclick: this.calcNextRow }, "続きを", Dom.br(), "計算…")), Dom.elem("td", "⋱"));
						Dom.append(table, Dom.elem("tfoot", this.tfoot_tr));
						this.calcNextColumn();
					}
					private readonly calcNextColumn = ()=>{
						const count = parseInt(this.elem.count.value);
						for(let i = 0; i < count; i ++){
							this.appendNewColumn();
						}
					}
					private readonly calcNextRow = ()=>{
						const count = parseInt(this.elem.count.value);
						for(let i = 0; i < count; i ++){
							this.appendNewRow();
						}
					}
					private calcCell(x: number, y: number, p: Lib.BigInteger): HTMLTableCellElement{
						let value: string;
						if(this.elem.mod.checked){
							value = BigInteger.parse(x).pow(y, p).toString();
						}else{
							value = BigInteger.parse(x).pow(y).toString();
						}
						const td = Dom.elem("td", {}, value);
						if(value === "" + x){
							Dom.appendClass(td, "init");
						}else if(value === "1"){
							Dom.appendClass(td, "one");
						}
						return td;
					}
					private appendNewColumn(){
						try{
							const tr = this.trs[0];
							tr.insertBefore(Dom.elem("th", {}, this.xMax), tr.lastChild);
							const p = BigInteger.parse(this.p);
							for(let i = 0; i < this.yMax; i ++){
								const tr = this.trs[i + 1];
								const td = this.calcCell(i, this.xMax, p);
								tr.insertBefore(td, tr.lastChild);
							}
							this.tfoot_tr.insertBefore(Dom.elem("td", "⋮"), this.tfoot_tr.lastChild);
							this.xMax ++;
						}catch(error){
							if(error instanceof BigInteger.TooLargeError){
								Lib.infoOutputFixed("エラー: 桁数が大きくなりすぎたので計算を中断しました。");
							}
						}
					}
					private appendNewRow(){
						try{
							const tr = Dom.elem("tr", Dom.elem("th", this.yMax));
							const p = BigInteger.parse(this.p);
							for(let y = 0; y < this.xMax; y ++){
								const td = this.calcCell(this.yMax, y, p);
								Dom.append(tr, td);
							}
							Dom.append(tr, Dom.elem("td", "…"));
							Dom.append(this.tbody, tr);
							this.trs.push(tr);
							this.yMax ++;
						}catch(error){
							if(error instanceof BigInteger.TooLargeError){
								Lib.infoOutputFixed("エラー: 桁数が大きくなりすぎたので計算を中断しました。");
							}
						}
					}
				}
				
				Lib.executeOnDomLoad(Calc.initialize);
				
				
			}
		}
		
		Lib.MathDemo.register(["demo_id_0"], "demo_id_1", "calculate", initialize, reload, update);
	}
}
