/// <reference path="./lib.linear_algebra.ts"/>

namespace Lib{
	export class Color implements VectorType<Color, number>{
		private static toHex(d: number){
			d = Math.round(d);
			if(d >= 255){
				return "ff";
			}else if(d <= 15){
				return "0" + d.toString(16);
			}else{
				return d.toString(16);
			}
		}
		public constructor(public readonly r: number, public readonly g: number, public readonly b: number){
		}
		public add(col: Color){
			return new Color(this.r + col.r, this.g + col.g, this.b + col.b);
		}
		public sub(col: Color){
			return new Color(this.r - col.r, this.g - col.g, this.b - col.b);
		}
		public mul(r: number){
			return new Color(this.r * r, this.g * r, this.b * r);
		}
		public div(r: number){
			return new Color(this.r / r, this.g / r, this.b / r);
		}
		public neg(){
			return new Color(-this.r, -this.g, -this.b);
		}
		public isZero(){
			return this.r == 0 && this.g == 0 && this.b == 0;
		}
		public equals(obj: any){
			if(obj instanceof Color){
				return this.r == obj.r && this.g == obj.g && this.b == obj.b;
			}else{
				return false;
			}
		}
		public toString(){
			return "#" + Color.toHex(this.r) + Color.toHex(this.g) + Color.toHex(this.b);
		}
	}
	
}
