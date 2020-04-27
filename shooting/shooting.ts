///<reference path="mylib/mylib.dom.ts"/>
///<reference path="mylib/mylib.geometry.ts"/>
///<reference path="mylib/mylib.linear_algebra.ts"/>

namespace Shooting{
	const DIV_NAME = "SHOOTING";
	const W = 480;
	const H = 480;
	const Dom = Lib.Dom;
//	const SLIT = 50;
	const LABEL_H = 20;
	const MARGIN_L = LABEL_H * 2;
	const MARGIN_R = LABEL_H * 2;
	const MARGIN_T = 0;
	const MARGIN_B = LABEL_H * 3;
	const INTERVAL = 33;
	const g = 9.8;
	
	type STAGE_PARAMS = {
		readonly s: number,
		readonly x1: number,
		readonly y1: number,
		readonly x2: number,
		readonly y2: number,
		readonly xt: number,
		readonly yt: number,
	};
	type ANIMATION_PARAMS = {
		readonly vx: number,
		readonly vy: number,
		readonly y: number,
//		readonly a: number,
//		readonly b: number,
//		readonly c: number,
		readonly trace: [number, number, number][],
		readonly signs: [number, number, [number, boolean] | undefined][],
	};
	
	class Animator{
		private registered = false;
		private task: ((interval: number, time: number)=> boolean) | null = null;
		private prevTime: number;
		private startTime: number;
		public constructor(private readonly interval = 33){
			this.prevTime = this.startTime = Date.now();
		}
		public start(task: (interval: number, time: number)=> boolean){
			this.task = task;
			this.prevTime = this.startTime = Date.now();
			if(!this.registered){
				this.animate();
			}
		}
		
		public stop(){
			this.task = null;
		}
		
		public animating(){
			return this.registered;
		}
		
		private readonly animate = ()=>{
			const now = Date.now();
			if(!this.task || !this.task(now - this.prevTime, now - this.startTime)){
				this.registered = false;
				return;
			}
			this.prevTime = now;
			setTimeout(this.animate, this.interval)
			this.registered = true;
		}
	}
	
	function drawArrowhead(context: CanvasRenderingContext2D, src: Lib.Point2D, dst: Lib.Point2D, w: number, h: number){
		const v0 = src.sub(dst);
		const maxH = v0.length() / 2 - 1;
		if(maxH < h){
			w = w * maxH / h;
			h = maxH;
		}
		const v1 = v0.unit();
		if(v1){
			const v2 = v1.mul(h);
			const v3 = v1.rotateR().mul(w / 2);
			const p1 = dst.add(v2);
			const p2 = p1.add(v3);
			const p3 = p1.add(v3.neg());
			
			context.beginPath();
			context.moveTo(MARGIN_R + dst.x, dst.y);
			context.lineTo(MARGIN_R + p2.x, p2.y);
			context.stroke();
			
			context.beginPath();
			context.moveTo(MARGIN_R + dst.x, dst.y);
			context.lineTo(MARGIN_R + p3.x, p3.y);
			context.stroke();
		}
	}
	
//	const paramNames = ["壁1のX座標", "スリット1の下端のY座標", "スリット1の下端のY座標", "スリット1の下端のY座標", "的のY座標", "的のY座標"];
	class Main{
		public static initialize(id: string){
			new Main(id);
		}
		private readonly paramNames = [
			"S[m]", 
			["X", Dom.elem("sub", null, "1"), "[m]"], 
			["Y", Dom.elem("sub", null, "1"), "[m]"], 
			["X", Dom.elem("sub", null, "2"), "[m]"], 
			["Y", Dom.elem("sub", null, "2"), "[m]"], 
			["X", Dom.elem("sub", null, "t"), "[m]"], 
			["Y", Dom.elem("sub", null, "t"), "[m]"], 
		];
		
		private readonly paramInputs: HTMLInputElement[] = [];
		private stageParams: STAGE_PARAMS;
		private readonly context: CanvasRenderingContext2D;
		
