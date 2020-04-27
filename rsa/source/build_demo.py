import sys
import re
import json
from pathlib import Path
from html.parser import HTMLParser
from dom import Attributes, Element

class Script:
	@classmethod
	def arrange_indent(cls, source, indent = 0):
		lines = source.split("\n")

		if len(lines) > 1 and len(lines[0].strip()) == 0:
			lines.pop(0)

		if len(lines) > 1 and len(lines[-1].strip()) == 0:
			lines.pop()
		
		min_indent = None
		for line in lines:
			if len(line.strip()) > 0:
				match = re.match(r"^\t*", line)
				count = len(match[0])
				if min_indent == None or min_indent > count:
					min_indent = count
		
		if min_indent == None:
			min_indent = 0
		
		shift = min_indent - indent
		if shift > 0:
			lines = (line[shift:] for line in lines)
		else:
			tabs = "\t" * (-shift)
			lines = (tabs + line for line in lines)
		
		return "\n".join(lines)
	
	def __init__(self):
		self.source = []
		self.indents = 0
	
	def append(self, source, indent = 0):
		self.source.append((self.indents + indent, source))
	
#	def append_block(self, source, indent):
#		self.source += Script.arrange_indent(source, self.indents + indent) + "\n"
	
	def indent(self):
		self.indents += 1
	
	def dedent(self):
		self.indents -= 1
		if self.indents < 0:
			raise Exception("エラー")
	
	def to_string(self, indent = 0):
		source = []
		for indent_tmp, item in self.source:
			if isinstance(item, Example):
				source.append(Script.arrange_indent(item.get_script(), indent_tmp + indent))
			elif isinstance(item, Script):
				source.append(item.to_string(indent_tmp + indent))
			else:
				source.append(Script.arrange_indent(item, indent_tmp + indent) + "\n")

		return "".join(source)
	
