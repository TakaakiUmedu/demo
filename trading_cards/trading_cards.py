#!/usr/local/bin/python
# coding:utf-8

import sys
import math
import fractions

N = int(sys.argv[1])
C = int(sys.argv[1])

def P(n, m):
	a = 1
	while m > 0:
		a = a * n
		n -= 1
		m -= 1
	return a

Cache = []

def get(list, index):
	return list[index] if len(list) > index else None

def put(list, index, item):
	l = len(list)
	if l <= index:
		list.extend([None for i in range(index - l)])
	list.append(item)

# 1～n で構成された長さdの配列うち、1～cを1回以上含むものの数
def f(n, c, d):
	cache_n = get(Cache, n)
	if cache_n == None:
		cache_n = []
		put(Cache, n, cache_n)

	cache_n_c = get(cache_n, c)
	if cache_n_c == None:
		cache_n_c = []
		put(cache_n, c, cache_n_c)

	cache_n_c_d = get(cache_n_c, d)
	if cache_n_c_d == None:
		if c > d:
			# 含む物の数の方が多い = 存在しない
			cache_n_c_d = 0
		elif d == 0:
			# 引かない = 1通り
			cache_n_c_d = 1
		elif c == 0:
			# 1～0 を含む = 何も含まなくても良い
			cache_n_c_d = n ** d
		elif d == 1:
			# (c == 1 確定)
			# {1}の1種類のみ
			cache_n_c_d = 1
		elif n == 1:
			# {1}の一種類のみ
			cache_n_c_d = 1
		elif c == d:
			# 1～c を含む長さcの配列 = 1～cの順列
			cache_n_c_d = P(c, d)
		else:
			# 前から d - 1 個目までの配列が
			# 1 ～ cの全てを含む場合 * n
			# 1 ～ cの内、kを含まない場合 * c
			cache_n_c_d = f(n, c, d - 1) * n + f(n - 1, c - 1, d - 1) * c
		
		put(cache_n_c, d, cache_n_c_d)
	
	return cache_n_c_d

d = C
pre_p = fractions.Fraction(0)
ave = fractions.Fraction(0)

while True:
	p = fractions.Fraction(f(N, C, d), N ** d)
	ave += d * (p - pre_p)
	pre_p = p
	print("[{}] : {},\t{}".format(d, float(round(ave, 5)), float(round(p, 5))))
#	print("[{}] : {},\t{}".format(d, ave, p))
	d += 1

