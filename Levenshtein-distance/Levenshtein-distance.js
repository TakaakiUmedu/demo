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
                div.style.position = "fixed";
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
            //			gDebgugWindow.style.top = toPx(document.documentElement ? document.documentElement.scrollTop : 0);
            gDebgugWindow.style.top = "0px";
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
            return eachDescendantElement(element, (child) => {
                if (child.tagName.toLowerCase() === name) {
                    return task(child); // cast guarded by name
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
        function addEventListener(element, event, listener, options) {
            let useCapture;
            if (typeof (options) === "boolean" || options === undefined) {
                useCapture = options;
            }
            else {
                if (isPassiveSupported()) {
                    useCapture = options; // for { passive : true }
                }
                else {
                    useCapture = options.capture;
                }
            }
            element.addEventListener(event, listener, useCapture);
        }
        Dom.addEventListener = addEventListener;
        function setEventListeners(type, event_name, table, useCapture) {
            for (const id in table) {
                getElementWithType(type, id).addEventListener(event_name, table[id], useCapture);
            }
        }
        Dom.setEventListeners = setEventListeners;
        // unsafe
        function getTypedElement(id, TYPE) {
            const element = document.getElementById(id);
            if (element) {
                if (element instanceof TYPE) {
                    return element; // gurded by TYPE
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
        // unsafe
        function findElementWithType(TYPE, id) {
            const element = document.getElementById(id);
            if (element && element instanceof TYPE) {
                return element; // guarded by TYPE
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
        let passiveSupported = undefined;
        function isPassiveSupported() {
            if (passiveSupported === undefined) {
                passiveSupported = false;
                const f = () => { };
                const options = Object.defineProperty({}, "passive", {
                    get: function () {
                        passiveSupported = true;
                    }
                });
                window.addEventListener("test", options, options);
                window.removeEventListener("test", options, options);
            }
            return passiveSupported;
        }
        Dom.isPassiveSupported = isPassiveSupported;
    })(Dom = Lib.Dom || (Lib.Dom = {}));
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
/// <reference path="./mylib.linear_algebra.ts"/>
var Lib;
/// <reference path="./mylib.linear_algebra.ts"/>
(function (Lib) {
    class Color {
        constructor(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        static toHex(d) {
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
        }
        add(col) {
            return new Color(this.r + col.r, this.g + col.g, this.b + col.b);
        }
        sub(col) {
            return new Color(this.r - col.r, this.g - col.g, this.b - col.b);
        }
        mul(r) {
            return new Color(this.r * r, this.g + r, this.b + r);
        }
        div(r) {
            return new Color(this.r / r, this.g / r, this.b / r);
        }
        neg() {
            return new Color(-this.r, -this.g, -this.b);
        }
        isZero() {
            return this.r == 0 && this.g == 0 && this.b == 0;
        }
        equals(obj) {
            if (obj instanceof Color) {
                return this.r == obj.r && this.g == obj.g && this.b == obj.b;
            }
            else {
                return false;
            }
        }
        toString() {
            return "#" + Color.toHex(this.r) + Color.toHex(this.g) + Color.toHex(this.b);
        }
    }
    Lib.Color = Color;
})(Lib || (Lib = {}));
/// <reference path="./mylib.dom.ts"/>
/// <reference path="./mylib.color.ts"/>
var Lib;
/// <reference path="./mylib.dom.ts"/>
/// <reference path="./mylib.color.ts"/>
(function (Lib) {
    let SVG;
    (function (SVG) {
        const Dom = Lib.Dom;
        function getSVG(id) {
            return Dom.getElementWithType(SVGElement, id);
        }
        SVG.getSVG = getSVG;
        function getSVGs(...idList) {
            return Dom.getTypedElements(idList, SVGElement);
        }
        SVG.getSVGs = getSVGs;
        class Context {
            constructor(svg) {
                this.svg = svg;
                this.path = null;
            }
            beginPath() {
                this.path = [];
            }
            moveTo(x, y) {
                if (this.path === null) {
                    throw "hoge";
                }
                this.path.push("M " + x + " " + y);
            }
            lineTo(x, y) {
                if (this.path === null) {
                    throw "hoge";
                }
                this.path.push("L " + x + " " + y);
            }
            stroke() {
                if (this.path === null) {
                    throw "hoge";
                }
                let d = [];
                const path = elem("path", { d: this.path.join(" "), fill: "transparent", stroke: "black" });
                Dom.append(this.svg, path);
                this.path = null;
                return path;
            }
        }
        SVG.Context = Context;
        function elem(name, attributes, ...children) {
            let e = document.createElementNS("http://www.w3.org/2000/svg", name);
            setAttributes(e, attributes);
            for (const child of children) {
                Dom.append(e, child);
            }
            return e;
        }
        SVG.elem = elem;
        function setAttributes(elem, attributes) {
            if (attributes) {
                for (let name in attributes) {
                    if (name == "className") {
                        elem.setAttribute("class", attributes[name]);
                    }
                    else {
                        elem.setAttribute(name, attributes[name]);
                    }
                }
            }
        }
        SVG.setAttributes = setAttributes;
        function circle(cx, cy, r, stroke, fill, attributes) {
            const e = elem("circle", {
                cx: cx + "px",
                cy: cy + "px",
                r: r + "px",
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges",
            });
            setAttributes(e, attributes);
            return e;
        }
        SVG.circle = circle;
        function ellipse(cx, cy, rx, ry, stroke, fill, attributes) {
            const e = elem("ellipse", {
                cx: cx + "px",
                cy: cy + "px",
                rx: rx + "px",
                ry: ry + "px",
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges",
            });
            setAttributes(e, attributes);
            return e;
        }
        SVG.ellipse = ellipse;
        function rect(x, y, width, height, stroke, fill, attributes) {
            const e = elem("rect", {
                x: x + "px",
                y: y + "px",
                width: width + "px",
                height: height + "px",
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges",
            });
            setAttributes(e, attributes);
            return e;
        }
        SVG.rect = rect;
        function path(path, stroke, fill, attributes) {
            const e = elem("path", {
                d: path,
                stroke: stroke,
                fill: fill,
                "shape-rendering": "crispEdges",
            });
            setAttributes(e, attributes);
            return e;
        }
        SVG.path = path;
        function text(x, y, text, stroke, fill, attributes) {
            const e = elem("text", {
                x: x + "px",
                y: y + "px",
            }, text);
            setAttributes(e, attributes);
            return e;
        }
        SVG.text = text;
        function fill(elem, r, g, b) {
            elem.setAttribute("fill", new Lib.Color(r, g, b).toString());
        }
        SVG.fill = fill;
    })(SVG = Lib.SVG || (Lib.SVG = {}));
})(Lib || (Lib = {}));
//type PrioritizedDo<T> = (priority: number, action:(pseudoTarget: T)=> void)=> void;
function prioritizedExecute(target, maxPriority, action) {
    const tasks = [];
    const targets = [];
    for (let prio = 0; prio < maxPriority; prio++) {
        tasks[prio] = [];
        const tmpTarget = new Object();
        for (const name in target) {
            const org = target[name];
            if (typeof (org) === "function") {
                tmpTarget[name] = (...args) => {
                    tasks[prio].push({ name, args });
                };
            }
            else {
                tmpTarget[name] = org;
            }
        }
        targets[prio] = tmpTarget;
    }
    try {
        action(targets);
    }
    finally {
        for (const list of tasks) {
            for (const task of list) {
                target[task.name].apply(target, task.args);
            }
        }
    }
}
prioritizedExecute(console, 3, (consoles) => {
    consoles[2].log(10);
    consoles[0].log(20);
    consoles[1].log(30);
});
/// <reference path="./mylib.dom.ts" />
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>
var Levenshtein_distance;
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>
(function (Levenshtein_distance) {
    const Dom = Lib.Dom;
    const SVG = Lib.SVG;
    const cursor = "⌶";
    const M = 50;
    const H = 80;
    const W = 80;
    const R = 15;
    const Rm = 2;
    const Ra = R + Rm;
    const A = 5;
    const Rd = Ra / Math.sqrt(2);
    const Ad = A * Math.sqrt(2);
    const Mt = 5;
    const FS = 12;
    const FL = 12;
    class Demo {
        constructor() {
            this.elems = Dom.combineTables(Dom.getInputs("from", "to", "restart", "pass", "replace", "delete", "insert", "undo", "calc", "show_arrows", "show_distances", "show_states"), Dom.getElements("to_rest", "to_done", "from_rest", "history", "svg_frame", "history_frame"), SVG.getSVGs("svg"));
            this.history = [];
            this.route_table = [];
            this.cost_table = [];
            this.arrow_table_r = [];
            this.arrow_table_d = [];
            this.arrow_table_rd = [];
            this.undo = () => {
                if (this.history.length > 1) {
                    const entry = this.history.pop();
                    if (entry !== undefined) {
                        const [count, to_done, to_rest, from_rest, tr, svgElem] = entry;
                        Dom.remove(tr);
                        this.setTexts(to_done, to_rest, from_rest);
                        this.elems.history_frame.scrollTop = this.elems.history_frame.scrollHeight;
                        svgElem.setAttribute("class", "");
                    }
                }
            };
            this.prepareGraph = () => {
                this.arrow_table_r = [];
                this.arrow_table_d = [];
                this.arrow_table_rd = [];
                const display_org = this.elems.svg_frame.style.display;
                const svg_frame_class_org = this.elems.svg_frame.className;
                this.elems.svg.removeAttribute("viewBox");
                this.elems.svg_frame.style.display = "";
                Dom.appendClass(this.elems.svg_frame, "show_states");
                Dom.clear(this.elems.svg);
                this.route_table = [];
                this.cost_table = [];
                const sx = this.elems.from.value;
                const sy = this.elems.to.value;
                const lx = sx.length;
                const ly = sy.length;
                const g_base = SVG.elem("g");
                const g_over = SVG.elem("g");
                const g_graph = SVG.elem("g", {}, g_base, g_over);
                Dom.append(this.elems.svg, g_graph);
                let labelx_width_max = 0;
                let labelx_height_max = 0;
                let labely_width_max = 0;
                for (let y = 0; y < ly + 1; y++) {
                    const ssy = sy.substr(0, y);
                    const costs = [];
                    const routes = [];
                    this.cost_table.push(costs);
                    this.route_table.push(routes);
                    if (y == 0) {
                        costs.push(0);
                        routes.push([0, 0]);
                        for (let x = 1; x < lx + 1; x++) {
                            costs.push(x);
                            routes.push([-1, 0]);
                        }
                    }
                    else {
                        const prev_costs = this.cost_table[y - 1];
                        costs.push(prev_costs[0] + 1);
                        routes.push([0, -1]);
                        for (let x = 1; x < lx + 1; x++) {
                            const c1 = costs[x - 1] + 1;
                            const c2 = prev_costs[x] + 1;
                            const c3 = prev_costs[x - 1] + (sx[x - 1] == sy[y - 1] ? 0 : 1);
                            if (c3 <= c1 && c3 <= c2) {
                                costs.push(c3);
                                routes.push([-1, -1]);
                            }
                            else if (c1 <= c2 && c1 <= c3) {
                                costs.push(c1);
                                routes.push([-1, 0]);
                            }
                            else {
                                costs.push(c2);
                                routes.push([0, -1]);
                            }
                        }
                    }
                    const arrows_r = [];
                    const arrows_d = [];
                    const arrows_rd = [];
                    this.arrow_table_r.push(arrows_r);
                    this.arrow_table_d.push(arrows_d);
                    this.arrow_table_rd.push(arrows_rd);
                    for (let x = 0; x < lx + 1; x++) {
                        const ssx = sx.substr(x);
                        if (y < ly) {
                            const ad = this.arrow(x, y, false, true);
                            Dom.append(g_base, ad);
                            arrows_d.push(ad);
                            if (x < lx) {
                                const ard = this.arrow(x, y, true, true, sx[x] == sy[y]);
                                Dom.append(g_base, ard);
                                arrows_rd.push(ard);
                            }
                        }
                        if (x < lx) {
                            const ar = this.arrow(x, y, true, false);
                            Dom.append(g_base, ar);
                            arrows_r.push(ar);
                        }
                        const circle = SVG.circle(x * W, y * H, R, "black", "transparent", { className: "search-node", title: "hoge-fuga" });
                        Dom.append(g_base, SVG.text(x * W, y * H, "" + costs[x], "none", "black", { "class": "distance", style: "text-anchor:middle;dominant-baseline:central;" }));
                        Dom.append(g_base, circle);
                        const state_text = SVG.text(0, 0, ssy + " ⌶ " + ssx, "none", "black", { style: "text-anchor:middle;dominant-baseline:central;font-size:" + FS + "px;" });
                        const state_rect = SVG.rect(0, 0, 0, 0, "black", "white");
                        const state = SVG.elem("g", { "class": "state" }, state_rect, state_text);
                        Dom.append(g_over, state);
                        const state_size = state_text.getBoundingClientRect();
                        const state_w = state_size.width;
                        const state_h = state_size.height;
                        state.setAttribute("class", "state hidden");
                        state_rect.setAttribute("x", (-state_w / 2 - FS / 2) + "px");
                        state_rect.setAttribute("y", (-state_h / 2) + "px");
                        state_rect.setAttribute("width", (state_w + FS) + "px");
                        state_rect.setAttribute("height", state_h + "px");
                        state.setAttribute("transform", "translate(" + (x * W) + "," + (y * H + R + state_h / 2) + ")");
                        ((circle, state, x, y) => {
                            circle.addEventListener("mouseover", () => {
                                state.setAttribute("class", "state show");
                            });
                            circle.addEventListener("mouseout", () => {
                                state.setAttribute("class", "state hidden");
                            });
                            circle.addEventListener("click", () => {
                                this.undoAll();
                                let cur_x = x;
                                let cur_y = y;
                                let route = [];
                                while (cur_x > 0 || cur_y > 0) {
                                    const d = this.route_table[cur_y][cur_x];
                                    route.push(d);
                                    cur_x += d[0];
                                    cur_y += d[1];
                                }
                                for (let k = route.length - 1; k >= 0; k--) {
                                    const [dx, dy] = route[k];
                                    cur_x -= dx;
                                    cur_y -= dy;
                                    if (dx == -1 && dy == -1) {
                                        if (sx[cur_x - 1] == sy[cur_y - 1]) {
                                            this.advance("pass");
                                        }
                                        else {
                                            this.advance("replace");
                                        }
                                    }
                                    else if (dx == -1) {
                                        this.advance("del");
                                    }
                                    else {
                                        this.advance("insert");
                                    }
                                }
                            });
                        })(circle, state, x, y);
                    }
                    const labely_text = SVG.text(-R - Mt, y * H, ssy + "⌶", "none", "black", { style: "text-anchor:end;dominant-baseline:central;font-size:" + FL + "px;" });
                    Dom.append(g_base, labely_text);
                    const labely_width = labely_text.getBoundingClientRect().width;
                    labely_width_max = Math.max(labely_width_max, labely_width + Mt);
                }
                for (let x = 0; x < lx + 1; x++) {
                    const ssx = sx.substr(x);
                    const labelx_text = SVG.text(0, 0, "⌶" + ssx, "none", "black", { style: "text-anchor:start;text-bottom:central;font-size:" + FL + "px;" });
                    const labelx_g = SVG.elem("g", { transform: "translate(" + (x * W) + "," + (-R - Mt) + ") rotate(-30)" }, labelx_text);
                    Dom.append(g_base, labelx_g);
                    const labelx_rect = labelx_text.getBoundingClientRect();
                    labelx_width_max = Math.max(labelx_width_max, labelx_rect.width + Mt);
                    labelx_height_max = Math.max(labelx_height_max, labelx_rect.height + Mt);
                }
                const svg_w = this.elems.svg_frame.offsetWidth;
                const svg_h = this.elems.svg_frame.offsetWidth;
                const inner_w = (labely_width_max + Mt * 2 + (lx) * W + R * 2);
                const inner_h = (labelx_height_max + Mt * 2 + (ly) * W + R * 2 + FS + Mt);
                const scale = svg_w / inner_w;
                this.elems.svg.setAttribute("viewBox", "0 0 " + inner_w + " " + inner_h);
                g_graph.setAttribute("transform", "translate(" + (labely_width_max + Mt + R) + "," + (labelx_height_max + Mt + R) + ")");
                this.elems.svg_frame.style.width = "100%";
                this.elems.svg_frame.style.height = "calc(" + (document.documentElement.clientHeight - this.elems.svg_frame.offsetTop) + "px" + " - 1em)";
                this.elems.svg_frame.style.display = display_org;
                this.elems.svg_frame.className = svg_frame_class_org;
            };
            Dom.addEventListener(this.elems.restart, "click", () => {
                this.initialize();
            });
            Dom.addEventListener(this.elems.pass, "click", () => this.advance("pass"));
            Dom.addEventListener(this.elems.delete, "click", () => this.advance("del"));
            Dom.addEventListener(this.elems.replace, "click", () => this.advance("replace"));
            Dom.addEventListener(this.elems.insert, "click", () => this.advance("insert"));
            Dom.addEventListener(this.elems.undo, "click", this.undo);
            Dom.addEventListener(this.elems.calc, "click", () => {
                this.elems.svg_frame.style.display = "";
            });
            this.setToggleClassByCheckbox(this.elems.show_distances, this.elems.svg_frame, "show_distances");
            this.setToggleClassByCheckbox(this.elems.show_states, this.elems.svg_frame, "show_states");
            this.setToggleClassByCheckbox(this.elems.show_arrows, this.elems.svg_frame, "show_arrows");
            this.initialize();
        }
        static initialize() {
            new Demo();
        }
        setToggleClassByCheckbox(checkbox, target, className) {
            const toggleFunc = () => {
                if (checkbox.checked) {
                    Dom.appendClass(target, className);
                }
                else {
                    Dom.removeClass(target, className);
                }
            };
            Dom.addEventListener(checkbox, "change", toggleFunc);
            toggleFunc();
        }
        advance(mode) {
            const l1 = this.to_rest.length > 0 ? this.to_rest[0] : "";
            const l2 = this.from_rest.length > 0 ? this.from_rest[0] : "";
            const x = this.from_org.length - this.from_rest.length;
            const y = this.to_done.length;
            switch (mode) {
                case "pass":
                    if (this.to_rest.length > 0 && this.from_rest.length > 0 && l1 == l2) {
                        this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest.substr(1), 0, this.elems.pass.value, this.arrow_table_rd[y][x]);
                    }
                    break;
                case "replace":
                    if (this.to_rest.length > 0 && this.from_rest.length > 0) {
                        this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest.substr(1), 1, this.elems.replace.value, this.arrow_table_rd[y][x]);
                    }
                    break;
                case "del":
                    if (this.from_rest.length > 0) {
                        this.advanceEdit(this.to_done, this.to_rest, this.from_rest.substr(1), 1, this.elems.delete.value, this.arrow_table_r[y][x]);
                    }
                    break;
                case "insert":
                    if (this.to_rest.length > 0) {
                        this.advanceEdit(this.to_done + l1, this.to_rest.substr(1), this.from_rest, 1, this.elems.insert.value, this.arrow_table_d[y][x]);
                    }
                    break;
            }
        }
        undoAll() {
            for (let i = 1; i < this.history.length; i++) {
                this.history[i][5].setAttribute("class", "");
            }
            this.history = [];
            Dom.clear(this.elems.history);
            this.from_org = this.elems.from.value;
            this.advanceEdit("", this.elems.to.value, this.elems.from.value, 0, "編集開始", SVG.elem("g"));
        }
        initialize() {
            this.prepareGraph();
            this.undoAll();
        }
        advanceEdit(to_done, to_rest, from_rest, count, history, svgElem) {
            count += this.history.length == 0 ? 0 : this.history[this.history.length - 1][0];
            const tr = Dom.tr(history, Dom.td(to_done, Dom.span(" ⌶ ", { className: "caret" }), from_rest), count + "手");
            Dom.append(this.elems.history, tr);
            this.history.push([count, this.to_done, this.to_rest, this.from_rest, tr, svgElem]);
            this.setTexts(to_done, to_rest, from_rest);
            this.elems.history_frame.scrollTop = this.elems.history_frame.scrollHeight;
            svgElem.setAttribute("class", "selected");
        }
        setTexts(to_done, to_rest, from_rest) {
            this.to_done = to_done;
            this.to_rest = to_rest;
            this.from_rest = from_rest;
            Dom.setText(this.elems.to_done, this.to_done);
            Dom.setText(this.elems.to_rest, this.to_rest);
            Dom.setText(this.elems.from_rest, this.from_rest);
            const l1 = this.to_rest.length > 0 ? this.to_rest[0] : "-";
            const l2 = this.from_rest.length > 0 ? this.from_rest[0] : "-";
            this.elems.pass.value = "“" + l2 + "”をそのまま通す";
            this.elems.replace.value = "“" + l1 + "”を“" + l2 + "”に置換";
            this.elems.delete.value = "“" + l2 + "”を削除";
            this.elems.insert.value = "“" + l1 + "”を挿入";
            if (this.from_rest.length > 0 && this.to_rest.length > 0) {
                if (l1 == l2) {
                    this.elems.pass.disabled = false;
                    this.elems.replace.disabled = true;
                }
                else {
                    this.elems.pass.disabled = true;
                    this.elems.replace.disabled = false;
                }
            }
            else {
                this.elems.pass.disabled = true;
                this.elems.replace.disabled = true;
            }
            this.elems.delete.disabled = !(this.from_rest.length > 0);
            this.elems.insert.disabled = !(this.to_rest.length > 0);
            this.elems.undo.disabled = this.history.length == 1;
        }
        arrow(x, y, dx, dy, dashed = false) {
            let dl;
            let da;
            if (!dx) {
                dl = "M " + (x * W) + " " + (y * H + Ra) + " " + "l 0 " + (H - Ra * 2);
                da = "M " + (x * W - A) + " " + ((y + 1) * H - Ra - A) + " " +
                    "l " + A + " " + A + " " +
                    "l " + A + " " + (-A);
            }
            else if (!dy) {
                dl = "M " + (x * W + Ra) + " " + (y * H) + " " + "l " + (W - Ra * 2) + " 0";
                da = "M " + ((x + 1) * W - Ra - A) + " " + (y * H - A) + " " +
                    "l " + A + " " + A + " " +
                    "l " + (-A) + " " + A;
            }
            else {
                dl = "M " + (x * W + Rd) + " " + (y * H + Rd) + " " + "l " + (W - Rd * 2) + " " + (H - Rd * 2);
                da = "M " + ((x + 1) * W - Rd - Ad) + " " + ((y + 1) * W - Rd) + " " +
                    "l " + Ad + " 0 " +
                    "l 0 " + (-Ad);
            }
            const pl = SVG.path(dl, "black", "transparent");
            if (dashed) {
                pl.setAttribute("stroke-dasharray", "5 5");
            }
            return SVG.elem("g", { className: "arrow" }, pl, SVG.path(da, "black", "transparent"));
        }
    }
    Lib.executeOnDomLoad(Demo.initialize);
})(Levenshtein_distance || (Levenshtein_distance = {}));
