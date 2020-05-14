///<reference path="./lib.dom.ts"/>
///<reference path="./lib.geometry.ts"/>
///<reference path="./lib.color.ts"/>
///<reference path="./lib.task.ts"/>

namespace Hamming{
	let M = 4;
	let N = 0;
	
	let Dom = Lib.Dom;
	let E = Dom.elem;
	let C = Dom.clear;
	let A = Dom.add;
	let T = Dom.text;
	
	const TD_WIDTH = "3em";
	const TD_HEIGHT = "1em";
	
	abstract class Action{
		protected constructor(public readonly time: number){
		}
		abstract readonly exec: (callback: ()=> void)=> void;
		abstract readonly skip: ()=> void;
		abstract readonly undo: ()=> void;
	}
	
	const fader = new Lib.ElementFader(33);
	
	class Mover{
		private readonly fader = new Lib.Fader(33);
		public constructor(){
		}
		public move(target: HTMLElement, pos_start: Lib.Point2D, pos_end: Lib.Point2D, time: number, callback: ()=> void){
			this.fader.fade_in(target, time, (target: HTMLElement, alpha: number)=> {
				set_pos(target, Lib.propDist(pos_start, pos_end, alpha));
				
			}, 0, callback);
		}
		public cancelAll(){
			this.fader.cancelAll();
		}
	}
	class ColorFader{
		private readonly fader = new Lib.Fader(33);
		public constructor(){
		}
		public fade(target: HTMLElement, col_s: Lib.Color, col_e: Lib.Color, time: number, callback: ()=> void){
			this.fader.fade_in(target, time, (target: HTMLElement, alpha: number)=> {
				target.style.color = Lib.propDist(col_s, col_e, alpha).toString();
				
			}, 0, callback);
		}
		public cancelAll(){
			this.fader.cancelAll();
		}
	}
	
	const mover = new Mover();
	const colorFader = new ColorFader();
	function set_pos(target: HTMLElement, pos: Lib.Point2D){
		target.style.left = pos.x + "px";
		target.style.top = pos.y + "px";
	}
	
	function get(id: string){
		const element = document.getElementById(id);
		if(!element){
			throw "element not found";
		}
		return element
	}
	
	
	abstract class ActionWithTarget extends Action{
		protected readonly target: HTMLElement;
		public constructor(target: HTMLElement | string, time: number){
			super(time);
			if(target instanceof HTMLElement){
				this.target = target;
			}else{
				this.target = get(target);
			}
		}
	}
	class Move extends ActionWithTarget{
		private readonly pos_start: Lib.Point2D;
		public constructor(target: HTMLElement | string, private readonly pos_end: Lib.Point2D, time: number){
			super(target, time);
			this.pos_start = Lib.Point2D.fromElementStyle(target);
		}
		public readonly exec = (callback: ()=> void):void => {
			mover.move(this.target, Lib.Point2D.fromElementStyle(this.target), this.pos_end, this.time, callback);
		}
		public readonly skip = (): void =>{
			set_pos(this.target, this.pos_end);
		}
		public readonly undo = (): void=> {
			this.target.style.left = this.pos_start.x + "px";
			this.target.style.top = this.pos_start.y + "px";
//			this.target.style.left = "";
//			this.target.style.top = "";
		}
	}


	class FadeInD extends ActionWithTarget{
		public constructor(target: HTMLElement | string, time: number){
			super(target, time);
		}
		public readonly exec = (callback: ()=> void): void=> {
			fader.fade_in(this.target, this.time, callback);
		}
		public readonly skip = (): void =>{
			this.target.style.display = "";
			this.target.style.opacity = "";
		}
		public readonly undo = (): void=> {
			this.target.style.display = "none";
			this.target.style.opacity = "";
		}
	}
	class FadeOutD extends ActionWithTarget{
		public constructor(target: HTMLElement | string, time: number){
			super(target, time);
		}
		public readonly exec = (callback: ()=> void): void=> {
			fader.fade_out(this.target, this.time, callback);
		}
		public readonly skip = (): void =>{
			this.target.style.display = "none";
			this.target.style.opacity = "";
		}
		public readonly undo = (): void=> {
			this.target.style.display = "";
			this.target.style.opacity = "";
		}
	}
	
	class FadeIn extends ActionWithTarget{
		public constructor(target: HTMLElement | string, time: number){
			super(target, time);
		}
		public readonly exec = (callback: ()=> void): void=> {
			fader.fade_in(this.target, this.time, callback);
		}
		public readonly skip = (): void =>{
			this.target.style.visibility = "visible";
			this.target.style.opacity = "";
		}
		public readonly undo = (): void=> {
			this.target.style.visibility = "hidden";
			this.target.style.opacity = "";
		}
	}
	class FadeOut extends ActionWithTarget{
		public constructor(target: HTMLElement | string, time: number){
			super(target, time);
		}
		public readonly exec = (callback: ()=> void): void=> {
			fader.fade_out(this.target, this.time, callback);
		}
		public readonly skip = (): void =>{
			this.target.style.visibility = "hidden";
			this.target.style.opacity = "";
		}
		public readonly undo = (): void=> {
			this.target.style.visibility = "visible";
			this.target.style.opacity = "";
		}
	}
	class ColorChange extends ActionWithTarget{
		public constructor(target: HTMLElement | string, private readonly col_s: Lib.Color, private readonly col_e: Lib.Color, time: number){
			super(target, time);
		}
		
