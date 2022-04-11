#!/usr/local/bin/ruby

require 'rational'

N = $*[0].to_i
C = $*[1].to_i

def P(n, m)
	a = 1
	while m > 0
		a = a * n
		n -= 1
		m -= 1
	end
	a
end

Cache = []

# 1～n で構成された長さdの配列うち、1～cを1回以上含むものの数
def f(n, c, d)
	unless cache_n = Cache[n]
		cache_n = Cache[n] = []
	end
	unless cache_n_c = cache_n[c]
		cache_n_c = cache_n[c] = []
	end
	unless cache_n_c_d = cache_n_c[d]
		cache_n_c_d = if c > d
			# 含む物の数の方が多い = 存在しない
			0
		elsif d == 0
			# 引かない = 1通り
			1
		elsif c == 0
			# 1～0 を含む = 何も含まなくても良い
			n ** d
		elsif d == 1
			# (c == 1 確定)
			# {1}の1種類のみ
			1
		elsif n == 1
			# {1}の一種類のみ
			1
		elsif c == d
			# 1～c を含む長さcの配列 = 1～cの順列
			P(c, d)
		else
			# 前から d - 1 個目までの配列が
			# 1 ～ cの全てを含む場合 * n
			# 1 ～ cの内、kを含まない場合 * c
			cache_n_c_d = f(n, c, d - 1) * n + f(n - 1, c - 1, d - 1) * c
		end
#		print "f(#{n},#{c},#{d}) = #{cache_n_c_d}\n"
		cache_n_c[d] = cache_n_c_d
	end
	cache_n_c_d
end

d = C
pre_p = Rational(0)
ave = Rational(0)

while true
	p = Rational(f(N, C, d), (N ** d))
	ave += d * (p - pre_p)
	pre_p = p
	print "[#{d}] : #{ave.round(5).to_f},\t#{p.round(5).to_f}\n"
#	print "[#{d}] : #{ave},\t#{p}\n"
	d += 1
end

