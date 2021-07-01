///<reference path="../mylib/mylib.ts"/>
///<reference path="../mylib/mylib.dom.ts"/>

Lib.executeOnDomLoad(()=> {
	const Dom = Lib.Dom;
	const table = Dom.getElement("table");
	if(table){
		const code_start = 0x1f1e6;
		const code_end = 0x1f1ff;
		
		function appendHeaderRow(){
			const tr = Dom.elem("tr", Dom.elem("td"));
			for(let j = code_start; j <= code_end; j ++){
				Dom.append(tr, Dom.elem("th", String.fromCodePoint(j)));
			}
			Dom.append(tr, Dom.elem("td"));
			Dom.append(table, tr);
		}
		
		appendHeaderRow();
		for(let i = code_start; i <= code_end; i ++){
			const tr = Dom.elem("tr", Dom.elem("th", String.fromCodePoint(i)));
			for(let j = code_start; j <= code_end; j ++){
				Dom.append(tr, Dom.elem("td", String.fromCodePoint(i) + String.fromCodePoint(j)));
			}
			Dom.append(tr, Dom.elem("th", String.fromCodePoint(i)));
			Dom.append(table, tr);
		}
		appendHeaderRow();
	}
});



