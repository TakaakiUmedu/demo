/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="./font-selecter.ts"/>

Lib.executeOnDomLoad(()=> {
	const Dom = Lib.Dom;
	const chars = Dom.getElement("chars");
	if(chars){
		const cs = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
		const as = [0x0300, 0x0301, 0x0304, 0x0306, 0x0308, 0x0313, 0x0314, 0x0342, 0x0343, 0x0344, 0x0345, 0x0308, 0x0304];
		
		function permutate(n: number): string[]{
			if(n == 0){
				return [""];
			}else{
				let prev_perms = permutate(n - 1);
				let perms : string[] = [];
				for(var i = 0; i < as.length; i ++){
					for(var j = 0; j < prev_perms.length; j ++){
						perms.push(String.fromCharCode(as[i]) + prev_perms[j]);
					}
				}
				return perms;
			}
		}
		
		const list = permutate(3);
		
		let i = 0;
		let text = ""
		while(list.length > 0){
			for(var j = 0; j < 10; j ++){
				text += cs[i % cs.length] + list.shift();
				i ++;
				if(list.length == 0){
					break;
				}
				text += " ";
			}
		}
		Dom.setText(chars, text);
	}
});
