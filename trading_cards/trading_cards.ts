/// <reference path="../script/mylib.ts"/>
/// <reference path="../script/mylib.dom.ts"/>
/// <reference path="../script/mylib.biginteger.ts"/>
/// <reference path="../script/mylib.rational.ts"/>


namespace TradingCards{
	const Dom = Lib.Dom;
	const BigInteger = Lib.BigInteger.Default;
	type BigInteger = Lib.BigInteger;
	const Rational = Lib.Rational;
	type Rational = Lib.Rational;
	
	type States = "not_started" | "calculating" | "stopping" | "stopped";
	
	class Main{
		public static initialize(){
			new Main();
		}
		
		private readonly elems = Dom.getElements("result", "resume_column");
		private readonly texts = Dom.getTexts("progress", "expectation");
		private readonly inputs = Dom.getInputs("start", "stop", "total", "targets", "resume");
		
		private readonly presenter = new ResultPresenter(this.elems.result, this.texts.progress, this.texts.expectation);
		
		private constructor(){
			Dom.addEventListener(this.inputs.start, "click", this.start);
			Dom.addEventListener(this.inputs.stop, "click", this.stop);
			Dom.addEventListener(this.inputs.resume, "click", this.resume);
			this.presenter.draw_graph();
		}
		
		
		private state: States = "not_started";
		
		private calculator: Calculator | null = null;
		private readonly start = ()=>{
			if(this.state == "not_started" || this.state == "stopped"){
//				if(this.calculator){
//					return;
//				}
				this.presenter.clear();
				this.calculator = new Calculator(parseInt(this.inputs.total.value), parseInt(this.inputs.targets.value), this.presenter, this.stopped);
				this.inputs.stop.disabled = false;
				this.inputs.start.disabled = true;
				this.inputs.resume.disabled = true;
				this.state = "calculating";
			}
		};
		private readonly resume = ()=> {
			if(this.state = "stopped"){
				if(this.calculator){
					this.calculator.resume();
				}
				this.inputs.stop.disabled = false;
				this.inputs.start.disabled = true;
				this.inputs.resume.disabled = true;
				this.state = "calculating";
			}
		}
		private readonly stop = ()=>{
			if(this.state == "calculating"){
				if(this.calculator){
					this.calculator.stop();
				}
				this.inputs.stop.disabled = true;
			}
		};
		
		private readonly stopped = ()=> {
			if(this.state == "calculating"){
				this.elems.resume_column.style.display = "";
				this.inputs.stop.disabled = true;
				this.inputs.start.disabled = false;
				this.inputs.resume.disabled = false;
				this.state = "stopped";
			}
		}
		
	}
	
	class ResultPresenter{
		private canvas = Dom.getCanvas2D("graph");

		public constructor(private readonly result: HTMLElement, private readonly progress: Text, private readonly expectation: Text){
			window.addEventListener("resize", this.resized);
			this.clear();
			Dom.add(this.result, Dom.elem("tr", null, Dom.elem("td", null, "0"), Dom.elem("td", null, "0")));
		}

		public clear(){
			Dom.clear(this.result);
			this.prev = {x: 0, y: 0};
			this.list = [];
			this.important_list = [];
			this.draw_graph();
		}
		
		private prev: {x: number, y: number};
		private list: {x: number, y: number}[];
		private important_list: {x: number, y: number, s: string, l: string}[];
		
		private readonly MARGIN = 20;
		private readonly FONT_MARGIN = 20;
		private readonly FONT_SIZE = 16;
		private readonly AXIS_MARGIN = 20;
		