		private drawArrow(x1: number, y1: number, x2: number, y2: number, label: string | null, labelSub: string | null, labelPos: number){
			let p1 = new Lib.Point2D(x1, y1);
			let p2 = new Lib.Point2D(x2, y2);
			const v = p2.sub(p1);
			
			let p: Lib.Point2D;
			let headW = 8;
			let headH = 8;
			
			if(v.length() > 6 + headH * 2){
				const uv = v.unit();
				if(uv){
					p1 = p1.add(uv.mul(3));
					p2 = p2.add(uv.mul(-3));
					p = p1.add(uv.mul(labelPos));
				}else{
					p = p1;
				}
				this.context.beginPath();
				this.context.moveTo(MARGIN_R + p1.x, p1.y);
				this.context.lineTo(MARGIN_R + p2.x, p2.y);
				this.context.stroke();
				
				drawArrowhead(this.context, p1, p2, headW, headH);
				drawArrowhead(this.context, p2, p1, headW, headH);
			}else{
				const uv = v.unit();
				if(uv !== null){
					const p12 = p1.add(uv.mul(-20));
					const p22 = p2.add(uv.mul(20));
					
					this.context.beginPath();
					this.context.moveTo(MARGIN_R + p12.x, p12.y);
					this.context.lineTo(MARGIN_R + p1.x, p1.y);
					this.context.moveTo(MARGIN_R + p22.x, p22.y);
					this.context.lineTo(MARGIN_R + p2.x, p2.y);
					this.context.stroke();
					
					drawArrowhead(this.context, p12, p1, headW, headH);
					drawArrowhead(this.context, p22, p2, headW, headH);
				}
				p = p1.add(v.mul(0.5));
			}
			
			if(label !== null || labelSub !== null){
				const h = LABEL_H * 0.8;
				this.context.font = h + "px sans-serif";
				const textMetrix = this.context.measureText(label + (labelSub !== null ? labelSub : ""));
				const w = textMetrix.width;
				this.context.clearRect(MARGIN_R + p.x - w / 2 - 1, p.y - h / 2 - 1, w + 2, h + 2);
				this.context.textBaseline = "middle";
				
				if(labelSub){
					if(label !== null){
						this.context.textAlign = "right";
						this.context.fillText(label, MARGIN_R + p.x, p.y);
					}
					this.context.textAlign = "left";
					this.context.font = (h * 0.8) + "px sans-serif";
					this.context.fillText(labelSub, MARGIN_R + p.x + (h * 0.1), p.y + (h * 0.2));
				}else if(label !== null){
					this.context.textAlign = "center";
					this.context.fillText(label, MARGIN_R + p.x, p.y);
				}
			}
		}
		
