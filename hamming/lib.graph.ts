/// <reference path="./lib.ts" />
/// <reference path="./lib.dom.ts" />
/// <reference path="./lib.geometry.ts" />

namespace Lib{
	const Dom = Lib.Dom;
	const ARROWHEAD_SIZE = 10;
	
	type LinkType = "dir" |  "bidir" | "link";
	
	class Link{
		public constructor(public type: LinkType, public readonly src: HTMLElement, public readonly dst: HTMLElement){
		}
		public update_type(type: LinkType){
			if(this.type === "dir" && type === "dir"){
				this.type = "bidir";
			}else{
				this.type = type;
			}
		}
		public draw(context: CanvasRenderingContext2D){
			let src_rect = get_rect(this.src);
			let dst_rect = get_rect(this.dst);
			if(!src_rect.colideWith(dst_rect)){
				let org_src_pos = src_rect.center();
				let org_dst_pos = dst_rect.center();
				let src_pos = org_src_pos;
				let dst_pos = org_dst_pos;
				
				let line = new Lib.Line2D(src_pos, dst_pos);
				
				{
					const src_cp = calc_cross_point(dst_pos, src_pos, src_rect);
					if(src_cp){
						src_pos = src_cp;
					}
				}
				{
					const dst_cp = calc_cross_point(src_pos, dst_pos, dst_rect);
					if(dst_cp){
						dst_pos = dst_cp;
					}
				}
				
				context.beginPath();
				context.moveTo(src_pos.x, src_pos.y);
				context.lineTo(dst_pos.x, dst_pos.y);
				context.stroke();
				
				let arrowhead_length_max = dst_pos.sub(src_pos).length();
				if(this.type === "bidir"){
					arrowhead_length_max /= 2;
				}
				let arrowhead_size = Math.min(ARROWHEAD_SIZE, arrowhead_length_max);
				
				if(this.type === "dir" || this.type === "bidir"){
					draw_arrowhead(context, org_src_pos, dst_pos, arrowhead_size, arrowhead_size);
				}
				if(this.type === "bidir"){
					draw_arrowhead(context, org_dst_pos, src_pos, arrowhead_size, arrowhead_size);
				}
			}else{
//				console.log(src_rect, dst_rect);
			}
		}
	}
	
	function draw_arrowhead(context: CanvasRenderingContext2D, src: Lib.Point2D, dst: Lib.Point2D, w: number, h: number){
		const v1 = src.sub(dst).unit();
		if(v1){
			const v2 = v1.mul(h);
			const v3 = v1.rotateR().mul(w / 2);
			const p1 = dst.add(v2);
			const p2 = p1.add(v3);
			const p3 = p1.add(v3.neg());
			
			context.beginPath();
			context.moveTo(dst.x, dst.y);
			context.lineTo(p2.x, p2.y);
			context.stroke();
			
			context.beginPath();
			context.moveTo(dst.x, dst.y);
			context.lineTo(p3.x, p3.y);
			context.stroke();
		}
	}
	
	function calc_cross_point(src_pos: Lib.Point2D, dst_pos: Lib.Point2D, rect: Lib.Rectangle): Point2D | null{
		const boundaries = rect.boundaries();
		const line = new Lib.Segment2D(src_pos, dst_pos);
		let point = null;
		let distance = 0;
		for(let i = 0; i < boundaries.length; i ++){
			const p = boundaries[i].crossPoint(line);
			if(p){
				let d = src_pos.distance2(p);
				if(point == null || distance > d){
					point = p;
					distance = d;
				}
			}
		}
		return point;
	}
	
	function get_rect(elem: HTMLElement): Lib.Rectangle{
		return Lib.Rectangle.fromLTWH(elem.offsetLeft, elem.offsetTop, elem.offsetWidth, elem.offsetHeight);
	}
	
	function get_pos(elem: HTMLElement): Lib.Point2D{
		return get_rect(elem).center();
	}
	
//	let LOG = new Dom.ElementWithText("p", "");
	
	
	
	export class Graph{
		public static initialize(){
			let divs = document.getElementsByClassName("graph");
			for(let i = 0; i < divs.length; i ++){
				let elem = divs[i];
				if(elem instanceof HTMLElement){
					new Graph(elem);
				}
			}
//			document.body.appendChild(LOG.elem);
		}
		
		private readonly nodes = new Lib.StableHash<HTMLElement>();
		private readonly target: HTMLElement;
		private readonly canvas: HTMLCanvasElement;
		private readonly context: CanvasRenderingContext2D;
		
		private readonly links: Lib.Hash<Lib.Hash<Link>> = {};
		
