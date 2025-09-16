

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
	[r, g, b]
end

tables = {}

COLS = "YUV"
COL_LIST = COLS.split(//)

COL_LIST.each{|c|
	tables[c] = COUNT.times.collect{
		[]
	}
}

def add2table(tables, src, dst)
	COL_LIST.each_with_index{|c, i|
		v = dst[i]
		tables[c][v] << src
	}
end

COUNT.times{|y|
	$stderr.print "#{y}\r"
	COUNT.times{|u|
		COUNT.times{|v|
			dst = [y, u, v]
			r, g, b = src = yuv2rgb(y, u, v)
			
			if src.min.round >= 0 && src.max.round <= 255
				add2table(tables, src, dst)
			end
		}
	}
}

puts "namespace ImageViewer{"
COL_LIST.each{|c|
	puts "\texport const #{COLS}_table_#{c} = ["
	puts "\t\t" + tables[c].collect{|list|
		if list.length == 0
			"null"
		else
			col = list.sort_by{|r, g, b| r + g + b}[0]
			
			"[" + col.collect{|v| round255(v)}.join(", ") + "]"
		end
	}.join(", ")
	puts "\t];"
}
puts "}"
