"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        let ret = {};
        for (let name in src) {
            ret[name] = src[name];
        }
        return ret;
    }
    Lib.cloneHash = cloneHash;
    var gDebgugWindow = null;
    function argumentsToMessage(...args) {
        var message = "";
        if (args.length > 0) {
            message = args[0];
            for (var i = 1; i < args.length; i++) {
                message += "," + args[i].toString();
            }
        }
        return message;
    }
    function debugOutput(...args) {
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
    function infoOutputFixed(...args) {
        var message = argumentsToMessage(args);
        var pElement = document.createElement("p");
        pElement.appendChild(document.createTextNode(message));
        var infoDiv = document.getElementById("info");
        if (infoDiv == null) {
            infoDiv = Lib.Dom.elem("div", { style: { position: "fixed", top: "10px", left: "10px", border: "solid 2px #faa", backgroundColor: "#fee" } });
            Lib.Dom.append(document.body, infoDiv);
        }
        infoDiv.appendChild(pElement);
    }
    Lib.infoOutputFixed = infoOutputFixed;
    function infoOutput(...args) {
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
    function doNothing(..._) {
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
            let newHandler = handler;
            setExecuteOnLoadHandler("load", image, () => { newHandler(image); });
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
    class StableHash {
        constructor() {
            this.list = [];
            this.table = {};
        }
        push(key, value) {
            if (this.table[key] == undefined) {
                this.list.push(key);
                this.table[key] = value;
            }
        }
        get(key) {
            return this.table[key];
        }
        forEach(callback) {
            let list = this.list.concat();
            for (let i = 0; i < list.length; i++) {
                let key = list[i];
                if (callback(key, this.table[key], i) === false) {
                    break;
                }
            }
        }
        remove(key) {
            let index = this.list.indexOf(key);
            if (index >= 0) {
                this.list.splice(index, 1);
            }
            if (this.table[key]) {
                delete this.table[key];
            }
        }
        keys() {
            return this.list.concat();
        }
        values() {
            return this.list.map((key) => { return this.table[key]; });
        }
        count() {
            return this.list.length;
        }
        map(callback) {
            return this.list.map((key, index) => {
                return callback(key, this.table[key], index);
            });
        }
        freeze() {
            Object.freeze(this.list);
            Object.freeze(this.table);
        }
    }
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
    function randomPick(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    Lib.randomPick = randomPick;
    function randomPop(array) {
        const len = array.length;
        if (len <= 0) {
            return undefined;
        }
        return array.splice(Math.floor(Math.random() * len), 1)[0];
    }
    Lib.randomPop = randomPop;
    function weightedRandomPop(array, weights) {
        const len = array.length;
        if (len <= 0) {
            return undefined;
        }
        let index;
        if (typeof (weights) === "function") {
            index = weightedItemChoice(array, weights);
        }
        else {
            index = weightedChoice(weights);
            weights.splice(index, 1)[0];
        }
        return array.splice(index, 1)[0];
    }
    Lib.weightedRandomPop = weightedRandomPop;
    function weightedChoice(weights) {
        const sum = weights.reduce((a, c) => a + c);
        let value = Math.random() * sum;
        for (let i = 0; i < weights.length - 1; i++) {
            value -= weights[i];
            if (value < 0) {
                return i;
            }
        }
        return weights.length - 1;
    }
    function weightedItemChoice(items, getWeightFunc) {
        const sum = items.reduce((a, c) => a + getWeightFunc(c), 0);
        let value = Math.random() * sum;
        for (let i = 0; i < items.length - 1; i++) {
            value -= getWeightFunc(items[i]);
            if (value < 0) {
                return i;
            }
        }
        return items.length - 1;
    }
    class BaseException extends Error {
        constructor(message) {
            super(message);
            this.name = new.target.name;
            Object.setPrototypeOf(this, new.target.prototype);
        }
    }
    Lib.BaseException = BaseException;
    function shuffle(array) {
        for (let i = 0; i < array.length; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }
    }
    Lib.shuffle = shuffle;
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
    let Dom;
    (function (Dom) {
        class NodeNotFound extends Error {
            constructor(message) {
                super(message);
                this.name = new.target.name;
                Object.setPrototypeOf(this, new.target.prototype);
            }
        }
        Dom.NodeNotFound = NodeNotFound;
        function elem(name, ...args) {
            const element = document.createElement(name);
            for (const arg of args) {
                if (arg instanceof Node || typeof arg === "number" || typeof arg === "string" || Array.isArray(arg)) {
                    append(element, arg);
                }
                else {
                    setAttributes(element, arg);
                }
            }
            return element;
        }
        Dom.elem = elem;
        function setAttributes(element, attributes) {
            if (attributes) {
                let aName;
                for (aName in attributes) {
                    let match;
                    if (aName === "style") {
                        const style = attributes.style;
                        if (style) {
                            let sName;
                            for (sName in style) {
                                const sValue = style[sName];
                                if (sValue) {
                                    element.style[sName] = sValue;
                                }
                            }
                        }
                    }
                    else if (aName === "dataset") {
                        const dataset = attributes.dataset;
                        if (dataset) {
                            for (const sName in dataset) {
                                element.dataset[sName] = dataset[sName];
                            }
                        }
                    }
                    else {
                        const aValue = attributes[aName];
                        if (aValue === undefined || aValue === null) {
                            continue;
                        }
                        if (aName === "className") {
                            element.setAttribute("class", "" + aValue);
                        }
                        else {
                            const aNameStr = aName.toString();
                            if ((match = aNameStr.match(/^on(.*)/))) {
                                let event = match[1];
                                if (aValue instanceof Function) {
                                    element.addEventListener(event, aValue); // any: EventListener
                                }
                                else if (aValue instanceof Object && aValue.hasOwnProperty("handleEvent")) {
                                    element.addEventListener(event, aValue); // any: EventListenerObject
                                }
                                else {
                                    throw new NodeNotFound("invalid event handler specified for \"" + aName + "\"");
                                }
                            }
                            else {
                                element.setAttribute(aNameStr, "" + aValue);
                            }
                        }
                    }
                }
            }
        }
        Dom.setAttributes = setAttributes;
        function input(type, ...args) {
            let element = elem("input", ...args);
            element.type = type;
            return element;
        }
        Dom.input = input;
        function checkbox(label, attributes) {
            let checkbox = input("checkbox");
            if (attributes) {
                setAttributes(checkbox, attributes);
            }
            let element = elem("label", checkbox, label);
            return {
                checkbox: checkbox,
                label: element,
            };
        }
        Dom.checkbox = checkbox;
        function radio(label, attributes) {
            let radio = input("radio");
            if (attributes) {
                setAttributes(radio, attributes);
            }
            let element = elem("label", radio, label);
            return {
                radio: radio,
                label: element,
            };
        }
        Dom.radio = radio;
        function em(...args) {
            return elem("em", ...args);
        }
        Dom.em = em;
        function span(...args) {
            return elem("span", ...args);
        }
        Dom.span = span;
        function tr(...args) {
            const tr = elem("tr");
            for (const item of args) {
                if (item instanceof HTMLTableCellElement) {
                    append(tr, item);
                }
                else {
                    append(tr, td(item));
                }
            }
            return tr;
        }
        Dom.tr = tr;
        function td(...args) {
            return elem("td", ...args);
        }
        Dom.td = td;
        function q(...args) {
            return elem("q", ...args);
        }
        Dom.q = q;
        function radiosWithState(name, attributes, ...items) {
            const radios = Dom.radios(name, attributes, ...items);
            let checked;
            for (const radio of radios.radios) {
                if (radio.checked) {
                    checked = radio.value;
                    break;
                }
            }
            const state = { value: checked };
            for (const radio of radios.radios) {
                addEventListener(radio, "click", (function (state, value) {
                    return () => { state.value = value; };
                })(state, radio.value));
            }
            return { labels: radios.labels, radios: radios.radios, state: state };
        }
        Dom.radiosWithState = radiosWithState;
        function radioSelecterCallbackMaker(value, callback) {
            return () => callback(value);
        }
        function radioSelecter(name, items, checked, callback) {
            const labels = [];
            for (const item of items) {
                let value, label;
                if (typeof (item) === "string") {
                    value = label = item;
                }
                else {
                    value = item[0];
                    label = item[1];
                }
                const radio = input("radio", { name: name, value: value });
                if (checked === value) {
                    radio.checked = true;
                }
                const labelElem = elem("label", radio, label);
                if (callback) {
                    addEventListener(labelElem, "click", radioSelecterCallbackMaker(value, callback));
                }
                labels.push(labelElem);
            }
            if (checked !== null && checked !== undefined && callback) {
                callback(checked);
            }
            return labels;
        }
        Dom.radioSelecter = radioSelecter;
        function radios(name, attributes, ...items) {
            let firstRadio = null;
            let radios = [];
            let labels = [];
            let checked = false;
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                let value;
                let label;
                let additionalAttributes;
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
                let { radio, label: radioLabel } = Dom.radio(label, attributes);
                radio.name = name;
                radio.value = value;
                setAttributes(radio, additionalAttributes);
                if (radio.checked) {
                    checked = true;
                }
                if (!firstRadio) {
                    firstRadio = radio;
                }
                radios.push(radio);
                labels.push(radioLabel);
            }
            if (!checked && firstRadio) {
                firstRadio.checked = true;
            }
            return { labels, radios };
        }
        Dom.radios = radios;
        function text(str) {
            return document.createTextNode(str.toString());
        }
        Dom.text = text;
        function findElement(id) {
            const element = document.getElementById(id);
            if (element instanceof HTMLElement) {
                return element;
            }
            else {
                return undefined;
            }
        }
        Dom.findElement = findElement;
        function getElement(id) {
            const element = findElement(id);
            if (element) {
                return element;
            }
            else {
                throw new NodeNotFound("cannot find target with id \"" + id + "\"");
            }
        }
        Dom.getElement = getElement;
        function getFirstText(element) {
            let result = findFirstText(element);
            if (result) {
                return result;
            }
            else {
                throw new NodeNotFound("has no child");
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
        function insertBefore(newNode, existingNode) {
            const parent = existingNode.parentNode;
            if (parent === null) {
                throw new NodeNotFound("not in tree");
            }
            parent.insertBefore(newNode, existingNode);
        }
        Dom.insertBefore = insertBefore;
        function insertAfter(newNode, existingNode) {
            const parent = existingNode.parentNode;
            if (parent === null) {
                throw new NodeNotFound("not in tree");
            }
            parent.insertBefore(newNode, existingNode.nextSibling);
        }
        Dom.insertAfter = insertAfter;
        function insertFirst(target, ...args) {
            let list = [];
            Lib.forEachRecursive(args, (item) => list.push(item));
            let element = prepareTarget(target);
            for (let i = list.length - 1; i >= 0; i--) {
                element.insertBefore(toElement(list[i]), element.firstChild);
            }
        }
        Dom.insertFirst = insertFirst;
        function append(target, ...args) {
            let element = prepareTarget(target);
            Lib.forEachRecursive(args, (item) => addOne(element, item));
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
            let element = prepareTarget(target);
            let c;
            while (c = element.firstChild) {
                element.removeChild(c);
            }
        }
        Dom.clear = clear;
        function hasClass(target, value) {
            let element = prepareTarget(target);
            return element.className !== undefined && (" " + element.className + " ").indexOf(" " + value + " ") >= 0;
        }
        Dom.hasClass = hasClass;
        function appendClass(target, value) {
            let element = prepareTarget(target);
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
        Dom.appendClass = appendClass;
        function remove(target) {
            const parent = target.parentNode;
            if (parent) {
                parent.removeChild(target);
            }
        }
        Dom.remove = remove;
        function removeClass(target, value) {
            let element = prepareTarget(target);
            if (element.className === undefined || element.className == "") {
                return "";
            }
            else {
                let classNames = element.className.split(" ");
                let newClassNames = [];
                for (let i = 0; i < classNames.length; i++) {
                    let name = classNames[i];
                    if (name.length > 0 && name != value) {
                        newClassNames.push(name);
                    }
                }
                return element.className = newClassNames.join(" ");
            }
        }
        Dom.removeClass = removeClass;
        function eachChild(element, task) {
            for (let node = element.firstChild; node; node = node.nextSibling) {
                if (task(node) === "break") {
                    return false;
                }
            }
            return true;
        }
        Dom.eachChild = eachChild;
        function eachChildElement(element, task) {
            return eachChild(element, (child) => {
                if (child instanceof HTMLElement) {
                    return task(child);
                }
            });
        }
        Dom.eachChildElement = eachChildElement;
        function eachChildTag(element, name, task) {
            name = name.toLowerCase();
            return eachChildElement(element, (child) => {
                if (child.tagName.toLowerCase() === name) {
                    return task(child);
                }
            });
        }
        Dom.eachChildTag = eachChildTag;
        // returns false iff task returns "break"
        function eachDescendant(element, task) {
            const result = task(element);
            if (result === "break") {
                return false;
            }
            if (result === "skip") {
                return true;
            }
            return eachChild(element, (child) => {
                if (!eachDescendant(child, task)) {
                    return "break";
                }
                return;
            });
        }
        Dom.eachDescendant = eachDescendant;
        function eachDescendantElement(element, task) {
            return eachDescendant(element, (child) => {
                if (child instanceof HTMLElement) {
                    return task(child);
                }
            });
        }
        Dom.eachDescendantElement = eachDescendantElement;
        function eachDescendantTag(element, name, task) {
            name = name.toLowerCase();
            return eachDescendantElement(element, (child) => {
                if (child.tagName.toLowerCase() === name) {
                    return task(child);
                }
            });
        }
        Dom.eachDescendantTag = eachDescendantTag;
        /*
                export function forEachTag<N extends TagName>(element: Element | Document, name: N, task: (element: ElementTypeOf<N>)=>void){
                    if(element instanceof Element && element.tagName.toLowerCase() === name){
                        task(element as any);
                    }
                    let children = element.getElementsByTagName(name);
                    for(let i = 0; i < children.length; i ++){
                        task(children[i]);
                    }
                }
        */ /*
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
        function cloneShallow(element) {
            const newElement = elem(element.nodeName.toLowerCase());
            for (let i = 0; i < element.attributes.length; i++) {
                let attribute = element.attributes[i];
                if (attribute.name == "style") {
                    let subTable = element.style;
                    for (let sName in subTable) {
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
                    let match = attribute.name.match(/^data-(.*)/);
                    if (match == null) {
                        newElement.setAttribute(attribute.name, attribute.value);
                    }
                }
            }
            for (let name in element.dataset) {
                newElement.dataset[name] = element.dataset[name];
            }
            return newElement;
        }
        Dom.cloneShallow = cloneShallow;
        function clone(element) {
            const newElement = cloneShallow(element);
            for (let child = element.firstChild; child != null; child = child.nextSibling) {
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
        function getCanvasContext2D(canvas) {
            const context = canvas.getContext("2d");
            if (context instanceof CanvasRenderingContext2D) {
                return context;
            }
            throw new NodeNotFound("cannot get canvas context 2D");
        }
        function canvas2D(attributes) {
            const canvas = elem("canvas");
            if (attributes) {
                setAttributes(canvas, attributes);
            }
            return { canvas, context: getCanvasContext2D(canvas) };
        }
        Dom.canvas2D = canvas2D;
        function getCanvas(id) {
            const canvas = getElementWithType(HTMLCanvasElement, id);
            return { canvas, context: getCanvasContext2D(canvas) };
        }
        Dom.getCanvas = getCanvas;
        class ElementWithText {
            constructor(element, text) {
                this.element = element;
                this.text = text;
                this.style = this.element.style;
            }
            static create(tagName, text, attributes) {
                const textNode = Dom.text(text);
                const element = elem(tagName, textNode);
                if (attributes) {
                    setAttributes(element, attributes);
                }
                return new ElementWithText(element, textNode);
            }
            set(text) {
                this.text.nodeValue = text.toString();
            }
            get() {
                return this.text.nodeValue || "";
            }
        }
        Dom.ElementWithText = ElementWithText;
        function innerText(target) {
            if (target instanceof Text) {
                return target.nodeValue || "";
            }
            else {
                const elem = prepareTarget(target);
                let text = "";
                eachDescendant(elem, (node) => {
                    if (node instanceof Text) {
                        text += node.nodeValue;
                    }
                });
                return text;
            }
        }
        Dom.innerText = innerText;
        function findFirstText(elem) {
            let text = null;
            eachDescendant(elem, (node) => {
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
            const str = value.toString();
            if (eachDescendant(elem, (node) => {
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
            const nameUC = name.toUpperCase();
            let elem_found = null;
            eachDescendant(elem, (node) => {
                if (node instanceof HTMLElement && node.tagName.toUpperCase() == nameUC) {
                    elem_found = node; // node.tagName.toUpperCase() == nameUC implyies
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
            for (const id in table) {
                getElementWithType(type, id).addEventListener(event_name, table[id], useCapture);
            }
        }
        Dom.setEventListeners = setEventListeners;
        function getTypedElement(id, TYPE) {
            const element = document.getElementById(id);
            if (element) {
                if (element instanceof TYPE) {
                    return element;
                }
                else {
                    throw new NodeNotFound("element with id = " + id + " has invalid class");
                }
            }
            else {
                throw new NodeNotFound("cannot find target: " + id);
            }
        }
        Dom.getTypedElement = getTypedElement;
        const IdTable = {};
        function createId(name) {
            if (name === undefined) {
                name = "";
            }
            let index = IdTable[name];
            if (index === undefined) {
                index = 0;
            }
            else {
                index++;
            }
            while (true) {
                const id = name + index;
                if (!document.getElementById(id)) {
                    IdTable[name] = index;
                    return id;
                }
                index++;
            }
        }
        Dom.createId = createId;
        function replace(oldElem, newElem) {
            const parent = oldElem.parentNode;
            if (parent === null) {
                throw new NodeNotFound("node is not in tree");
            }
            parent.insertBefore(newElem, oldElem);
            parent.removeChild(oldElem);
        }
        Dom.replace = replace;
        function findElementWithType(TYPE, id) {
            const element = document.getElementById(id);
            if (element && element instanceof TYPE) {
                return element;
            }
            else {
                return null;
            }
        }
        Dom.findElementWithType = findElementWithType;
        function getElementWithType(TYPE, id) {
            const element = findElementWithType(TYPE, id);
            if (element) {
                return element;
            }
            else {
                throw new NodeNotFound("cannot find target: " + id);
            }
        }
        Dom.getElementWithType = getElementWithType;
        function getInput(id) {
            return getElementWithType(HTMLInputElement, id);
        }
        Dom.getInput = getInput;
        function getTextArea(id) {
            return getElementWithType(HTMLTextAreaElement, id);
        }
        Dom.getTextArea = getTextArea;
        function getForm(id) {
            return getElementWithType(HTMLFormElement, id);
        }
        Dom.getForm = getForm;
        function getElementWithText(id) {
            const element = getElement(id);
            const text = getFirstText(element);
            return new ElementWithText(element, text);
        }
        Dom.getElementWithText = getElementWithText;
        function getSpecifiedItems(getFunction, ids) {
            const table = {};
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                table[id] = getFunction(id);
            }
            return table;
        }
        function getTexts(...ids) {
            return getSpecifiedItems((id) => getFirstText(getElement(id)), ids);
        }
        Dom.getTexts = getTexts;
        function getElementsWithText(...ids) {
            return getSpecifiedItems((id) => getElementWithText(id), ids);
        }
        Dom.getElementsWithText = getElementsWithText;
        function getTypedElements(ids, elementClass) {
            return getSpecifiedItems((id) => getElementWithType(elementClass, id), ids);
        }
        Dom.getTypedElements = getTypedElements;
        function getElements(...idList) {
            return getTypedElements(idList, HTMLElement);
        }
        Dom.getElements = getElements;
        function getInputs(...idList) {
            return getTypedElements(idList, HTMLInputElement);
        }
        Dom.getInputs = getInputs;
        function getOutputs(...idList) {
            return getTypedElements(idList, HTMLOutputElement);
        }
        Dom.getOutputs = getOutputs;
        function getForms(...idList) {
            return getTypedElements(idList, HTMLFormElement);
        }
        Dom.getForms = getForms;
        function getSelects(...idList) {
            return getTypedElements(idList, HTMLSelectElement);
        }
        Dom.getSelects = getSelects;
        function getOptions(...idList) {
            return getTypedElements(idList, HTMLOptionElement);
        }
        Dom.getOptions = getOptions;
        function getAnchors(...idList) {
            return getTypedElements(idList, HTMLAnchorElement);
        }
        Dom.getAnchors = getAnchors;
        function getTextAreas(...idList) {
            return getTypedElements(idList, HTMLTextAreaElement);
        }
        Dom.getTextAreas = getTextAreas;
        function getImages(...idList) {
            return getTypedElements(idList, HTMLImageElement);
        }
        Dom.getImages = getImages;
        function combineTables(t1, t2, t3, t4, t5, t6, t7, t8, t9) {
            /*			const table: Partial<
                            T1 &
                            T2 &
                            T3 &
                            T4 &
                            T5 &
                            T6 &
                            T7 &
                            T8 &
                            T9
                        > = {};*/
            const table = {};
            for (const t of [
                t1,
                t2,
                t3,
                t4,
                t5,
                t6,
                t7,
                t8,
                t9,
            ]) {
                if (t) {
                    for (const name in t) {
                        table[name] = t[name]; // 
                    }
                }
            }
            return table;
        }
        Dom.combineTables = combineTables;
        function findInput(id) {
            return findElementWithType(HTMLInputElement, id);
        }
        Dom.findInput = findInput;
        function setFormDisabled(form, disabled) {
            for (let i = 0; i < form.elements.length; i++) {
                const element = form.elements[i];
                if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
                    element.disabled = disabled;
                }
            }
        }
        Dom.setFormDisabled = setFormDisabled;
        function enableForm(form) {
            setFormDisabled(form, false);
        }
        Dom.enableForm = enableForm;
        function disableForm(form) {
            setFormDisabled(form, true);
        }
        Dom.disableForm = disableForm;
    })(Dom = Lib.Dom || (Lib.Dom = {}));
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function gcm(a, b) {
        let minus_flag = false;
        if (a < 0) {
            a = -a;
            minus_flag = !minus_flag;
        }
        if (b < 0) {
            b = -b;
            minus_flag = !minus_flag;
        }
        if (a < b) {
            let tmp = b;
            b = a;
            a = tmp;
        }
        while (b != 0) {
            let tmp = a % b;
            a = b;
            b = tmp;
        }
        if (minus_flag) {
            return -a;
        }
        else {
            return a;
        }
    }
    Lib.gcm = gcm;
    function bsearch(min, max, cond) {
        if (max < min) {
            return -1;
        }
        if (!cond(max)) {
            return -1;
        }
        while (min < max) {
            let mid = Math.floor((min + max) / 2);
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
    class PositionPair {
        constructor(m1, m2) {
            this.m1 = m1;
            this.m2 = m2;
        }
        add(v) {
            return new PositionPair(this.m1.add(v.m1), this.m2.add(v.m2));
        }
        sub(p) {
            return new VectorPair(this.m1.sub(p.m1), this.m2.sub(p.m2));
        }
        equals(p) {
            if (this === p) {
                return true;
            }
            else if (p instanceof VectorPair) {
                return this.m1.equals(p.m1) && this.m2.equals(p.m2);
            }
            else {
                return false;
            }
        }
        toString() {
            return this.m1.toString() + "-" + this.m2.toString();
        }
    }
    Lib.PositionPair = PositionPair;
    class VectorPair extends PositionPair {
        add(v) {
            return new VectorPair(this.m1.add(v.m1), this.m2.add(v.m2));
        }
        neg() {
            return new VectorPair(this.m1.neg(), this.m2.neg());
        }
        mul(s) {
            return new VectorPair(this.m1.mul(s), this.m2.mul(s));
        }
        div(s) {
            return new VectorPair(this.m1.div(s), this.m2.div(s));
        }
        isZero() {
            return this.m1.isZero() && this.m2.isZero();
        }
    }
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
        for (let j = i + 1; j < cols; j++) {
            if (matrix[j][i] != 0) {
                return j;
            }
        }
        return -1;
    }
    function gaussianElimination(matrix) {
        let rows = matrix.length;
        let cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (let i = 0; i < cols; i++) {
            if (matrix[i][i] == 0) {
                let r = findRowToReplace(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                let tmpRow = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmpRow;
            }
            let p = matrix[i][i];
            if (p != 1) {
                for (let j = i; j <= rows; j++) {
                    matrix[i][j] /= p;
                }
            }
            for (let j = 0; j < cols; j++) {
                if (j != i) {
                    let n = matrix[j][i];
                    if (n != 0) {
                        for (let k = i; k <= rows; k++) {
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
        for (let j = i + 1; j < cols; j++) {
            if (!matrix[j][i].isZero()) {
                return j;
            }
        }
        return -1;
    }
    function gaussianEliminationForObj(matrix, one) {
        let rows = matrix.length;
        let cols = matrix[0].length - 1;
        if (rows != cols) {
            return false;
        }
        for (let i = 0; i < cols; i++) {
            if (matrix[i][i].isZero()) {
                let r = findRowToReplaceForObj(matrix, cols, i);
                if (r < 0) {
                    return false;
                }
                let tmpRow = matrix[r];
                matrix[r] = matrix[i];
                matrix[i] = tmpRow;
            }
            let p = matrix[i][i];
            if (!p.equals(one)) {
                for (let j = i; j <= rows; j++) {
                    matrix[i][j] = matrix[i][j].div(p);
                }
            }
            for (let j = 0; j < cols; j++) {
                if (j != i) {
                    let n = matrix[j][i];
                    if (!n.isZero()) {
                        for (let k = i; k <= rows; k++) {
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
            const varList = [];
            let varCount = 0;
            for (let v in equations[0]) {
                if (v != "_") {
                    varList[varCount++] = v;
                }
            }
            if (varCount > equations.length) {
                return null;
            }
            const matrix = [];
            for (let i = 0; i < equations.length; i++) {
                const equation = equations[i];
                const line = [];
                for (let j = 0; j < varCount; j++) {
                    line.push(equation[varList[j]]);
                }
                line.push(equation["_"]);
                matrix.push(line);
            }
            if (solver(matrix)) {
                const solution = {};
                for (let j = 0; j < varCount; j++) {
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
        return SolveLinearEquation(equations, (matrix) => gaussianEliminationForObj(matrix, one));
    }
    Lib.solveLinearEquationVec = solveLinearEquationVec;
    function solveLinearEquation(equations) {
        return SolveLinearEquation(equations, gaussianElimination);
    }
    Lib.solveLinearEquation = solveLinearEquation;
    function outputMatrix(matrix) {
        for (let j = 0; j < matrix.length; j++) {
            let line = "";
            for (let k = 0; k < matrix[j].length; k++) {
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
//interface NumberConstructor { MAX_SAFE_INTEGER: number; } 
//interface NumberConstructor { MIN_SAFE_INTEGER: number; } 
var Lib;
// Should not be used. Ineffective implementation and not tested weel.
/// <reference path="./mylib.algorithm.ts" />
/// <reference path="./mylib.linear_algebra.ts" />
//interface NumberConstructor { MAX_SAFE_INTEGER: number; } 
//interface NumberConstructor { MIN_SAFE_INTEGER: number; } 
(function (Lib) {
    const PRIME_TEST_COUNT = 20;
    class BigInteger {
        constructor(parser, values, minus = false) {
            this.parser = parser;
            this.values = values;
            this.minus = minus;
            let index = this.values.length - 1;
            while (index > 0 && this.values[index] == 0) {
                this.values.pop();
                index--;
            }
            if (BigInteger.LimitLength > 0 && this.values.length > BigInteger.LimitLength) {
                throw new BigInteger.TooLargeError("number of values " + this.values.length + " exceeds the limit " + BigInteger.LimitLength);
            }
        }
        static setLimitLength(limitLength) {
            BigInteger.LimitLength = limitLength;
        }
        toInteger() {
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
        }
        toNumber() {
            let ret = 0;
            for (let i = this.values.length - 1; i >= 0; i--) {
                ret = ret * this.parser.radix + this.values[i];
            }
            if (this.minus) {
                return -ret;
            }
            else {
                return ret;
            }
        }
        static addRaw(d1, d2, radix) {
            let values = [];
            let rest = 0;
            let l1 = d1.length;
            let l2 = d2.length;
            let ls = l1 < l2 ? l1 : l2;
            let i = 0;
            while (i < ls) {
                let n = d1[i] + d2[i] + rest;
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
                let n = d1[i] + rest;
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
                let n = d2[i] + rest;
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
        }
        // require: d1 > d2
        static subRaw(d1, d2, radix) {
            let values = [];
            let rest = 0;
            let l1 = d1.length;
            let l2 = d2.length;
            let i = 0;
            if (l2 > l1) {
                throw new BigInteger.Error("fatal error");
            }
            while (i < l2) {
                let n = d1[i] - d2[i] - rest;
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
                let n = d1[i] - rest;
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
                throw new BigInteger.Error("fatal error");
            }
            return values;
        }
        getDigit(i) {
            if (i >= 0 && i < this.values.length) {
                return this.values[i];
            }
            else {
                return 0;
            }
        }
        neg() {
            if (this.isZero()) {
                return this;
            }
            else {
                return this.parser.construct(this.values, !this.minus);
            }
        }
        abs() {
            if (this.minus) {
                return this.parser.construct(this.values, false);
            }
            else {
                return this;
            }
        }
        add(num) {
            let val = this.parser.parse(num);
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
        }
        sub(num) {
            let val = this.parser.parse(num);
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
        }
        isZero() {
            return this.values.length == 1 && this.values[0] == 0;
        }
        comp(num) {
            let val = this.parser.parse(num);
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
            for (let i = this.values.length - 1; i >= 0; i--) {
                let d1 = this.values[i];
                let d2 = val.values[i];
                if (d1 > d2) {
                    return 1;
                }
                else if (d1 < d2) {
                    return -1;
                }
            }
            return 0;
        }
        mulOne(num) {
            let i = 0;
            let rest = 0;
            let values = [];
            let radix = this.parser.radix;
            let minus = this.minus;
            if (num < 0) {
                minus = !minus;
                num = -num;
            }
            while (i < this.values.length) {
                let n = this.getDigit(i) * num + rest;
                let m = n % radix;
                values.push(m);
                rest = (n - m) / radix;
                i++;
            }
            while (rest > 0) {
                let m = rest % radix;
                values.push(m);
                rest = (rest - m) / radix;
            }
            return this.parser.construct(values, minus);
        }
        mul(num) {
            if (typeof num === "number") {
                let minus;
                if (num < 0) {
                    num = -num;
                    minus = true;
                }
                else {
                    minus = false;
                }
                if (num < BigInteger.MAX_RADIX) {
                    let result = this.mulOne(num);
                    if (minus) {
                        result = result.neg();
                    }
                    return result;
                }
            }
            let val = this.parser.parse(num);
            let ret = this.parser.ZERO;
            for (let i = 0; i < val.values.length; i++) {
                let tmpValues = this.mulOne(val.getDigit(i)).values.concat();
                for (let j = 0; j < i; j++) {
                    tmpValues.unshift(0);
                }
                ret = ret.add(this.parser.construct(tmpValues, false));
            }
            if (this.minus !== val.minus) {
                ret = ret.neg();
            }
            return ret;
        }
        divmod(num) {
            let val = this.parser.parse(num);
            if (val.isZero()) {
                throw new BigInteger.Error("divide by 0");
            }
            let rest = this;
            let res = [];
            let nMinus = rest.minus;
            let dMinus = val.minus;
            rest = rest.abs();
            val = val.abs();
            let i = 0;
            let tmp = val;
            while (true) {
                let tmp2 = this.parser.construct([0].concat(tmp.values), false);
                if (rest.comp(tmp2) < 0) {
                    break;
                }
                tmp = tmp2;
                i++;
            }
            while (true) {
                let n = tmp.values.length - 1;
                let d1 = rest.getDigit(n + 1) * this.parser.radix + rest.getDigit(n);
                let d2 = tmp.getDigit(n) + 1;
                let guess = Math.floor(d1 / d2);
                guess = Lib.bsearch(guess, this.parser.radix, (n) => {
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
            let quo = this.parser.construct(res, false);
            let rem = rest;
            if (nMinus) {
                if (dMinus) {
                    rem = rem.neg();
                }
                else {
                    if (rem.isZero()) {
                        quo = quo.neg();
                    }
                    else {
                        rem = val.sub(rem);
                        quo = quo.neg().sub(1);
                    }
                }
            }
            else {
                if (dMinus) {
                    if (rem.isZero()) {
                        quo = quo.neg();
                    }
                    else {
                        rem = val.sub(rem).neg();
                        quo = quo.neg().sub(1);
                    }
                }
            }
            return { quo, rem };
        }
        div(num) {
            return this.divmod(num).quo;
        }
        mod(num) {
            return this.divmod(num).rem;
        }
        divmodOne(num) {
            if (num == 0) {
                throw new BigInteger.Error("divide by 0");
            }
            let rest = 0;
            let res = [];
            for (let i = this.values.length - 1; i >= 0; i--) {
                let n = this.values[i] + rest * this.parser.radix;
                let m = n % num;
                res.unshift((n - m) / num);
                rest = m;
            }
            return { quo: this.parser.construct(res, false), rem: rest };
        }
        equals(num) {
            return this.comp(num) == 0;
        }
        pow(power, law) {
            let val = BigInteger.MaxRadixBin.parse(power);
            let res = this.parser.ONE;
            let n = this;
            if (law != undefined) {
                let lawVal = this.parser.parse(law);
                let i = 0;
                while (true) {
                    let bit = val.getBit(i);
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
                let i = 0;
                while (true) {
                    let bit = val.getBit(i);
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
        }
        /*			shift(numBits: number): BigInteger{
                    return MaxRadixBin.parse(this).shift(numBits);
                }
        */
        isPrime() {
            let n = this;
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
            let d = n.sub(this.parser.ONE);
            while (true) {
                let r = d.divmodOne(2);
                if (r.rem != 0) {
                    break;
                }
                d = r.quo;
            }
            let nM1 = n.sub(this.parser.ONE);
            let nM2 = n.sub(this.parser.TWO);
            for (let i = 0; i < PRIME_TEST_COUNT; i++) {
                let a = nM2.random().add(this.parser.ONE);
                let t = d;
                let y = a.pow(t, n);
                while (!t.equals(nM1) && !y.equals(this.parser.ONE) && !y.equals(nM1)) {
                    y = y.mul(y).mod(n);
                    t = t.mulOne(2);
                }
                if (!y.equals(nM1) && t.getBit(0) == 0) {
                    return false;
                }
            }
            return true;
        }
        random() {
            let rand = [];
            for (let i = 0; i < this.values.length; i++) {
                rand.push(Math.floor(Math.random() * this.parser.radix));
            }
            let result = this.mul(this.parser.construct(rand, false));
            return this.parser.construct(result.values.slice(this.values.length), false);
        }
        factorize() {
            if (this.equals(BigInteger.ONE)) {
                return [this];
            }
            const factors = [];
            let n = this;
            let m = BigInteger.TWO;
            while (true) {
                const divmod = n.divmod(m);
                if (divmod.rem.isZero()) {
                    factors.push(m);
                    n = divmod.quo;
                }
                else {
                    m = m.add(1);
                }
                if (m.mul(m).comp(n) > 0) {
                    factors.push(n);
                    break;
                }
            }
            return factors;
        }
        toString() {
            return BigInteger.MaxRadixDec.parse(this).toString();
        }
        gcm(num) {
            let a = this.abs();
            let b = this.parser.parse(num).abs();
            if (a.comp(b) < 0) {
                let tmp = b;
                b = a;
                a = tmp;
            }
            while (!b.isZero()) {
                let tmp = a.mod(b);
                a = b;
                b = tmp;
            }
            return a;
        }
        getBit(digit) {
            return BigInteger.MaxRadixBin.parse(this).getBit(digit);
        }
    }
    BigInteger.LimitLength = 0;
    Lib.BigInteger = BigInteger;
    const ExternalError = Error;
    (function (BigInteger) {
        class Error extends ExternalError {
            constructor(message = "") {
                super(message);
                this.message = message;
                this.name = new.target.name;
                Object.setPrototypeOf(this, new.target.prototype);
            }
        }
        BigInteger.Error = Error;
        class TooLargeError extends Error {
            constructor(message) {
                super(message);
                this.name = new.target.name;
                Object.setPrototypeOf(this, new.target.prototype);
            }
        }
        BigInteger.TooLargeError = TooLargeError;
        BigInteger.MAX_SAFE_INTEGER = Number["MAX_SAFE_INTEGER"] === undefined ? 9007199254740991 : Number["MAX_SAFE_INTEGER"];
        BigInteger.MIN_SAFE_INTEGER = Number["MIN_SAFE_INTEGER"] === undefined ? -9007199254740991 : Number["MIN_SAFE_INTEGER"];
        // (radix - 1) * (radix - 1) + (radix - 1) <= MAX_SAFE_INTEGER;
        // radix ^ 2 - 2 radix + 1 + radix - 1 <= MAX_SAFE_INTEGER;
        // radix ^ 2 - radix - MAX_SAFE_INTEGER <= 0;
        // radix <= (1 + Math.sqrt(1 + 4 MAX_SAFE_INTEGER)) / 2
        BigInteger.MAX_RADIX = Math.floor((1 + Math.sqrt(1 + 4 * BigInteger.MAX_SAFE_INTEGER)) / 2);
        ;
        function createRadixTable(base) {
            let table = {};
            let safeMax = Math.floor(BigInteger.MAX_RADIX / base);
            let radix = base;
            let digits = 1;
            while (radix < safeMax) {
                table[radix] = digits;
                radix *= base;
                digits++;
            }
            table[radix] = digits;
            return { table: table, maxDigits: digits };
        }
        let { table: RADIX_TABLE_BIN, maxDigits: MAX_DIGITS_BIN } = createRadixTable(2);
        let { table: RADIX_TABLE_DEC, maxDigits: MAX_DIGITS_DEC } = createRadixTable(10);
        class ValueBin extends BigInteger {
            constructor(parser, values, minus) {
                super(parser, values, minus);
                this.parser = parser;
            }
            getBit(digit) {
                let bits = digit % this.parser.radixDigits;
                let index = (digit - bits) / this.parser.radixDigits;
                if (index >= this.values.length) {
                    return undefined;
                }
                else {
                    let val = this.values[index] >> bits;
                    if (index == this.values.length - 1 && val == 0) {
                        return undefined;
                    }
                    else {
                        return (val & 1) == 1 ? 1 : 0;
                    }
                }
            }
        }
        class ValueDec extends BigInteger {
            constructor(parser, values, minus) {
                super(parser, values, minus);
                this.parser = parser;
            }
            static formatDigit(digit, len) {
                let str = "" + digit;
                while (str.length < len) {
                    str = "0" + str;
                }
                return str;
            }
            toString() {
                let ret = "";
                if (this.minus) {
                    ret += "-";
                }
                let i = this.values.length - 1;
                ret += this.values[i--];
                let radixClass;
                let len = this.parser.radixDigits;
                while (i >= 0) {
                    ret += ValueDec.formatDigit(this.values[i], len);
                    i--;
                }
                return ret;
            }
        }
        class Parser {
            constructor(radix) {
                this.radix = radix;
                this.parse = (src) => {
                    if (src instanceof BigInteger) {
                        if (src.parser.equals(this)) {
                            return src;
                        }
                        if (src.isZero()) {
                            return this.ZERO;
                        }
                        let values = [];
                        let tmp = src.minus ? src.neg() : src;
                        while (!tmp.isZero()) {
                            let divmod = tmp.divmodOne(this.radix);
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
                        let minus = (src < 0);
                        let tmp = minus ? -src : src;
                        tmp = Math.ceil(tmp);
                        let values = [];
                        while (tmp > 0) {
                            let r = tmp % this.radix;
                            values.push(r);
                            tmp = (tmp - r) / this.radix;
                        }
                        return this.construct(values, minus);
                    }
                    else {
                        return this.parse(parseStringValue(src));
                    }
                };
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
                let parser = this;
                this.parser = function (source) {
                    return parser.parse(source);
                };
            }
            equals(obj) {
                if (this === obj) {
                    return true;
                }
                if (obj instanceof Parser) {
                    return this.radix == obj.radix;
                }
                return false;
            }
            construct(values, minus) {
                return new BigInteger(this, values, minus);
            }
        }
        BigInteger.Parser = Parser;
        class ParserDec extends Parser {
            constructor(radixDigits) {
                super(Math.pow(10, radixDigits));
                this.radixDigits = radixDigits;
            }
            construct(values, minus) {
                return new ValueDec(this, values, minus);
            }
        }
        BigInteger.ParserDec = ParserDec;
        class ParserBin extends Parser {
            constructor(radixDigits) {
                super(Math.pow(2, radixDigits));
                this.radixDigits = radixDigits;
            }
            construct(values, minus) {
                return new ValueBin(this, values, minus);
            }
        }
        BigInteger.ParserBin = ParserBin;
        function cutLeadingZeros(str) {
            let match = str.match(/^0+/);
            if (match) {
                return str.substring(match[0].length);
            }
            else {
                return str;
            }
        }
        function parseStringValueWithRadix(parser, charRadix, radixDigits, src, minus) {
            let numStr = cutLeadingZeros(src);
            let values = [];
            while (true) {
                let len = numStr.length;
                if (len == 0) {
                    break;
                }
                let cut = len > radixDigits ? radixDigits : len;
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
            let srcTmp;
            let match;
            let minus;
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
                let numStr = match[1] + match[2];
                if (numStr.length > 0) {
                    let pow1 = match[2].length;
                    let pow2 = parseInt(match[4], 10);
                    if (match[3] == "-") {
                        pow2 = -pow2;
                    }
                    let pow = pow1 - pow2;
                    let value = parseStringValueWithRadix(BigInteger.MaxRadixDec, 10, MAX_DIGITS_DEC, numStr, minus);
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
            throw new BigInteger.Error("invalid string : " + src);
        }
        const MAX_DIGITS_OCT = Math.floor(MAX_DIGITS_BIN / 3);
        const MAX_DIGITS_HEX = Math.floor(MAX_DIGITS_BIN / 4);
        function createParseFunction(radix) {
            let digits;
            if ((digits = RADIX_TABLE_BIN[radix]) != null) {
                return new ParserBin(digits).parser;
            }
            else if ((digits = RADIX_TABLE_DEC[radix]) != null) {
                return new ParserDec(digits).parser;
            }
            else {
                if (radix < 2) {
                    throw new BigInteger.Error("invalid radix: " + radix);
                }
                if (radix > BigInteger.MAX_RADIX) {
                    throw new BigInteger.Error("radix too large: " + radix);
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
        BigInteger.parse = BigInteger.Default.parse;
        BigInteger.parser = BigInteger.Default.parser;
    })(BigInteger = Lib.BigInteger || (Lib.BigInteger = {}));
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function escapeRegExp(str) {
        return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    Lib.escapeRegExp = escapeRegExp;
    class StringScanner {
        constructor(target) {
            this.target = target;
            this._lastIndex = 0;
            this.match = null;
            this.skippedStart = 0;
            this.skippedEnd = 0;
            this.skippedStr = null;
        }
        lastIndex() {
            return this._lastIndex;
        }
        scan(re) {
            re.lastIndex = this._lastIndex;
            if (this.match = re.exec(this.target)) {
                this.skippedStart = this._lastIndex;
                this.skippedEnd = this.match.index;
                this.skippedStr = null;
                this._lastIndex = re.lastIndex;
                return this.match;
            }
            else {
                return null;
            }
        }
        scanHead(re) {
            if (!re.global || !re.sticky) {
                re = new RegExp(re.source, re.flags + "yg");
            }
            return this.scan(re);
        }
        scanUntil(re) {
            if (!re.global || re.sticky) {
                re = new RegExp(re.source, re.flags + "g");
            }
            return this.scan(re);
        }
        skipped() {
            if (this.skippedStr === null) {
                this.skippedStr = this.target.substring(this.skippedStart, this.skippedEnd);
            }
            return this.skippedStr;
        }
        rest() {
            return this.target.substr(this._lastIndex);
        }
        length() {
            return this.target.length - this._lastIndex;
        }
    }
    Lib.StringScanner = StringScanner;
})(Lib || (Lib = {}));
/// <reference path="mylib.ts"/>
var Lib;
/// <reference path="mylib.ts"/>
(function (Lib) {
    let XMLHttpRequests = [];
    function download(url, param = {}) {
        if (param == undefined) {
            param = {};
        }
        let method = param.method || "GET";
        let onsuccess = param.onsuccess || Lib.doNothing;
        let onerror = param.onerror || Lib.doNothing;
        let onrequest = param.onrequest || Lib.doNothing;
        let onprogress = param.onprogress || Lib.doNothing;
        let asynchronous = param.synchronous === undefined ? false : !param.synchronous;
        let postdata;
        if (param.postdata !== undefined) {
            method = "POST";
            postdata = param.postdata;
        }
        else {
            postdata = "";
        }
        if (param.includeFilter === undefined) {
            return asynchronousGet(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, postdata);
        }
        else {
            asynchronousGetWithInclude(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, param.includeFilter);
            return null; //to be corrected
        }
    }
    Lib.download = download;
    function asynchronousGet(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, postdata) {
        let requestCheck = createHttpRequest();
        if (!requestCheck) {
            onerror("Ajax not available");
            return null;
        }
        try {
            const request = requestCheck;
            request.open(method.toString(), url, asynchronous);
            let result = null;
            request.onreadystatechange = () => {
                if (request.readyState != 4) {
                    onprogress(request);
                    return;
                }
                if (request.status == 200) {
                    result = request.responseText;
                    onsuccess(request.responseText);
                }
                else {
                    onerror("onerror(" + request.status + ") : " + request.statusText, request.status);
                }
                //				request.abort();
                XMLHttpRequests.push(request);
            };
            onrequest(request);
            request.send(postdata);
            if (asynchronous) {
                return null;
            }
            else {
                return result;
            }
        }
        catch (e) {
            onerror(e);
            return null;
        }
    }
    Lib.asynchronousGet = asynchronousGet;
    function joinIncludingFiles(includingData, filename) {
        let filedata = includingData.files[filename];
        let ret = "";
        for (let i = 0; i < filedata.length - 1; i++) {
            ret += filedata[i].text + joinIncludingFiles(includingData, filedata[i].filename);
        }
        ret += filedata[filedata.length - 1].text;
        return ret;
    }
    function simpleIncludeFilter(text, regexp) {
        let match = regexp.exec(text);
        if (match) {
            return [
                text.substring(0, match.index > 0 ? match.index : 0),
                match[1],
                text.substring(regexp.lastIndex),
            ];
        }
        else {
            return null;
        }
    }
    function asynchronousGetWithIncludeRecursive(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, includeFilter, includingData, includedFrom) {
        includedFrom = Lib.cloneHash(includedFrom);
        includedFrom[url] = true;
        asynchronousGet(method, url, (text) => {
            includingData.waitingCount--;
            let fileData = [];
            includingData.files[url] = fileData;
            let match;
            while (match = includeFilter(text)) {
                let includingFile = match[1];
                if (includedFrom[includingFile]) {
                    alert("looped including");
                }
                fileData.push(new FileData(text, includingFile));
                text = match[2];
                if (!includingData.files[includingFile]) {
                    asynchronousGetWithIncludeRecursive(method, includingFile, onsuccess, onerror, onrequest, onprogress, asynchronous, includeFilter, includingData, includedFrom);
                }
            }
            fileData.push(new FileData(text));
            if (includingData.waitingCount == 0) {
                onsuccess(joinIncludingFiles(includingData, includingData.main));
            }
        }, onerror, onrequest, onprogress, asynchronous);
        includingData.waitingCount++;
    }
    class FileData {
        constructor(filename, text) {
            this.filename = filename;
            this.text = text;
        }
    }
    class IncludingData {
        constructor(main, waitingCount, files) {
            this.main = main;
            this.waitingCount = waitingCount || 0;
            this.files = files || {};
        }
        clone() {
            return new IncludingData(this.main, this.waitingCount, this.files);
        }
    }
    function asynchronousGetWithInclude(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, includeFilter) {
        let filter;
        if (typeof (includeFilter) === "string" || includeFilter instanceof RegExp) {
            const regexp = (includeFilter instanceof RegExp ? includeFilter : new RegExp(includeFilter));
            filter = (text) => {
                return simpleIncludeFilter(text, regexp);
            };
        }
        else {
            filter = includeFilter;
        }
        asynchronousGetWithIncludeRecursive(method, url, onsuccess, onerror, onrequest, onprogress, asynchronous, filter, new IncludingData(url), {});
    }
    function createHttpRequest() {
        if (XMLHttpRequests.length > 0) {
            return XMLHttpRequests.pop() || null;
        }
        try {
            return new XMLHttpRequest();
        }
        catch (e) {
            return null;
        }
    }
})(Lib || (Lib = {}));
var Lib;
(function (Lib) {
    function replaceEntities(str) {
        let ret = "";
        const regexp = /&.+?;/mg;
        let match;
        let lastIndex = 0;
        while (match = regexp.exec(str)) {
            ret += str.substring(lastIndex, match.index);
            const reference = match[0];
            const replace = Lib.ENTITY_LIST[reference];
            if (replace) {
                ret += replace;
            }
            else {
                ret += reference;
            }
            lastIndex = regexp.lastIndex;
        }
        return ret + str.substr(lastIndex);
    }
    Lib.replaceEntities = replaceEntities;
    function unescapeEntities(str) {
        let ret = "";
        const regexp = /&.+?;/mg;
        let match;
        let lastIndex = 0;
        while (match = regexp.exec(str)) {
            ret += str.substring(lastIndex, match.index);
            const reference = match[0];
            const replace = Lib.ENTITY_LIST[reference] || reference;
            if (match = replace.match(/^&#x(.+);/)) {
                ret += String.fromCharCode(parseInt(match[1], 16));
            }
            else if (match = replace.match(/^&#(.+);/)) {
                ret += String.fromCharCode(parseInt(match[1], 10));
            }
            lastIndex = regexp.lastIndex;
        }
        return ret + str.substr(lastIndex);
    }
    Lib.unescapeEntities = unescapeEntities;
    Lib.ENTITY_LIST = {
        "&fnof;": "&#x192;",
        "&Alpha;": "&#x391;",
        "&Beta;": "&#x392;",
        "&Gamma;": "&#x393;",
        "&Delta;": "&#x394;",
        "&Epsilon;": "&#x395;",
        "&Zeta;": "&#x396;",
        "&Eta;": "&#x397;",
        "&Theta;": "&#x398;",
        "&Iota;": "&#x399;",
        "&Kappa;": "&#x39A;",
        "&Lambda;": "&#x39B;",
        "&Mu;": "&#x39C;",
        "&Nu;": "&#x39D;",
        "&Xi;": "&#x39E;",
        "&Omicron;": "&#x39F;",
        "&Pi;": "&#x3A0;",
        "&Rho;": "&#x3A1;",
        "&Sigma;": "&#x3A3;",
        "&Tau;": "&#x3A4;",
        "&Upsilon;": "&#x3A5;",
        "&Phi;": "&#x3A6;",
        "&Chi;": "&#x3A7;",
        "&Psi;": "&#x3A8;",
        "&Omega;": "&#x3A9;",
        "&alpha;": "&#x3B1;",
        "&beta;": "&#x3B2;",
        "&gamma;": "&#x3B3;",
        "&delta;": "&#x3B4;",
        "&epsilon;": "&#x3B5;",
        "&zeta;": "&#x3B6;",
        "&eta;": "&#x3B7;",
        "&theta;": "&#x3B8;",
        "&iota;": "&#x3B9;",
        "&kappa;": "&#x3BA;",
        "&lambda;": "&#x3BB;",
        "&mu;": "&#x3BC;",
        "&nu;": "&#x3BD;",
        "&xi;": "&#x3BE;",
        "&omicron;": "&#x3BF;",
        "&pi;": "&#x3C0;",
        "&rho;": "&#x3C1;",
        "&sigmaf;": "&#x3C2;",
        "&sigma;": "&#x3C3;",
        "&tau;": "&#x3C4;",
        "&upsilon;": "&#x3C5;",
        "&phi;": "&#x3C6;",
        "&chi;": "&#x3C7;",
        "&psi;": "&#x3C8;",
        "&omega;": "&#x3C9;",
        "&thetasym;": "&#x3D1;",
        "&upsih;": "&#x3D2;",
        "&piv;": "&#x3D6;",
        "&bull;": "&#x2022;",
        "&hellip;": "&#x2026;",
        "&prime;": "&#x2032;",
        "&Prime;": "&#x2033;",
        "&oline;": "&#x203E;",
        "&frasl;": "&#x2044;",
        "&weierp;": "&#x2118;",
        "&image;": "&#x2111;",
        "&real;": "&#x211C;",
        "&trade;": "&#x2122;",
        "&alefsym;": "&#x2135;",
        "&larr;": "&#x2190;",
        "&rarr;": "&#x2192;",
        "&darr;": "&#x2193;",
        "&harr;": "&#x2194;",
        "&crarr;": "&#x21B5;",
        "&lArr;": "&#x21D0;",
        "&uArr;": "&#x21D1;",
        "&rArr;": "&#x21D2;",
        "&dArr;": "&#x21D3;",
        "&hArr;": "&#x21D4;",
        "&forall;": "&#x2200;",
        "&part;": "&#x2202;",
        "&exist;": "&#x2203;",
        "&empty;": "&#x2205;",
        "&nabla;": "&#x2207;",
        "&isin;": "&#x2208;",
        "&notin;": "&#x2209;",
        "&ni;": "&#x220B;",
        "&prod;": "&#x220F;",
        "&sum;": "&#x2211;",
        "&minus;": "&#x2212;",
        "&lowast;": "&#x2217;",
        "&radic;": "&#x221A;",
        "&prop;": "&#x221D;",
        "&infin;": "&#x221E;",
        "&ang;": "&#x2220;",
        "&and;": "&#x2227;",
        "&or;": "&#x2228;",
        "&cap;": "&#x2229;",
        "&cup;": "&#x222A;",
        "&int;": "&#x222B;",
        "&there4;": "&#x2234;",
        "&sim;": "&#x223C;",
        "&cong;": "&#x2245;",
        "&asymp;": "&#x2248;",
        "&ne;": "&#x2260;",
        "&equiv;": "&#x2261;",
        "&le;": "&#x2264;",
        "&ge;": "&#x2265;",
        "&sub;": "&#x2282;",
        "&sup;": "&#x2283;",
        "&nsub;": "&#x2284;",
        "&sube;": "&#x2286;",
        "&supe;": "&#x2287;",
        "&oplus;": "&#x2295;",
        "&otimes;": "&#x2297;",
        "&perp;": "&#x22A5;",
        "&sdot;": "&#x22C5;",
        "&lceil;": "&#x2308;",
        "&rceil;": "&#x2309;",
        "&lfloor;": "&#x230A;",
        "&rfloor;": "&#x230B;",
        "&lang;": "&#x2329;",
        "&rang;": "&#x232A;",
        "&loz;": "&#x25CA;",
        "&spades;": "&#x2660;",
        "&clubs;": "&#x2663;",
        "&hearts;": "&#x2665;",
        "&diams;": "&#x2666;",
        "&quot;": "&#x22;",
        "&amp;": "&#x26;",
        "&lt;": "&#x3C;",
        "&gt;": "&#x3E;",
        "&apos;": "&#x27;",
        "&OElig;": "&#x152;",
        "&oelig;": "&#x153;",
        "&Scaron;": "&#x160;",
        "&scaron;": "&#x161;",
        "&Yuml;": "&#x178;",
        "&circ;": "&#x2C6;",
        "&tilde;": "&#x2DC;",
        "&ensp;": "&#x2002;",
        "&emsp;": "&#x2003;",
        "&thinsp;": "&#x2009;",
        "&zwnj;": "&#x200C;",
        "&zwj;": "&#x200D;",
        "&lrm;": "&#x200E;",
        "&rlm;": "&#x200F;",
        "&ndash;": "&#x2013;",
        "&mdash;": "&#x2014;",
        "&lsquo;": "&#x2018;",
        "&rsquo;": "&#x2019;",
        "&sbquo;": "&#x201A;",
        "&ldquo;": "&#x201C;",
        "&rdquo;": "&#x201D;",
        "&bdquo;": "&#x201E;",
        "&dagger;": "&#x2020;",
        "&Dagger;": "&#x2021;",
        "&permil;": "&#x2030;",
        "&lsaquo;": "&#x2039;",
        "&rsaquo;": "&#x203A;",
        "&euro;": "&#x20AC;",
        "&nbsp;": "&#xA0;",
        "&iexcl;": "&#xA1;",
        "&cent;": "&#xA2;",
        "&pound;": "&#xA3;",
        "&curren;": "&#xA4;",
        "&yen;": "&#xA5;",
        "&brvbar;": "&#xA6;",
        "&sect;": "&#xA7;",
        "&uml;": "&#xA8;",
        "&copy;": "&#xA9;",
        "&ordf;": "&#xAA;",
        "&laquo;": "&#xAB;",
        "&not;": "&#xAC;",
        "&shy;": "&#xAD;",
        "&reg;": "&#xAE;",
        "&macr;": "&#xAF;",
        "&deg;": "&#xB0;",
        "&plusmn;": "&#xB1;",
        "&sup2;": "&#xB2;",
        "&sup3;": "&#xB3;",
        "&acute;": "&#xB4;",
        "&micro;": "&#xB5;",
        "&para;": "&#xB6;",
        "&middot;": "&#xB7;",
        "&cedil;": "&#xB8;",
        "&sup1;": "&#xB9;",
        "&ordm;": "&#xBA;",
        "&raquo;": "&#xBB;",
        "&frac14;": "&#xBC;",
        "&frac12;": "&#xBD;",
        "&frac34;": "&#xBE;",
        "&iquest;": "&#xBF;",
        "&Agrave;": "&#xC0;",
        "&Aacute;": "&#xC1;",
        "&Acirc;": "&#xC2;",
        "&Atilde;": "&#xC3;",
        "&Auml;": "&#xC4;",
        "&Aring;": "&#xC5;",
        "&AElig;": "&#xC6;",
        "&Ccedil;": "&#xC7;",
        "&Egrave;": "&#xC8;",
        "&Eacute;": "&#xC9;",
        "&Ecirc;": "&#xCA;",
        "&Euml;": "&#xCB;",
        "&Igrave;": "&#xCC;",
        "&Iacute;": "&#xCD;",
        "&Icirc;": "&#xCE;",
        "&Iuml;": "&#xCF;",
        "&ETH;": "&#xD0;",
        "&Ntilde;": "&#xD1;",
        "&Ograve;": "&#xD2;",
        "&Oacute;": "&#xD3;",
        "&Ocirc;": "&#xD4;",
        "&Otilde;": "&#xD5;",
        "&Ouml;": "&#xD6;",
        "&times;": "&#xD7;",
        "&Oslash;": "&#xD8;",
        "&Ugrave;": "&#xD9;",
        "&Uacute;": "&#xDA;",
        "&Ucirc;": "&#xDB;",
        "&Uuml;": "&#xDC;",
        "&Yacute;": "&#xDD;",
        "&THORN;": "&#xDE;",
        "&szlig;": "&#xDF;",
        "&agrave;": "&#xE0;",
        "&aacute;": "&#xE1;",
        "&acirc;": "&#xE2;",
        "&atilde;": "&#xE3;",
        "&auml;": "&#xE4;",
        "&aring;": "&#xE5;",
        "&aelig;": "&#xE6;",
        "&ccedil;": "&#xE7;",
        "&egrave;": "&#xE8;",
        "&eacute;": "&#xE9;",
        "&ecirc;": "&#xEA;",
        "&euml;": "&#xEB;",
        "&igrave;": "&#xEC;",
        "&iacute;": "&#xED;",
        "&icirc;": "&#xEE;",
        "&iuml;": "&#xEF;",
        "&eth;": "&#xF0;",
        "&ntilde;": "&#xF1;",
        "&ograve;": "&#xF2;",
        "&oacute;": "&#xF3;",
        "&ocirc;": "&#xF4;",
        "&otilde;": "&#xF5;",
        "&ouml;": "&#xF6;",
        "&divide;": "&#xF7;",
        "&oslash;": "&#xF8;",
        "&ugrave;": "&#xF9;",
        "&uacute;": "&#xFA;",
        "&ucirc;": "&#xFB;",
        "&uuml;": "&#xFC;",
        "&yacute;": "&#xFD;",
        "&thorn;": "&#xFE;",
        "&yuml;": "&#xFF;",
    };
})(Lib || (Lib = {}));
/// <reference path="./mylib.entity.ts"/>
var Lib;
/// <reference path="./mylib.entity.ts"/>
(function (Lib) {
    let DomParser = null;
    function clearDomParser() {
        DomParser = null;
    }
    Lib.clearDomParser = clearDomParser;
    function parseXml(text) {
        text = Lib.replaceEntities(text);
        if (DomParser === null) {
            DomParser = new DOMParser();
        }
        return DomParser.parseFromString(text, "text/xml");
    }
    Lib.parseXml = parseXml;
    /*
    function get_element_by_id(element, id){
        if(element.getElementById){
            return element.getElementById(id);
        }else{
            return get_element_by_id_recursive(element, id);
        }
    }
    function get_element_by_id_recursive(element, id){
        if(element && element.nodeName != "#text"){
            if(element.nodeName[0] != "#" && element.nodeName != "html" && element.getAttribute("id") == id){
                return element
            }
            var child = element.firstChild;
            while(child){
                var ret = get_element_by_id_recursive(child, id);
                if(ret){
                    return ret;
                }
                child = child.nextSibling;
            }
        }
        return null;
    }
    */
    const ATTRIBUTES_TO_COPY = ["id", "src", "href", "alt", "title", "data-popup"];
    const ATTRIBUTES_TO_COPY_LENGTH = ATTRIBUTES_TO_COPY.length;
    function copyText(src) {
        return document.createTextNode(src.nodeValue || "");
    }
    Lib.copyText = copyText;
    function copyElement(src, base_uri) {
        const dst = Lib.Dom.elem(src.nodeName);
        const className = src.getAttribute("class");
        if (className) {
            dst.className = className;
        }
        const style = src.getAttribute("style");
        if (style) {
            dst.style.cssText = style;
        }
        for (let i = 0; i < ATTRIBUTES_TO_COPY_LENGTH; i++) {
            let name = ATTRIBUTES_TO_COPY[i];
            let value = src.getAttribute(name);
            if (value) {
                if (dst instanceof HTMLAnchorElement && base_uri !== undefined && name == "href" && value[0] == "#") {
                    dst.href = base_uri + value;
                }
                else {
                    dst.setAttribute(name, value);
                }
            }
        }
        let child = src.firstChild;
        if (dst instanceof Element) {
            while (child) {
                if (child instanceof Text) {
                    Lib.Dom.append(dst, copyText(child));
                }
                else if (child instanceof Element) {
                    Lib.Dom.append(dst, copyElement(child, base_uri));
                }
                child = child.nextSibling;
            }
        }
        return dst;
    }
    Lib.copyElement = copyElement;
})(Lib || (Lib = {}));
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.ajax.ts" />
/// <reference path="./mylib.xml.ts" />
var Lib;
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.ajax.ts" />
/// <reference path="./mylib.xml.ts" />
(function (Lib) {
    if (window["Promise"] === undefined) {
        class ResultHolder {
            constructor(value) {
                this.value = value;
            }
        }
        class MyPromise {
            constructor(executor) {
                this.result = undefined;
                this.reason = undefined;
                this.callbacks = [];
                const setResolveValue = (value) => {
                    if (this.callbacks) {
                        this.result = new ResultHolder(value);
                        for (const callback of this.callbacks) {
                            callback[0](value);
                        }
                        this.callbacks = null;
                    }
                };
                const setRejectValue = (value) => {
                    if (this.callbacks) {
                        this.reason = value;
                        for (const callback of this.callbacks) {
                            callback[1](value);
                        }
                        this.callbacks = null;
                    }
                };
                try {
                    executor((value) => MyPromise.apply_then(value, setResolveValue, setRejectValue), setRejectValue); // value could be undefined
                }
                catch (error) {
                    setRejectValue(error);
                }
            }
            static apply_then(value, resolve, reject) {
                if (value instanceof Promise) {
                    value.then(resolve, reject);
                }
                else {
                    resolve(value);
                }
            }
            add_callbacks(resolve, reject) {
                if (this.callbacks) {
                    this.callbacks.push([resolve, reject]);
                }
                else {
                    if (this.result) {
                        resolve(this.result.value);
                    }
                    else {
                        reject(this.reason);
                    }
                }
            }
            then(onfulfilled, onrejected) {
                if (this.callbacks) {
                    const _onfulfilled = onfulfilled || ((value) => value); // T == TResult1
                    const _onrejected = onrejected || ((value) => value);
                    const prev = this;
                    return new MyPromise((resolve, reject) => {
                        prev.add_callbacks(value => {
                            try {
                                MyPromise.apply_then(_onfulfilled(value), resolve, reject);
                            }
                            catch (error) {
                                reject(error);
                            }
                        }, value => {
                            try {
                                MyPromise.apply_then(_onrejected(value), resolve, reject);
                            }
                            catch (error) {
                                reject(error);
                            }
                        });
                    });
                }
                else {
                    try {
                        if (this.result) {
                            if (onfulfilled) {
                                const result = onfulfilled(this.result.value);
                                if (result instanceof Promise) {
                                    return result;
                                }
                                else {
                                    return Promise.resolve(result);
                                }
                            }
                            else {
                                return Promise.resolve(this.result.value); // T == TResult1
                            }
                        }
                        else {
                            if (onrejected) {
                                const result = onrejected(this.reason);
                                if (result instanceof Promise) {
                                    return result;
                                }
                                else {
                                    return Promise.reject(result);
                                }
                            }
                            else {
                                return Promise.reject(this.reason);
                            }
                        }
                    }
                    catch (error) {
                        return Promise.reject(error);
                    }
                }
            }
            catch(onrejected) {
                return this.then(undefined, onrejected);
            }
            static all(promises) {
                let pending = true;
                let count = promises.length;
                let next_resolve = undefined;
                let next_reject = undefined;
                let rejected = false;
                let results = [];
                let reason = undefined;
                function make_resolve(index) {
                    return (value) => {
                        if (pending) {
                            results[index] = value;
                            count--;
                            if (count == 0) {
                                if (next_resolve) {
                                    next_resolve(results);
                                }
                                pending = false;
                            }
                        }
                    };
                }
                const reject = (value) => {
                    if (pending) {
                        if (next_reject) {
                            next_reject(value);
                        }
                        else {
                            rejected = true;
                            reason = value;
                        }
                        pending = false;
                    }
                };
                for (let i = 0; i < promises.length; i++) {
                    promises[i].then(make_resolve(i), reject);
                }
                return new Promise((resolve, reject) => {
                    if (pending) {
                        next_resolve = resolve;
                        next_reject = reject;
                    }
                    else {
                        if (rejected) {
                            reject(reason);
                        }
                        else {
                            resolve(results);
                        }
                    }
                });
            }
            static resolve(value) {
                return new Promise((resolve, _) => {
                    resolve(value);
                });
            }
            static reject(value) {
                return new Promise((_, reject) => {
                    reject(value);
                });
            }
        }
        window["Promise"] = MyPromise;
    }
})(Lib || (Lib = {}));
(function (Lib) {
    function waitForOneByOne(promises, resolve, reject) {
        function call_then(prev, next) {
            const execute = () => next.then(resolve, reject);
            return prev.then(execute, execute);
        }
        let prev = promises[0].then(resolve, reject);
        const next_promises = [prev];
        for (let i = 1; i < promises.length; i++) {
            const promise = promises[i];
            prev = call_then(prev, promise);
            next_promises.push(prev);
        }
        return Promise.all(next_promises);
    }
    Lib.waitForOneByOne = waitForOneByOne;
    function waitForGet(url, options) {
        const onrequest = (options && options.onrequest) || Lib.doNothing;
        const onprogress = (options && options.onprogress) || Lib.doNothing;
        return new Promise((resolve, reject) => {
            Lib.asynchronousGet("GET", url, resolve, (result, status) => reject({ result, status }), onrequest, onprogress, true);
            //			asynchronousGet("GET", url, (value)=> setTimeout(()=> resolve(value), 10000 * Math.random()), (result: string, status: number)=> reject({result, status}), onrequest, onprogress, true)
        });
    }
    Lib.waitForGet = waitForGet;
    function postDataToString(postData) {
        if (typeof (postData) === "string") {
            return postData;
        }
        else {
            let list = [];
            for (const key in postData) {
                list.push(key + "=" + encodeURI(postData[key].toString()));
            }
            return list.join("&");
        }
    }
    function waitForPost(url, postData, options) {
        const onrequest = (options && options.onrequest) || Lib.doNothing;
        const onprogress = (options && options.onprogress) || Lib.doNothing;
        return new Promise((resolve, reject) => {
            Lib.asynchronousGet("POST", url, resolve, (result, status) => reject({ result, status }), onrequest, onprogress, true, postDataToString(postData));
        });
    }
    Lib.waitForPost = waitForPost;
    function waitForSubmit(target) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const form = typeof (target) === "string" ? Lib.Dom.getForm(target) : target;
                const postData = {};
                const formID = form.id;
                for (let i = 0; i < form.elements.length; i++) {
                    const input = form.elements[i];
                    if ((input instanceof HTMLInputElement || input instanceof HTMLSelectElement) && input.name != "") {
                        postData[input.name] = input.value;
                    }
                }
                Lib.Dom.disableForm(form);
                try {
                    const result = yield (form.method === "post" ? waitForPost(form.action, postData) : waitForGet(form.action + "?" + postDataToString(postData)));
                    resolve({ result, postData });
                }
                finally {
                    Lib.Dom.enableForm(form);
                }
            }
            catch (e) {
                reject(e);
            }
        }));
    }
    Lib.waitForSubmit = waitForSubmit;
    function waitForDomLoad() {
        return new Promise(resolve => {
            if (document.readyState === "loading") {
                const func = () => {
                    resolve();
                    document.removeEventListener("DOMContentLoaded", func, false);
                };
                document.addEventListener("DOMContentLoaded", func, false);
            }
            else {
                resolve();
            }
        });
    }
    Lib.waitForDomLoad = waitForDomLoad;
    function waitFor(count = 0) {
        return new Promise(resolve => {
            setTimeout(resolve, count);
        });
    }
    Lib.waitFor = waitFor;
    function waitForParseXml(text) {
        return new Promise((resolve, reject) => {
            let result;
            try {
                result = Lib.parseXml(text);
            }
            catch (e) {
                reject(e);
                return;
            }
            if (result instanceof XMLDocument) {
                resolve(result);
            }
            else {
                reject(result);
            }
        });
    }
    Lib.waitForParseXml = waitForParseXml;
    function waitForLoad(elem) {
        return new Promise((resolve, reject) => {
            elem.onload = () => resolve();
            elem.onerror = () => reject();
        });
    }
    Lib.waitForLoad = waitForLoad;
    class ParallelCountLimit {
        constructor(max) {
            this.max = max;
            this.executing = 0;
            this.tasks = [];
            this.ended = () => {
                const task = this.tasks.shift();
                if (task) {
                    task();
                }
                else {
                    this.executing--;
                }
            };
        }
        register(task) {
            if (this.executing < this.max) {
                this.executing += 1;
                task();
            }
            else {
                this.tasks.push(task);
            }
        }
        execute(task) {
            const guard = this;
            return new Promise((resolve, reject) => {
                const executor = () => {
                    try {
                        const result = task();
                        if (result instanceof Promise) {
                            result.then(guard.ended, guard.ended);
                            result.then(resolve, reject);
                        }
                        else {
                            resolve(result);
                            guard.ended();
                        }
                    }
                    catch (e) {
                        reject(e);
                        guard.ended();
                    }
                };
                guard.register(executor);
            });
        }
    }
    Lib.ParallelCountLimit = ParallelCountLimit;
    class TriggerPromise {
        constructor() {
            this.promise = new Promise((resolve, reject) => {
                this.reject = reject;
                this.resolve = resolve;
            });
        }
    }
    Lib.TriggerPromise = TriggerPromise;
})(Lib || (Lib = {}));
/// <reference path="./mylib.dom.ts"/>
/// <reference path="./mylib.regexp.ts"/>
/// <reference path="./mylib.biginteger.ts"/>
/// <reference path="./mylib.promise.ts"/>
window["MathJax"] = {
    startup: {
        typeset: false,
    },
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    },
    chtml: {
        displayAlign: "left",
        displayIndent: "0",
    },
};
var Lib;
(function (Lib) {
    function number2Str(num) {
        if (typeof (num) === "number") {
            return "" + num;
        }
        else {
            return num.toString();
        }
    }
    class MathDemo {
        constructor() {
            this.modifyPromise = Lib.waitForDomLoad().then(() => {
                const script = Lib.Dom.elem("script", { id: "MathJax-script", async: true, src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" });
                const promise = Lib.waitForLoad(script);
                Lib.Dom.append(document.head, script);
                return promise;
            });
            this.exampleTable = {};
            this.formTable = {};
            this.parametersInURL = {};
            this.show_branch = (id) => {
                Lib.Dom.appendClass(Lib.Dom.getElement(id), "demo-selected");
            };
            this.set_value = (id, value) => {
                const elem = Lib.Dom.getElement(id);
                if (value instanceof HTMLElement) {
                    Lib.Dom.replace(elem, value);
                }
                else {
                    let strValue = "" + value;
                    const left = elem.previousSibling;
                    if (left !== null && left instanceof Text) {
                        strValue = this.connectTexts(left.nodeValue, strValue);
                        Lib.Dom.remove(left);
                    }
                    const right = elem.nextSibling;
                    if (right != null && right instanceof Text) {
                        strValue = this.connectTexts(strValue, right.nodeValue);
                        Lib.Dom.remove(right);
                    }
                    Lib.Dom.replace(elem, Lib.Dom.text(strValue));
                }
            };
            this.initializedForms = new Set();
            this.checkParam = (name, defaultValue) => {
                const param = this.parametersInURL[name];
                return param === undefined ? defaultValue : param;
            };
            this.parametersInURL = this.parseHash();
            this.modify(() => {
                this.collectExamples(document.body);
                this.typeset(document.body, true);
            });
        }
        modify(func) {
            const promise = this.modifyPromise.then(() => Lib.waitFor(1).then(func));
            //			const promise: Promise<T> = this.modifyPromise.then(()=> func());
            this.modifyPromise = promise;
            return promise;
        }
        collectExamples(root) {
            const items = [];
            Lib.Dom.eachDescendantElement(root, (elem) => {
                if (Lib.Dom.hasClass(elem, "demo-example")) {
                    this.exampleTable[elem.id] = document.importNode(elem, true);
                }
                else if (elem instanceof HTMLFormElement && Lib.Dom.hasClass(elem, "demo-form")) {
                    this.formTable[elem.id] = elem;
                }
            });
        }
        typeset(elem, skipExample = false) {
            const targets = [];
            Lib.Dom.eachDescendantElement(elem, (elem) => {
                if (Lib.Dom.hasClass(elem, "demo-example") && skipExample) {
                    return "skip";
                }
                else if (Lib.Dom.hasClass(elem, "demo-typeset")) {
                    targets.push(elem);
                    return "skip";
                }
                else {
                    return null;
                }
            });
            if (targets.length > 0) {
                this.modify(() => {
                    return MathJax.typesetPromise(targets).then(() => {
                        //					return MathJax.typesetPromise([document.body]).then(()=> {
                        for (const elem of targets) {
                            Lib.Dom.removeClass(elem, "demo-typeset");
                        }
                    });
                });
            }
        }
        static parseInt(str) {
            const value = parseInt(str);
            if (isNaN(value)) {
                throw new MathDemo.Error("parse error");
            }
            else {
                return value;
            }
        }
        refreshExample(ids) {
            for (const id of ids) {
                const div = Lib.Dom.getElement(id);
                div.id = "";
                Lib.Dom.replace(div, document.importNode(this.exampleTable[id], true));
            }
        }
        refreshForm(form_id) {
            const form = Lib.Dom.getForm(form_id);
            form.id = "";
            Lib.Dom.replace(form, this.formTable[form_id]);
        }
        typesetExamples(ids) {
            this.modify(() => {
                for (const id of ids) {
                    this.typeset(Lib.Dom.getElement(id), false);
                }
            });
        }
        static getMathDemo() {
            if (MathDemo.mathDemo === undefined) {
                MathDemo.mathDemo = new MathDemo();
            }
            const demo = MathDemo.mathDemo;
            return MathDemo.mathDemo.modifyPromise.then(() => Promise.resolve(demo));
        }
        connectTexts(str1, str2) {
            if (str1 === null) {
                if (str2 === null) {
                    return "";
                }
                else {
                    return str2;
                }
            }
            else if (str2 === null) {
                return str1;
            }
            else if (str1[str1.length - 1] === "$" && str2[0] === "$") {
                return str1.substring(0, str1.length - 1) + str2.substring(1);
            }
            else {
                return str1 + str2;
            }
        }
        reload(id_submit, reload) {
            try {
                return reload();
            }
            catch (_a) {
                const submit = Lib.Dom.getInput(id_submit);
                Lib.Dom.insertAfter(Lib.Dom.elem("span", "エラー"), submit);
                return null;
            }
        }
        parseHash() {
            const table = {};
            if (window.location.hash.length > 1) {
                const args = window.location.hash.substring(1).split(/,/);
                for (const arg of args) {
                    const items = arg.split(/=/);
                    if (items.length >= 2) {
                        table[items[0]] = items[1];
                    }
                }
            }
            return table;
        }
        register(id_examples, id_form, id_submit, initialize, reload, update) {
            this.modify(() => {
                let vars;
                if (this.initializedForms.has(id_form)) {
                    this.refreshForm(id_form);
                    vars = this.reload(id_submit, reload);
                    if (vars === null) {
                        return;
                    }
                }
                else {
                    this.initializedForms.add(id_form);
                    const submit = Lib.Dom.getInput(id_submit);
                    submit.disabled = false;
                    initialize(this.checkParam);
                    vars = reload();
                    let changed = false;
                }
                this.formTable[id_form].onsubmit = (event) => {
                    event.preventDefault();
                    this.modify(() => {
                        this.refreshExample(id_examples);
                        this.refreshForm(id_form);
                        const vars = this.reload(id_submit, reload);
                        if (vars === null) {
                            return;
                        }
                        update(this.show_branch, this.set_value, vars);
                        this.typesetExamples(id_examples);
                    });
                };
                update(this.show_branch, this.set_value, vars);
                this.typesetExamples(id_examples);
            });
        }
        static register(id_examples, id_form, id_submit, initialize, reload, update) {
            MathDemo.getMathDemo().then((demo) => {
                demo.register(id_examples, id_form, id_submit, initialize, reload, update);
            });
        }
        /*
                public modify(func: (target: HTMLElement)=> void): Promise<void>{
                    return this.modifyPromise = this.modifyPromise.then(()=> func(this.target));
                }
                
                public appendElem(tag: Lib.Dom.TagName, ...items: Lib.Dom.DomItem[]){
                    this.append(Dom.elem(tag, null, items));
                }
                private currentExample: { format: ((elem: HTMLElement)=> void) } | null = null;
                public append(elem: HTMLElement){
                    if(this.currentExample !== null){
                        this.currentExample.format(elem);
                    }
                    return this.modify((target)=> MathDemo.typeset(elem).then(()=> {
                        Dom.append(target, elem);
                    }));
                }
                public appendP(...items: Lib.Dom.DomItem[]){
                    this.appendElem("p", ...items);
                }
                public expressions(...exps: Lib.Dom.DomItem[]){
                    const bq = Dom.elem("blockquote", { className: "eq" });
                    const items: HTMLElement[] = [];
                    for(const exp of exps){
                        const p = Dom.elem("p", null, exp);
                        if(this.currentExample !== null){
                            this.currentExample.format(p);
                        }
                        items.push(p);
                    }
                    return this.modify((target)=> MathJax.typesetPromise(items).then(()=> {
                        Dom.append(bq, items);
                        Dom.append(target, bq);
                    }));
                }
                public example<CONSTS_I extends string, CONSTS_F extends string, VARS extends Lib.Hash<any>>(constsInt: VarListI<CONSTS_I>, constsFloat: VarListF<CONSTS_F>, init: (vars: Readonly<VarMix<CONSTS_I, CONSTS_F>>)=> VARS): MathDemo.Example<CONSTS_I, CONSTS_F, VARS>{
                    return new MathDemo.Example(this, constsInt, constsFloat, init);
                }
                
                public table(...rows: (HTMLTableRowElement | Lib.Dom.DomItem[])[]){
                    const table = Dom.elem("table", { className: "eq"});
                    for(const row of rows){
                        if(row instanceof HTMLTableRowElement){
                            Dom.append(table, row);
                        }else{
                            const tr = Dom.elem("tr");
                            for(const cell of row){
                                if(cell instanceof HTMLTableCellElement){
                                    Dom.append(tr, cell);
                                }else{
                                    Dom.append(tr, Dom.elem("td", null, cell));
                                }
                            }
                            Dom.append(table, tr);
                        }
                    }
                    this.append(table);
                }
                public source(...lines: Lib.Dom.DomItem[]){
                    const pre = Dom.elem("pre", null, lines);
                    const bq = Dom.elem("blockquote", { className: "eq" }, pre);
                    this.append(bq);
                }
                
                
                public withExample(example: { format: (elem: HTMLElement)=> void }, func: ()=> void){
                    this.modify(()=> {
                        this.modify(()=> {
                            this.currentExample = example;
                        });
                        func();
                        this.modify(()=> {
                            this.currentExample = null;
                        });
                    });
                }
                public withTarget(target: HTMLElement, func: ()=> void){
                    this.modify(()=> {
                        const tmpTarget = this.target;
                        this.modify(()=> {
                            this.target = target;
                        });
                        func();
                        this.modify(()=> {
                            this.target = tmpTarget;
                        });
                    });
                }
                
                private readonly constructionPromise = new Lib.TriggerPromise();
                private modifyPromise: Promise<void> = this.constructionPromise.promise;
            }
            export module MathDemo{
                export class Example<CONSTS_I extends string = string, CONSTS_F extends string = string, VARS extends Lib.Hash<any> = Lib.Hash<any>>{
                    private readonly examples: [HTMLElement, ((vars: Readonly<VarMix<CONSTS_I, CONSTS_F>> & VARS)=> void)][] = [];
        
                    private readonly vars: Readonly<VarMix<CONSTS_I, CONSTS_F>> & VARS;
                    public readonly inputs: { [ name in CONSTS_I | CONSTS_F ]: HTMLInputElement }
                
        
                    public constructor(private readonly demo: MathDemo, varsInt: VarListI<CONSTS_I>, varsFloat: VarListF<CONSTS_F>, public readonly init: (vars: Readonly<VarMix<CONSTS_I, CONSTS_F>>)=> VARS){
                        const inputs: { [key: string]: HTMLInputElement } = {};
                        const vars: { [key: string]: number | BigInteger } = {};
                        
                        this.inputs = inputs as any;
                        this.vars = vars as any;
                        
                        let args: string[];
                        if(window.location.hash.length > 1){
                            args = window.location.hash.substring(1).split(/,/);
                        }else{
                            args = [];
                        }
                        
                        const p = Dom.elem("p");
                        
                        let i = 0;
                        for(const varDef of varsInt){
                            const v: CONSTS_I = varDef[0];
                            let val = varDef[1];
                            const arg = args[i];
                            if(arg != undefined){
                                val = BigInteger.parse(arg);
                            }
                            const input = Dom.elem("input", { type: "text", name: v, value: val.toString(), size: 50});
                            if(i > 0){
                                Dom.append(p, Dom.br());
                            }
                            Dom.append(p, v, " : ", input);
                            vars[v] = val;
                            inputs[v] = input;
                            this.reloads.push(((v, input)=> {
                                return ()=> {
                                    this.vars[v] = BigInteger.parse(input.value) as any;
                                };
                            })(v, input));
                            i ++;
                        }
                        for(const varDef of varsFloat){
                            const v: CONSTS_F = varDef[0];
                            let val = varDef[1];
                            const arg = args[i];
                            if(arg != undefined){
                                val = parseFloat(arg);
                            }
                            
                            const input = Dom.elem("input", { type: "text", name: v, value: "" + val, size: 50});
                            if(i > 0){
                                Dom.append(p, Dom.br());
                            }
                            Dom.append(p, v, " : ", input);
                            vars[v] = val;
                            inputs[v] = input;
                            this.reloads.push(((v, input)=> {
                                return ()=> {
                                    this.vars[v] = parseFloat(input.value) as any;
                                };
                            })(v, input));
                            i ++;
                        }
                        this.button = Dom.elem("input", { type: "submit", name: "reset", value: "再計算" });
                        this.demo.modify((target)=> {
                            Dom.append(p, " ", this.button);
                            Dom.append(target, Dom.elem("form", { onsubmit: this.reload }, p));
                            this.execute();
                        });
                    }
                    public readonly button: HTMLInputElement;
                    private readonly reload = (event: Event)=>{
                        event.preventDefault();
                        this.execute();
                    }
                    private readonly reloads: (()=> void)[] = [];
                    
                    public append(func: (vars: Readonly<VarMix<CONSTS_I, CONSTS_F>> & VARS)=> void){
                        const div = Dom.elem("div", { className: "example" });
                        this.examples.push([div, func]);
                        this.demo.modify((target)=> {
                            Dom.append(target, div);
                        });
                    };
                    public execute(){
                        this.demo.withExample(this, ()=> {
                            for(const reload of this.reloads){
                                reload();
                            }
                            const vars = this.init(this.vars);
                            
                            for(const name in vars){
                                if(this.vars[name] === undefined){
                                    this.vars[name] = vars[name];
                                }
                            }
                            
                            for(const example of this.examples){
                                const [div, func] = example;
                                this.demo.withTarget(div, ()=> {
                                    Dom.clear(div);
                                    func(this.vars);
                                });
                            }
                        });
                    }
        
                    public static getVal(vars: Lib.Hash<any>, name: string): string{
                        const val = (vars as Lib.Hash<number | BigInteger | undefined>)[name];
                        if(val === undefined){
                            return "<? " + name + " ?>";
                        }else{
                            return "" + val;
                        }
                    }
                    
                    public static formatStr(vars: Lib.Hash<any>, str: string){
                        const scanner = new StringScanner(str);
                        let result = "";
                        while(scanner.length() > 0){
                            let match: RegExpMatchArray | null;
                            if(match = scanner.scanHead(/<<|>>/)){
                                if(match[0] === "<<"){
                                    result += "<";
                                }else{
                                    result += ">";
                                }
                            }else if(scanner.scanHead(/</)){
                                let v: string;
                                let toEnd = false;
                                if(scanner.scanUntil(/>/)){
                                    v = scanner.skipped();
                                }else{
                                    v = scanner.rest();
                                    toEnd = true;
                                }
                                result += this.getVal(vars, v);
                                if(toEnd){
                                    break;
                                }
                            }else if(match = scanner.scanHead(/[^<>]+/)){
                                result += match[0];
                            }else{
                                result += scanner.rest();
                                break;
                            }
                        }
                        return result
                    }
                    
                    public format(...elems: HTMLElement[]){
                        return Example.format(this.vars, ...elems);
                    }
                    public static format(vars: Lib.Hash<any>, ...elems: HTMLElement[]){
                        for(const elem of elems){
                            Dom.eachDescendant(elem, (node)=> {
                                if(node instanceof Text && node.nodeValue !== null){
                                    node.nodeValue = Example.formatStr(vars, node.nodeValue);
                                }
                            });
                        }
                    }
        
                }
        */
        static initialize() {
            MathDemo.getMathDemo();
        }
    }
    MathDemo.mathDemo = undefined;
    Lib.MathDemo = MathDemo;
    const ExternalError = Error;
    (function (MathDemo) {
        class Error extends ExternalError {
            constructor(message = "") {
                super(message);
                this.message = message;
                this.name = new.target.name;
                Object.setPrototypeOf(this, new.target.prototype);
            }
        }
        MathDemo.Error = Error;
    })(MathDemo = Lib.MathDemo || (Lib.MathDemo = {}));
    Lib.executeOnDomLoad(() => MathDemo.initialize());
    let Math;
    (function (Math) {
        const BigInteger = Lib.BigInteger;
        const format_unit_base = BigInteger.parse(10000);
        const format_unit_list = "万億兆京垓".split("");
        const Dom = Lib.Dom;
        //		const td_style = { style: {verticalAlign: "top"}};
        //		td_style = null;
        function format(num) {
            if (typeof (num) === "number") {
                num = BigInteger.parse(num);
            }
            let div = num.divmod(format_unit_base);
            let str = div.rem.isZero() ? "" : div.rem.toString();
            if (!div.quo.isZero()) {
                for (let i = 0; i < format_unit_list.length; i++) {
                    div = div.quo.divmod(format_unit_base);
                    str = (div.rem.isZero() ? "" : div.rem.toString() + format_unit_list[i]) + str;
                    if (div.quo.isZero()) {
                        break;
                    }
                }
                if (!div.quo.isZero()) {
                    str = div.quo.toString() + str;
                }
            }
            return str;
        }
        Math.format = format;
        /*
                function clone_symbol(sym){
                    if(typeof sym === "string"){
                        return sym;
                    }else{
                        let ret = Dom.elem("span", null, sym[0]);
                        let cur = ret;
                        for(let i = 1; i < sym.length; i ++){
                            let sub = Dom.elem("sub", null, sym[i]);
                            Dom.add(cur, sub);
                            cur = sub;
                        }
                        return ret;
                    }
                }
                */
        /*
                var equation_number = 1;
                function new_equation(){
                    var table = Dom.elem("table", {className: "eq"});
                    let tr = null;
                    Dom.add(document.body, table);
                    var equation = {
                        tr: tr,
                        new_line: function(){
                            equation.tr = Dom.elem("tr");
                            Dom.add(table, equation.tr);
                        },
                        add: function(){
                            if(equation.tr == null){
                                equation.new_line();
                            }
                            for(let i = 0; i < arguments.length; i ++){
                                if(equation.tr.firstChild != undefined && !Dom.has_class(equation.tr.lastChild, "note")){
                                    Dom.add(equation.tr, Dom.elem("td", td_style, "="));
                                }
                                Dom.add(equation.tr, Dom.elem("td", td_style, arguments[i]));
                            }
                        },
                        add_note: function(note){
                            if(equation.tr == null){
                                equation.new_line();
                            }
                            let td = Dom.elem("td", { className: "note"});
                            Dom.add(equation.tr, td);
                            for(let i = 0; i < arguments.length; i ++){
                                Dom.add(td, arguments[i]);
                            }
                        },
                        add_number: function(){
                            if(equation.tr == null){
                                equation.new_line();
                            }
                            Dom.append_class(equation.tr, "withnumber");
                            let number = equation_number;
                            let td = Dom.elem("td", td_style, "(" + equation_number + ")");
                            Dom.add(equation.tr, td);
                            equation_number ++;
                            return number;
                        },
                    };
                    for(let i = 0; i < arguments.length; i ++){
                        equation.add(arguments[i]);
                    }
                    
                    return equation;
                }
        */
        /*
                function createElem(name, list){
            
            if(list.length != 2){
                throw "hoge";
            }
            
                    let span = Dom.elem("span");
                    Dom.add(span, list[0]);
                    let elem = Dom.elem(name);
                    Dom.add(span, elem);
                    for(let i = 1; i < list.length; i ++){
                        Dom.add(elem, list[i]);
                    }
                    return span;
                }
                
                function sub(){
                    return createElem("sub", arguments);
                }
                function sup(){
                    return createElem("sup", arguments);
                }
                
                
                var output = null;
                
                
                function percent(){
                    return Dom.elem("span", {style: {fontSize: "80%"}}, " % ");
                }
            
                function nowrap(){
                    let span = Dom.elem("span", {style: {whiteSpace: "nowrap"}});
                    for(let i = 0; i < arguments.length; i ++){
                        Dom.add(span, arguments[i]);
                    }
                    return span;
                }
                
                function prepare_output(){
                    if(output == null){
                        Dom.add(document.body, output = Dom.elem("p"));
                    }
                }
                
                function pl(){
                    prepare_output();
                    for(let i = 0; i < arguments.length; i ++){
                        Dom.add(output, arguments[i]);
                    }
                    output = null;
                }
                function p(){
                    prepare_output();
                    for(let i = 0; i < arguments.length; i ++){
                        Dom.add(output, arguments[i]);
                    }
                }
                
                Lib.Math = {
                    format: format,
                    new_equation: new_equation,
                    read_options: read_options,
                    clone_symbol: clone_symbol,
                    sub: sub,
                    sup: sup,
                    nowrap: nowrap,
                    percent: percent,
                    p: p,
                    pl: pl,
                }
        */
    })(Math || (Math = {}));
})(Lib || (Lib = {}));
/// <reference path="../../mylib/mylib.ts"/>
/// <reference path="../../mylib/mylib.dom.ts"/>
/// <reference path="../../mylib/mylib.biginteger.ts"/>
/// <reference path="../../mylib/mylib.mathdemo.ts"/>
var RSADemo;
/// <reference path="../../mylib/mylib.ts"/>
/// <reference path="../../mylib/mylib.dom.ts"/>
/// <reference path="../../mylib/mylib.biginteger.ts"/>
/// <reference path="../../mylib/mylib.mathdemo.ts"/>
(function (RSADemo) {
    const Dom = Lib.Dom;
    const BigInteger = Lib.BigInteger;
    RSADemo.x = "hoge";
    function format_set(items, limited) {
        if (limited) {
            items = items.concat(["\\cdots"]);
        }
        return format_list("\\left\\{\\right.", ",\\ ", "\\left.\\right\\}", items);
    }
    RSADemo.format_set = format_set;
    function format_list(head, delim, tail, items) {
        const results = [];
        for (let i = 0; i < items.length; i++) {
            let item = "" + items[i];
            if (i == 0) {
                item = head + item;
            }
            if (i == items.length - 1) {
                item += tail;
            }
            else {
                item += delim;
            }
            results.push(Dom.elem("span", "$ \\displaystyle " + item + "$"));
        }
        return Dom.span(results);
    }
    RSADemo.format_list = format_list;
    function calcInv(n, law) {
        if (n.comp(BigInteger.ONE) == 0) {
            return n;
        }
        let tuple1 = { r: n, x: BigInteger.ONE, y: BigInteger.ZERO };
        let tuple2 = { r: law, x: BigInteger.ZERO, y: BigInteger.ONE };
        let pre, cur;
        if (n > law) {
            pre = tuple1;
            cur = tuple2;
        }
        else {
            pre = tuple2;
            cur = tuple1;
        }
        while (true) {
            // assert pre.r == n * pre.x + law * pre.y
            // assert cur.r == n * cur.x + law * cur.y
            let div = pre.r.divmod(cur.r);
            // d = pre.r / cur.r;
            // r = pre.r % cur.r;
            // assert r = pre.r - d * cur.r
            // assert r = (n * pre.x + law * pre.y) - d * (n * cur.x + law * cur.y)
            // assert r = n * (pre.x - d * cur.x) + law * (pre.y - d * cur.y)
            let nxt = {
                r: div.rem,
                x: pre.x.sub(div.quo.mul(cur.x)),
                y: pre.y.sub(div.quo.mul(cur.y)),
            };
            if (nxt.r.comp(BigInteger.ONE) == 0) {
                let ret = nxt.x;
                while (ret.minus) {
                    ret = ret.add(law);
                }
                return ret;
            }
            else if (nxt.r.isZero()) {
                return null;
            }
            pre = cur;
            cur = nxt;
        }
    }
    RSADemo.calcInv = calcInv;
    function tr(...args) {
        return Dom.tr(...args.map((item) => {
            if (item instanceof HTMLTableCellElement) {
                return item;
            }
            else if (item instanceof HTMLElement) {
                return Dom.td(item);
            }
            else if (Array.isArray(item)) {
                return Dom.td(item);
            }
            else {
                return Dom.td("$ \\displaystyle " + item + "$");
            }
        }));
    }
    RSADemo.tr = tr;
})(RSADemo || (RSADemo = {}));
/// <reference path="source/demo.ts"/>
var RSADemo;
/// <reference path="source/demo.ts"/>
(function (RSADemo) {
    const Dom = Lib.Dom;
    const BigInteger = Lib.BigInteger;
    {
        function initialize(checkParam) {
            const L = BigInteger.parse(123456);
            const A = BigInteger.parse(165437);
            Dom.getInput("demo_id_2").value = checkParam("L", "" + L);
            Dom.getInput("demo_id_3").value = checkParam("A", "" + A);
            return { L, A };
        }
        function reload() {
            const L = BigInteger.parse(Dom.getInput("demo_id_2").value);
            const A = BigInteger.parse(Dom.getInput("demo_id_3").value);
            return { L, A };
        }
        function update(show_branch, set_value, vars) {
            const { L, A } = vars;
            function make_exp(...clauses) {
                let exp = [];
                for (const clause of clauses) {
                    if (clause.length > 0) {
                        let minus;
                        let clause_exp = [];
                        for (let j = 0; j < clause.length; j++) {
                            const val = clause[j];
                            let abs = val.abs();
                            if (j == 0) {
                                minus = val.minus;
                            }
                            else {
                                minus = (val.minus ? !minus : minus);
                            }
                            if (!abs.equals(BigInteger.ONE)) {
                                clause_exp.push(abs);
                            }
                        }
                        if (minus) {
                            if (exp.length > 0) {
                                exp.push(" - ");
                            }
                            else {
                                exp.push("-");
                            }
                        }
                        else {
                            if (exp.length > 0) {
                                exp.push(" + ");
                            }
                        }
                        if (clause_exp.length > 0) {
                            exp.push("" + clause_exp[0]);
                            for (let j = 1; j < clause_exp.length; j++) {
                                exp.push(" \\cdot " + clause_exp[j]);
                            }
                        }
                        else {
                            exp.push("1");
                        }
                    }
                }
                return exp.join("");
            }
            const list = [];
            const tbody1 = Dom.elem("tbody");
            const table1 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody1));
            let a = vars.A, b = vars.L;
            while (true) {
                const divmod = b.divmod(a);
                tbody1.appendChild(Dom.elem("tr", Dom.td({ className: "right" }, "$" + b + "\\div" + a + "$"), Dom.td("$=$"), Dom.td("$" + divmod.quo + " あまり " + divmod.rem + "$")));
                list.push({
                    a: a,
                    b: b,
                    r: divmod.rem,
                    q: divmod.quo,
                });
                b = a;
                a = divmod.rem;
                if (a.equals(BigInteger.ONE)) {
                    break;
                }
                else if (a.isZero()) {
                    break;
                }
            }
            set_value("demo_id_5", table1);
            if (a.isZero()) {
                show_branch("demo_id_6");
            }
            else {
                show_branch("demo_id_7");
                const tbody2 = Dom.elem("tbody");
                const table2 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody2));
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    tbody2.appendChild(Dom.elem("tr", Dom.elem("td", { className: "right" }, "$" + item.r + "$"), Dom.td("$=$"), Dom.td("$" + item.b + " - " + item.a + " \\cdot " + item.q + "$"), Dom.elem("td", { className: "right" }, "$(" + (i + 1) + ")$")));
                }
                set_value("demo_id_8", table2);
                const tbody3 = Dom.elem("tbody");
                const table3 = Dom.elem("blockquote", { className: "demo-equation demo-typeset" }, Dom.elem("table", tbody3));
                let item = list[list.length - 1];
                tbody3.appendChild(Dom.elem("tr", Dom.td("$1$"), Dom.td("$=$"), Dom.td("$" + item.b + " - " + item.a + " \\cdot " + item.q + "$"), Dom.elem("td"), Dom.elem("td"), Dom.td("$((" + (list.length) + ")より)$")));
                a = item.b;
                b = BigInteger.ONE;
                let c = item.a;
                let d = item.q.neg();
                for (let i = list.length - 2; i >= 0; i--) {
                    item = list[i];
                    /// デバッグ用
                    const check = a.mul(b).add(c.mul(d));
                    if (!check.equals(BigInteger.ONE)) {
                        tbody3.appendChild(Dom.tr(Dom.elem("td", { style: { color: "red" } }, "【バグ】予期せぬ計算エラーが起きました")));
                        break;
                    }
                    let exp = [];
                    if (a.mul(b).minus) {
                        exp.push("-");
                    }
                    exp.push(a.abs());
                    if (!b.equals(BigInteger.ONE)) {
                        exp.push(" × ");
                        exp.push(b.abs());
                    }
                    if (d.minus) {
                        exp.push(" - ");
                    }
                    else {
                        exp.push(" + ");
                    }
                    exp = exp.concat(["(", item.b, " - ", item.a, " \\cdot ", item.q, ")", " \\cdot ", d.abs()]);
                    let next_a = item.b;
                    let next_b = d;
                    let next_c = a;
                    let next_d = b.add(item.q.mul(d.neg()));
                    a = next_a;
                    b = next_b;
                    c = next_c;
                    d = next_d;
                    tbody3.appendChild(Dom.elem("tr", Dom.td(), Dom.td("$=$"), Dom.td("$" + exp.join("") + "$"), Dom.td("$=$"), Dom.td("$" + make_exp([a, b], [c, d]) + "$"), Dom.td("$((" + (i + 1) + ")を代入して整理)$")));
                }
                let inv_a;
                let q;
                if (a.equals(vars.A)) {
                    inv_a = b;
                    q = d;
                }
                else {
                    inv_a = d;
                    q = b;
                }
                set_value("demo_id_9", table3);
                set_value("demo_id_10", make_exp([b, a], [d, c]));
                set_value("demo_id_11", q);
                set_value("demo_id_12", inv_a.minus ? "" : "+");
                set_value("demo_id_13", inv_a);
                set_value("demo_id_14", inv_a);
                set_value("demo_id_15", q.minus ? "+" : "-");
                set_value("demo_id_16", q.abs());
                set_value("demo_id_17", inv_a);
                set_value("demo_id_18", (q.minus ? "+" : "-") + q.abs());
                set_value("demo_id_19", (q.minus ? "+" : "-"));
                set_value("demo_id_20", q.abs());
                set_value("demo_id_21", (q.minus ? "+" : "-"));
                if (!inv_a.minus) {
                    show_branch("demo_id_22");
                    set_value("demo_id_23", inv_a);
                }
                else {
                    show_branch("demo_id_24");
                    set_value("demo_id_25", inv_a);
                    set_value("demo_id_26", inv_a);
                    const inv_a2 = L.add(inv_a);
                    inv_a = inv_a2;
                    set_value("demo_id_27", inv_a2);
                }
                set_value("demo_id_28", A);
                set_value("demo_id_29", inv_a);
                set_value("demo_id_30", L);
                set_value("demo_id_31", A.mul(inv_a));
                set_value("demo_id_32", L);
                set_value("demo_id_33", A.mul(inv_a).mod(vars.L));
            }
        }
        Lib.MathDemo.register(["demo_id_0"], "demo_id_1", "demo_id_4", initialize, reload, update);
    }
})(RSADemo || (RSADemo = {}));