class Example:
	def __init__(self, converter, node, parent = None):
		self.parent = parent
		self.id = node.attrs["id"]
		
		self.children = []
		self.converter = converter
		self.elements = []
		
		self.variables = []
		self.if_stack = []
		self.last_if = None
		
		self.id_form = None
		self.id_submit = None
		
		self.ts_init = Script()
		self.ts_init.append("function initialize(checkParam: (name: string, defaultValue: string)=> string){")
		self.ts_init.indent()
		self.ts_set = Script()
		
		self.ts_parse = Script()
		
		self.ts_main = Script()
		
		self.ts_update = self.ts_main
		
		self.ts_input_variables = []
		
		self.ancestor_conditions = []
		
		self.append_element(node)
		if self.parent != None:
			self.parent.append_child(self)
	
	def append_variable(self, name, parser):
		self.variables((name, parser))
	
	def set_submit_button(self, input):
		input.attrs["type"] = "submit"
	
	def start_form(self, form):
		self.id_form = self.converter.ensure_id(form)
		form.attrs.appendClass("demo-form")
	
	def append_input(self, input):
		if input.attrs["tabindex"] == None:
			input.attrs["tabindex"] = self.converter.get_tab_index()
		type = input.attrs["type"]
		if type == "submit":
			self.id_submit = self.converter.ensure_id(input)
		elif type in { None, "", "text" }:
			parser = input.attrs.pop("data-parser")
			name = input.attrs["name"]
			id = self.converter.ensure_id(input)
			input_elem = f"Dom.getInput(\"{id}\")"
			if parser != None:
				self.ts_parse.append(f"const {name} = {parser}({input_elem}.value);")
			else:
				self.ts_parse.append(f"const {name} = {input_elem}.value;")
			self.ts_set.append(f"{input_elem}.value = checkParam(\"{name}\", \"\" + {name});")
			self.ts_input_variables.append(name)
	
	@classmethod
	def get_source(cls, script):
		source = ""
		for child in script.children:
			if isinstance(child, Element):
				raise Exception("<script>内にelement")
			else:
				source += child
		
		lines = source.split("\n")
		if len(lines) > 0:
			if len(lines[-1].strip()) == 0:
				source = "\n".join(lines[:-1])
		return source
	
	def append_init(self, script):
		source = Example.get_source(script)
		self.ts_init.append(source)
		script.children.clear()
	
	def append_calc(self, script):
		inject = script.attrs.pop("data-inject")
		source = Example.get_source(script)
		self.ts_update.append(source)
		if inject != None:
			id = self.converter.ensure_id(script)
			self.ts_update.append(f"set_value(\"{id}\", {inject});")
		script.children.clear()
	
	def start_if(self, elem):
		cond = elem.attrs.pop("data-cond")
		if cond == None:
			raise Exception("data-cond not found")
		elem.attrs.appendClass("demo-option")
		src = Script()
		self.ts_update.append(src)
		self.ts_update = src
		id = self.converter.ensure_id(elem)

		src.append(f"if({cond}){{")
		src.indent()
		src.append(f"show_branch(\"{id}\");")
		src.append("")

		self.if_stack.append([cond, src, False])
	
	def end_if_else(self, elem):
		if len(self.if_stack) == 0:
			raise Exception("エラー")
		src_cond, src_script, src_else = self.if_stack.pop()
		
		src_script.dedent()
		src_script.append("}")
		
		if len(self.if_stack) > 0:
			self.ts_update = self.if_stack[-1][1]
		else:
			self.ts_update = self.ts_main

	def end_if(self, elem):
		if len(self.if_stack) == 0:
			raise Exception("エラー")
		self.last_if = self.if_stack[-1]
		self.end_if_else(elem)
	
	def end_else(self, elem):
		self.last_if = None
		self.end_if_else(elem)
	
	def start_else(self, elem):
		if self.last_if == None:
			raise Exception("エラー")
		self.last_if[2] = True
		id = self.converter.ensure_id(elem)
		src = self.last_if[1]
		elem.attrs.appendClass("demo-option")
		src.append("else{")
		src.indent()
		src.append(f"show_branch(\"{id}\");")
		src.append(f"")
		self.ts_update = src
		self.if_stack.append(self.last_if)
	
	def append_injection(self, elem):
		source = Example.get_source(elem)
		id = self.converter.ensure_id(elem)
		self.ts_update.append(f"set_value(\"{id}\", {source});")
	
	def append_element(self, node):
		id = node.attrs["id"]
		self.elements.append(id)
	
	def get_script(self):
		script = Script()
		script.append("{")
		script.indent()

		input_vars = "{ " + ", ".join(self.ts_input_variables) + " }"
		input_vars_return = f"return {input_vars};";
		
		self.ts_init.append("")
		self.ts_init.append(self.ts_set.to_string())
		self.ts_init.append("")
		self.ts_init.append(input_vars_return)
		self.ts_init.dedent()
		self.ts_init.append("}")
		script.append(self.ts_init.to_string())
		script.append("")
		
		script.append("function reload(): ReturnType<typeof initialize>{")
		script.indent()
		script.append(self.ts_parse.to_string())
		script.append("")
		script.append(input_vars_return)
		script.dedent()
		script.append("}")
		script.append("")
		
		script.append("function update(show_branch: (id: string)=> void, set_value: (id: string, value: any)=> void, vars: ReturnType<typeof initialize>){")
		script.indent()
		if self.ancestor_conditions:
			script.append("if(" + " && ".join(self.ancestor_conditions) + "){")
			script.indent()
		script.append(f"const {input_vars} = vars;")
		script.append("")
		script.append(self.ts_update.to_string())
		if self.ancestor_conditions:
			script.dedent()
			script.append("}")
		script.dedent()
		script.append("}")
		script.append("")
		
		elements = ", ".join(f"\"{element}\"" for element in self.elements)
#		if self.parent:
#			parent = f"\"{self.parent.id_form}\""
#		else:
#			parent = "null"
		script.append(f"Lib.MathDemo.register([{elements}], \"{self.id_form}\", \"{self.id_submit}\", initialize, reload, update);")
		script.dedent()
		script.append("}")
		
		return script.to_string()
	
	def to_string(self):
		script = self.get_script()
		for child in self.children:
			script += child.to_string();
		return script
	
	def append_child(self, child):
		self.ts_update.append(child)
		
		for data in reversed(self.if_stack):
			src_cond, src_script, src_else = data
			if src_else:
				child.ancestor_conditions.append(f"!({src_cond})")
			else:
				child.ancestor_conditions.append(src_cond)

