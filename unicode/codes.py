

with open("kana-src.html") as file:
	html = file.read()

content = ""

#content += "<table style=\"font-size:8px;margin:0px:padding:0px\">\n"
content += "<pre style=\"font-size:8px;margin:0px:padding:0px\">\n"

#print(*(f"{c:x}" for c in list("ほ".encode("ISO-2022-JP"))))
#exit()

for i in range(256):
#	content += "<tr>"
	for j in range(256):
		data = b"\x1b\x24\x42" + ((i << 8) | j).to_bytes(2, "big") + b"\x1b\x28\x42"
		try:
			if i == 0x1b or j == 0x1b:
				char = None
			else:
				char = data.decode("ISO-2022-JP")
				if len(char) > 1:
					char = None
		except UnicodeDecodeError:
			char = None
		if char != None:
#			content += f"<td>{char}</td>"
			content += char
		else:
#			content += "<td></td>"
			content += "  "
#	content += "</tr>"
	content += "\n"


content += "</pre>\n"

#content += "</table>\n"




html = html.replace("<!--INSERT HERE-->", content)

with open("codes.html", "w") as file:
	file.write(html)

