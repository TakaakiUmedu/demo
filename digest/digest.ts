/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>

namespace Digest{
	const Dom = Lib.Dom;
	
	type DigestAlgorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
	const DigestAlgorithms: DigestAlgorithm[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
	const TableWidth = 16;
	
	class Main{
		private readonly digests = Dom.getElements(...DigestAlgorithms);
		private readonly message = Dom.getTextArea("message");
		private readonly useless = Dom.getElement("useless");
		private readonly useless_body = Dom.getElement("useless_body");
		private readonly useless_head = Dom.getElement("useless_head");
		private readonly useless_foot = Dom.getElement("useless_foot");
		
		private readonly numberToHex = (v: number)=> {
			const str = v.toString(16);
			if(str.length < 2){
				return "0" + str;
			}else{
				return str;
			}
		};
		
		private bufferToString(buffer: ArrayBuffer): string{
			return Array.from(new Uint8Array(buffer)).map(this.numberToHex).join("");
		}
		
		private promise = Promise.resolve();
		private calcDigest(message: string, algorithm: DigestAlgorithm){
			if(crypto.subtle !== undefined){
				const encoder = new TextEncoder();
				const data = encoder.encode(message);
				this.promise = this.promise.then(()=> {
					return crypto.subtle.digest(algorithm, data).then((buffer)=> Dom.setText(this.digests[algorithm], this.bufferToString(buffer)));
				})
			}else{
				Dom.setText(this.digests[algorithm], "ブラウザが未対応");
			}
		}
		private readonly calcDigests = ()=> {
			const message = this.message.value;
			for(const algorithm of DigestAlgorithms){
				this.calcDigest(message, algorithm);
			}
			
			Dom.clear(this.useless_body);
			let trData: [HTMLTableRowElement, HTMLTableRowElement, HTMLElement] | null = null;
			let messageArray = message.split('');
			const sums: number[] = [];
			for(let i = 0; i < TableWidth; i ++){
				sums.push(0);
			}
			let x = 0;
			let i = 1;
			for(const c of messageArray){
				const d = c.charCodeAt(0);
				if(trData === null){
					const numberSpan = Dom.span();
					trData = [Dom.elem("tr", { className: "char" }, Dom.elem("th", "" + i + "～", numberSpan, "文字目")), Dom.elem("tr", { className: "code" }, Dom.elem("th", "それらの文字コード")), numberSpan];
					Dom.append(this.useless_body, trData[0], trData[1]);
				}
				Dom.append(trData[0], Dom.td(c));
				Dom.append(trData[1], Dom.td(d));
				sums[x] += d;
				x ++;
				if(x % TableWidth == 0){
					Dom.setText(trData[2], i);
					trData = null;
					x = 0;
				}
				i ++;
			}
			if(trData !== null){
				Dom.setText(trData[2], i - 1);
				while(x % TableWidth != 0){
					Dom.append(trData[0], Dom.td());
					Dom.append(trData[1], Dom.td());
					x ++;
				}
			}
			Dom.clear(this.useless_foot);
			const tr_foot1 = Dom.elem("tr", { className: "sum" }, Dom.elem("th", "文字コードの合計"));
			const tr_foot2 = Dom.elem("tr", { className: "sum" }, Dom.elem("th", "合計を256で割った余り"));
			const tr_foot3 = Dom.elem("tr", { className: "sum" }, Dom.elem("th", "余りを16進数に変換"));
			let useless_digest = "";
			for(let i = 0; i < TableWidth; i ++){
				const s = sums[i];
				const d = s % 256;
				const h = this.numberToHex(d);
				Dom.append(tr_foot1, Dom.td(s));
				Dom.append(tr_foot2, Dom.td(d));
				Dom.append(tr_foot3, Dom.td(h));
				useless_digest += h;
			}
			Dom.append(this.useless_foot, tr_foot1);
			Dom.append(this.useless_foot, tr_foot2);
			Dom.append(this.useless_foot, tr_foot3);
			Dom.setText(this.useless, useless_digest);
		};
		
		private constructor(){
			Dom.append(this.useless_head, Dom.elem("th"));
			Dom.append(this.useless_foot, Dom.elem("th", "合計"));
			for(let i = 1; i <= TableWidth; i ++){
				Dom.append(this.useless_head, Dom.elem("th", i));
			}
			Dom.addEventListener(this.message, "keyup", this.calcDigests);
			this.calcDigests();
		}
		public static initialize(){
			new Main();
		}
	}
	Lib.executeOnDomLoad(Main.initialize);
}
