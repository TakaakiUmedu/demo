"use strict";
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
Lib.executeOnDomLoad(() => {
    const fonts = [
        [['游ゴシック', '游ゴシック体', 'Yu Gothic'], "sans-serif"],
        [["メイリオ", "Meiryo"], "sans-serif"],
        [["ＭＳ Ｐゴシック", "MS PGothic"], "sans-serif"],
        [['ヒラギノ角ゴ Pro W3', 'Hiragino Kaku Gothic Pro'], "sans-serif"],
        [['游明朝', '游明朝体', 'Yu Mincho'], "serif"],
        [["ＭＳ Ｐ明朝", "MS PMincho"], "serif"],
        [['ヒラギノ明朝 Pro W3', 'Hiragino Mincho Pro'], "serif"],
    ];
    const Dom = Lib.Dom;
    const style = Dom.getElement("style");
    const font = Dom.getSelect("font");
    if (style && font) {
        for (const names of fonts) {
            let value = "";
            for (const v of names[0]) {
                value += "\"" + v + "\",";
            }
            value += names[1];
            const option = Dom.elem("option", { value: value }, names[0].join(", "));
            Dom.append(font, option);
        }
        const change = () => {
            Dom.setText(style, ".font-select {\n\tfont-family: " + font.value + ";\n}\n");
        };
        Dom.addEventListener(font, "change", change);
        change();
    }
});
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="./font-selecter.ts"/>
Lib.executeOnDomLoad(() => {
    const Dom = Lib.Dom;
    const chars = Dom.getElement("chars");
    if (chars) {
        const cs = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
        const as = [0x0300, 0x0301, 0x0304, 0x0306, 0x0308, 0x0313, 0x0314, 0x0342, 0x0343, 0x0344, 0x0345, 0x0308, 0x0304];
        function permutate(n) {
            if (n == 0) {
                return [""];
            }
            else {
                let prev_perms = permutate(n - 1);
                let perms = [];
                for (var i = 0; i < as.length; i++) {
                    for (var j = 0; j < prev_perms.length; j++) {
                        perms.push(String.fromCharCode(as[i]) + prev_perms[j]);
                    }
                }
                return perms;
            }
        }
        const list = permutate(3);
        let i = 0;
        let text = "";
        while (list.length > 0) {
            for (var j = 0; j < 10; j++) {
                text += cs[i % cs.length] + list.shift();
                i++;
                if (list.length == 0) {
                    break;
                }
                text += " ";
            }
        }
        Dom.setText(chars, text);
    }
});
