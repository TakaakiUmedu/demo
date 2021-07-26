/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>

namespace Levenshtein_distance{
	const Dom = Lib.Dom;
	const SVG = Lib.SVG;
	const cursor = "⌶";

	const M = 50;
	const H = 80;
	const W = 80;
	const R = 15;
	const Rm = 2;
	const Ra = R + Rm;
	const A = 5;
	const Rd = Ra  / Math.sqrt(2);
	const Ad = A * Math.sqrt(2);
	const Mt = 5;
	const FS = 12;
	const FL = 12;
	
	class Demo{
		public static initialize(){
			new Demo();
		}
		private readonly elems = Dom.collect(
			HTMLInputElement, ["from", "to", "restart", "pass", "replace", "delete", "insert", "undo", "calc", "show_arrows", "show_distances", "show_states"], 
			HTMLElement, ["to_rest", "to_done", "from_rest", "history", "svg_frame", "history_frame"],
			SVGElement, ["svg"]
		);
//		private readonly context = new SVG.Context(this.elems.svg);
		private to_done: string;
		private to_rest: string;
		private from_rest: string;
		private from_org: string;
		private history: [number, string, string, string, HTMLElement, SVGElement][] = [];
		private route_table: [number, number][][] = [];
		private cost_table: number[][] = [];
		private arrow_table_r: SVGElement[][] = [];
		private arrow_table_d: SVGElement[][] = [];
		private arrow_table_rd: SVGElement[][] = [];
		
		private setToggleClassByCheckbox(checkbox: HTMLInputElement, target: HTMLElement, className: string){
			const toggleFunc = ()=> {
				if(checkbox.checked){
					Dom.appendClass(target, className);
				}else{
					Dom.removeClass(target, className);
				}
			};
			Dom.addEventListener(checkbox, "change", toggleFunc);
			toggleFunc();
		}
		
