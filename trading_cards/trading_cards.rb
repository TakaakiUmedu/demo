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

# 1�`n �ō\�����ꂽ����d�̔z�񂤂��A1�`c��1��ȏ�܂ނ��̂̐�
def f(n, c, d)
	unless cache_n = Cache[n]
		cache_n = Cache[n] = []
	end
	unless cache_n_c = cache_n[c]
		cache_n_c = cache_n[c] = []
	end
	unless cache_n_c_d = cache_n_c[d]
		cache_n_c_d = if c > d
			# �܂ޕ��̐��̕������� = ���݂��Ȃ�
			0
		elsif d == 0
			# �����Ȃ� = 1�ʂ�
			1
		elsif c == 0
			# 1�`0 ���܂� = �����܂܂Ȃ��Ă��ǂ�
			n ** d
		elsif d == 1
			# (c == 1 �m��)
			# {1}��1��ނ̂�
			1
		elsif n == 1
			# {1}�̈��ނ̂�
			1
		elsif c == d
			# 1�`c ���܂ޒ���c�̔z�� = 1�`c�̏���
			P(c, d)
		else
			# �O���� d - 1 �ڂ܂ł̔z��
			# 1 �` c�̑S�Ă��܂ޏꍇ * n
			# 1 �` c�̓��Ak���܂܂Ȃ��ꍇ * c
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