class NotInExample(Exception):
	pass

class Converter(HTMLParser):
	def append_id(self, id):
		if id in self.ids:
			raise Exception("duplicated id")
		self.ids.add(id)
	
	def new_id(self):
		while True:
			id = f"demo_id_{self.id_num}"
			self.id_num += 1
			if not id in self.ids:
				self.ids.add(id)
				return id
	
	def ensure_id(self, elem):
		id = elem.attrs["id"]
		if id == None:
			id = self.new_id()
			elem.attrs["id"] = id
		return id

	@classmethod
	def convert(cls, source_dir, main_title, namespace, libs, page_list, aliases, page_num, output_dir):
		converter = cls(source_dir, main_title, namespace, libs, page_list, aliases, page_num, output_dir)
		converter.execute()
	
	def __init__(self, source_dir, main_title, namespace, libs, page_list, aliases, page_num, output_dir):
		super().__init__()
		self.aliases = aliases
		self.root = Element(None, None, [])
		self.curElem = self.root
		
		self.ids = set()
		self.id_num = 0
		self.in_form = False

		self.examples = []
		self.example_cur = None
		self.example_prev = None
		
		self.page_num = page_num
		self.page_list = page_list
		self.page = page_list[page_num]
		self.file_name = self.page["file_name"]
		self.file_name_src = source_dir.joinpath(self.file_name + ".src.html")
		self.file_name_html = output_dir.joinpath(self.file_name + ".html")
		self.file_name_js = self.file_name + ".js"
		self.file_name_ts = output_dir.joinpath(self.file_name + ".ts")
		self.main_title = main_title
		self.sub_title = self.page["title"]
		self.title = main_title + " >> " + str(page_num) + ". " + self.sub_title

		self.ts = Script()
		lib_dir = source_dir.relative_to(output_dir.resolve())
		for lib in libs:
			self.ts.append(f"/// <reference path=\"{lib_dir.joinpath(lib)}\"/>")
		self.ts.append("\n")
		self.ts.append(f"namespace {namespace}{{")

		self.tab_index = 0
	
	def get_tab_index(self):
		self.tab_index += 1
		return f"{self.tab_index}"
	
		
	def execute(self):
		with open(self.file_name_src) as input:
			self.feed(input.read())
		
		self.modify(self.root)
		self.set_typeset_class(self.root)
		self.remove_redundant_typeset_class(self.root, False)
		
		with open(self.file_name_html, "w") as output:
			for elem in self.root.children:
				if isinstance(elem, Element):
					elem.write(output)
		
		self.ts.indent()
		self.ts.append("const Dom = Lib.Dom;")
		self.ts.append("const BigInteger = Lib.BigInteger;")
		self.ts.append("type BigInteger = Lib.BigInteger;")
		self.ts.append("")
		for example in self.examples:
			self.ts.append(example.to_string())
		self.ts.dedent()
		self.ts.append("}")
		
		with open(self.file_name_ts, "w") as output:
			output.write(self.ts.to_string())
		