		private readonly drawBackground = ()=>{
			this.context.clearRect(0, 0, W, H);
			
			this.context.strokeStyle = "black";
			this.context.lineWidth = 2;
			this.context.strokeRect(0, 0, W, H);
			
			this.context.beginPath();
			this.context.moveTo(MARGIN_R + this.stageParams.x1, 0);
			this.context.lineTo(MARGIN_R + this.stageParams.x1, H - (this.stageParams.y1 + this.stageParams.s));
			this.context.moveTo(MARGIN_R + this.stageParams.x1, H - this.stageParams.y1);
			this.context.lineTo(MARGIN_R + this.stageParams.x1, H);
			this.context.stroke();

			this.context.beginPath();
			this.context.moveTo(MARGIN_R + this.stageParams.x2, 0);
			this.context.lineTo(MARGIN_R + this.stageParams.x2, H - (this.stageParams.y2 + this.stageParams.s));
			this.context.moveTo(MARGIN_R + this.stageParams.x2, H - this.stageParams.y2);
			this.context.lineTo(MARGIN_R + this.stageParams.x2, H);
			this.context.stroke();
			
			this.context.strokeStyle = "blue";
			this.context.beginPath();
			this.context.moveTo(MARGIN_R + this.stageParams.xt, H - (this.stageParams.yt + this.stageParams.s));
			this.context.lineTo(MARGIN_R + this.stageParams.xt, H - this.stageParams.yt);
			this.context.stroke();
			
			const y = parseFloat(this.inputY.value);
			const t = Math.PI * parseFloat(this.inputT.value) / 180.0;
			const v = parseFloat(this.inputV.value);
			const vx = v * Math.cos(t);
			const vy = v * Math.sin(t);
			this.context.lineWidth = 5;
			this.context.strokeStyle = "darkGreen";
			this.context.fillStyle = "lightGreen";
			this.context.beginPath();
			this.context.moveTo(MARGIN_R + 0, H);
			this.context.lineTo(MARGIN_R + 0, H - y);
			this.context.lineTo(MARGIN_R + vx, H - (y + vy));
			this.context.stroke();
			
			this.context.beginPath();
			this.context.arc(MARGIN_R, H - y, 10, 0, Math.PI * 2);
			this.context.fill();
			this.context.stroke();
			
			
			this.context.fillStyle = "#777";
			this.context.strokeStyle = "#777";
			this.context.lineWidth = 1;
			
			this.drawArrow(-LABEL_H * 0.8, H, -LABEL_H * 0.8, H - y, "Y", null, y - LABEL_H * 1.5);
			
			this.drawArrow(0, H - LABEL_H * 0.8, this.stageParams.xt, H - LABEL_H * 0.8, "x", "t", LABEL_H * 2);
			this.drawArrow(0, H - LABEL_H * 1.8, this.stageParams.x2, H - LABEL_H * 1.8, "x", "2", LABEL_H * 2);
			this.drawArrow(0, H - LABEL_H * 2.8, this.stageParams.x1, H - LABEL_H * 2.8, "x", "1", LABEL_H * 2);

			this.drawArrow(this.stageParams.xt, H, this.stageParams.xt, H - this.stageParams.yt, "y", "t", LABEL_H * 1.5);
			this.drawArrow(this.stageParams.xt + LABEL_H * 0.8, H - this.stageParams.yt, this.stageParams.xt + LABEL_H * 0.8, H - (this.stageParams.yt + this.stageParams.s), null, null, this.stageParams.s / 2);
			this.context.textAlign = "left";
			this.context.font = (LABEL_H * 0.8) + "px sans-serif";
			this.context.fillText("S", MARGIN_R + this.stageParams.xt + LABEL_H * 1.0, H - (this.stageParams.yt + this.stageParams.s / 2));
			this.drawArrow(this.stageParams.x2 + LABEL_H * 0.8, H, this.stageParams.x2 + LABEL_H * 0.8, H - this.stageParams.y2, "y", "1", LABEL_H * 2.5);
			this.drawArrow(this.stageParams.x1 + LABEL_H * 0.8, H, this.stageParams.x1 + LABEL_H * 0.8, H - this.stageParams.y1, "y", "2", LABEL_H * 3.5);
			
			let p0 = new Lib.Point2D(0, H - y);
			let p1 = new Lib.Point2D(vx, H - (y + vy));
			let d = p1.sub(p0);
			let ud = d.unit();
			if(ud){
				ud = ud.rotateR();
				p0 = p0.add(ud.mul(-LABEL_H * 0.8));
				p1 = p1.add(ud.mul(-LABEL_H * 0.8));
				this.drawArrow(p0.x, p0.y, p1.x, p1.y, "V", null, d.length() / 2);
			}
			
			this.context.beginPath();
			this.context.moveTo(MARGIN_R + 10, H - y);
			this.context.lineTo(100, H - y);
			this.context.stroke();
			this.context.beginPath();
			let t0 = 0;
			let t1 = -t;
			if(t1 > t0){
				const tmp = t0;
				t0 = t1;
				t1 = tmp;
			}
			this.context.arc(MARGIN_R, H - y, 50, t0, t1, true);
			this.context.stroke();
			const tlt = (t0 + t1) / 2
			this.context.fillText("θ", MARGIN_R + 60 * Math.cos(tlt), H - (y - 60 * Math.sin(tlt)));
			
			
/*			this.context.strokeStyle = "red";
			this.context.beginPath();
			this.context.moveTo(MARGIN_R + 0, H - this.c);
			for(let i = 0; i < W; i ++){
				const x = i / W;
				this.context.lineTo(MARGIN_R + i, H - (this.a * x * x + this.b * x + this.c));
			}
			this.context.stroke();
*/
		}
		
