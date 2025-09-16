/// <reference path="mylib/mylib.ts"/>
/// <reference path="mylib/mylib.dom.ts"/>
/// <reference path="mylib/mylib.color.ts"/>

namespace Lib{
	export class Svg{
		public static elem(name: string, attributes: Lib.Hash<string>){
			let elem = document.createElementNS("http://www.w3.org/2000/svg", name);
			for(let name in attributes){
				elem.setAttribute(name, attributes[name]);
			}
			return elem
		}
		public static circle(cx: number, cy: number, r: number, stroke: string, fill: string){
			return Svg.elem("circle", {
				cx:     cx + "px",
				cy:     cy + "px",
				r:      r + "px",
				stroke: stroke,
				fill:   fill,
				"shape-rendering": "crispEdges",
			});
		}
		public static path(path: string, stroke: string, fill: string){
			return Svg.elem("path", {
				d:      path,
				stroke: stroke,
				fill:   fill,
				"shape-rendering": "crispEdges",
			});
		}
		public static fill(elem: SVGElement, r: number, g: number, b: number){
			elem.setAttribute("fill", new Lib.Color(r, g, b).toString());
		}
	}
}

namespace Color{
	const CX = 50;
	const CY = 50;
	const R = 20;
	const D_CENTER = 10;
	const D_WIDTH = 9.5;
//	const D_CYCLE = 1000;
	const D_SPEED = 0.005;
	const D_INTERVAL = 33;
	type Point = {x: number, y: number};
	const Dom = Lib.Dom;
	class Color{
		public static initialize(){
			new Color();
		}
		private calcPaths(angle: number, D: number, names: string[]){
			const pathTable: Lib.Hash<string> = {};
			const centers: Point[] = [];
			for(let i = 0; i < 3; i ++){
				centers.push({
					x: CX + D * Math.cos((angle + 120 * i) * Math.PI / 180),
					y: CY + D * Math.sin((angle + 120 * i) * Math.PI / 180),
				});
			}
			
			const outer_xps: Point[] = [];
			const inner_xps: Point[] = [];
			for(let i = 0; i < 3; i ++){
				const c1 = centers[i];
				const c2 = centers[(i + 1) % 3];
				const dx = (c2.x - c1.x) / 2;
				const dy = (c2.y - c1.y) / 2;
				const d = Math.sqrt(dx * dx + dy * dy);
				const a = Math.acos(d / R);
				outer_xps.push({
					x: c1.x + R * Math.cos((angle + 120 * i + 150) * Math.PI / 180 - a),
					y: c1.y + R * Math.sin((angle + 120 * i + 150) * Math.PI / 180 - a),
				});
				inner_xps.push({
					x: c1.x + R * Math.cos((angle + 120 * i + 150) * Math.PI / 180 + a),
					y: c1.y + R * Math.sin((angle + 120 * i + 150) * Math.PI / 180 + a),
				});
			}
			
			const colors_rgb = ["#f00", "#0f0", "#00f"];
			const colors_rgb2 = ["#ff0", "#0ff", "#f0f"];
			for(let i = 0; i < 3; i ++){
				const o1 = outer_xps[i];
				const o2 = outer_xps[(i + 1) % 3];
				const i1 = inner_xps[(i + 2) % 3];
				const i2 = inner_xps[i];
				pathTable[names[i]] = 
					"M " + o1.x + " " + o1.y + " " + 
					"A " + R + " " + R + " 0 " + (D > R * Math.sqrt(3) / 3 ? "1" : "0")  + " 1 " + o2.x + " " + o2.y + " " +
					"A " + R + " " + R + " 0 0 0 " + i1.x + " " + i1.y + " " +
					"A " + R + " " + R + " 0 0 0 " + o1.x + " " + o1.y;
				pathTable[names[i] + names[(i + 1) % 3]] = 
					"M " + o2.x + " " + o2.y + " " + 
					"A " + R + " " + R + " 0 0 1 " + i2.x + " " + i2.y + " " +
					"A " + R + " " + R + " 0 0 0 " + i1.x + " " + i1.y + " " +
					"A " + R + " " + R + " 0 0 1 " + o2.x + " " + o2.y;
			}
			
			pathTable[names.join("")] = 
				"M " + inner_xps[0].x + " " + inner_xps[0].y + " " + 
				"A " + R + " " + R + " 0 0 1 " + inner_xps[1].x + " " + inner_xps[1].y + " " +
				"A " + R + " " + R + " 0 0 1 " + inner_xps[2].x + " " + inner_xps[2].y + " " +
				"A " + R + " " + R + " 0 0 1 " + inner_xps[0].x + " " + inner_xps[0].y;
			return pathTable;
		}
		
		
		
		private appendCircles(svg: SVGElement, angle: number, names: string[], items: Lib.Hash<SVGElement>){
			const pathTable = this.calcPaths(angle, D_CENTER, names);
			for(const name in pathTable){
				const path = Lib.Svg.path(pathTable[name], "transparent", "transparent");
				svg.appendChild(path);
				items[name] = path;
			}
		}
		
		
		
		private readonly elem = Dom.combineTables(
			Dom.getInputs("r", "g", "b", "c", "m", "y", "move", "offset"),
			Dom.getOutputs("val_r", "val_g", "val_b", "val_c", "val_m", "val_y"),
		)
		
