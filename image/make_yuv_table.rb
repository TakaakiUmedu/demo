

COUNT = 256
MAX = COUNT - 1
MARGIN = 1

def round255(x)
	x < 0 ? 0 : (x > MAX ? MAX : x.round)
end

def rgb2yuv(r, g, b)
	y = 0.299 * r + 0.587 * g + 0.114 * b;
	u = (-0.14713 * r - 0.28886 * g + 0.436 * b + 0.436 * MAX) / 0.872;
	v = (0.615 * r - 0.51499 * g - 0.10001 * b + 0.615 * MAX) / 1.23;
	[round255(y), round255(u), round255(v)]
end

def yuv2rgb(y, u, v)
	u = u * 0.872 - 0.436 * MAX;
	v = v * 1.23 - 0.615 * MAX;
	
	r = y + 1.13983 * v;
	g = y - 0.39465 * u - 0.58060 * v;
	b = y + 2.03211 * u;
	[round255(r), round255(g), round255(b)]
end

tables = {}

COLS = "YUV"
COL_LIST = COLS.split(//)

COL_LIST.each{|c|
	tables[c] = COUNT.times.collect{
		[[0] * COL_LIST.length, 0]
	}
}

def add2table(tables, src, dst)
	COL_LIST.each_with_index{|c, i|
		v = dst[i]
		item = tables[c][v]
		src.each_with_index{|v2, j|
			item[0][j] += v2
		}
		item[1] += 1
	}
end

COUNT.times{|r|
	$stderr.print "#{r}\r"
	COUNT.times{|g|
		COUNT.times{|b|
			src = [r, g, b]
			y, u, v = dst = rgb2yuv(r, g, b)
			r2, g2, b2 = yuv2rgb(y, u, v)
			
			if (r - r2).abs > MARGIN || (g - g2).abs > MARGIN || (b - b2).abs > MARGIN
				puts "error: #{[r, g, b].inspect} => #{[y, u, v].inspect} => #{[r2, g2, b2].inspect}"
			end
			
			add2table(tables, src, dst)
		}
	}
}

puts "namespace ImageViewer{"
COL_LIST.each{|c|
	puts "\texport const #{COLS}_table_#{c} = ["
	puts "\t\t" + tables[c].collect{|sums, count|
		if count == 0
			"null"
		else
			col = sums.collect{|v| round255(v.to_f / count)}
			
			"[" + col.join(", ") + "]"
		end
	}.join(", ")
	puts "\t];"
}
puts "}"