		public readonly exec = (callback: ()=> void): void=> {
			colorFader.fade(this.target, this.col_s, this.col_e, this.time, callback);
		}
		public readonly skip = (): void =>{
			this.target.style.color = this.col_e.toString();
		}
		public readonly undo = (): void=> {
			this.target.style.color = this.col_s.toString();
		}
	}
	
	class ParallelAction extends Action{
		private readonly actions: Action[]
		public constructor(actions: Action[]){
			super(0);
			this.actions = actions;
		}
		public readonly exec = (callback: ()=> void): void=> {
			let count: number = this.actions.length;
			let exec_callback = (): void=> {
				count --;
				if(count == 0){
					callback();
				}
			}
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].exec(exec_callback);
			}
		}
		public readonly skip = (): void =>{
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].skip();
			}
		}
		public readonly undo = (): void=> {
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].undo();
			}
		}
	}
	class SequentialAction extends Action{
		private readonly actions: Action[]
		public constructor(...actions: Action[]){
			super(0);
			this.actions = actions;
		}
		public readonly exec = (callback: ()=> void): void=> {
			let count: number = 0;
			let exec_callback = (): void=> {
				count ++;
				if(count >= this.actions.length){
					callback();
				}else{
					this.actions[count].exec(exec_callback);
				}
			}
			this.actions[0].exec(exec_callback);
		}
		public readonly skip = (): void =>{
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].skip();
			}
		}
		public readonly undo = (): void=> {
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].undo();
			}
		}
	}
	
	class Calc extends Action{
		public constructor(private readonly calc: ()=> Action | undefined){
			super(0);
		}
		public readonly exec = (callback: ()=> void): void=> {
			let action = this.calc();
			if(action){
				action.exec(callback);
			}else{
				callback();
			}
		}
		public readonly skip = (): void =>{
			let action = this.calc();
			if(action){
				action.skip();
			}
		}
		public readonly undo = (): void =>{
			let action = this.calc();
			if(action){
				action.undo();
			}
		}
	}
	
	class MessageWindow{
		private readonly window: HTMLElement;
		private message: Node;
		public constructor(){
			this.window = E("div", {id: "message_window", style: {padding: "2em", position: "absolute", display: "none", width: "30%", border: "2px solid #8af", backgroundColor: "#fff8ff"}});
			A(document.body, this.window);
		}
		public setMessage(target: HTMLElement, message: Node | string){
			if(typeof(message) === "string"){
				message = T(message);
			}
			Dom.clear(this.window);
			A(this.window, message);
			this.message = message;
			this.window.style.display = "";
			this.window.style.left = Math.round(target.offsetLeft + target.offsetWidth / 2 - this.window.offsetWidth / 2) + "px";
			this.window.style.top = Math.round(target.offsetTop - this.window.offsetHeight) + "px";
			this.window.style.display = "none";
		}
		public getMessage(){
			return this.message;
		}
	}
	
	let messageWindow: MessageWindow;
	
	class SetMessage extends ActionWithTarget{
		private prev_message: Node;
		public constructor(target: HTMLElement | string, private readonly message: Node | string){
			super(target, 0);
			this.prev_message = messageWindow.getMessage();
		}
		public readonly exec = (callback: ()=> void): void=> {
			messageWindow.setMessage(this.target, this.message);
			callback();
		}
		public readonly skip = (): void =>{
			messageWindow.setMessage(this.target, this.message);
		}
		public readonly undo = (): void =>{
			messageWindow.setMessage(this.target, this.prev_message);
		}
	}
	
	const scenario: (()=> Action | Action[])[] = [
		()=> {
			return new SequentialAction(
				new Calc(()=> {
					for(let j = 1; j <= N; j++){
						get("circle_" + j).style.display = "none";
					}
					return undefined;
				}),
				new FadeIn("table", 500)
			);
		},
		()=> { return new FadeIn("mask", 500); },
		()=> {
			const actions: Action[] = [];
			const table = get("parity_table");
			const pos = new Lib.Point2D(table.offsetLeft, table.offsetTop);
			for(let i = 1; i <= M; i ++){
				let target = get("mask_" + i);
				let parity_target = get("parity_" + i);
				let pos_start = Lib.Point2D.fromElementStyle(target);
				actions.push(new Move(target, pos, 500));
//				let parity = (parity_target.firstChild.firstChild as Text).nodeValue;
				let parity = parity_target.innerText;
				let message = (parity == "0" ? "1が偶数個あるので、青枠の空欄に0を書き込んでそのままにする" : "1が奇数個あるので、青枠の空欄に1を書き込んで、1を偶数個にする");
				actions.push(new SequentialAction(
					new SetMessage(target, message),
					new FadeIn("message_window", 500)
				));
				actions.push(new ColorChange(parity_target, new Lib.Color(255, 255, 255), new Lib.Color(0, 0, 0), 1000));
				actions.push(new ParallelAction([
					new FadeOut("message_window", 500),
					new Move(target, pos_start, 500)
				]));
			}
			return actions;
		},
		()=> { return new SequentialAction(new FadeIn("ready", 500), new FadeIn("error", 500)); },
		()=> {
			return new SequentialAction(
				new Calc(()=> {
					let td_s = get("table").getElementsByTagName("tr")[2].getElementsByTagName("td");
					let td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
					
					for(let i = 1; i <= N; i++){
						let value = (td_s[i - 1].innerText);
						if((get("error_" + i) as HTMLInputElement).checked){
							value = (value == "0" ? "1" : "0");
						}
						Lib.Dom.setText(td_r[i - 1], value);
					}
					return undefined;
				}),
				new FadeIn("received", 500)
			);
		},
		()=> {
			const actions: Action[] = [];
			const table = get("received_table");
			const pos = new Lib.Point2D(table.offsetLeft, table.offsetTop);
			const td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
			for(let i = 1; i <= M; i ++){
				let target = get("mask_" + i);
				let parity_target = get("parity_" + i);
				let pos_start = Lib.Point2D.fromElementStyle(target);
				actions.push(new Move(target, pos, 500));
				actions.push(new Calc(()=> {
				
					let parity = 0;
					let bit = Math.pow(2, M - i);
					for(let j = 1; j <= N; j ++){
						if((j & bit) != 0){
							if((td_r[j - 1].innerText) == "1"){
								parity = 1 - parity;
							}
						}
					}
					
					let message = (parity == 0 ? "1が偶数個なので、今、見えている範囲に間違いはない。間違いがない部分に○を付ける" : "1が奇数個なので、今、見えている範囲に間違いがある。間違いが高々1ビットだという仮定より、それ以外の部分には間違いはない。間違いがない部分に○を付ける");
					let fade_circle_list: Action[] = [];
					for(let j = 1; j <= N; j ++){
						const and = ((j & bit) == 0);
						const circle = get("circle_" + j);
						if((and && parity == 1 || !and && parity == 0) && circle.style.display == "none"){
//						if((and && parity == 1 || !and && parity == 0)){
							circle.style.color = "lightGreen";
							fade_circle_list.push(new FadeInD("circle_" + j, 500));
						}
					}
					return new SequentialAction(
						new SetMessage(target, message),
						new FadeIn("message_window", 500),
						new ParallelAction(fade_circle_list)
					);
				}));
				actions.push(new ParallelAction([
					new FadeOut("message_window", 500),
					new Move(target, pos_start, 500)
				]));
			}
			
			return actions;
		},
		()=> {
			return new Calc(()=> {
				let parity_target = get("ready");
				let fade_circle_list: Action[] = [];
				for(let i = 1; i <= N; i ++){
					const circle = get("circle_" + i);
					if(circle.style.display == "none"){
						circle.style.color = "red";
						fade_circle_list.push(new FadeInD("circle_" + i, 500));
					}
				}
				if(fade_circle_list.length == 0){
					return new SequentialAction(
						new SetMessage(parity_target, "全てに○が付いたので、データは壊れていないと思われる"),
						new FadeIn("message_window", 500)
					);
				}else{
					return new SequentialAction(
						new SetMessage(parity_target, "○が付かなかったビットが、送信の途中で壊れたものと思われる"),
						new FadeIn("message_window", 500),
						new ParallelAction(fade_circle_list)
					);
				}
			});
		},
		()=> {
			return new Calc(()=> {
				let td_s = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
				let td_r = get("result_table").getElementsByTagName("tr")[0].getElementsByTagName("td");
				
				let wrong_count = 0;
				
				for(let i = 1; i <= N; i ++){
					const circle = get("circle_" + i);
					let value = td_s[i - 1].innerText;
					if(circle.style.color == "red"){
						value = (value == "0" ? "1" : "0");
					}
					Lib.Dom.setText(td_r[i - 1], value);
					if((get("error_" + i) as HTMLInputElement).checked){
						wrong_count += 1;
					}
				}
				
				Dom.clear("result_ul");
				if(wrong_count == 0){
					A("result_ul", E("li", null, "誤りが無かったため、訂正不要"));
				}else if(wrong_count == 1){
					A("result_ul", E("li", null, "1ビットの誤りが無事に訂正されている"));
				}else{
					A("result_ul", E("li", null, "誤りが" + wrong_count + "ビットあったため、“誤りは高々1ビット”と仮定した誤り訂正手順の前提条件が成立しておらず、正しく訂正できなかった"));
				}
				
				return new SequentialAction(
					new FadeOut("message_window", 500),
					new FadeIn("result", 500),
					new FadeIn("result_ul", 500),
				);
			});
		},
		()=> { return new FadeIn("appendix1", 500); },
		()=> {
			return new Calc(()=> {
				calculate();
				
				return new FadeIn("appendix2", 500);
			});
		},
/*
		()=> { return new },
*/
	];
	
	let animator: Animator | null = null;
	
	class Animator{
		private progress = 0;
		private animating = false;
		private actions: Action[];
		public constructor(private readonly scenario: (()=> Action | Action[])[], private readonly progress_button: HTMLInputElement, private readonly progress_slider: HTMLInputElement){
			this.update_actions();
			this.progress_button.addEventListener("click", this.exec_next);
			this.progress_slider.max = this.actions.length.toString();
			this.progress_slider.addEventListener("change", this.slider_changed);
			this.set_progress(0);
		}
		private update_actions(){
			const divs = document.getElementsByTagName("div");
			for(let i = 0; i < divs.length; i ++){
				divs[i].style.display = "";
			}
			
			this.actions = [];
			for(let i = 0; i < this.scenario.length; i ++){
				const action = this.scenario[i]();
				if(action instanceof Action){
					this.actions.push(action);
				}else{
					for(let j = 0; j < action.length; j ++){
						this.actions.push(action[j]);
					}
				}
			}
			
			let td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
			for(let i = 1; i <= N; i ++){
				let circle = get("circle_" + i);
				let td = td_r[i - 1];
				let rect = td.getBoundingClientRect();
//				circle.style.left = td.offsetLeft + "px";
//				circle.style.top = td.offsetTop + "px";
				circle.style.left = Math.round(rect.left + rect.width / 2 - circle.offsetWidth / 2) + "px";
				circle.style.top = Math.round(rect.top + rect.height/ 2 - circle.offsetHeight / 2)+ "px";
			}
			
		}
		
		public set_progress(progress: number){
			fader.cancelAll();
			mover.cancelAll();
			for(let i = 0; i < this.actions.length; i ++){
				this.actions[i].undo();
			}
			if(progress > this.actions.length){
				progress = this.actions.length;
			}
			this.progress = progress;
			for(let i = 0; i < progress; i ++){
				this.actions[i].skip();
			}
			this.progress_slider.value = this.progress.toString();
		}
		public readonly exec_next = ()=>{
			if(this.animating && this.progress >= 0){
				this.set_progress(this.progress);
			}
			if(this.progress < this.actions.length){
				this.animating = true;
				this.actions[this.progress].exec(this.callback);
			}
			this.progress ++;
			this.progress_slider.value = this.progress.toString();
		}
		private readonly callback = ()=> {
			this.animating = false;
		}
		private readonly slider_changed = ()=> {
			let progress = parseInt(this.progress_slider.value);
			this.set_progress(progress);
		}
		public reset(){
			this.set_progress(this.progress);
		}
	}
	
	
	function join<T>(list: T[], connector: string){
		if(connector == null){
			connector = "";
		}
		let result = list[0].toString();
		for(let i = 1; i < list.length; i ++){
			result += connector + list[i].toString();
		}
		return result;
	}
	
	function sub_2(){
		return E("sub", null, "(2)");
	}
	
	function code(...args: any[]) : HTMLElement{
		let code_elem = E("code");
		for(let i = 0; i < args.length; i ++){
			A(code_elem, args[i]);
		}
		return code_elem;
	}
	
	function calculate(){
		let table = get("table");
		let td_is = get("元データ").getElementsByTagName("input");
		let td_rs = get("table").getElementsByTagName("tr")[2].getElementsByTagName("td");
		let math2 = get("math2");
		C(math2);
/*
		let tds;
		for(let i = 0; i < M; i ++){
			let tr_p = get("パリティ" + i + "_s");
			tds = tr_p.children;
			let p = 0;
			for(let j = 1; j < tds.length; j ++){
				let td = tds[j];
				if(td.className == "データ"){
					let input = td_is[j].firstChild as HTMLInputElement;
					if(input.value == "1"){
						Lib.Dom.setText(td, "1");
						p ^= 1;
					}else{
						Lib.Dom.setText(td, "0");
					}
				}
			}
			for(let j = 1; j < tds.length; j ++){
				let td = tds[j];
				if(td.className == "パリティ"){
					(td.firstChild as HTMLInputElement).nodeValue = p.toString();
					(td_rs[j].firstChild as HTMLInputElement).nodeValue = p.toString();
				}
			}
		}
*/
		let m_x = [];
		for(let i = 1; i <= N - M; i ++){
//			let input = td_is[i - 1] as HTMLInputElement;
			let input = get("data_" + i) as HTMLInputElement;
			if(input.value == "0"){
				m_x.push(0);
			}else{
				m_x.push(1);
			}
		}
		m_x = [m_x];

		let m_e = [];
		for(let i = 1; i <= N; i ++){
			let input = get("error_" + i) as HTMLInputElement;
			if(input.checked){
				m_e.push(1);
			}else{
				m_e.push(0);
			}
		}
		m_e = [m_e];
		
		A(math2, "x = ", matrix_table(m_x), ", ");
		A(math2, "e = ", matrix_table(m_e), ", ");
		A(math2, E("br"));
		
		let m_H: number[][] = [];
		for(let i = 0; i < M; i ++){
			let bit = Math.pow(2, M - i - 1);
			let line = [];
			for(let j = 1; j <= N; j ++){
				line.push(((j & bit) == 0) ? 0 : 1);
			}
			m_H.push(line);
		}

		let m_G: number[][] = [];
		let b = 1;
		let k = 0;
		for(let i = 1; i <= N; i ++){
			let new_line = [];
			if(b == i){
				let line = m_H[M - k - 1];
				let b2 = 1;
				for(let j = 1; j <= N; j ++){
					if(b2 == j){
						b2 *= 2;
					}else{
						new_line.push(line[j - 1]);
					}
				}
				b *= 2;
				k += 1;
			}else{
				for(let j = 0; j < N - M; j ++){
					if(j == i - k - 1){
						new_line.push(1);
					}else{
						new_line.push(0);
					}
				}
			}
			m_G.push(new_line);
		}
		m_G = transpose(m_G);
		
		
		
		let m_Y = multiply(m_x, m_G);
		A(math2, "Y = x × G = ", matrix_table(m_x), " × ", matrix_table(m_G), "=", matrix_table(m_Y), E("br"));
		let m_Yd = [];
		for(let i = 0; i < m_Y[0].length; i ++){
			m_Yd[i] = (m_Y[0][i] ^ m_e[0][i]);
		}
		m_Yd = [m_Yd];
		
		A(math2, "Y' = Y ⊕ e =", matrix_table(m_Y), "⊕", matrix_table(m_e), "=", matrix_table(m_Yd), E("br"));
		A(math2, "r = Y'× H", E("sup", null, "T") ," = ", matrix_table(m_Yd), "×", matrix_table(transpose(m_H)), "=", matrix_table(multiply(m_Yd, transpose(m_H))), E("br"));

		/*
		let td_es = get("通信エラー").children;
		let td_ms = get("受信結果").children;
		let td_cs = get("誤り訂正結果").children;
		
		if(!tds){
			return;
		}
		
		for(let j = 1; j < tds.length; j ++){
			if(td_is[j].firstChild != null){
				Lib.Dom.setText(td_rs[j], ((td_is[j].firstChild as HTMLInputElement).value == "0" ? "0" : "1"));
			}
			let value = (td_rs[j] as HTMLElement).innerText;
			if((td_es[j].firstChild as HTMLInputElement).checked){
				value = (value == "0" ? "1" : "0");
			}
			Lib.Dom.setText(td_ms[j], value);
		}
		*/
		/*
		let errors = [];
		let num_errors = 0;
		for(let i = 0; i < M; i ++){
			let tr = get("パリティ" + i + "_r");
			let tds = tr.children;
			let p = 0;
			for(let j = 1; j < tds.length; j ++){
				if(tds[j].className == "データ"){
					let value = (td_ms[j] as HTMLElement).innerText;
					Lib.Dom.setText(tds[j], value);
					if(value != "0"){
						p ^= 1;
					}
				}
			}
			let td_result = get("パリティ計算結果_" + i);
			if(p == 0){
				tr.className = "正常";
				errors[i] = false;
				Lib.Dom.setText(td_result, "1が偶数個");
			}else{
				tr.className = "エラー";
				errors[i] = true;
				Lib.Dom.setText(td_result, "1が奇数個");
				num_errors ++;
			}
		}
		let result = get("result");
		C(result);
		let bit_flipped = 0;
		if(num_errors == 0){
			A(result, "エラー無し。受信成功。");
			get("correction_explanation").style.display = "none";
		}else{
			A(result, "エラー有り。パリティかデータの内、", code("x"), " ビット目の1ビットだけ反転したと考えると、");
			get("correction_explanation").style.display = "";
			let ul = E("ul");
			for(let i = 0; i < M; i ++){
				let li = E("li");
				A(li, code("x"), " = ", code("" + make_digits(i, "1"), sub_2()), "ビット目の列にエラー");
				
				if(errors[i]){
					A(li, E("span", { style : { color: "red" } }, "あり"));
				}else{
					A(li, E("span", { style : { color: "blue" } }, "なし"));
				}
				A(li, "。すなわち、", code("x"), "を2進数で表記した時の下から", code((i + 1)), "桁目が", code("1"), "となる行にエラー");
				if(errors[i]){
					A(li, "が", E("span", { style : { color: "red" } }, "ある"));
				}else{
					A(li, "は", E("span", { style : { color: "blue" } }, "ない"));
				}
				A(li, "。よって、", code((i + 1)), "桁目は");
				if(errors[i]){
					A(li, code("1"));
				}else{
					A(li, code("0"));
				}
				A(li, "。");
				A(ul, li);
			}
			A(result, ul);
//			A(result, "の行が奇数個の", E("q", null, "1"), "を含んでおり、エラー。");
			
			A(result, "となり、以上" + M + "個の条件から、", code("x"), " = ");
			
			let code_elem = E("code");
			let code_str = "";
			let first = true;
			for(let i = 0; i < M; i ++){
				let num = "?";
				if(errors[i]){
					bit_flipped += Math.pow(2, i);
					if(!first){
						A(code_elem, "+");
					}else{
						first = false;
					}
					A(code_elem, "2", E("sup", null, i));
					code_str = "1" + code_str;
				}else{
					code_str = "0" + code_str;
				}
			}
			A(result, code(code_str, sub_2()), " = " , code_elem, " = ", code(bit_flipped), "より、通信エラーは", E("q", null, "" + bit_flipped + "ビット目"), "で起きたと思われる。");
		}
		for(let j = 1; j < td_cs.length; j ++){
			let td = td_cs[j];
			let b = (td_ms[j] as HTMLElement).innerText;
			if(j == bit_flipped){
				b = (b == "0" ? "1" : "0");
				td.className = "訂正済み";
			}else{
				td.className = "";
			}
			Lib.Dom.setText(td, b);
		}
		*/
	}
	
	function make_digits(n: number, d: string){
		let str = "";
		for(let i = 0; i < M - n - 1; i ++){
			str += "?";
		}
		str += d;
		for(let i = 0; i < n; i ++){
			str += "?";
		}
		return str;
	}
	
	function multiply(m1 : number[][], m2: number[][]){
		let result: number[][] = [];
		for(let i = 0; i < m1.length; i ++){
			result[i] = [];
			for(let j = 0; j < m2[0].length; j ++){
				let sum = 0;
				for(let k = 0; k < m1[0].length; k ++){
					sum += m1[i][k] * m2[k][j];
				}
				result[i][j] = sum % 2;
			}
		}
		return result;
	}
	
	function matrix_table(m: number[][]){
		let table = E("table", {className: "matrix"});
		for(let i = 0; i < m.length; i ++){
			let tr = E("tr");
			if(m.length == 1){
				A(tr, E("td", { className: "paren", style: { borderWidth: "1px 0px 1px 1px", width: "0.2em"}}));
			}else if(i == 0){
				A(tr, E("td", { className: "paren", style: { borderWidth: "1px 0px 0px 1px", width: "0.2em"}}));
			}else if(i == m.length - 1){
				A(tr, E("td", { className: "paren", style: { borderWidth: "0px 0px 1px 1px", width: "0.2em"}}));
			}else{
				A(tr, E("td", { className: "paren", style: { borderWidth: "0px 0px 0px 1px", width: "0.2em"}}));
			}
			for(let j = 0; j < m[i].length; j ++){
				A(tr, E("td", null, m[i][j]));
			}
			if(m.length == 1){
				A(tr, E("td", { className: "paren", style: { borderWidth: "1px 1px 1px 0px", width: "0.2em"}}));
			}else if(i == 0){
				A(tr, E("td", { className: "paren", style: { borderWidth: "1px 1px 0px 0px", width: "0.2em"}}));
			}else if(i == m.length - 1){
				A(tr, E("td", { className: "paren", style: { borderWidth: "0px 1px 1px 0px", width: "0.2em"}}));
			}else{
				A(tr, E("td", { className: "paren", style: { borderWidth: "0px 1px 0px 0px", width: "0.2em"}}));
			}
			A(table, tr);
		}
		return table;
	}
	function transpose(m: number[][]){
		let result: number[][] = [];
		for(let i = 0; i < m[0].length; i ++){
			result[i] = [];
			for(let j = 0; j < m.length; j ++){
				result[i][j] = m[j][i];
			}
		}
		return result;
	}

