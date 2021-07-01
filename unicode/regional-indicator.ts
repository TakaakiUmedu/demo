///<reference path="../mylib/mylib.ts"/>
///<reference path="../mylib/mylib.dom.ts"/>

Lib.executeOnDomLoad(()=> {
	const Dom = Lib.Dom;
	const table = Dom.getElement("table");
	if(table){
		let code_start = 0x1f1e6;
		let code_end = 0x1f1ff;
		
		let tr = Dom.elem("tr", Dom.elem("th"));
		for(var j = code_start; j <= code_end; j ++){
			Dom.append(tr, Dom.elem("th", String.fromCodePoint(j)));
		}
		Dom.append(table, tr);
		
		for(var i = code_start; i <= code_end; i ++){
			tr = Dom.elem("tr");
			Dom.append(tr, Dom.elem("th", String.fromCodePoint(i)));
			for(var j = code_start; j <= code_end; j ++){
				Dom.append(tr, Dom.elem("td", String.fromCodePoint(j) + String.fromCodePoint(i)));
			}
		Dom.append(table, tr);
		}
	}
});