		private readonly readProblem = ()=> {
			const line = this.problemInput.value.split(",");;
			if(line.length < this.paramInputs.length){
				this.error(line.length + "項目しかありません");
				return;
			}
			for(let i = 0; i < this.paramInputs.length; i ++){
				this.paramInputs[i].value = line[i].trim();
			}
		};
		private readonly readAnswer = ()=> {
			const line = this.answerInput.value.split(",");
			if(line.length < 3){
				this.error(line.length + "項目しかありません");
			}else{
				this.inputY.value = line[0].trim();
				this.inputT.value = line[1].trim();
				this.inputV.value = line[2].trim();
				this.launch();
			}
		};
		
		private problemChanged = ()=>{
			let line: string[] = [];
			for(const input of this.paramInputs){
				line.push(input.value);
			}
			this.problemInput.value = line.join(",");
			this.stageParams = this.readValues();
			if(!this.animator.animating()){
				this.drawBackground();
			}
		};
		private answerChanged = ()=>{
			let line = [this.inputY.value, this.inputT.value, this.inputV.value];
			this.answerInput.value = line.join(",");
			if(!this.animator.animating()){
				this.drawBackground();
			}
		};
		
		private readonly keyTable: Lib.Hash<()=>void> = {
			ArrowUp    : ()=> { this.inputY.value = "" + (parseFloat(this.inputY.value) + 1); },
			ArrowDown  : ()=> { this.inputY.value = "" + (parseFloat(this.inputY.value) - 1); },
			"+"        : ()=> { this.inputT.value = "" + (parseFloat(this.inputT.value) + 1); },
			"-"        : ()=> { this.inputT.value = "" + (parseFloat(this.inputT.value) - 1); },
			ArrowLeft  : ()=> { this.inputV.value = "" + (parseFloat(this.inputV.value) - 1); },
			ArrowRight : ()=> { this.inputV.value = "" + (parseFloat(this.inputV.value) + 1); },
			" "        : ()=> { this.launch(); },
		};
		
		private readonly keyDown = (event: KeyboardEvent)=>{
			if(event.srcElement === document.body){
				const handler = this.keyTable[event.key];
				if(handler !== undefined){
					handler();
					this.answerChanged();
					event.preventDefault();
				}
//				Lib.debugOutput("" + event.key);
			}
		};