//	let appendix_table: HTMLElement[] = [];
	
	function toggle(event: MouseEvent){
		let button = event.target as HTMLInputElement;
		let target = get(button.dataset.target as string);
		let alt_mes = button.dataset.alt_mes as string;
		button.dataset.alt_mes = button.value;
		button.value = alt_mes;
		if(target.style.display == "none"){
			target.style.display = "block";
		}else{
			target.style.display = "none";
		}
	}
	
	function init(){
		messageWindow = new MessageWindow();


		get("RESET").addEventListener("click", reset, false);
		
		let elements = document.getElementsByClassName("toggle_disp");
		for(let i = 0; i < elements.length; i ++){
			let element = elements[i];
			let child = element.firstChild;
			if(child != null){
				let button = E("input", {type: "button", value: "説明の非表示", style: { float: "right", marginRight: "4em"}});
				let div = E("div", { id: "toggle_target_" + i }, button);
				
				while(child != null && child.nodeType != 1){
					child = child.nextSibling;
				}
				if(child != null){
					while(child.nextSibling != null){
						div.appendChild(child.nextSibling);
					}
				}
				
				button.dataset.target = div.id;
				button.dataset.alt_mes = "説明の表示";
				button.addEventListener("click", toggle, false);
				
				element.insertBefore(button, element.firstChild);
				element.appendChild(div);
			}
		}
		
/*		for(let i = 0; i < 3; i ++){
			appendix_table[i] = get("appendix" + i);
		}
*/		
		let navi = Dom.elem("div", {style: {position: "fixed", left: "0px", padding: "0.2em 1em", border: "2px solid rgba(80,80,80,0.5)", backgroundColor: "rgba(180,180,180,0.5)"}});
		progress_slider = Dom.input("range", {min: "0", max: "100", step: "1", style: {margin: "0 0.5em", width: "800px"}});
		progress_button = Dom.input("button", {value: "次へ"});
		
		A(navi, progress_slider, progress_button);
		
		A(document.body, navi);
		
		navi.style.left = Math.round((document.documentElement.clientWidth - navi.offsetWidth) / 2) + "px";
		navi.style.top = (document.documentElement.clientHeight - navi.offsetHeight) + "px";
		
		reset();
	}
	
	let progress_button: HTMLInputElement;
	let progress_slider: HTMLInputElement;
	
