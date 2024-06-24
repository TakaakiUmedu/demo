/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ajax.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>

namespace Sort{
	const Dom = Lib.Dom;
	
	async function loadCSV(url: string){
		const source = await Lib.waitForGet(url);
		const data: string[][] = [];
		for(const line of source.trim().split("\n")){
			const values: string[] = [];
			for(const value of line.trim().split(",")){
				values.push(value);
			}
			data.push(values);
		}
		return data;
	}
	
	const filenames = ["prices.csv", "scores.csv"]
	
	type TableRow = {
		values: (string | number)[];
		tr: HTMLTableRowElement;
	}
	type TableData = {
		table: HTMLTableElement;
		tbody: HTMLTableSectionElement;
		rows: TableRow[];
	};
	
	class Main{
		
		private readonly elems = Dom.collect(HTMLElement, "menu", "tables").collect(HTMLInputElement, "stable").table;
		private readonly tables: TableData[] = [];
		private constructor(){
			this.init();
		}
		
		private sort(tableData: TableData, index: number){
			Dom.clear(tableData.tbody);
			
			if(this.elems.stable.checked){
				for(let i = 0; i < tableData.rows.length; i ++){
					tableData.rows[i].values[0] = i;
				}
			}else{
				for(const row of tableData.rows){
					row.values[0] = Math.random();
				}
			}
			
			tableData.rows.sort((r0, r1)=> {
				const v0 = r0.values[index];
				const v1 = r1.values[index];
				const n0 = typeof(v0) === "number";
				const n1 = typeof(v1) === "number";
				if(n0 && !n1){
					return -1;
				}else if(n1 && !n0){
					return 1;
				}
				if(v0 < v1){
					return -1;
				}else if(v0 > v1){
					return 1;
				}else{
					const s0 = r0.values[0];
					const s1 = r1.values[0];
					if(s0 < s1){
						return -1;
					}else if(s0 > s1){
						return 1;
					}else{
						return 0;
					}
				}
			});
			
			for(const row of tableData.rows){
				Dom.append(tableData.tbody, row.tr);
			}
		}
		
		private async init(){
			
			for(const filename of filenames){
				const data = await loadCSV(filename);
				const titleLine = data.shift();
				if(titleLine === undefined){
					return;
				}
				const title = titleLine[0];
				const li = Dom.elem("li", title);
				const table = Dom.elem("table");
				const tbody = Dom.elem("tbody");
				const index = this.tables.length;
				const rows: TableRow[] = [];
				const tableData = { table, tbody, rows };
				this.tables.push(tableData);

				{
					const tr = Dom.elem("tr");
					const line = data[0];
					for(let i = 0; i < line.length; i ++){
						const th = Dom.elem("th", line[i]);
						const index = i + 1;
						Dom.addEventListener(th, "click", ()=>{
							this.sort(tableData, index);
						})
						Dom.append(tr, th);
					}
					Dom.append(table, tr);
				}
				
				for(let i = 1; i < data.length; i ++){
					const line = data[i];
					const tr = Dom.elem("tr");
					const values: (string | number)[] = [i - 1];
					for(const value of line){
						Dom.append(tr, Dom.elem("td", value));
						if(value.match(/^\d+$/)){
							values.push(parseInt(value));
						}else{
							values.push(value);
						}
					}
					rows.push({ values, tr });
					Dom.append(tbody, tr);
				}
				Dom.append(table, tbody);
				
				Dom.addEventListener(li, "click", ()=> {
					for(let i = 0; i < this.tables.length; i ++){
						if(i == index){
							this.tables[i].table.style.display = "";
						}else{
							this.tables[i].table.style.display = "none";
						}
					}
				});
				
				if(index > 0){
					table.style.display = "none";
				}
				
				Dom.append(this.elems.menu, li);
				Dom.append(this.elems.tables, table);
			}
		}
		
		
		public static initialize(){
			new Main();
		}
	}
	
	
	Lib.executeOnDomLoad(Main.initialize);
}

