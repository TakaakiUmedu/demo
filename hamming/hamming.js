var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
"use strict";
var Lib;
(function (Lib) {
    Lib.gTouchDevice = false;
    function set_user_agent() {
        if (window.ontouchstart) {
            Lib.gTouchDevice = true;
        }
    }
    function clone_object(obj) {
        var ret = {};
        for (var name_1 in obj) {
            Object.defineProperty(ret, name_1, Object.getOwnPropertyDescriptor(obj, name_1));
        }
        return ret;
        //		return Object.assign({}, obj);
    }
    Lib.clone_object = clone_object;
    function to_px(val) {
        if (val > 0.1) {
            return "" + Math.round(val) + "px";
        }
        else if (val < -0.1) {
            return "-" + Math.round(-val) + "px";
        }
        else {
            return "0px";
        }
    }
    Lib.to_px = to_px;
    var gDebgugWindow = null;
    function arguments_to_message() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = "";
        if (args.length > 0) {
            message = args[0];
            for (var i = 1; i < args.length; i++) {
                message += "," + args[i].toString();
            }
        }
        return message;
    }
    function debug_output() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = arguments_to_message(args);
        var p_element = document.createElement("p");
        p_element.appendChild(document.createTextNode(message));
        var debug_window_div = document.getElementById("debug_window");
        if (debug_window_div) {
            debug_window_div.appendChild(p_element);
        }
        else {
            if (gDebgugWindow == null) {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.style.borderStyle = "solid";
                div.style.borderColor = "black";
                div.style.borderWidth = "2px";
                div.style.padding = "0px";
                div.style.backgroundColor = "white";
                div.style.color = "black";
                div.style.fontSize = "small";
                div.style.fontFamily = "monospace";
                document.body.appendChild(div);
                gDebgugWindow = div;
            }
            p_element.style.border = "0px";
            p_element.style.margin = "0px";
            p_element.style.padding = "0px";
            p_element.style.textIndent = "0px";
            gDebgugWindow.style.top = to_px(document.documentElement.scrollTop);
            if (gDebgugWindow.firstChild != null) {
                gDebgugWindow.insertBefore(p_element, gDebgugWindow.firstChild);
            }
            else {
                gDebgugWindow.appendChild(p_element);
            }
        }
    }
    Lib.debug_output = debug_output;
    function info_output() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = arguments_to_message(args);
        var p_element = document.createElement("p");
        p_element.appendChild(document.createTextNode(message));
        var info_div = document.getElementById("info");
        if (info_div) {
            info_div.appendChild(p_element);
        }
        else {
            document.body.appendChild(p_element);
        }
    }
    Lib.info_output = info_output;
    function do_nothing() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    Lib.do_nothing = do_nothing;
    function set_execute_on_load_handler(event_name, target, handler) {
        if (document.readyState == "complete") {
            handler();
        }
        else {
            var initialized = false;
            var func = function () {
                if (initialized) {
                    return;
                }
                initialized = true;
                handler();
                target.removeEventListener(event_name, func, false);
            };
            target.addEventListener(event_name, func, false);
        }
    }
    function execute_on_dom_load(handler, element) {
        set_execute_on_load_handler("DOMContentLoaded", window, handler);
    }
    Lib.execute_on_dom_load = execute_on_dom_load;
    function execute_on_load(handler, image) {
        if (image === undefined) {
            set_execute_on_load_handler("load", window, handler);
        }
        else {
            var new_handler_1 = handler;
            set_execute_on_load_handler("load", image, function () { new_handler_1(image); });
        }
    }
    Lib.execute_on_load = execute_on_load;
    function get_elements_with_id() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var inputs = {};
        for (var i = 0; i < args.length; i++) {
            var list = document.getElementsByTagName(args[i]);
            for (var j = 0; j < list.length; j++) {
                var item = list[j];
                if (item.id != null) {
                    inputs[item.id] = item;
                }
            }
        }
        return inputs;
    }
    Lib.get_elements_with_id = get_elements_with_id;
    function for_all_children(element, func) {
        if (func(element) == false) {
            return false;
        }
        for (var child = element.firstChild; child != null; child = child.nextSibling) {
            if (for_all_children(child, func) == false) {
                return false;
            }
        }
        return true;
    }
    Lib.for_all_children = for_all_children;
    function indexer() {
        var index = 0;
        return function () {
            return index++;
        };
    }
    Lib.indexer = indexer;
    function for_each_recursive(item, callback) {
        if (Array.isArray(item)) {
            for (var i = 0; i < item.length; i++) {
                for_each_recursive(item[i], callback);
            }
        }
        else {
            callback(item);
        }
    }
    Lib.for_each_recursive = for_each_recursive;
    var StableHash = (function () {
        function StableHash() {
            this.list = [];
            this.table = {};
        }
        StableHash.prototype.push = function (key, value) {
            if (this.table[key] == undefined) {
                this.list.push(key);
                this.table[key] = value;
            }
        };
        StableHash.prototype.get = function (key) {
            return this.table[key];
        };
        StableHash.prototype.forEach = function (callback) {
            var list = this.list.concat();
            for (var i = 0; i < list.length; i++) {
                var key = list[i];
                if (callback(key, this.table[key], i) === false) {
                    break;
                }
            }
        };
        StableHash.prototype.remove = function (key) {
            var index = this.list.indexOf(key);
            if (index >= 0) {
                this.list.splice(index, 1);
            }
            if (this.table[key]) {
                delete this.table[key];
            }
        };
        StableHash.prototype.keys = function () {
            return this.list.concat();
        };
        StableHash.prototype.values = function () {
            var _this = this;
            return this.list.map(function (key) { return _this.table[key]; });
        };
        StableHash.prototype.count = function () {
            return this.list.length;
        };
        StableHash.prototype.map = function (callback) {
            var _this = this;
            return this.list.map(function (key, index) {
                return callback(key, _this.table[key], index);
            });
        };
        StableHash.prototype.freeze = function () {
            Object.freeze(this.list);
            Object.freeze(this.table);
        };
        return StableHash;
    }());
    Lib.StableHash = StableHash;
    set_user_agent();
})(Lib || (Lib = {}));
/// <reference path="./lib.ts" />
"use strict";
var Lib;
/// <reference path="./lib.ts" />
(function (Lib) {
    function camelToSnake(str) {
        return str.replace(/([A-Z])/g, function (match, p1) { return "-" + p1.toLowerCase(); });
    }
    var Dom;
    (function (Dom) {
        function elem(name, attributes) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var element = document.createElement(name);
            setAttributes(element, attributes);
            add(element, args);
            return element;
        }
        Dom.elem = elem;
        function setAttributes(element, attributes) {
            if (attributes) {
                for (var a_name in attributes) {
                    var match = void 0;
                    var a_value = attributes[a_name];
                    if ((a_name == "style" || a_name == "dataset") && typeof (a_value) === "object") {
                        var sub_table = a_value;
                        if (a_name == "style") {
                            for (var s_name in sub_table) {
                                element.style[s_name] = sub_table[s_name].toString();
                                //								element.style.setProperty(camelToSnake(s_name), sub_table[s_name].toString());
                            }
                        }
                        else {
                            for (var s_name in sub_table) {
                                element.dataset[s_name] = sub_table[s_name].toString();
                            }
                        }
                    }
                    else if (a_name == "className") {
                        element.className = a_value.toString();
                    }
                    else if (match = a_name.match(/^on(.*)/)) {
                        var event_1 = match[1];
                        var callback = void 0;
                        if (a_value instanceof Function) {
                            callback = a_value;
                        }
                        else if (typeof (a_value) === "object" && a_value.hasOwnProperty("handleEvent")) {
                            callback = a_value;
                        }
                        else {
                            callback = new Function(a_value.toString());
                        }
                        element.addEventListener(event_1, callback);
                    }
                    else {
                        element.setAttribute(a_name, a_value.toString());
                    }
                }
            }
        }
        Dom.setAttributes = setAttributes;
        function input(type, attributes) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var element = elem("input", attributes, args);
            element.type = type;
            return element;
        }
        Dom.input = input;
        function form(attributes) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return elem("form", attributes, args);
        }
        Dom.form = form;
        function checkbox(label, attributes) {
            var checkbox = input("checkbox", attributes);
            var element = elem("label", null, checkbox, label);
            return {
                checkbox: checkbox,
                label: element
            };
        }
        Dom.checkbox = checkbox;
        function radio(label, attributes) {
            var radio = input("radio", attributes);
            var element = elem("label", null, radio, label);
            return {
                radio: radio,
                label: element
            };
        }
        Dom.radio = radio;
        function radios(name, attributes) {
            var items = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                items[_i - 2] = arguments[_i];
            }
            var first_radio = null;
            var radios = [];
            var labels = [];
            var checked = false;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = void 0;
                var label = void 0;
                var additional_attributes = void 0;
                if (typeof (item) === "string") {
                    value = label = item;
                    additional_attributes = undefined;
                }
                else {
                    value = item.value;
                    if (item.label) {
                        label = item.label;
                    }
                    else {
                        label = value;
                    }
                    additional_attributes = item.attributes;
                }
                var _a = Dom.radio(label, attributes), radio_1 = _a.radio, radio_label = _a.label;
                radio_1.name = name;
                radio_1.value = value;
                setAttributes(radio_1, additional_attributes);
                if (radio_1.checked) {
                    checked = true;
                }
                if (!first_radio) {
                    first_radio = radio_1;
                }
                radios.push(radio_1);
                labels.push(radio_label);
            }
            if (!checked && first_radio) {
                first_radio.checked = true;
            }
            return { labels: labels, radios: radios };
        }
        Dom.radios = radios;
        function text(str) {
            return document.createTextNode(str.toString());
        }
        Dom.text = text;
        function prepareTarget(target) {
            if (target instanceof Element) {
                return target;
            }
            else {
                var element = document.getElementById(target.toString());
                if (element) {
                    return element;
                }
                else {
                    throw "cannot find target: " + target.toString();
                }
            }
        }
        Dom.prepareTarget = prepareTarget;
        function get(id) {
            var element = document.getElementById(id);
            if (element) {
                return element;
            }
            else {
                throw "cannot find target: " + id.toString();
            }
        }
        Dom.get = get;
        function add_one(element, item) {
            if (item !== null && item !== undefined) {
                element.appendChild(item instanceof Node ? item : text(item));
            }
        }
        function insert_first(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var list = [];
            Lib.for_each_recursive(args, function (item) { return list.push(item); });
            var element = prepareTarget(target);
            for (var i = list.length - 1; i >= 0; i--) {
                element.insertBefore(to_element(list[i]), element.firstChild);
            }
        }
        Dom.insert_first = insert_first;
        function add(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var element = prepareTarget(target);
            Lib.for_each_recursive(args, function (item) { return add_one(element, item); });
        }
        Dom.add = add;
        function to_element(item) {
            if (item instanceof Node) {
                return item;
            }
            else {
                return text(item.toString());
            }
        }
        Dom.to_element = to_element;
        function clear(target) {
            var element = prepareTarget(target);
            var c;
            while (c = element.firstChild) {
                element.removeChild(c);
            }
        }
        Dom.clear = clear;
        function has_class(target, value) {
            var element = prepareTarget(target);
            return element.className != undefined && (" " + element.className + " ").indexOf(" " + value + " ") >= 0;
        }
        Dom.has_class = has_class;
        function addClass(target, value) {
            var element = prepareTarget(target);
            if (element.className == undefined || element.className == "") {
                return element.className = value;
            }
            else if (has_class(element, value)) {
                return element.className;
            }
            else {
                return element.className += " " + value;
            }
        }
        Dom.addClass = addClass;
        function deleteClass(target, value) {
            var element = prepareTarget(target);
            if (element.className == undefined || element.className == "") {
                return "";
            }
            else {
                var classNames = element.className.split(" ");
                var new_classNames = [];
                for (var i = 0; i < classNames.length; i++) {
                    var name_2 = classNames[i];
                    if (name_2.length > 0 && name_2 != value) {
                        new_classNames.push(name_2);
                    }
                }
                return element.className = new_classNames.join(" ");
            }
        }
        Dom.deleteClass = deleteClass;
        function for_each(name, func, element) {
            if (element === undefined) {
                element = document;
            }
            var children = element.getElementsByTagName(name);
            for (var i = 0; i < children.length; i++) {
                func(children[i]);
            }
        }
        Dom.for_each = for_each;
        function clone(element, clone_id) {
            if (clone_id === void 0) { clone_id = true; }
            if (element instanceof HTMLElement) {
                var new_element = elem(element.nodeName.toLowerCase());
                for (var i = 0; i < element.attributes.length; i++) {
                    var attribute = element.attributes[i];
                    if (attribute.name == "id" && !clone_id) {
                        continue;
                    }
                    if (attribute.name == "style") {
                        var sub_table = element.style;
                        for (var s_name in sub_table) {
                            new_element.style[s_name] = sub_table[s_name];
                        }
                    }
                    else {
                        var match = attribute.name.match(/^data-(.*)/);
                        if (match == null) {
                            new_element.setAttribute(attribute.name, attribute.value);
                        }
                    }
                }
                if (element instanceof HTMLElement) {
                    for (var name_3 in element.dataset) {
                        new_element.dataset[name_3] = element.dataset[name_3];
                    }
                }
                for (var child = element.firstChild; child != null; child = child.nextSibling) {
                    var new_child = clone(child, clone_id);
                    if (new_child) {
                        new_element.appendChild(new_child);
                    }
                }
                return new_element;
            }
            else if (element instanceof Text) {
                return text(element.nodeValue || "");
            }
            else {
                return null;
            }
        }
        Dom.clone = clone;
        function br() {
            return elem("br");
        }
        Dom.br = br;
        function canvas() {
            return document.createElement("canvas");
        }
        Dom.canvas = canvas;
        function canvas2D() {
            var canvas = Dom.canvas();
            var context = canvas.getContext("2d");
            return { canvas: canvas, context: context };
        }
        Dom.canvas2D = canvas2D;
        var ElementWithText = (function () {
            function ElementWithText(tagName, text, attributes) {
                this.text = Dom.text(text);
                this.elem = elem(tagName, attributes, this.text);
            }
            ElementWithText.prototype.setText = function (text) {
                this.text.nodeValue = text;
            };
            ElementWithText.prototype.getText = function () {
                return this.text.nodeValue || "";
            };
            return ElementWithText;
        }());
        Dom.ElementWithText = ElementWithText;
        function setText(elem, text) {
            if (elem instanceof HTMLElement) {
                var child = elem.firstChild;
                while (child !== null) {
                    if (child instanceof Node && setText(child, text)) {
                        return true;
                    }
                    child = child.nextSibling;
                }
            }
            else if (elem instanceof Text) {
                var str = void 0;
                if (typeof (text) === "string") {
                    str = text;
                }
                else {
                    str = text.toString();
                }
                elem.nodeValue = str;
            }
            return false;
        }
        Dom.setText = setText;
    })(Dom = Lib.Dom || (Lib.Dom = {}));
})(Lib || (Lib = {}));
/// <reference path="./lib.ts" />
"use strict";
var Lib;
/// <reference path="./lib.ts" />
(function (Lib) {
    var PositionPair = (function () {
        function PositionPair(m1, m2) {
            this.m1 = m1;
            this.m2 = m2;
        }
        PositionPair.prototype.add = function (v) {
            return new PositionPair(this.m1.add(v.m1), this.m2.add(v.m2));
        };
        PositionPair.prototype.sub = function (p) {
            return new VectorPair(this.m1.sub(p.m1), this.m2.sub(p.m2));
        };
        PositionPair.prototype.equals = function (p) {
            if (this === p) {
                return true;
            }
            else if (p instanceof VectorPair) {
                return this.m1.equals(p.m1) && this.m2.equals(p.m2);
            }
            else {
                return false;
            }
        };
        PositionPair.prototype.toString = function () {
            return this.m1.toString() + "-" + this.m2.toString();
        };
        return PositionPair;
    }());
    Lib.PositionPair = PositionPair;
    var VectorPair = (function (_super) {
        __extends(VectorPair, _super);
        function VectorPair() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        VectorPair.prototype.add = function (v) {
            return new VectorPair(this.m1.add(v.m1), this.m2.add(v.m2));
        };
        VectorPair.prototype.neg = function () {
            return new VectorPair(this.m1.neg(), this.m2.neg());
        };
        VectorPair.prototype.mul = function (s) {
            return new VectorPair(this.m1.mul(s), this.m2.mul(s));
        };
        VectorPair.prototype.div = function (s) {
            return new VectorPair(this.m1.div(s), this.m2.div(s));
        };
        VectorPair.prototype.isZero = function () {
            return this.m1.isZero() && this.m2.isZero();
        };
        return VectorPair;
    }(PositionPair));
    Lib.VectorPair = VectorPair;
    function propDist(a, b, r) {
        return a.add(b.sub(a).mul(r));
        /*
        if(typeof(a) === "object" && typeof(b) === "object"){
            let ret = {};
            for(let name in a){
                ret[name] = a[name] + (b[name] - a[name]) * r;
            }
            return ret;
        }else{
            return a + (b - a) * r;
        }*/
    }
    Lib.propDist = propDist;
    function propDistNum(a, b, r) {
        return a + (b - a) * r;
    }
    Lib.propDistNum = propDistNum;
    function find_row_to_replace(matrix, cols, i) {
        for (var j = i + 1; j < cols; j++) {
            if (matrix[j][i] != 0) {
                return j;
            }
        }
        return -1;
    }
    function gaussian_elimination(matrix) {
        var rows = matrix.length;
        var cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (var i = 0; i < cols; i++) {
            if (matrix[i][i] == 0) {
                var r = find_row_to_replace(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                var tmp_row = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmp_row;
            }
            var p = matrix[i][i];
            if (p != 1) {
                for (var j = i; j <= rows; j++) {
                    matrix[i][j] /= p;
                }
            }
            for (var j = 0; j < cols; j++) {
                if (j != i) {
                    var n = matrix[j][i];
                    if (n != 0) {
                        for (var k = i; k <= rows; k++) {
                            matrix[j][k] -= n * matrix[i][k];
                        }
                    }
                }
            }
        }
        return true;
    }
    Lib.gaussian_elimination = gaussian_elimination;
    function find_row_to_replace_for_obj(matrix, cols, i) {
        for (var j = i + 1; j < cols; j++) {
            if (!matrix[j][i].isZero()) {
                return j;
            }
        }
        return -1;
    }
    function gaussian_elimination_for_obj(matrix, one) {
        var rows = matrix.length;
        var cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (var i = 0; i < cols; i++) {
            if (matrix[i][i].isZero()) {
                var r = find_row_to_replace_for_obj(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                var tmp_row = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmp_row;
            }
            var p = matrix[i][i];
            if (!p.equals(one)) {
                for (var j = i; j <= rows; j++) {
                    matrix[i][j] = matrix[i][j].div(p);
                }
            }
            for (var j = 0; j < cols; j++) {
                if (j != i) {
                    var n = matrix[j][i];
                    if (!n.isZero()) {
                        for (var k = i; k <= rows; k++) {
                            matrix[j][k] = matrix[j][k].sub(n.mul(matrix[i][k]));
                        }
                    }
                }
            }
        }
        return true;
    }
    Lib.gaussian_elimination_for_obj = gaussian_elimination_for_obj;
    function _solveLinearEquation(equations, solver) {
        if (equations.length > 0) {
            var var_list = [];
            var var_count = 0;
            for (var v in equations[0]) {
                if (v != "_") {
                    var_list[var_count++] = v;
                }
            }
            if (var_count > equations.length) {
                return null;
            }
            var matrix = [];
            for (var i = 0; i < equations.length; i++) {
                var equation = equations[i];
                var line = [];
                for (var j = 0; j < var_count; j++) {
                    line.push(equation[var_list[j]]);
                }
                line.push(equation["_"]);
                matrix.push(line);
            }
            if (solver(matrix)) {
                var solution = {};
                for (var j = 0; j < var_count; j++) {
                    solution[var_list[j]] = matrix[j][var_count];
                }
                return solution;
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    }
    function solveLinearEquationVec(equations, one) {
        return _solveLinearEquation(equations, function (matrix) { return gaussian_elimination_for_obj(matrix, one); });
    }
    Lib.solveLinearEquationVec = solveLinearEquationVec;
    function solveLinearEquation(equations) {
        return _solveLinearEquation(equations, gaussian_elimination);
    }
    Lib.solveLinearEquation = solveLinearEquation;
    function output_matrix(matrix) {
        for (var j = 0; j < matrix.length; j++) {
            var line = "";
            for (var k = 0; k < matrix[j].length; k++) {
                line += matrix[j][k] + ", ";
            }
            Lib.info_output(line);
        }
    }
    Lib.output_matrix = output_matrix;
    //	Lib.gaussian_elimination = gaussian_elimination;
    //	Lib.output_matrix = output_matrix;
})(Lib || (Lib = {}));
/*
    function test(){
        for(let i = 0; i < 100; i ++){
            let size = Math.floor(3 * Math.random()) + 3;
            let matrix_org = [];
            let matrix = [];
            for(let j = 0; j < size; j ++){
                matrix[j] = [];
                matrix_org[j] = [];
                for(let k = 0; k < size; k ++){
                    matrix_org[j][k] = matrix[j][k] = 1.0 - Math.random() * 2.0;
                }
                matrix_org[j][size] = matrix[j][size] = 1.0 - Math.random() * 2.0;
            }
            matrix_org[0][0] = matrix[0][0] = 0;
            if(Lib.gaussian_elimination(matrix)){
                Lib.info_output(i + ": solved");
                Lib.info_output("[org]");
                for(let j = 0; j < size; j ++){
                    let line = "";
                    for(let k = 0; k < size ; k ++){
                        line += matrix_org[j][k] + ", "
                    }
                    Lib.info_output(line + matrix_org[j][size]);
                }
                Lib.info_output("[solved]");
                for(let j = 0; j < size; j ++){
                    let line = "";
                    for(let k = 0; k < size ; k ++){
                        line += matrix[j][k] + ", "
                    }
                    Lib.info_output(line + matrix[j][size]);
                }
                let error = 0;
                for(let j = 0; j < size; j ++){
                    let sum = 0;
                    for(let k = 0; k < size ; k ++){
                        sum += matrix_org[j][k] * matrix[k][size];
                    }
                    error += sum - matrix_org[j][size]
//					Lib.info_output("  " + sum + " = " + matrix_org[j][size]);
                }
                Lib.info_output("error :" + error);
                
                
            }else{
                Lib.info_output(i + ": not solved");
            }
        }
    }
    
    
    
*/
/// <reference path="./lib.linear_algebra.ts" />
"use strict";
var Lib;
/// <reference path="./lib.linear_algebra.ts" />
(function (Lib) {
    function hypot2() {
        var d_list = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            d_list[_i] = arguments[_i];
        }
        var sum = 0;
        for (var i = 0; i < d_list.length; i++) {
            var d = d_list[i];
            sum += d * d;
        }
        return sum;
    }
    Lib.hypot2 = hypot2;
    function hypot() {
        var d_list = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            d_list[_i] = arguments[_i];
        }
        return Math.sqrt(hypot2.apply(void 0, d_list));
    }
    Lib.hypot = hypot;
    var BasicVector2D = (function () {
        function BasicVector2D(x, y) {
            this.x = x;
            this.y = y;
        }
        BasicVector2D.prototype.toString = function () {
            return "(" + this.x + ", " + this.y + ")";
        };
        BasicVector2D.prototype.equals = function (v) {
            if (this === v) {
                return true;
            }
            else if (v instanceof BasicVector2D) {
                return this.x == v.x && this.y == v.y;
            }
            else {
                return false;
            }
        };
        return BasicVector2D;
    }());
    var Vector2D = (function (_super) {
        __extends(Vector2D, _super);
        function Vector2D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Vector2D.prototype.length2 = function () {
            return hypot2(this.x, this.y);
        };
        Vector2D.prototype.length = function () {
            return Math.sqrt(this.length2());
        };
        Vector2D.prototype.rotateR = function () {
            return new Vector2D(-this.y, this.x);
        };
        Vector2D.prototype.unit = function () {
            var d = this.length();
            if (d > 0) {
                return this.div(d);
            }
            else {
                return null;
            }
        };
        Vector2D.prototype.add = function (vector) {
            return new Vector2D(this.x + vector.x, this.y + vector.y);
        };
        Vector2D.prototype.sub = function (vector) {
            return new Vector2D(this.x - vector.x, this.y - vector.y);
        };
        Vector2D.prototype.mul = function (value) {
            return new Vector2D(this.x * value, this.y * value);
        };
        Vector2D.prototype.div = function (value) {
            return new Vector2D(this.x / value, this.y / value);
        };
        Vector2D.prototype.neg = function () {
            return new Vector2D(-this.x, -this.y);
        };
        Vector2D.prototype.isZero = function () {
            return this.x == 0 && this.y == 0;
        };
        Vector2D.random = function (length) {
            if (length === void 0) { length = 1.0; }
            var r = Math.PI * 2 * Math.random();
            return new Vector2D(length * Math.sin(r), length * Math.cos(r));
        };
        return Vector2D;
    }(BasicVector2D));
    Lib.Vector2D = Vector2D;
    var Point2D = (function (_super) {
        __extends(Point2D, _super);
        function Point2D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Point2D.prototype.distance2 = function (point) {
            return hypot2(point.x - this.x, point.y - this.y);
        };
        Point2D.prototype.distance = function (point) {
            return Math.sqrt(this.distance2(point));
        };
        Point2D.prototype.equals = function (point) {
            if (point instanceof Point2D) {
                return this.x == point.x && this.y == point.y;
            }
            else {
                return false;
            }
        };
        Point2D.prototype.sub = function (point) {
            return new Vector2D(this.x - point.x, this.y - point.y);
        };
        Point2D.prototype.add = function (vector) {
            return new Point2D(this.x + vector.x, this.y + vector.y);
        };
        Point2D.fromMouseOffset = function (event) {
            return new Point2D(event.offsetX, event.offsetY);
        };
        Point2D.fromMouseClient = function (event) {
            return new Point2D(event.clientX, event.clientY);
        };
        Point2D.fromElementStyle = function (element) {
            var target = Lib.Dom.prepareTarget(element);
            if (target instanceof HTMLElement) {
                return new Lib.Point2D(target.style.left !== null ? parseInt(target.style.left) : 0, target.style.top !== null ? parseInt(target.style.top) : 0);
            }
            else {
                throw "element has not style";
            }
        };
        Point2D.fromElementOffset = function (element) {
            var target = Lib.Dom.prepareTarget(element);
            if (target instanceof HTMLElement) {
                return new Lib.Point2D(target.offsetLeft, target.offsetTop);
            }
            else {
                throw "element has not offset";
            }
        };
        return Point2D;
    }(BasicVector2D));
    Lib.Point2D = Point2D;
    var Rectangle = (function (_super) {
        __extends(Rectangle, _super);
        function Rectangle(x1, y1, x2, y2) {
            var _this = this;
            if (x1 > x2) {
                var tmp = x1;
                x1 = x2;
                x2 = tmp;
            }
            if (y1 > y2) {
                var tmp = y1;
                y1 = y2;
                y2 = tmp;
            }
            _this = _super.call(this, new Point2D(x1, y1), new Point2D(x2, y2)) || this;
            _this.l = _this.m1.x;
            _this.t = _this.m1.y;
            _this.r = _this.m2.x;
            _this.b = _this.m2.y;
            _this.w = _this.r - _this.l;
            _this.h = _this.b - _this.t;
            return _this;
        }
        Rectangle.fromPoints = function (m1, m2) {
            return new Rectangle(m1.x, m1.y, m2.x, m2.y);
        };
        Rectangle.fromCenterAndSize = function (center, size) {
            var size2 = size.div(2);
            return Rectangle.fromPoints(center.add(size2.neg()), center.add(size2));
        };
        Rectangle.fromLTWH = function (l, t, w, h) {
            return new Rectangle(l, t, l + w, t + h);
        };
        Rectangle.prototype.center = function () {
            return new Point2D((this.l + this.r) / 2, (this.t + this.b) / 2);
        };
        Rectangle.prototype.size = function () {
            return new Vector2D(this.w, this.h);
        };
        Rectangle.prototype.boundaries = function () {
            var c1 = this.m1;
            var c2 = new Point2D(this.r, this.t);
            var c3 = this.m2;
            var c4 = new Point2D(this.l, this.b);
            return [
                new Segment2D(c1, c2),
                new Segment2D(c2, c3),
                new Segment2D(c3, c4),
                new Segment2D(c4, c1),
            ];
        };
        Rectangle.prototype.colideWith = function (rect) {
            return this.l <= rect.r && this.r >= rect.l && this.t <= rect.b && this.b >= rect.t;
        };
        Rectangle.prototype.includes = function (pos) {
            return pos.x >= this.l && pos.x <= this.r && pos.y >= this.t && pos.y <= this.b;
        };
        Rectangle.prototype.distance = function (rect) {
            if (this.colideWith(rect)) {
                return -Math.min(rect.r - this.l, this.r - rect.l, rect.b - this.t, this.b - rect.t);
            }
            var this_x = null;
            var this_y = null;
            var rect_x = null;
            var rect_y = null;
            if (this.l > rect.r) {
                // rect this
                this_x = this.l;
                rect_x = rect.r;
            }
            else if (this.r < rect.l) {
                // this rect
                this_x = this.r;
                rect_x = rect.l;
            }
            if (this.t > rect.b) {
                // rect
                // this
                this_y = this.t;
                rect_y = rect.b;
            }
            else if (this.b < rect.t) {
                // this
                // rect
                this_y = this.b;
                rect_y = rect.t;
            }
            if (this_x !== null && rect_x !== null) {
                if (this_y !== null && rect_y !== null) {
                    return hypot(this_x - rect_x, this_y - rect_y);
                }
                else {
                    return Math.abs(this_x - rect_x);
                }
            }
            else {
                if (this_y !== null && rect_y !== null) {
                    return Math.abs(this_y - rect_y);
                }
            }
            // not reachable
            return 0;
        };
        Rectangle.prototype.add = function (v) {
            return Rectangle.fromPoints(this.m1.add(v.m1), this.m2.add(v.m2));
        }; /*
        public sub(rect: Rectangle): VectorPair<Vector2D, number>{
            return new VectorPair<Vector2D, number>(this.center().sub(rect.center()), this.size().sub(rect.size()));
        }*/
        return Rectangle;
    }(Lib.PositionPair));
    Lib.Rectangle = Rectangle;
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Line.prototype.vector = function () {
            return this.m2.sub(this.m1);
        };
        return Line;
    }(Lib.PositionPair));
    Lib.Line = Line;
    var Line2D = (function (_super) {
        __extends(Line2D, _super);
        function Line2D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Line2D.prototype.crossPoint = function (line) {
            var v1 = this.vector();
            var v2 = line.vector();
            // calculate (x, y)
            // v1.x(y - this.m1.y) = v1.y (x - this.m1.x)
            // v2.x(y - line.m1.y) = v2.y (x - line.m1.x)
            var equations = [
                { x: v1.y, y: -v1.x, _: v1.y * this.m1.x - v1.x * this.m1.y },
                { x: v2.y, y: -v2.x, _: v2.y * line.m1.x - v2.x * line.m1.y },
            ];
            var solution = Lib.solveLinearEquation(equations);
            if (solution) {
                return new Point2D(solution.x, solution.y);
            }
            else {
                return null;
            }
        };
        return Line2D;
    }(Line));
    Lib.Line2D = Line2D;
    //	export class Segment<V extends Geometry<V, P>, P extends PointType<V, P>> extends Line<V, P>{
    //		
    //	}
    var Segment2D = (function (_super) {
        __extends(Segment2D, _super);
        function Segment2D() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Segment2D.prototype.crossPoint = function (line) {
            var v1 = this.vector();
            var v2 = line.vector();
            // calculate (s, t)
            // this.m1 + v1 * s = line.m1 + v2 * t
            // this.m1 + v1 * s - line.m1 - v2 * t = 0
            // v1 * s - v2 * t = -this.m1 + line.m1
            var equations = [
                { s: v1.x, t: -v2.x, _: -this.m1.x + line.m1.x },
                { s: v1.y, t: -v2.y, _: -this.m1.y + line.m1.y },
            ];
            var solution = Lib.solveLinearEquation(equations);
            if (solution) {
                //const t = matrix[1][2];
                if (solution.s >= 0 && solution.s <= 1) {
                    return this.m1.add(v1.mul(solution.s));
                }
                else {
                    return null;
                }
            }
            else {
                return null;
            }
        };
        return Segment2D;
    }(Line2D));
    Lib.Segment2D = Segment2D;
})(Lib || (Lib = {}));
/// <reference path="./lib.linear_algebra.ts"/>
"use strict";
var Lib;
/// <reference path="./lib.linear_algebra.ts"/>
(function (Lib) {
    var Color = (function () {
        function Color(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Color.toHex = function (d) {
            d = Math.round(d);
            if (d >= 255) {
                return "ff";
            }
            else if (d <= 15) {
                return "0" + d.toString(16);
            }
            else {
                return d.toString(16);
            }
        };
        Color.prototype.add = function (col) {
            return new Color(this.r + col.r, this.g + col.g, this.b + col.b);
        };
        Color.prototype.sub = function (col) {
            return new Color(this.r - col.r, this.g - col.g, this.b - col.b);
        };
        Color.prototype.mul = function (r) {
            return new Color(this.r * r, this.g * r, this.b * r);
        };
        Color.prototype.div = function (r) {
            return new Color(this.r / r, this.g / r, this.b / r);
        };
        Color.prototype.neg = function () {
            return new Color(-this.r, -this.g, -this.b);
        };
        Color.prototype.isZero = function () {
            return this.r == 0 && this.g == 0 && this.b == 0;
        };
        Color.prototype.equals = function (obj) {
            if (obj instanceof Color) {
                return this.r == obj.r && this.g == obj.g && this.b == obj.b;
            }
            else {
                return false;
            }
        };
        Color.prototype.toString = function () {
            return "#" + Color.toHex(this.r) + Color.toHex(this.g) + Color.toHex(this.b);
        };
        return Color;
    }());
    Lib.Color = Color;
})(Lib || (Lib = {}));
/// <reference path="./lib.ts" />
"use strict";
var Lib;
/// <reference path="./lib.ts" />
(function (Lib) {
    var Suspend = (function () {
        function Suspend() {
        }
        return Suspend;
    }());
    Suspend.Suspend = new Suspend();
    var Complete = (function () {
        function Complete() {
        }
        return Complete;
    }());
    Complete.Complete = new Complete();
    var Break = (function () {
        function Break() {
        }
        return Break;
    }());
    Break.Break = new Break();
    Lib.SUSPEND = Suspend.Suspend;
    Lib.COMPLETE = Complete.Complete;
    Lib.BREAK = Break.Break;
    var AsynchronousTask = (function () {
        function AsynchronousTask(func, next_item, complete, parallel_count, sequential_count, wait) {
            if (complete === void 0) { complete = Lib.do_nothing; }
            if (parallel_count === void 0) { parallel_count = 1; }
            if (sequential_count === void 0) { sequential_count = 1; }
            if (wait === void 0) { wait = 0; }
            var _this = this;
            this.func = func;
            this.next_item = next_item;
            this.complete = complete;
            this.parallel_count = parallel_count;
            this.sequential_count = sequential_count;
            this.wait = wait;
            this.num_process = 0;
            this.proc = function () {
                _this.num_process--;
                for (var i = 0; _this.sequential_count == 0 || i < _this.sequential_count; i++) {
                    var item = _this.next_item();
                    if (item instanceof Complete) {
                        if (_this.num_process == 0) {
                            _this.complete();
                        }
                        return;
                    }
                    else if (item instanceof Suspend) {
                        return;
                    }
                    else {
                        if (_this.func(item) === Lib.BREAK) {
                            if (_this.num_process == 0) {
                                _this.complete();
                            }
                            return;
                        }
                    }
                }
                _this.start_process(_this.wait);
            };
        }
        AsynchronousTask.prototype.start_process = function (wait) {
            if (wait === void 0) { wait = 0; }
            this.num_process++;
            setTimeout(this.proc, wait);
        };
        AsynchronousTask.prototype.wake = function () {
            while (this.num_process < this.parallel_count) {
                this.start_process();
            }
        };
        return AsynchronousTask;
    }());
    Lib.AsynchronousTask = AsynchronousTask;
    var AsynchronousProcessQueue = (function () {
        function AsynchronousProcessQueue(func, complete, parallel_count, sequential_count, wait) {
            var _this = this;
            this.queue = [];
            this.available = true;
            this.executing = true;
            this.next_item = function () {
                if (_this.executing) {
                    var item = _this.queue.shift();
                    if (item) {
                        if (item instanceof Complete) {
                            _this.executing = false;
                        }
                        return item;
                    }
                    else {
                        return Lib.SUSPEND;
                    }
                }
                else {
                    return Lib.COMPLETE;
                }
            };
            this.queue = [];
            this.task = new AsynchronousTask(func, this.next_item, complete, parallel_count, sequential_count, wait);
        }
        AsynchronousProcessQueue.prototype.checkAvailable = function () {
            if (!this.available) {
                throw "queue already completed";
            }
        };
        AsynchronousProcessQueue.prototype.push = function (item) {
            this.checkAvailable();
            this.queue.push(item);
            this.task.wake();
        };
        AsynchronousProcessQueue.prototype.complete = function () {
            this.checkAvailable();
            this.queue.push(Complete);
            this.available = false;
        };
        return AsynchronousProcessQueue;
    }());
    Lib.AsynchronousProcessQueue = AsynchronousProcessQueue;
    var Iterator = (function () {
        function Iterator(count) {
            var _this = this;
            this.count = count;
            this.index = 0;
            this.next_item = function () {
                if (_this.index < _this.count) {
                    return _this.index++;
                }
                else {
                    return Lib.COMPLETE;
                }
            };
        }
        return Iterator;
    }());
    var ArrayIterator = (function () {
        function ArrayIterator(items) {
            var _this = this;
            this.items = items;
            this.index = 0;
            this.next_item = function () {
                if (_this.index < _this.items.length) {
                    return _this.items[_this.index++];
                }
                else {
                    return Lib.COMPLETE;
                }
            };
        }
        return ArrayIterator;
    }());
    function asynchronousExec(target, func, complete, parallel_count, sequential_count, wait) {
        if (parallel_count === void 0) { parallel_count = 1; }
        if (sequential_count === void 0) { sequential_count = 1; }
        if (wait === void 0) { wait = 0; }
        var next_item_func;
        if (typeof target === "string") {
            next_item_func = new Iterator(parseInt(target)).next_item;
        }
        else if (typeof target === "number") {
            next_item_func = new Iterator(target).next_item;
        }
        else if (typeof target === "function") {
            next_item_func = target;
        }
        else {
            next_item_func = new ArrayIterator(target).next_item;
        }
        var task = new AsynchronousTask(func, next_item_func, complete, parallel_count, sequential_count, wait);
        task.wake();
    }
    Lib.asynchronousExec = asynchronousExec;
    var IntervalTaskBase = (function () {
        function IntervalTaskBase() {
            var _this = this;
            this.canceled = false;
            this.exec = function () {
                if (_this.canceled) {
                    return;
                }
                var cur_time = new Date().getTime();
                var next_interval = _this.tick(cur_time - _this.prev_tick);
                if (next_interval === null) {
                    _this.cancel();
                    return;
                }
                if (_this.canceled) {
                    return;
                }
                if (next_interval < 1) {
                    next_interval = 1;
                }
                _this.prev_tick = cur_time;
                setTimeout(_this.exec, next_interval);
            };
            this.prev_tick = new Date().getTime();
        }
        IntervalTaskBase.prototype.cancel = function () {
            this.canceled = true;
        };
        IntervalTaskBase.prototype.start = function () {
            this.exec();
        };
        return IntervalTaskBase;
    }());
    Lib.IntervalTaskBase = IntervalTaskBase;
    var VariableIntervalTask = (function (_super) {
        __extends(VariableIntervalTask, _super);
        function VariableIntervalTask(tick) {
            var _this = _super.call(this) || this;
            _this.tick = tick;
            return _this;
        }
        VariableIntervalTask.start = function (tick) {
            var task = new VariableIntervalTask(tick);
            task.start();
            return task;
        };
        return VariableIntervalTask;
    }(IntervalTaskBase));
    Lib.VariableIntervalTask = VariableIntervalTask;
    var FixedIntervalTaskBase = (function (_super) {
        __extends(FixedIntervalTaskBase, _super);
        function FixedIntervalTaskBase(interval) {
            var _this = _super.call(this) || this;
            _this.interval = interval;
            _this.tick = function (interval) {
                _this.fixed_tick(interval);
                //			return this.interval * 2 - interval;
                return _this.interval;
            };
            if (_this.interval <= 0) {
                throw "interval (=" + interval + ") must be positive";
            }
            return _this;
        }
        return FixedIntervalTaskBase;
    }(IntervalTaskBase));
    Lib.FixedIntervalTaskBase = FixedIntervalTaskBase;
    var FixedIntervalTask = (function (_super) {
        __extends(FixedIntervalTask, _super);
        function FixedIntervalTask(fixed_tick, interval) {
            var _this = _super.call(this, interval) || this;
            _this.fixed_tick = fixed_tick;
            _this.interval = interval;
            return _this;
        }
        FixedIntervalTask.start = function (tick, interval) {
            var task = new FixedIntervalTask(tick, interval);
            task.start();
            return task;
        };
        return FixedIntervalTask;
    }(FixedIntervalTaskBase));
    Lib.FixedIntervalTask = FixedIntervalTask;
    var UniqueVariableIntervalTask = (function (_super) {
        __extends(UniqueVariableIntervalTask, _super);
        function UniqueVariableIntervalTask(manager, target, unique_tick) {
            var _this = _super.call(this) || this;
            _this.manager = manager;
            _this.target = target;
            _this.unique_tick = unique_tick;
            _this.tick = function (interval) {
                return _this.unique_tick(_this.target, interval);
            };
            return _this;
        }
        UniqueVariableIntervalTask.prototype.cancel = function () {
            _super.prototype.cancel.call(this);
            this.manager.canceled(this);
        };
        return UniqueVariableIntervalTask;
    }(IntervalTaskBase));
    var UniqueIntervalTaskBase = (function (_super) {
        __extends(UniqueIntervalTaskBase, _super);
        function UniqueIntervalTaskBase(manager, target, interval) {
            var _this = _super.call(this, interval) || this;
            _this.manager = manager;
            _this.target = target;
            _this.fixed_tick = function (interval) {
                _this.unique_tick(_this.target, interval);
            };
            return _this;
        }
        UniqueIntervalTaskBase.prototype.cancel = function () {
            _super.prototype.cancel.call(this);
            this.manager.canceled(this);
        };
        return UniqueIntervalTaskBase;
    }(FixedIntervalTaskBase));
    var UniqueIntervalTask = (function (_super) {
        __extends(UniqueIntervalTask, _super);
        function UniqueIntervalTask(manager, target, unique_tick, interval) {
            var _this = _super.call(this, manager, target, interval) || this;
            _this.manager = manager;
            _this.target = target;
            _this.unique_tick = unique_tick;
            return _this;
        }
        return UniqueIntervalTask;
    }(UniqueIntervalTaskBase));
    var UniqueTaskManager = (function () {
        function UniqueTaskManager() {
            this.tasks = [];
            /*
            public addTask(task: IntervalTaskBase){
                this.tasks.push(task);
                this.tick_one(task);
            }
            public addIntervalTick(task: IntervalTick, interval: number){
                this.addTask(new IntervalTask(task, interval));
            }
            public addVariableTick(task: VariableTick, interval: number){
                this.addTask(new IntervalTask(task, interval));
            }
            public forEachTask(func: (task: IntervalTaskBase)=> undefined | Complete){
                for(let i = 0; i < this.tasks.length; i ++){
                    if(func(this.tasks[i]) === COMPLETE){
                        return true;
                    }
                }
                return false;
            }
            */
        }
        UniqueTaskManager.prototype.constuctor = function () {
        };
        UniqueTaskManager.prototype.canceled = function (task) {
            this.remove_task(task.target);
        };
        UniqueTaskManager.prototype.start_task = function (task) {
            this.remove_task(task.target);
            this.tasks.push(task);
            task.start();
        };
        UniqueTaskManager.prototype.remove_task = function (target) {
            for (var i = 0; i < this.tasks.length; i++) {
                var task = this.tasks[i];
                if (task.target === target) {
                    this.tasks.splice(i, 1);
                    task.cancel();
                    return;
                }
            }
        };
        UniqueTaskManager.prototype.start_variable = function (target, tick) {
            this.start_task(new UniqueVariableIntervalTask(this, target, tick));
        };
        UniqueTaskManager.prototype.start_fixed = function (target, tick, interval) {
            this.start_task(new UniqueIntervalTask(this, target, tick, interval));
        };
        UniqueTaskManager.prototype.forEachTask = function (func) {
            for (var i = 0; i < this.tasks.length; i++) {
                if (func(this.tasks[i]) === Lib.COMPLETE) {
                    return true;
                }
            }
            return false;
        };
        UniqueTaskManager.prototype.cancelAll = function () {
            for (var i = 0; i < this.tasks.length; i++) {
                this.tasks[i].cancel();
            }
        };
        return UniqueTaskManager;
    }());
    Lib.UniqueTaskManager = UniqueTaskManager;
    var FaderTask = (function (_super) {
        __extends(FaderTask, _super);
        function FaderTask(manager, target, interval, time, fade, initial_alpha, complete) {
            var _this = _super.call(this, manager, target, interval) || this;
            _this.unique_tick = function (target, interval) {
                var alpha = _this.alpha + interval * _this.speed;
                if (alpha >= 1.0) {
                    alpha = 1;
                }
                else if (alpha <= 0.0) {
                    alpha = 0;
                }
                _this.alpha = alpha;
                _this.fade(target, _this.alpha);
                if (_this.speed > 0 && alpha == 1 || _this.speed < 0 && alpha == 0) {
                    if (_this.complete) {
                        _this.complete(_this.target);
                    }
                    _this.cancel();
                }
            };
            _this.alpha = initial_alpha;
            _this.setParams(time, fade, complete);
            return _this;
        }
        FaderTask.prototype.setParams = function (time, fade, complete) {
            this.speed = 1.0 / time;
            this.fade = fade;
            this.complete = complete;
        };
        return FaderTask;
    }(UniqueIntervalTaskBase));
    var Fader = (function () {
        function Fader(interval, manager) {
            this.interval = interval;
            if (manager) {
                this.manager = manager;
            }
            else {
                this.manager = new UniqueTaskManager();
            }
        }
        Fader.prototype.start = function (target, time, fade, initial_alpha, complete) {
            var task = new FaderTask(this.manager, target, this.interval, time, fade, initial_alpha, complete);
            this.manager.start_task(task);
            return task;
        };
        Fader.prototype.fade_in = function (target, time, fade, initial_alpha, complete) {
            if (initial_alpha === void 0) { initial_alpha = 0; }
            return this.start(target, time, fade, initial_alpha, complete);
        };
        Fader.prototype.fade_out = function (target, time, fade, initial_alpha, complete) {
            if (initial_alpha === void 0) { initial_alpha = 1; }
            return this.start(target, -time, fade, initial_alpha, complete);
        };
        Fader.prototype.stop = function (target) {
            this.manager.forEachTask(function (t) {
                if (t instanceof FaderTask) {
                    if (t.target === target) {
                        t.cancel();
                        return Lib.COMPLETE;
                    }
                }
                return undefined;
            });
        };
        Fader.prototype.cancelAll = function () {
            this.manager.cancelAll();
        };
        return Fader;
    }());
    Lib.Fader = Fader;
    var ComposedCallback = (function () {
        function ComposedCallback(callback1, callback2) {
            var _this = this;
            this.callback1 = callback1;
            this.callback2 = callback2;
            this.callback = function (target) {
                _this.callback1(target);
                _this.callback2(target);
            };
        }
        return ComposedCallback;
    }());
    /*
    class ElementFaderTask{
        public constructor(private readonly complete1: FadeComplete<T>, private readonly complete2: FadeComplete<T>){
        }
        public complete: FadeComplete<T> = (element: HTMLElement) => {
            this.complete1(element);
            this.complete2(element);
        }
    }*/
    var ElementFader = (function () {
        function ElementFader(interval, manager) {
            var _this = this;
            this.fade_after_load = function (target, time, onload_callback, fade_in_callback) {
                Lib.execute_on_load(function (target) {
                    onload_callback(target);
                    _this.fade_in(target, time, fade_in_callback);
                }, target);
                /*			let task = function(){
                                if(onload_callback != null){
                                    onload_callback(target);
                                }
                                this.fade_in(target, time, fade_in_callback);
                            }
                            if(target.complete){
                                task();
                            }else{
                                target.addEventListener("load", task, true);
                            }*/
            };
            this.fader = new Fader(interval, manager);
        }
        ElementFader.fade = function (target, alpha) {
            target.style.opacity = "" + alpha;
        };
        ElementFader.fade_in_complete = function (target) {
            target.style.opacity = "";
        };
        ElementFader.fade_out_complete = function (target) {
            target.style.display = "none";
            target.style.opacity = "";
        };
        ElementFader.prototype.fade_in = function (target, time, complete) {
            var initial_alpha;
            if (target.style.display == "none" || target.style.visibility == "hidden") {
                initial_alpha = 0;
                target.style.display = "";
                target.style.visibility = "visible";
            }
            else if (target.style.opacity === null || target.style.opacity == "") {
                if (complete) {
                    complete(target);
                }
                return;
            }
            else {
                initial_alpha = parseFloat(target.style.opacity);
            }
            if (complete) {
                complete = new ComposedCallback(ElementFader.fade_in_complete, complete).callback;
            }
            else {
                complete = ElementFader.fade_in_complete;
            }
            return this.fader.fade_in(target, time, ElementFader.fade, initial_alpha, complete);
        };
        ElementFader.prototype.fade_out = function (target, time, complete) {
            if (target.style.display == "none" || target.style.visibility == "hidden") {
                target.style.display = "none";
                if (complete) {
                    complete(target);
                }
                return;
            }
            var initial_alpha;
            if (target.style.opacity === null || target.style.opacity == "") {
                initial_alpha = 1;
            }
            else {
                initial_alpha = parseFloat(target.style.opacity);
            }
            if (complete) {
                complete = new ComposedCallback(ElementFader.fade_out_complete, complete).callback;
            }
            else {
                complete = ElementFader.fade_out_complete;
            }
            return this.fader.fade_out(target, time, ElementFader.fade, initial_alpha, complete);
        };
        ElementFader.prototype.stop = function (target) {
            this.fader.stop(target);
        };
        ElementFader.prototype.cancelAll = function () {
            this.fader.cancelAll();
        };
        return ElementFader;
    }());
    Lib.ElementFader = ElementFader;
})(Lib || (Lib = {}));
///<reference path="./lib.dom.ts"/>
///<reference path="./lib.geometry.ts"/>
///<reference path="./lib.color.ts"/>
///<reference path="./lib.task.ts"/>
"use strict";
var Hamming;
///<reference path="./lib.dom.ts"/>
///<reference path="./lib.geometry.ts"/>
///<reference path="./lib.color.ts"/>
///<reference path="./lib.task.ts"/>
(function (Hamming) {
    var M = 4;
    var N = 0;
    var Dom = Lib.Dom;
    var E = Dom.elem;
    var C = Dom.clear;
    var A = Dom.add;
    var T = Dom.text;
    var TD_WIDTH = "3em";
    var TD_HEIGHT = "1em";
    var Action = (function () {
        function Action(time) {
            this.time = time;
        }
        return Action;
    }());
    var fader = new Lib.ElementFader(33);
    var Mover = (function () {
        function Mover() {
            this.fader = new Lib.Fader(33);
        }
        Mover.prototype.move = function (target, pos_start, pos_end, time, callback) {
            this.fader.fade_in(target, time, function (target, alpha) {
                set_pos(target, Lib.propDist(pos_start, pos_end, alpha));
            }, 0, callback);
        };
        Mover.prototype.cancelAll = function () {
            this.fader.cancelAll();
        };
        return Mover;
    }());
    var ColorFader = (function () {
        function ColorFader() {
            this.fader = new Lib.Fader(33);
        }
        ColorFader.prototype.fade = function (target, col_s, col_e, time, callback) {
            this.fader.fade_in(target, time, function (target, alpha) {
                target.style.color = Lib.propDist(col_s, col_e, alpha).toString();
            }, 0, callback);
        };
        ColorFader.prototype.cancelAll = function () {
            this.fader.cancelAll();
        };
        return ColorFader;
    }());
    var mover = new Mover();
    var colorFader = new ColorFader();
    function set_pos(target, pos) {
        target.style.left = pos.x + "px";
        target.style.top = pos.y + "px";
    }
    function get(id) {
        var element = document.getElementById(id);
        if (!element) {
            throw "element not found";
        }
        return element;
    }
    var ActionWithTarget = (function (_super) {
        __extends(ActionWithTarget, _super);
        function ActionWithTarget(target, time) {
            var _this = _super.call(this, time) || this;
            if (target instanceof HTMLElement) {
                _this.target = target;
            }
            else {
                _this.target = get(target);
            }
            return _this;
        }
        return ActionWithTarget;
    }(Action));
    var Move = (function (_super) {
        __extends(Move, _super);
        function Move(target, pos_end, time) {
            var _this = _super.call(this, target, time) || this;
            _this.pos_end = pos_end;
            _this.exec = function (callback) {
                mover.move(_this.target, Lib.Point2D.fromElementStyle(_this.target), _this.pos_end, _this.time, callback);
            };
            _this.skip = function () {
                set_pos(_this.target, _this.pos_end);
            };
            _this.undo = function () {
                _this.target.style.left = _this.pos_start.x + "px";
                _this.target.style.top = _this.pos_start.y + "px";
                //			this.target.style.left = "";
                //			this.target.style.top = "";
            };
            _this.pos_start = Lib.Point2D.fromElementStyle(target);
            return _this;
        }
        return Move;
    }(ActionWithTarget));
    var FadeInD = (function (_super) {
        __extends(FadeInD, _super);
        function FadeInD(target, time) {
            var _this = _super.call(this, target, time) || this;
            _this.exec = function (callback) {
                fader.fade_in(_this.target, _this.time, callback);
            };
            _this.skip = function () {
                _this.target.style.display = "";
                _this.target.style.opacity = "";
            };
            _this.undo = function () {
                _this.target.style.display = "none";
                _this.target.style.opacity = "";
            };
            return _this;
        }
        return FadeInD;
    }(ActionWithTarget));
    var FadeOutD = (function (_super) {
        __extends(FadeOutD, _super);
        function FadeOutD(target, time) {
            var _this = _super.call(this, target, time) || this;
            _this.exec = function (callback) {
                fader.fade_out(_this.target, _this.time, callback);
            };
            _this.skip = function () {
                _this.target.style.display = "none";
                _this.target.style.opacity = "";
            };
            _this.undo = function () {
                _this.target.style.display = "";
                _this.target.style.opacity = "";
            };
            return _this;
        }
        return FadeOutD;
    }(ActionWithTarget));
    var FadeIn = (function (_super) {
        __extends(FadeIn, _super);
        function FadeIn(target, time) {
            var _this = _super.call(this, target, time) || this;
            _this.exec = function (callback) {
                fader.fade_in(_this.target, _this.time, callback);
            };
            _this.skip = function () {
                _this.target.style.visibility = "visible";
                _this.target.style.opacity = "";
            };
            _this.undo = function () {
                _this.target.style.visibility = "hidden";
                _this.target.style.opacity = "";
            };
            return _this;
        }
        return FadeIn;
    }(ActionWithTarget));
    var FadeOut = (function (_super) {
        __extends(FadeOut, _super);
        function FadeOut(target, time) {
            var _this = _super.call(this, target, time) || this;
            _this.exec = function (callback) {
                fader.fade_out(_this.target, _this.time, callback);
            };
            _this.skip = function () {
                _this.target.style.visibility = "hidden";
                _this.target.style.opacity = "";
            };
            _this.undo = function () {
                _this.target.style.visibility = "visible";
                _this.target.style.opacity = "";
            };
            return _this;
        }
        return FadeOut;
    }(ActionWithTarget));
    var ColorChange = (function (_super) {
        __extends(ColorChange, _super);
        function ColorChange(target, col_s, col_e, time) {
            var _this = _super.call(this, target, time) || this;
            _this.col_s = col_s;
            _this.col_e = col_e;
            _this.exec = function (callback) {
                colorFader.fade(_this.target, _this.col_s, _this.col_e, _this.time, callback);
            };
            _this.skip = function () {
                _this.target.style.color = _this.col_e.toString();
            };
            _this.undo = function () {
                _this.target.style.color = _this.col_s.toString();
            };
            return _this;
        }
        return ColorChange;
    }(ActionWithTarget));
    var ParallelAction = (function (_super) {
        __extends(ParallelAction, _super);
        function ParallelAction(actions) {
            var _this = _super.call(this, 0) || this;
            _this.exec = function (callback) {
                var count = _this.actions.length;
                var exec_callback = function () {
                    count--;
                    if (count == 0) {
                        callback();
                    }
                };
                for (var i = 0; i < _this.actions.length; i++) {
                    _this.actions[i].exec(exec_callback);
                }
            };
            _this.skip = function () {
                for (var i = 0; i < _this.actions.length; i++) {
                    _this.actions[i].skip();
                }
            };
            _this.undo = function () {
                for (var i = 0; i < _this.actions.length; i++) {
                    _this.actions[i].undo();
                }
            };
            _this.actions = actions;
            return _this;
        }
        return ParallelAction;
    }(Action));
    var SequentialAction = (function (_super) {
        __extends(SequentialAction, _super);
        function SequentialAction() {
            var actions = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                actions[_i] = arguments[_i];
            }
            var _this = _super.call(this, 0) || this;
            _this.exec = function (callback) {
                var count = 0;
                var exec_callback = function () {
                    count++;
                    if (count >= _this.actions.length) {
                        callback();
                    }
                    else {
                        _this.actions[count].exec(exec_callback);
                    }
                };
                _this.actions[0].exec(exec_callback);
            };
            _this.skip = function () {
                for (var i = 0; i < _this.actions.length; i++) {
                    _this.actions[i].skip();
                }
            };
            _this.undo = function () {
                for (var i = 0; i < _this.actions.length; i++) {
                    _this.actions[i].undo();
                }
            };
            _this.actions = actions;
            return _this;
        }
        return SequentialAction;
    }(Action));
    var Calc = (function (_super) {
        __extends(Calc, _super);
        function Calc(calc) {
            var _this = _super.call(this, 0) || this;
            _this.calc = calc;
            _this.exec = function (callback) {
                var action = _this.calc();
                if (action) {
                    action.exec(callback);
                }
                else {
                    callback();
                }
            };
            _this.skip = function () {
                var action = _this.calc();
                if (action) {
                    action.skip();
                }
            };
            _this.undo = function () {
                var action = _this.calc();
                if (action) {
                    action.undo();
                }
            };
            return _this;
        }
        return Calc;
    }(Action));
    var MessageWindow = (function () {
        function MessageWindow() {
            this.window = E("div", { id: "message_window", style: { padding: "2em", position: "absolute", display: "none", width: "30%", border: "2px solid #8af", backgroundColor: "#fff8ff" } });
            A(document.body, this.window);
        }
        MessageWindow.prototype.setMessage = function (target, message) {
            if (typeof (message) === "string") {
                message = T(message);
            }
            Dom.clear(this.window);
            A(this.window, message);
            this.message = message;
            this.window.style.display = "";
            this.window.style.left = Math.round(target.offsetLeft + target.offsetWidth / 2 - this.window.offsetWidth / 2) + "px";
            this.window.style.top = Math.round(target.offsetTop - this.window.offsetHeight) + "px";
            this.window.style.display = "none";
        };
        MessageWindow.prototype.getMessage = function () {
            return this.message;
        };
        return MessageWindow;
    }());
    var messageWindow;
    var SetMessage = (function (_super) {
        __extends(SetMessage, _super);
        function SetMessage(target, message) {
            var _this = _super.call(this, target, 0) || this;
            _this.message = message;
            _this.exec = function (callback) {
                messageWindow.setMessage(_this.target, _this.message);
                callback();
            };
            _this.skip = function () {
                messageWindow.setMessage(_this.target, _this.message);
            };
            _this.undo = function () {
                messageWindow.setMessage(_this.target, _this.prev_message);
            };
            _this.prev_message = messageWindow.getMessage();
            return _this;
        }
        return SetMessage;
    }(ActionWithTarget));
    var scenario = [
        function () {
            return new SequentialAction(new Calc(function () {
                for (var j = 1; j <= N; j++) {
                    get("circle_" + j).style.display = "none";
                }
                return undefined;
            }), new FadeIn("table", 500));
        },
        function () { return new FadeIn("mask", 500); },
        function () {
            var actions = [];
            var table = get("parity_table");
            var pos = new Lib.Point2D(table.offsetLeft, table.offsetTop);
            for (var i = 1; i <= M; i++) {
                var target = get("mask_" + i);
                var parity_target = get("parity_" + i);
                var pos_start = Lib.Point2D.fromElementStyle(target);
                actions.push(new Move(target, pos, 500));
                //				let parity = (parity_target.firstChild.firstChild as Text).nodeValue;
                var parity = parity_target.innerText;
                var message = (parity == "0" ? "1が偶数個あるので、青枠の空欄に0を書き込んでそのままにする" : "1が奇数個あるので、青枠の空欄に1を書き込んで、1を偶数個にする");
                actions.push(new SequentialAction(new SetMessage(target, message), new FadeIn("message_window", 500)));
                actions.push(new ColorChange(parity_target, new Lib.Color(255, 255, 255), new Lib.Color(0, 0, 0), 1000));
                actions.push(new ParallelAction([
                    new FadeOut("message_window", 500),
                    new Move(target, pos_start, 500)
                ]));
            }
            return actions;
        },
        function () { return new SequentialAction(new FadeIn("ready", 500), new FadeIn("error", 500)); },
        function () {
            return new SequentialAction(new Calc(function () {
                var td_s = get("table").getElementsByTagName("tr")[2].getElementsByTagName("td");
                var td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
                for (var i = 1; i <= N; i++) {
                    var value = (td_s[i - 1].innerText);
                    if (get("error_" + i).checked) {
                        value = (value == "0" ? "1" : "0");
                    }
                    Lib.Dom.setText(td_r[i - 1], value);
                }
                return undefined;
            }), new FadeIn("received", 500));
        },
        function () {
            var actions = [];
            var table = get("received_table");
            var pos = new Lib.Point2D(table.offsetLeft, table.offsetTop);
            var td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
            var _loop_1 = function (i) {
                var target = get("mask_" + i);
                var parity_target = get("parity_" + i);
                var pos_start = Lib.Point2D.fromElementStyle(target);
                actions.push(new Move(target, pos, 500));
                actions.push(new Calc(function () {
                    var parity = 0;
                    var bit = Math.pow(2, M - i);
                    for (var j = 1; j <= N; j++) {
                        if ((j & bit) != 0) {
                            if ((td_r[j - 1].innerText) == "1") {
                                parity = 1 - parity;
                            }
                        }
                    }
                    var message = (parity == 0 ? "1が偶数個なので、今、見えている範囲に間違いはない。間違いがない部分に○を付ける" : "1が奇数個なので、今、見えている範囲に間違いがある。間違いが高々1ビットだという仮定より、それ以外の部分には間違いはない。間違いがない部分に○を付ける");
                    var fade_circle_list = [];
                    for (var j = 1; j <= N; j++) {
                        var and = ((j & bit) == 0);
                        var circle = get("circle_" + j);
                        if ((and && parity == 1 || !and && parity == 0) && circle.style.display == "none") {
                            //						if((and && parity == 1 || !and && parity == 0)){
                            circle.style.color = "lightGreen";
                            fade_circle_list.push(new FadeInD("circle_" + j, 500));
                        }
                    }
                    return new SequentialAction(new SetMessage(target, message), new FadeIn("message_window", 500), new ParallelAction(fade_circle_list));
                }));
                actions.push(new ParallelAction([
                    new FadeOut("message_window", 500),
                    new Move(target, pos_start, 500)
                ]));
            };
            for (var i = 1; i <= M; i++) {
                _loop_1(i);
            }
            return actions;
        },
        function () {
            return new Calc(function () {
                var parity_target = get("ready");
                var fade_circle_list = [];
                for (var i = 1; i <= N; i++) {
                    var circle = get("circle_" + i);
                    if (circle.style.display == "none") {
                        circle.style.color = "red";
                        fade_circle_list.push(new FadeInD("circle_" + i, 500));
                    }
                }
                if (fade_circle_list.length == 0) {
                    return new SequentialAction(new SetMessage(parity_target, "全てに○が付いたので、データは壊れていないと思われる"), new FadeIn("message_window", 500));
                }
                else {
                    return new SequentialAction(new SetMessage(parity_target, "○が付かなかったビットが、送信の途中で壊れたものと思われる"), new FadeIn("message_window", 500), new ParallelAction(fade_circle_list));
                }
            });
        },
        function () {
            return new Calc(function () {
                var td_s = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
                var td_r = get("result_table").getElementsByTagName("tr")[0].getElementsByTagName("td");
                var wrong_count = 0;
                for (var i = 1; i <= N; i++) {
                    var circle = get("circle_" + i);
                    var value = td_s[i - 1].innerText;
                    if (circle.style.color == "red") {
                        value = (value == "0" ? "1" : "0");
                    }
                    Lib.Dom.setText(td_r[i - 1], value);
                    if (get("error_" + i).checked) {
                        wrong_count += 1;
                    }
                }
                Dom.clear("result_ul");
                if (wrong_count == 0) {
                    A("result_ul", E("li", null, "誤りが無かったため、訂正不要"));
                }
                else if (wrong_count == 1) {
                    A("result_ul", E("li", null, "1ビットの誤りが無事に訂正されている"));
                }
                else {
                    A("result_ul", E("li", null, "誤りが" + wrong_count + "ビットあったため、“誤りは高々1ビット”と仮定した誤り訂正手順の前提条件が成立しておらず、正しく訂正できなかった"));
                }
                return new SequentialAction(new FadeOut("message_window", 500), new FadeIn("result", 500), new FadeIn("result_ul", 500));
            });
        },
        function () { return new FadeIn("appendix1", 500); },
        function () {
            return new Calc(function () {
                calculate();
                return new FadeIn("appendix2", 500);
            });
        },
    ];
    var animator = null;
    var Animator = (function () {
        function Animator(scenario, progress_button, progress_slider) {
            var _this = this;
            this.scenario = scenario;
            this.progress_button = progress_button;
            this.progress_slider = progress_slider;
            this.progress = 0;
            this.animating = false;
            this.exec_next = function () {
                if (_this.animating && _this.progress >= 0) {
                    _this.set_progress(_this.progress);
                }
                if (_this.progress < _this.actions.length) {
                    _this.animating = true;
                    _this.actions[_this.progress].exec(_this.callback);
                }
                _this.progress++;
                _this.progress_slider.value = _this.progress.toString();
            };
            this.callback = function () {
                _this.animating = false;
            };
            this.slider_changed = function () {
                var progress = parseInt(_this.progress_slider.value);
                _this.set_progress(progress);
            };
            this.update_actions();
            this.progress_button.addEventListener("click", this.exec_next);
            this.progress_slider.max = this.actions.length.toString();
            this.progress_slider.addEventListener("change", this.slider_changed);
            this.set_progress(0);
        }
        Animator.prototype.update_actions = function () {
            var divs = document.getElementsByTagName("div");
            for (var i = 0; i < divs.length; i++) {
                divs[i].style.display = "";
            }
            this.actions = [];
            for (var i = 0; i < this.scenario.length; i++) {
                var action = this.scenario[i]();
                if (action instanceof Action) {
                    this.actions.push(action);
                }
                else {
                    for (var j = 0; j < action.length; j++) {
                        this.actions.push(action[j]);
                    }
                }
            }
            var td_r = get("received_table").getElementsByTagName("tr")[2].getElementsByTagName("td");
            for (var i = 1; i <= N; i++) {
                var circle = get("circle_" + i);
                var td = td_r[i - 1];
                var rect = td.getBoundingClientRect();
                //				circle.style.left = td.offsetLeft + "px";
                //				circle.style.top = td.offsetTop + "px";
                circle.style.left = Math.round(rect.left + rect.width / 2 - circle.offsetWidth / 2) + "px";
                circle.style.top = Math.round(rect.top + rect.height / 2 - circle.offsetHeight / 2) + "px";
            }
        };
        Animator.prototype.set_progress = function (progress) {
            fader.cancelAll();
            mover.cancelAll();
            for (var i = 0; i < this.actions.length; i++) {
                this.actions[i].undo();
            }
            if (progress > this.actions.length) {
                progress = this.actions.length;
            }
            this.progress = progress;
            for (var i = 0; i < progress; i++) {
                this.actions[i].skip();
            }
            this.progress_slider.value = this.progress.toString();
        };
        Animator.prototype.reset = function () {
            this.set_progress(this.progress);
        };
        return Animator;
    }());
    function join(list, connector) {
        if (connector == null) {
            connector = "";
        }
        var result = list[0].toString();
        for (var i = 1; i < list.length; i++) {
            result += connector + list[i].toString();
        }
        return result;
    }
    function sub_2() {
        return E("sub", null, "(2)");
    }
    function code() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var code_elem = E("code");
        for (var i = 0; i < args.length; i++) {
            A(code_elem, args[i]);
        }
        return code_elem;
    }
    function calculate() {
        var table = get("table");
        var td_is = get("元データ").getElementsByTagName("input");
        var td_rs = get("table").getElementsByTagName("tr")[2].getElementsByTagName("td");
        var math2 = get("math2");
        C(math2);
        /*
                let tds;
                for(let i = 0; i < M; i ++){
                    let tr_p = get("パリティ" + i + "_s");
                    tds = tr_p.children;
                    let p = 0;
                    for(let j = 1; j < tds.length; j ++){
                        let td = tds[j];
                        if(td.className == "データ"){
                            let input = td_is[j].firstChild as HTMLInputElement;
                            if(input.value == "1"){
                                Lib.Dom.setText(td, "1");
                                p ^= 1;
                            }else{
                                Lib.Dom.setText(td, "0");
                            }
                        }
                    }
                    for(let j = 1; j < tds.length; j ++){
                        let td = tds[j];
                        if(td.className == "パリティ"){
                            (td.firstChild as HTMLInputElement).nodeValue = p.toString();
                            (td_rs[j].firstChild as HTMLInputElement).nodeValue = p.toString();
                        }
                    }
                }
        */
        var m_x = [];
        for (var i = 1; i <= N - M; i++) {
            //			let input = td_is[i - 1] as HTMLInputElement;
            var input = get("data_" + i);
            if (input.value == "0") {
                m_x.push(0);
            }
            else {
                m_x.push(1);
            }
        }
        m_x = [m_x];
        var m_e = [];
        for (var i = 1; i <= N; i++) {
            var input = get("error_" + i);
            if (input.checked) {
                m_e.push(1);
            }
            else {
                m_e.push(0);
            }
        }
        m_e = [m_e];
        A(math2, "x = ", matrix_table(m_x), ", ");
        A(math2, "e = ", matrix_table(m_e), ", ");
        A(math2, E("br"));
        var m_H = [];
        for (var i = 0; i < M; i++) {
            var bit = Math.pow(2, M - i - 1);
            var line = [];
            for (var j = 1; j <= N; j++) {
                line.push(((j & bit) == 0) ? 0 : 1);
            }
            m_H.push(line);
        }
        var m_G = [];
        var b = 1;
        var k = 0;
        for (var i = 1; i <= N; i++) {
            var new_line = [];
            if (b == i) {
                var line = m_H[M - k - 1];
                var b2 = 1;
                for (var j = 1; j <= N; j++) {
                    if (b2 == j) {
                        b2 *= 2;
                    }
                    else {
                        new_line.push(line[j - 1]);
                    }
                }
                b *= 2;
                k += 1;
            }
            else {
                for (var j = 0; j < N - M; j++) {
                    if (j == i - k - 1) {
                        new_line.push(1);
                    }
                    else {
                        new_line.push(0);
                    }
                }
            }
            m_G.push(new_line);
        }
        m_G = transpose(m_G);
        var m_Y = multiply(m_x, m_G);
        A(math2, "Y = x × G = ", matrix_table(m_x), " × ", matrix_table(m_G), "=", matrix_table(m_Y), E("br"));
        var m_Yd = [];
        for (var i = 0; i < m_Y[0].length; i++) {
            m_Yd[i] = (m_Y[0][i] ^ m_e[0][i]);
        }
        m_Yd = [m_Yd];
        A(math2, "Y' = Y ⊕ e =", matrix_table(m_Y), "⊕", matrix_table(m_e), "=", matrix_table(m_Yd), E("br"));
        A(math2, "r = Y'× H", E("sup", null, "T"), " = ", matrix_table(m_Yd), "×", matrix_table(transpose(m_H)), "=", matrix_table(multiply(m_Yd, transpose(m_H))), E("br"));
        /*
        let td_es = get("通信エラー").children;
        let td_ms = get("受信結果").children;
        let td_cs = get("誤り訂正結果").children;
        
        if(!tds){
            return;
        }
        
        for(let j = 1; j < tds.length; j ++){
            if(td_is[j].firstChild != null){
                Lib.Dom.setText(td_rs[j], ((td_is[j].firstChild as HTMLInputElement).value == "0" ? "0" : "1"));
            }
            let value = (td_rs[j] as HTMLElement).innerText;
            if((td_es[j].firstChild as HTMLInputElement).checked){
                value = (value == "0" ? "1" : "0");
            }
            Lib.Dom.setText(td_ms[j], value);
        }
        */
        /*
        let errors = [];
        let num_errors = 0;
        for(let i = 0; i < M; i ++){
            let tr = get("パリティ" + i + "_r");
            let tds = tr.children;
            let p = 0;
            for(let j = 1; j < tds.length; j ++){
                if(tds[j].className == "データ"){
                    let value = (td_ms[j] as HTMLElement).innerText;
                    Lib.Dom.setText(tds[j], value);
                    if(value != "0"){
                        p ^= 1;
                    }
                }
            }
            let td_result = get("パリティ計算結果_" + i);
            if(p == 0){
                tr.className = "正常";
                errors[i] = false;
                Lib.Dom.setText(td_result, "1が偶数個");
            }else{
                tr.className = "エラー";
                errors[i] = true;
                Lib.Dom.setText(td_result, "1が奇数個");
                num_errors ++;
            }
        }
        let result = get("result");
        C(result);
        let bit_flipped = 0;
        if(num_errors == 0){
            A(result, "エラー無し。受信成功。");
            get("correction_explanation").style.display = "none";
        }else{
            A(result, "エラー有り。パリティかデータの内、", code("x"), " ビット目の1ビットだけ反転したと考えると、");
            get("correction_explanation").style.display = "";
            let ul = E("ul");
            for(let i = 0; i < M; i ++){
                let li = E("li");
                A(li, code("x"), " = ", code("" + make_digits(i, "1"), sub_2()), "ビット目の列にエラー");
                
                if(errors[i]){
                    A(li, E("span", { style : { color: "red" } }, "あり"));
                }else{
                    A(li, E("span", { style : { color: "blue" } }, "なし"));
                }
                A(li, "。すなわち、", code("x"), "を2進数で表記した時の下から", code((i + 1)), "桁目が", code("1"), "となる行にエラー");
                if(errors[i]){
                    A(li, "が", E("span", { style : { color: "red" } }, "ある"));
                }else{
                    A(li, "は", E("span", { style : { color: "blue" } }, "ない"));
                }
                A(li, "。よって、", code((i + 1)), "桁目は");
                if(errors[i]){
                    A(li, code("1"));
                }else{
                    A(li, code("0"));
                }
                A(li, "。");
                A(ul, li);
            }
            A(result, ul);
//			A(result, "の行が奇数個の", E("q", null, "1"), "を含んでおり、エラー。");
            
            A(result, "となり、以上" + M + "個の条件から、", code("x"), " = ");
            
            let code_elem = E("code");
            let code_str = "";
            let first = true;
            for(let i = 0; i < M; i ++){
                let num = "?";
                if(errors[i]){
                    bit_flipped += Math.pow(2, i);
                    if(!first){
                        A(code_elem, "+");
                    }else{
                        first = false;
                    }
                    A(code_elem, "2", E("sup", null, i));
                    code_str = "1" + code_str;
                }else{
                    code_str = "0" + code_str;
                }
            }
            A(result, code(code_str, sub_2()), " = " , code_elem, " = ", code(bit_flipped), "より、通信エラーは", E("q", null, "" + bit_flipped + "ビット目"), "で起きたと思われる。");
        }
        for(let j = 1; j < td_cs.length; j ++){
            let td = td_cs[j];
            let b = (td_ms[j] as HTMLElement).innerText;
            if(j == bit_flipped){
                b = (b == "0" ? "1" : "0");
                td.className = "訂正済み";
            }else{
                td.className = "";
            }
            Lib.Dom.setText(td, b);
        }
        */
    }
    function make_digits(n, d) {
        var str = "";
        for (var i = 0; i < M - n - 1; i++) {
            str += "?";
        }
        str += d;
        for (var i = 0; i < n; i++) {
            str += "?";
        }
        return str;
    }
    function multiply(m1, m2) {
        var result = [];
        for (var i = 0; i < m1.length; i++) {
            result[i] = [];
            for (var j = 0; j < m2[0].length; j++) {
                var sum = 0;
                for (var k = 0; k < m1[0].length; k++) {
                    sum += m1[i][k] * m2[k][j];
                }
                result[i][j] = sum % 2;
            }
        }
        return result;
    }
    function matrix_table(m) {
        var table = E("table", { className: "matrix" });
        for (var i = 0; i < m.length; i++) {
            var tr = E("tr");
            if (m.length == 1) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "1px 0px 1px 1px", width: "0.2em" } }));
            }
            else if (i == 0) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "1px 0px 0px 1px", width: "0.2em" } }));
            }
            else if (i == m.length - 1) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "0px 0px 1px 1px", width: "0.2em" } }));
            }
            else {
                A(tr, E("td", { className: "paren", style: { borderWidth: "0px 0px 0px 1px", width: "0.2em" } }));
            }
            for (var j = 0; j < m[i].length; j++) {
                A(tr, E("td", null, m[i][j]));
            }
            if (m.length == 1) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "1px 1px 1px 0px", width: "0.2em" } }));
            }
            else if (i == 0) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "1px 1px 0px 0px", width: "0.2em" } }));
            }
            else if (i == m.length - 1) {
                A(tr, E("td", { className: "paren", style: { borderWidth: "0px 1px 1px 0px", width: "0.2em" } }));
            }
            else {
                A(tr, E("td", { className: "paren", style: { borderWidth: "0px 1px 0px 0px", width: "0.2em" } }));
            }
            A(table, tr);
        }
        return table;
    }
    function transpose(m) {
        var result = [];
        for (var i = 0; i < m[0].length; i++) {
            result[i] = [];
            for (var j = 0; j < m.length; j++) {
                result[i][j] = m[j][i];
            }
        }
        return result;
    }
    //	let appendix_table: HTMLElement[] = [];
    function toggle(event) {
        var button = event.target;
        var target = get(button.dataset.target);
        var alt_mes = button.dataset.alt_mes;
        button.dataset.alt_mes = button.value;
        button.value = alt_mes;
        if (target.style.display == "none") {
            target.style.display = "block";
        }
        else {
            target.style.display = "none";
        }
    }
    function init() {
        messageWindow = new MessageWindow();
        get("RESET").addEventListener("click", reset, false);
        var elements = document.getElementsByClassName("toggle_disp");
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var child = element.firstChild;
            if (child != null) {
                var button = E("input", { type: "button", value: "説明の非表示", style: { float: "right", marginRight: "4em" } });
                var div = E("div", { id: "toggle_target_" + i }, button);
                while (child != null && child.nodeType != 1) {
                    child = child.nextSibling;
                }
                if (child != null) {
                    while (child.nextSibling != null) {
                        div.appendChild(child.nextSibling);
                    }
                }
                button.dataset.target = div.id;
                button.dataset.alt_mes = "説明の表示";
                button.addEventListener("click", toggle, false);
                element.insertBefore(button, element.firstChild);
                element.appendChild(div);
            }
        }
        /*		for(let i = 0; i < 3; i ++){
                    appendix_table[i] = get("appendix" + i);
                }
        */
        var navi = Dom.elem("div", { style: { position: "fixed", left: "0px", padding: "0.2em 1em", border: "2px solid rgba(80,80,80,0.5)", backgroundColor: "rgba(180,180,180,0.5)" } });
        progress_slider = Dom.input("range", { min: "0", max: "100", step: "1", style: { margin: "0 0.5em", width: "800px" } });
        progress_button = Dom.input("button", { value: "次へ" });
        A(navi, progress_slider, progress_button);
        A(document.body, navi);
        navi.style.left = Math.round((document.documentElement.clientWidth - navi.offsetWidth) / 2) + "px";
        navi.style.top = (document.documentElement.clientHeight - navi.offsetHeight) + "px";
        reset();
    }
    var progress_button;
    var progress_slider;
    //	let m_G: number[][];
    //	let m_H: number[][];
    function to_b(val, n) {
        var str = "";
        for (var i = n - 1; i >= 0; i--) {
            str += ((val & (1 << i)) == 0 ? "0" : "1");
        }
        return str;
    }
    /*
    function insertAfter(newNode: Node, node: Node | string){
        if(typeof(node) === "string"){
            node = get(node);
        }
        node.parentNode.insertBefore(newNode, node.nextSibling);
    }*/
    function TE(name, border, attributes) {
        var children = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            children[_i - 3] = arguments[_i];
        }
        return E(name, attributes, E.apply(void 0, ["div", { style: { border: border } }].concat(children)));
    }
    function create_mask_table(k) {
        var bit = Math.pow(2, M - k);
        var mask_name = "マスク " + k + ": 左から" + k + "ビット目が1の部分(";
        for (var i = 1; i <= M; i++) {
            if (i == k) {
                mask_name += "1";
            }
            else {
                mask_name += "?";
            }
        }
        mask_name += ")だけくりぬいたマスク";
        var tr1 = E("tr", { style: { backgroundColor: "transparent" } }, E("th", { style: { height: "2em", width: "auto", backgroundColor: "gray" }, colspan: (N + 1).toString() }, mask_name));
        var tr2 = E("tr", { style: { backgroundColor: "transparent" } }, TE("th", "none", { style: { backgroundColor: "gray" } }));
        var tr3 = E("tr", { style: { backgroundColor: "transparent" } }, TE("th", "none", { style: { backgroundColor: "gray" } }));
        var mask_table = E("table", { className: "parity", cellspacing: "0", style: { opacity: "0.95", backgroundColor: "transparent" } }, tr1, tr2, tr3);
        for (var j = 1; j <= N; j++) {
            A(tr2, E("th", { style: { backgroundColor: "gray" } }, j + " =", Dom.br(), to_b(j, M), sub_2()));
            if ((j & bit) == 0) {
                A(tr3, TE("td", "2px solid gray", { style: { backgroundColor: "gray" } }));
            }
            else {
                A(tr3, TE("td", "2px solid gray", { style: { backgroundColor: "transparent" } }));
            }
        }
        return mask_table;
    }
    function recalc() {
        if (animator) {
            animator.reset();
        }
    }
    function reset() {
        M = parseInt(get("M").value);
        if (M == 0) {
            M = 4;
        }
        N = Math.pow(2, M) - 1;
        var source_tr1 = E("tr");
        var source_tr2 = E("tr");
        for (var i = 1; i <= N - M; i++) {
            A(source_tr1, E("th", null, "データ " + i));
            A(source_tr2, E("td", null, Dom.input("text", { id: "data_" + i, size: "3", value: (Math.random() <= 0.5 ? "0" : "1") })));
        }
        var source_table = E("table", { id: "元データ" }, source_tr1, source_tr2);
        A("source_table_holder", source_table);
        var table = E("table", { id: "parity_table", className: "parity", cellspacing: "0" });
        C(table);
        var tr_b1 = E("tr", null, TE("td", "none"));
        var tr_h = E("tr", null, TE("th", "none", { style: {} }, "役割"));
        var tr_i = E("tr", { id: "元データ" }, TE("th", "none", { style: {} }, T("")));
        var data = [-1]; // starts with index = 1
        var d_i = 1;
        var p_i = 1;
        for (var i = 1; i <= N; i++) {
            if (i == p_i) {
                data.push(-1);
                p_i *= 2;
            }
            else {
                data.push(parseInt(get("data_" + d_i).value));
                d_i++;
            }
        }
        d_i = 1;
        p_i = 1;
        var p = M;
        for (var i = 1; i <= N; i++) {
            A(tr_b1, E("th", null, "" + i + " =", E("br"), to_b(i, M), sub_2() /*, E("br"), "ビット目"*/));
            var str = void 0;
            if (p_i == i) {
                str = "パリティ " + M;
                var value = 0;
                var d_i_tmp = 0;
                for (var j = 1; j <= N; j++) {
                    var className_p = void 0, className_rp = void 0;
                    if ((j & p_i) != 0) {
                        if (j != i) {
                            value = (value == data[j] ? 0 : 1);
                        }
                    }
                }
                tr_i.appendChild(TE("td", "5px solid blue", { id: "parity_" + p, style: { backgroundColor: "white", height: "2em" } }, value));
                p -= 1;
                p_i *= 2;
            }
            else {
                str = "データ " + d_i;
                var td = TE("td", "5px solid cyan", { style: { backgroundColor: "white", height: "2em" } }, data[i]);
                tr_i.appendChild(td);
                d_i += 1;
            }
            tr_h.appendChild(TE("td", "none", null, str));
        }
        table.appendChild(tr_b1);
        table.appendChild(tr_h);
        table.appendChild(tr_i);
        A("table", table);
        A("ready_table", Dom.clone(table, false));
        for (var i = 1; i <= M; i++) {
            var mask_table_dummy = create_mask_table(i);
            var mask_table = create_mask_table(i);
            mask_table.id = "mask_" + i;
            mask_table_dummy.style.visibility = "hidden";
            mask_table_dummy.style.position = "relative";
            mask_table.style.position = "absolute";
            mask_table.style.margin = "0px";
            var div = E("div", { style: {} }, mask_table_dummy, mask_table);
            A("mask", div);
            var rect = mask_table_dummy.getBoundingClientRect();
            mask_table.style.left = mask_table_dummy.offsetLeft + "px";
            mask_table.style.top = mask_table_dummy.offsetTop + "px";
        }
        var error_tr = E("tr", null, TE("th", "none", { style: { height: "1em" } }, "エラー"));
        var error_table = E("table", { className: "parity", cellspacing: "0" }, error_tr);
        for (var i = 1; i <= N; i++) {
            A(error_tr, TE("td", "1px solid #E7A3AE", { style: {}, onchange: recalc }, Dom.input("checkbox", { id: "error_" + i })));
        }
        A("error", error_table);
        var received_table = Dom.clone(table, false);
        received_table.id = "received_table";
        A("received_table_holder", received_table);
        Dom.clear("circles");
        for (var i = 1; i <= N; i++) {
            var circle = E("div", { id: "circle_" + i, style: { position: "absolute", fontSize: "300%", color: "lightGreen" } }, "○");
            A("circles", circle);
        }
        var result_tr = E("tr", null, TE("th", "none", { style: { height: "1em" } }, "結果"));
        var result_table = E("table", { id: "result_table", className: "parity", cellspacing: "0" }, result_tr);
        p_i = 1;
        for (var i = 1; i <= N; i++) {
            var border = void 0;
            if (i == p_i) {
                border = "5px solid blue";
                p_i *= 2;
            }
            else {
                border = "5px solid cyan";
            }
            var td = TE("td", border, { id: "result_" + i }, "");
            A(result_tr, td);
        }
        A("result_table_holder", result_table);
        animator = new Animator(scenario, progress_button, progress_slider);
        /*
        table.appendChild(E("tr", {className: "appendix"}, E("td", {colSpan: N + 2}, " ")));
        for(let i = 0; i < tr_ps.length; i ++){
            table.appendChild(tr_ps[i]);
        }
        table.appendChild(E("tr", {className: "appendix"}, E("td", {colSpan: N + 2}, " ")));
        table.appendChild(tr_r);

        let tr_a1 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[0]));
        let tr_a2 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[1]));
        let tr_a3 = E("tr", null, E("td", {colSpan: N + 2, className: "appendix"}, appendix_table[2]));
        
        table.appendChild(tr_a1);
        
        let tr_e = E("tr", {id: "通信エラー"}, E("th", null, T("通信エラー")));
        let tr_m = E("tr", {id: "受信結果"}, E("th", null, T("受信結果")));
        let tr_c = E("tr", {id: "誤り訂正結果"}, E("th", null, T("誤り訂正結果")));

        for(let i = 1; i <= N; i ++){
            let input = E("input", {type: "checkbox", value: "", id: "エラー" + i});
            input.addEventListener("change", calculate);
            tr_e.appendChild(E("td", null, input));
            tr_m.appendChild(E("td", null, T("?")));
            tr_c.appendChild(E("td", null, T("?")));
        }
        
        tr_a1.firstChild.appendChild(E("div", {style: { textAlign: "center" }}, "↓データの送信↓"));
        table.appendChild(tr_e);
        table.appendChild(E("tr", null, E("td", {colSpan : N + 2}, E("div", null, "↓データの送信↓"))));
        table.appendChild(tr_m);
        table.appendChild(tr_a2);
        
        for(let i = 0; i < tr_rps.length; i ++){
            table.appendChild(tr_rps[i]);
        }

        table.appendChild(tr_a3);
        table.appendChild(tr_c);

        table.appendChild(tr_b2);
        
        let math1 = get("math1");
        C(math1);
        m_H = [];
        for(let i = 0; i < M; i ++){
            let bit = Math.pow(2, M - i - 1);
            let line = [];
            for(let j = 1; j <= N; j ++){
                line.push(((j & bit) == 0) ? 0 : 1);
            }
            m_H.push(line);
        }
        
        m_G = [];
        let b = 1;
        let k = 0;
        for(let i = 1; i <= N; i ++){
            let new_line = [];
            if(b == i){
                let line = m_H[M - k - 1];
                let b2 = 1;
                for(let j = 1; j <= N; j ++){
                    if(b2 == j){
                        b2 *= 2;
                    }else{
                        new_line.push(line[j - 1]);
                    }
                }
                b *= 2;
                k += 1;
            }else{
                for(let j = 0; j < N - M; j ++){
                    if(j == i - k - 1){
                        new_line.push(1);
                    }else{
                        new_line.push(0);
                    }
                }
            }
            m_G.push(new_line);
        }
        m_G = transpose(m_G);
        
        A(math1, "H", E("sup", null, "T"), " = ", matrix_table(transpose(m_H)), ", ");
        A(math1, "H =", matrix_table(m_H), ", ");
        A(math1, "G =", matrix_table(m_G), ", ");
        A(math1, "H × G", E("sup", null, "T") ," =", matrix_table(multiply(m_H, transpose(m_G))), ", ");
        A(math1, "G × H", E("sup", null, "T") ," =", matrix_table(multiply(m_G, transpose(m_H))));
        }
        
        calculate();
        */
    }
    window.addEventListener("load", init, false);
})(Hamming || (Hamming = {}));
