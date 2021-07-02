/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="./font-selecter.ts"/>

Lib.executeOnDomLoad(()=> {
	const Dom = Lib.Dom;
	const chars = Dom.getElement("chars");
	const samples = Dom.getElement("samples");
	const listElem = Dom.getElement("list");
	const nbsp = String.fromCharCode(0xA0);
	if(chars && samples && listElem){
		const cs = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
		const as = [0x0300, 0x0301, 0x0304, 0x0306, 0x0308, 0x0313, 0x0314, 0x0342, 0x0363, 0x036b, 0x036f];
		
		function setChar(mode: "none" | "a" | "abc"){
			let pre, post: string;
			if(mode == "abc"){
				pre = "ab";
				post = "c";
			}else{
				if(mode == "a"){
					pre = "a";
				}else{
					pre = "";
				}
				post = "";
			}
			
			let list_texts: string[] = [];
			for(let i = 0x030; i <= 0x36; i ++){
				for(let j = 0x0; j <= 0xf; j ++){
					list_texts.push(nbsp + nbsp + pre + String.fromCharCode(i * 16 + j) + post + nbsp + nbsp);
				}
			}
			Dom.clear(listElem);
			Dom.append(listElem, list_texts.join(" "));
		}
		
		const inputs = document.getElementsByTagName("input");
		for(let i = 0; i < inputs.length; i ++){
			const input = inputs[i];
			if(input instanceof HTMLInputElement && input.type == "radio" && input.name == "char" && (input.value == "a" || input.value == "abc" || input.value == "none")){
				((input: HTMLInputElement, value: "none" | "a" | "abc")=> {
					Dom.addEventListener(input, "change", ()=> {
						if(input.checked){
							setChar(value);
						}
					});
				})(input, input.value);
				if(input.checked){
					setChar(input.value);
				}
			}
		}
		
		let sample_texts: string[] = [];
		for(const a of as){
			sample_texts.push(nbsp + nbsp + String.fromCharCode(a) + nbsp + nbsp);
		}
		Dom.setText(samples, sample_texts.join(" "));
		
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
