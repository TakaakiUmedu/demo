///<reference path="mylib/mylib.dom.ts"/>
///<reference path="mylib/mylib.geometry.ts"/>
///<reference path="mylib/mylib.linear_algebra.ts"/>

namespace Tiling{
	const DIV_NAME = "TILING";
	const Dom = Lib.Dom;
	const W = 480;
	const H = 480;
	const MARGIN = 10;
	
	const photos = ["写真0", "写真1", "写真2", "写真3", "写真4"];
	const TABINDEX_BASE           = photos.length * 3 + 1;
	const TABINDEX_CREATE_BUTTON  = TABINDEX_BASE;
	const TABINDEX_PROBLEM        = TABINDEX_BASE + 1;
	const TABINDEX_PROBLEM_BUTTON = TABINDEX_BASE + 2;
	const TABINDEX_ANSWER         = TABINDEX_BASE + 3;
	const TABINDEX_ANSWER_BUTTON  = TABINDEX_BASE + 4;
	
	const SIZE_MIN = 200;
	const SIZE_MAX = 1000;
	
	type PHOTO_POS = {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	
	class Main{
		public static initialize(id: string){
			new Main(id);
		}
		
		private readonly inputsW: HTMLInputElement[] = [];
		private readonly inputsH: HTMLInputElement[] = [];
		private readonly inputsR: HTMLInputElement[] = [];
		private readonly arrangeMode: "A" | "B" = "A";
		private readonly context: CanvasRenderingContext2D;
		
		private readonly problemTotal = Dom.elem("textarea", { tabIndex: TABINDEX_PROBLEM, rows: 2, cols: 40 });
		private readonly answerTotal = Dom.elem("textarea", { tabIndex: TABINDEX_ANSWER, rows: 2, cols: 40 });
		private errors = Dom.elem("p", { style: { color: "red" } } );
		
		private readonly importProblem = ()=> {
			Dom.clear(this.errors);
			const lines = this.problemTotal.value.split("\n");
			if(lines.length != 2){
				this.error("問題はちょうど2行必要です");
				return;
			}
			const valueLists: string[][] = [];
			for(let i = 0; i < 2; i ++){
				const values = lines[i].split(",");
				if(values.length != 5){
					this.error("問題は各行ちょうど5要素ずつ必要です" + (i + 1) + "行目に" + values.length + "要素あります");
					return;
				}
				for(let j = 0; j < 5; j ++){
					if(!values[j].match(/^(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?$/)){
						this.error("0以上の数値以外が含まれています: " + values[j]);
						return;
					}
				}
				valueLists.push(values);
			}
			const inputLists = [this.inputsW, this.inputsH];
			for(let i = 0; i < 2; i ++){
				const values = valueLists[i];
				const inputs = inputLists[i];
				for(let j = 0; j < 5; j ++){
					inputs[j].value = values[j];
				}
			}
			this.draw();
		};
		private readonly importAnswer = ()=> {
			Dom.clear(this.errors);
			const lines = this.answerTotal.value.split("\n");
			if(lines.length != 2){
				this.error("問題はちょうど2行必要です");
				return;
			}
			const mode = lines[0].trim();
			if(mode !== "1" && mode !== "2"){
				this.error("1行目は「1」か「2」のいずれかである必要があります");
				return;
			}
			const values = lines[1].split(",");
			if(values.length != 5){
				this.error("解答はちょうど5要素必要です" + values.length + "要素あります");
				return;
			}
			for(let i = 0; i < 5; i ++){
				if(!values[i].match(/^(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?$/)){
					this.error("0以上の数値以外が含まれています: " + values[i]);
					return;
				}
			}
			for(let i = 0; i < 5; i ++){
				this.inputsR[i].value = values[i];
			}
			this.draw();
		};
		private error(message: string){
			Dom.append(this.errors, "一括入力失敗: " + message);
		}
		
		private readonly mode: { value: "1" | "2" };
		private constructor(id: string){
			const div = Dom.getElement(id);
			const canvas = Dom.canvas2D({ width: W, height: H, style: { width: W + "px", height: H + "px" } });
			this.context = canvas.context;
			
			const labelTr = Dom.elem("tr", null, Dom.elem("td"));
			const inputWTr = Dom.elem("tr", null, Dom.elem("th", null, "幅: "));
			const inputHTr = Dom.elem("tr", null, Dom.elem("th", null, "高さ: "));
			const inputRTr = Dom.elem("tr", null, Dom.elem("th", null, "倍率: "));
			
			for(let i = 0; i < photos.length; i ++){
				const photo = photos[i];
				Dom.append(labelTr, Dom.elem("td", null, photo));
				const inputW = Dom.input("number", { tabIndex: i * 3 + 1, size: 5, onchange: this.changed, style: { width: "5em" } } );
				const inputH = Dom.input("number", { tabIndex: i * 3 + 2, size: 5, onchange: this.changed, style: { width: "5em" } } );
				const inputR = Dom.input("number", { tabIndex: i * 3 + 3, size: 5, value: "50", onchange: this.changed, style: { width: "5em" } } );
				Dom.append(inputWTr, Dom.elem("td", null, inputW));
				Dom.append(inputHTr, Dom.elem("td", null, inputH));
				Dom.append(inputRTr, Dom.elem("td", null, inputR));
				this.inputsW.push(inputW);
				this.inputsH.push(inputH);
				this.inputsR.push(inputR);
			}
			Dom.append(inputWTr, Dom.elem("td", { rowSpan: 2 }, Dom.input("button", { tabIndex: TABINDEX_CREATE_BUTTON, value: "新しい問題", onclick: this.create })));
			const radios = Dom.radiosWithState("mode", { onchange: this.changed }, { value: "1", label: "写真1" }, { value: "2", label: "写真2" });
			this.mode = radios.state;
			this.create();
			const control = Dom.elem("div", null,
				Dom.elem("table", null, labelTr, inputWTr, inputHTr, inputRTr),
				Dom.elem("p", null, Dom.elem("span", { style: { fontWeight: "bolder"} }, "写真0の上にくっつけて配置する写真: "), radios.radios[0], radios.labels[0], radios.radios[1], radios.labels[1]),
				Dom.elem("p", { style: { display: "flex" } }, "問題一括入力: ", this.problemTotal, Dom.elem("div", null, Dom.input("button", { tabIndex: TABINDEX_PROBLEM_BUTTON, value: "取り込み", onclick: this.importProblem }))),
				Dom.elem("p", { style: { display: "flex" } }, "解答一括入力: ", this.answerTotal, Dom.elem("div", null, Dom.input("button", { tabIndex: TABINDEX_ANSWER_BUTTON, value: "取り込み", onclick: this.importAnswer }))),
				this.errors
			);
			
			Dom.append(div, canvas.canvas, control);
		}
		
		private readonly changed = ()=> {
			const valuesW: string[] = [];
			const valuesH: string[] = [];
			const valuesR: string[] = [];
			for(let i = 0; i < photos.length; i ++){
				valuesW.push(this.inputsW[i].value);
				valuesH.push(this.inputsH[i].value);
				valuesR.push(this.inputsR[i].value);
			}
			this.problemTotal.value = valuesW.join(",") + "\n" + valuesH.join(",");
			this.answerTotal.value = this.mode.value + "\n" + valuesR.join(",");
			this.draw();
		};
		
		private readonly draw = ()=> {
			const posList: PHOTO_POS[] = [];
			let prevX = 0;
			let prevY = 0;
			let prevW = 0;
			let prevH = 0;
			const xList: number[] = [];
			const yList: number[] = [];
			for(let i = 0; i < photos.length; i ++){
				const r = parseFloat(this.inputsR[i].value);
				const w = Math.round(parseFloat(this.inputsW[i].value) * r);
				const h = Math.round(parseFloat(this.inputsH[i].value) * r);
				posList.push({ x: 0, y: 0, w, h });
			}
			
			const CT = 0;
			const LT = 1;
			const RT = 2;
			const RB = 3;
			const LB = 4;
			
			const layout = this.mode.value;
			const totalW = Math.max(posList[LT].w + posList[RT].w, posList[LB].w + posList[RB].w, posList[CT].w + (layout === "1" ? posList[LB].w + posList[RT].w : posList[LT].w + posList[RB].w));
			const totalH = Math.max(posList[LT].h + posList[LB].h, posList[RT].h + posList[RB].h, posList[CT].h + (layout === "1" ? posList[LT].h + posList[RB].h : posList[RT].h + posList[LB].h));
			
			const r = Math.min((W - MARGIN * 2) / totalW, (H - MARGIN * 2) / totalH);
			
			posList[LT].x = 0;
			posList[LT].y = 0;
			posList[RT].x = totalW - posList[RT].w;
			posList[RT].y = 0;
			posList[RB].x = totalW - posList[RB].w;
			posList[RB].y = totalH - posList[RB].h;
			posList[LB].x = 0;
			posList[LB].y = totalH - posList[LB].h;
			if(layout === "1"){
				posList[CT].x = posList[LB].w;
				posList[CT].y = posList[LT].h;
			}else{
				posList[CT].x = posList[LT].w;
				posList[CT].y = posList[RT].h;
			}
			
//			const gridList: PHOTO_POS[] = [];
//			gridList.push( { x: 0, y: 0, w: totalW - posList[1].w, h: posList[0].h } );
//			gridList.push( { x: posList[1].x, y: 0, w: posList[1].w, h: totalH - posList[2].h } );
//			gridList.push( { x: posList[3].w, y: posList[2].y, w: totalW - posList[3].w, h: posList[2].h } );
//			gridList.push( { x: 0, y: posList[0].h, w: posList[3].w, h: totalH - posList[0].h } );
			
			const mh = (W - totalW * r) / 2;
			const mv = (H - totalH * r) / 2;
			for(const pos of posList){
				const pl = Math.round(mh + pos.x * r);
				const pt = Math.round(mv + pos.y * r);
				const pr = Math.round(mh + pos.x * r + pos.w * r);
				const pb = Math.round(mv + pos.y * r + pos.h * r);
				pos.x = pl;
				pos.y = pt;
				pos.w = pr - pl;
				pos.h = pb - pt;
			}
			
			this.context.clearRect(0, 0, H, W);

			this.context.lineWidth = 1;
			this.context.strokeStyle = "#888";
			this.context.strokeRect(posList[LT].x, posList[LT].y, posList[RB].x + posList[RB].w - posList[LT].x, posList[RB].y + posList[RB].h - posList[LT].y);
			let lines: [number, number, number, number][] = [];
			if(this.mode.value === "1"){
				lines.push([posList[LT].x, posList[CT].y, posList[RT].x, posList[CT].y]);
				lines.push([posList[RT].x, posList[RT].y, posList[RT].x, posList[RB].y]);
				lines.push([posList[CT].x, posList[RB].y, posList[RB].x + posList[RB].w, posList[RB].y]);
				lines.push([posList[CT].x, posList[CT].y, posList[CT].x, posList[LB].y + posList[LB].h]);
			}else{
				lines.push([posList[CT].x, posList[LT].y, posList[CT].x, posList[LB].y]);
				lines.push([posList[CT].x, posList[CT].y, posList[RT].x + posList[RT].w, posList[CT].y]);
				lines.push([posList[RB].x, posList[CT].y, posList[RB].x, posList[RB].y + posList[RB].h]);
				lines.push([posList[LB].x, posList[LB].y, posList[RB].x, posList[LB].y]);
			}
			this.context.beginPath();
			for(const line of lines){
				this.context.moveTo(line[0], line[1]);
				this.context.lineTo(line[2], line[3]);
			}
			this.context.stroke();
			
//			for(const pos of gridList){
//				this.context.fillStyle = "rgba(255,0,255,0.5)";
//				this.context.strokeRect(pos.x, pos.y, pos.w, pos.h);
//			}
			
			const colorsB = ["rgba(0,255,0,0.4)", "rgba(255,0,0,0.4)", "rgba(0,0,255,0.4)", "rgba(127,0,127,0.4)", "rgba(0,127,127,0.4)"];
			const colorsL = ["rgba(0,127,0,1.0)", "rgba(127,0,0,1.0)", "rgba(0,0,127,1.0)", "rgba(64,0,64,1.0)", "rgba(0,64,64,1.0)"];
			
			this.context.lineWidth = 3;
			this.context.textBaseline = "middle";
			this.context.textAlign = "center";
			this.context.font = "20px sans-serif";
			for(let i = 0; i < photos.length; i ++){
				const pos = posList[i];
				this.context.fillStyle = colorsB[i];
				this.context.fillRect(pos.x, pos.y, pos.w, pos.h);
			}

			for(let i = 0; i < photos.length; i ++){
				const pos = posList[i];
				this.context.strokeStyle = colorsL[i];
				this.context.strokeStyle = "#aaa";
				this.context.strokeRect(pos.x, pos.y, pos.w, pos.h);
			}

			this.context.fillStyle = "black";
			for(let i = 0; i < photos.length; i ++){
				const pos = posList[i];
				this.context.fillText(photos[i], pos.x + pos.w / 2, pos.y + pos.h / 2);
			}
		};
		
		private readonly create = ()=> {
			for(let i = 0; i < photos.length; i ++){
				let w = Math.round(SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.random());
				let h = Math.round(SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.random());
				if(i <= 3){
					if((i % 2 == 0 && h >= w) || (i % 2 == 1 && w >= h)){
						const tmp = w;
						w = h;
						h = tmp;
					}
				}
				this.inputsW[i].value = "" + w;
				this.inputsH[i].value = "" + h;
			}
			this.changed();
		};
		
	}
	
	(function(){
		let id = DIV_NAME;
		
		let n = 1;
		while(true){
			if(document.getElementById(id) === null){
				break;
			}
			id = DIV_NAME + "_" + n;
			n ++;
		}
		
		document.write("<div id=\"" + id  + "\"></div>");
		Lib.executeOnDomLoad(()=> Main.initialize(id));
	})();
	
}
