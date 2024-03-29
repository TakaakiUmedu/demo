/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>

Lib.executeOnDomLoad(()=> {
	const fonts: [string[], "serif" | "sans-serif"][] = [
		[['游ゴシック', '游ゴシック体', 'Yu Gothic'], "sans-serif"],
		[["メイリオ", "Meiryo"],           "sans-serif"],
		[["ＭＳ Ｐゴシック","MS PGothic"], "sans-serif"],
		[['ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro'], "sans-serif"],
		[['Noto Sans JP'], "serif"],

		[['游明朝', '游明朝体', 'Yu Mincho'], "serif"],
		[["ＭＳ Ｐ明朝", "MS PMincho"],    "serif"],
		[['ヒラギノ明朝 Pro W3', 'Hiragino Mincho Pro'], "serif"],
		[['Noto Serif JP'], "serif"],
	];
	const Dom = Lib.Dom;
	const style = Dom.getElement("style");
	const font = Dom.get(HTMLSelectElement, "font");
	if(style && font){
		for(const names of fonts){
			let value = "";
			for(const v of names[0]){
				value += "\"" + v + "\",";
			}
			value += names[1];
			const option = Dom.elem("option", { value: value }, names[0].join(", "));
			Dom.append(font, option);
		}
		const change = ()=> {
			Dom.setText(style, ".font-select {\n\tfont-family: " + font.value + ";\n}\n");
		};
		Dom.addEventListener(font, "change", change);
		change();
	}
});