		private readonly inputY = Dom.input("number", { size : 5, value: "100", style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
		private readonly inputT = Dom.input("number", { size : 5, value: "45",  style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
		private readonly inputV = Dom.input("number", { size : 5, value: "100", style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
		
		private readonly problemInput = Dom.input("text", { size: 40, style: { margin: "0.2em 0.5em" }} );
		private readonly answerInput = Dom.input("text", { size: 40, style: { margin: "0.2em 0.5em" }} );
		
		private animator: Animator = new Animator();
		
		private errors = Dom.elem("p", null);
		
		private constructor(id: string){
			const div = Dom.getElement(id);
			const canvas = Dom.canvas2D({width: W, height: H, style: {width: W + "px", height: H + "px"}});
			document.addEventListener("keydown", this.keyDown);
			Dom.append(div, canvas.canvas);
			this.context = canvas.context;
			
			const nameTr = Dom.elem("tr", null, Dom.elem("td", null, "g[m/s", Dom.elem("sup", null, "2"), "]"));
			const paramTr = Dom.elem("tr", null, Dom.elem("td", null, "" + g));
			for(const paramName of this.paramNames){
				const input = Dom.input("text", { size: 5, onchange: this.problemChanged });
				this.paramInputs.push(input);
				Dom.append(nameTr, Dom.elem("td", null, paramName));
				Dom.append(paramTr, Dom.elem("td", null, input));
			}
			this.paramInputs[0].value = "" + 10;
			Dom.append(paramTr, Dom.input("button", { value: "新しい問題", onclick: ()=> {
				this.animator.stop();
				this.stageParams = this.create();
				this.problemChanged();
				this.drawBackground();
			}}));
			this.stageParams = this.create();
			this.answerChanged();
			
			const control = Dom.elem("div", null, 
				Dom.elem("table", null, nameTr, paramTr),
				Dom.elem("div", null, 
					"位置Y: ", this.inputY, "角度θ: ", this.inputT, "初速V: ", this.inputV, Dom.input("button", { value: "発射", onclick: this.launch })
				),
				Dom.elem("pre", null, "【キー操作】 ↑↓: 上下移動    +-: 角度の増減    ←→: 初速の増減    スペースキー: 発射"),
				Dom.elem("div", null, "問題一括入力: ", this.problemInput, Dom.elem("span", null, Dom.input("button", { value: "取り込み", onclick: this.readProblem  } ))),
				Dom.elem("div", null, "解答一括入力: ", this.answerInput, Dom.elem("span", null, Dom.input("button", { value: "取り込み", onclick: this.readAnswer  } ))),
				this.errors
			);
			
			Dom.append(div, control);
			
			this.drawBackground();
		}
		

		private error(message: string){
			Dom.clear(this.errors);
			Dom.append(this.errors, "一括入力失敗: " + message);
		}
		
		private makeAnimTask(params: ANIMATION_PARAMS){
			return (interval: number, time: number)=> {
				let [t, x, y] = params.trace[params.trace.length - 1];
				
				if(x > -100 && x < W + 100 && (params.vy > g * time / 1000.0 || y > -100)){
					let updated = false;
					while(true){
						t += INTERVAL;
						if(t > time){
							break;
						}
						const t_s = t / 1000.0;
						x = params.vx * t_s;
						y = params.c + params.vy * t_s - g * t_s * t_s * 0.5;
						params.trace.push([t, x, y]);
						updated = true;
					}
					if(updated){
						for(const sign of params.signs){
							const [sx, sy, values] = sign;
							if(values === undefined){
								if(sx <= x){
									const my = params.a * sx * sx + params.b * sx + params.c;
									const yb = sy - 1;
									const yt = sy + this.stageParams.s + 1;
									sign[2] = [my, yb <= my && my <= yt];
								}
							}
						}
					}
				}
/*				this.context.strokeStyle = "yellow";
				this.context.beginPath();
				this.context.moveTo(MARGIN_R + 0, H - params.c);
				for(let i = 0; i < W; i ++){
					const x = i;
					this.context.lineTo(MARGIN_R + i, H - (params.a * x * x + params.b * x + params.c));
				}
				this.context.stroke();
*/				
				
				this.drawBackground();
				this.context.strokeStyle = "rgba(0,240,0,0.5)";
				this.context.lineWidth = 3;
				this.context.beginPath();
				this.context.moveTo(MARGIN_R + params.trace[0][1], H - params.trace[0][2])
				for(let i = 1; i < params.trace.length; i ++){
					this.context.lineTo(MARGIN_R + params.trace[i][1], H - params.trace[i][2]);
				}
				this.context.stroke();
				
				this.context.fillStyle = "rgba(0,200,0,1)";
				this.context.beginPath();
				this.context.arc(MARGIN_R + params.trace[params.trace.length - 1][1], H - params.trace[params.trace.length - 1][2], 5, 0, Math.PI * 2);
				this.context.fill();
				
				this.context.textBaseline = "middle";
				this.context.textAlign = "center";
				this.context.font = "40px sans-serif";
//				this.context.fontWeight = "bolder";
				for(const sign of params.signs){
					const [sx, sy, values] = sign;
					if(values !== undefined){
						const [my, flag] = values;
						if(flag){
							this.context.strokeStyle = "rgba(0,255,0,0.5)";
							this.context.strokeText("○", MARGIN_R + sx, H - my);
						}else{
							this.context.strokeStyle = "rgba(255,0,0,0.5)";
							this.context.strokeText("×", MARGIN_R + sx, H - my);
						}
					}
				}
				
/*				
				if(x <= W){
					return true;
				}else{
					return false;
				}
*/
				return true;
			}
		}
		
		private launch = ()=> {
			const y = parseFloat(this.inputY.value);
			const t = Math.PI * parseFloat(this.inputT.value) / 180.0;
			const v = parseFloat(this.inputV.value);
			
			const vx = v * Math.cos(t);
			const vy = v * Math.sin(t);
			
			const tt = vy / g;
			const xt = tt * vx;
			const yt = y + vy * vy / g / 2.0;
			
			const c = y;
			const result = Lib.solveLinearEquation([
				{ a: 2 * xt, b: 1, _: 0 },
				{ a: xt * xt, b: xt, _: yt - y },
			]);
			if(result){
				const { a, b } = result;
				const signs: [number, number, [number, boolean] | undefined][] = [
					[Math.round(this.stageParams.x1), this.stageParams.y1, undefined],
					[Math.round(this.stageParams.x2), this.stageParams.y2, undefined],
					[Math.round(this.stageParams.xt), this.stageParams.yt, undefined],
				];
				this.animator.start(this.makeAnimTask({ vx, vy, a, b, c, trace: [[0, 0, y]], signs }));
			}
		};
		
/*		
		private a: number;
		private b: number
		private c: number;
*/
		private create(){
			const s = parseFloat(this.paramInputs[0].value);
			while(true){
				const w1 = Math.random() + 1;
				const w2 = Math.random() + 1;
				const w3 = Math.random() + 1;
				const w = w1 + w2 + w3;
				
				const t_x0 = 0.0;
				const t_xt = 1.0;
				const t_x1 = t_xt * w1 / w;
				const t_x2 = t_xt * (w1 + w2) / w;
				
				// t_x0 = 0
				const t_y2 = Math.random() * 0.4 + 0.5;
				const t_y0 = Math.random() * t_y2;
				const t_yt = Math.random() * t_y2;
				// a t_x^2 + b t_y + c = t_y
				// c = t_y0
				// a t_x2 ^ 2 + b t_x2 = t_y2 - t_y0
				// a t_xt ^ 2 + b t_xt = t_yt - t_y0
				
				const result = Lib.solveLinearEquation([
					{ a: t_x0 * t_x0, b: t_x0, c: 1, _: t_y0 },
					{ a: t_x2 * t_x2, b: t_x2, c: 1, _: t_y2 },
					{ a: t_xt * t_xt, b: t_xt, c: 1, _: t_yt },
				]);
				
				if(result === null){
					continue;
				}
				const { a, b, c } = result;
				
				const t_y1 = a * t_x1 * t_x1 + b * t_x1 + c;
				
				const t_y_max = Math.max(1.0, t_y1 / 0.9, t_y2 / 0.9);
				
				const h = H - (MARGIN_T + MARGIN_B + s * 3);
/*				
				this.a = h * a / t_y_max;
				this.b = h * b / t_y_max;
				this.c = MARGIN_V + h * c / t_y_max;
*/				
				const x1 = Math.round((W - MARGIN_R - MARGIN_L) * t_x1);
				const x2 = Math.round((W - MARGIN_R - MARGIN_L) * t_x2);
				const xt = Math.round((W - MARGIN_R - MARGIN_L) * t_xt);
				
				const y1 = Math.round(MARGIN_B + h * t_y1 / t_y_max);
				const y2 = Math.round(MARGIN_B + h * t_y2 / t_y_max);
				const yt = Math.round(MARGIN_B + h * t_yt / t_y_max);
				
				this.paramInputs[1].value = "" + x1;
				this.paramInputs[2].value = "" + y1;
				this.paramInputs[3].value = "" + x2;
				this.paramInputs[4].value = "" + y2;
				this.paramInputs[5].value = "" + xt;
				this.paramInputs[6].value = "" + yt;
				this.problemChanged();
				return { s, x1, y1, x2, y2, xt, yt };
			}
		}
		private readValues(){
			const s = parseFloat(this.paramInputs[0].value);
			const x1 = parseFloat(this.paramInputs[1].value);
			const y1 = parseFloat(this.paramInputs[2].value);
			const x2 = parseFloat(this.paramInputs[3].value);
			const y2 = parseFloat(this.paramInputs[4].value);
			const xt = parseFloat(this.paramInputs[5].value);
			const yt = parseFloat(this.paramInputs[6].value);
			return { s, x1, y1, x2, y2, xt, yt };
		}
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
