class Attributes:
	def __init__(self, attrs):
		if len(attrs) > 0:
			self.attrs = attrs
		else:
			self.attrs = []
	
	def __getitem__(self, name):
		for i, pair in enumerate(self.attrs):
			if pair[0] == name:
				return pair[1]
		return None
	
	def index(self, name):
		for i, pair in enumerate(self.attrs):
			if pair[0] == name:
				return i
		return -1
	
	def __setitem__(self, name, value):
		index = self.index(name)
		if index >= 0:
			self.attrs[index] = (name, value)
		else:
			self.attrs.append((name, value))
	
	def __str__(self):
		return "".join(f" {key}=\"{value}\"" for key, value in self.attrs)
	
	def __len__(self):
		return len(self.attrs)
	
	def __delitem__(self, name):
		index = self.index(name)
		if index >= 0:
			del self.attrs[index]
	
	def pop(self, name):
		index = self.index(name)
		if index >= 0:
			pair = self.attrs.pop(index)
			return pair[1]
		return None
	
	def classes(self):
		classes = self["class"]
		if classes == None:
			return []
		else:
			return classes.split()
	
	def hasClass(self, cls):
		return cls in self.classes()
	
	def removeClass(self, value):
		classes = self["class"]
		if classes != None:
			classes = classes.split()
			classes.remove(value)
			if len(classes) > 0:
				self["class"] = " ".join(classes)
			else:
				del self["class"]
	
	def appendClass(self, value):
		classes = self["class"]
		if classes != None:
			classes = classes.split(" ")
			classes.append(value)
			self["class"] = " ".join(classes)
		else:
			self["class"] = value
	
class Element:
	def __init__(self, parent, tag, attrs = [], children = [], pos = None):
		self.parent = parent
		self.tag = tag
		self.attrs = Attributes(attrs)
		self.pos = pos
		self.children = children + []
	
	def write(self, output):
		output.write(f"<{self.tag}{self.attrs}")
		if self.tag not in { "script" } and len(self.children) == 0:
			output.write("/>")
		else:
			output.write(f">")
			for child in self.children:
				if isinstance(child, Element):
					child.write(output)
				else:
					output.write(child)
			output.write(f"</{self.tag}>")
	
	def getAttribute(self, name):
		for key, value in self.attrs:
			if key == name:
				return value
		return None