		public draw_graph(){
			const x_max = this.list.length > 0 ? this.list[this.list.length - 1].x : 1;

			this.canvas.canvas.width = this.canvas.canvas.offsetWidth;
			this.canvas.canvas.height = this.canvas.canvas.offsetHeight;
			
			const canvas_w = this.canvas.canvas.width;
			const canvas_h = this.canvas.canvas.height;
			this.canvas.context.clearRect(0, 0, canvas_w, canvas_h);
			
			const w = canvas_w - this.MARGIN * 2 - this.FONT_MARGIN - this.AXIS_MARGIN;
			const h = canvas_h - this.MARGIN * 2 - this.FONT_MARGIN - this.AXIS_MARGIN;
			

			const calc_xy = (x: number, y: number)=> {
				return {x: x * w / x_max + this.MARGIN + this.FONT_MARGIN, y: canvas_h - y * h - this.MARGIN - this.FONT_MARGIN};
			}
			
			let xy;
			if(this.list.length > 0){
				this.canvas.context.lineWidth = 2;
				this.canvas.context.beginPath();
				xy = calc_xy(this.list[0].x, this.list[0].y);
				this.canvas.context.moveTo(xy.x, xy.y);
				for(let i = 1; i < this.list.length; i ++){
					xy = calc_xy(this.list[i].x, this.list[i].y);
					this.canvas.context.lineTo(xy.x, xy.y);
				}
				this.canvas.context.stroke();
			}
			
			const zero = calc_xy(0, 0);
			const max = calc_xy(x_max, 1);

			this.canvas.context.lineWidth = 1;

			this.canvas.context.beginPath();
			this.canvas.context.moveTo(zero.x, max.y - this.AXIS_MARGIN);
			this.canvas.context.lineTo(zero.x, zero.y);
			this.canvas.context.lineTo(max.x + this.AXIS_MARGIN, zero.y);
			this.canvas.context.stroke();
			
			this.canvas.context.font = this.FONT_SIZE.toString() + "px 'sans-serif'";
			
			let prev_text_l = canvas_w + this.FONT_MARGIN;
			let prev_text_b = -this.FONT_MARGIN;
			
			for(let i = this.important_list.length - 1; i >= 0 ; i --){
				xy = calc_xy(this.important_list[i].x, this.important_list[i].y);
				
				this.canvas.context.beginPath();
				this.canvas.context.moveTo(zero.x, xy.y);
				this.canvas.context.lineTo(xy.x, xy.y);
				this.canvas.context.lineTo(xy.x, zero.y);
				this.canvas.context.stroke();
				
				const y_str = this.important_list[i].s;
				const text_t = xy.y + this.FONT_SIZE / 2;
				if(text_t > prev_text_b){
					this.canvas.context.textAlign = "right";
					this.canvas.context.textBaseline = "middle";
					this.canvas.context.fillText(y_str, zero.x, xy.y);
					prev_text_b = text_t + this.FONT_SIZE;;
				}
				
				
				
				const text_w = this.canvas.context.measureText(y_str).width;
				const text_r = xy.x + text_w;
				if(text_r < prev_text_l){
					this.canvas.context.textAlign = "center";
					this.canvas.context.textBaseline = "top";
					this.canvas.context.fillText(this.important_list[i].x.toString(), xy.x, zero.y);
					prev_text_l = text_r - text_w;
				}

			}
			
		}
		
		public add_point(x: number, y: number, draw: number, expectation: Rational){
			this.progress.nodeValue = draw.toString() + "枚買った結果";
			this.expectation.nodeValue = expectation.round(1);
			
			this.list.push({x, y});
			this.draw_graph();
		}
		public add_inportant_point(x: number, y: number, s: string, l: string){
			this.important_list.push({x, y, s, l});
			Dom.add(this.result, Dom.elem("tr", null, Dom.elem("td", null, x), Dom.elem("td", null, l)));
		}
		
		private readonly resized = ()=> {
			this.draw_graph();
		}

	}
	
	class Calculator{
		private readonly p_list = [
			Rational.parse("0.5"), 
			Rational.parse("0.6"), 
			Rational.parse("0.7"), 
			Rational.parse("0.8"), 
			Rational.parse("0.9"), 
			Rational.parse("0.95"), 
			Rational.parse("0.96"),
			Rational.parse("0.97"),
			Rational.parse("0.98"),
			Rational.parse("0.99"),
			Rational.parse("0.999"),
			Rational.parse("0.9999"),
		];
		private p_list_index = 0;
		
		private rationalToString(p: Rational){
			let str = Math.round(p.mul(1000).toNumber()).toString();
			if(str === "1000" || str == "999"){
				let d = BigInteger.parse(1000);
				while(true){
					const tmp = p.mul(d).floor();
					if(!tmp.equals(d.sub(BigInteger.ONE))){
						str = tmp.toString() + "...";
						break;
					}
					d = d.mul(10);
				}
				return {l :str.substr(0, 2) + "." + str.substr(2), s: "99.9..."};
			}else{
				const l = str.length;
				const label = str.substr(0, l - 1) + "." + str.substr(l - 1);
				return {l: label, s: label};
			}
		}

