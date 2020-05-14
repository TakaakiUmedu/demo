/// <reference path="./lib.linear_algebra.ts" />

namespace Lib{
	export function hypot2(...d_list: number[]){
		let sum = 0;
		for(let i = 0; i < d_list.length; i ++){
			const d = d_list[i];
			sum += d * d;
		}
		return sum;
	}
	export function hypot(...d_list: number[]){
		return Math.sqrt(hypot2(...d_list));
	}
	
	class BasicVector2D{
		public constructor(public readonly x: number, public readonly y: number){
		}
		public toString(){
			return "(" + this.x + ", " + this.y + ")";
		}
		public equals(v: any){
			if(this === v){
				return true;
			}else if(v instanceof BasicVector2D){
				return this.x == v.x && this.y == v.y;
			}else{
				return false;
			}
		}
	}
	
	export class Vector2D extends BasicVector2D implements VectorType<Vector2D, number>{
		public length2(){
			return hypot2(this.x, this.y);
		}
		public length(){
			return Math.sqrt(this.length2());
		}
		public rotateR(){
			return new Vector2D(-this.y, this.x);
		}
		public unit(): Vector2D | null{
			const d = this.length();
			if(d > 0){
				return this.div(d);
			}else{
				return null;
			}
		}
		public add(vector: Vector2D){
			return new Vector2D(this.x + vector.x, this.y + vector.y);
		}
		public sub(vector: Vector2D){
			return new Vector2D(this.x - vector.x, this.y - vector.y);
		}
		public mul(value: number){
			return new Vector2D(this.x * value, this.y * value);
		}
		public div(value: number){
			return new Vector2D(this.x / value, this.y / value);
		}
		public neg(): Vector2D{
			return new Vector2D(-this.x, -this.y);
		}
		public isZero(){
			return this.x == 0 && this.y == 0;
		}
		public static random(length: number = 1.0): Vector2D{
			const r = Math.PI * 2 * Math.random();
			return new Vector2D(length * Math.sin(r), length * Math.cos(r));
		}
	}
	
	export class Point2D extends BasicVector2D implements PositionType<Point2D, Vector2D, number>{
		public distance2(point: Point2D){
			return hypot2(point.x - this.x, point.y - this.y);
		}
		public distance(point: Point2D){
			return Math.sqrt(this.distance2(point));
		}
		public equals(point: any){
			if(point instanceof Point2D){
				return this.x == point.x && this.y == point.y;
			}else{
				return false;
			}
		}
		public sub(point: Point2D){
			return new Vector2D(this.x - point.x, this.y - point.y);
		}
		public add(vector: Vector2D){
			return new Point2D(this.x + vector.x, this.y + vector.y);
		}
		public static fromMouseOffset(event: MouseEvent){
			return new Point2D(event.offsetX, event.offsetY);
		}
		public static fromMouseClient(event: MouseEvent){
			return new Point2D(event.clientX, event.clientY);
		}
		public static fromElementStyle(element: HTMLElement | string){
			const target = Lib.Dom.prepareTarget(element);
			if(target instanceof HTMLElement){
				return new Lib.Point2D(target.style.left !== null ? parseInt(target.style.left) : 0, target.style.top !== null ? parseInt(target.style.top) : 0);
			}else{
				throw "element has not style";
			}
		}
		public static fromElementOffset(element: HTMLElement | string){
			const target = Lib.Dom.prepareTarget(element);
			if(target instanceof HTMLElement){
				return new Lib.Point2D(target.offsetLeft, target.offsetTop);
			}else{
				throw "element has not offset";
			}
		}
	}
	
	
	export class Rectangle extends PositionPair<Point2D, Vector2D, number>{
		public readonly l: number;
		public readonly t: number;
		public readonly r: number;
		public readonly b: number;
		public readonly w: number;
		public readonly h: number;
		
		public static fromPoints(m1: Point2D, m2: Point2D){
			return new Rectangle(m1.x, m1.y, m2.x, m2.y);
		}
		public static fromCenterAndSize(center: Point2D, size: Vector2D){
			const size2 = size.div(2);
			return Rectangle.fromPoints(center.add(size2.neg()), center.add(size2));
		}
		public static fromLTWH(l: number, t: number, w: number, h: number){
			return new Rectangle(l, t, l + w, t + h);
		}
		public constructor(x1: number, y1: number, x2: number, y2: number){
			if(x1 > x2){
				const tmp = x1;
				x1 = x2;
				x2 = tmp;
			}
			if(y1 > y2){
				const tmp = y1;
				y1 = y2;
				y2 = tmp;
			}
			super(new Point2D(x1, y1), new Point2D(x2, y2));
			this.l = this.m1.x;
			this.t = this.m1.y;
			this.r = this.m2.x;
			this.b = this.m2.y;
			this.w = this.r - this.l;
			this.h = this.b - this.t;
		}
		public center(): Point2D{
			return new Point2D((this.l + this.r) / 2, (this.t + this.b) / 2);
		}
		public size(): Vector2D{
			return new Vector2D(this.w, this.h);
		}
		public boundaries(): Segment2D[]{
			const c1 = this.m1;
			const c2 = new Point2D(this.r, this.t);
			const c3 = this.m2;
			const c4 = new Point2D(this.l, this.b);
			return [
				new Segment2D(c1, c2),
				new Segment2D(c2, c3),
				new Segment2D(c3, c4),
				new Segment2D(c4, c1),
			];
		}
		
