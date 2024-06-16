/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ts"/>


namespace HexSlide{
	const Dom = Lib.Dom;
	
	const posX = 100;
	const posY = 100;
	
	const count = 3;
	const size = 30;
	const margin = 2;
	
	const speed = 1;
	
	type Data = {
		x: number;
		y: number;
		n: string;
		a: string;
		dx: number;
		dy: number;
	};
	
	class Main{
		private readonly canvas = Dom.getCanvas("canvas");
		private readonly context = this.canvas.context;
		private readonly data: Data[] = [];
		private readonly lines: number[][] = [];
		
		private cursor: number | null = null;
		private vacant: number;
		
		private vx: number;
		private vy: number;
		
		private moving = false;
		
		private constructor(){
			this.context.lineWidth = 2;
			this.context.fillStyle = "#bfffff";
			this.context.textAlign = "center";
			this.context.textBaseline = "middle";
			this.context.font = "bold 24px serif";
			
			{
				const grid: (number | undefined)[][] = [];
				const h = count * 2 - 1;
				let i = 1;
				for(let y = 0; y < h; y ++){
					const l: (number | undefined)[] = [];
					const c = Math.abs((y - count + 1));
					for(let x = 0; x < c / 2; x ++){
						l.push(undefined);
					}
					const line: number[] = [];
					const w = h - c;
					for(let x = 0; x < w; x ++){
						const d = {
							x: posX + (x + (h - w) / 2) * (margin * 2 + size * 2 * Math.sin(Math.PI / 3)),
							y: posY + y * (margin / Math.sin(Math.PI / 6) + size * 1.5),
							n: i.toString(),
							a: i.toString(),
							dx: 0,
							dy: 0,
						};
						line.push(this.data.length);
						l.push(this.data.length);
						this.data.push(d);
						i ++;
					}
					grid.push(l);
					this.lines.push(line);
				}
				
				{
					let x = 0;
					let found = false;
					while(true){
						const line: number[] = [];
						let dx = 0;
						for(const l of grid){
							const cx = x - Math.floor(dx / 2);
							if(cx >= 0 && cx < l.length){
								const v = l[cx];
								if(v !== undefined){
									line.push(v);
								}
							}
							dx ++;
						}
						if(found && line.length == 0){
							break;
						}
						if(line.length > 0){
							this.lines.push(line);
							found = true;
						}
						x ++;
					}
				}

				{
					let x = -count;
					let found = false;
					while(true){
						const line: number[] = [];
						let dx = 1;
						for(const l of grid){
							const cx = x + Math.floor(dx / 2);
							if(cx >= 0 && cx < l.length){
								const v = l[cx];
								if(v !== undefined){
									line.push(v);
								}
							}
							dx ++;
						}
						if(found && line.length == 0){
							break;
						}
						if(line.length > 0){
							this.lines.push(line);
							found = true;
						}
						x ++;
					}
				}
				
				
			}
			this.vacant = this.data.length - 1;

			for(let i = 0; i < this.data.length - 1; i ++){
				const j = Math.floor(Math.random() * i);
				const d0 = this.data[i];
				const d1 = this.data[j];
				const t = d0.n;
				d0.n = d1.n;
				d1.n = t;
			}
			
			Dom.addEventListener(this.canvas.canvas, "mousemove", (event)=> {
				if(this.moving){
					return;
				}
				let m : number | null = null;
				this.cursor = null;
				for(let i = 0; i < this.data.length; i ++){
					const d = this.data[i];
					const dx = d.x - event.offsetX;
					const dy = d.y - event.offsetY;
					const v = Math.sqrt(dx * dx + dy * dy);
					if(v < size * 1.5 && (m === null || m > v)){
						m = v;
						this.cursor = i;
					}
				}
//				console.log(m);
			});
			Dom.addEventListener(this.canvas.canvas, "mouseout", (event)=> {
				this.cursor = null;
			});
			Dom.addEventListener(this.canvas.canvas, "click", (event)=> {
				if(this.cursor === null || this.moving){
					return;
				}
				for(const line of this.lines){
					const indexV = line.indexOf(this.vacant);
					if(indexV === -1){
						continue;
					}
					const indexC = line.indexOf(this.cursor);
					if(indexC === -1){
						continue;
					}
					if(indexV > indexC){
						for(let i = indexV; i > indexC; i --){
							const d0 = this.data[line[i]];
							const d1 = this.data[line[i - 1]];
							d0.n = d1.n;
							d0.dx = d1.x - d0.x;
							d0.dy = d1.y - d0.y;
						}
					}else{
						for(let i = indexV; i < indexC; i ++){
							const d0 = this.data[line[i]];
							const d1 = this.data[line[i + 1]];
							d0.n = d1.n;
							d0.dx = d1.x - d0.x;
							d0.dy = d1.y - d0.y;
						}
					}
					this.vacant = this.cursor;
					this.moving = true;
				}
			});
			
			
			setInterval(this.draw, 33);
		}
		
		
		
		private drawHex(x: number, y: number, s: string){
			this.context.beginPath();
			this.context.moveTo(x, y - size);
			for(let i = 1; i < 6; i ++){
				this.context.lineTo(x + size * Math.sin(Math.PI * i / 3), y - size * Math.cos(Math.PI * i / 3));
			}
			this.context.closePath();
			this.context.fill();
			this.context.stroke();
			this.context.fillStyle = "#000000";
			this.context.fillText(s, x, y);
		}
		
		
		
		private readonly draw = ()=>{
			if(this.moving){
				let moving = false;
				for(let i = 0; i < this.data.length; i ++){
					const d = this.data[i];
					if(d.dx !== 0 || d.dy !== 0){
						const v = Math.sqrt(d.dx * d.dx + d.dy * d.dy);
						
						if(v > speed){
							d.dx *= (v - speed) / v;
							d.dy *= (v - speed) / v;
							moving = true;
						}else{
							d.dx = 0;
							d.dy = 0;
						}
					}
				}
				this.moving = moving;
			}
			this.context.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
			for(let i = 0; i < this.data.length; i ++){
				const d = this.data[i];
				if(this.vacant === i){
					this.context.fillStyle = "transparent";
					this.context.strokeStyle = "#bfffff";
					this.drawHex(d.x, d.y, "");
				}else{
					if(this.cursor === i){
						this.context.fillStyle = "#ffbfff";
						this.context.strokeStyle = "#ff80ff";
					}else if(d.n === d.a){
						this.context.fillStyle = "#cfffcf";
						this.context.strokeStyle = "#9fff9f";
					}else{
						this.context.fillStyle = "#bfffff";
						this.context.strokeStyle = "#80ffff";
					}
					this.drawHex(d.x + d.dx, d.y + d.dy, d.n);
				}
			}
			setTimeout(this.draw, 33);
		};
		
		
		public static initialize(){
			new Main();
		}
	}
	
	Lib.executeOnDomLoad(Main.initialize);
	
}