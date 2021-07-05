from unicodedata import normalize

hiragana = [
[["あ", "い", "う", "え", "お"], False, "xxoxx"],
[["か", "き", "く", "け", "こ"], True, True],
[["さ", "し", "す", "せ", "そ"], False, True],
[["た", "ち", "つ", "て", "と"], False, True],
[["な", "に", "ぬ", "ね", "の"], False, False],
[["は", "ひ", "ふ", "へ", "ほ"], True, True],
[["ま", "み", "む", "め", "も"], False, False],
[["や", None, "ゆ", None, "よ"], False, False],
[["わ", "ゐ", "ん", "ゑ", "を"], False, False],
]

katakana = [
[["ア", "イ", "ウ", "エ", "オ"], False, "xxoxx" ],
[["カ", "キ", "ク", "ケ", "コ"], True, True],
[["サ", "シ", "ス", "セ", "ソ"], "xxxox", True],
[["タ", "チ", "ツ", "テ", "ト"], "xxoxo", True],
[["ナ", "ニ", "ヌ", "ネ", "ノ"], False, False],
[["ハ", "ヒ", "フ", "ヘ", "ホ"], True, True],
[["マ", "ミ", "ム", "メ", "モ"], False, False],
[["ヤ", None, "ユ", None, "ヨ"], False, False],
[["ワ", "ヰ", "ン", "ヱ", "ヲ"], False, "xxoxx"],
]

hirakomo = ["ぁ", "ぃ", "ぅ", "ぇ", "ぉ", "ゕ", "ゖ", "っ", "ゃ", "ゅ", "ょ", "ゎ"]

katakomo = ["ァ", "ィ", "ゥ", "ェ", "ォ", "ヵ", "ヶ", "ッ", "ャ", "ュ", "ョ", "ヮ", "ㇰ", "ㇱ", "ㇲ", "ㇳ", "ㇴ", "ㇵ", "ㇶ", "ㇷ", "ㇸ", "ㇹ", "ㇺ", "ㇻ", "ㇼ", "ㇽ", "ㇾ", "ㇿ"]

html = ""

def output(title, kanatable):
	global html
	html += '<table class="font-select font-table">\n'
	html += f'<caption>{title}</caption>\n'

	for j, (ks, hann_flag, daku_flag) in enumerate(kanatable):
		if j % 2 == 0:
			tr1 = ""
			tr2 = ""
			tr3 = ""
		for i, k in enumerate(ks):
			if k != None:
				daku = f"{k}\u3099"
				hann = f"{k}\u309A"
				tr1 += f"<td colspan=\"2\">{k}</td>"
				daku_one = normalize("NFC", daku)
				hann_one = normalize("NFC", hann)
				
				if daku_flag == True or (daku_flag != False and daku_flag[i] == "o"):
					daku_class = " ex"
				else:
					daku_class = ""
				
				if hann_flag == True or (hann_flag != False and hann_flag[i] == "o"):
					hann_class = " ex"
				else:
					hann_class = ""
				
				if daku != daku_one:
#					try:
#						daku_one.encode("SJIS")
#					except UnicodeEncodeError:
#						daku_class = " nex"
					
					tr2 += f"<td class=\"l{daku_class}\">{daku_one}</td><td class=\"r{daku_class}\">{daku}</td>"
				else:
					tr2 += f"<td class=\"l{daku_class}\">-</td><td class=\"r{daku_class}\">{daku}</td>"
				
				if hann != hann_one:
#					try:
#						hann_one.encode("SJIS")
#					except UnicodeEncodeError:
#						hann_class = " nex"
					
					tr3 += f"<td class=\"l{hann_class}\">{hann_one}</td><td class=\"r{hann_class}\">{hann}</td>"
				else:
					tr3 += f"<td class=\"l{hann_class}\">-</td><td class=\"r{hann_class}\">{hann}</td>"
			else:
				tr1 += "<td colspan=\"2\"/>"
				tr2 += "<td colspan=\"2\"/>"
				tr3 += "<td colspan=\"2\"/>"
		if j % 2 == 1:
			html += "<tr class=\"t\">" + tr1 + "</tr>\n"
			html += "<tr class=\"c\">" + tr2 + "</tr>\n"
			html += "<tr class=\"b\">" + tr3 + "</tr>\n"
	html += "</table>\n\n"

def output_komo(title, values):
	global html
	html += '<table class="font-select font-table">\n'
	html += f'<caption>{title}</caption>\n'
	
	items = []
	
	for k in values:
		daku = f"{k}\u3099"
		hann = f"{k}\u309A"
		
		if k == "ㇷ":
			items.append((f"<td>{k}</td>", f"<td>{daku}</td>", f"<td class=\"ex\">{hann}</td>"))
		else:
			items.append((f"<td>{k}</td>", f"<td>{daku}</td>", f"<td>{hann}</td>"))
	
	tr1 = tr2 = tr3 = None
	i = 0
	for k, daku, hann in items:
		if tr1 == None or tr2 == None or tr3 == None:
			tr1 = "<tr class=\"t\">"
			tr2 = "<tr class=\"c\">"
			tr3 = "<tr class=\"b\">"
		tr1 += k
		tr2 += daku
		tr3 += hann
		i += 1
		if i % 14 == 0:
			html += tr1 + "</tr>\n"
			html += tr2 + "</tr>\n"
			html += tr3 + "</tr>\n"
			tr1 = tr2 = tr3 = None
	
	if tr1 != None or tr2 != None or tr3 != None:
		html += tr1 + "</tr>\n"
		html += tr2 + "</tr>\n"
		html += tr3 + "</tr>\n"
	
	html += "</table>\n\n"
	

output("ひらがな", hiragana)
output("カタカナ", katakana)
output_komo("ひらがな小文字", hirakomo)
output_komo("カタカナ小文字", katakomo)

with open("kana-src.html") as src:
	html_src = src.read()

with open("kana.html", "w") as dst:
	dst.write(html_src.replace("<!--INSERT HERE-->", html))