		public colideWith(rect: Rectangle){
			return this.l <= rect.r && this.r >= rect.l && this.t <= rect.b && this.b >= rect.t;
		}
		public includes(pos: Point2D){
			return pos.x >= this.l && pos.x <= this.r && pos.y >= this.t && pos.y <= this.b;
		}
		
		public distance(rect: Rectangle){
			if(this.colideWith(rect)){
				return -Math.min(rect.r - this.l, this.r - rect.l, rect.b - this.t, this.b - rect.t);
			}
			let this_x: number | null = null;
			let this_y: number | null = null;
			let rect_x: number | null = null;
			let rect_y: number | null = null;
			if(this.l > rect.r){
				// rect this
				this_x = this.l;
				rect_x = rect.r;
			}else if(this.r < rect.l){
				// this rect
				this_x = this.r;
				rect_x = rect.l;
			}

			if(this.t > rect.b){
				// rect
				// this
				this_y = this.t;
				rect_y = rect.b;
			}else if(this.b < rect.t){
				// this
				// rect
				this_y = this.b;
				rect_y = rect.t;
			}
			
			if(this_x !== null && rect_x !== null){
				if(this_y !== null && rect_y !== null){
					return hypot(this_x - rect_x, this_y - rect_y);
				}else{
					return Math.abs(this_x - rect_x);
				}
			}else{
				if(this_y !== null && rect_y !== null){
					return Math.abs(this_y - rect_y);
				}
			}
			// not reachable
			return 0;
		}
		
		public add(v: VectorPair<Vector2D, number>): Rectangle{
			return Rectangle.fromPoints(this.m1.add(v.m1), this.m2.add(v.m2));
		}/*
		public sub(rect: Rectangle): VectorPair<Vector2D, number>{
			return new VectorPair<Vector2D, number>(this.center().sub(rect.center()), this.size().sub(rect.size()));
		}*/
		
		
	}
	
	export class Line<P extends PositionType<P, V, number>, V extends VectorType<V, number>> extends PositionPair<P, V, number>{
		public vector(): V{
			return this.m2.sub(this.m1);
		}
	}



	
	export class Line2D extends Line<Point2D, Vector2D>{
		public crossPoint(line: Line2D){
			let v1 = this.vector();
			let v2 = line.vector();
			
			// calculate (x, y)
			// v1.x(y - this.m1.y) = v1.y (x - this.m1.x)
			// v2.x(y - line.m1.y) = v2.y (x - line.m1.x)
			let equations = [
				{x: v1.y, y: -v1.x, _: v1.y * this.m1.x - v1.x * this.m1.y},
				{x: v2.y, y: -v2.x, _: v2.y * line.m1.x - v2.x * line.m1.y},
			];
			const solution = Lib.solveLinearEquation(equations);
			if(solution){
				return new Point2D(solution.x, solution.y);
			}else{
				return null;
			}
		}
	}
	
//	export class Segment<V extends Geometry<V, P>, P extends PointType<V, P>> extends Line<V, P>{
//		
//	}
	
	export class Segment2D extends Line2D{
		
		crossPoint(line: Line2D): Point2D | null{
			const v1 = this.vector();
			const v2 = line.vector();
			
			// calculate (s, t)
			// this.m1 + v1 * s = line.m1 + v2 * t
			// this.m1 + v1 * s - line.m1 - v2 * t = 0
			// v1 * s - v2 * t = -this.m1 + line.m1
			const equations = [
				{s: v1.x, t: -v2.x, _: -this.m1.x + line.m1.x},
				{s: v1.y, t: -v2.y, _: -this.m1.y + line.m1.y},
			];
			const solution = Lib.solveLinearEquation(equations);
			if(solution){
				//const t = matrix[1][2];
				if(solution.s >= 0 && solution.s <= 1){
					return this.m1.add(v1.mul(solution.s));
				}else{
					return null;
				}
			}else{
				return null;
			}
		}
	}
}