		private plot(x: number, y: Rational){
			if(this.p_list[this.p_list_index].comp(y) <= 0){
				let labels = this.rationalToString(y);
				this.presenter.add_inportant_point(x, y.toNumber(), labels.s, labels.l);
				this.p_list_index ++;
			}
			
			this.presenter.add_point(x, y.toNumber(), this.draw, this.expectation);
			
			if(this.p_list_index >= this.p_list.length){
				return false;
			}else{
				return true;
			}
		}

		private pre_p = Rational.ZERO;
		private expectation = Rational.ZERO;
		private draw: number;
		public constructor(private readonly total: number, private readonly targets: number, private readonly presenter: ResultPresenter, private readonly stopped: ()=> void){
			this.draw = this.targets;
			this.calc_next();
		}
		private stopping = false;
		public stop(){
			this.stopping = true;
		}

		private static P(n: number, m: number){
			let a = BigInteger.ONE;
			while(m > 0){
				a = a.mul(n)
				n -= 1;
				m -= 1;
			}
			return a;
		}

		private cache: BigInteger[][][] = [];
		
		//# 1～n で構成された長さdの配列うち、1～cを1回以上含むものの数
		private f(n: number, c: number, d: number): BigInteger{
			let cache_n = this.cache[n];
			if(cache_n === undefined){
				this.cache[n] = cache_n = [];
			}
			let cache_n_c = cache_n[c];
			if(cache_n_c === undefined){
				cache_n[c] = cache_n_c = [];
			}
			const cache_n_c_d = cache_n_c[d];
			if(cache_n_c_d !== undefined){
				return cache_n_c_d;
			}else{
				let count;
				if(c > d){
					//# 含む物の数の方が多い = 存在しない
					count = BigInteger.ZERO;
				}else if(d == 0){
					//# 0枚引く = 引かない = 1通り
					count = BigInteger.ONE;
				}else if(c == 0){
					//# 1～0 を含む = 何も含まなくても良い
					count = BigInteger.parse(n).pow(d);
				}else if(d == 1){
					//# (c == 1 確定)
					//# {1}の1種類のみ
					count = BigInteger.ONE;
				}else if(n == 1){
					//# {1}の一種類のみ
					count = BigInteger.ONE;
				}else if(c == d){
					//# 1～c を含む長さcの配列 = 1～cの順列
					count = Calculator.P(c, d);
				}else{
					//# 前から d - 1 個目までの配列が
					//# 1 ～ cの全てを含む場合 * n
					//# 1 ～ cの内、kを含まない場合 * c
					count = this.f(n, c, d - 1).mul(n).add(this.f(n - 1, c - 1, d - 1).mul(c));
				}
				//#		print "f(#{n},#{c},#{d}) = #{cache_n_c_d}\n"
				cache_n_c[d] = count;
				return count;
			}
		}
		
		private calc_next = ()=>{
			if(this.stopping){
				this.stopped();
				this.stopping = false;
				return;
			}
			const p = Rational.parse(this.f(this.total, this.targets, this.draw), BigInteger.parse(this.total).pow(this.draw));
			const cur_p = p.sub(this.pre_p);
			this.expectation = this.expectation.add(cur_p.mul(this.draw));
			this.pre_p = p;
			console.log("[" + this.draw + "] : " + this.expectation + ", " + p.toNumber()  + "");
			
			const resume_flag = this.plot(this.draw, p);
			
			this.draw += 1;
			
			if(resume_flag){
				setTimeout(this.calc_next, 0);
			}else{
				this.stopped();
			}
		}
		
		public resume(){
			if(this.p_list_index >= this.p_list.length){
				const last_p = this.p_list[this.p_list.length - 1];
				this.p_list.push(Rational.parse(last_p.num.mul(10).add(9), last_p.den.mul(10)));
			}
			this.calc_next();
		}
		
	}

	Lib.executeOnDomLoad(Main.initialize);
}
