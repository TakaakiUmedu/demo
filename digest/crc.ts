
declare function BigInt(value: number): bigint;

module CRC{
	const CRC16_POLY = 0xA001n;
	const CRC32_POLY = 0xEDB88320n;
	const CRC64_POLY = 0xC96C5795D7870F42n;
	
	const Tables = new Map<bigint, bigint[]>();
	
	function calcTable(poly: bigint): bigint[]{
		let table = Tables.get(poly);
		if(table !== undefined){
			return table;
		}
		table = [];
		for(let i = 0n; i < 256; i++){
			let value = i;
			for(let shift = 0n; shift < 8; shift++){
				if (value & 1n){
					value = (value >> 1n) ^ poly;
				}else{
					value >>= 1n;
				}
			}
			table.push(value);
		}
		Tables.set(poly, table);
		return table;
	}
	
	function CRC(message: string, table: bigint[], digestLength: bigint){
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		const start = digestLength > 2n ? (1n << (digestLength * 8n)) - 1n : 0n;
		let digest = start;
		for(let i = 0; i < data.length; i ++){
			digest = table[Number((digest ^ BigInt(data[i])) & 0xffn)] ^ (digest >> 8n);
		}
		if(digestLength > 2n){
			digest = digest ^ start;
		}
		let result = "";
		for(let i = 0; i < digestLength; i ++){
			const s = Number(digest & 0xffn).toString(16);
			if(s.length < 2){
				result = "0" + s + result;
			}else{
				result = s + result;
			}
			digest >>= 8n;
		}
		return result;
	}
	
	export function CRC16(message: string): string{
		return CRC(message, calcTable(CRC16_POLY), 2n);
	}

	export function CRC32(message: string): string{
		return CRC(message, calcTable(CRC32_POLY), 4n);
	}

	export function CRC64(message: string): string{
		return CRC(message, calcTable(CRC64_POLY), 8n);
	}
	
	export function CHECKSUM(message: string): string{
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		let sum = 0;
		for(let i = 0; i < data.length; i ++){
			sum = (sum + data[i]) % 256;
		}
		let s = sum.toString(16);
		if(s.length < 2){
			return "0" + s
		}else{
			return s;
		}
	}
	
	export function XOR(message: string): string{
		const encoder = new TextEncoder();
		const data = encoder.encode(message);
		let sum = 0;
		for(let i = 0; i < data.length; i ++){
			sum = (sum ^ data[i]) % 256;
		}
		let s = sum.toString(16);
		if(s.length < 2){
			return "0" + s
		}else{
			return s;
		}
	}
	
}