		private set_pos(elem: HTMLElement, pos: Lib.Point2D){
			let w = elem.offsetWidth;
			let h = elem.offsetHeight;
			elem.style.left = Math.max(Math.min(Math.round(pos.x - w / 2), Math.floor(this.canvas.width - w)), 0) + "px";
			elem.style.top = Math.max(Math.min(Math.round(pos.y - h / 2), Math.floor(this.canvas.height - h)), 0) + "px";
		}
	
		private static tmp_id = 0;
		private static ensure_get_id(elem: HTMLElement): string{
			if(elem.id){
				return elem.id;
			}else{
				while(true){
					let id = "TMP_ID" + Graph.tmp_id;
					if(!document.getElementById(id)){
						elem.id = id;
						return id;
					}
					Graph.tmp_id ++;
				}
			}
		}
		
		
		public constructor(target: HTMLElement){
			this.target = target;
			this.target.style.position = "relative";
			let child = target.firstChild;
			while(child){
				if(child instanceof HTMLElement){
					child.style.position = "absolute";
					this.nodes.push(Graph.ensure_get_id(child), child);
				}
				child = child.nextSibling;
			}
			let canvas = Dom.canvas2D();
			this.canvas = canvas.canvas;
			this.context = canvas.context;
			
			this.canvas.width = this.target.scrollWidth;
			this.canvas.height = this.target.scrollHeight;
			this.canvas.style.left = "0";
			this.canvas.style.top = "0";
			this.canvas.style.width = "100%";
			this.canvas.style.height = "100%";
//			this.canvas.style.zIndex = "1";
			this.canvas.style.position = "absolute";
			this.canvas.style.backgroundColor = "transparent";
			
			this.canvas.addEventListener("mousedown", this.drag_start);
			this.canvas.addEventListener("mousemove", this.mouse_move);
			this.canvas.addEventListener("mouseup", this.drag_end);
			this.canvas.addEventListener("mouseout", this.mouse_out);

			Dom.add(this.target, this.canvas);
			
			
			this.nodes.forEach((src_id, src)=> {
				const data_list: [LinkType, string | undefined][] = [
					["link", src.dataset.linkWith],
					["dir", src.dataset.linkTo],
					["bidir", src.dataset.linkFromTo],
					["bidir", src.dataset.linkToFrom],
				];
				for(let i = 0; i < data_list.length; i ++){
					let [type, data] = data_list[i];
					if(data){
						let id_list = data.split(/\s+/);
						for(let j = 0; j < id_list.length; j ++){
							const dst_id = id_list[j];
							const dst = this.nodes.get(dst_id);
							if(dst){
								let rev_link = null;
								let rev_link_table = this.links[dst_id];
								if(rev_link_table){
									rev_link = rev_link_table[src_id];
								}else{
									rev_link_table = this.links[dst_id] = {};
								}
								if(rev_link){
									rev_link.update_type(type);
								}else{
									let link_table = this.links[src_id];
									if(!link_table){
										link_table = this.links[src_id] = {};
									}
									link_table[dst_id] = new Link(type, src, dst);
								}
							}else{
								console.log("link target not found: from " + src_id + " to " + dst_id);
							}
						}
					}
				}
//				this.nodes.forEach((id, node)=> {
//					this.set_pos(node, new Point2D(Math.random() * this.canvas.width, Math.random() * this.canvas.height));
//				});
			});
			
			
			
			this.update();
			this.animate();
		}
		
		private update(){
			
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			this.context.lineWidth = 2;
			this.context.strokeStyle = "green";
			this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
			for(let src_id in this.links){
				let links = this.links[src_id];
				for(let dst_id in links){
					links[dst_id].draw(this.context);
				}
			}
			/*
			this.nodes.forEach((id, node)=> {
				let nx = node.offsetLeft;
				let ny = node.offsetTop;
				let nw = node.offsetWidth;
				let nh = node.offsetHeight;
				
				this.draw_x(nx, ny);
				this.draw_x(nx + nw, ny);
				this.draw_x(nx, ny + nh);
				this.draw_x(nx + nw, ny + nh);
			});
			*/
			
//			let rect0 = get_rect(this.nodes.get(this.nodes.keys()[0]) as HTMLElement);
//			let rect1 = get_rect(this.nodes.get(this.nodes.keys()[1]) as HTMLElement);
//			LOG.setText(rect0.distance(rect1).toString());
			
		}
		
		private drag_target: {
			elem: HTMLElement,
			offset: Lib.Vector2D,
		} | null = null;
		
		private pointed: HTMLElement | null = null;
		