		private constructor(){
			Dom.addEventListener(this.elems.restart, "click", ()=> {
				this.initialize();
			});
			Dom.addEventListener(this.elems.pass,    "click", ()=> this.advance("pass"));
			Dom.addEventListener(this.elems.delete,  "click", ()=> this.advance("del"));
			Dom.addEventListener(this.elems.replace, "click", ()=> this.advance("replace"));
			Dom.addEventListener(this.elems.insert,  "click", ()=> this.advance("insert"));
			Dom.addEventListener(this.elems.undo, "click", this.undo);
			Dom.addEventListener(this.elems.calc, "click", ()=> {
				this.elems.svg_frame.style.display = "";
			});
			this.setToggleClassByCheckbox(this.elems.show_distances, this.elems.svg_frame, "show_distances");
			this.setToggleClassByCheckbox(this.elems.show_states, this.elems.svg_frame, "show_states");
			this.setToggleClassByCheckbox(this.elems.show_arrows, this.elems.svg_frame, "show_arrows");
			this.initialize();
		}
		private advance(mode: "pass" | "del" | "replace" | "insert"){
			const l1 = this.to_rest.length > 0 ? this.to_rest[0] : "";
			const l2 = this.from_rest.length > 0 ? this.from_rest[0] : "";
			const x = this.from_org.length - this.from_rest.length;
			const y = this.to_done.length;
			switch(mode){
			case "pass":
				if(this.to_rest.length > 0 && this.from_rest.length > 0 && l1 == l2){
					this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest.substr(1), 0, this.elems.pass.value, this.arrow_table_rd[y][x]);
				}
				break;
			case "replace":
				if(this.to_rest.length > 0 && this.from_rest.length > 0){
					this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest.substr(1), 1, this.elems.replace.value, this.arrow_table_rd[y][x]);
				}
				break;
			case "del":
				if(this.from_rest.length > 0){
					this.advanceEdit(this.to_done, this.to_rest, this.from_rest.substr(1), 1, this.elems.delete.value, this.arrow_table_r[y][x]);
				}
				break;
			case "insert":
				if(this.to_rest.length > 0){
					this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest, 1, this.elems.insert.value, this.arrow_table_d[y][x]);
				}
				break;
			}
		}
		private readonly undo = ()=> {
			if(this.history.length > 1){
				const entry = this.history.pop();
				if(entry !== undefined){
					const [count, to_done, to_rest, from_rest, tr, svgElem] = entry;
					Dom.remove(tr);
					this.setTexts(to_done, to_rest, from_rest);
					this.elems.history_frame.scrollTop = this.elems.history_frame.scrollHeight;
					svgElem.setAttribute("class", "");
				}
			}
		};
		private undoAll(){
			for(let i = 1; i < this.history.length; i++){
				this.history[i][5].setAttribute("class", "");
			}
			this.history = [];
			Dom.clear(this.elems.history);
			this.from_org = this.elems.from.value;
			this.advanceEdit("", this.elems.to.value, this.elems.from.value, 0, "編集開始", SVG.elem("g"));
		}
		
		private initialize(){
			this.prepareGraph();
			this.undoAll();
		}
		private advanceEdit(to_done: string, to_rest: string, from_rest: string, count: number, history: string, svgElem: SVGElement){
			count += this.history.length == 0 ? 0 : this.history[this.history.length - 1][0];
			const tr = Dom.tr(history, Dom.td(to_done, Dom.span(" ⌶ ", { className: "caret"}), from_rest), count + "手");
			Dom.append(this.elems.history, tr);
			this.history.push([count, this.to_done, this.to_rest, this.from_rest, tr, svgElem]);
			this.setTexts(to_done, to_rest, from_rest);
			this.elems.history_frame.scrollTop = this.elems.history_frame.scrollHeight;
			svgElem.setAttribute("class", "selected");
		}
		private setTexts(to_done: string, to_rest: string, from_rest: string){
			this.to_done = to_done;
			this.to_rest = to_rest;
			this.from_rest = from_rest;
			Dom.setText(this.elems.to_done, this.to_done);
			Dom.setText(this.elems.to_rest, this.to_rest);
			Dom.setText(this.elems.from_rest, this.from_rest);
			
			const l1 = this.to_rest.length > 0 ? this.to_rest[0] : "-";
			const l2 = this.from_rest.length > 0 ? this.from_rest[0] : "-";
			
			this.elems.pass.value = "“" + l2 +"”をそのまま通す";
			this.elems.replace.value = "“" + l1 + "”を“" + l2 + "”に置換";
			this.elems.delete.value = "“" + l2 +"”を削除"
			this.elems.insert.value = "“" + l1 + "”を挿入"
			
			if(this.from_rest.length > 0 && this.to_rest.length > 0){
				if(l1 == l2){
					this.elems.pass.disabled = false;
					this.elems.replace.disabled = true;
				}else{
					this.elems.pass.disabled = true;
					this.elems.replace.disabled = false;
				}
			}else{
				this.elems.pass.disabled = true;
				this.elems.replace.disabled = true;
			}
			this.elems.delete.disabled = !(this.from_rest.length > 0);
			this.elems.insert.disabled = !(this.to_rest.length > 0);
			this.elems.undo.disabled = this.history.length == 1;
		}
		private arrow(x: number, y: number, dx: boolean, dy: boolean, dashed = false){
			let dl: string;
			let da: string;
			if(!dx){
				dl = "M " + (x * W) + " " + (y * H + Ra) + " " + "l 0 " + (H - Ra * 2);
				da = "M " + (x * W - A) + " " + ((y + 1) * H - Ra - A) + " " +
				     "l " + A + " " + A + " " +
				     "l " + A + " " + (-A);
			}else if(!dy){
				dl = "M " + (x * W + Ra) + " " + (y * H) + " " + "l " + (W - Ra * 2) + " 0";
				da = "M " + ((x + 1) * W - Ra - A) + " " + (y * H - A) + " " +
				     "l " + A + " " + A + " " +
				     "l " + (-A) + " " + A;
			}else{
				dl = "M " + (x * W + Rd) + " " + (y * H + Rd) + " " + "l " + (W - Rd * 2) + " " + (H - Rd * 2);
				da = "M " + ((x + 1) * W - Rd - Ad) + " " + ((y + 1) * W - Rd) + " " +
				     "l " + Ad + " 0 " +
				     "l 0 " + (-Ad);
			}
			const pl = SVG.path(dl, "black", "transparent");
			if(dashed){
				pl.setAttribute("stroke-dasharray", "5 5");
			}
			return SVG.elem("g", { className: "arrow" }, pl, SVG.path(da, "black", "transparent"));
		}
		
		private readonly prepareGraph = ()=>{
			this.arrow_table_r = [];
			this.arrow_table_d = [];
			this.arrow_table_rd = [];
			
			const display_org = this.elems.svg_frame.style.display;
			const svg_frame_class_org = this.elems.svg_frame.className;
			this.elems.svg.removeAttribute("viewBox");
			this.elems.svg_frame.style.display = "";
			Dom.appendClass(this.elems.svg_frame, "show_states");
			
			Dom.clear(this.elems.svg);
			this.route_table = [];
			this.cost_table = [];
			
			const sx = this.elems.from.value;
			const sy = this.elems.to.value;
			const lx = sx.length;
			const ly = sy.length;
			const g_base = SVG.elem("g");
			const g_over = SVG.elem("g");
			const g_graph = SVG.elem("g", {}, g_base, g_over);
			Dom.append(this.elems.svg, g_graph);
			let labelx_width_max = 0;
			let labelx_height_max = 0;
			let labely_width_max = 0;
			for(let y = 0; y < ly + 1; y ++){
				const ssy = sy.substr(0, y);
				const costs: number[] = [];
				const routes: [number, number][] = [];
				this.cost_table.push(costs);
				this.route_table.push(routes);
				if(y == 0){
					costs.push(0);
					routes.push([0, 0]);
					for(let x = 1; x < lx + 1; x ++){
						costs.push(x);
						routes.push([-1, 0]);
					}
				}else{
					const prev_costs = this.cost_table[y - 1];
					costs.push(prev_costs[0] + 1);
					routes.push([0, -1]);
					for(let x = 1; x < lx + 1; x ++){
						const c1 = costs[x - 1] + 1;
						const c2 = prev_costs[x] + 1;
						const c3 = prev_costs[x - 1] + (sx[x - 1] == sy[y - 1] ? 0 : 1);
						if(c3 <= c1 && c3 <= c2){
							costs.push(c3);
							routes.push([-1, -1]);
						}else if(c1 <= c2 && c1 <= c3){
							costs.push(c1);
							routes.push([-1, 0]);
						}else{
							costs.push(c2);
							routes.push([0, -1]);
						}
					}
				}
				const arrows_r: SVGElement[] = [];
				const arrows_d: SVGElement[] = [];
				const arrows_rd: SVGElement[] = [];
				this.arrow_table_r.push(arrows_r);
				this.arrow_table_d.push(arrows_d);
				this.arrow_table_rd.push(arrows_rd);
				for(let x = 0; x < lx + 1; x ++){
					const ssx = sx.substr(x);
					if(y < ly){
						const ad = this.arrow(x, y, false, true);
						Dom.append(g_base, ad);
						arrows_d.push(ad);
						if(x < lx){
							const ard = this.arrow(x, y, true, true, sx[x] == sy[y]);
							Dom.append(g_base, ard);
							arrows_rd.push(ard);
						}
					}
					if(x < lx){
						const ar = this.arrow(x, y, true, false);
						Dom.append(g_base, ar);
						arrows_r.push(ar);
					}
					const circle = SVG.circle(x * W, y * H, R, "black", "transparent", { className: "search-node", title: "hoge-fuga" });
					Dom.append(g_base, SVG.text(x * W, y * H, "" + costs[x], "none", "black", { "class": "distance", style: "text-anchor:middle;dominant-baseline:central;" }));
					Dom.append(g_base, circle);
					const state_text = SVG.text(0, 0, ssy + " ⌶ " + ssx, "none", "black", { style: "text-anchor:middle;dominant-baseline:central;font-size:" + FS + "px;" });
					const state_rect = SVG.rect(0, 0, 0, 0, "black", "white");
					const state = SVG.elem("g", { "class": "state" }, state_rect, state_text);
					Dom.append(g_over, state);
					const state_size = state_text.getBoundingClientRect();
					const state_w = state_size.width;
					const state_h = state_size.height;
					state.setAttribute("class", "state hidden");
					state_rect.setAttribute("x", (-state_w / 2 - FS / 2) + "px");
					state_rect.setAttribute("y", (-state_h / 2) + "px");
					state_rect.setAttribute("width", (state_w + FS) + "px");
					state_rect.setAttribute("height", state_h + "px");
					state.setAttribute("transform", "translate(" + (x * W) + "," + (y * H + R + state_h / 2) + ")");
					((circle, state, x, y)=> {
						circle.addEventListener("mouseover", ()=>{
							state.setAttribute("class", "state show");
						});
						circle.addEventListener("mouseout", ()=>{
							state.setAttribute("class", "state hidden");
						});
						circle.addEventListener("click", ()=>{
							this.undoAll();
							let cur_x = x;
							let cur_y = y;
							let route: [number, number][] = [];
							while(cur_x > 0 || cur_y > 0){
								const d = this.route_table[cur_y][cur_x];
								route.push(d);
								cur_x += d[0];
								cur_y += d[1];
							}
							for(let k = route.length - 1; k >= 0; k --){
								const [dx, dy] = route[k];
								cur_x -= dx;
								cur_y -= dy;
								if(dx == -1 && dy == -1){
									if(sx[cur_x - 1] == sy[cur_y - 1]){
										this.advance("pass");
									}else{
										this.advance("replace");
									}
								}else if(dx == -1){
									this.advance("del");
								}else{
									this.advance("insert");
								}
							}
						});
					})(circle, state, x, y);
				}
				const labely_text = SVG.text(-R - Mt, y * H, ssy + "⌶", "none", "black", { style: "text-anchor:end;dominant-baseline:central;font-size:" + FL + "px;" });
				Dom.append(g_base, labely_text);
				const labely_width = labely_text.getBoundingClientRect().width;
				labely_width_max = Math.max(labely_width_max, labely_width + Mt);
			}
			for(let x = 0; x < lx + 1; x ++){
				const ssx = sx.substr(x);
				const labelx_text = SVG.text(0, 0, "⌶" + ssx, "none", "black", { style: "text-anchor:start;text-bottom:central;font-size:" + FL + "px;" });
				const labelx_g = SVG.elem("g", { transform: "translate(" + (x * W) + "," + (-R - Mt) + ") rotate(-30)" }, labelx_text);
				Dom.append(g_base, labelx_g);
				const labelx_rect = labelx_text.getBoundingClientRect();
				labelx_width_max = Math.max(labelx_width_max, labelx_rect.width + Mt);
				labelx_height_max = Math.max(labelx_height_max, labelx_rect.height + Mt);
			}
			
			const svg_w = this.elems.svg_frame.offsetWidth;
			const svg_h = this.elems.svg_frame.offsetWidth;
			const inner_w = (labely_width_max + Mt * 2 + (lx) * W + R * 2);
			const inner_h = (labelx_height_max + Mt * 2 + (ly) * W + R * 2 + FS + Mt);
			const scale = svg_w / inner_w;
			this.elems.svg.setAttribute("viewBox", "0 0 " + inner_w + " " + inner_h);
			g_graph.setAttribute("transform", "translate(" + (labely_width_max + Mt + R) + "," + (labelx_height_max + Mt + R) + ")");
			this.elems.svg_frame.style.width = "100%";
			this.elems.svg_frame.style.height = "calc(" + (document.documentElement.clientHeight - this.elems.svg_frame.offsetTop) + "px" + " - 1em)";

			this.elems.svg_frame.style.display = display_org;
			this.elems.svg_frame.className = svg_frame_class_org;
		};
		
	}
	Lib.executeOnDomLoad(Demo.initialize);
}
