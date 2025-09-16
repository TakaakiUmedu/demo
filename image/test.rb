
N = 256
F = (N - 1).to_f

def round255(val)
	if val <= 0
		return 0
	elsif val >= N - 1
		return N - 1
	else
		return val.round
	end
end

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

#y_table = {}
#i_table = {}
#q_table = {}

#N.times{|x|
#	y_table[x] = []
#	i_table[x] = []
#	q_table[x] = []
#}

checked = {}
yi_table = {}
iq_table = {}
qy_table = {}

N.times{|r|
	print "#{r}\r"
	N.times{|g|
		N.times{|b|
			y, i, q = rgb2yiq(r, g, b)
			y = round255(y)
			i = round255(i)
			q = round255(q)
			item = [y, i, q]
			unless checked[item]
				checked[item] = true
				yi = [y, i]
				iq = [i, q]
				qy = [q, y]
				if yi_table[yi]
					yi_table[yi] += 1
				else
					yi_table[yi] = 1
				end
				if iq_table[iq]
					iq_table[iq] += 1
				else
					iq_table[iq] = 1
				end
				if qy_table[qy]
					qy_table[qy] += 1
				else
					qy_table[qy] = 1
				end
			end
#			y_table[y] << [i, q]
#			y_table[i] << [q, y]
#			y_table[q] << [y, i]
		}
	}
}

yi_list = yi_table.collect{|yi, n| [yi, n]}.sort_by{|yi, n| n}
iq_list = iq_table.collect{|iq, n| [iq, n]}.sort_by{|iq, n| n}
qy_list = qy_table.collect{|qy, n| [qy, n]}.sort_by{|qy, n| n}

p yi_list[-1]
p iq_list[-1]
p qy_list[-1]

p yi_list.length
p iq_list.length
p qy_list.length

#p yi_list
#p iq_list
#p qy_list

exit

$diff_max = 1000
$best = nil

N.times{|y|
	print "#{y}\r"
	N.times{|i|
		diff = 0
		minmax = nil
		N.times{|q|
			r, g, b = yiq2rgb(y, i, q)
			min = [r, g, b].min
			max = [r, g, b].max
			new_diff = (min < 0 ? -min : 0) + (max > 255 ? max - 255 : 0)
			if new_diff > diff
				diff = new_diff
				minmax = [min, max, [r, g, b], [y, i, q]]
			end
			if diff >= $diff_max
				break
			end
		}
		if diff < $diff_max
			$diff_max = diff
			$best = ["y: #{y}, i: #{i}", diff, minmax]
		end
	}
}

p $best



exit


y_max = -1000
y_min = 1000
i_max = -1000
i_min = 1000
q_max = -1000
q_min = 1000


N.times{|r|
	print "#{r}\r"
	N.times{|g|
		N.times{|b|
			y, i, q = rgb2yiq(r, g, b)
			r2, g2, b2 = yiq2rgb(y, i, q)
			if [(r - r2).abs, (g - g2).abs, (b - b2).abs].max >= 1
				puts "error"
				exit
			end
			y_max = [y_max, y].max
			y_min = [y_min, y].min
			i_max = [i_max, i].max
			i_min = [i_min, i].min
			q_max = [q_max, q].max
			q_min = [q_min, q].min
#			p [y, i, q]
		}
	}
}

p ["y", y_min, y_max]
p ["i", i_min, i_max]
p ["q", q_min, q_max]


exit



N.times{|r|
	print "#{r}\r"
	N.times{|g|
		N.times{|b|
			y, i, q = rgb2yiq(r, g, b)
			y, i, q = yiq2rgb(y, i, q)
			y_max = [y_max, y].max
			y_min = [y_min, y].min
			i_max = [i_max, i].max
			i_min = [i_min, i].min
			q_max = [q_max, q].max
			q_min = [q_min, q].min
#			p [y, i, q]
		}
	}
}


def check(y, i, q)
	y = y / 255.0
	i = i / 255.0
	q = q / 255.0
	
	i = i * 1.1914 - 0.5957
	q = q * 1.0452 - 0.5226
	
	r = y + 0.956 * i + 0.619 * q;
	g = y - 0.273 * i - 0.647 * q;
	b = y - 1.106 * i + 1.703 * q;
	
	min = [r, g, b].min
	max = [r, g, b].max
	
	return [(min < 0 ? -min : 0) + (max > 1 ? max - 1 : 0), r, g, b]
end

$best = []
$best_diff = 100

256.times{|y|
	256.times{|q|
		diff = 0
		max = nil
		256.times.collect{|i|
			new_diff, r, g, b = check(y, i, q)
			if new_diff > diff
				diff = new_diff
				max = [r, g, b]
			end
			if diff >= $best_diff
				diff = new_diff
				break
			end
		}
		if diff < $best_diff
			$best_diff = diff
			$best = [y, q, max, diff]
		end
	}
}

p $best


