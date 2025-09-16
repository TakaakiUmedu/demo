"use strict";
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
            gDebgugWindow.style.top = toPx(document.documentElement ? document.documentElement.scrollTop : 0);
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
        var _ = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            _[_i] = arguments[_i];
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
    var StableHash = /** @class */ (function () {
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
///// <reference path="./mylib.dom_tagnames.d.ts" />
///// <reference path="./mylib.html_element_map.ts" />
var Lib;
/// <reference path="./mylib.ts" />
///// <reference path="./mylib.dom_tagnames.d.ts" />
///// <reference path="./mylib.html_element_map.ts" />
(function (Lib) {
    //	function camelToSnake(str: string){
    //		return str.replace(/([A-Z])/g, (match, p1)=> "-" + p1.toLowerCase());
    //	}
    var Dom;
    (function (Dom) {
        function elem(name, attributes) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            var element = document.createElement(name);
            setAttributes(element, attributes);
            append(element, args);
            return element;
        }
        Dom.elem = elem;
        function setAttributes(element, attributes) {
            if (attributes) {
                var aName = void 0;
                for (aName in attributes) {
                    var match = void 0;
                    if (aName === "style") {
                        var style = attributes.style;
                        if (style) {
                            var sName = void 0;
                            for (sName in style) {
                                var sValue = style[sName];
                                if (sValue) {
                                    element.style[sName] = sValue;
                                }
                            }
                        }
                    }
                    else if (aName === "dataset") {
                        var dataset = attributes.dataset;
                        if (dataset) {
                            for (var sName in dataset) {
                                element.dataset[sName] = dataset[sName];
                            }
                        }
                    }
                    else {
                        var aValue = attributes[aName];
                        if (aValue === undefined || aValue === null) {
                            continue;
                        }
                        if (aName === "className") {
                            element.setAttribute("class", aValue.toString());
                        }
                        else {
                            var aNameStr = aName.toString();
                            if ((match = aNameStr.match(/^on(.*)/))) {
                                var event_1 = match[1];
                                if (aValue instanceof Function) {
                                    element.addEventListener(event_1, aValue); // any: EventListener
                                }
                                else if (typeof (aValue) === "object" && aValue.hasOwnProperty("handleEvent")) {
                                    element.addEventListener(event_1, aValue); // any: EventListenerObject
                                }
                                else {
                                    throw "invalid event handler specified for \"" + aName + "\"";
                                }
                            }
                            else {
                                element.setAttribute(aNameStr, aValue.toString());
                            }
                        }
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
                var additionalAttributes = void 0;
                if (typeof (item) === "string") {
                    value = label = item;
                    additionalAttributes = undefined;
                }
                else {
                    value = item.value;
                    if (item.label) {
                        label = item.label;
                    }
                    else {
                        label = value;
                    }
                    additionalAttributes = item.attributes;
                }
                var _a = Dom.radio(label, attributes), radio_1 = _a.radio, radioLabel = _a.label;
                radio_1.name = name;
                radio_1.value = value;
                setAttributes(radio_1, additionalAttributes);
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
            if (element instanceof HTMLElement) {
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
            if (target instanceof Element) {
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
        function append(target) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var element = prepareTarget(target);
            Lib.forEachRecursive(args, function (item) { return addOne(element, item); });
        }
        Dom.append = append;
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
        function eachChild(element, func) {
            for (var node = element.firstChild; node; node = node.nextSibling) {
                if (func(node) === "break") {
                    return false;
                }
            }
            return true;
        }
        Dom.eachChild = eachChild;
        function eachChildElement(element, func) {
            return eachChild(element, function (child) {
                if (child instanceof HTMLElement) {
                    return func(child);
                }
            });
        }
        Dom.eachChildElement = eachChildElement;
        function eachChildTag(element, name, func) {
            name = name.toLowerCase();
            return eachChildElement(element, function (child) {
                if (child.tagName.toLowerCase() === name) {
                    return func(child);
                }
            });
        }
        Dom.eachChildTag = eachChildTag;
        function eachDescendant(element, func) {
            if (func(element) === "break") {
                return false;
            }
            return eachChild(element, function (child) {
                if (child instanceof Node) {
                    if (!eachDescendant(child, func)) {
                        return "break";
                    }
                }
                return;
            });
        }
        Dom.eachDescendant = eachDescendant;
        function eachDescendantElement(element, func) {
            return eachDescendant(element, function (child) {
                if (child instanceof HTMLElement) {
                    return func(child);
                }
            });
        }
        Dom.eachDescendantElement = eachDescendantElement;
        function eachDescendantTag(element, name, func) {
            name = name.toLowerCase();
            return eachDescendantElement(element, function (child) {
                if (child.tagName.toLowerCase() === name) {
                    return func(child);
                }
            });
        }
        Dom.eachDescendantTag = eachDescendantTag;
        function forEachTag(element, name, func) {
            if (element instanceof Element && element.tagName.toLowerCase() === name) {
                func(element);
            }
            var children = element.getElementsByTagName(name);
            for (var i = 0; i < children.length; i++) {
                func(children[i]);
            }
        }
        Dom.forEachTag = forEachTag;
        /*
        export type RepeatedTaskFor<T extends Node> = (node: T) => void | "break";

        export function forEachChildElement(node: Node | Document, task: RepeatedTaskFor<HTMLElement>): boolean{
            return forEachChild(node, (child)=> {
                if(child instanceof HTMLElement){
                    if(task(child) === "break"){
                        return "break";
                    }
                }
                return;
            });
        }
        
        export function forEachChild(node: Node | Document, task: RepeatedTaskFor<Node>): boolean{
            for(let child: Node | null = node.firstChild; child !== null; child = child.nextSibling){
                if(task(child) === "break"){
                    return false;
                }
            }
            
            return true;
        }
        
        export function forEachNode(node: Node, task: RepeatedTaskFor<Node>): boolean{
            if(task(node) === "break"){
                return false;
            }
            return forEachChild(node, (node)=> {
                if(forEachNode(node, task)){
                    return;
                }else{
                    return "break";
                }
            });
        }*/
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
                        if (sName !== "length" && sName !== "parentRule") {
                            try {
                                newElement.style[sName] = subTable[sName];
                            }
                            catch (e) {
                            }
                        }
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
        function canvas2D(attributes) {
            var canvas = elem("canvas", attributes);
            var context = canvas.getContext("2d");
            return { canvas: canvas, context: context };
        }
        Dom.canvas2D = canvas2D;
        var ElementWithText = /** @class */ (function () {
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
        function innerText(target) {
            if (target instanceof Text) {
                return target.nodeValue || "";
            }
            else {
                var elem_1 = prepareTarget(target);
                var text_1 = "";
                eachDescendant(elem_1, function (node) {
                    if (node instanceof Text) {
                        text_1 += node.nodeValue;
                    }
                });
                return text_1;
            }
        }
        Dom.innerText = innerText;
        function findFirstText(elem) {
            var text = null;
            eachDescendant(elem, function (node) {
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
            var str = value.toString();
            if (eachDescendant(elem, function (node) {
                if (node instanceof Text) {
                    node.nodeValue = str;
                    return "break";
                }
                else {
                    return;
                }
            })) {
                append(elem, str);
            }
        }
        Dom.setText = setText;
        function findFirstTag(elem, name) {
            var nameUC = name.toUpperCase();
            var elem_found = null;
            eachDescendant(elem, function (node) {
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
                getElementWithType(type, id).addEventListener(event_name, table[id], useCapture);
            }
        }
        Dom.setEventListeners = setEventListeners;
        function getTypedElement(id, TYPE) {
            var element = document.getElementById(id);
            if (element) {
                if (element instanceof TYPE) {
                    return element;
                }
                else {
                    throw "element with id = " + id + " has invalid class";
                }
            }
            else {
                throw "cannot find target: " + id;
            }
        }
        Dom.getTypedElement = getTypedElement;
        var IdTable = {};
        function createId(name) {
            if (name === undefined) {
                name = "";
            }
            var index = IdTable[name];
            if (index === undefined) {
                index = 0;
            }
            else {
                index++;
            }
            while (true) {
                var id = name + index;
                if (!document.getElementById(id)) {
                    IdTable[name] = index;
                    return id;
                }
                index++;
            }
        }
        Dom.createId = createId;
        function getElementWithType(TYPE, id) {
            var element = document.getElementById(id);
            if (element && element instanceof TYPE) {
                return element;
            }
            else {
                throw "cannot find target: " + id;
            }
        }
        Dom.getElementWithType = getElementWithType;
        function getElementWithText(id) {
            var element = getElement(id);
            var text = getFirstText(element);
            return new ElementWithText(element, text);
        }
        Dom.getElementWithText = getElementWithText;
        function getSpecifiedItems(getFunction, ids) {
            var table = {};
            for (var i = 0; i < ids.length; i++) {
                var id = ids[i];
                table[id] = getFunction(id);
            }
            return table;
        }
        function getTexts() {
            var ids = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ids[_i] = arguments[_i];
            }
            return getSpecifiedItems(function (id) { return getFirstText(getElement(id)); }, ids);
        }
        Dom.getTexts = getTexts;
        function getElementsWithText() {
            var ids = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                ids[_i] = arguments[_i];
            }
            return getSpecifiedItems(function (id) { return getElementWithText(id); }, ids);
        }
        Dom.getElementsWithText = getElementsWithText;
        function getTypedElements(ids, elementClass) {
            return getSpecifiedItems(function (id) { return getElementWithType(elementClass, id); }, ids);
        }
        Dom.getTypedElements = getTypedElements;
        function getElements() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLElement);
        }
        Dom.getElements = getElements;
        function getInputs() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLInputElement);
        }
        Dom.getInputs = getInputs;
        function getOutputs() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLOutputElement);
        }
        Dom.getOutputs = getOutputs;
        function getForms() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLFormElement);
        }
        Dom.getForms = getForms;
        function getSelect() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLSelectElement);
        }
        Dom.getSelect = getSelect;
        function getOptions() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLOptionElement);
        }
        Dom.getOptions = getOptions;
        function getAnchors() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLAnchorElement);
        }
        Dom.getAnchors = getAnchors;
        function getTextAreas() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLTextAreaElement);
        }
        Dom.getTextAreas = getTextAreas;
        function getImages() {
            var idList = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                idList[_i] = arguments[_i];
            }
            return getTypedElements(idList, HTMLImageElement);
        }
        Dom.getImages = getImages;
        function combineTables(t1, t2, t3, t4, t5, t6, t7, t8, t9) {
            var table = {};
            for (var _i = 0, _a = [
                t1,
                t2,
                t3,
                t4,
                t5,
                t6,
                t7,
                t8,
                t9,
            ]; _i < _a.length; _i++) {
                var t = _a[_i];
                if (t) {
                    for (var name_4 in t) {
                        table[name_4] = t[name_4];
                    }
                }
            }
            return table;
        }
        Dom.combineTables = combineTables;
    })(Dom = Lib.Dom || (Lib.Dom = {}));
})(Lib || (Lib = {}));
var ImageViewer;
(function (ImageViewer) {
    ImageViewer.YUV_table_Y = [
        null, [0, 2, 0], [0, 3, 1], [1, 5, 0], [0, 7, 0], [0, 8, 1], [0, 10, 0], [1, 11, 1], [0, 13, 0], [0, 15, 1], [1, 17, 0], [0, 18, 1], [0, 20, 0], [0, 22, 0], [1, 23, 1], [0, 25, 0], [0, 27, 1], [1, 28, 0], [0, 30, 1], [0, 32, 0], [0, 34, 0], [1, 35, 1], [0, 37, 0], [0, 39, 1], [1, 40, 0], [0, 42, 1], [0, 44, 0], [0, 46, 0], [1, 47, 1], [0, 49, 0], [0, 51, 1], [1, 52, 0], [0, 54, 1], [0, 56, 0], [0, 58, 1], [1, 59, 0], [0, 61, 0], [0, 63, 1], [1, 64, 0], [0, 66, 1], [0, 68, 0], [0, 70, 1], [1, 71, 0], [0, 73, 0], [0, 75, 1], [1, 76, 0], [0, 78, 1], [0, 80, 0], [0, 82, 1], [1, 83, 0], [0, 85, 1], [0, 87, 0], [1, 88, 0], [0, 90, 1], [0, 92, 0], [0, 94, 1], [1, 95, 0], [0, 97, 1], [0, 99, 0], [1, 100, 0], [0, 102, 1], [0, 104, 0], [0, 106, 1], [1, 107, 0], [0, 109, 1], [0, 111, 0], [1, 112, 0], [0, 114, 1], [0, 116, 0], [0, 118, 1], [1, 119, 0], [0, 121, 1], [0, 123, 0], [1, 124, 1], [0, 126, 0], [0, 128, 0], [0, 130, 1], [1, 131, 0], [0, 133, 1], [0, 135, 0], [1, 136, 1], [0, 138, 0], [0, 140, 0], [0, 141, 1], [1, 143, 0], [0, 145, 1], [0, 147, 0], [1, 148, 1], [0, 150, 0], [0, 152, 0], [0, 153, 1], [1, 155, 0], [0, 156, 1], [0, 159, 0], [1, 160, 1], [0, 162, 0], [0, 163, 1], [0, 165, 0], [1, 167, 0], [0, 168, 1], [0, 171, 0], [1, 172, 1], [0, 174, 0], [0, 175, 1], [0, 177, 0], [1, 179, 0], [0, 180, 1], [0, 182, 0], [1, 183, 1], [0, 186, 0], [0, 187, 1], [0, 189, 0], [1, 190, 1], [0, 192, 0], [0, 194, 0], [1, 195, 1], [0, 197, 0], [0, 199, 1], [0, 201, 0], [1, 202, 1], [0, 204, 0], [0, 206, 0], [1, 207, 1], [0, 209, 0], [0, 211, 1], [0, 213, 0], [1, 214, 1], [0, 216, 0], [0, 218, 0], [1, 219, 1], [0, 221, 0], [0, 223, 1], [0, 225, 0], [1, 226, 1], [0, 228, 0], [0, 230, 1], [1, 231, 0], [0, 233, 0], [0, 235, 1], [0, 237, 0], [1, 238, 1], [0, 240, 0], [0, 242, 1], [1, 243, 0], [0, 245, 0], [0, 247, 1], [1, 248, 0], [0, 250, 1], [0, 252, 0], [0, 254, 1], [1, 255, 0], [3, 255, 1], [7, 255, 0], [11, 255, 0], [15, 255, 1], [17, 255, 0], [21, 255, 1], [25, 255, 0], [27, 255, 1], [31, 255, 0], [35, 255, 0], [37, 255, 1], [41, 255, 0], [45, 255, 1], [47, 255, 0], [51, 255, 1], [55, 255, 0], [58, 255, 0], [61, 255, 1], [65, 255, 0], [67, 255, 1], [71, 255, 0], [75, 255, 1], [77, 255, 0], [81, 255, 1], [85, 255, 0], [88, 255, 0], [91, 255, 1], [95, 255, 0], [97, 255, 1], [101, 255, 0], [105, 255, 1], [107, 255, 0], [111, 255, 0], [115, 255, 1], [118, 255, 0], [121, 255, 1], [125, 255, 0], [127, 255, 1], [131, 255, 0], [135, 255, 0], [137, 255, 1], [141, 255, 0], [145, 255, 1], [148, 255, 0], [151, 255, 1], [155, 255, 0], [157, 255, 1], [161, 255, 0], [165, 255, 0], [167, 255, 1], [171, 255, 0], [175, 255, 1], [178, 255, 0], [181, 255, 1], [185, 255, 0], [188, 255, 0], [191, 255, 1], [195, 255, 0], [198, 255, 1], [201, 255, 0], [205, 255, 1], [208, 255, 0], [211, 255, 1], [215, 255, 0], [219, 255, 0], [221, 255, 1], [225, 255, 0], [229, 255, 1], [231, 255, 0], [235, 255, 1], [239, 255, 0], [242, 255, 0], [245, 255, 1], [249, 255, 0], [251, 255, 1], [255, 255, 0], [254, 255, 10], [255, 255, 16], [255, 255, 26], [255, 255, 36], [254, 255, 46], [255, 255, 50], [255, 255, 60], [254, 255, 70], [255, 255, 76], [255, 255, 86], [255, 255, 96], [254, 255, 106], [255, 255, 112], [255, 255, 122], [254, 255, 132], [255, 255, 138], [255, 255, 148], [255, 255, 158], [254, 255, 168], [255, 255, 174], [255, 255, 184], [254, 255, 194], [255, 255, 200], [255, 255, 210], [255, 255, 220], [254, 255, 230], [255, 255, 236], [255, 255, 246], null
    ];
    ImageViewer.YUV_table_U = [
        [255, 255, 0], [249, 255, 0], [242, 255, 0], [239, 255, 0], [231, 255, 0], [225, 255, 0], [219, 255, 0], [215, 255, 0], [208, 255, 0], [201, 255, 0], [195, 255, 0], [188, 255, 0], [185, 255, 0], [178, 255, 0], [171, 255, 0], [165, 255, 0], [161, 255, 0], [155, 255, 0], [148, 255, 0], [141, 255, 0], [135, 255, 0], [131, 255, 0], [125, 255, 0], [118, 255, 0], [111, 255, 0], [107, 255, 0], [101, 255, 0], [95, 255, 0], [88, 255, 0], [85, 255, 0], [77, 255, 0], [71, 255, 0], [65, 255, 0], [58, 255, 0], [55, 255, 0], [47, 255, 0], [41, 255, 0], [35, 255, 0], [31, 255, 0], [25, 255, 0], [17, 255, 0], [11, 255, 0], [7, 255, 0], [1, 255, 0], [0, 252, 0], [1, 248, 0], [0, 245, 0], [1, 243, 0], [0, 240, 0], [0, 237, 0], [0, 233, 0], [1, 231, 0], [0, 228, 0], [0, 225, 0], [0, 221, 0], [0, 218, 0], [0, 216, 0], [0, 213, 0], [0, 209, 0], [0, 206, 0], [0, 204, 0], [0, 201, 0], [0, 197, 0], [0, 194, 0], [0, 192, 0], [0, 189, 0], [0, 186, 0], [0, 182, 0], [1, 179, 0], [0, 177, 0], [0, 174, 0], [0, 171, 0], [1, 167, 0], [0, 165, 0], [0, 162, 0], [0, 159, 0], [1, 155, 0], [0, 152, 0], [0, 150, 0], [0, 147, 0], [1, 143, 0], [0, 140, 0], [0, 138, 0], [0, 135, 0], [1, 131, 0], [0, 128, 0], [0, 126, 0], [0, 123, 0], [1, 119, 0], [0, 116, 0], [1, 112, 0], [0, 111, 0], [1, 107, 0], [0, 104, 0], [1, 100, 0], [0, 99, 0], [1, 95, 0], [0, 92, 0], [1, 88, 0], [0, 87, 0], [1, 83, 0], [0, 80, 0], [1, 76, 0], [0, 73, 0], [1, 71, 0], [0, 68, 0], [1, 64, 0], [0, 61, 0], [1, 59, 0], [0, 56, 0], [1, 52, 0], [0, 49, 0], [0, 46, 0], [0, 44, 0], [1, 40, 0], [0, 37, 0], [0, 34, 0], [0, 32, 0], [1, 28, 0], [0, 25, 0], [0, 22, 0], [0, 20, 0], [1, 17, 0], [0, 13, 0], [0, 10, 0], [0, 7, 0], [1, 5, 0], [0, 2, 0], [0, 1, 2], [0, 1, 4], [0, 0, 5], [0, 0, 7], [0, 0, 9], [0, 1, 12], [0, 1, 14], [0, 0, 15], [0, 0, 17], [0, 0, 19], [1, 0, 22], [1, 0, 23], [1, 0, 25], [0, 1, 28], [0, 1, 30], [0, 0, 31], [0, 0, 33], [0, 0, 35], [0, 1, 38], [0, 1, 40], [0, 0, 41], [0, 0, 43], [0, 0, 45], [0, 1, 48], [0, 1, 49], [0, 0, 51], [0, 0, 53], [0, 0, 55], [1, 0, 58], [1, 0, 59], [1, 0, 61], [0, 1, 64], [0, 1, 66], [0, 0, 67], [0, 0, 69], [0, 0, 71], [0, 1, 74], [0, 1, 75], [0, 0, 77], [0, 0, 79], [0, 0, 81], [1, 0, 84], [1, 0, 85], [1, 0, 87], [0, 1, 90], [0, 1, 92], [0, 0, 93], [0, 0, 95], [0, 0, 97], [0, 1, 100], [0, 1, 101], [0, 0, 103], [0, 0, 105], [0, 0, 107], [0, 1, 110], [0, 1, 111], [0, 0, 113], [0, 0, 115], [0, 0, 117], [1, 0, 119], [1, 0, 121], [1, 0, 123], [0, 1, 126], [0, 1, 128], [0, 0, 129], [0, 0, 131], [0, 0, 133], [0, 1, 136], [0, 1, 137], [0, 0, 139], [0, 0, 141], [0, 0, 143], [1, 0, 145], [1, 0, 147], [1, 0, 149], [0, 1, 152], [0, 1, 154], [0, 0, 155], [0, 0, 157], [0, 0, 159], [0, 1, 162], [0, 1, 163], [0, 0, 165], [0, 0, 167], [0, 0, 169], [0, 1, 172], [0, 1, 173], [0, 0, 175], [0, 0, 177], [0, 0, 179], [1, 0, 181], [1, 0, 183], [1, 0, 185], [0, 1, 188], [0, 1, 189], [0, 0, 191], [0, 0, 193], [0, 0, 195], [0, 1, 198], [0, 1, 199], [0, 0, 201], [0, 0, 203], [0, 0, 205], [1, 0, 207], [1, 0, 209], [0, 1, 212], [0, 1, 214], [0, 1, 215], [0, 0, 217], [0, 0, 219], [0, 1, 222], [0, 1, 224], [0, 0, 225], [0, 0, 227], [0, 0, 229], [0, 1, 232], [0, 1, 233], [0, 0, 235], [0, 0, 237], [0, 0, 239], [1, 0, 242], [1, 0, 243], [1, 0, 245], [0, 1, 248], [0, 1, 250], [0, 0, 251], [0, 0, 253], [0, 0, 255]
    ];
    ImageViewer.YUV_table_V = [
        [0, 255, 254], [0, 255, 238], [0, 255, 228], [0, 255, 218], [0, 255, 204], [0, 255, 194], [0, 255, 178], [0, 255, 168], [0, 255, 158], [0, 255, 142], [0, 255, 132], [0, 255, 116], [0, 255, 106], [0, 255, 96], [0, 255, 80], [0, 255, 70], [0, 255, 54], [0, 255, 44], [0, 255, 34], [0, 255, 18], [0, 255, 8], [0, 254, 1], [0, 252, 0], [0, 250, 1], [0, 247, 1], [0, 245, 0], [0, 242, 1], [0, 240, 0], [0, 237, 0], [0, 235, 1], [0, 233, 0], [0, 230, 1], [0, 228, 0], [0, 225, 0], [0, 223, 1], [0, 221, 0], [0, 218, 0], [0, 216, 0], [0, 213, 0], [0, 211, 1], [0, 209, 0], [0, 206, 0], [0, 204, 0], [0, 201, 0], [0, 199, 1], [0, 197, 0], [0, 194, 0], [0, 192, 0], [0, 189, 0], [0, 187, 1], [0, 186, 0], [0, 182, 0], [0, 180, 1], [0, 177, 0], [0, 175, 1], [0, 174, 0], [0, 171, 0], [0, 168, 1], [0, 165, 0], [0, 163, 1], [0, 162, 0], [0, 159, 0], [0, 156, 1], [0, 153, 1], [0, 152, 0], [0, 150, 0], [0, 147, 0], [0, 145, 1], [0, 141, 1], [0, 140, 0], [0, 138, 0], [0, 135, 0], [0, 133, 1], [0, 130, 1], [0, 128, 0], [0, 126, 0], [0, 123, 0], [0, 121, 1], [0, 118, 1], [0, 116, 0], [0, 114, 1], [0, 111, 0], [0, 109, 1], [0, 106, 1], [0, 104, 0], [0, 102, 1], [0, 99, 0], [0, 97, 1], [0, 94, 1], [0, 92, 0], [0, 90, 1], [0, 87, 0], [0, 85, 1], [0, 82, 1], [0, 80, 0], [0, 78, 1], [0, 75, 1], [0, 73, 0], [0, 70, 1], [0, 68, 0], [0, 66, 1], [0, 63, 1], [0, 61, 0], [0, 58, 1], [0, 56, 0], [0, 54, 1], [0, 51, 1], [0, 49, 0], [0, 46, 0], [0, 44, 0], [0, 42, 1], [0, 39, 1], [0, 37, 0], [0, 34, 0], [0, 32, 0], [0, 30, 1], [0, 27, 1], [0, 25, 0], [0, 22, 0], [0, 20, 0], [0, 18, 1], [0, 15, 1], [0, 13, 0], [0, 10, 0], [0, 8, 1], [0, 7, 0], [0, 3, 1], [0, 2, 0], [2, 1, 0], [3, 0, 0], [6, 0, 1], [7, 0, 1], [9, 0, 0], [11, 0, 0], [13, 0, 0], [15, 0, 0], [17, 0, 1], [19, 0, 0], [21, 0, 0], [23, 0, 1], [26, 1, 0], [27, 0, 0], [29, 0, 1], [32, 1, 0], [33, 0, 0], [36, 0, 1], [37, 0, 1], [39, 0, 0], [41, 0, 0], [43, 0, 0], [45, 0, 0], [47, 0, 1], [49, 0, 0], [51, 0, 0], [53, 0, 1], [56, 1, 0], [57, 0, 0], [59, 0, 1], [62, 1, 0], [63, 0, 0], [66, 1, 0], [67, 0, 0], [69, 0, 1], [71, 0, 1], [73, 0, 0], [75, 0, 0], [77, 0, 1], [79, 0, 0], [81, 0, 0], [83, 0, 1], [86, 1, 0], [87, 0, 0], [89, 1, 0], [91, 0, 0], [93, 0, 1], [96, 1, 0], [97, 0, 0], [99, 0, 1], [101, 0, 1], [103, 0, 0], [105, 0, 0], [107, 0, 1], [109, 0, 0], [111, 0, 0], [113, 0, 1], [116, 1, 0], [117, 0, 0], [119, 1, 0], [121, 0, 0], [123, 0, 1], [126, 1, 0], [127, 0, 0], [129, 0, 1], [131, 0, 1], [133, 0, 0], [135, 0, 0], [137, 0, 1], [139, 0, 0], [141, 0, 0], [143, 0, 0], [145, 0, 0], [147, 0, 1], [149, 1, 0], [151, 0, 0], [153, 0, 1], [156, 1, 0], [157, 0, 0], [159, 0, 1], [161, 0, 1], [163, 0, 0], [165, 0, 0], [167, 0, 1], [169, 0, 0], [171, 0, 0], [173, 0, 0], [175, 0, 0], [177, 0, 1], [179, 1, 0], [181, 0, 0], [183, 0, 1], [186, 1, 0], [187, 0, 0], [189, 0, 1], [191, 0, 1], [193, 0, 0], [195, 0, 0], [197, 0, 0], [199, 0, 1], [201, 0, 1], [203, 0, 0], [205, 0, 0], [207, 0, 1], [210, 1, 0], [211, 0, 0], [213, 0, 1], [216, 1, 0], [217, 0, 0], [220, 1, 0], [221, 0, 0], [223, 0, 1], [225, 0, 1], [227, 0, 0], [230, 0, 1], [231, 0, 1], [233, 0, 0], [235, 0, 0], [237, 0, 1], [240, 1, 0], [241, 0, 0], [243, 0, 1], [246, 1, 0], [247, 0, 0], [250, 1, 0], [251, 0, 0], [253, 0, 1], [255, 0, 1]
    ];
})(ImageViewer || (ImageViewer = {}));
var ImageViewer;
(function (ImageViewer) {
    ImageViewer.YIQ_table_Y = [
        [0, 0, 2], [0, 2, 1], [0, 3, 0], [0, 5, 1], [0, 7, 0], [1, 8, 1], [0, 11, 0], [1, 12, 1], [1, 13, 0], [0, 15, 0], [2, 16, 0], [0, 19, 0], [2, 20, 0], [1, 22, 0], [0, 24, 1], [1, 25, 0], [0, 27, 1], [0, 29, 0], [1, 30, 1], [0, 33, 0], [1, 34, 1], [1, 35, 0], [0, 37, 0], [0, 39, 1], [0, 41, 0], [2, 42, 0], [1, 44, 0], [0, 46, 1], [1, 47, 0], [0, 49, 1], [0, 51, 0], [0, 53, 0], [0, 55, 0], [1, 56, 1], [1, 57, 0], [1, 59, 0], [0, 61, 1], [0, 63, 0], [2, 64, 0], [0, 67, 0], [1, 68, 1], [1, 69, 0], [0, 71, 1], [1, 73, 0], [0, 75, 0], [0, 77, 0], [1, 78, 1], [2, 79, 0], [1, 81, 0], [1, 83, 0], [0, 85, 0], [0, 87, 1], [0, 89, 0], [1, 90, 1], [1, 91, 0], [0, 93, 1], [1, 95, 0], [0, 97, 0], [0, 99, 0], [0, 101, 0], [2, 101, 0], [1, 103, 0], [1, 105, 0], [0, 107, 0], [0, 109, 1], [0, 111, 0], [1, 112, 1], [0, 115, 0], [1, 116, 1], [1, 117, 0], [0, 119, 0], [1, 121, 0], [0, 123, 0], [2, 124, 0], [1, 126, 0], [1, 127, 0], [1, 129, 0], [0, 131, 1], [0, 133, 0], [2, 134, 0], [0, 137, 0], [1, 138, 1], [1, 139, 0], [0, 141, 0], [1, 143, 0], [0, 145, 0], [2, 146, 0], [0, 149, 0], [2, 149, 0], [1, 151, 0], [0, 153, 1], [0, 155, 0], [0, 157, 0], [0, 159, 0], [1, 160, 1], [1, 161, 0], [1, 163, 0], [1, 165, 0], [0, 167, 0], [2, 168, 0], [0, 171, 0], [2, 171, 0], [1, 173, 0], [0, 175, 1], [1, 177, 0], [0, 179, 0], [0, 181, 0], [1, 182, 1], [2, 183, 0], [1, 185, 0], [1, 187, 0], [0, 189, 0], [0, 191, 1], [0, 193, 0], [2, 193, 0], [1, 195, 0], [0, 197, 1], [1, 199, 0], [0, 201, 0], [0, 203, 0], [0, 205, 0], [2, 205, 0], [1, 207, 0], [1, 209, 0], [1, 211, 0], [0, 213, 1], [0, 215, 0], [2, 215, 0], [0, 218, 0], [1, 219, 1], [1, 221, 0], [0, 223, 0], [1, 225, 0], [0, 227, 0], [2, 228, 0], [1, 230, 0], [1, 231, 0], [1, 233, 0], [0, 235, 1], [0, 237, 0], [2, 238, 0], [0, 241, 0], [1, 242, 1], [1, 243, 0], [0, 245, 0], [1, 247, 0], [0, 249, 0], [2, 250, 0], [0, 253, 0], [2, 253, 0], [1, 255, 0], [5, 255, 0], [9, 255, 0], [11, 255, 0], [15, 255, 0], [19, 255, 0], [21, 255, 0], [25, 255, 0], [29, 255, 0], [31, 255, 0], [35, 255, 0], [39, 255, 0], [41, 255, 0], [45, 255, 0], [49, 255, 0], [51, 255, 0], [55, 255, 0], [59, 255, 0], [61, 255, 0], [65, 255, 0], [69, 255, 0], [71, 255, 0], [75, 255, 0], [79, 255, 0], [81, 255, 0], [85, 255, 0], [89, 255, 0], [91, 255, 0], [95, 255, 0], [99, 255, 0], [101, 255, 0], [105, 255, 0], [109, 255, 0], [111, 255, 0], [115, 255, 0], [119, 255, 0], [123, 255, 0], [125, 255, 0], [129, 255, 0], [133, 255, 0], [135, 255, 0], [139, 255, 0], [143, 255, 0], [145, 255, 0], [149, 255, 0], [152, 255, 0], [155, 255, 0], [159, 255, 0], [162, 255, 0], [165, 255, 0], [169, 255, 0], [172, 255, 0], [175, 255, 0], [179, 255, 0], [182, 255, 0], [185, 255, 0], [189, 255, 0], [192, 255, 0], [195, 255, 0], [199, 255, 0], [202, 255, 0], [205, 255, 0], [209, 255, 0], [212, 255, 0], [215, 255, 0], [218, 255, 0], [222, 255, 0], [225, 255, 0], [228, 255, 0], [232, 255, 0], [235, 255, 0], [238, 255, 0], [242, 255, 0], [245, 255, 0], [248, 255, 0], [252, 255, 0], [255, 255, 0], [255, 255, 9], [255, 255, 16], [255, 255, 26], [255, 255, 35], [255, 255, 42], [255, 255, 52], [255, 255, 60], [254, 255, 70], [255, 255, 79], [255, 255, 86], [255, 255, 96], [255, 255, 105], [255, 255, 113], [255, 255, 123], [255, 255, 130], [254, 255, 140], [255, 255, 149], [255, 255, 157], [255, 255, 167], [255, 255, 176], [255, 255, 183], [255, 255, 190], [255, 255, 201], [254, 255, 211], [255, 255, 220], [255, 255, 227], [255, 255, 237], [255, 255, 246], [255, 255, 253]
    ];
    ImageViewer.YIQ_table_I = [
        [0, 255, 255], [0, 249, 255], [0, 248, 253], [0, 242, 254], [0, 239, 253], [0, 234, 254], [0, 229, 255], [0, 230, 250], [0, 220, 254], [0, 215, 255], [0, 214, 253], [0, 206, 255], [0, 205, 252], [0, 200, 253], [0, 197, 252], [0, 191, 253], [0, 186, 254], [0, 181, 255], [0, 178, 253], [0, 172, 254], [0, 167, 255], [0, 168, 250], [0, 159, 255], [0, 157, 252], [0, 152, 253], [0, 145, 255], [0, 144, 253], [0, 138, 254], [0, 135, 252], [0, 130, 253], [0, 125, 255], [0, 126, 250], [0, 116, 254], [0, 111, 255], [0, 110, 253], [0, 107, 251], [0, 101, 252], [0, 96, 253], [0, 93, 252], [0, 87, 253], [0, 82, 254], [0, 77, 255], [0, 74, 253], [0, 68, 254], [0, 63, 255], [0, 64, 250], [0, 55, 255], [0, 53, 252], [0, 48, 253], [0, 45, 252], [0, 40, 253], [0, 34, 254], [0, 31, 252], [0, 26, 253], [0, 21, 254], [0, 15, 255], [0, 12, 254], [0, 7, 255], [0, 6, 253], [0, 3, 251], [0, 1, 249], [0, 2, 244], [0, 1, 242], [0, 2, 237], [0, 1, 234], [0, 6, 226], [0, 0, 227], [0, 5, 219], [0, 0, 220], [0, 5, 212], [0, 0, 213], [0, 2, 207], [0, 3, 202], [0, 2, 200], [0, 3, 195], [0, 2, 193], [0, 3, 188], [0, 2, 186], [0, 3, 181], [0, 1, 178], [0, 2, 173], [0, 1, 171], [0, 2, 166], [0, 1, 164], [0, 2, 159], [0, 0, 157], [0, 1, 152], [0, 0, 150], [0, 1, 145], [0, 0, 142], [0, 5, 134], [0, 4, 132], [0, 5, 127], [0, 3, 125], [0, 4, 120], [0, 3, 117], [0, 4, 113], [0, 3, 110], [0, 1, 108], [0, 2, 103], [0, 1, 101], [0, 2, 96], [0, 1, 94], [0, 2, 89], [0, 0, 86], [0, 1, 81], [0, 0, 79], [0, 1, 74], [0, 0, 72], [0, 1, 67], [0, 0, 65], [0, 1, 60], [0, 3, 54], [0, 0, 53], [0, 3, 47], [0, 4, 42], [0, 3, 40], [0, 4, 35], [0, 2, 33], [0, 3, 28], [0, 2, 25], [0, 3, 21], [0, 2, 18], [0, 0, 16], [0, 1, 11], [0, 0, 9], [0, 1, 4], [0, 0, 2], [2, 0, 1], [3, 0, 0], [5, 1, 0], [7, 0, 0], [9, 1, 0], [11, 0, 0], [13, 0, 0], [15, 1, 0], [17, 0, 0], [19, 1, 0], [21, 0, 0], [23, 0, 0], [25, 1, 0], [27, 0, 0], [29, 1, 0], [31, 0, 0], [33, 0, 0], [35, 1, 0], [37, 0, 0], [39, 1, 0], [41, 0, 0], [43, 0, 0], [46, 0, 1], [47, 0, 0], [49, 1, 0], [51, 0, 0], [53, 0, 0], [56, 0, 1], [57, 0, 0], [59, 1, 0], [61, 0, 0], [63, 0, 0], [66, 0, 1], [67, 0, 0], [69, 1, 0], [71, 0, 0], [73, 0, 0], [76, 0, 1], [77, 0, 0], [79, 1, 0], [81, 0, 0], [83, 0, 0], [86, 0, 1], [87, 0, 0], [89, 1, 0], [91, 0, 0], [93, 0, 0], [96, 0, 1], [97, 0, 0], [100, 0, 1], [101, 0, 0], [103, 0, 0], [106, 0, 1], [107, 0, 0], [110, 0, 1], [111, 0, 0], [113, 0, 0], [116, 0, 1], [117, 0, 0], [120, 0, 1], [121, 0, 0], [123, 0, 0], [126, 0, 1], [127, 0, 0], [130, 0, 1], [131, 0, 0], [133, 0, 0], [136, 0, 1], [137, 0, 0], [140, 0, 1], [141, 0, 0], [143, 0, 0], [146, 0, 1], [147, 0, 0], [150, 0, 1], [151, 0, 0], [154, 0, 1], [156, 0, 1], [157, 0, 0], [160, 0, 1], [161, 0, 0], [164, 0, 1], [165, 0, 0], [167, 0, 0], [170, 0, 1], [171, 0, 0], [173, 0, 1], [175, 0, 0], [177, 0, 0], [180, 0, 1], [181, 0, 0], [183, 0, 1], [185, 0, 0], [187, 0, 0], [190, 0, 1], [191, 0, 0], [193, 0, 1], [195, 0, 0], [197, 0, 0], [200, 0, 1], [201, 0, 0], [203, 0, 1], [205, 0, 0], [207, 0, 1], [210, 0, 1], [211, 0, 0], [213, 0, 1], [215, 0, 0], [217, 0, 1], [220, 0, 1], [221, 0, 0], [223, 0, 1], [225, 0, 0], [227, 0, 1], [229, 0, 1], [231, 0, 0], [233, 0, 1], [235, 0, 0], [237, 0, 1], [239, 0, 1], [241, 0, 0], [243, 0, 1], [245, 0, 0], [247, 0, 1], [249, 0, 1], [251, 0, 0], [253, 0, 1], [255, 0, 0]
    ];
    ImageViewer.YIQ_table_Q = [
        [1, 255, 0], [0, 253, 0], [1, 252, 0], [0, 249, 0], [1, 247, 0], [0, 245, 0], [1, 243, 0], [0, 241, 0], [2, 240, 0], [0, 237, 0], [0, 235, 1], [1, 233, 0], [1, 231, 0], [1, 230, 0], [0, 227, 0], [1, 225, 0], [0, 223, 0], [1, 221, 0], [0, 218, 0], [1, 217, 0], [0, 215, 0], [0, 213, 1], [1, 211, 0], [1, 209, 0], [1, 207, 0], [0, 205, 0], [0, 203, 0], [0, 201, 0], [1, 199, 0], [0, 197, 1], [1, 195, 0], [0, 193, 0], [0, 191, 1], [0, 189, 0], [1, 187, 0], [1, 185, 0], [2, 183, 0], [0, 181, 0], [0, 179, 0], [1, 177, 0], [0, 175, 1], [1, 173, 0], [0, 171, 0], [1, 170, 0], [0, 167, 0], [1, 165, 0], [1, 163, 0], [1, 161, 0], [0, 159, 0], [0, 157, 0], [0, 155, 0], [0, 153, 1], [1, 151, 0], [0, 149, 0], [1, 148, 0], [0, 145, 0], [1, 143, 0], [0, 141, 0], [1, 139, 0], [0, 137, 0], [2, 136, 0], [0, 133, 0], [0, 131, 1], [1, 129, 0], [1, 127, 0], [1, 126, 0], [0, 123, 0], [1, 121, 0], [0, 119, 0], [1, 117, 0], [0, 115, 0], [1, 114, 0], [0, 111, 0], [0, 109, 1], [0, 107, 0], [1, 105, 0], [1, 103, 0], [0, 101, 0], [0, 99, 0], [0, 97, 0], [1, 95, 0], [0, 93, 1], [1, 91, 0], [0, 89, 0], [0, 87, 1], [0, 85, 0], [1, 83, 0], [1, 81, 0], [2, 79, 0], [0, 77, 0], [0, 75, 0], [1, 73, 0], [0, 71, 1], [1, 69, 0], [0, 67, 0], [1, 66, 0], [0, 63, 0], [0, 61, 1], [1, 59, 0], [1, 57, 0], [0, 55, 0], [0, 53, 0], [0, 51, 0], [0, 49, 1], [1, 47, 0], [0, 46, 1], [1, 44, 0], [0, 41, 0], [0, 39, 1], [0, 37, 0], [1, 35, 0], [0, 33, 0], [2, 32, 0], [0, 29, 0], [0, 27, 1], [1, 25, 0], [0, 24, 1], [1, 22, 0], [0, 19, 0], [2, 18, 0], [0, 15, 0], [1, 13, 0], [0, 11, 0], [1, 10, 0], [0, 7, 0], [0, 5, 1], [0, 3, 0], [0, 2, 1], [0, 0, 2], [3, 0, 3], [1, 0, 7], [4, 0, 9], [2, 0, 13], [0, 0, 18], [3, 0, 19], [2, 0, 24], [0, 0, 28], [3, 0, 29], [1, 0, 34], [4, 0, 35], [2, 0, 40], [1, 0, 44], [3, 0, 46], [2, 0, 50], [0, 0, 54], [3, 0, 56], [1, 0, 60], [0, 0, 65], [2, 0, 66], [0, 0, 72], [2, 0, 73], [1, 0, 78], [4, 0, 79], [2, 0, 84], [0, 0, 88], [3, 0, 90], [2, 0, 94], [0, 0, 98], [3, 0, 100], [1, 0, 104], [4, 0, 106], [2, 0, 110], [1, 0, 115], [3, 0, 116], [2, 0, 120], [0, 0, 125], [3, 0, 126], [1, 0, 131], [4, 0, 132], [1, 0, 138], [0, 0, 142], [2, 0, 144], [1, 0, 148], [4, 0, 150], [2, 0, 154], [0, 0, 159], [3, 0, 160], [1, 0, 164], [0, 0, 169], [3, 0, 170], [1, 0, 175], [4, 0, 176], [2, 0, 181], [1, 0, 185], [3, 0, 186], [2, 0, 191], [0, 0, 195], [3, 0, 197], [0, 0, 203], [3, 0, 204], [1, 0, 208], [0, 0, 213], [2, 0, 214], [1, 0, 219], [4, 0, 220], [2, 0, 225], [0, 0, 229], [3, 0, 230], [1, 0, 235], [0, 0, 239], [3, 0, 241], [1, 0, 245], [4, 0, 247], [2, 0, 251], [0, 0, 255], [8, 0, 254], [10, 0, 255], [18, 0, 254], [20, 0, 255], [28, 0, 254], [30, 0, 255], [38, 0, 254], [40, 0, 255], [48, 0, 254], [50, 0, 255], [58, 0, 254], [60, 0, 255], [68, 0, 254], [70, 0, 255], [78, 0, 254], [80, 0, 255], [88, 0, 254], [90, 0, 255], [98, 0, 254], [100, 0, 255], [108, 0, 254], [110, 0, 255], [118, 0, 254], [120, 0, 255], [128, 0, 254], [130, 0, 255], [139, 0, 252], [141, 0, 254], [144, 0, 255], [151, 0, 254], [154, 0, 255], [161, 0, 254], [164, 0, 255], [171, 0, 254], [174, 0, 255], [181, 0, 254], [184, 0, 255], [191, 0, 254], [194, 0, 255], [201, 0, 254], [204, 0, 255], [211, 0, 254], [214, 0, 255], [221, 0, 253], [224, 0, 255], [231, 0, 253], [234, 0, 255], [241, 0, 253], [244, 0, 255], [251, 0, 253], [254, 0, 255]
    ];
})(ImageViewer || (ImageViewer = {}));
/// <reference path="./mylib/mylib.dom.ts"/>
/// <reference path="./yuv_table.ts"/>
/// <reference path="./yiq_table.ts"/>
var ImageViewer;
/// <reference path="./mylib/mylib.dom.ts"/>
/// <reference path="./yuv_table.ts"/>
/// <reference path="./yiq_table.ts"/>
(function (ImageViewer_1) {
    var RESULT_ID = "result";
    var DIALOG_ID = "dialog";
    var CAPTION_BAR_HEIGHT = 48;
    var MARGIN = 10;
    var BORDER = 5;
    var BORDER_WIDTH = 2;
    var Dom = Lib.Dom;
    function create_image(src, width, height) {
        var image = Dom.elem("img", { src: src });
        if (width !== undefined && width !== undefined) {
            image.style.width = width + "px";
        }
        if (height !== undefined && height !== undefined) {
            image.style.height = height + "px";
        }
        return image;
    }
    var CanvasWrapper = /** @class */ (function () {
        function CanvasWrapper(width, height, image) {
            this.width = width;
            this.height = height;
            this.imageData = null;
            var canvas = Dom.canvas2D({ width: width, height: height, style: { width: width + "px", height: height + "px" } });
            this.canvas = canvas.canvas;
            this.context = canvas.context;
            if (image) {
                this.context.drawImage(image, 0, 0, width, height);
            }
        }
        CanvasWrapper.prototype.getImageData = function (left, top, width, height) {
            if (left === null || left === undefined) {
                left = 0;
            }
            if (top === null || top === undefined) {
                top = 0;
            }
            if (width === null || width === undefined) {
                width = this.canvas.width;
            }
            if (height === null || height === undefined) {
                height = this.canvas.height;
            }
            this.imageData = this.context.getImageData(left, top, width, height);
            return this.imageData.data;
        };
        CanvasWrapper.prototype.putImageData = function () {
            if (this.imageData) {
                this.context.putImageData(this.imageData, 0, 0);
            }
        };
        CanvasWrapper.prototype.toImage = function () {
            return create_image(this.canvas.toDataURL(), this.width, this.height);
        };
        CanvasWrapper.prototype.clear = function () {
            this.context.clearRect(0, 0, this.width, this.height);
        };
        return CanvasWrapper;
    }());
    var ImageViewer = /** @class */ (function () {
        function ImageViewer() {
            var _this = this;
            this.resultTable = Dom.getElementWithType(HTMLTableElement, RESULT_ID);
            this.elem = Dom.combineTables(Dom.getElements("compose_menu"), Dom.getInputs("mosaic_size"));
            this.currentImage = null;
            this.width = 0;
            this.height = 0;
            this.dialog = new Dialog();
            this.click = function (event) {
                if (_this.dialog.is_shown()) {
                    _this.dialog.hide();
                }
                else {
                    if (event.target instanceof HTMLImageElement) {
                        _this.dialog.show(event.pageX, event.pageY, event.target);
                    }
                }
                event.preventDefault();
                event.stopPropagation();
            };
            this.decomposeInfo = null;
            this.mode = "normal";
            this.monochrome = function () {
                if (_this.mode === "monochrome") {
                    return;
                }
                var canvas_wrapper = new CanvasWrapper(_this.width, _this.height, _this.currentImage);
                var data = canvas_wrapper.getImageData();
                var j = 0;
                for (var y = 0; y < canvas_wrapper.height; y++) {
                    for (var x = 0; x < canvas_wrapper.width; x++) {
                        data[j + R] = data[j + G] = data[j + B] = round255((data[j] + data[j + G] + data[j + B]) / 3);
                        data[j + A] = 255;
                        j += 4;
                    }
                }
                canvas_wrapper.putImageData();
                var new_image = canvas_wrapper.toImage();
                new_image.addEventListener("load", function () {
                    _this.set_current_image(new_image);
                }, false);
                _this.mode = "monochrome";
                if (_this.zoomData) {
                    _this.zoomData.setMonochrome(true);
                }
            };
            this.originalImage = null;
            this.original = function () {
                if (_this.originalImage !== null) {
                    _this.set_current_image(_this.originalImage);
                }
                _this.mode = "normal";
                if (_this.zoomData) {
                    _this.zoomData.setMonochrome(false);
                }
            };
            this.reduce = function () {
                if (_this.currentImage) {
                    _this.clear();
                    _this.apply_reduce(_this.currentImage, _this.reduce_simple);
                }
            };
            this.floor = function () {
                if (_this.currentImage) {
                    _this.clear();
                    _this.apply_reduce(_this.currentImage, _this.reduce_floor);
                }
            };
            this.waitingForDraw = false;
            this.reduce_simple = function (dataO, dataT, d) {
                if (d == 1) {
                    return;
                }
                var j = 0;
                var ratio = 255 / (Math.floor(256 / d) - 1);
                var e_r = 0, e_g = 0, e_b = 0;
                for (var y = 0; y < _this.height; y++) {
                    for (var x = 0; x < _this.width; x++) {
                        var t_r = dataO[j] + e_r;
                        var t_g = dataO[j + G] + e_g;
                        var t_b = dataO[j + B] + e_b;
                        var n_r = void 0;
                        var n_g = void 0;
                        var n_b = void 0;
                        if (t_r <= 0) {
                            n_r = 0;
                        }
                        else if (t_r >= 256) {
                            n_r = 255;
                        }
                        else {
                            n_r = round255(t_r / d * ratio);
                        }
                        if (t_g < 0) {
                            n_g = 0;
                        }
                        else if (t_g >= 256) {
                            n_g = 255;
                        }
                        else {
                            n_g = round255(t_g / d * ratio);
                        }
                        if (t_b < 0) {
                            n_b = 0;
                        }
                        else if (t_b >= 256) {
                            n_b = 255;
                        }
                        else {
                            n_b = round255(t_b / d * ratio);
                        }
                        e_r = t_r - n_r;
                        e_g = t_g - n_g;
                        e_b = t_b - n_b;
                        dataT[j + R] = n_r;
                        dataT[j + G] = n_g;
                        dataT[j + B] = n_b;
                        dataT[j + A] = 255;
                        j += 4;
                    }
                }
            };
            this.reduce_floor = function (dataO, dataT, d) {
                if (d == 1) {
                    return;
                }
                var j = 0;
                var ratio = 255 / (round255(256 / d) - 1);
                for (var y = 0; y < _this.height; y++) {
                    for (var x = 0; x < _this.width; x++) {
                        dataT[j + R] = round255(dataO[j + R] / d * ratio);
                        dataT[j + G] = round255(dataO[j + G] / d * ratio);
                        dataT[j + B] = round255(dataO[j + B] / d * ratio);
                        dataT[j + A] = 255;
                        j += 4;
                    }
                }
            };
            this.mosaic = function () {
                if (_this.dialog.target === null) {
                    return;
                }
                var block_size = parseInt(_this.elem.mosaic_size.value);
                if (block_size > 1) {
                    var image = new CanvasWrapper(_this.width, _this.height, _this.dialog.target);
                    var data = image.getImageData();
                    var nx = Math.ceil(_this.width / block_size);
                    var ny = Math.ceil(_this.height / block_size);
                    var oy = 0;
                    for (var by = 0; by < ny; by++) {
                        var ox = 0;
                        var h = (oy + block_size < _this.height ? block_size : _this.height - oy);
                        for (var bx = 0; bx < nx; bx++) {
                            var w = (ox + block_size < _this.width ? block_size : _this.width - ox);
                            var sr = 0, sg = 0, sb = 0;
                            for (var y = 0; y < h; y++) {
                                var j = ((oy + y) * _this.width + ox) * 4;
                                for (var x = 0; x < w; x++) {
                                    sr += data[j];
                                    sg += data[j + G];
                                    sb += data[j + B];
                                    j += 4;
                                }
                            }
                            var r = round255(sr / (h * w));
                            var g = round255(sg / (h * w));
                            var b = round255(sb / (h * w));
                            for (var y = 0; y < h; y++) {
                                var j = ((oy + y) * _this.width + ox) * 4;
                                for (var x = 0; x < w; x++) {
                                    data[j + R] = r;
                                    data[j + G] = g;
                                    data[j + B] = b;
                                    j += 4;
                                }
                            }
                            ox += block_size;
                        }
                        oy += block_size;
                    }
                    image.putImageData();
                    if (_this.dialog.target == _this.currentImage) {
                        _this.set_current_image(image.toImage());
                    }
                    else {
                        _this.dialog.target.src = image.canvas.toDataURL();
                    }
                }
            };
            this.recompose = function () {
                if (_this.decomposeInfo == null) {
                    return;
                }
                var canvasWrapperT = new CanvasWrapper(_this.width, _this.height);
                var dataT = canvasWrapperT.getImageData();
                var canvasWrapper = [];
                var data = [];
                var totalCount = _this.decomposeInfo.decomposer.labels.length;
                var count = 0;
                for (var p_1 = 0; p_1 < totalCount; p_1++) {
                    var checkbox = document.getElementById("recompose_" + p_1);
                    if (checkbox instanceof HTMLInputElement && checkbox.checked) {
                        var wrapper = new CanvasWrapper(_this.width, _this.height, _this.decomposeInfo.images[p_1]);
                        canvasWrapper[p_1] = wrapper;
                        data[p_1] = wrapper.getImageData();
                        count++;
                    }
                    else {
                        canvasWrapper[p_1] = null;
                        data[p_1] = null;
                    }
                }
                if (count < 2) {
                    alert("合成対象を1つ以上選んで下さい");
                    return;
                }
                var j = 0;
                var decomposed_tmp = new Uint8ClampedArray(totalCount);
                var decomposed = new Uint8ClampedArray(totalCount);
                var rgb = [];
                var recomp_func = _this.decomposeInfo.decomposer.recompose;
                var decomp_func = _this.decomposeInfo.decomposer.decompose;
                var prepare_funcs = [];
                var recompose_defaults = _this.decomposeInfo.decomposer.recomp_defaults;
                var p;
                for (p = 0; p < totalCount; p++) {
                    if (data[p] == null) {
                        prepare_funcs[p] = function () {
                            decomposed[p] = recompose_defaults[p];
                        };
                    }
                    else if (_this.decomposeInfo.recomped) {
                        prepare_funcs[p] = function () {
                            decomp_func(data[p], j, decomposed_tmp, 0);
                            decomposed[p] = decomposed_tmp[p];
                        };
                    }
                    else {
                        prepare_funcs[p] = function () {
                            decomposed[p] = data[p][j];
                        };
                    }
                }
                for (var y = 0; y < _this.height; y++) {
                    for (var x = 0; x < _this.width; x++) {
                        for (p = 0; p < totalCount; p++) {
                            prepare_funcs[p]();
                        }
                        recomp_func(decomposed, 0, dataT, j);
                        dataT[j + A] = 255;
                        j += 4;
                    }
                }
                canvasWrapperT.putImageData();
                _this.open_image_window(canvasWrapperT.canvas.toDataURL());
            };
            this.rgb = function () {
                _this.decompose(DecomposerRGB);
            };
            this.cmy = function () {
                _this.decompose(DecomposerCMY);
            };
            this.cmyk = function () {
                _this.decompose(DecomposerCMYK);
            };
            this.yuv = function () {
                _this.decompose(DecomposerYUV);
            };
            this.yiq = function () {
                _this.decompose(DecomposerYIQ);
            };
            this.hsv = function () {
                _this.decompose(DecomposerHSV);
            };
            this.zoomData = null;
            this.stop_zoom = function () {
                if (_this.zoomData) {
                    _this.zoomData.unregister();
                    _this.zoomData = null;
                    if (_this.currentImage) {
                        _this.set_current_image(_this.currentImage);
                    }
                }
            };
            this.zoom = function () {
                if (_this.zoomData) {
                    _this.stop_zoom();
                }
                else if (_this.currentImage) {
                    _this.zoomData = new ZoomData(_this.width, _this.height, _this.currentImage, _this.mode === "monochrome");
                    _this.clear();
                    _this.append_tr(_this.zoomData.targetCanvasWrapper.canvas, _this.zoomData.tileCanvasWrapper.canvas);
                    _this.resultTable.appendChild(Dom.elem("tr", null, Dom.elem("td", { colSpan: 2 }, _this.zoomData.numCanvasWrapper.canvas)));
                    _this.zoomData.draw_zoom(_this.width / 2, _this.height / 2);
                }
            };
            this.open = function () {
                _this.dialog.hide();
                if (_this.dialog.target) {
                    _this.open_image_window(_this.dialog.target.src);
                }
            };
            this.load = function () {
                if (_this.dialog.target) {
                    _this.set_current_image(_this.dialog.target);
                }
                _this.dialog.hide();
            };
            this.windowID = 0;
            this.dragover = function (event) {
                _this.resultTable.style.borderColor = "red";
                event.preventDefault();
                event.stopPropagation();
                if (event.dataTransfer) {
                    event.dataTransfer.dropEffect = "copy";
                }
                return false;
            };
            this.dragleave = function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (_this.originalImage != null) {
                    _this.resultTable.style.borderColor = "transparent";
                }
                else {
                    _this.resultTable.style.borderColor = "red";
                }
                return false;
            };
            this.drop = function (event) {
                _this.mode = "normal";
                event.preventDefault();
                event.stopPropagation();
                _this.resultTable.style.borderColor = "transparent";
                if (event.dataTransfer === null) {
                    return;
                }
                var files = event.dataTransfer.files;
                for (var i = 0; i < files.length; i++) {
                    if (files[i].type.match(/^image\//)) {
                        var reader = new FileReader();
                        reader.addEventListener("load", function () {
                            if (typeof reader.result === "string") {
                                var image_1 = Dom.elem("img", { src: reader.result });
                                image_1.addEventListener("load", function () {
                                    _this.set_current_image(image_1);
                                    _this.originalImage = image_1;
                                }, false);
                            }
                        }, false);
                        reader.readAsDataURL(files[i]);
                        return;
                    }
                }
                var types = event.dataTransfer.types;
                var _loop_2 = function () {
                    if (types[i].match(/^text$/i)) {
                        data = event.dataTransfer.getData(types[i]);
                        if (data != null) {
                            if (data.match(/^I_/)) {
                                var image = document.getElementById(data);
                                if (image instanceof HTMLImageElement) {
                                    _this.set_current_image(image);
                                    return { value: void 0 };
                                }
                            }
                            else if (data.match(/^data:/i)) {
                                var image_2 = Dom.elem("img", { src: data });
                                image_2.addEventListener("load", function () {
                                    _this.set_current_image(image_2);
                                    _this.originalImage = image_2;
                                }, false);
                                return { value: void 0 };
                            }
                        }
                    }
                };
                var data;
                for (var i = 0; i < types.length; i++) {
                    var state_1 = _loop_2();
                    if (typeof state_1 === "object")
                        return state_1.value;
                }
                alert("画像をダウンロードしてから、ドラッグ&ドロップして下さい");
                return false;
            };
            this.reload = function () {
                if (_this.currentImage) {
                    _this.set_current_image(_this.currentImage);
                }
            };
            var FUNCTIONS = {
                monochrome: this.monochrome,
                original: this.original,
                floor: this.floor,
                reduce: this.reduce,
                mosaic: this.mosaic,
                recompose: this.recompose,
                rgb: this.rgb,
                cmy: this.cmy,
                cmyk: this.cmyk,
                hsv: this.hsv,
                yuv: this.yuv,
                yiq: this.yiq,
                zoom: this.zoom,
                open: this.open,
                load: this.load
            };
            var _loop_1 = function (name_5) {
                Dom.addEventListener(Dom.getElement(name_5), "click", function () {
                    _this.apply(FUNCTIONS[name_5]);
                });
            };
            for (var name_5 in FUNCTIONS) {
                _loop_1(name_5);
            }
            this.resultTable.addEventListener("dragover", this.dragover, false);
            this.resultTable.addEventListener("dragleave", this.dragleave, false);
            this.resultTable.addEventListener("drop", this.drop, false);
            this.resultTable.addEventListener("click", this.click, false);
        }
        ImageViewer.prototype.set_current_image = function (image) {
            this.currentImage = image;
            this.width = Math.ceil((this.resultTable.offsetWidth - MARGIN - BORDER * 2) / 2);
            if (this.width >= this.currentImage.naturalWidth) {
                this.width = this.currentImage.naturalWidth;
                this.height = this.currentImage.naturalHeight;
            }
            else {
                this.height = Math.ceil(this.width * this.currentImage.naturalHeight / this.currentImage.naturalWidth);
            }
            this.clear();
            this.currentImage.style.width = this.width + "px";
            this.currentImage.style.height = this.height + "px";
            this.set_click_listener(this.currentImage);
            this.append_tr(this.currentImage);
        };
        ImageViewer.prototype.set_click_listener = function (image) {
            image.addEventListener("click", this.click, false);
        };
        ImageViewer.prototype.clear = function () {
            this.hide_compose_menu();
            Dom.clear(this.resultTable);
        };
        ImageViewer.prototype.hide_compose_menu = function () {
            this.decomposeInfo = null;
            this.elem.compose_menu.style.display = "none";
        };
        ImageViewer.prototype.show_compose_menu = function () {
            this.elem.compose_menu.style.display = "inline";
        };
        ImageViewer.prototype.append_tr = function () {
            var items = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                items[_i] = arguments[_i];
            }
            var tr = Dom.elem("tr");
            for (var _a = 0, items_1 = items; _a < items_1.length; _a++) {
                var item = items_1[_a];
                Dom.append(tr, Dom.elem("td", null, item));
            }
            Dom.append(this.resultTable, tr);
        };
        ImageViewer.initialize = function () {
            new ImageViewer();
        };
        ImageViewer.prototype.apply = function (func) {
            this.dialog.hide();
            if (this.waitingForDraw) {
                alert("描画中です。終了まで操作できません");
                return;
            }
            if (func != this.zoom && this.zoomData) {
                this.stop_zoom();
            }
            if (this.currentImage != null) {
                func();
            }
        };
        ImageViewer.prototype.apply_reduce = function (image, reduce_func) {
            var _this = this;
            var canvasWrapperO = new CanvasWrapper(this.width, this.height, this.currentImage);
            var draw_one = function (i, d) {
                _this.waitingForDraw = false;
                if (_this.currentImage === null) {
                    return;
                }
                var image_t;
                if (d == 1) {
                    image_t = _this.copy_image(_this.currentImage);
                }
                else {
                    var canvasWrapperT = new CanvasWrapper(_this.width, _this.height);
                    reduce_func(canvasWrapperO.getImageData(), canvasWrapperT.getImageData(), d);
                    canvasWrapperT.putImageData();
                    image_t = canvasWrapperT.toImage();
                }
                var bar = _this.draw_bar(_this.width, CAPTION_BAR_HEIGHT, 256 / d, function (i) {
                    var c = 256 / d - 1 == 0 ? 0 : round255(i * 255 / (256 / d - 1));
                    return "rgba(" + c + "," + c + "," + c + ",1.0)";
                }, "" + (8 - i) + "ビット、" + (256 / d) + "階調");
                _this.set_click_listener(image_t);
                _this.append_tr(_this.copy_image(_this.currentImage), image_t, Dom.br(), bar);
                i++;
                d *= 2;
                if (i <= 8) {
                    _this.waitingForDraw = true;
                    setTimeout(function () { draw_one(i, d); }, 0);
                }
            };
            this.waitingForDraw = true;
            draw_one(0, 1);
        };
        ImageViewer.prototype.draw_bar = function (width, height, max, color_func, message) {
            var canvasWrapper = new CanvasWrapper(width, height);
            var context = canvasWrapper.context;
            for (var i = 0; i < max; i++) {
                context.fillStyle = color_func(i);
                var l = Math.round(i * width / max);
                var w = width - l;
                context.fillRect(l, 0, w, height);
            }
            context.font = "" + height / 2 + "px 'monospace'";
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.fillStyle = "white";
            context.lineWidth = 3;
            context.strokeStyle = "black";
            context.strokeText(message, width / 2, height / 2);
            context.fillText(message, width / 2, height / 2);
            return canvasWrapper.canvas;
        };
        ImageViewer.prototype.copy_image = function (image) {
            return Dom.elem("img", { src: image.src, style: { width: image.style.width, height: image.style.height } });
        };
        ImageViewer.prototype.decompose = function (decomposer) {
            if (this.currentImage === null) {
                return;
            }
            this.clear();
            var captions = (decomposer.captions || decomposer.labels);
            var checkbox = document.getElementById("show_monochrome");
            var recomp = checkbox instanceof HTMLInputElement && !checkbox.checked;
            var canvasWrapperO = new CanvasWrapper(this.width, this.height, this.currentImage);
            var dataO = canvasWrapperO.getImageData();
            var canvasWrapper = [];
            var data = [];
            var decomp_count = decomposer.labels.length;
            for (var p = 0; p < decomp_count; p++) {
                canvasWrapper[p] = new CanvasWrapper(this.width, this.height);
                data[p] = canvasWrapper[p].getImageData();
            }
            var j = 0;
            //			let rgb = {r : 0, g : 0, b : 0};
            var decomposed = new Uint8ClampedArray(decomp_count);
            var decomposed_tmp = [];
            if (recomp) {
                for (var p = 0; p < decomp_count; p++) {
                    decomposed_tmp[p] = new Uint8ClampedArray(decomp_count);
                    for (var q = 0; q < decomp_count; q++) {
                        var value = decomposer.decomp_defaults[p][q];
                        if (value !== null) {
                            decomposed_tmp[p][q] = value;
                        }
                    }
                }
            }
            var recomp2tmp = [];
            for (var p = 0; p < decomp_count; p++) {
                recomp2tmp[p] = [];
                for (var q = 0; q < decomp_count; q++) {
                    recomp2tmp[p][q] = null;
                }
            }
            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    //					rgb.r = dataO[j + R];
                    //					rgb.g = dataO[j + G];
                    //					rgb.b = dataO[j + B];
                    decomposer.decompose(dataO, j, decomposed, 0);
                    if (recomp) {
                        if (decomposer.recompose2) {
                            for (var p = 0; p < decomp_count; p++) {
                                recomp2tmp[p][p] = decomposed[p];
                                decomposer.recompose2(recomp2tmp[p], data[p], j);
                                data[p][j + A] = 255;
                            }
                        }
                        else {
                            for (var p = 0; p < decomp_count; p++) {
                                decomposed_tmp[p][p] = decomposed[p];
                                decomposer.recompose(decomposed_tmp[p], 0, data[p], j);
                                data[p][j + A] = 255;
                            }
                        }
                    }
                    else {
                        for (var p = 0; p < decomp_count; p++) {
                            data[p][j + R] = data[p][j + G] = data[p][j + B] = decomposed[p];
                            data[p][j + A] = 255;
                        }
                    }
                    j += 4;
                }
            }
            var images = [];
            var bars = [];
            var rgb = new Uint8ClampedArray(3);
            var recompose_checkboxes = document.getElementById("recompose_checkboxes");
            if (recompose_checkboxes) {
                Dom.clear(recompose_checkboxes);
            }
            var _loop_3 = function (p) {
                canvasWrapper[p].putImageData();
                images[p] = canvasWrapper[p].toImage();
                this_1.set_click_listener(images[p]);
                bars[p] = this_1.draw_bar(this_1.width, CAPTION_BAR_HEIGHT, 255, function (i) {
                    if (recomp) {
                        if (decomposer.recompose2) {
                            var decomposed_1 = [];
                            for (var q = 0; q < decomp_count; q++) {
                                decomposed_1[q] = null;
                            }
                            decomposed_1[p] = i;
                            decomposer.recompose2(decomposed_1, rgb, 0);
                        }
                        else {
                            var def = decomposer.decomp_defaults[p];
                            var decomposed_2 = new Uint8ClampedArray(decomp_count);
                            for (var q = 0; q < decomp_count; q++) {
                                var value = def[q];
                                if (value !== null) {
                                    decomposed_2[q] = value;
                                }
                            }
                            decomposed_2[p] = i;
                            decomposer.recompose(decomposed_2, 0, rgb, 0);
                        }
                        return "rgba(" + rgb[R] + "," + rgb[G] + "," + rgb[B] + ",1.0)";
                    }
                    else {
                        return "rgba(" + i + "," + i + "," + i + ",1.0)";
                    }
                }, captions[p]);
                if (recompose_checkboxes) {
                    recompose_checkboxes.appendChild(Dom.input("checkbox", { id: "recompose_" + p, checked: true }));
                    recompose_checkboxes.appendChild(document.createTextNode(decomposer.labels[p]));
                }
            };
            var this_1 = this;
            for (var p = 0; p < decomp_count; p++) {
                _loop_3(p);
            }
            this.append_tr(this.currentImage, [images[0], Dom.br(), bars[0]]);
            this.append_tr([images[1], Dom.br(), bars[1]], [images[2], Dom.br(), bars[2]]);
            if (decomp_count > 3) {
                this.append_tr([images[3], Dom.br(), bars[3]]);
            }
            this.decomposeInfo = { images: images, decomposer: decomposer, recomped: recomp };
            this.show_compose_menu();
        };
        ImageViewer.prototype.open_image_window = function (src) {
            var _this = this;
            this.windowID++;
            var sub_window = window.open("about:blank", "画像" + this.windowID, "menubar=true,toolbar=true,location=yes,resizable=yes,width=" + (this.width + 10) + ",height=" + (this.height + 10));
            if (sub_window) {
                sub_window.document.open();
                sub_window.document.writeln("<!DOCTYLE html>");
                sub_window.document.writeln("<html lang=\"ja\">");
                sub_window.document.writeln("<head/>");
                sub_window.document.writeln("<style>body,p,img{border-width:0;margin:0;padding:0;}</style>");
                sub_window.document.writeln("</head>");
                sub_window.document.writeln("<body>");
                sub_window.document.writeln("<p><img id=\"img\" src=\"" + src + "\" alt=\"\" style=\"width:" + this.width + "px;height:" + this.height + "px;\"></p>");
                sub_window.document.writeln("</body>");
                sub_window.document.writeln("</html>");
                sub_window.document.close();
                var sub_img = sub_window.document.getElementById("img");
                if (sub_img) {
                    sub_img.addEventListener("click", function () {
                        if (sub_window.confirm("この画像をターゲットとしてロードしますか?")) {
                            _this.set_current_image(create_image(src, _this.width, _this.height));
                        }
                    }, false);
                }
            }
        };
        return ImageViewer;
    }());
    var ZoomData = /** @class */ (function () {
        function ZoomData(width, height, image, monochrome) {
            var _this = this;
            this.monochrome = monochrome;
            this.mousemove = function (event) {
                if (event.target instanceof HTMLCanvasElement) {
                    var rect = event.target.getBoundingClientRect();
                    var x = event.clientX - rect.left;
                    var y = event.clientY - rect.top;
                    _this.draw_zoom(x, y);
                }
            };
            this.tileCanvasWrapper = new CanvasWrapper(width, height);
            this.numCanvasWrapper = new CanvasWrapper(width * 2 + MARGIN, height);
            this.targetCanvasWrapper = new CanvasWrapper(width, height);
            this.targetImage = image;
            this.tileWidth = Math.round(width / ZOOM_TILE_SIZE);
            this.tileHeight = Math.round(height / ZOOM_TILE_SIZE);
            this.numWidth = Math.round(width * 2 / ZOOM_NUM_SIZE);
            this.numHeight = Math.round(height / ZOOM_NUM_SIZE);
            this.targetCanvasWrapper.canvas.addEventListener("mousemove", this.mousemove, false);
        }
        ZoomData.prototype.setMonochrome = function (flag) {
            this.monochrome = flag;
        };
        ZoomData.prototype.unregister = function () {
            this.targetCanvasWrapper.canvas.removeEventListener("mousemove", this.mousemove, false);
        };
        ZoomData.prototype.draw_zoom = function (centerX, centerY) {
            var contextI = this.targetCanvasWrapper.context;
            var contextT = this.tileCanvasWrapper.context;
            var contextN = this.numCanvasWrapper.context;
            this.targetCanvasWrapper.clear();
            this.tileCanvasWrapper.clear();
            this.numCanvasWrapper.clear();
            contextI.drawImage(this.targetImage, 0, 0, this.targetCanvasWrapper.width, this.targetCanvasWrapper.height);
            var tileLeft = Math.round(centerX - this.tileWidth / 2) + BORDER;
            var tileTop = Math.round(centerY - this.tileHeight / 2) + BORDER;
            var data = this.targetCanvasWrapper.getImageData(tileLeft, tileTop, this.tileWidth, this.tileHeight);
            var j = 0;
            var ty = 0;
            for (var y = 0; y < this.tileHeight; y++) {
                var tx = 0;
                for (var x = 0; x < this.tileWidth; x++) {
                    contextT.fillStyle = "rgba(" + data[j] + "," + data[j + G] + "," + data[j + B] + ",1.0)";
                    contextT.fillRect(tx, ty, ZOOM_TILE, ZOOM_TILE);
                    j += 4;
                    tx += ZOOM_TILE_SIZE;
                }
                ty += ZOOM_TILE_SIZE;
            }
            var numLeft = Math.round(centerX - this.numWidth / 2) + BORDER;
            var numTop = Math.round(centerY - this.numHeight / 2) + BORDER;
            var data = this.targetCanvasWrapper.getImageData(numLeft, numTop, this.numWidth, this.numHeight);
            var j = 0;
            var ty = 0;
            if (this.monochrome) {
                contextN.font = "" + Math.round(ZOOM_NUM / 2) + "px monospace";
                contextN.textBaseline = "top";
                contextN.textAlign = "right";
                contextN.strokeStyle = "black";
                contextN.fillStyle = "white";
                contextN.lineWidth = 3;
            }
            else {
                contextN.font = "" + Math.round(ZOOM_NUM / 3) + "px monospace";
                contextN.textBaseline = "top";
                contextN.textAlign = "right";
                contextN.strokeStyle = "black";
                contextN.lineWidth = 3;
            }
            for (var y = 0; y < this.numHeight; y++) {
                var tx = 0;
                for (var x = 0; x < this.numWidth; x++) {
                    contextN.fillStyle = "rgba(" + data[j] + "," + data[j + G] + "," + data[j + B] + ",1.0)";
                    contextN.fillRect(tx, ty, ZOOM_NUM, ZOOM_NUM);
                    if (this.monochrome) {
                        contextN.fillStyle = "white";
                        contextN.strokeText("" + data[j], tx + ZOOM_NUM - 2, ty);
                        contextN.fillText("" + data[j], tx + ZOOM_NUM - 2, ty);
                    }
                    else {
                        contextN.fillStyle = "rgba(255,0,0,1.0)";
                        contextN.strokeText("" + data[j], tx + ZOOM_NUM - 2, ty);
                        contextN.fillText("" + data[j], tx + ZOOM_NUM - 2, ty);
                        contextN.fillStyle = "rgba(0,255,0,1.0)";
                        contextN.strokeText("" + data[j + G], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.33);
                        contextN.fillText("" + data[j + G], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.33);
                        contextN.fillStyle = "rgba(0,0,255,1.0)";
                        contextN.strokeText("" + data[j + B], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.67);
                        contextN.fillText("" + data[j + B], tx + ZOOM_NUM - 2, ty + ZOOM_NUM * 0.67);
                    }
                    j += 4;
                    tx += ZOOM_NUM_SIZE;
                }
                ty += ZOOM_NUM_SIZE;
            }
            contextI.strokeStyle = "blue";
            contextI.lineWidth = 2;
            contextI.strokeRect(tileLeft, tileTop, this.tileWidth, this.tileHeight);
            contextT.strokeStyle = "blue";
            contextT.lineWidth = 2;
            contextT.strokeRect(1, 1, this.tileWidth * ZOOM_TILE_SIZE - 2, this.tileHeight * ZOOM_TILE_SIZE - 2);
            contextI.strokeStyle = "red";
            contextI.lineWidth = 2;
            contextI.strokeRect(numLeft, numTop, this.numWidth, this.numHeight);
            contextT.strokeStyle = "red";
            contextT.lineWidth = 2;
            contextT.strokeRect((numLeft - tileLeft) * ZOOM_TILE_SIZE, BORDER + (numTop - tileTop) * ZOOM_TILE_SIZE, this.numWidth * ZOOM_TILE_SIZE, this.numHeight * ZOOM_TILE_SIZE);
            contextN.strokeStyle = "red";
            contextN.lineWidth = 2;
            contextN.strokeRect(1, 1, this.numWidth * ZOOM_NUM_SIZE - 1, this.numHeight * ZOOM_NUM_SIZE - 1);
        };
        return ZoomData;
    }());
    var ZOOM_MARGIN = 1;
    var ZOOM_TILE = 10;
    var ZOOM_TILE_SIZE = ZOOM_TILE + ZOOM_MARGIN;
    var ZOOM_NUM = 48;
    var ZOOM_NUM_SIZE = ZOOM_NUM + ZOOM_MARGIN;
    var Dialog = /** @class */ (function () {
        function Dialog() {
            this.dialog = Dom.getElement(DIALOG_ID);
            this.target = null;
        }
        Dialog.prototype.is_shown = function () {
            return this.dialog.style.display != "none";
        };
        Dialog.prototype.show = function (x, y, target) {
            this.dialog.style.display = "block";
            this.dialog.style.left = Math.round(x - this.dialog.offsetWidth / 2) + "px";
            this.dialog.style.top = Math.round(y - this.dialog.offsetHeight / 2) + "px";
            this.target = target;
        };
        Dialog.prototype.hide = function () {
            this.dialog.style.display = "none";
        };
        return Dialog;
    }());
    var R = 0, G = 1, B = 2, RGB = 3, A = 3;
    var H = 0, S = 1, V = 2, HSV = 3;
    var DecomposerCMY = {
        labels: ["C", "M", "Y"],
        captions: ["Cyan", "Magenta", "Yellow"],
        decomp_defaults: [[null, 0, 0], [0, null, 0], [0, 0, null]],
        recomp_defaults: [0, 0, 0],
        decompose: function (rgb, rgb_i, cmy, cmy_i) {
            cmy[cmy_i] = 255 - rgb[rgb_i];
            cmy[cmy_i + 1] = 255 - rgb[rgb_i + G];
            cmy[cmy_i + 2] = 255 - rgb[rgb_i + B];
        },
        recompose: function (cmy, cmy_i, rgb, rgb_i) {
            rgb[rgb_i] = 255 - cmy[cmy_i];
            rgb[rgb_i + G] = 255 - cmy[cmy_i + 1];
            rgb[rgb_i + B] = 255 - cmy[cmy_i + 2];
        }
    };
    var DecomposerCMYK = {
        labels: ["C", "M", "Y", "K"],
        captions: ["Cyan", "Magenta", "Yellow", "Key plate"],
        decomp_defaults: [[null, 0, 0, 0], [0, null, 0, 0], [0, 0, null, 0], [0, 0, 0, null]],
        recomp_defaults: [0, 0, 0, 0],
        decompose: function (rgb, rgb_i, cmyk, cmyk_i) {
            var c = 255 - rgb[rgb_i];
            var m = 255 - rgb[rgb_i + G];
            var y = 255 - rgb[rgb_i + B];
            var k = (c <= m && c <= y) ? c : (m <= c && m <= y ? m : y);
            cmyk[cmyk_i] = c - k;
            cmyk[cmyk_i + 1] = m - k;
            cmyk[cmyk_i + 2] = y - k;
            cmyk[cmyk_i + 3] = k;
        },
        recompose: function (cmyk, cmyk_i, rgb, rgb_i) {
            var k = cmyk[cmyk_i + 3];
            rgb[rgb_i] = 255 - cmyk[cmyk_i] - k;
            rgb[rgb_i + G] = 255 - cmyk[cmyk_i + 1] - k;
            rgb[rgb_i + B] = 255 - cmyk[cmyk_i + 2] - k;
        }
    };
    var DecomposeFuncRGB = function (rgb, rgb_i, rgb_d, rgb_d_i) {
        rgb_d[rgb_d_i] = rgb[rgb_i];
        rgb_d[rgb_d_i + G] = rgb[rgb_i + G];
        rgb_d[rgb_d_i + B] = rgb[rgb_i + B];
    };
    var DecomposerRGB = {
        labels: ["R", "G", "B"],
        captions: ["Red", "Green", "Blue"],
        decomp_defaults: [[null, 0, 0], [0, null, 0], [0, 0, null]],
        recomp_defaults: [0, 0, 0],
        decompose: DecomposeFuncRGB,
        recompose: DecomposeFuncRGB
    };
    var DecomposerYUV = {
        labels: ["Y", "U", "V"],
        //		decomp_defaults: [[null, 128, 128], [178, null, 0], [225, 0, null]],
        decomp_defaults: [[null, null, null], [null, null, null], [null, null, null]],
        recomp_defaults: [255, 0, 0],
        decompose: function (rgb, rgb_i, yuv, yuv_i) {
            var r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
            var y = 0.299 * r + 0.587 * g + 0.114 * b;
            var u = (-0.14713 * r - 0.28886 * g + 0.436 * b + 0.436 * 255.0) / 0.872;
            var v = (0.615 * r - 0.51499 * g - 0.10001 * b + 0.615 * 255.0) / 1.23;
            yuv[yuv_i] = round255(y);
            yuv[yuv_i + 1] = round255(u);
            yuv[yuv_i + 2] = round255(v);
        },
        recompose: function (yuv, yuv_i, rgb, rgb_i) {
            var y = yuv[yuv_i];
            var u = yuv[yuv_i + 1] * 0.872 - 0.436 * 255;
            var v = yuv[yuv_i + 2] * 1.23 - 0.615 * 255;
            var r = y + 1.13983 * v;
            var g = y - 0.39465 * u - 0.58060 * v;
            var b = y + 2.03211 * u;
            var max = Math.max(r, g, b);
            if (max > 255) {
                var e = max - 255;
                r -= e;
                g -= e;
                b -= e;
            }
            var min = Math.min(r, g, b);
            if (min < 0) {
                var e = -min;
                r += e;
                g += e;
                b += e;
            }
            rgb[rgb_i] = round255(r);
            rgb[rgb_i + G] = round255(g);
            rgb[rgb_i + B] = round255(b);
        },
        recompose2: function (yuv, rgb, rgb_i) {
            var y = yuv[0];
            var u = yuv[1];
            var v = yuv[2];
            var col;
            if (y !== null) {
                //				col = YUV_table_Y[y];
                col = [y, y, y];
            }
            else if (u !== null) {
                col = ImageViewer_1.YUV_table_U[u];
            }
            else {
                col = ImageViewer_1.YUV_table_V[v];
            }
            rgb[rgb_i] = col[R];
            rgb[rgb_i + G] = col[G];
            rgb[rgb_i + B] = col[B];
        }
    };
    function round255(val) {
        if (val <= 0) {
            return 0;
        }
        else if (val >= 255) {
            return 255;
        }
        else {
            return Math.round(val);
        }
    }
    var DecomposerYIQ = {
        labels: ["Y", "I", "Q"],
        decomp_defaults: [[null, 128, 128], [123, null, 137], [65, 102, null]],
        recomp_defaults: [255, 0, 0],
        decompose: function (rgb, rgb_i, yiq, yiq_i) {
            var r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
            var y = 0.299 * r + 0.587 * g + 0.114 * b;
            var i = 0.5959 * r - 0.2746 * g - 0.3213 * b;
            var q = 0.2115 * r - 0.5227 * g + 0.3112 * b;
            yiq[yiq_i] = round255(y);
            yiq[yiq_i + 1] = round255((i + 0.5957 * 255) / 1.1914);
            yiq[yiq_i + 2] = round255((q + 0.5226 * 255) / 1.0452);
        },
        recompose: function (yiq, yiq_i, rgb, rgb_i) {
            var y = yiq[yiq_i];
            var i = yiq[yiq_i + 1] * 1.1914 - 0.5957 * 255;
            var q = yiq[yiq_i + 2] * 1.0452 - 0.5226 * 255;
            var r = y + 0.956 * i + 0.619 * q;
            var g = y - 0.273 * i - 0.647 * q;
            var b = y - 1.106 * i + 1.703 * q;
            var max = Math.max(r, g, b);
            if (max > 255) {
                var e = max - 255;
                r -= e;
                g -= e;
                b -= e;
            }
            var min = Math.min(r, g, b);
            if (min < 0) {
                var e = -min;
                r += e;
                g += e;
                b += e;
            }
            rgb[rgb_i] = round255(r);
            rgb[rgb_i + G] = round255(g);
            rgb[rgb_i + B] = round255(b);
        },
        recompose2: function (yiq, rgb, rgb_i) {
            var y = yiq[0];
            var i = yiq[1];
            var q = yiq[2];
            var col;
            if (y !== null) {
                //				col = YIQ_table_Y[y];
                col = [y, y, y];
            }
            else if (i !== null) {
                col = ImageViewer_1.YIQ_table_I[i];
            }
            else {
                col = ImageViewer_1.YIQ_table_Q[q];
            }
            rgb[rgb_i] = col[R];
            rgb[rgb_i + G] = col[G];
            rgb[rgb_i + B] = col[B];
        }
    };
    var DecomposerHSV = {
        labels: ["H", "S", "V"],
        captions: ["Hue(色相)", "Saturation(彩度)", "Value(明度)"],
        decomp_defaults: [[null, 255, 255], [255, null, 255], [255, 0, null]],
        recomp_defaults: [255, 255, 255],
        decompose: function (rgb, rgb_i, hsv, hsv_i) {
            var r = rgb[rgb_i], g = rgb[rgb_i + G], b = rgb[rgb_i + B];
            var max = (r >= g && r >= b) ? r : (g >= r && g >= b ? g : b);
            var min = (r <= g && r <= b) ? r : (g <= r && g <= b ? g : b);
            var d = max - min;
            hsv[hsv_i + V] = round255(max);
            if (d == 0) {
                hsv[hsv_i] = 0;
                hsv[hsv_i + S] = 0;
            }
            else {
                hsv[hsv_i + S] = round255(d * 255 / max);
                var h = void 0;
                if (min == b) {
                    h = 60 * (g - r) / d + 60;
                }
                else if (min == r) {
                    h = 60 * (b - g) / d + 180;
                }
                else {
                    h = 60 * (r - b) / d + 300;
                }
                hsv[hsv_i] = round255(h * 256 / 360);
            }
        },
        recompose: function (hsv, hsv_i, rgb, rgb_i) {
            var h = hsv[hsv_i];
            var s = hsv[hsv_i + S];
            var r, g, b;
            r = g = b = hsv[hsv_i + V];
            if (s > 0) {
                h = h * 6 / 256;
                var i = Math.floor(h);
                var f = h - i;
                switch (i) {
                    default:
                    case 0:
                        g *= (1 - s * (1 - f) / 255);
                        b *= (1 - s / 255);
                        break;
                    case 1:
                        r *= (1 - s * f / 255);
                        b *= (1 - s / 255);
                        break;
                    case 2:
                        r *= (1 - s / 255);
                        b *= (1 - s * (1 - f) / 255);
                        break;
                    case 3:
                        r *= (1 - s / 255);
                        g *= (1 - s * f / 255);
                        break;
                    case 4:
                        r *= (1 - s * (1 - f) / 255);
                        g *= (1 - s / 255);
                        break;
                    case 5:
                        g *= (1 - s / 255);
                        b *= (1 - s * f / 255);
                        break;
                }
            }
            rgb[rgb_i] = round255(r);
            rgb[rgb_i + G] = round255(g);
            rgb[rgb_i + B] = round255(b);
        }
    };
    Lib.executeOnDomLoad(ImageViewer.initialize);
})(ImageViewer || (ImageViewer = {}));