//	let m_G: number[][];
//	let m_H: number[][];
	
	function to_b(val: number, n: number){
		let str = "";
		for(let i = n - 1; i >= 0; i --){
			str += ((val & (1 << i)) == 0 ? "0" : "1");
		}
		return str;
	}
	/*
	function insertAfter(newNode: Node, node: Node | string){
		if(typeof(node) === "string"){
			node = get(node);
		}
		node.parentNode.insertBefore(newNode, node.nextSibling);
	}*/
	
	function TE(name: string, border: string, attributes?: Lib.Dom.Attribute | null, ...children: Lib.Something[]){
		return E(name, attributes, E("div", {style: {border: border}}, ...children));
	}
	
	function create_mask_table(k: number){
		let bit = Math.pow(2, M - k);
		let mask_name = "マスク " + k + ": 左から" + k + "ビット目が1の部分(";
		
		for(let i = 1; i <= M; i ++){
			if(i == k){
				mask_name += "1";
			}else{
				mask_name += "?";
			}
		}
		mask_name += ")だけくりぬいたマスク";
		
		let tr1 = E("tr", {style: {backgroundColor: "transparent"}}, E("th", {style: {height: "2em", width: "auto", backgroundColor: "gray"}, colspan: (N + 1).toString()}, mask_name));
		let tr2 = E("tr", {style: {backgroundColor: "transparent"}}, TE("th", "none", {style: {backgroundColor: "gray"}}));
		let tr3 = E("tr", {style: {backgroundColor: "transparent"}}, TE("th", "none", {style: {backgroundColor: "gray"}}));
		let mask_table = E("table", {className: "parity", cellspacing: "0", style: {opacity: "0.95", backgroundColor: "transparent"}}, tr1, tr2, tr3);
		
		for(let j = 1; j <= N; j++){
			A(tr2, E("th", {style: {backgroundColor: "gray"}}, j + " =", Dom.br(), to_b(j, M), sub_2()));
			if((j & bit) == 0){
				A(tr3, TE("td", "2px solid gray", {style: {backgroundColor: "gray"}}));
			}else{
				A(tr3, TE("td", "2px solid gray", {style: {backgroundColor: "transparent"}}));
			}
		}
		
		return mask_table;
	}
	
	function recalc(){
		if(animator){
			animator.reset();
		}
	}
	
	function reset(){
		M = parseInt((get("M") as HTMLInputElement).value);
		if(M == 0){
			M = 4;
		}
		
		N = Math.pow(2, M) - 1;
		
		let source_tr1 = E("tr");
		let source_tr2 = E("tr");
		
		for(let i = 1; i <= N - M; i ++){
			A(source_tr1, E("th", null, "データ " + i));
			A(source_tr2, E("td", null, Dom.input("text", {id: "data_" + i, size: "3", value: (Math.random() <= 0.5 ? "0" : "1")})));
		}
		
		let source_table = E("table", {id: "元データ"}, source_tr1, source_tr2);
		
		
		A("source_table_holder", source_table);
		
		
		let table = E("table", {id: "parity_table", className: "parity", cellspacing: "0"});
		C(table);
		let tr_b1 = E("tr", null, TE("td", "none"));
		let tr_h = E("tr", null, TE("th", "none", {style: {}}, "役割"));
		let tr_i = E("tr", {id: "元データ"}, TE("th", "none", {style: {}}, T("")));
		let data: number[] = [-1]; // starts with index = 1
		
		let d_i = 1;
		let p_i = 1;
		for(let i = 1; i <= N; i ++){
			if(i == p_i){
				data.push(-1);
				p_i *= 2;
			}else{
				data.push(parseInt((get("data_" + d_i) as HTMLInputElement).value));
				d_i ++;
			}
		}
		d_i = 1;
		p_i = 1;
		let p = M;
		for(let i = 1; i <= N; i ++){
			A(tr_b1, E("th", null, "" + i + " =", E("br"), to_b(i, M), sub_2()/*, E("br"), "ビット目"*/));
			let str;
			if(p_i == i){
				str = "パリティ " + M;
				
				let value = 0;
				let d_i_tmp = 0;
				for(let j = 1; j <= N; j ++){
					let className_p, className_rp;
					if((j & p_i) != 0){
						if(j != i){
							value = (value == data[j] ? 0 : 1);
						}
					}
				}
				
				tr_i.appendChild(TE("td", "5px solid blue", {id: "parity_" + p, style: {backgroundColor: "white", height: "2em"}}, value));
				p -= 1;
				p_i *= 2;
			}else{
				str = "データ " + d_i;
				let td = TE("td", "5px solid cyan", {style: {backgroundColor: "white", height: "2em"}}, data[i]);
				tr_i.appendChild(td);
				d_i += 1;
			}
			tr_h.appendChild(TE("td", "none", null, str));
		}

		table.appendChild(tr_b1);
		table.appendChild(tr_h);
		table.appendChild(tr_i);
		
		A("table", table);
		A("ready_table", Dom.clone(table, false) as HTMLElement);


		for(let i = 1; i <= M; i ++){
			let mask_table_dummy = create_mask_table(i);
			let mask_table = create_mask_table(i);
			
			mask_table.id = "mask_" + i;
			
			mask_table_dummy.style.visibility = "hidden";
			mask_table_dummy.style.position = "relative";
			mask_table.style.position = "absolute";
			mask_table.style.margin = "0px";
			
			let div = E("div", {style: {}}, mask_table_dummy, mask_table);
			
			A("mask", div);
			
			let rect = mask_table_dummy.getBoundingClientRect();
			mask_table.style.left = mask_table_dummy.offsetLeft + "px";
			mask_table.style.top = mask_table_dummy.offsetTop + "px";
			
		}
		
		let error_tr = E("tr", null, TE("th", "none", {style: {height: "1em"}}, "エラー"));
		let error_table = E("table", {className: "parity", cellspacing: "0"}, error_tr);
		
		for(let i = 1; i <= N; i ++){
			A(error_tr, TE("td", "1px solid #E7A3AE", {style: {}, onchange: recalc}, Dom.input("checkbox", {id: "error_" + i})));
		}
		
		A("error", error_table);
		

		let received_table = Dom.clone(table, false) as HTMLElement;
		received_table.id = "received_table";
		A("received_table_holder", received_table);
		
		
		Dom.clear("circles");
		for(let i = 1; i <= N; i ++){
			const circle = E("div", {id: "circle_" + i, style: {position: "absolute", fontSize: "300%", color: "lightGreen"}}, "○");
			
			A("circles", circle);
		}
		
		
		let result_tr = E("tr", null, TE("th", "none", {style: {height: "1em"}}, "結果"));
		let result_table = E("table", {id: "result_table", className: "parity", cellspacing: "0"}, result_tr);
		
		p_i = 1;
		for(let i = 1; i <= N; i ++){
			let border: string;
			if(i == p_i){
				border = "5px solid blue";
				p_i *= 2;
			}else{
				border = "5px solid cyan";
			}
			let td = TE("td", border, {id: "result_" + i}, "");
			A(result_tr, td);
		}
		A("result_table_holder", result_table);
		
		
		animator = new Animator(scenario, progress_button, progress_slider);

		/*
		table.appendChild(E("tr", {className: "appendix"}, E("td", {colSpan: N + 2}, " ")));
		for(let i = 0; i < tr_ps.length; i ++){
			table.appendChild(tr_ps[i]);
		}
		table.appendChild(E("tr", {className: "appendix"}, E("td", {colSpan: N + 2}, " ")));
		table.appendChild(tr_r);

		let tr_a1 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[0]));
		let tr_a2 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[1]));
		let tr_a3 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[2]));
		
		table.appendChild(tr_a1);
		
		let tr_e = E("tr", {id: "通信エラー"}, E("th", null, T("通信エラー")));
		let tr_m = E("tr", {id: "受信結果"}, E("th", null, T("受信結果")));
		let tr_c = E("tr", {id: "誤り訂正結果"}, E("th", null, T("誤り訂正結果")));

		for(let i = 1; i <= N; i ++){
			let input = E("input", {type: "checkbox", value: "", id: "エラー" + i});
			input.addEventListener("change", calculate);
			tr_e.appendChild(E("td", null, input));
			tr_m.appendChild(E("td", null, T("?")));
			tr_c.appendChild(E("td", null, T("?")));
		}
		
		tr_a1.firstChild.appendChild(E("div", {style: { textAlign: "center" }}, "↓データの送信↓"));
		table.appendChild(tr_e);
		table.appendChild(E("tr", null, E("td", {colSpan : N + 2}, E("div", null, "↓データの送信↓"))));
		table.appendChild(tr_m);
		table.appendChild(tr_a2);
		
		for(let i = 0; i < tr_rps.length; i ++){
			table.appendChild(tr_rps[i]);
		}

		table.appendChild(tr_a3);
		table.appendChild(tr_c);

		table.appendChild(tr_b2);
		
		let math1 = get("math1");
		C(math1);
		m_H = [];
		for(let i = 0; i < M; i ++){
			let bit = Math.pow(2, M - i - 1);
			let line = [];
			for(let j = 1; j <= N; j ++){
				line.push(((j & bit) == 0) ? 0 : 1);
			}
			m_H.push(line);
		}
		
		m_G = [];
		let b = 1;
		let k = 0;
		for(let i = 1; i <= N; i ++){
			let new_line = [];
			if(b == i){
				let line = m_H[M - k - 1];
				let b2 = 1;
				for(let j = 1; j <= N; j ++){
					if(b2 == j){
						b2 *= 2;
					}else{
						new_line.push(line[j - 1]);
					}
				}
				b *= 2;
				k += 1;
			}else{
				for(let j = 0; j < N - M; j ++){
					if(j == i - k - 1){
						new_line.push(1);
					}else{
						new_line.push(0);
					}
				}
			}
			m_G.push(new_line);
		}
		m_G = transpose(m_G);
		
		A(math1, "H", E("sup", null, "T"), " = ", matrix_table(transpose(m_H)), ", ");
		A(math1, "H =", matrix_table(m_H), ", ");
		A(math1, "G =", matrix_table(m_G), ", ");
		A(math1, "H × G", E("sup", null, "T") ," =", matrix_table(multiply(m_H, transpose(m_G))), ", ");
		A(math1, "G × H", E("sup", null, "T") ," =", matrix_table(multiply(m_G, transpose(m_H))));
		}
		
		calculate();
		*/
	}
	
	window.addEventListener("load", init, false);
	
	
}