#		print(self.ids)
	
	def get_current_example(self):
		if self.example_cur != None:
			return self.example_cur
		raise NotInExample()
	
	def set_typeset_class(self, node):
		needed = False
		
		for child in node.children:
			if isinstance(child, Element):
				self.set_typeset_class(child)
			elif not needed and (child.find("$") >= 0 or child.find("\\[") >= 0 and child.find("\\]") >= 0):
				needed = True
		
		if needed and (not node.tag == "script") and (not node.attrs.hasClass("demo-table")):
			node.attrs.appendClass("demo-typeset")

	def remove_redundant_typeset_class(self, node, set):
		has = node.attrs.hasClass("demo-typeset")
		if set:
			if has:
				node.attrs.removeClass("demo-typeset")
		elif has:
			set = True
		
		for child in node.children:
			if isinstance(child, Element):
				self.remove_redundant_typeset_class(child, set)
	
	def arrange_table(self, node):
		table = Element(node, "table", [])
		tr = None
		td = None
		
		aligns = {}
		align_data = node.attrs.pop("data-align")
		if align_data != None:
			for i, a in enumerate(align_data):
				if a == "r":
					aligns[i] = "right"
				elif a == "c":
					aligns[i] = "center"
		
		def strip(item):
			item = item.strip()
			if len(item) > 0 and item[-1] == "\\":
				item += " "
			return item
		
		def append(item):
			nonlocal tr, td
			if td == None:
				if tr == None:
					tr = Element(table, "tr")
					table.children.append("\n")
					table.children.append(tr)
				td = Element(tr, "td")
				tr.children.append(td)
			if isinstance(item, Element):
				if item.tag == "td":
					for child in td.children:
						if isinstance(child, Element):
							child.parent = item
					item.children = td.children + item.children
					for name, value in item.attrs.attrs:
						td.attrs[name] = value
					item.attrs = td.attrs
					item.parent = tr
					tr.children[tr.children.index(td)] = item
					td = item
				else:
					item.parent = td
					td.children.append(item)
			else:
				item = strip(item)
				if len(item) > 0:
					td.children.append(item)
		
		for child in node.children:
			if isinstance(child, Element):
				append(child)
			else:
				items = child.split("&")
				for i, item in enumerate(items):
					items2 = item.split("\\\\")
					if len(items2) > 0:
						for j, item2 in enumerate(items2):
							if j > 0:
								tr = None
								td = None
							append(item2)
					else:
						append(item)
					
					if i < len(items) - 1:
						td = None
		row_count = max(len(tr.children) if isinstance(tr, Element) else 0 for tr in table.children)
		for tr in table.children:
			if not isinstance(tr, Element):
				continue
			i = 0
			for td in tr.children:
				if not isinstance(td, Element):
					continue
				new_children = []
				prev_is_string = False
				for child in td.children:
					if isinstance(child, str):
						if prev_is_string:
							new_children[-1] += child
						else:
							new_children.append(child)
						prev_is_string = True
					else:
						new_children.append(child)
						prev_is_string = False
				if len(new_children) > 0:
					first = new_children[0]
					if isinstance(first, str):
						if len(first) > 0 and first[0] == "$":
							new_children[0] = first[1:]
						else:
							new_children[0] = "$ \displaystyle " + first
					else:
						new_children.insert(0, "$ \displaystyle ")
					last = new_children[-1]
					if isinstance(last, str):
						if len(last) > 0 and last[-1] == "$":
							new_children[-1] = last[:-1]
						else:
							new_children[-1] = last + "$"
					else:
						new_children.append("$")
				tmp_children = []
				for child in new_children:
					if isinstance(child, Element) or child.strip() != "":
						tmp_children.append(child)
				new_children = tmp_children
				td.children = new_children
				if i in aligns:
					td.attrs.appendClass("" + aligns[i])
				i += 1
			for i in range(row_count - len(tr.children)):
				tr.children.append(Element(tr, "td"))
		table.children.append("\n")
		node.children = ["\n", table, "\n"]
		node.attrs.appendClass("demo-equation")
	
	def append_toc(self, node):
		node.children.append("\n")
		node.children.append("\n")
		ol = Element(node, "ol", [("start", "0")], ["\n"])
		for page in self.page_list:
			title = page["title"]
			file_name = page["file_name"]
			li = Element(ol, "li")
			if file_name == self.file_name:
				li.children.append(title + "(このページ)")
				li.attrs.appendClass("current")
			else:
				li.children.append(Element(li, "a", [("href", file_name + ".html")], [title]))
			ol.children.append(li)
			ol.children.append("\n")
		node.children.append(ol)
		node.children.append("\n")
	
	def modify(self, node, prev_cls = None):
		try:
			if node.tag in self.aliases:
				alias = self.aliases[node.tag]
				node.tag = alias["tag"]
				node.attrs.appendClass(alias["class"])
			cls = self.check_demo_class(node)
			if cls != None:
				if cls == "example":
					self.ensure_id(node)
					if self.example_cur != None:
						self.example_cur = Example(self, node, self.example_cur)
					elif self.example_prev == None:
						self.example_cur = Example(self, node)
						self.examples.append(self.example_cur)
					else:
						self.example_cur = self.example_prev
						self.example_cur.append_element(node)
				elif cls == "table":
					self.arrange_table(node)
				elif cls == "title":
					node.children.append(self.title)
				elif cls == "sub_title":
					node.children.append(f"{self.page_num}. {self.sub_title}")
				elif cls == "main_title":
					node.children.append(self.main_title)
				elif cls == "toc":
					self.append_toc(node)
				else:
					ex = self.get_current_example()
					if cls == "submit":
						ex.set_submit_button(node)
					elif cls == "form":
						if self.in_form:
							raise Exception("formが2重になっています")
						self.in_form = True
						ex.start_form(node)
					elif cls == "init":
						ex.append_init(node)
					elif cls == "calc":
						ex.append_calc(node)
					elif cls == "if":
						ex.start_if(node)
					elif cls == "else":
						if prev_cls != "if":
							raise Exception("elseの直前にifがありません")
						ex.start_else(node)
					elif cls == "inject":
						ex.append_injection(node)
					else:
						print(node.parent.tag, node.parent.attrs, node.parent.children)
						raise Exception(f"不正なclass: {cls}")
			elif self.in_form:
				if node.tag == "input":
					if cls != None:
						print(node.parent.tag, node.parent.attrs, node.parent.children)
						raise Exception(f"不正なclass: {cls}")
					self.get_current_example().append_input(node)
			
			prev_cls = None
			for child in list(node.children):
				if isinstance(child, Element):
					prev_cls = self.modify(child, prev_cls)
	
			if cls == "example":
				self.example_prev = self.example_cur
				self.example_cur = self.get_current_example().parent
			elif cls == "if":
				self.get_current_example().end_if(self.curElem)
			elif cls == "else":
				self.get_current_example().end_else(self.curElem)
			elif cls == "form":
				self.in_forn = False
			
			if node.tag == "head":
				node.children.append(Element(node, "script", [["src", self.file_name_js]]))
				node.children.append("\n")
			elif node.tag == "form":
				self.in_form = False
			
			return cls
