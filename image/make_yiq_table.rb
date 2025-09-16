

COUNT = 256
MAX = COUNT - 1
MARGIN = 1

def round255(x)
	x < 0 ? 0 : (x > MAX ? MAX : x.round)
end

F = MAX.to_f

def rgb2yiq(r, g, b)
	r /= F;
	g /= F;
	b /= F;
	
	y = 0.299  * r + 0.587  * g + 0.114  * b;
	i = 0.5959 * r - 0.2746 * g - 0.3213 * b;
	q = 0.2115 * r - 0.5227 * g + 0.3112 * b;
	
	[y * 255, (i + 0.5957) / (0.5957 * 2) * 255 , (q + 0.5226) / (0.5226 * 2) * 255]
end

def yiq2rgb(y, i, q)
	y = y / F
	i = i / F * (0.5957 * 2) - 0.5957
	q = q / F * (0.5226 * 2) - 0.5226
	
	r = y + 0.956 * i + 0.619 * q
	g = y - 0.273 * i - 0.647 * q
	b = y - 1.106 * i + 1.703 * q
	
	[r * 255, g * 255, b * 255]
end


tables = {}

COLS = "YIQ"
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
			y, u, v = dst = rgb2yiq(r, g, b)
			r2, g2, b2 = yiq2rgb(y, u, v)
			
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
