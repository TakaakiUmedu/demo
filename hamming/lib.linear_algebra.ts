/// <reference path="./lib.ts" />

namespace Lib{
	export interface PositionType<Position extends PositionType<Position, Vector, Scalar>, Vector extends VectorType<Vector, Scalar>, Scalar>{
		add(v: Vector): Position; // transpose 
		sub(p: Position): Vector; // calc displacement from p to this
		equals(v: any): boolean;
	}

	export interface VectorType<Vector extends VectorType<Vector, Scalar>, Scalar> extends PositionType<Vector, Vector, Scalar>{
		neg(): Vector;
		mul(s: Scalar): Vector;
		div(s: Scalar): Vector;
		isZero(): boolean;
	}
	
	export type ScalarType<T extends ScalarType<T>> = Lib.VectorType<T, T>;

	export class PositionPair<P extends PositionType<P, V, S>, V extends VectorType<V, S>, S> implements PositionType<PositionPair<P, V, S>, VectorPair<V, S>, S>{
		public constructor(public readonly m1: P, public readonly m2: P){
		}
		public add(v: VectorPair<V, S>){
			return new PositionPair<P, V, S>(this.m1.add(v.m1), this.m2.add(v.m2));
		}
		public sub(p: PositionPair<P, V, S>){
			return new VectorPair<V, S>(this.m1.sub(p.m1), this.m2.sub(p.m2));
		}
		public equals(p: any){
			if(this === p){
				return true;
			}else if(p instanceof VectorPair){
				return this.m1.equals(p.m1) && this.m2.equals(p.m2);
			}else{
				return false;
			}
		}
		public toString(){
			return this.m1.toString() + "-" + this.m2.toString();
		}
	}
	

	export class VectorPair<V extends VectorType<V, S>, S> extends PositionPair<V, V, S> implements VectorType<VectorPair<V, S>, S>{
		public add(v: VectorPair<V, S>){
			return new VectorPair<V, S>(this.m1.add(v.m1), this.m2.add(v.m2));
		}
		public neg(){
			return new VectorPair<V, S>(this.m1.neg(), this.m2.neg());
		}
		public mul(s: S){
			return new VectorPair<V, S>(this.m1.mul(s), this.m2.mul(s));
		}
		public div(s: S){
			return new VectorPair<V, S>(this.m1.div(s), this.m2.div(s));
		}
		public isZero(){
			return this.m1.isZero() && this.m2.isZero();
		}
	}

	export function propDist<Position extends PositionType<Position, Vector, Scalar>, Vector extends VectorType<Vector, Scalar>, Scalar>(a: Position, b: Position, r: Scalar): Position{
		return a.add(b.sub(a).mul(r));
		/*
		if(typeof(a) === "object" && typeof(b) === "object"){
			let ret = {};
			for(let name in a){
				ret[name] = a[name] + (b[name] - a[name]) * r;
			}
			return ret;
		}else{
			return a + (b - a) * r;
		}*/
	}

	export function propDistNum(a: number, b: number, r: number){
		return a + (b - a) * r;
	}
	
	function find_row_to_replace(matrix: number[][], cols: number, i: number){
		for(let j = i + 1; j < cols; j ++){
			if(matrix[j][i] != 0){
				return j;
			}
		}
		return -1;
	}
	
	export function gaussian_elimination(matrix: number[][]){
		let rows = matrix.length;
		let cols = matrix[0].length - 1;
		if(rows != cols){
			return false;
		}
		
		for(let i = 0; i < cols; i ++){
			if(matrix[i][i] == 0){
				let r = find_row_to_replace(matrix, cols, i);
				if(r < 0){
					return false;
				}
				let tmp_row = matrix[r];
				matrix[r] = matrix[i];
				matrix[i] = tmp_row;
			}
			let p = matrix[i][i];
			if(p != 1){
				for(let j = i; j <= rows; j ++){
					matrix[i][j] /= p;
				}
			}
			for(let j = 0; j < cols; j ++){
				if(j != i){
					let n = matrix[j][i];
					if(n != 0){
						for(let k = i; k <= rows; k ++){
							matrix[j][k] -= n * matrix[i][k];
						}
					}
				}
			}
		}
		return true;
	}
	

	function find_row_to_replace_for_obj<T extends ScalarType<T>>(matrix: T[][], cols: number, i: number){
		for(let j = i + 1; j < cols; j ++){
			if(!matrix[j][i].isZero()){
				return j;
			}
		}
		return -1;
	}
	