#		except NotInExample:
#			if cls != None:
#				print(f"Example外で使われました: <{node.tag} class=\"demo-{cls}\"> in {node.pos}")
#			else:
#				print(f"Example外で使われました: <{node.tag}> in {node.pos}")
#			exit()
		finally:
			pass
	
	def check_demo_class(self, elem):
		classes = elem.attrs.classes()
		demo_class = None
		for cls in classes:
			match = re.match(r"^demo-(.*)", cls)
			if match != None:
				if demo_class != None:
					raise Exception(f"複数のdemoクラス: {classes}")
				demo_class_found = match[1]
				if demo_class_found not in { "typeset", "equation" }:
					if demo_class_found not in { "example" }:
						elem.attrs.removeClass(cls)
					demo_class = demo_class_found
		return demo_class
	
	def handle_starttag(self, tag, attrs):
		elem = Element(self.curElem, tag, attrs, [], self.getpos())
		self.curElem.children.append(elem)
		self.curElem = elem

	def handle_endtag(self, tag):
		self.curElem = self.curElem.parent
	
	def handle_data(self, data):
		self.curElem.children.append(data)

config_file = Path(sys.argv[1])
source_dir = config_file.resolve().parent

with open(config_file) as file:
	data = json.loads(file.read())

main_title = data["main_title"]
page_list = data["page_list"]
aliases = data["aliases"]
output_dir = Path(data["output_dir"])
libs = data["import"]
namespace = data["namespace"]
for i in range(len(page_list)):
	print(f"converting: {page_list[i]['title']}")
	Converter.convert(source_dir, main_title, namespace, libs, page_list, aliases, i, output_dir)