		private find_target(mouse_pos: Lib.Point2D): HTMLElement | null{
			let elem: HTMLElement | null = null;
			let d = 0;
			this.nodes.forEach((id, node)=> {
				const rect = get_rect(node);
				if(rect.includes(mouse_pos)){
					let nd = rect.center().sub(mouse_pos).length2();
					if(elem === null || d >= nd){
						elem = node;
						d = nd;
					}
				}
			});
			return elem;
		}
		
		private drag_start = (event: MouseEvent)=> {
			const mouse_pos = Lib.Point2D.fromEvent(event);
			if(this.pointed){
				Dom.deleteClass(this.pointed, "pointed");
				const pos = get_pos(this.pointed);
				this.drag_target = {
					elem: this.pointed,
					offset: pos.sub(mouse_pos),
				};
				this.pointed = null;
				Dom.addClass(this.drag_target.elem, "dragged");
			}
			event.preventDefault();
		}

		private draw_x(x: number, y: number){
			
			this.context.strokeStyle = "red";
			this.context.lineWidth = 1;
			this.context.beginPath();
			this.context.moveTo(x - 10, y - 10);
			this.context.lineTo(x + 10, y + 10);
			this.context.stroke();
			this.context.beginPath();
			this.context.moveTo(x - 10, y + 10);
			this.context.lineTo(x + 10, y - 10);
			this.context.stroke();
		}
		
		private unpoint(){
			if(this.pointed){
				Dom.deleteClass(this.pointed, "pointed");
				this.pointed = null;
			}
		}
		private point(target: HTMLElement){
			if(target !== this.pointed){
				this.unpoint();
				Dom.addClass(target, "pointed");
				this.pointed = target;
			}
		}

		private mouse_move = (event: MouseEvent)=> {
			const mouse_pos = Lib.Point2D.fromEvent(event);
			
			if(this.drag_target){
				this.set_pos(this.drag_target.elem, mouse_pos.add(this.drag_target.offset));
				this.update();
			}else{
				const target = this.find_target(mouse_pos);
				if(target){
					this.point(target);
				}else{
					this.unpoint();
				}
			}
			event.preventDefault();
		}
		private drag_end = (event: MouseEvent)=> {
			if(this.drag_target){
				Dom.deleteClass(this.drag_target.elem, "dragged");
				this.point(this.drag_target.elem);
				this.drag_target = null;
			}
			event.preventDefault();
		}
		private mouse_out = (event: MouseEvent)=> {
			this.drag_end(event);
			this.unpoint();
			event.preventDefault();
		}
		
		private static readonly C = 0.5;
		private static readonly K = 100;
		private static readonly T = 10;
		
		private update_node_positions(){
			// https://www.slideshare.net/mfumi/fruchterman-reingold
			let sum_f: Lib.Hash<Lib.Vector2D> = {};
			const k = Graph.C * Math.sqrt(this.canvas.width * this.canvas.height / this.nodes.count());
			
			this.nodes.forEach((src_id, src)=> {
				if(!(this.drag_target && this.drag_target.elem == src)){
					let f = new Lib.Vector2D(0, 0);
					this.nodes.forEach((dst_id, dst)=> {
						if(src_id != dst_id){
							const src_rect = get_rect(src);
							const dst_rect = get_rect(dst);
							const src_pos = src_rect.center();
							const dst_pos = dst_rect.center();
							const v = dst_pos.sub(src_pos);
							const l = v.length();
							if(l > 0){
								const u = v.div(l);
//								let d = dst_rect.distance(src_rect);
								let d = l - Lib.hypot((src_rect.w + dst_rect.w) / 2, (src_rect.h + dst_rect.h) / 2);
								if(d < 1.0){
									d = 1.0;
								}else{
									d += 1.0;
								}
								if(this.links[src_id][dst_id] || this.links[dst_id][src_id]){
									f = f.add(u.mul(d * d / k).div(Graph.K));
								}
								f = f.add(u.mul(-k * k / d).div(Graph.K));
							}else{
								f = f.add(Vector2D.random(Graph.T));
							}
						}
					});
					sum_f[src_id] = f;
				}
			});
			this.nodes.forEach((id, node)=> {
				if(!(this.drag_target && this.drag_target.elem == node)){
					let f = sum_f[id];
					let d = f.length();
					if(d > Graph.T){
						f = f.mul(Graph.T / d);
					}
					this.set_pos(node, get_pos(node).add(f));
				}
			});
		}
		
		private animated: boolean = true;
		
		private animate = ()=> {
			if(this.animated){
				this.update_node_positions();
				this.update();
				setTimeout(this.animate, 33);
			}
		};
		
	}
	
	Lib.execute_on_load(Graph.initialize);
	
}