	export function gaussian_elimination_for_obj<T extends ScalarType<T>>(matrix: T[][], one: T){
		let rows = matrix.length;
		let cols = matrix[0].length - 1;
		if(rows != cols){
			return false;
		}
		
		for(let i = 0; i < cols; i ++){
			if(matrix[i][i].isZero()){
				let r = find_row_to_replace_for_obj(matrix, cols, i);
				if(r < 0){
					return false;
				}
				let tmp_row = matrix[r];
				matrix[r] = matrix[i];
				matrix[i] = tmp_row;
			}
			let p = matrix[i][i];
			if(!p.equals(one)){
				for(let j = i; j <= rows; j ++){
					matrix[i][j] = matrix[i][j].div(p);
				}
			}
			for(let j = 0; j < cols; j ++){
				if(j != i){
					let n = matrix[j][i];
					if(!n.isZero()){
						for(let k = i; k <= rows; k ++){
							matrix[j][k] = matrix[j][k].sub(n.mul(matrix[i][k]));
						}
					}
				}
			}
		}
		return true;
	}
	
	type _LinearEquationBase<VARS extends string, T> = {[P in VARS | "_"] : T};
	type _SolutionBase<VARS extends string, T> = {[P in VARS] : T};
	
	export type LinearEquationVec<VARS extends string, T extends ScalarType<T>> = {[P in VARS | "_"] : T};
	export type SolutionVec<VARS extends string, T extends ScalarType<T>> = {[P in VARS] : T};
	
	export type LinearEquation<VARS extends string> = {[P in VARS | "_"] : number};
	export type Solution<VARS extends string> = {[P in VARS] : number};
	
	
	function _solveLinearEquation<VARS extends string, T>(equations: _LinearEquationBase<VARS, T>[], solver: (matrix: T[][])=> boolean): _SolutionBase<VARS, T> | null{
		if(equations.length > 0){
			const var_list: string[] = [];
			let var_count = 0;
			for(let v in equations[0]){
				if(v != "_"){
					var_list[var_count ++] = v;
				}
			}
			if(var_count > equations.length){
				return null;
			}
			const matrix: T[][] = [];
			for(let i = 0; i < equations.length; i ++){
				const equation = equations[i];
				const line: T[] = [];
				for(let j = 0; j < var_count; j ++){
					line.push(equation[var_list[j]]);
				}
				line.push(equation["_"]);
				matrix.push(line);
			}
			if(solver(matrix)){
				const solution: Lib.Hash<T> = {};
				for(let j = 0; j < var_count; j ++){
					solution[var_list[j]] = matrix[j][var_count];
				}
				
				return <any>solution;
			}else{
				return null;
			}
		}else{
			return null;
		}
	}
	
	export function solveLinearEquationVec<VARS extends string, T extends ScalarType<T>>(equations: LinearEquationVec<VARS, T>[], one: T): SolutionVec<VARS, T> | null{
		return _solveLinearEquation<VARS, T>(equations, (matrix: T[][]) => gaussian_elimination_for_obj(matrix, one));
	}
	export function solveLinearEquation<VARS extends string>(equations: LinearEquation<VARS>[]): Solution<VARS> | null{
		return _solveLinearEquation<VARS, number>(equations, gaussian_elimination);
	}
	
	export function output_matrix(matrix: number[][]){
		for(let j = 0; j < matrix.length; j ++){
			let line = "";
			for(let k = 0; k < matrix[j].length ; k ++){
				line += matrix[j][k] + ", "
			}
			Lib.info_output(line);
		}
	}
	
//	Lib.gaussian_elimination = gaussian_elimination;
//	Lib.output_matrix = output_matrix;
	
}


/*
	function test(){
		for(let i = 0; i < 100; i ++){
			let size = Math.floor(3 * Math.random()) + 3;
			let matrix_org = [];
			let matrix = [];
			for(let j = 0; j < size; j ++){
				matrix[j] = [];
				matrix_org[j] = [];
				for(let k = 0; k < size; k ++){
					matrix_org[j][k] = matrix[j][k] = 1.0 - Math.random() * 2.0;
				}
				matrix_org[j][size] = matrix[j][size] = 1.0 - Math.random() * 2.0;
			}
			matrix_org[0][0] = matrix[0][0] = 0;
			if(Lib.gaussian_elimination(matrix)){
				Lib.info_output(i + ": solved");
				Lib.info_output("[org]");
				for(let j = 0; j < size; j ++){
					let line = "";
					for(let k = 0; k < size ; k ++){
						line += matrix_org[j][k] + ", "
					}
					Lib.info_output(line + matrix_org[j][size]);
				}
				Lib.info_output("[solved]");
				for(let j = 0; j < size; j ++){
					let line = "";
					for(let k = 0; k < size ; k ++){
						line += matrix[j][k] + ", "
					}
					Lib.info_output(line + matrix[j][size]);
				}
				let error = 0;
				for(let j = 0; j < size; j ++){
					let sum = 0;
					for(let k = 0; k < size ; k ++){
						sum += matrix_org[j][k] * matrix[k][size];
					}
					error += sum - matrix_org[j][size]
//					Lib.info_output("  " + sum + " = " + matrix_org[j][size]);
				}
				Lib.info_output("error :" + error);
				
				
			}else{
				Lib.info_output(i + ": not solved");
			}
		}
	}
	
	
	
*/