		private readonly update_values = ()=> {
			this.elem.val_r.value = this.elem.r.value;
			this.elem.val_g.value = this.elem.g.value;
			this.elem.val_b.value = this.elem.b.value;
			this.elem.val_c.value = this.elem.c.value;
			this.elem.val_m.value = this.elem.m.value;
			this.elem.val_y.value = this.elem.y.value;
			const r = parseInt(this.elem.r.value);
			const g = parseInt(this.elem.g.value);
			const b = parseInt(this.elem.b.value);
			
			
			Lib.Svg.fill(this.itemTable["r"], r, 0, 0);
			Lib.Svg.fill(this.itemTable["g"], 0, g, 0);
			Lib.Svg.fill(this.itemTable["b"], 0, 0, b);
			Lib.Svg.fill(this.itemTable["rg"], r, g, 0);
			Lib.Svg.fill(this.itemTable["gb"], 0, g, b);
			Lib.Svg.fill(this.itemTable["br"], r, 0, b);
			Lib.Svg.fill(this.itemTable["rgb"], r, g, b);

			Lib.Svg.fill(this.itemTable["c"], r, 255, 255);
			Lib.Svg.fill(this.itemTable["m"], 255, g, 255);
			Lib.Svg.fill(this.itemTable["y"], 255, 255, b);
			Lib.Svg.fill(this.itemTable["cm"], r, g, 255);
			Lib.Svg.fill(this.itemTable["my"], 255, g, b);
			Lib.Svg.fill(this.itemTable["yc"], r, 255, b);
			Lib.Svg.fill(this.itemTable["cmy"], r, g, b);
		};
		private readonly rgb_changed = ()=> {
			const r = parseInt(this.elem.r.value);
			const g = parseInt(this.elem.g.value);
			const b = parseInt(this.elem.b.value);
			this.elem.c.value = "" + (255 - r);
			this.elem.m.value = "" + (255 - g);
			this.elem.y.value = "" + (255 - b);
			this.update_values();
		};
		private readonly cmy_changed = ()=> {
			const c = parseInt(this.elem.c.value);
			const m = parseInt(this.elem.m.value);
			const y = parseInt(this.elem.y.value);
			this.elem.r.value = "" + (255 - c);
			this.elem.g.value = "" + (255 - m);
			this.elem.b.value = "" + (255 - y);
			this.update_values();
		};
		
//		private startTime = Date.now();
		private lastTime = Date.now();
		private moving = true;
		private registered = false;
		private moveRight = true;
		private readonly animate = ()=> {
			if(this.moving == false){
				this.registered = false;
				return;
			}
			const curTime = Date.now();
			const interval = curTime - this.lastTime;
			this.lastTime = curTime;
			
			const prev_offset = this.getOffset();
			let offset = prev_offset + (1.01 - Math.abs(prev_offset)) * D_SPEED * interval * (this.moveRight ? 1 : -1);
			if(this.moveRight){
				if(offset > 1){
					offset = 1 - (offset - 1);
					this.moveRight = false;
				}
			}else{
				if(offset < -1){
					offset = -1 + (-1 - offset);
					this.moveRight = true;
				}
			}
			this.setOffset(offset);

			setTimeout(this.animate, D_INTERVAL);
		}
		
		private getOffset(){
			return (parseFloat(this.elem.offset.value) - this.vCenter) / this.vWidth * 2;
		}
		private setOffset(offset: number){
			this.elem.offset.value = "" + (this.vCenter + offset * this.vWidth / 2);
			
			const D = D_CENTER - offset * D_WIDTH;
			
			let pathTable = this.calcPaths(150, D, ["r", "g", "b"]);
			for(const name in pathTable){
				this.itemTable[name].setAttribute("d", pathTable[name]);
			}
			pathTable = this.calcPaths(330, D, ["c", "m", "y"]);
			for(const name in pathTable){
				this.itemTable[name].setAttribute("d", pathTable[name]);
			}
		}
		
		private readonly register_update = ()=>{
			if(this.registered == false){
				setTimeout(this.animate, D_INTERVAL);
				this.registered = true;
				this.lastTime = Date.now();
			}
		}
		
		private readonly itemTable: Lib.Hash<SVGElement> = {};
		
		private readonly vCenter: number;
		private readonly vWidth: number;
		private constructor(){
			let rgb = document.getElementById("rgb");
			let cmy = document.getElementById("cmy");
			
			if(!(rgb instanceof SVGSVGElement) || !(cmy instanceof SVGSVGElement)){
				return;
			}
			
			const vMin = parseFloat(this.elem.offset.min);
			const vMax = parseFloat(this.elem.offset.max);
			this.vWidth = vMax - vMin;
			this.vCenter = (vMax + vMin) / 2;
			
			rgb.style.backgroundColor = "#000";
			cmy.style.backgroundColor = "#fff";
			this.appendCircles(rgb, 150, ["r", "g", "b"], this.itemTable);
			this.appendCircles(cmy, 330, ["c", "m", "y"], this.itemTable);
			
			Dom.addEventListener(this.elem.r, "input", this.rgb_changed);
			Dom.addEventListener(this.elem.g, "input", this.rgb_changed);
			Dom.addEventListener(this.elem.b, "input", this.rgb_changed);
			Dom.addEventListener(this.elem.c, "input", this.cmy_changed);
			Dom.addEventListener(this.elem.m, "input", this.cmy_changed);
			Dom.addEventListener(this.elem.y, "input", this.cmy_changed);
			
			Dom.addEventListener(this.elem.move, "change", ()=>{
				this.moving = this.elem.move.checked;
				if(this.moving){
					this.register_update();
				}
			});
			Dom.addEventListener(this.elem.offset, "mousedown", ()=>{
				this.elem.move.checked = false;
				this.moving = false;
			});

			Dom.addEventListener(this.elem.offset, "input", ()=>{
				this.setOffset(this.getOffset());
			});

			this.update_values();
			
			this.register_update();
		}
		
		
	}
	
	Lib.executeOnDomLoad(Color.initialize);
	
	
	
	
}


