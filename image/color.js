"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
/// <reference path="./mylib.ts" />
var Lib;
/// <reference path="./mylib.ts" />
(function (Lib) {
    var PositionPair = /** @class */ (function () {
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
    var VectorPair = /** @class */ (function (_super) {
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
/// <reference path="./mylib.linear_algebra.ts"/>
var Lib;
/// <reference path="./mylib.linear_algebra.ts"/>
(function (Lib) {
    var Color = /** @class */ (function () {
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
            return new Color(this.r * r, this.g + r, this.b + r);
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
/// <reference path="mylib/mylib.ts"/>
/// <reference path="mylib/mylib.dom.ts"/>
/// <reference path="mylib/mylib.color.ts"/>
var Lib;
/// <reference path="mylib/mylib.ts"/>
/// <reference path="mylib/mylib.dom.ts"/>
/// <reference path="mylib/mylib.color.ts"/>
(function (Lib) {
    var Svg = /** @class */ (function () {
        function Svg() {
        }
        Svg.elem = function (name, attributes) {
            var elem = document.createElementNS("http://www.w3.org/2000/svg", name);
            for (var name_5 in attributes) {
                elem.setAttribute(name_5, attributes[name_5]);
            }
            return elem;
        };
        Svg.circle = function (cx, cy, r, stroke, fill) {
            return Svg.elem("circle", {
                cx: cx + "px",
                cy: cy + "px",
                r: r + "px",
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges"
            });
        };
        Svg.path = function (path, stroke, fill) {
            return Svg.elem("path", {
                d: path,
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges"
            });
        };
        Svg.fill = function (elem, r, g, b) {
            elem.setAttribute("fill", new Lib.Color(r, g, b).toString());
        };
        return Svg;
    }());
    Lib.Svg = Svg;
})(Lib || (Lib = {}));
var Color;
(function (Color_1) {
    var CX = 50;
    var CY = 50;
    var R = 20;
    var D_CENTER = 10;
    var D_WIDTH = 9.5;
    //	const D_CYCLE = 1000;
    var D_SPEED = 0.005;
    var D_INTERVAL = 33;
    var Dom = Lib.Dom;
    var Color = /** @class */ (function () {
        function Color() {
            var _this = this;
            this.elem = Dom.combineTables(Dom.getInputs("r", "g", "b", "c", "m", "y", "move", "offset"), Dom.getOutputs("val_r", "val_g", "val_b", "val_c", "val_m", "val_y"));
            this.update_values = function () {
                _this.elem.val_r.value = _this.elem.r.value;
                _this.elem.val_g.value = _this.elem.g.value;
                _this.elem.val_b.value = _this.elem.b.value;
                _this.elem.val_c.value = _this.elem.c.value;
                _this.elem.val_m.value = _this.elem.m.value;
                _this.elem.val_y.value = _this.elem.y.value;
                var r = parseInt(_this.elem.r.value);
                var g = parseInt(_this.elem.g.value);
                var b = parseInt(_this.elem.b.value);
                Lib.Svg.fill(_this.itemTable["r"], r, 0, 0);
                Lib.Svg.fill(_this.itemTable["g"], 0, g, 0);
                Lib.Svg.fill(_this.itemTable["b"], 0, 0, b);
                Lib.Svg.fill(_this.itemTable["rg"], r, g, 0);
                Lib.Svg.fill(_this.itemTable["gb"], 0, g, b);
                Lib.Svg.fill(_this.itemTable["br"], r, 0, b);
                Lib.Svg.fill(_this.itemTable["rgb"], r, g, b);
                Lib.Svg.fill(_this.itemTable["c"], r, 255, 255);
                Lib.Svg.fill(_this.itemTable["m"], 255, g, 255);
                Lib.Svg.fill(_this.itemTable["y"], 255, 255, b);
                Lib.Svg.fill(_this.itemTable["cm"], r, g, 255);
                Lib.Svg.fill(_this.itemTable["my"], 255, g, b);
                Lib.Svg.fill(_this.itemTable["yc"], r, 255, b);
                Lib.Svg.fill(_this.itemTable["cmy"], r, g, b);
            };
            this.rgb_changed = function () {
                var r = parseInt(_this.elem.r.value);
                var g = parseInt(_this.elem.g.value);
                var b = parseInt(_this.elem.b.value);
                _this.elem.c.value = "" + (255 - r);
                _this.elem.m.value = "" + (255 - g);
                _this.elem.y.value = "" + (255 - b);
                _this.update_values();
            };
            this.cmy_changed = function () {
                var c = parseInt(_this.elem.c.value);
                var m = parseInt(_this.elem.m.value);
                var y = parseInt(_this.elem.y.value);
                _this.elem.r.value = "" + (255 - c);
                _this.elem.g.value = "" + (255 - m);
                _this.elem.b.value = "" + (255 - y);
                _this.update_values();
            };
            //		private startTime = Date.now();
            this.lastTime = Date.now();
            this.moving = true;
            this.registered = false;
            this.moveRight = true;
            this.animate = function () {
                if (_this.moving == false) {
                    _this.registered = false;
                    return;
                }
                var curTime = Date.now();
                var interval = curTime - _this.lastTime;
                _this.lastTime = curTime;
                var prev_offset = _this.getOffset();
                var offset = prev_offset + (1.01 - Math.abs(prev_offset)) * D_SPEED * interval * (_this.moveRight ? 1 : -1);
                if (_this.moveRight) {
                    if (offset > 1) {
                        offset = 1 - (offset - 1);
                        _this.moveRight = false;
                    }
                }
                else {
                    if (offset < -1) {
                        offset = -1 + (-1 - offset);
                        _this.moveRight = true;
                    }
                }
                _this.setOffset(offset);
                setTimeout(_this.animate, D_INTERVAL);
            };
            this.register_update = function () {
                if (_this.registered == false) {
                    setTimeout(_this.animate, D_INTERVAL);
                    _this.registered = true;
                    _this.lastTime = Date.now();
                }
            };
            this.itemTable = {};
            var rgb = document.getElementById("rgb");
            var cmy = document.getElementById("cmy");
            if (!(rgb instanceof SVGSVGElement) || !(cmy instanceof SVGSVGElement)) {
                return;
            }
            var vMin = parseFloat(this.elem.offset.min);
            var vMax = parseFloat(this.elem.offset.max);
            this.vWidth = vMax - vMin;
            this.vCenter = (vMax + vMin) / 2;
            rgb.style.backgroundColor = "#000";
            cmy.style.backgroundColor = "#fff";
            this.appendCircles(rgb, 150, ["r", "g", "b"], this.itemTable);
            this.appendCircles(cmy, 330, ["c", "m", "y"], this.itemTable);
            Dom.addEventListener(this.elem.r, "input", this.rgb_changed);
            Dom.addEventListener(this.elem.g, "input", this.rgb_changed);
            Dom.addEventListener(this.elem.b, "input", this.rgb_changed);
            Dom.addEventListener(this.elem.c, "input", this.cmy_changed);
            Dom.addEventListener(this.elem.m, "input", this.cmy_changed);
            Dom.addEventListener(this.elem.y, "input", this.cmy_changed);
            Dom.addEventListener(this.elem.move, "change", function () {
                _this.moving = _this.elem.move.checked;
                if (_this.moving) {
                    _this.register_update();
                }
            });
            Dom.addEventListener(this.elem.offset, "mousedown", function () {
                _this.elem.move.checked = false;
                _this.moving = false;
            });
            Dom.addEventListener(this.elem.offset, "input", function () {
                _this.setOffset(_this.getOffset());
            });
            this.update_values();
            this.register_update();
        }
        Color.initialize = function () {
            new Color();
        };
        Color.prototype.calcPaths = function (angle, D, names) {
            var pathTable = {};
            var centers = [];
            for (var i = 0; i < 3; i++) {
                centers.push({
                    x: CX + D * Math.cos((angle + 120 * i) * Math.PI / 180),
                    y: CY + D * Math.sin((angle + 120 * i) * Math.PI / 180)
                });
            }
            var outer_xps = [];
            var inner_xps = [];
            for (var i = 0; i < 3; i++) {
                var c1 = centers[i];
                var c2 = centers[(i + 1) % 3];
                var dx = (c2.x - c1.x) / 2;
                var dy = (c2.y - c1.y) / 2;
                var d = Math.sqrt(dx * dx + dy * dy);
                var a = Math.acos(d / R);
                outer_xps.push({
                    x: c1.x + R * Math.cos((angle + 120 * i + 150) * Math.PI / 180 - a),
                    y: c1.y + R * Math.sin((angle + 120 * i + 150) * Math.PI / 180 - a)
                });
                inner_xps.push({
                    x: c1.x + R * Math.cos((angle + 120 * i + 150) * Math.PI / 180 + a),
                    y: c1.y + R * Math.sin((angle + 120 * i + 150) * Math.PI / 180 + a)
                });
            }
            var colors_rgb = ["#f00", "#0f0", "#00f"];
            var colors_rgb2 = ["#ff0", "#0ff", "#f0f"];
            for (var i = 0; i < 3; i++) {
                var o1 = outer_xps[i];
                var o2 = outer_xps[(i + 1) % 3];
                var i1 = inner_xps[(i + 2) % 3];
                var i2 = inner_xps[i];
                pathTable[names[i]] =
                    "M " + o1.x + " " + o1.y + " " +
                        "A " + R + " " + R + " 0 " + (D > R * Math.sqrt(3) / 3 ? "1" : "0") + " 1 " + o2.x + " " + o2.y + " " +
                        "A " + R + " " + R + " 0 0 0 " + i1.x + " " + i1.y + " " +
                        "A " + R + " " + R + " 0 0 0 " + o1.x + " " + o1.y;
                pathTable[names[i] + names[(i + 1) % 3]] =
                    "M " + o2.x + " " + o2.y + " " +
                        "A " + R + " " + R + " 0 0 1 " + i2.x + " " + i2.y + " " +
                        "A " + R + " " + R + " 0 0 0 " + i1.x + " " + i1.y + " " +
                        "A " + R + " " + R + " 0 0 1 " + o2.x + " " + o2.y;
            }
            pathTable[names.join("")] =
                "M " + inner_xps[0].x + " " + inner_xps[0].y + " " +
                    "A " + R + " " + R + " 0 0 1 " + inner_xps[1].x + " " + inner_xps[1].y + " " +
                    "A " + R + " " + R + " 0 0 1 " + inner_xps[2].x + " " + inner_xps[2].y + " " +
                    "A " + R + " " + R + " 0 0 1 " + inner_xps[0].x + " " + inner_xps[0].y;
            return pathTable;
        };
        Color.prototype.appendCircles = function (svg, angle, names, items) {
            var pathTable = this.calcPaths(angle, D_CENTER, names);
            for (var name_6 in pathTable) {
                var path = Lib.Svg.path(pathTable[name_6], "transparent", "transparent");
                svg.appendChild(path);
                items[name_6] = path;
            }
        };
        Color.prototype.getOffset = function () {
            return (parseFloat(this.elem.offset.value) - this.vCenter) / this.vWidth * 2;
        };
        Color.prototype.setOffset = function (offset) {
            this.elem.offset.value = "" + (this.vCenter + offset * this.vWidth / 2);
            var D = D_CENTER - offset * D_WIDTH;
            var pathTable = this.calcPaths(150, D, ["r", "g", "b"]);
            for (var name_7 in pathTable) {
                this.itemTable[name_7].setAttribute("d", pathTable[name_7]);
            }
            pathTable = this.calcPaths(330, D, ["c", "m", "y"]);
            for (var name_8 in pathTable) {
                this.itemTable[name_8].setAttribute("d", pathTable[name_8]);
            }
        };
        return Color;
    }());
    Lib.executeOnDomLoad(Color.initialize);
})(Color || (Color = {}));
