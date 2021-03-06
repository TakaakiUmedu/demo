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
/// <reference path="./mylib.linear_algebra.ts" />
/// <reference path="./mylib.dom.ts" />
var Lib;
/// <reference path="./mylib.linear_algebra.ts" />
/// <reference path="./mylib.dom.ts" />
(function (Lib) {
    function hypot2(...dList) {
        let sum = 0;
        for (let i = 0; i < dList.length; i++) {
            const d = dList[i];
            sum += d * d;
        }
        return sum;
    }
    Lib.hypot2 = hypot2;
    function hypot(...dList) {
        return Math.sqrt(hypot2(...dList));
    }
    Lib.hypot = hypot;
    class BasicVector2D {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        toString() {
            return "(" + this.x + ", " + this.y + ")";
        }
        equals(v) {
            if (this === v) {
                return true;
            }
            else if (v instanceof BasicVector2D) {
                return this.x == v.x && this.y == v.y;
            }
            else {
                return false;
            }
        }
    }
    class Vector2D extends BasicVector2D {
        length2() {
            return hypot2(this.x, this.y);
        }
        length() {
            return Math.sqrt(this.length2());
        }
        rotateR() {
            return new Vector2D(-this.y, this.x);
        }
        unit() {
            const d = this.length();
            if (d > 0) {
                return this.div(d);
            }
            else {
                return null;
            }
        }
        add(vector) {
            return new Vector2D(this.x + vector.x, this.y + vector.y);
        }
        sub(vector) {
            return new Vector2D(this.x - vector.x, this.y - vector.y);
        }
        mul(value) {
            return new Vector2D(this.x * value, this.y * value);
        }
        div(value) {
            return new Vector2D(this.x / value, this.y / value);
        }
        neg() {
            return new Vector2D(-this.x, -this.y);
        }
        isZero() {
            return this.x == 0 && this.y == 0;
        }
        static random(length = 1.0) {
            const r = Math.PI * 2 * Math.random();
            return new Vector2D(length * Math.sin(r), length * Math.cos(r));
        }
        static fromMouseOffset(event) {
            const offset = new Vector2D(event.offsetX, event.offsetY);
            if (event.target !== event.currentTarget) {
                if (event.target instanceof HTMLElement && event.currentTarget instanceof HTMLElement) {
                    //Lib.debugOutput(event.target.className + ", " + event.currentTarget.tagName + ", " + Vector2D.fromElementOffset(event.target, event.currentTarget));
                    return Vector2D.fromElementOffset(event.target, event.currentTarget).add(offset);
                }
                else {
                    return offset;
                }
            }
            else {
                return offset;
            }
        }
        static fromElementOffset(element, origin) {
            const target = Lib.Dom.prepareTarget(element);
            if (target instanceof HTMLElement) {
                const offset = new Lib.Vector2D(target.offsetLeft, target.offsetTop);
                if (origin !== undefined) {
                    const originElem = Lib.Dom.prepareTarget(origin);
                    const parent = target.offsetParent;
                    if (parent !== null && parent !== originElem && parent instanceof HTMLElement) {
                        return offset.add(Vector2D.fromElementOffset(parent, originElem));
                    }
                }
                return offset;
            }
            else {
                throw "element has not offset";
            }
        }
    }
    Lib.Vector2D = Vector2D;
    class Point2D extends BasicVector2D {
        distance2(point) {
            return hypot2(point.x - this.x, point.y - this.y);
        }
        distance(point) {
            return Math.sqrt(this.distance2(point));
        }
        equals(point) {
            if (point instanceof Point2D) {
                return this.x == point.x && this.y == point.y;
            }
            else {
                return false;
            }
        }
        sub(point) {
            return new Vector2D(this.x - point.x, this.y - point.y);
        }
        add(vector) {
            return new Point2D(this.x + vector.x, this.y + vector.y);
        }
        static fromMouseClient(event) {
            return new Point2D(event.clientX, event.clientY);
        }
        static fromElementStyle(element) {
            const target = Lib.Dom.prepareTarget(element);
            if (target instanceof HTMLElement) {
                return new Lib.Point2D(target.style.left !== null ? parseInt(target.style.left) : 0, target.style.top !== null ? parseInt(target.style.top) : 0);
            }
            else {
                throw "element has not style";
            }
        }
        static fromElementAbsolute(element) {
            const target = Lib.Dom.prepareTarget(element);
            if (target instanceof HTMLElement) {
                let x = target.offsetLeft;
                let y = target.offsetTop;
                let parent = target.offsetParent;
                if (parent) {
                    const pos = Point2D.fromElementAbsolute(parent);
                    x += pos.x;
                    y += pos.y;
                }
                return new Point2D(x, y);
            }
            else {
                throw "element has not offset";
            }
        }
        static fromMouseOffset(event) {
            const v = Vector2D.fromMouseOffset(event);
            return new Point2D(v.x, v.y);
        }
    }
    Lib.Point2D = Point2D;
    class Rectangle extends Lib.PositionPair {
        constructor(x1, y1, x2, y2) {
            if (x1 > x2) {
                const tmp = x1;
                x1 = x2;
                x2 = tmp;
            }
            if (y1 > y2) {
                const tmp = y1;
                y1 = y2;
                y2 = tmp;
            }
            super(new Point2D(x1, y1), new Point2D(x2, y2));
            this.l = this.m1.x;
            this.t = this.m1.y;
            this.r = this.m2.x;
            this.b = this.m2.y;
            this.w = this.r - this.l;
            this.h = this.b - this.t;
        }
        static fromPoints(m1, m2) {
            return new Rectangle(m1.x, m1.y, m2.x, m2.y);
        }
        static fromCenterAndSize(center, size) {
            const size2 = size.div(2);
            return Rectangle.fromPoints(center.add(size2.neg()), center.add(size2));
        }
        static fromLTWH(l, t, w, h) {
            return new Rectangle(l, t, l + w, t + h);
        }
        center() {
            return new Point2D((this.l + this.r) / 2, (this.t + this.b) / 2);
        }
        size() {
            return new Vector2D(this.w, this.h);
        }
        boundaries() {
            const c1 = this.m1;
            const c2 = new Point2D(this.r, this.t);
            const c3 = this.m2;
            const c4 = new Point2D(this.l, this.b);
            return [
                new Segment2D(c1, c2),
                new Segment2D(c2, c3),
                new Segment2D(c3, c4),
                new Segment2D(c4, c1),
            ];
        }
        colideWith(rect) {
            return this.l <= rect.r && this.r >= rect.l && this.t <= rect.b && this.b >= rect.t;
        }
        includes(pos) {
            return pos.x >= this.l && pos.x <= this.r && pos.y >= this.t && pos.y <= this.b;
        }
        distance(rect) {
            if (this.colideWith(rect)) {
                return -Math.min(rect.r - this.l, this.r - rect.l, rect.b - this.t, this.b - rect.t);
            }
            let thisX = null;
            let thisY = null;
            let rectX = null;
            let rectY = null;
            if (this.l > rect.r) {
                // rect this
                thisX = this.l;
                rectX = rect.r;
            }
            else if (this.r < rect.l) {
                // this rect
                thisX = this.r;
                rectX = rect.l;
            }
            if (this.t > rect.b) {
                // rect
                // this
                thisY = this.t;
                rectY = rect.b;
            }
            else if (this.b < rect.t) {
                // this
                // rect
                thisY = this.b;
                rectY = rect.t;
            }
            if (thisX !== null && rectX !== null) {
                if (thisY !== null && rectY !== null) {
                    return hypot(thisX - rectX, thisY - rectY);
                }
                else {
                    return Math.abs(thisX - rectX);
                }
            }
            else {
                if (thisY !== null && rectY !== null) {
                    return Math.abs(thisY - rectY);
                }
            }
            // not reachable
            return 0;
        }
        add(v) {
            return Rectangle.fromPoints(this.m1.add(v.m1), this.m2.add(v.m2));
        } /*
        public sub(rect: Rectangle): VectorPair<Vector2D, number>{
            return new VectorPair<Vector2D, number>(this.center().sub(rect.center()), this.size().sub(rect.size()));
        }*/
    }
    Lib.Rectangle = Rectangle;
    class Line extends Lib.PositionPair {
        vector() {
            return this.m2.sub(this.m1);
        }
    }
    Lib.Line = Line;
    class Line2D extends Line {
        crossPoint(line) {
            let v1 = this.vector();
            let v2 = line.vector();
            // calculate (x, y)
            // v1.x(y - this.m1.y) = v1.y (x - this.m1.x)
            // v2.x(y - line.m1.y) = v2.y (x - line.m1.x)
            let equations = [
                { x: v1.y, y: -v1.x, _: v1.y * this.m1.x - v1.x * this.m1.y },
                { x: v2.y, y: -v2.x, _: v2.y * line.m1.x - v2.x * line.m1.y },
            ];
            const solution = Lib.solveLinearEquation(equations);
            if (solution) {
                return new Point2D(solution.x, solution.y);
            }
            else {
                return null;
            }
        }
    }
    Lib.Line2D = Line2D;
    //	export class Segment<V extends Geometry<V, P>, P extends PointType<V, P>> extends Line<V, P>{
    //		
    //	}
    class Segment2D extends Line2D {
        crossPoint(line) {
            const v1 = this.vector();
            const v2 = line.vector();
            // calculate (s, t)
            // this.m1 + v1 * s = line.m1 + v2 * t
            // this.m1 + v1 * s - line.m1 - v2 * t = 0
            // v1 * s - v2 * t = -this.m1 + line.m1
            const equations = [
                { s: v1.x, t: -v2.x, _: -this.m1.x + line.m1.x },
                { s: v1.y, t: -v2.y, _: -this.m1.y + line.m1.y },
            ];
            const solution = Lib.solveLinearEquation(equations);
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
        }
    }
    Lib.Segment2D = Segment2D;
})(Lib || (Lib = {}));
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.geometry.ts" />
var Lib;
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.geometry.ts" />
(function (Lib) {
    const Dom = Lib.Dom;
    const ARROWHEAD_SIZE = 10;
    const LINE_INTERVAL = 14;
    const WEIGHT_MARGIN = 2;
    const WEIGHT_SIZE = 16;
    const LINK_ORDER = {
        "arrow": 0,
        "reverse": 1,
        "bidir": 2,
        "link": 3,
    };
    class Link {
        constructor(src, dst, type, weight = undefined) {
            this.src = src;
            this.dst = dst;
            this.links = [[type, weight]];
        }
        addType(type, weight = undefined) {
            const link = [type, weight];
            const order = LINK_ORDER[type];
            if (this.links.length == 0) {
                this.links.push(link);
            }
            else {
                for (let i = this.links.length - 1; i >= 0; i--) {
                    if (LINK_ORDER[this.links[i][0]] <= order) {
                        this.links.splice(i + 1, 0, link);
                        return;
                    }
                }
                this.links.splice(0, 0, link);
            }
        }
        draw(context, weights) {
            let srcRect = getRect(this.src);
            let dstRect = getRect(this.dst);
            if (!srcRect.colideWith(dstRect)) {
                let orgSrcPos = srcRect.center();
                let orgDstPos = dstRect.center();
                let srcPos = orgSrcPos;
                let dstPos = orgDstPos;
                let line = new Lib.Line2D(srcPos, dstPos);
                {
                    const srcCp = calcCrossPoint(dstPos, srcPos, srcRect);
                    if (srcCp) {
                        srcPos = srcCp;
                    }
                }
                {
                    const dstCp = calcCrossPoint(srcPos, dstPos, dstRect);
                    if (dstCp) {
                        dstPos = dstCp;
                    }
                }
                const dV = dstPos.sub(srcPos).rotateR().unit() || new Lib.Vector2D(0, 0);
                let dW = -LINE_INTERVAL * (this.links.length - 1) / 2.0;
                const types = ["arrow", "bidir", "link", "reverse"];
                for (const link of this.links) {
                    const [type, weight] = link;
                    const srcPosS = srcPos.add(dV.mul(dW));
                    const dstPosS = dstPos.add(dV.mul(dW));
                    context.beginPath();
                    context.moveTo(srcPosS.x, srcPosS.y);
                    context.lineTo(dstPosS.x, dstPosS.y);
                    context.stroke();
                    if (weight !== undefined) {
                        weights.push([srcPosS.add(dstPosS.sub(srcPosS).mul(0.5)), weight]);
                    }
                    let arrowheadLengthMax = dstPos.sub(srcPos).length();
                    if (type === "bidir") {
                        arrowheadLengthMax /= 2;
                    }
                    let arrowheadSize = Math.min(ARROWHEAD_SIZE, arrowheadLengthMax);
                    if (type === "arrow" || type === "bidir") {
                        drawArrowhead(context, srcPosS, dstPosS, arrowheadSize, arrowheadSize);
                    }
                    if (type === "reverse" || type === "bidir") {
                        drawArrowhead(context, dstPosS, srcPosS, arrowheadSize, arrowheadSize);
                    }
                    dW += LINE_INTERVAL;
                }
            }
            else {
                //				console.log(src_rect, dst_rect);
            }
        }
    }
    function drawArrowhead(context, src, dst, w, h) {
        const v1 = src.sub(dst).unit();
        if (v1) {
            const v2 = v1.mul(h);
            const v3 = v1.rotateR().mul(w / 2);
            const p1 = dst.add(v2);
            const p2 = p1.add(v3);
            const p3 = p1.add(v3.neg());
            context.beginPath();
            context.moveTo(dst.x, dst.y);
            context.lineTo(p2.x, p2.y);
            context.stroke();
            context.beginPath();
            context.moveTo(dst.x, dst.y);
            context.lineTo(p3.x, p3.y);
            context.stroke();
        }
    }
    function calcCrossPoint(srcPos, dstPos, rect) {
        const boundaries = rect.boundaries();
        const line = new Lib.Segment2D(srcPos, dstPos);
        let point = null;
        let distance = 0;
        for (let i = 0; i < boundaries.length; i++) {
            const p = boundaries[i].crossPoint(line);
            if (p) {
                let d = srcPos.distance2(p);
                if (point == null || distance > d) {
                    point = p;
                    distance = d;
                }
            }
        }
        return point;
    }
    function getRect(elem) {
        return Lib.Rectangle.fromLTWH(elem.offsetLeft, elem.offsetTop, elem.offsetWidth, elem.offsetHeight);
    }
    function getPos(elem) {
        return getRect(elem).center();
    }
    //	let LOG = new Dom.ElementWithText("p", "");
    class Graph {
        constructor(target) {
            this.target = target;
            this.nodes = new Lib.StableHash();
            this.links = {};
            this.dragTarget = null;
            this.pointed = null;
            this.dragStart = (event) => {
                const mousePos = Lib.Point2D.fromMouseOffset(event);
                if (this.pointed) {
                    Dom.removeClass(this.pointed, "pointed");
                    const pos = getPos(this.pointed);
                    this.dragTarget = {
                        elem: this.pointed,
                        offset: pos.sub(mousePos),
                    };
                    this.pointed = null;
                    Dom.appendClass(this.dragTarget.elem, "dragged");
                }
                event.preventDefault();
            };
            this.mouseMove = (event) => {
                const mousePos = Lib.Point2D.fromMouseOffset(event);
                if (this.dragTarget) {
                    this.setPos(this.dragTarget.elem, mousePos.add(this.dragTarget.offset));
                    this.update();
                }
                else {
                    const target = this.findTarget(mousePos);
                    if (target) {
                        this.point(target);
                    }
                    else {
                        this.unpoint();
                    }
                }
                event.preventDefault();
            };
            this.dragEnd = (event) => {
                if (this.dragTarget) {
                    Dom.removeClass(this.dragTarget.elem, "dragged");
                    this.point(this.dragTarget.elem);
                    this.dragTarget = null;
                }
                event.preventDefault();
            };
            this.mouseOut = (event) => {
                this.dragEnd(event);
                this.unpoint();
                event.preventDefault();
            };
            this.animated = true;
            this.animate = () => {
                if (this.animated) {
                    this.updateNodePositions();
                    this.update();
                    setTimeout(this.animate, 33);
                }
            };
            this.target.style.position = "relative";
            let child = target.firstChild;
            while (child) {
                if (child instanceof HTMLElement) {
                    child.style.position = "absolute";
                    this.nodes.push(Graph.ensureGetId(child), child);
                }
                child = child.nextSibling;
            }
            let canvas = Dom.canvas2D();
            this.canvas = canvas.canvas;
            this.context = canvas.context;
            this.canvas.width = this.target.scrollWidth;
            this.canvas.height = this.target.scrollHeight;
            this.canvas.style.left = "0";
            this.canvas.style.top = "0";
            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
            //			this.canvas.style.zIndex = "1";
            this.canvas.style.position = "absolute";
            this.canvas.style.backgroundColor = "transparent";
            this.canvas.addEventListener("mousedown", this.dragStart);
            this.canvas.addEventListener("mousemove", this.mouseMove);
            this.canvas.addEventListener("mouseup", this.dragEnd);
            this.canvas.addEventListener("mouseout", this.mouseOut);
            Dom.append(this.target, this.canvas);
            this.nodes.forEach((srcId, src) => {
                const dataList = [
                    ["link", src.dataset.linkWith],
                    ["arrow", src.dataset.linkTo],
                    ["bidir", src.dataset.linkFromTo],
                    ["bidir", src.dataset.linkToFrom],
                ];
                for (let i = 0; i < dataList.length; i++) {
                    let [type, data] = dataList[i];
                    if (data) {
                        for (const idStr of data.split(/\s+/)) {
                            const match = idStr.match(/^(.+)\((.+)\)$/);
                            let dstId;
                            let weight;
                            if (match) {
                                dstId = match[1];
                                weight = match[2];
                            }
                            else {
                                dstId = idStr;
                                weight = undefined;
                            }
                            const dst = this.nodes.get(dstId);
                            if (dst) {
                                let revLink = null;
                                let revLinkTable = this.links[dstId];
                                if (revLinkTable) {
                                    revLink = revLinkTable[srcId];
                                }
                                else {
                                    revLinkTable = this.links[dstId] = {};
                                }
                                if (revLink) {
                                    if (type === "arrow") {
                                        revLink.addType("reverse", weight);
                                    }
                                    else {
                                        revLink.addType(type, weight);
                                    }
                                }
                                else {
                                    let linkTable = this.links[srcId];
                                    if (!linkTable) {
                                        linkTable = this.links[srcId] = {};
                                    }
                                    linkTable[dstId] = new Link(src, dst, type, weight);
                                }
                            }
                            else {
                                console.log("link target not found: from " + srcId + " to " + dstId);
                            }
                        }
                    }
                }
                //				this.nodes.forEach((id, node)=> {
                //					this.set_pos(node, new Point2D(Math.random() * this.canvas.width, Math.random() * this.canvas.height));
                //				});
            });
            this.update();
            this.animate();
        }
        static initialize() {
            let divs = document.getElementsByClassName("graph");
            for (let i = 0; i < divs.length; i++) {
                let elem = divs[i];
                if (elem instanceof HTMLElement) {
                    new Graph(elem);
                }
            }
            //			document.body.appendChild(LOG.elem);
        }
        setPos(elem, pos) {
            let w = elem.offsetWidth;
            let h = elem.offsetHeight;
            elem.style.left = Math.max(Math.min(Math.round(pos.x - w / 2), Math.floor(this.canvas.width - w)), 0) + "px";
            elem.style.top = Math.max(Math.min(Math.round(pos.y - h / 2), Math.floor(this.canvas.height - h)), 0) + "px";
        }
        static ensureGetId(elem) {
            if (elem.id) {
                return elem.id;
            }
            else {
                while (true) {
                    let id = "TMP_ID" + Graph.tmpId;
                    if (!document.getElementById(id)) {
                        elem.id = id;
                        return id;
                    }
                    Graph.tmpId++;
                }
            }
        }
        update() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.lineWidth = 2;
            this.context.strokeStyle = "green";
            this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height);
            const weights = [];
            for (let srcId in this.links) {
                let links = this.links[srcId];
                for (let dstId in links) {
                    links[dstId].draw(this.context, weights);
                }
            }
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.fillStyle = "white";
            this.context.font = WEIGHT_SIZE + "px sans-serif";
            for (const weight of weights) {
                const [center, value] = weight;
                const textMetrix = this.context.measureText(value);
                this.context.beginPath();
                this.context.ellipse(center.x, center.y, textMetrix.width / 2.0 + WEIGHT_MARGIN, WEIGHT_SIZE / 2.0 + WEIGHT_MARGIN, 0, 0, 2 * Math.PI);
                this.context.fill();
            }
            this.context.fillStyle = "black";
            for (const weight of weights) {
                const [center, value] = weight;
                this.context.fillText(value, center.x, center.y);
            }
            /*
            this.nodes.forEach((id, node)=> {
                let nx = node.offsetLeft;
                let ny = node.offsetTop;
                let nw = node.offsetWidth;
                let nh = node.offsetHeight;
                
                this.draw_x(nx, ny);
                this.draw_x(nx + nw, ny);
                this.draw_x(nx, ny + nh);
                this.draw_x(nx + nw, ny + nh);
            });
            */
            //			let rect0 = get_rect(this.nodes.get(this.nodes.keys()[0]) as HTMLElement);
            //			let rect1 = get_rect(this.nodes.get(this.nodes.keys()[1]) as HTMLElement);
            //			LOG.setText(rect0.distance(rect1).toString());
        }
        findTarget(mousePos) {
            let elem = null;
            let d = 0;
            this.nodes.forEach((id, node) => {
                const rect = getRect(node);
                if (rect.includes(mousePos)) {
                    let nd = rect.center().sub(mousePos).length2();
                    if (elem === null || d >= nd) {
                        elem = node;
                        d = nd;
                    }
                }
            });
            return elem;
        }
        drawX(x, y) {
            this.context.strokeStyle = "red";
            this.context.lineWidth = 1;
            this.context.beginPath();
            this.context.moveTo(x - 10, y - 10);
            this.context.lineTo(x + 10, y + 10);
            this.context.stroke();
            this.context.beginPath();
            this.context.moveTo(x - 10, y + 10);
            this.context.lineTo(x + 10, y - 10);
            this.context.stroke();
        }
        unpoint() {
            if (this.pointed) {
                Dom.removeClass(this.pointed, "pointed");
                this.pointed = null;
            }
        }
        point(target) {
            if (target !== this.pointed) {
                this.unpoint();
                Dom.appendClass(target, "pointed");
                this.pointed = target;
            }
        }
        updateNodePositions() {
            // https://www.slideshare.net/mfumi/fruchterman-reingold
            let sumF = {};
            const k = Graph.C * Math.sqrt(this.canvas.width * this.canvas.height / this.nodes.count());
            this.nodes.forEach((srcId, src) => {
                if (!(this.dragTarget && this.dragTarget.elem == src)) {
                    let f = new Lib.Vector2D(0, 0);
                    this.nodes.forEach((dstId, dst) => {
                        if (srcId != dstId) {
                            const srcRect = getRect(src);
                            const dstRect = getRect(dst);
                            const srcPos = srcRect.center();
                            const dstPos = dstRect.center();
                            const v = dstPos.sub(srcPos);
                            const l = v.length();
                            if (l > 0) {
                                const u = v.div(l);
                                //								let d = dst_rect.distance(src_rect);
                                let d = l - Lib.hypot((srcRect.w + dstRect.w) / 2, (srcRect.h + dstRect.h) / 2);
                                if (d < 1.0) {
                                    d = 1.0;
                                }
                                else {
                                    d += 1.0;
                                }
                                if ((this.links[srcId] !== undefined && this.links[srcId][dstId]) || (this.links[dstId] !== undefined && this.links[dstId][srcId])) {
                                    f = f.add(u.mul(d * d / k).div(Graph.K));
                                }
                                f = f.add(u.mul(-k * k / d).div(Graph.K));
                            }
                            else {
                                f = f.add(Lib.Vector2D.random(Graph.T));
                            }
                        }
                    });
                    sumF[srcId] = f;
                }
            });
            this.nodes.forEach((id, node) => {
                if (!(this.dragTarget && this.dragTarget.elem == node)) {
                    let f = sumF[id];
                    let d = f.length();
                    if (d > Graph.T) {
                        f = f.mul(Graph.T / d);
                    }
                    this.setPos(node, getPos(node).add(f));
                }
            });
        }
        stop() {
            this.animated = false;
        }
    }
    /*
    private treeMode = true;
    public setTreeMode(mode: boolean){
        this.treeMode = true;
    }
    */
    Graph.tmpId = 0;
    Graph.C = 0.5;
    Graph.K = 100;
    Graph.T = 10;
    Lib.Graph = Graph;
    Lib.executeOnLoad(Graph.initialize);
})(Lib || (Lib = {}));
/// <reference path="../mylib/mylib.graph.ts"/>
var GraphViewer;
/// <reference path="../mylib/mylib.graph.ts"/>
(function (GraphViewer_1) {
    const DEFAULT = "5 6\n1 2\n2 3\n3 4\n4 5\n5 1\n3 1";
    const Dom = Lib.Dom;
    class CreateError extends Lib.BaseException {
    }
    class ParseError extends Lib.BaseException {
    }
    class Graph {
        constructor(directed, weighted, n, matrix) {
            this.directed = directed;
            this.weighted = weighted;
            this.n = n;
            this.matrix = matrix;
        }
        static matrix(n) {
            const matrix = [];
            for (let i = 0; i < n; i++) {
                const col = [];
                for (let j = 0; j < n; j++) {
                    col.push(0);
                }
                matrix.push(col);
            }
            return matrix;
        }
        static parseList(directed, weighted, text, showMessage) {
            const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
            const firstLine = lines[0];
            if (firstLine === undefined) {
                throw new ParseError("データがありません。");
            }
            let match = firstLine.match(/^(\d+)\s+(\d+)(.*)$/);
            if (match === null) {
                throw new ParseError("1行目: 「n m」(スペースで区切った整数2つ)が必要です: " + firstLine);
            }
            const n = parseInt(match[1]);
            const m = parseInt(match[2]);
            if (match[3].length > 0) {
                showMessage("1行目: 「" + n + " " + m + "」より後ろを読み飛ばします: " + match[3]);
            }
            if (lines.length - 1 < m) {
                throw new ParseError("データが足りません。m = " + m + "ですが、データが" + (lines.length - 1) + "行しかありません");
            }
            const matrix = Graph.matrix(n);
            for (let i = 1; i <= m; i++) {
                const line = lines[i];
                let match = line.match(/^(\d+)\s+(\d+)(.*)$/);
                if (match === null) {
                    throw new ParseError((i + 1) + "行目: 「a b」(スペースで区切った整数2つ)が必要です: " + line);
                }
                const a = parseInt(match[1]);
                const b = parseInt(match[2]);
                if (a > n) {
                    throw new ParseError((i + 1) + "行目: a = " + a + "が n = " + n + " を越えています: " + line);
                }
                if (b > n) {
                    throw new ParseError((i + 1) + "行目: b = " + b + "が n = " + n + " を越えています: " + line);
                }
                let weight;
                if (weighted) {
                    match = match[3].match(/^\s*(\d+)(.*)$/);
                    if (match) {
                        weight = parseInt(match[1]);
                        if (match[2].length > 0) {
                            showMessage((i + 1) + "行目: 「" + a + " " + b + " " + weight + "」より後ろを読み飛ばします: " + match[2]);
                        }
                    }
                    else {
                        showMessage((i + 1) + "行目: 重みがありません。1とします: " + line);
                        weight = 1;
                    }
                }
                else {
                    if (match[3].length > 0) {
                        showMessage((i + 1) + "行目: 「" + a + " " + b + "」より後ろを読み飛ばします: " + match[3]);
                    }
                    weight = 1;
                }
                matrix[a - 1][b - 1] = weight;
                if (!directed) {
                    matrix[b - 1][a - 1] = weight;
                }
            }
            for (let i = m + 1; i < lines.length; i++) {
                showMessage((i + 1) + "行目: データが多すぎるので飛ばしました: " + lines[i]);
            }
            return new Graph(directed, weighted, n, matrix);
        }
        static parseMatrix(directed, weighted, text, showMessage) {
            const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
            const firstLine = lines[0];
            if (firstLine === undefined) {
                throw new ParseError("データがありません。");
            }
            let match = firstLine.match(/^(\d+)(.*)$/);
            if (match === null) {
                throw new ParseError("1行目: 「n」(整数1つ)が必要です: " + firstLine);
            }
            const n = parseInt(match[1]);
            if (match[2].length > 0) {
                showMessage("1行目: 「" + n + "」より後ろを読み飛ばします: " + match[2]);
            }
            if (lines.length - 1 < n) {
                throw new ParseError("データが足りません。n = " + n + "ですが、データが" + (lines.length - 1) + "行しかありません");
            }
            const matrix = Graph.matrix(n);
            for (let a = 1; a <= n; a++) {
                let count = n;
                const values = lines[a].split(/\s+/);
                if (values.length < n) {
                    showMessage((a + 1) + "行目: データが足りません。n = " + n + "ですが、データが" + values.length + "個しかありません");
                    count = values.length;
                }
                const col = matrix[a - 1];
                for (let j = 0; j < count; j++) {
                    const value = values[j];
                    const b = value.match(/^\d+$/) ? parseInt(value) : null;
                    if (b !== null && b >= 0) {
                        if (b > 0) {
                            if (weighted) {
                                col[j] = b;
                            }
                            else {
                                if (b != 1) {
                                    showMessage((a + 1) + "行目" + (j + 1) + "列目: 不正な値です。1と見なしました: " + value);
                                }
                                col[j] = 1;
                            }
                        }
                    }
                    else {
                        showMessage((a + 1) + "行目" + (j + 1) + "列目: 不正な値です: " + value);
                    }
                }
            }
            if (!directed) {
                for (let a = 0; a < n; a++) {
                    for (let b = a + 1; b < n; b++) {
                        if (matrix[a][b] != matrix[b][a]) {
                            showMessage("接続行列の" + (a + 1) + "行" + (b + 1) + "列目と" + (a + 1) + "行" + (b + 1) + "列目が一致しません。");
                        }
                    }
                }
            }
            return new Graph(directed, weighted, n, matrix);
        }
        static fromEdges(directed, n, edges, maxWeight) {
            const matrix = Graph.matrix(n);
            const weighted = maxWeight !== undefined;
            const _maxWeight = maxWeight !== undefined ? maxWeight : 1;
            for (const edge of edges) {
                const a = edge[0] - 1;
                const b = edge[1] - 1;
                const w = Math.floor(Math.random() * _maxWeight) + 1;
                matrix[a][b] = w;
                if (!directed) {
                    matrix[b][a] = w;
                }
            }
            return new Graph(directed, weighted, n, matrix);
        }
        equals(g) {
            if (!(g instanceof Graph)) {
                return false;
            }
            if (this.directed != g.directed || this.weighted != g.weighted || this.n != g.n) {
                return false;
            }
            for (let i = 0; i < this.n; i++) {
                for (let j = 0; j < this.n; j++) {
                    if (this.matrix[i][j] != g.matrix[i][j]) {
                        return false;
                    }
                }
            }
            return true;
        }
        forEachEdge(func) {
            if (this.directed) {
                for (let i = 0; i < this.n; i++) {
                    const col = this.matrix[i];
                    for (let j = 0; j < this.n; j++) {
                        if (col[j] != 0) {
                            func(i + 1, j + 1, col[j]);
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < this.n; i++) {
                    const col = this.matrix[i];
                    for (let j = i + 1; j < this.n; j++) {
                        if (col[j] != 0) {
                            func(i + 1, j + 1, col[j]);
                        }
                    }
                }
            }
        }
        toListText() {
            let m = 0;
            let textList = [];
            this.forEachEdge((i, j, w) => {
                if (this.weighted) {
                    textList.push(i + " " + j + " " + w);
                }
                else {
                    textList.push(i + " " + j);
                }
                m += 1;
            });
            return this.n + " " + m + "\n" + textList.join("\n") + "\n";
        }
        toMatrixText() {
            let textMatrix = "" + this.n + "\n";
            for (let i = 0; i < this.n; i++) {
                textMatrix += this.matrix[i].join(" ") + "\n";
            }
            return textMatrix;
        }
    }
    class GraphViewer {
        constructor() {
            this.main = Dom.getElement("main");
            this.textListModified = true;
            this.textMatrixModified = false;
            this.textMode = "list";
            this.setTextMode = (mode) => {
                if (this.textMode !== mode) {
                    const graph = this.parseText();
                    if (graph) {
                        if (this.textMode === "list") {
                            if (this.textListModified) {
                                this.textMatrix.value = graph.toMatrixText();
                                this.textMatrixModified = false;
                            }
                        }
                        else {
                            if (this.textMatrixModified) {
                                this.textList.value = graph.toListText();
                                this.textListModified = false;
                            }
                        }
                    }
                    this.textMode = mode;
                }
                if (this.textMode === "list") {
                    this.textList.style.display = "";
                    this.textMatrix.style.display = "none";
                }
                else {
                    this.textList.style.display = "none";
                    this.textMatrix.style.display = "";
                }
            };
            this.graphMode = "graph";
            this.setGraphMode = (mode) => {
                this.graphMode = mode;
                this.setEdgeCountMode();
                this.setAcyclicMode();
            };
            this.setConnectedMode = () => {
                this.setEdgeCountMode();
            };
            this.setEdgeCountMode = () => {
                if (this.graphMode === "tree" && this.connected.checked) {
                    this.edgeCount.disabled = true;
                }
                else {
                    this.edgeCount.disabled = false;
                }
            };
            this.setAcyclicMode = () => {
                if (this.directed.checked && this.graphMode === "graph") {
                    this.acyclic.disabled = false;
                }
                else {
                    this.acyclic.disabled = true;
                }
            };
            this.animator = undefined;
            this.apply = () => {
                const graph = this.parseText();
                if (graph) {
                    this.applyToGraph(graph);
                }
            };
            this.minusOneChanged = () => {
                const offset = this.minusOne.checked ? -1 : 0;
                let i = 1;
                while (true) {
                    const node = Dom.findElement("node-" + i);
                    if (node === undefined) {
                        break;
                    }
                    Dom.setText(node, "" + (i + offset));
                    i += 1;
                }
            };
            this.create = () => {
                const n = parseInt(this.nodeCount.value);
                const m = (this.graphMode === "tree" && this.connected.checked) ? n - 1 : parseInt(this.edgeCount.value);
                const maxEdge = ((this.directed.checked && !this.acyclic.checked) ? n * (n - 1) : n * (n - 1) / 2);
                if (m > maxEdge) {
                    this.error("mが大きすぎます。n = " + n + "頂点の間には最大" + maxEdge + "本までしか辺を引けません");
                    return;
                }
                if (this.connected.checked === true && m < n - 1) {
                    this.error("mが小さすぎます。n = " + n + "頂点で連結グラフを作るにはm > n - 1 = " + (n - 1) + "である必要があります");
                    return;
                }
                if (this.graphMode === "tree" && m > n - 1) {
                    this.error("mが多きぎます。n = " + n + "頂点でツリーを作るにはm ≦ n - 1 = " + (n - 1) + "である必要があります");
                    return;
                }
                const allEdges = [];
                for (let i = 1; i <= n; i++) {
                    const list = [];
                    if (this.directed.checked && !this.acyclic.checked) {
                        for (let j = 1; j <= n; j++) {
                            if (i != j) {
                                allEdges.push([i, j]);
                            }
                        }
                    }
                    else {
                        for (let j = i + 1; j <= n; j++) {
                            allEdges.push([i, j]);
                        }
                    }
                }
                let weights = [];
                if (this.geometric.checked) {
                    const size = Math.ceil(Math.sqrt(n));
                    const posList = [];
                    for (let i = 0; i < size; i++) {
                        for (let j = 0; j < size; j++) {
                            posList.push(new Lib.Point2D(i, j));
                        }
                    }
                    const posTable = [];
                    posTable[1] = posList.shift();
                    posTable[n] = posList.pop();
                    for (let i = 2; i <= n - 1; i++) {
                        posTable[i] = Lib.randomPop(posList);
                    }
                    for (const edge of allEdges) {
                        let pos1 = posTable[edge[0]];
                        let pos2 = posTable[edge[1]];
                        if (pos1 && pos2) {
                            weights.push(1 / (pos2.sub(pos1).length2()));
                            //						weights.push(1);
                        }
                        else {
                            weights.push(1 / n); // never happen
                        }
                    }
                }
                else {
                    for (const edge of allEdges) {
                        weights.push(1);
                    }
                }
                let edges = [];
                for (let i = 0; i < m; i++) {
                    const edge = Lib.weightedRandomPop(allEdges, weights);
                    if (edge) {
                        edges.push(edge);
                    }
                }
                if (this.graphMode === "tree" || this.connected.checked === true) {
                    edges = this.tryModifyToConnectedGraph(n, edges);
                }
                if (this.directed.checked && this.acyclic.checked) {
                    const value = [];
                    for (let i = 0; i < n; i++) {
                        value.push(Math.random());
                    }
                    const new_edges = [];
                    for (const edge of edges) {
                        const a = edge[0];
                        const b = edge[1];
                        if (value[a - 1] > value[b - 1]) {
                            new_edges.push([b, a]);
                        }
                        else {
                            new_edges.push(edge);
                        }
                    }
                    edges = new_edges;
                }
                const graph = Graph.fromEdges(this.directed.checked, n, edges, this.weighted.checked ? n : undefined);
                this.textList.value = graph.toListText();
                this.textMatrix.value = graph.toMatrixText();
                this.applyToGraph(graph);
            };
            this.message = (message) => {
                Dom.append(this.messages, Dom.elem("li", message));
            };
            this.graph = Dom.elem("div", { id: "graph" }, Dom.elem("div", { className: "graph", style: { width: "640px", height: "480px" } }));
            this.textList = Dom.elem("textarea", { cols: 20, rows: 10, "onchange": () => this.textListModified = true }, DEFAULT);
            this.textMatrix = Dom.elem("textarea", { cols: 20, rows: 10, "onchange": () => this.textMatrixModified = true }, "");
            this.messages = Dom.elem("ul");
            this.directed = Dom.input("checkbox", { onchange: this.setAcyclicMode });
            this.weighted = Dom.input("checkbox");
            this.acyclic = Dom.input("checkbox", { disabled: true });
            this.nodeCount = Dom.input("text", { size: 3, value: "5" });
            this.edgeCount = Dom.input("text", { size: 3, value: "6" });
            this.connected = Dom.input("checkbox", { checked: true });
            this.geometric = Dom.input("checkbox", { checked: true });
            this.minusOne = Dom.input("checkbox", { onchange: this.minusOneChanged });
            const panel0 = Dom.elem("span", { className: "panel" }, this.group(Dom.elem("label", this.minusOne, "ノード番号を-1したものを表示")));
            const panel1 = Dom.elem("span", { className: "panel" }, this.group([Dom.radioSelecter("texttype", [["list", "辺のリスト"], ["matrix", "接続行列"]], "list", this.setTextMode)]), this.group(Dom.elem("label", this.directed, "有向")), this.group(Dom.elem("label", this.weighted, "重み付き")), Dom.input("button", { onclick: this.apply, value: "読み込み" }));
            const panel2 = Dom.elem("span", { className: "panel" }, this.group(Dom.radioSelecter("graphtype", [["graph", "グラフ"], ["tree", "木"]], "graph", this.setGraphMode)), this.group(["頂点の数: ", this.nodeCount]), this.group(["辺の数: ", this.edgeCount]), this.group(Dom.elem("label", { onchange: this.setConnectedMode }, this.connected, "連結")), this.group(Dom.elem("label", this.acyclic, "非巡回")), this.group(Dom.elem("label", this.geometric, "近いノード間に優先して辺を作成")), Dom.input("button", { onclick: this.create, value: "自動生成" }));
            this.control = Dom.elem("div", { id: "control" }, Dom.elem("p", panel0, panel1), Dom.elem("p", panel2), Dom.elem("div", { id: "text_message" }, Dom.elem("div", this.textList, this.textMatrix), this.messages));
            Dom.append(this.main, this.graph, this.control);
        }
        static initialize() {
            new GraphViewer();
        }
        group(content) {
            return Dom.elem("span", { className: "group" }, content);
        }
        parseText() {
            this.clearMessages();
            try {
                if (this.textMode === "list") {
                    return Graph.parseList(this.directed.checked, this.weighted.checked, this.textList.value, this.message);
                }
                else {
                    return Graph.parseMatrix(this.directed.checked, this.weighted.checked, this.textMatrix.value, this.message);
                }
            }
            catch (error) {
                if (error instanceof ParseError) {
                    this.error(error.message);
                    return null;
                }
                else {
                    throw error;
                }
            }
        }
        applyToGraph(g) {
            if (this.animator) {
                this.animator.stop();
            }
            Dom.clear(this.graph);
            const graph = Dom.elem("div", { className: "graph", style: { width: "640px", height: "480px" } });
            const edgeLists = [[]];
            for (let i = 1; i <= g.n; i++) {
                edgeLists.push([]);
            }
            g.forEachEdge((a, b, weight) => {
                edgeLists[a].push("node-" + (this.weighted.checked ? b + "(" + weight + ")" : "" + b));
            });
            const offset = this.minusOne.checked ? -1 : 0;
            for (let i = 1; i <= g.n; i++) {
                const edgesStr = edgeLists[i].join(" ");
                const node = Dom.elem("div", { id: "node-" + i, style: { left: "320px", top: "240px" } }, i + offset);
                if (this.directed.checked === true) {
                    node.dataset.linkTo = edgesStr;
                }
                else {
                    node.dataset.linkWith = edgesStr;
                }
                Dom.append(graph, node);
            }
            Dom.append(this.graph, graph);
            this.animator = new Lib.Graph(graph);
        }
        tryModifyToConnectedGraph(n, edges) {
            const graphs = [];
            for (let i = 1; i <= n; i++) {
                graphs[i] = [i];
            }
            const needed = [];
            const needless = [];
            for (const edge of edges) {
                let g0 = graphs[edge[0]];
                let g1 = graphs[edge[1]];
                if (g0[0] != g1[0]) {
                    needed.push(edge);
                    if (g0.length < g1.length) {
                        const tmp = g0;
                        g0 = g1;
                        g1 = tmp;
                    }
                    g0.push(...g1);
                    for (const i of g1) {
                        graphs[i] = g0;
                    }
                }
                else {
                    needless.push(edge);
                }
            }
            const groups = [];
            const added = [];
            for (let i = 1; i <= n; i++) {
                if (added[i] !== true) {
                    const g = graphs[i];
                    for (let j of g) {
                        added[j] = true;
                    }
                    groups.push(g);
                }
            }
            while (groups.length > 1) {
                const g1 = Lib.randomPop(groups);
                const g2 = Lib.randomPop(groups);
                if (g1 === undefined || g2 == undefined) { // impossible
                    break;
                }
                if (Lib.randomPop(needless) === undefined) {
                    break;
                }
                needed.push([Lib.randomPick(g1), Lib.randomPick(g2)]);
                groups.push(g1.concat(g2));
            }
            for (const edge of needless) {
                needed.push(edge);
            }
            return needed;
        }
        error(message) {
            Dom.append(this.messages, Dom.elem("li", { className: "error" }, "エラー: " + message));
        }
        clearMessages() {
            Dom.clear(this.messages);
        }
    }
    Lib.executeOnDomLoad(GraphViewer.initialize);
})(GraphViewer || (GraphViewer = {}));
