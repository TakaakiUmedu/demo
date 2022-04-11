"use strict";
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
var Lib;
(function (Lib) {
    Lib.isTouchDevice = false;
    function setUserAgent() {
        if (window.ontouchstart) {
            Lib.isTouchDevice = true;
        }
    }
    /*
    export function cloneObject(obj: object): object{
        let ret = {};
        for(let name in obj){
            Object.defineProperty(ret, name, Object.getOwnPropertyDescriptor(obj, name));
        }
        return ret;
//		return Object.assign({}, obj);
    }
    */
    function toPx(val) {
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
    Lib.toPx = toPx;
    function cloneHash(src) {
        var ret = {};
        for (var name_1 in src) {
            ret[name_1] = src[name_1];
        }
        return ret;
    }
    Lib.cloneHash = cloneHash;
    var gDebgugWindow = null;
    function argumentsToMessage() {
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
    function debugOutput() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = argumentsToMessage(args);
        var pElement = document.createElement("p");
        pElement.appendChild(document.createTextNode(message));
        var debugWindowDiv = document.getElementById("debug_window");
        if (debugWindowDiv) {
            debugWindowDiv.appendChild(pElement);
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
            pElement.style.border = "0px";
            pElement.style.margin = "0px";
            pElement.style.padding = "0px";
            pElement.style.textIndent = "0px";
            gDebgugWindow.style.top = toPx(document.documentElement.scrollTop);
            if (gDebgugWindow.firstChild != null) {
                gDebgugWindow.insertBefore(pElement, gDebgugWindow.firstChild);
            }
            else {
                gDebgugWindow.appendChild(pElement);
            }
        }
    }
    Lib.debugOutput = debugOutput;
    function infoOutput() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var message = argumentsToMessage(args);
        var pElement = document.createElement("p");
        pElement.appendChild(document.createTextNode(message));
        var infoDiv = document.getElementById("info");
        if (infoDiv) {
            infoDiv.appendChild(pElement);
        }
        else {
            document.body.appendChild(pElement);
        }
    }
    Lib.infoOutput = infoOutput;
    function doNothing() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    }
    Lib.doNothing = doNothing;
    function setExecuteOnLoadHandler(eventName, target, handler) {
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
                target.removeEventListener(eventName, func, false);
            };
            target.addEventListener(eventName, func, false);
        }
    }
    function executeOnDomLoad(handler) {
        setExecuteOnLoadHandler("DOMContentLoaded", window, handler);
    }
    Lib.executeOnDomLoad = executeOnDomLoad;
    function executeOnLoad(handler, image) {
        if (image === undefined) {
            setExecuteOnLoadHandler("load", window, handler);
        }
        else {
            var newHandler_1 = handler;
            setExecuteOnLoadHandler("load", image, function () { newHandler_1(image); });
        }
    }
    Lib.executeOnLoad = executeOnLoad;
    function indexer() {
        var index = 0;
        return function () {
            return index++;
        };
    }
    Lib.indexer = indexer;
    function forEachRecursive(item, callback) {
        if (Array.isArray(item)) {
            for (var i = 0; i < item.length; i++) {
                forEachRecursive(item[i], callback);
            }
        }
        else {
            callback(item);
        }
    }
    Lib.forEachRecursive = forEachRecursive;
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
    function convertIfDefined(item, convert) {
        if (item === null || item === undefined) {
            return undefined;
        }
        else {
            return convert(item);
        }
    }
    Lib.convertIfDefined = convertIfDefined;
    function convertOrDefault(item, convert, defaultValue) {
        if (item === null || item === undefined) {
            return defaultValue;
        }
        else {
            return convert(item);
        }
    }
    Lib.convertOrDefault = convertOrDefault;
    setUserAgent();
})(Lib || (Lib = {}));
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom_tagnames.d.ts" />
///// <reference path="./mylib.html_element_map.ts" />
var Lib;
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom_tagnames.d.ts" />
///// <reference path="./mylib.html_element_map.ts" />
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
            setAttributess(element, attributes);
            add(element, args);
            return element;
        }
        Dom.elem = elem;
        function setAttributess(element, attributes) {
            if (attributes) {
                var aName = void 0;
                for (var aName_1 in attributes) {
                    var match = void 0;
                    if (aName_1 == "style") {
                        var style = attributes.style;
                        if (style) {
                            var sName = void 0;
                            for (sName in style) {
                                if (sName !== "length" && sName !== "parentRule") {
                                    element.style[sName] = style[sName];
                                }
                            }
                        }
                    }
                    else if (aName_1 == "dataset") {
                        var dataset = attributes.dataset;
                        if (dataset) {
                            for (var sName in dataset) {
                                element.dataset[sName] = dataset[sName];
                            }
                        }
                    }
                    else {
                        var attributesTmp = attributes;
                        var aValue = attributesTmp[aName_1];
                        if (aValue === undefined || aValue === null) {
                            continue;
                        }
                        if (aName_1 == "className") {
                            element.setAttribute("class", aValue.toString());
                        }
                        else if ((match = aName_1.match(/^on(.*)/))) {
                            var event_1 = match[1];
                            if (aValue instanceof Function) {
                                element.addEventListener(event_1, aValue);
                            }
                            else if (typeof (aValue) === "object" && aValue.hasOwnProperty("handleEvent")) {
                                element.addEventListener(event_1, aValue);
                            }
                            else {
                                throw "invalid event handler specified for \"" + aName_1 + "\"";
                            }
                        }
                        else {
                            element.setAttribute(aName_1, aValue.toString());
                        }
                    }
                }
            }
        }
        Dom.setAttributess = setAttributess;
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
            var firstRadio = null;
            var radios = [];
            var labels = [];
            var checked = false;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var value = void 0;
                var label = void 0;
                var additionalAttributess = void 0;
                if (typeof (item) === "string") {
                    value = label = item;
                    additionalAttributess = undefined;
                }
                else {
                    value = item.value;
                    if (item.label) {
                        label = item.label;
                    }
                    else {
                        label = value;
                    }
                    additionalAttributess = item.attributes;
                }
                var _a = Dom.radio(label, attributes), radio_1 = _a.radio, radioLabel = _a.label;
                radio_1.name = name;
                radio_1.value = value;
                setAttributess(radio_1, additionalAttributess);
                if (radio_1.checked) {
                    checked = true;
                }
                if (!firstRadio) {
                    firstRadio = radio_1;
                }
                radios.push(radio_1);
                labels.push(radioLabel);
            }
            if (!checked && firstRadio) {
                firstRadio.checked = true;
            }
            return { labels: labels, radios: radios };
        }
        Dom.radios = radios;
        function text(str) {
            return document.createTextNode(str.toString());
        }
        Dom.text = text;
        function getElement(id) {
            var element = document.getElementById(id);
            if (element) {
                return element;
            }
            else {
                throw "cannot find target with id \"" + id + "\"";
            }
        }
        Dom.getElement = getElement;
        function getFirstText(element) {
            var result = findFirstText(element);
            if (result) {
                return result;
            }
            else {
                throw "has no child";
            }
        }
        Dom.getFirstText = getFirstText;
        function prepareTarget(target) {
            if (target instanceof HTMLElement) {
                return target;
            }
            else {
                return getElement(target.toString());
            }
        }
        Dom.prepareTarget = prepareTarget;
        function addOne(element, item) {
            element.appendChild(item instanceof Node ? item : text(item));
        }
        function insertFirst(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var list = [];
            Lib.forEachRecursive(args, function (item) { return list.push(item); });
            var element = prepareTarget(target);
            for (var i = list.length - 1; i >= 0; i--) {
                element.insertBefore(toElement(list[i]), element.firstChild);
            }
        }
        Dom.insertFirst = insertFirst;
        function add(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var element = prepareTarget(target);
            Lib.forEachRecursive(args, function (item) { return addOne(element, item); });
        }
        Dom.add = add;
        function toElement(item) {
            if (item instanceof Node) {
                return item;
            }
            else {
                return text(item.toString());
            }
        }
        Dom.toElement = toElement;
        function clear(target) {
            var element = prepareTarget(target);
            var c;
            while (c = element.firstChild) {
                element.removeChild(c);
            }
        }
        Dom.clear = clear;
        function hasClass(target, value) {
            var element = prepareTarget(target);
            return element.className !== undefined && (" " + element.className + " ").indexOf(" " + value + " ") >= 0;
        }
        Dom.hasClass = hasClass;
        function addClass(target, value) {
            var element = prepareTarget(target);
            if (element.className === undefined || element.className == "") {
                return element.className = value;
            }
            else if (hasClass(element, value)) {
                return element.className;
            }
            else {
                return element.className += " " + value;
            }
        }
        Dom.addClass = addClass;
        function remove(target) {
            var parent = target.parentNode;
            if (parent) {
                parent.removeChild(target);
            }
        }
        Dom.remove = remove;
        function removeClass(target, value) {
            var element = prepareTarget(target);
            if (element.className === undefined || element.className == "") {
                return "";
            }
            else {
                var classNames = element.className.split(" ");
                var newClassNames = [];
                for (var i = 0; i < classNames.length; i++) {
                    var name_2 = classNames[i];
                    if (name_2.length > 0 && name_2 != value) {
                        newClassNames.push(name_2);
                    }
                }
                return element.className = newClassNames.join(" ");
            }
        }
        Dom.removeClass = removeClass;
        function forEachTag(element, name, func) {
            var children = element.getElementsByTagName(name);
            for (var i = 0; i < children.length; i++) {
                func(children[i]);
            }
        }
        Dom.forEachTag = forEachTag;
        function forEachNode(element, func) {
            if (func(element) === "break") {
                return false;
            }
            for (var child = element.firstChild; child != null; child = child.nextSibling) {
                if (forEachNode(child, func) == false) {
                    return false;
                }
            }
            return true;
        }
        Dom.forEachNode = forEachNode;
        function cloneNode(node) {
            if (node instanceof HTMLElement) {
                return clone(node);
            }
            else if (node instanceof Text) {
                return cloneText(node);
            }
            return null;
        }
        Dom.cloneNode = cloneNode;
        function cloneText(text) {
            return document.createTextNode(text.nodeValue || "");
        }
        Dom.cloneText = cloneText;
        function clone(element) {
            var newElement = elem(element.nodeName.toLowerCase());
            for (var i = 0; i < element.attributes.length; i++) {
                var attribute = element.attributes[i];
                if (attribute.name == "style") {
                    var subTable = element.style;
                    for (var sName in subTable) {
                        newElement.style[sName] = subTable[sName];
                    }
                }
                else {
                    var match = attribute.name.match(/^data-(.*)/);
                    if (match == null) {
                        newElement.setAttribute(attribute.name, attribute.value);
                    }
                }
            }
            for (var name_3 in element.dataset) {
                newElement.dataset[name_3] = element.dataset[name_3];
            }
            for (var child = element.firstChild; child != null; child = child.nextSibling) {
                if (child instanceof HTMLElement) {
                    newElement.appendChild(clone(child));
                }
                else if (child instanceof Text) {
                    newElement.appendChild(cloneText(child));
                }
            }
            return newElement;
        }
        Dom.clone = clone;
        function br() {
            return elem("br");
        }
        Dom.br = br;
        function canvas2D() {
            var canvas = elem("canvas");
            var context = canvas.getContext("2d");
            return { canvas: canvas, context: context };
        }
        Dom.canvas2D = canvas2D;
        var ElementWithText = (function () {
            function ElementWithText(element, text) {
                this.element = element;
                this.text = text;
                this.style = this.element.style;
            }
            ElementWithText.create = function (tagName, text, attributes) {
                var textNode = Dom.text(text);
                return new ElementWithText(elem(tagName, attributes, textNode), textNode);
            };
            ElementWithText.prototype.set = function (text) {
                this.text.nodeValue = text.toString();
            };
            ElementWithText.prototype.get = function () {
                return this.text.nodeValue || "";
            };
            return ElementWithText;
        }());
        Dom.ElementWithText = ElementWithText;
        function innerText(elem) {
            var text = "";
            forEachNode(elem, function (node) {
                if (node instanceof Text) {
                    text += node.nodeValue;
                }
            });
            return text;
        }
        Dom.innerText = innerText;
        function findFirstText(elem) {
            var text = null;
            forEachNode(elem, function (node) {
                if (node instanceof Text) {
                    text = node;
                    return "break";
                }
                else {
                    return;
                }
            });
            return text;
        }
        Dom.findFirstText = findFirstText;
        function setText(elem, value) {
            return forEachNode(elem, function (node) {
                if (node instanceof Text) {
                    node.nodeValue = value.toString();
                    return "break";
                }
                else {
                    return;
                }
            });
        }
        Dom.setText = setText;
        function findFirstTag(elem, name) {
            var nameUC = name.toUpperCase();
            var elem_found = null;
            forEachNode(elem, function (node) {
                if (node instanceof HTMLElement && node.tagName.toUpperCase() == nameUC) {
                    elem_found = node;
                    return "break";
                }
                else {
                    return;
                }
            });
            return elem_found;
        }
        Dom.findFirstTag = findFirstTag;
        function addEventListener(element, event, listener, useCapture) {
            element.addEventListener(event, listener, useCapture);
        }
        Dom.addEventListener = addEventListener;
        function setEventListeners(type, event_name, table, useCapture) {
            for (var id in table) {
                getSpecificTypeOfElement(type, id).addEventListener(event_name, table[id], useCapture);
            }
        }
        Dom.setEventListeners = setEventListeners;
        function getSpecificTypeOfElement(TYPE, id) {
            var element = getElement(id);
            if (element instanceof TYPE) {
                return element;
            }
            else {
                throw "element with id = " + id + " has invalid class";
            }
        }
        Dom.getSpecificTypeOfElement = getSpecificTypeOfElement;
        function getElementWithText(id) {
            var element = getElement(id);
            var text = getFirstText(element);
            return new ElementWithText(element, text);
        }
        Dom.getElementWithText = getElementWithText;
        function createItemTable(getFunction, ids) {
            var table = {};
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                table[id] = getFunction(id);
            }
            return table;
        }
        function getTexts() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return createItemTable(function (id) { return getFirstText(getElement(id)); }, idList);
        }
        Dom.getTexts = getTexts;
        function getElementsWithText() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return createItemTable(function (id) { return getElementWithText(id); }, idList);
        }
        Dom.getElementsWithText = getElementsWithText;
        function getSpecificTypeOfElements(idList, elementClass) {
            return createItemTable(function (id) { return getSpecificTypeOfElement(elementClass, id); }, idList);
        }
        Dom.getSpecificTypeOfElements = getSpecificTypeOfElements;
        function getElements() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLElement);
        }
        Dom.getElements = getElements;
        function getInputs() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLInputElement);
        }
        Dom.getInputs = getInputs;
        function getSelect() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLSelectElement);
        }
        Dom.getSelect = getSelect;
        function getOptions() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLOptionElement);
        }
        Dom.getOptions = getOptions;
        function getAnchors() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLAnchorElement);
        }
        Dom.getAnchors = getAnchors;
        function getCanvases() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getSpecificTypeOfElements(idList, HTMLCanvasElement);
        }
        Dom.getCanvases = getCanvases;
        function getCanvas2Ds() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return createItemTable(function (id) { return getCanvas2D(id); }, idList);
        }
        Dom.getCanvas2Ds = getCanvas2Ds;
        function getCanvas2D(id) {
            var canvas = getSpecificTypeOfElement(HTMLCanvasElement, id);
            var context = canvas.getContext("2d");
            return { canvas: canvas, context: context };
        }
        Dom.getCanvas2D = getCanvas2D;
    })(Dom = Lib.Dom || (Lib.Dom = {}));
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function bsearch(min, max, cond) {
        if (max < min) {
            return -1;
        }
        if (!cond(max)) {
            return -1;
        }
        while (min < max) {
            var mid = Math.floor((min + max) / 2);
            if (cond(mid)) {
                max = mid;
            }
            else {
                min = mid + 1;
            }
        }
        return min;
    }
    Lib.bsearch = bsearch;
})(Lib || (Lib = {}));
/// <reference path="./mylib.ts" />
var Lib;
/// <reference path="./mylib.ts" />
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
    function findRowToReplace(matrix, cols, i) {
        for (var j = i + 1; j < cols; j++) {
            if (matrix[j][i] != 0) {
                return j;
            }
        }
        return -1;
    }
    function gaussianElimination(matrix) {
        var rows = matrix.length;
        var cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (var i = 0; i < cols; i++) {
            if (matrix[i][i] == 0) {
                var r = findRowToReplace(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                var tmpRow = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmpRow;
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
    Lib.gaussianElimination = gaussianElimination;
    function findRowToReplaceForObj(matrix, cols, i) {
        for (var j = i + 1; j < cols; j++) {
            if (!matrix[j][i].isZero()) {
                return j;
            }
        }
        return -1;
    }
    function gaussianEliminationForObj(matrix, one) {
        var rows = matrix.length;
        var cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (var i = 0; i < cols; i++) {
            if (matrix[i][i].isZero()) {
                var r = findRowToReplaceForObj(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                var tmpRow = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmpRow;
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
    Lib.gaussianEliminationForObj = gaussianEliminationForObj;
    function SolveLinearEquation(equations, solver) {
        if (equations.length > 0) {
            var varList = [];
            var varCount = 0;
            for (var v in equations[0]) {
                if (v != "_") {
                    varList[varCount++] = v;
                }
            }
            if (varCount > equations.length) {
                return null;
            }
            var matrix = [];
            for (var i = 0; i < equations.length; i++) {
                var equation = equations[i];
                var line = [];
                for (var j = 0; j < varCount; j++) {
                    line.push(equation[varList[j]]);
                }
                line.push(equation["_"]);
                matrix.push(line);
            }
            if (solver(matrix)) {
                var solution = {};
                for (var j = 0; j < varCount; j++) {
                    solution[varList[j]] = matrix[j][varCount];
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
        return SolveLinearEquation(equations, function (matrix) { return gaussianEliminationForObj(matrix, one); });
    }
    Lib.solveLinearEquationVec = solveLinearEquationVec;
    function solveLinearEquation(equations) {
        return SolveLinearEquation(equations, gaussianElimination);
    }
    Lib.solveLinearEquation = solveLinearEquation;
    function outputMatrix(matrix) {
        for (var j = 0; j < matrix.length; j++) {
            var line = "";
            for (var k = 0; k < matrix[j].length; k++) {
                line += matrix[j][k] + ", ";
            }
            Lib.infoOutput(line);
        }
    }
    Lib.outputMatrix = outputMatrix;
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
                Lib.infoOutput(i + ": solved");
                Lib.infoOutput("[org]");
                for(let j = 0; j < size; j ++){
                    let line = "";
                    for(let k = 0; k < size ; k ++){
                        line += matrix_org[j][k] + ", "
                    }
                    Lib.infoOutput(line + matrix_org[j][size]);
                }
                Lib.infoOutput("[solved]");
                for(let j = 0; j < size; j ++){
                    let line = "";
                    for(let k = 0; k < size ; k ++){
                        line += matrix[j][k] + ", "
                    }
                    Lib.infoOutput(line + matrix[j][size]);
                }
                let error = 0;
                for(let j = 0; j < size; j ++){
                    let sum = 0;
                    for(let k = 0; k < size ; k ++){
                        sum += matrix_org[j][k] * matrix[k][size];
                    }
                    error += sum - matrix_org[j][size]
//					Lib.infoOutput("  " + sum + " = " + matrix_org[j][size]);
                }
                Lib.infoOutput("error :" + error);
                
                
            }else{
                Lib.infoOutput(i + ": not solved");
            }
        }
    }
    
    
    
*/
// Should not be used. Ineffective implementation and not tested weel.
/// <reference path="./mylib.algorithm.ts" />
/// <reference path="./mylib.linear_algebra.ts" />
var Lib;
(function (Lib) {
    var PRIME_TEST_COUNT = 20;
    var BigInteger = (function () {
        function BigInteger(parser, values, minus) {
            if (minus === void 0) { minus = false; }
            this.parser = parser;
            this.values = values;
            this.minus = minus;
            var index = this.values.length - 1;
            while (index > 0 && this.values[index] == 0) {
                this.values.pop();
                index--;
            }
        }
        BigInteger.prototype.toInteger = function () {
            if (this.minus) {
                if (this.comp(this.parser.MIN_SAFE_INTEGER) < 0) {
                    return undefined;
                }
            }
            else {
                if (this.comp(this.parser.MAX_SAFE_INTEGER) > 0) {
                    return undefined;
                }
            }
            return this.toNumber();
        };
        BigInteger.prototype.toNumber = function () {
            var ret = 0;
            for (var i = this.values.length - 1; i >= 0; i--) {
                ret = ret * this.parser.radix + this.values[i];
            }
            if (this.minus) {
                return -ret;
            }
            else {
                return ret;
            }
        };
        BigInteger.addRaw = function (d1, d2, radix) {
            var values = [];
            var rest = 0;
            var l1 = d1.length;
            var l2 = d2.length;
            var ls = l1 < l2 ? l1 : l2;
            var i = 0;
            while (i < ls) {
                var n = d1[i] + d2[i] + rest;
                if (n >= radix) {
                    values.push(n - radix);
                    rest = 1;
                }
                else {
                    values.push(n);
                    rest = 0;
                }
                i++;
            }
            while (i < l1) {
                var n = d1[i] + rest;
                if (n >= radix) {
                    values.push(n - radix);
                    rest = 1;
                }
                else {
                    values.push(n);
                    rest = 0;
                }
                i++;
            }
            while (i < l2) {
                var n = d2[i] + rest;
                if (n >= radix) {
                    values.push(n - radix);
                    rest = 1;
                }
                else {
                    values.push(n);
                    rest = 0;
                }
                i++;
            }
            if (rest > 0) {
                values.push(rest);
            }
            return values;
        };
        // require: d1 > d2
        BigInteger.subRaw = function (d1, d2, radix) {
            var values = [];
            var rest = 0;
            var l1 = d1.length;
            var l2 = d2.length;
            var i = 0;
            if (l2 > l1) {
                throw "BigInteger: fatal error";
            }
            while (i < l2) {
                var n = d1[i] - d2[i] - rest;
                if (n >= 0) {
                    values.push(n);
                    rest = 0;
                }
                else {
                    values.push(n + radix);
                    rest = 1;
                }
                i++;
            }
            while (i < l1) {
                var n = d1[i] - rest;
                if (n >= 0) {
                    values.push(n);
                    rest = 0;
                }
                else {
                    values.push(n + radix);
                    rest = 1;
                }
                i++;
            }
            if (rest != 0) {
                throw "BigInteger: fatal error";
            }
            return values;
        };
        BigInteger.prototype.getDigit = function (i) {
            if (i >= 0 && i < this.values.length) {
                return this.values[i];
            }
            else {
                return 0;
            }
        };
        BigInteger.prototype.neg = function () {
            if (this.isZero()) {
                return this;
            }
            else {
                return this.parser.construct(this.values, !this.minus);
            }
        };
        BigInteger.prototype.abs = function () {
            if (this.minus) {
                return this.parser.construct(this.values, false);
            }
            else {
                return this;
            }
        };
        BigInteger.prototype.add = function (num) {
            var val = this.parser.parse(num);
            if (this.minus && val.minus) {
                return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), true);
            }
            else if (this.minus) {
                return val.sub(this.neg());
            }
            else if (val.minus) {
                return this.sub(val.neg());
            }
            else {
                return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), false);
            }
        };
        BigInteger.prototype.sub = function (num) {
            var val = this.parser.parse(num);
            if (this.minus && val.minus) {
                // (-a) - (-b) = b - a
                return val.neg().sub(this.neg());
            }
            else if (this.minus) {
                return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), true);
            }
            else if (val.minus) {
                return this.parser.construct(BigInteger.addRaw(this.values, val.values, this.parser.radix), false);
            }
            else {
                if (this.comp(val) < 0) {
                    return val.sub(this).neg();
                }
                return this.parser.construct(BigInteger.subRaw(this.values, val.values, this.parser.radix), false);
            }
        };
        BigInteger.prototype.isZero = function () {
            return this.values.length == 1 && this.values[0] == 0;
        };
        BigInteger.prototype.comp = function (num) {
            var val = this.parser.parse(num);
            if (this.minus && val.minus) {
                return val.neg().comp(this.neg());
            }
            else if (this.minus) {
                return -1;
            }
            else if (val.minus) {
                return 1;
            }
            if (this.values.length > val.values.length) {
                return 1;
            }
            if (this.values.length < val.values.length) {
                return -1;
            }
            for (var i = this.values.length - 1; i >= 0; i--) {
                var d1 = this.values[i];
                var d2 = val.values[i];
                if (d1 > d2) {
                    return 1;
                }
                else if (d1 < d2) {
                    return -1;
                }
            }
            return 0;
        };
        BigInteger.prototype.mulOne = function (num) {
            var i = 0;
            var rest = 0;
            var values = [];
            var radix = this.parser.radix;
            var minus = this.minus;
            if (num < 0) {
                minus = !minus;
                num = -num;
            }
            while (i < this.values.length) {
                var n = this.getDigit(i) * num + rest;
                var m = n % radix;
                values.push(m);
                rest = (n - m) / radix;
                i++;
            }
            while (rest > 0) {
                var m = rest % radix;
                values.push(m);
                rest = (rest - m) / radix;
            }
            return this.parser.construct(values, minus);
        };
        BigInteger.prototype.mul = function (num) {
            if (typeof num === "number") {
                var minus = void 0;
                if (num < 0) {
                    num = -num;
                    minus = true;
                }
                else {
                    minus = false;
                }
                if (num < BigInteger.MAX_RADIX) {
                    var result = this.mulOne(num);
                    if (minus) {
                        result = result.neg();
                    }
                    return result;
                }
            }
            var val = this.parser.parse(num);
            var ret = this.parser.ZERO;
            for (var i = 0; i < val.values.length; i++) {
                var tmpValues = this.mulOne(val.getDigit(i)).values.concat();
                for (var j = 0; j < i; j++) {
                    tmpValues.unshift(0);
                }
                ret = ret.add(this.parser.construct(tmpValues, false));
            }
            if (this.minus !== val.minus) {
                ret = ret.neg();
            }
            return ret;
        };
        BigInteger.prototype.divmod = function (num) {
            var val = this.parser.parse(num);
            if (val.isZero()) {
                throw "this.constructor: error, divide by 0";
            }
            var rest = this;
            var res = [];
            var nMinus = rest.minus;
            var dMinus = val.minus;
            rest = rest.abs();
            val = val.abs();
            var i = 0;
            var tmp = val;
            while (true) {
                var tmp2 = this.parser.construct([0].concat(tmp.values), false);
                if (rest.comp(tmp2) < 0) {
                    break;
                }
                tmp = tmp2;
                i++;
            }
            while (true) {
                var n = tmp.values.length - 1;
                var d1 = rest.getDigit(n + 1) * this.parser.radix + rest.getDigit(n);
                var d2 = tmp.getDigit(n) + 1;
                var guess = Math.floor(d1 / d2);
                guess = Lib.bsearch(guess, this.parser.radix, function (n) {
                    //					loop_count ++;
                    return rest.comp(tmp.mulOne(n)) < 0;
                });
                guess--;
                res.unshift(guess);
                rest = rest.sub(tmp.mulOne(guess));
                if (val.values.length == tmp.values.length) {
                    break;
                }
                tmp = this.parser.construct(tmp.values.slice(1), false);
            }
            var quo = this.parser.construct(res, false);
            var rem = rest;
            if (nMinus != dMinus) {
                quo = quo.neg();
            }
            if (nMinus) {
                rem = rem.neg();
            }
            return { quo: quo, rem: rem };
        };
        BigInteger.prototype.div = function (num) {
            return this.divmod(num).quo;
        };
        BigInteger.prototype.mod = function (num) {
            return this.divmod(num).rem;
        };
        BigInteger.prototype.divmodOne = function (num) {
            if (num == 0) {
                throw "this.constructor: error, divide by 0";
            }
            var rest = 0;
            var res = [];
            for (var i = this.values.length - 1; i >= 0; i--) {
                var n = this.values[i] + rest * this.parser.radix;
                var m = n % num;
                res.unshift((n - m) / num);
                rest = m;
            }
            return { quo: this.parser.construct(res, false), rem: rest };
        };
        BigInteger.prototype.equals = function (num) {
            return this.comp(num) == 0;
        };
        BigInteger.prototype.pow = function (power, law) {
            var val = BigInteger.MaxRadixBin.parse(power);
            var res = this.parser.ONE;
            var n = this;
            if (law != undefined) {
                var lawVal = this.parser.parse(law);
                var i = 0;
                while (true) {
                    var bit = val.getBit(i);
                    if (bit === undefined) {
                        break;
                    }
                    if (bit == 1) {
                        res = res.mul(n).mod(lawVal);
                    }
                    n = n.mul(n).mod(lawVal);
                    i++;
                }
            }
            else {
                var i = 0;
                while (true) {
                    var bit = val.getBit(i);
                    if (bit === undefined) {
                        break;
                    }
                    if (bit == 1) {
                        res = res.mul(n);
                    }
                    n = n.mul(n);
                    i++;
                }
            }
            return res;
        };
        /*			shift(numBits: number): BigInteger{
                    return MaxRadixBin.parse(this).shift(numBits);
                }
        */
        BigInteger.prototype.isPrime = function () {
            var n = this;
            if (n.minus) {
                n = n.neg();
            }
            if (n.isZero()) {
                return false;
            }
            if (n.equals(this.parser.ONE)) {
                return false;
            }
            if (n.equals(this.parser.TWO)) {
                return true;
            }
            if (n.getBit(0) == 0) {
                return false;
            }
            var d = n.sub(this.parser.ONE);
            while (true) {
                var r = d.divmodOne(2);
                if (r.rem != 0) {
                    break;
                }
                d = r.quo;
            }
            var nM1 = n.sub(this.parser.ONE);
            var nM2 = n.sub(this.parser.TWO);
            for (var i = 0; i < PRIME_TEST_COUNT; i++) {
                var a = nM2.random().add(this.parser.ONE);
                var t = d;
                var y = a.pow(t, n);
                while (!t.equals(nM1) && !y.equals(this.parser.ONE) && !y.equals(nM1)) {
                    y = y.mul(y).mod(n);
                    t = t.mulOne(2);
                }
                if (!y.equals(nM1) && t.getBit(0) == 0) {
                    return false;
                }
            }
            return true;
        };
        BigInteger.prototype.random = function () {
            var rand = [];
            for (var i = 0; i < this.values.length; i++) {
                rand.push(Math.floor(Math.random() * this.parser.radix));
            }
            var result = this.mul(this.parser.construct(rand, false));
            return this.parser.construct(result.values.slice(this.values.length), false);
        };
        BigInteger.prototype.toString = function () {
            return BigInteger.MaxRadixDec.parse(this).toString();
        };
        BigInteger.prototype.gcm = function (num) {
            var a = this.abs();
            var b = this.parser.parse(num).abs();
            if (a.comp(b) < 0) {
                var tmp = b;
                b = a;
                a = tmp;
            }
            while (!b.isZero()) {
                var tmp = a.mod(b);
                a = b;
                b = tmp;
            }
            return a;
        };
        BigInteger.prototype.getBit = function (digit) {
            return BigInteger.MaxRadixBin.parse(this).getBit(digit);
        };
        return BigInteger;
    }());
    Lib.BigInteger = BigInteger;
    (function (BigInteger) {
        BigInteger.MAX_SAFE_INTEGER = Number["MAX_SAFE_INTEGER"] === undefined ? 9007199254740991 : Number["MAX_SAFE_INTEGER"];
        BigInteger.MIN_SAFE_INTEGER = Number["MIN_SAFE_INTEGER"] === undefined ? -9007199254740991 : Number["MIN_SAFE_INTEGER"];
        // (radix - 1) * (radix - 1) + (radix - 1) <= MAX_SAFE_INTEGER;
        // radix ^ 2 - 2 radix + 1 + radix - 1 <= MAX_SAFE_INTEGER;
        // radix ^ 2 - radix - MAX_SAFE_INTEGER <= 0;
        // radix <= (1 + Math.sqrt(1 + 4 MAX_SAFE_INTEGER)) / 2
        BigInteger.MAX_RADIX = Math.floor((1 + Math.sqrt(1 + 4 * BigInteger.MAX_SAFE_INTEGER)) / 2);
        ;
        function createRadixTable(base) {
            var table = {};
            var safeMax = Math.floor(BigInteger.MAX_RADIX / base);
            var radix = base;
            var digits = 1;
            while (radix < safeMax) {
                table[radix] = digits;
                radix *= base;
                digits++;
            }
            table[radix] = digits;
            return { table: table, maxDigits: digits };
        }
        var _a = createRadixTable(2), RADIX_TABLE_BIN = _a.table, MAX_DIGITS_BIN = _a.maxDigits;
        var _b = createRadixTable(10), RADIX_TABLE_DEC = _b.table, MAX_DIGITS_DEC = _b.maxDigits;
        var ValueBin = (function (_super) {
            __extends(ValueBin, _super);
            function ValueBin(parser, values, minus) {
                var _this = _super.call(this, parser, values, minus) || this;
                _this.parser = parser;
                return _this;
            }
            ValueBin.prototype.getBit = function (digit) {
                var bits = digit % this.parser.radixDigits;
                var index = (digit - bits) / this.parser.radixDigits;
                if (index >= this.values.length) {
                    return undefined;
                }
                else {
                    var val = this.values[index] >> bits;
                    if (index == this.values.length - 1 && val == 0) {
                        return undefined;
                    }
                    else {
                        return (val & 1) == 1 ? 1 : 0;
                    }
                }
            };
            return ValueBin;
        }(BigInteger));
        var ValueDec = (function (_super) {
            __extends(ValueDec, _super);
            function ValueDec(parser, values, minus) {
                var _this = _super.call(this, parser, values, minus) || this;
                _this.parser = parser;
                return _this;
            }
            ValueDec.formatDigit = function (digit, len) {
                var str = "" + digit;
                while (str.length < len) {
                    str = "0" + str;
                }
                return str;
            };
            ValueDec.prototype.toString = function () {
                var ret = "";
                if (this.minus) {
                    ret += "-";
                }
                var i = this.values.length - 1;
                ret += this.values[i--];
                var radixClass;
                var len = this.parser.radixDigits;
                while (i >= 0) {
                    ret += ValueDec.formatDigit(this.values[i], len);
                    i--;
                }
                return ret;
            };
            return ValueDec;
        }(BigInteger));
        var Parser = (function () {
            function Parser(radix) {
                this.radix = radix;
                this.ZERO = this.construct([0], false);
                this.ONE = this.construct([1], false);
                if (radix == 2) {
                    this.TWO = this.construct([0, 1], false);
                }
                else {
                    this.TWO = this.construct([2], false);
                }
                this.MAX_SAFE_INTEGER = this.parse(BigInteger.MAX_SAFE_INTEGER);
                this.MIN_SAFE_INTEGER = this.parse(BigInteger.MIN_SAFE_INTEGER);
                var parser = this;
                this.parser = function (source) {
                    return parser.parse(source);
                };
            }
            Parser.prototype.parse = function (src) {
                if (src instanceof BigInteger) {
                    if (src.parser.equals(this)) {
                        return src;
                    }
                    if (src.isZero()) {
                        return this.ZERO;
                    }
                    var values = [];
                    var tmp = src.minus ? src.neg() : src;
                    while (!tmp.isZero()) {
                        var divmod = tmp.divmodOne(this.radix);
                        values.push(divmod.rem);
                        tmp = divmod.quo;
                    }
                    return this.construct(values, src.minus);
                }
                else if (typeof src === "number") {
                    switch (src) {
                        case 0: return this.ZERO;
                        case 1: return this.ONE;
                        case 2: return this.TWO;
                    }
                    var minus = (src < 0);
                    var tmp = minus ? -src : src;
                    tmp = Math.ceil(tmp);
                    var values = [];
                    while (tmp > 0) {
                        var r = tmp % this.radix;
                        values.push(r);
                        tmp = (tmp - r) / this.radix;
                    }
                    return this.construct(values, minus);
                }
                else {
                    return this.parse(parseStringValue(src));
                }
            };
            Parser.prototype.equals = function (obj) {
                if (this === obj) {
                    return true;
                }
                if (obj instanceof Parser) {
                    return this.radix == obj.radix;
                }
                return false;
            };
            Parser.prototype.construct = function (values, minus) {
                return new BigInteger(this, values, minus);
            };
            return Parser;
        }());
        BigInteger.Parser = Parser;
        var ParserDec = (function (_super) {
            __extends(ParserDec, _super);
            function ParserDec(radixDigits) {
                var _this = _super.call(this, Math.pow(10, radixDigits)) || this;
                _this.radixDigits = radixDigits;
                return _this;
            }
            ParserDec.prototype.construct = function (values, minus) {
                return new ValueDec(this, values, minus);
            };
            return ParserDec;
        }(Parser));
        BigInteger.ParserDec = ParserDec;
        var ParserBin = (function (_super) {
            __extends(ParserBin, _super);
            function ParserBin(radixDigits) {
                var _this = _super.call(this, Math.pow(2, radixDigits)) || this;
                _this.radixDigits = radixDigits;
                return _this;
            }
            ParserBin.prototype.construct = function (values, minus) {
                return new ValueBin(this, values, minus);
            };
            return ParserBin;
        }(Parser));
        BigInteger.ParserBin = ParserBin;
        function cutLeadingZeros(str) {
            var match = str.match(/^0+/);
            if (match) {
                return str.substring(match[0].length);
            }
            else {
                return str;
            }
        }
        function parseStringValueWithRadix(parser, charRadix, radixDigits, src, minus) {
            var numStr = cutLeadingZeros(src);
            var values = [];
            while (true) {
                var len = numStr.length;
                if (len == 0) {
                    break;
                }
                var cut = len > radixDigits ? radixDigits : len;
                values.push(parseInt(numStr.substr(len - cut, cut), charRadix));
                numStr = numStr.substr(0, len - cut);
            }
            if (values.length == 0) {
                return parser.ZERO;
            }
            else if (values.length == 1) {
                if (values[0] == 0) {
                    return parser.ZERO;
                }
                else if (values[1] == 1) {
                    return parser.ONE;
                }
                else if (values[1] == 2) {
                    return parser.TWO;
                }
            }
            else if (parser.radix == 2 && values.length == 2 && values[0] == 0 && values[1] == 1) {
                return parser.TWO;
            }
            return parser.construct(values, minus);
        }
        function parseStringValue(src) {
            var srcTmp;
            var match;
            var minus;
            if (match = src.match(/^(-|\+)/)) {
                minus = (match[1] == "-");
                srcTmp = src.substring(1);
            }
            else {
                srcTmp = src;
                minus = false;
            }
            if (match = srcTmp.match(/^(\d+)$/)) {
                if (match = srcTmp.match(/^0([0-7]\d+)/)) {
                    return parseStringValueWithRadix(BigInteger.MaxRadixOct, 8, MAX_DIGITS_OCT, match[1], minus);
                }
                else {
                    return parseStringValueWithRadix(BigInteger.MaxRadixDec, 10, MAX_DIGITS_DEC, srcTmp, minus);
                }
            }
            else if (match = srcTmp.match(/^0x([0-9a-f]+)$/i)) {
                return parseStringValueWithRadix(BigInteger.MaxRadixHex, 16, MAX_DIGITS_HEX, match[1], minus);
            }
            else if (match = srcTmp.match(/^0b((?:0|1)+)$/i)) {
                return parseStringValueWithRadix(BigInteger.MaxRadixBin, 2, MAX_DIGITS_BIN, match[1], minus);
            }
            else if (match = srcTmp.match(/^(\d*)\.\d+$/)) {
                return parseStringValueWithRadix(BigInteger.MaxRadixDec, 10, MAX_DIGITS_DEC, match[1], minus);
            }
            else if (match = srcTmp.match(/^(\d*)\.(\d*)(?:e|E)(-|\+|)(\d+)$/)) {
                var numStr = match[1] + match[2];
                if (numStr.length > 0) {
                    var pow1 = match[2].length;
                    var pow2 = parseInt(match[4], 10);
                    if (match[3] == "-") {
                        pow2 = -pow2;
                    }
                    var pow = pow1 - pow2;
                    var value = parseStringValueWithRadix(BigInteger.MaxRadixDec, 10, MAX_DIGITS_DEC, numStr, minus);
                    if (pow > 0) {
                        return value.mul(BigInteger.MaxRadixDec.parse(10).pow(pow));
                    }
                    else if (pow < 0) {
                        return value.div(BigInteger.MaxRadixDec.parse(10).pow(-pow));
                    }
                    else {
                        return value;
                    }
                }
            }
            throw "invalid string : " + src;
        }
        var MAX_DIGITS_OCT = Math.floor(MAX_DIGITS_BIN / 3);
        var MAX_DIGITS_HEX = Math.floor(MAX_DIGITS_BIN / 4);
        function createParseFunction(radix) {
            var digits;
            if ((digits = RADIX_TABLE_BIN[radix]) != null) {
                return new ParserBin(digits).parser;
            }
            else if ((digits = RADIX_TABLE_DEC[radix]) != null) {
                return new ParserDec(digits).parser;
            }
            else {
                if (radix < 2) {
                    throw "invalid radix: " + radix;
                }
                if (radix > BigInteger.MAX_RADIX) {
                    throw "radix too large: " + radix;
                }
                return new Parser(radix).parser;
            }
        }
        BigInteger.createParseFunction = createParseFunction;
        function createParseFunctionDec(radixDigits) {
            return new ParserDec(radixDigits).parser;
        }
        BigInteger.createParseFunctionDec = createParseFunctionDec;
        function createParseFunctionBin(radixDigits) {
            return new ParserBin(radixDigits).parser;
        }
        BigInteger.createParseFunctionBin = createParseFunctionBin;
        BigInteger.MaxRadixBin = new BigInteger.ParserBin(MAX_DIGITS_BIN);
        BigInteger.MaxRadixOct = new BigInteger.ParserBin(MAX_DIGITS_OCT * 3);
        BigInteger.MaxRadixHex = new BigInteger.ParserBin(MAX_DIGITS_HEX * 4);
        BigInteger.MaxRadixDec = new BigInteger.ParserDec(MAX_DIGITS_DEC);
        BigInteger.MaxRadix = new BigInteger.Parser(BigInteger.MAX_RADIX);
        BigInteger.Default = BigInteger.MaxRadix;
        BigInteger.ZERO = BigInteger.Default.ZERO;
        BigInteger.ONE = BigInteger.Default.ONE;
        BigInteger.TWO = BigInteger.Default.TWO;
        BigInteger.parse = BigInteger.Default.parser;
        BigInteger.parser = BigInteger.Default.parser;
    })(BigInteger = Lib.BigInteger || (Lib.BigInteger = {}));
})(Lib || (Lib = {}));
/// <reference path="./mylib.biginteger.ts"/>
/// <reference path="./mylib.linear_algebra.ts" />
var Lib;
/// <reference path="./mylib.biginteger.ts"/>
/// <reference path="./mylib.linear_algebra.ts" />
(function (Lib) {
    var BigInteger = Lib.BigInteger;
    //	export function Rational(source: Rational.Source): Rational.Rational{
    //		return Rational.Rational.parse(source);
    //	}
    var Rational = (function () {
        function Rational(num, den) {
            this.num = num;
            this.den = den;
            this.minus = num.minus;
            /*
                        if(den.minus){
                            throw "ERROR: negative denominator: " + den;
                        }
            */
        }
        Rational.construct = function (num, den) {
            if (den.isZero()) {
                throw "divide by zero";
            }
            if (num.isZero()) {
                return Rational.ZERO;
            }
            var gcm = num.gcm(den);
            if (!gcm.equals(BigInteger.ONE)) {
                num = num.div(gcm);
                den = den.div(gcm);
            }
            return new Rational(num, den);
        };
        Rational.parse = function (num, den) {
            if (den === undefined) {
                if (num instanceof Rational) {
                    return num;
                }
                else if (num instanceof BigInteger) {
                    return Rational.construct(num, BigInteger.ONE);
                }
                else {
                    var numStr = void 0;
                    if (typeof num === "number") {
                        numStr = num.toString();
                    }
                    else {
                        numStr = num;
                    }
                    var match = void 0;
                    try {
                        if (match = numStr.match(/^(.+)\/([^\/]+)$/)) {
                            return Rational.parse(match[1]).div(Rational.parse(match[2]));
                        }
                        else if (match = numStr.match(/^(-|\+|)(\d*)\.(\d*)(?:(?:e|E)((?:-|\+|)\d+))?$/)) {
                            numStr = match[2] + match[3];
                            if (numStr.length > 0) {
                                var pow = -match[3].length;
                                if (!(match[4] === undefined)) {
                                    pow += parseInt(match[4], 10);
                                }
                                var num_1 = BigInteger.parse(numStr);
                                if (match[1] == "-") {
                                    num_1 = num_1.neg();
                                }
                                if (pow < 0) {
                                    return Rational.construct(num_1, BigInteger.parse(10).pow(-pow));
                                }
                                else if (pow > 0) {
                                    return Rational.construct(num_1.mul(BigInteger.parse(10).pow(pow)), BigInteger.ONE);
                                }
                                else {
                                    return Rational.construct(num_1, BigInteger.ONE);
                                }
                            }
                        }
                        else {
                            return Rational.construct(BigInteger.parse(numStr), BigInteger.ONE);
                        }
                    }
                    catch (e) {
                        throw "invalid argument for new Rational() : " + numStr + " (" + e + ")";
                    }
                    throw "invalid argument for new Rational() : " + numStr;
                }
            }
            else if (num instanceof Rational) {
                return num.div(den);
            }
            else if (den instanceof Rational) {
                return Rational.parse(num).div(den);
            }
            else {
                var numRa = Rational.parse(num);
                var denRa = Rational.parse(den);
                return numRa.div(denRa);
            }
        };
        Rational.prototype.toString = function () {
            var ret = this.num.toString();
            if (!this.den.equals(BigInteger.ONE)) {
                ret += "/" + this.den.toString();
            }
            return ret;
        };
        Rational.prototype.toRealString = function () {
            return this.toString();
        };
        Rational.prototype.toNumber = function () {
            var num = this.num;
            var den = this.den;
            var ratio = 1;
            var minus = 1;
            if (num.minus) {
                minus = -1;
                num = num.neg();
            }
            var div;
            while (true) {
                div = num.divmod(den);
                if (div.quo.comp(BigInteger.MAX_SAFE_INTEGER) > 0) {
                    break;
                }
                if (div.rem.isZero()) {
                    break;
                }
                num = num.mul(10);
                ratio *= 10;
            }
            return minus * div.quo.toNumber() / ratio;
        };
        Rational.prototype.toAccurateDecimalString = function () {
            var den = this.den;
            var count_2 = 0;
            var count_5 = 0;
            while (!den.equals(BigInteger.ONE)) {
                var div = den.divmod(2);
                if (!div.rem.isZero()) {
                    break;
                }
                den = div.quo;
                count_2 += 1;
            }
            while (!den.equals(BigInteger.ONE)) {
                var div = den.divmod(5);
                if (!div.rem.isZero()) {
                    break;
                }
                den = div.quo;
                count_5 += 1;
            }
            if (!den.equals(BigInteger.ONE)) {
                return null;
            }
            var num = this.num;
            if (count_2 > 0 || count_5 > 0) {
                var count_10 = void 0;
                if (count_2 == count_5) {
                    count_10 = count_2;
                }
                else if (count_2 > count_5) {
                    count_10 = count_2;
                    num = num.mul(BigInteger.parse(5).pow(count_2 - count_5));
                }
                else {
                    count_10 = count_5;
                    num = num.mul(BigInteger.parse(2).pow(count_5 - count_2));
                }
                return Rational.shiftPeriod(num.toString(), count_10);
            }
            else {
                return num.toString();
            }
        };
        Rational.shiftPeriod = function (str, shift) {
            var pos = str.length - shift;
            return str.substr(0, pos) + "." + str.substr(pos);
        };
        Rational.prototype.floor = function () {
            return this.num.div(this.den);
        };
        Rational.prototype.round = function (digits) {
            if (this.den.equals(BigInteger.ONE)) {
                return this.num.toString();
            }
            var ret;
            var num;
            if (this.num.minus) {
                ret = "-";
                num = this.num.neg();
            }
            else {
                ret = "";
                num = this.num;
            }
            if (num.comp(this.den) < 0) {
                ret += "0.";
                var quo = BigInteger.ZERO;
                ;
                var div = void 0;
                while (true) {
                    var div_1 = num.mulOne(10).divmod(this.den);
                    if (div_1.rem.isZero()) {
                        quo = quo.mulOne(10).add(div_1.quo);
                        break;
                    }
                    if (quo.toString().length == digits) {
                        if (div_1.rem.comp(5) >= 0) {
                            quo = quo.add(BigInteger.ONE);
                        }
                        break;
                    }
                    num = div_1.rem;
                    quo = quo.mulOne(10).add(div_1.quo);
                    if (quo.isZero()) {
                        ret += "0";
                    }
                }
                return ret + quo.toString();
            }
            else {
                var _a = num.divmod(this.den), rem = _a.rem, quo = _a.quo;
                var shift = 0;
                while (true) {
                    var div = rem.mul(10).divmod(this.den);
                    quo = quo.mulOne(10).add(div.quo);
                    shift++;
                    if (div.rem.isZero()) {
                        return ret + Rational.shiftPeriod(quo.toString(), shift);
                    }
                    if (shift == digits + 1) {
                        break;
                    }
                    rem = div.rem;
                }
                var divOne = quo.divmodOne(10);
                quo = divOne.quo;
                if (divOne.rem >= 5) {
                    quo = quo.add(BigInteger.ONE);
                }
                return ret + Rational.shiftPeriod(quo.toString(), shift - 1);
            }
        };
        Rational.prototype.neg = function () {
            return new Rational(this.num.neg(), this.den);
        };
        Rational.prototype.abs = function () {
            if (this.minus) {
                return this.neg();
            }
            return this;
        };
        Rational.prototype.add = function (value) {
            var number = Rational.parse(value);
            var gcm = this.den.gcm(number.den);
            var denL = this.den.div(gcm);
            var denR = number.den.div(gcm);
            var numL = this.num.mul(denR);
            var numR = number.num.mul(denL);
            var num = numL.add(numR);
            var den = this.den.mul(denR);
            return new Rational(num, den);
        };
        Rational.prototype.sub = function (value) {
            return this.add(Rational.parse(value).neg());
        };
        Rational.prototype.comp = function (value) {
            var diff = this.add(Rational.parse(value).neg());
            if (diff.isZero()) {
                return 0;
            }
            else if (diff.minus) {
                return -1;
            }
            else {
                return 1;
            }
        };
        Rational.prototype.mul = function (number) {
            var pair = number instanceof Rational ? number : Rational.parse(number);
            var num1 = this.num, den1 = this.den;
            var num2 = pair.num, den2 = pair.den;
            var gcm1 = num1.gcm(den2);
            if (!gcm1.equals(BigInteger.ONE)) {
                num1 = num1.div(gcm1);
                den2 = den2.div(gcm1);
            }
            var gcm2 = den1.gcm(num2);
            if (!gcm2.equals(BigInteger.ONE)) {
                den1 = den1.div(gcm2);
                num2 = num2.div(gcm2);
            }
            return Rational.construct(num1.mul(num2), den1.mul(den2));
        };
        Rational.prototype.div = function (number) {
            return this.mul(Rational.parse(number).inv());
        };
        Rational.prototype.inv = function () {
            if (this.num.isZero()) {
                throw "divide by zero";
            }
            if (this.num.minus) {
                return new Rational(this.den.neg(), this.num.neg());
            }
            else {
                return new Rational(this.den, this.num);
            }
        };
        Rational.prototype.isZero = function () {
            return this.num.isZero();
        };
        Rational.prototype.equals = function (number) {
            if (this === number) {
                return true;
            }
            var numRa = Rational.parse(number);
            return this.num.equals(numRa.num) && this.den.equals(numRa.den);
        };
        return Rational;
    }());
    Lib.Rational = Rational;
    (function (Rational) {
        Rational.ZERO = new Rational(BigInteger.ZERO, BigInteger.ONE);
        Rational.ONE = new Rational(BigInteger.ONE, BigInteger.ONE);
        Rational.parseer = Rational.parse;
        //		export const parse = Rational.parse;
    })(Rational = Lib.Rational || (Lib.Rational = {}));
})(Lib || (Lib = {}));
/// <reference path="../script/mylib.ts"/>
/// <reference path="../script/mylib.dom.ts"/>
/// <reference path="../script/mylib.biginteger.ts"/>
/// <reference path="../script/mylib.rational.ts"/>
var TradingCards;
/// <reference path="../script/mylib.ts"/>
/// <reference path="../script/mylib.dom.ts"/>
/// <reference path="../script/mylib.biginteger.ts"/>
/// <reference path="../script/mylib.rational.ts"/>
(function (TradingCards) {
    var Dom = Lib.Dom;
    var BigInteger = Lib.BigInteger.Default;
    var Rational = Lib.Rational;
    var Main = (function () {
        function Main() {
            var _this = this;
            this.elems = Dom.getElements("result", "resume_column");
            this.texts = Dom.getTexts("progress", "expectation");
            this.inputs = Dom.getInputs("start", "stop", "total", "targets", "resume");
            this.presenter = new ResultPresenter(this.elems.result, this.texts.progress, this.texts.expectation);
            this.state = "not_started";
            this.calculator = null;
            this.start = function () {
                if (_this.state == "not_started" || _this.state == "stopped") {
                    //				if(this.calculator){
                    //					return;
                    //				}
                    _this.presenter.clear();
                    _this.calculator = new Calculator(parseInt(_this.inputs.total.value), parseInt(_this.inputs.targets.value), _this.presenter, _this.stopped);
                    _this.inputs.stop.disabled = false;
                    _this.inputs.start.disabled = true;
                    _this.inputs.resume.disabled = true;
                    _this.state = "calculating";
                }
            };
            this.resume = function () {
                if (_this.state = "stopped") {
                    if (_this.calculator) {
                        _this.calculator.resume();
                    }
                    _this.inputs.stop.disabled = false;
                    _this.inputs.start.disabled = true;
                    _this.inputs.resume.disabled = true;
                    _this.state = "calculating";
                }
            };
            this.stop = function () {
                if (_this.state == "calculating") {
                    if (_this.calculator) {
                        _this.calculator.stop();
                    }
                    _this.inputs.stop.disabled = true;
                }
            };
            this.stopped = function () {
                if (_this.state == "calculating") {
                    _this.elems.resume_column.style.display = "";
                    _this.inputs.stop.disabled = true;
                    _this.inputs.start.disabled = false;
                    _this.inputs.resume.disabled = false;
                    _this.state = "stopped";
                }
            };
            Dom.addEventListener(this.inputs.start, "click", this.start);
            Dom.addEventListener(this.inputs.stop, "click", this.stop);
            Dom.addEventListener(this.inputs.resume, "click", this.resume);
            this.presenter.draw_graph();
        }
        Main.initialize = function () {
            new Main();
        };
        return Main;
    }());
    var ResultPresenter = (function () {
        function ResultPresenter(result, progress, expectation) {
            var _this = this;
            this.result = result;
            this.progress = progress;
            this.expectation = expectation;
            this.canvas = Dom.getCanvas2D("graph");
            this.MARGIN = 20;
            this.FONT_MARGIN = 20;
            this.FONT_SIZE = 16;
            this.AXIS_MARGIN = 20;
            this.resized = function () {
                _this.draw_graph();
            };
            window.addEventListener("resize", this.resized);
            this.clear();
            Dom.add(this.result, Dom.elem("tr", null, Dom.elem("td", null, "0"), Dom.elem("td", null, "0")));
        }
        ResultPresenter.prototype.clear = function () {
            Dom.clear(this.result);
            this.prev = { x: 0, y: 0 };
            this.list = [];
            this.important_list = [];
            this.draw_graph();
        };
        ResultPresenter.prototype.draw_graph = function () {
            var _this = this;
            var x_max = this.list.length > 0 ? this.list[this.list.length - 1].x : 1;
            this.canvas.canvas.width = this.canvas.canvas.offsetWidth;
            this.canvas.canvas.height = this.canvas.canvas.offsetHeight;
            var canvas_w = this.canvas.canvas.width;
            var canvas_h = this.canvas.canvas.height;
            this.canvas.context.clearRect(0, 0, canvas_w, canvas_h);
            var w = canvas_w - this.MARGIN * 2 - this.FONT_MARGIN - this.AXIS_MARGIN;
            var h = canvas_h - this.MARGIN * 2 - this.FONT_MARGIN - this.AXIS_MARGIN;
            var calc_xy = function (x, y) {
                return { x: x * w / x_max + _this.MARGIN + _this.FONT_MARGIN, y: canvas_h - y * h - _this.MARGIN - _this.FONT_MARGIN };
            };
            var xy;
            if (this.list.length > 0) {
                this.canvas.context.lineWidth = 2;
                this.canvas.context.beginPath();
                xy = calc_xy(this.list[0].x, this.list[0].y);
                this.canvas.context.moveTo(xy.x, xy.y);
                for (var i = 1; i < this.list.length; i++) {
                    xy = calc_xy(this.list[i].x, this.list[i].y);
                    this.canvas.context.lineTo(xy.x, xy.y);
                }
                this.canvas.context.stroke();
            }
            var zero = calc_xy(0, 0);
            var max = calc_xy(x_max, 1);
            this.canvas.context.lineWidth = 1;
            this.canvas.context.beginPath();
            this.canvas.context.moveTo(zero.x, max.y - this.AXIS_MARGIN);
            this.canvas.context.lineTo(zero.x, zero.y);
            this.canvas.context.lineTo(max.x + this.AXIS_MARGIN, zero.y);
            this.canvas.context.stroke();
            this.canvas.context.font = this.FONT_SIZE.toString() + "px 'sans-serif'";
            var prev_text_l = canvas_w + this.FONT_MARGIN;
            var prev_text_b = -this.FONT_MARGIN;
            for (var i = this.important_list.length - 1; i >= 0; i--) {
                xy = calc_xy(this.important_list[i].x, this.important_list[i].y);
                this.canvas.context.beginPath();
                this.canvas.context.moveTo(zero.x, xy.y);
                this.canvas.context.lineTo(xy.x, xy.y);
                this.canvas.context.lineTo(xy.x, zero.y);
                this.canvas.context.stroke();
                var y_str = this.important_list[i].s;
                var text_t = xy.y + this.FONT_SIZE / 2;
                if (text_t > prev_text_b) {
                    this.canvas.context.textAlign = "right";
                    this.canvas.context.textBaseline = "middle";
                    this.canvas.context.fillText(y_str, zero.x, xy.y);
                    prev_text_b = text_t + this.FONT_SIZE;
                    ;
                }
                var text_w = this.canvas.context.measureText(y_str).width;
                var text_r = xy.x + text_w;
                if (text_r < prev_text_l) {
                    this.canvas.context.textAlign = "center";
                    this.canvas.context.textBaseline = "top";
                    this.canvas.context.fillText(this.important_list[i].x.toString(), xy.x, zero.y);
                    prev_text_l = text_r - text_w;
                }
            }
        };
        ResultPresenter.prototype.add_point = function (x, y, draw, expectation) {
            this.progress.nodeValue = draw.toString() + "枚買った結果";
            this.expectation.nodeValue = expectation.round(1);
            this.list.push({ x: x, y: y });
            this.draw_graph();
        };
        ResultPresenter.prototype.add_inportant_point = function (x, y, s, l) {
            this.important_list.push({ x: x, y: y, s: s, l: l });
            Dom.add(this.result, Dom.elem("tr", null, Dom.elem("td", null, x), Dom.elem("td", null, l)));
        };
        return ResultPresenter;
    }());
    var Calculator = (function () {
        function Calculator(total, targets, presenter, stopped) {
            var _this = this;
            this.total = total;
            this.targets = targets;
            this.presenter = presenter;
            this.stopped = stopped;
            this.p_list = [
                Rational.parse("0.5"),
                Rational.parse("0.6"),
                Rational.parse("0.7"),
                Rational.parse("0.8"),
                Rational.parse("0.9"),
                Rational.parse("0.95"),
                Rational.parse("0.96"),
                Rational.parse("0.97"),
                Rational.parse("0.98"),
                Rational.parse("0.99"),
                Rational.parse("0.999"),
                Rational.parse("0.9999"),
            ];
            this.p_list_index = 0;
            this.pre_p = Rational.ZERO;
            this.expectation = Rational.ZERO;
            this.stopping = false;
            this.cache = [];
            this.calc_next = function () {
                if (_this.stopping) {
                    _this.stopped();
                    _this.stopping = false;
                    return;
                }
                var p = Rational.parse(_this.f(_this.total, _this.targets, _this.draw), BigInteger.parse(_this.total).pow(_this.draw));
                var cur_p = p.sub(_this.pre_p);
                _this.expectation = _this.expectation.add(cur_p.mul(_this.draw));
                _this.pre_p = p;
                console.log("[" + _this.draw + "] : " + _this.expectation + ", " + p.toNumber() + "");
                var resume_flag = _this.plot(_this.draw, p);
                _this.draw += 1;
                if (resume_flag) {
                    setTimeout(_this.calc_next, 0);
                }
                else {
                    _this.stopped();
                }
            };
            this.draw = this.targets;
            this.calc_next();
        }
        Calculator.prototype.rationalToString = function (p) {
            var str = Math.round(p.mul(1000).toNumber()).toString();
            if (str === "1000" || str == "999") {
                var d = BigInteger.parse(1000);
                while (true) {
                    var tmp = p.mul(d).floor();
                    if (!tmp.equals(d.sub(BigInteger.ONE))) {
                        str = tmp.toString() + "...";
                        break;
                    }
                    d = d.mul(10);
                }
                return { l: str.substr(0, 2) + "." + str.substr(2), s: "99.9..." };
            }
            else {
                var l = str.length;
                var label = str.substr(0, l - 1) + "." + str.substr(l - 1);
                return { l: label, s: label };
            }
        };
        Calculator.prototype.plot = function (x, y) {
            if (this.p_list[this.p_list_index].comp(y) <= 0) {
                var labels = this.rationalToString(y);
                this.presenter.add_inportant_point(x, y.toNumber(), labels.s, labels.l);
                this.p_list_index++;
            }
            this.presenter.add_point(x, y.toNumber(), this.draw, this.expectation);
            if (this.p_list_index >= this.p_list.length) {
                return false;
            }
            else {
                return true;
            }
        };
        Calculator.prototype.stop = function () {
            this.stopping = true;
        };
        Calculator.P = function (n, m) {
            var a = BigInteger.ONE;
            while (m > 0) {
                a = a.mul(n);
                n -= 1;
                m -= 1;
            }
            return a;
        };
        //# 1～n で構成された長さdの配列うち、1～cを1回以上含むものの数
        Calculator.prototype.f = function (n, c, d) {
            var cache_n = this.cache[n];
            if (cache_n === undefined) {
                this.cache[n] = cache_n = [];
            }
            var cache_n_c = cache_n[c];
            if (cache_n_c === undefined) {
                cache_n[c] = cache_n_c = [];
            }
            var cache_n_c_d = cache_n_c[d];
            if (cache_n_c_d !== undefined) {
                return cache_n_c_d;
            }
            else {
                var count = void 0;
                if (c > d) {
                    //# 含む物の数の方が多い = 存在しない
                    count = BigInteger.ZERO;
                }
                else if (d == 0) {
                    //# 0枚引く = 引かない = 1通り
                    count = BigInteger.ONE;
                }
                else if (c == 0) {
                    //# 1～0 を含む = 何も含まなくても良い
                    count = BigInteger.parse(n).pow(d);
                }
                else if (d == 1) {
                    //# (c == 1 確定)
                    //# {1}の1種類のみ
                    count = BigInteger.ONE;
                }
                else if (n == 1) {
                    //# {1}の一種類のみ
                    count = BigInteger.ONE;
                }
                else if (c == d) {
                    //# 1～c を含む長さcの配列 = 1～cの順列
                    count = Calculator.P(c, d);
                }
                else {
                    //# 前から d - 1 個目までの配列が
                    //# 1 ～ cの全てを含む場合 * n
                    //# 1 ～ cの内、kを含まない場合 * c
                    count = this.f(n, c, d - 1).mul(n).add(this.f(n - 1, c - 1, d - 1).mul(c));
                }
                //#		print "f(#{n},#{c},#{d}) = #{cache_n_c_d}\n"
                cache_n_c[d] = count;
                return count;
            }
        };
        Calculator.prototype.resume = function () {
            if (this.p_list_index >= this.p_list.length) {
                var last_p = this.p_list[this.p_list.length - 1];
                this.p_list.push(Rational.parse(last_p.num.mul(10).add(9), last_p.den.mul(10)));
            }
            this.calc_next();
        };
        return Calculator;
    }());
    Lib.executeOnDomLoad(Main.initialize);
})(TradingCards || (TradingCards = {}));
