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
/// <reference path="../mylib/mylib.dom.ts"/>
var Demo;
/// <reference path="../mylib/mylib.dom.ts"/>
(function (Demo) {
    const Dom = Lib.Dom;
    const ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const UPPER2INDEX = {};
    const GRAPH_WIDTH = 50;
    class Encryption {
        constructor() {
            this.replaceList = [];
            this.elems = Dom.combineTables(Dom.getInputs("encrypt", "import", "toggle_dst", "toggle_src_panel1", "toggle_src_panel2", "input_dst", "input_src"), Dom.getTextAreas("src"), Dom.getSelects("mode"), Dom.getElements("dst", "graph_1", "graph_2", "graph_3", "src_panel", "table", "guess"));
            //		private readonly guess: Lib.Hash<HTMLInputElement> = {};
            this.import = () => {
                this.import_target_str(false);
            };
            this.encrypt = () => {
                this.import_target_str(true);
            };
            this.prevUpdatedInput = null;
            this.prevUpdateInputValue = null;
            this.updateGuess = (event) => {
                const target = event.target;
                if (target === null || !(target instanceof HTMLInputElement) || target === this.prevUpdatedInput && target.value === this.prevUpdateInputValue) {
                    return;
                }
                this.prevUpdateInputValue = target.value;
                this.prevUpdatedInput = target;
                for (const cU of ALPHABETS) {
                    this.guessTableS2D[cU] = undefined;
                    this.guessTableD2S[cU] = undefined;
                }
                this.updateTables();
            };
            this.changeTableMode = () => {
                this.createGuessTable();
            };
            this.guessInputs = [];
            this.guessTableS2D = {};
            this.guessTableD2S = {};
            this.mode = null;
            this.changeMode = () => {
                const newMode = this.elems.mode.value;
                if ((newMode === "CAESAR" || newMode === "Substitution" || newMode === "Polyalphabetic") && newMode != this.mode) {
                    this.mode = newMode;
                    this.createReplaceTable();
                    for (const cU of ALPHABETS) {
                        this.guessTableD2S[cU] = undefined;
                        this.guessTableS2D[cU] = undefined;
                    }
                    this.createGuessTable();
                    Dom.clear(this.elems.dst);
                    this.showSrcPanel();
                }
            };
            this.toggleDst = (event) => {
                this.toggleMessage(event.currentTarget);
                if (Dom.hasClass(this.elems.dst, "show")) {
                    Dom.removeClass(this.elems.dst, "show");
                    Dom.appendClass(this.elems.dst, "hide");
                }
                else {
                    Dom.removeClass(this.elems.dst, "hide");
                    Dom.appendClass(this.elems.dst, "show");
                }
            };
            this.toggleSrcPanel = () => {
                let mes;
                if (this.elems.src_panel.style.display == "") {
                    this.elems.src_panel.style.display = "none";
                    mes = "表示";
                }
                else {
                    this.elems.src_panel.style.display = "";
                    mes = "隠す";
                }
                for (const button of [this.elems.toggle_src_panel1, this.elems.toggle_src_panel2]) {
                    button.value = button.dataset.mes + mes;
                }
            };
            for (let i = 0; i < ALPHABETS.length; i++) {
                UPPER2INDEX[ALPHABETS[i]] = i;
            }
            Dom.addEventListener(this.elems.encrypt, "click", this.encrypt);
            Dom.addEventListener(this.elems.import, "click", this.import);
            Dom.addEventListener(this.elems.toggle_dst, "click", this.toggleDst);
            Dom.addEventListener(this.elems.toggle_src_panel1, "click", this.toggleSrcPanel);
            Dom.addEventListener(this.elems.toggle_src_panel2, "click", this.toggleSrcPanel);
            Dom.addEventListener(this.elems.mode, "change", this.changeMode);
            Dom.addEventListener(this.elems.input_dst, "change", this.changeTableMode);
            Dom.addEventListener(this.elems.input_src, "change", this.changeTableMode);
            this.changeMode();
        }
        static initialize() {
            new Encryption();
        }
        makeSpan(c) {
            return Dom.elem("span", { className: "not_assigned", dataset: { c: c } }, c);
        }
        import_target_str(encrypt) {
            const src = this.elems.src.value;
            Dom.clear(this.elems.dst);
            let dst_str = "";
            let curWord = null;
            for (let i = 0; i < src.length; i++) {
                const s = src[i];
                const sU = s.toUpperCase();
                const isLower = (sU !== s);
                const index = UPPER2INDEX[sU];
                if (index == undefined) {
                    Dom.append(this.elems.dst, s);
                    curWord = null;
                    if (s == ' ' || s == '.') {
                        dst_str += s;
                    }
                }
                else {
                    let c = encrypt ? this.replaceList[(index + (this.mode == "Polyalphabetic" ? i : 0)) % ALPHABETS.length] : ALPHABETS[index];
                    if (isLower) {
                        c = c.toLowerCase();
                    }
                    if (curWord == null) {
                        curWord = document.createElement("span");
                        curWord.className = "word";
                        Dom.append(this.elems.dst, curWord);
                    }
                    Dom.append(curWord, this.makeSpan(c));
                    dst_str += c;
                }
            }
            const counts_1 = {};
            const counts_2 = {};
            const counts_3 = {};
            let c1 = "";
            let c2 = "";
            for (let i = 0; i < dst_str.length; i++) {
                let c0 = dst_str[i].toUpperCase();
                if (UPPER2INDEX[c0] !== undefined) {
                    if (counts_1[c0] == undefined) {
                        counts_1[c0] = 1;
                    }
                    else {
                        counts_1[c0]++;
                    }
                    if (i > 0 && UPPER2INDEX[c1] !== undefined) {
                        const p = c1 + c0;
                        if (counts_2[p] == undefined) {
                            counts_2[p] = 1;
                        }
                        else {
                            counts_2[p]++;
                        }
                        if (i > 1 && UPPER2INDEX[c2] !== undefined) {
                            const t = c2 + p;
                            if (counts_3[t] == undefined) {
                                counts_3[t] = 1;
                            }
                            else {
                                counts_3[t]++;
                            }
                        }
                    }
                }
                c2 = c1;
                c1 = c0;
            }
            this.makeGraph(this.elems.graph_1, "出現回数", counts_1);
            this.makeGraph(this.elems.graph_2, "出現回数(2文字)", counts_2);
            this.makeGraph(this.elems.graph_3, "出現回数(3文字)", counts_3);
            this.hideSrcPanel();
            this.updateTables();
        }
        makeGraph(graph, caption, data) {
            const list = [];
            let max = 0;
            for (let c in data) {
                let count = data[c];
                list.push([c, count]);
                if (max < count) {
                    max = count;
                }
            }
            list.sort((a, b) => {
                if (a[1] < b[1]) {
                    return 1;
                }
                else if (a[1] > b[1]) {
                    return -1;
                }
                else {
                    if (a[0] > b[0]) {
                        return 1;
                    }
                    else if (a[0] < b[0]) {
                        return -1;
                    }
                    else {
                        return 0;
                    }
                }
            });
            const itemCount = Math.min(ALPHABETS.length, list.length);
            //			const graph = document.getElementById(id);
            Dom.clear(graph);
            Dom.append(graph, Dom.elem("caption", caption));
            for (let i = 0; i < itemCount; i++) {
                const c = list[i][0];
                const count = list[i][1];
                const tr = Dom.elem("tr");
                const td = Dom.elem("td");
                for (let j = 0; j < c.length; j++) {
                    Dom.append(td, this.makeSpan(c[j]));
                }
                td.appendChild(document.createTextNode(":" + count));
                tr.appendChild(td);
                const width = Math.floor(GRAPH_WIDTH * count / max);
                Dom.append(tr, Dom.elem("td", { style: {
                        backgroundColor: "cyan",
                        width: "" + width + "px",
                        borderColor: "white",
                        borderWidth: "0 " + (GRAPH_WIDTH - width) + "px 0 0"
                    } }));
                Dom.append(graph, tr);
            }
        }
        updateTables() {
            const srcTable = this.elems.input_dst.checked ? this.guessTableS2D : this.guessTableD2S;
            const dstTable = this.elems.input_dst.checked ? this.guessTableD2S : this.guessTableS2D;
            Dom.clear(this.unused);
            if (this.mode === "CAESAR") {
                const value = this.guessInputs[0].value.toUpperCase();
                const index = UPPER2INDEX[value];
                if (index !== undefined) {
                    for (let i = 0; i < ALPHABETS.length; i++) {
                        const c = ALPHABETS[i];
                        const value = ALPHABETS[(i + index) % ALPHABETS.length];
                        this.guessInputs[i].value = value;
                        srcTable[c] = value;
                        dstTable[value] = c;
                    }
                }
                else {
                    for (let i = 0; i < ALPHABETS.length; i++) {
                        const input = Dom.getInput("guess_" + ALPHABETS[i]);
                        if (input !== this.guessInputs[0]) {
                            input.value = '';
                        }
                    }
                    Dom.setText(this.unused, ALPHABETS.join(", "));
                }
            }
            else {
                const errors = new Set();
                for (let i = 0; i < ALPHABETS.length; i++) {
                    const src = ALPHABETS[i];
                    const dstRaw = this.guessInputs[i].value;
                    const dst = dstRaw.toUpperCase();
                    if (dst !== "") {
                        if (dst !== dstRaw) {
                            this.guessInputs[i].value = dst;
                        }
                        if (dstTable[dst] == undefined) {
                            dstTable[dst] = src;
                        }
                        else {
                            errors.add(dst);
                        }
                    }
                }
                for (let i = 0; i < ALPHABETS.length; i++) {
                    const dst = this.guessInputs[i].value.toUpperCase();
                    if (errors.has(dst)) {
                        Dom.appendClass(this.guessInputs[i], "error");
                        dstTable[dst] = undefined;
                    }
                    else {
                        Dom.removeClass(this.guessInputs[i], "error");
                        if (dst !== "") {
                            srcTable[ALPHABETS[i]] = dst;
                        }
                    }
                }
                if (errors.size > 0) {
                    Dom.append(this.unused, Dom.elem("span", { style: { color: "red" } }, "割り当てが重複しています"));
                }
                else {
                    Dom.append(this.unused, ALPHABETS.filter((c) => dstTable[c] === undefined).join(", "));
                }
            }
            this.updateContent();
        }
        updateContent() {
            let i = 0;
            Dom.eachChild(this.elems.dst, (word) => {
                if (word instanceof Text) {
                    i++;
                    if (i >= ALPHABETS.length) {
                        i = 0;
                    }
                }
                else if (word instanceof HTMLElement) {
                    Dom.eachChildElement(word, (span) => {
                        let c = span.dataset.c;
                        if (c !== undefined) {
                            const cU = c.toUpperCase();
                            const isLower = (c !== cU);
                            const n = UPPER2INDEX[cU];
                            let value = this.guessTableD2S[cU];
                            if (value !== undefined) {
                                if (this.mode == "Polyalphabetic") {
                                    value = ALPHABETS[(ALPHABETS.length + UPPER2INDEX[value] - i) % ALPHABETS.length];
                                }
                                if (isLower) {
                                    value = value.toLowerCase();
                                }
                            }
                            if (span.className == "not_assigned") {
                                if (value != undefined) {
                                    Dom.setText(span, value);
                                    span.className = "assigned";
                                }
                            }
                            else {
                                if (value == undefined) {
                                    Dom.setText(span, c);
                                    span.className = "not_assigned";
                                }
                            }
                            i++;
                            if (i >= ALPHABETS.length) {
                                i = 0;
                            }
                        }
                    });
                }
            });
        }
        ;
        createReplaceList() {
            if (this.mode == "CAESAR") {
                const shift = 1 + Math.floor(Math.random() * (ALPHABETS.length - 1));
                this.replaceList = [];
                for (let i = 0; i < ALPHABETS.length; i++) {
                    this.replaceList[i] = ALPHABETS[(i + shift) % ALPHABETS.length];
                }
            }
            else {
                while (true) {
                    this.replaceList = ALPHABETS.concat([]);
                    for (let i = 0; i < ALPHABETS.length; i++) {
                        let j = Math.floor(Math.random() * ALPHABETS.length);
                        let tmp = this.replaceList[j];
                        this.replaceList[j] = this.replaceList[i];
                        this.replaceList[i] = tmp;
                    }
                    let failed = false;
                    for (let i = 0; i < ALPHABETS.length; i++) {
                        if (this.replaceList[i] == ALPHABETS[i]) {
                            failed = true;
                            break;
                        }
                    }
                    if (failed) {
                        break;
                    }
                }
            }
            const replaceTable = {};
            for (let i = 0; i < ALPHABETS.length; i++) {
                let src = ALPHABETS[i];
                let dst = this.replaceList[i];
                replaceTable[src] = dst;
            }
        }
        createReplaceTableColumn(title, list, offset) {
            if (offset === undefined) {
                offset = 0;
            }
            const tr = Dom.elem("tr", Dom.elem("th", title));
            for (let i = 0; i < list.length; i++) {
                Dom.append(tr, Dom.elem("td", list[(i + offset) % list.length]));
            }
            return tr;
        }
        createReplaceTable() {
            Dom.clear(this.elems.table);
            this.createReplaceList();
            Dom.append(this.elems.table, this.createReplaceTableColumn("置換元", ALPHABETS));
            if (this.mode === "Polyalphabetic") {
                for (let i = 0; i < ALPHABETS.length; i++) {
                    Dom.append(this.elems.table, this.createReplaceTableColumn("置換先" + (i + 1), this.replaceList, i));
                }
            }
            else {
                Dom.append(this.elems.table, this.createReplaceTableColumn("置換先", this.replaceList));
            }
        }
        createGuessTable() {
            Dom.clear(this.elems.guess);
            let trSrc;
            let trDst;
            let trInputs;
            let table;
            this.guessInputs = [];
            if (this.elems.input_dst.checked) {
                trSrc = this.createReplaceTableColumn("置換元", ALPHABETS);
                trInputs = trDst = Dom.elem("tr", Dom.elem("th", "置換先"));
                table = this.guessTableS2D;
            }
            else {
                trDst = this.createReplaceTableColumn("置換先", ALPHABETS);
                trInputs = trSrc = Dom.elem("tr", Dom.elem("th", "置換元"));
                table = this.guessTableD2S;
            }
            for (let i = 0; i < ALPHABETS.length; i++) {
                const c = ALPHABETS[i];
                const input = Dom.elem("input", { type: "text", size: 1, maxLength: 1, id: "guess_" + c, style: { width: "2em" }, dataset: { c: c } });
                const guess = table[c];
                if (guess !== undefined) {
                    input.value = guess;
                }
                Dom.append(trInputs, Dom.elem("td", input));
                if (this.mode == "CAESAR" && i > 0) {
                    input.disabled = true;
                }
                else {
                    Dom.addEventListener(input, "keyup", this.updateGuess);
                }
                this.guessInputs[i] = input;
            }
            Dom.append(this.elems.guess, trSrc);
            Dom.append(this.elems.guess, Dom.elem("tr", Dom.elem("th"), ALPHABETS.map(() => Dom.elem("th", "↓"))));
            Dom.append(this.elems.guess, trDst);
            this.unused = Dom.elem("td", { className: "unused", colSpan: ALPHABETS.length });
            Dom.append(this.elems.guess, Dom.elem("tr"));
            Dom.append(this.elems.guess, Dom.elem("tr", Dom.elem("th", "未割り当て"), this.unused));
            this.updateTables();
        }
        toggleMessage(element) {
            const alt = element.dataset.alt;
            if (alt !== undefined) {
                element.dataset.alt = element.value;
                element.value = alt;
            }
        }
        showSrcPanel() {
            if (this.elems.src_panel.style.display == "none") {
                this.toggleSrcPanel();
            }
        }
        hideSrcPanel() {
            if (this.elems.src_panel.style.display == "") {
                this.toggleSrcPanel();
            }
        }
    }
    Lib.executeOnDomLoad(Encryption.initialize);
})(Demo || (Demo = {}));
