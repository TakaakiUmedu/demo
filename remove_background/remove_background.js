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
        function elem(name, attributes, ...args) {
            const element = document.createElement(name);
            setAttributes(element, attributes);
            append(element, args);
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
                                    throw "invalid event handler specified for \"" + aName + "\"";
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
        function input(type, attributes, ...args) {
            let element = elem("input", attributes, args);
            element.type = type;
            return element;
        }
        Dom.input = input;
        function checkbox(label, attributes) {
            let checkbox = input("checkbox", attributes);
            let element = elem("label", null, checkbox, label);
            return {
                checkbox: checkbox,
                label: element,
            };
        }
        Dom.checkbox = checkbox;
        function radio(label, attributes) {
            let radio = input("radio", attributes);
            let element = elem("label", null, radio, label);
            return {
                radio: radio,
                label: element,
            };
        }
        Dom.radio = radio;
        function em(...args) {
            return elem("em", null, ...args);
        }
        Dom.em = em;
        function span(...args) {
            return elem("span", null, ...args);
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
            return elem("td", null, ...args);
        }
        Dom.td = td;
        function q(...args) {
            return elem("q", null, ...args);
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
                const labelElem = elem("label", null, radio, label);
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
                throw "cannot find target with id \"" + id + "\"";
            }
        }
        Dom.getElement = getElement;
        function getFirstText(element) {
            let result = findFirstText(element);
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
        function insertBefore(newNode, existingNode) {
            const parent = existingNode.parentNode;
            if (parent === null) {
                throw "not in tree";
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
            throw "cannot get canvas context 2D";
        }
        function canvas2D(attributes) {
            const canvas = elem("canvas", attributes);
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
                return new ElementWithText(elem(tagName, attributes, textNode), textNode);
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
                    throw "element with id = " + id + " has invalid class";
                }
            }
            else {
                throw "cannot find target: " + id;
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
                throw "node is not in tree";
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
                throw "cannot find target: " + id;
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
/// <reference path="./mylib.dom.ts"/>
var Lib;
/// <reference path="./mylib.dom.ts"/>
(function (Lib) {
    function execute_handler(event, handler) {
        if (typeof (handler) == "string") {
            if (event.target instanceof HTMLElement) {
                event.target.className = handler;
            }
        }
        else if (typeof (handler) == "function") {
            handler(event);
        }
    }
    Lib.execute_handler = execute_handler;
    function dragover(event, over_handler) {
        execute_handler(event, over_handler);
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer !== null) {
            event.dataTransfer.dropEffect = "copy";
        }
    }
    Lib.dragover = dragover;
    function dragleave(event, leave_handler) {
        execute_handler(event, leave_handler);
        event.preventDefault();
        event.stopPropagation();
    }
    Lib.dragleave = dragleave;
    function image_drop(event, drop_handler, leave_handler, error_handler) {
        execute_handler(event, leave_handler);
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer !== null) {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                if (files[i].type.match(/^image\//)) {
                    const reader = new FileReader();
                    reader.addEventListener("load", () => {
                        if (typeof reader.result === "string") {
                            const image = Lib.Dom.elem("img", { src: reader.result });
                            image.addEventListener("load", (event) => {
                                drop_handler(event, image);
                            }, false);
                        }
                    }, false);
                    reader.readAsDataURL(files[i]);
                    return;
                }
            }
            const types = event.dataTransfer.types;
            for (var i = 0; i < types.length; i++) {
                if (types[i].match(/^text$/i)) {
                    const data = event.dataTransfer.getData(types[i]);
                    if (data != null) {
                        if (data.match(/^I_/)) {
                            const image = Lib.Dom.findElement(data);
                            if (image instanceof HTMLImageElement) {
                                drop_handler(event, image);
                                return;
                            }
                        }
                        else if (data.match(/^data:/i)) {
                            const image = Lib.Dom.elem("img", { src: data });
                            image.addEventListener("load", (event) => {
                                drop_handler(event, image);
                            }, false);
                            return;
                        }
                    }
                }
            }
        }
        if (error_handler) {
            error_handler(event);
        }
    }
    Lib.image_drop = image_drop;
    function set_image_drop(element, drop_handler, over_handler, leave_handler, error_handler) {
        element.addEventListener("dragover", (event) => {
            dragover(event, over_handler);
        }, false);
        element.addEventListener("dragleave", (event) => {
            dragleave(event, leave_handler);
        }, false);
        element.addEventListener("drop", (event) => {
            image_drop(event, drop_handler, leave_handler, error_handler);
        }, false);
    }
    Lib.set_image_drop = set_image_drop;
    Lib.set_image_drop = set_image_drop;
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
/// <reference path="./mylib.ts" />
var Lib;
/// <reference path="./mylib.ts" />
(function (Lib) {
    class AsynchronousTask {
        constructor(func, nextItem, complete = Lib.doNothing, parallelCount = 1, sequentialCount = 1, wait = 0) {
            this.func = func;
            this.nextItem = nextItem;
            this.complete = complete;
            this.parallelCount = parallelCount;
            this.sequentialCount = sequentialCount;
            this.wait = wait;
            this.numProcess = 0;
            this.proc = () => {
                this.numProcess--;
                for (let i = 0; this.sequentialCount == 0 || i < this.sequentialCount; i++) {
                    const item = this.nextItem();
                    if (item === "complete") {
                        if (this.numProcess == 0) {
                            this.complete();
                        }
                        return;
                    }
                    else if (item === "suspend") {
                        return;
                    }
                    else {
                        if (this.func(item) === "break") {
                            if (this.numProcess == 0) {
                                this.complete();
                            }
                            return;
                        }
                    }
                }
                this.startProcess(this.wait);
            };
        }
        startProcess(wait = 0) {
            this.numProcess++;
            setTimeout(this.proc, wait);
        }
        wake() {
            while (this.numProcess < this.parallelCount) {
                this.startProcess();
            }
        }
    }
    Lib.AsynchronousTask = AsynchronousTask;
    class AsynchronousProcessQueue {
        constructor(func, complete, parallelCount, sequentialCount, wait) {
            this.queue = [];
            this.available = true;
            this.executing = true;
            this.nextItem = () => {
                if (this.executing) {
                    const item = this.queue.shift();
                    if (item) {
                        if (item === "complete") {
                            this.executing = false;
                        }
                        return item;
                    }
                    else {
                        return "suspend";
                    }
                }
                else {
                    return "complete";
                }
            };
            this.queue = [];
            this.task = new AsynchronousTask(func, this.nextItem, complete, parallelCount, sequentialCount, wait);
        }
        checkAvailable() {
            if (!this.available) {
                throw "queue already completed";
            }
        }
        push(item) {
            this.checkAvailable();
            this.queue.push(item);
            this.task.wake();
        }
        complete() {
            this.checkAvailable();
            this.queue.push("complete");
            this.available = false;
        }
    }
    Lib.AsynchronousProcessQueue = AsynchronousProcessQueue;
    class Iterator {
        constructor(count) {
            this.count = count;
            this.index = 0;
            this.nextItem = () => {
                if (this.index < this.count) {
                    return this.index++;
                }
                else {
                    return "complete";
                }
            };
        }
    }
    class ArrayIterator {
        constructor(items) {
            this.items = items;
            this.index = 0;
            this.nextItem = () => {
                if (this.index < this.items.length) {
                    return this.items[this.index++];
                }
                else {
                    return "complete";
                }
            };
        }
    }
    function asynchronousIterateNumber(target, func, complete, parallelCount = 1, sequentialCount = 1, wait = 0) {
        let nextItemFunc;
        if (typeof target === "string") {
            nextItemFunc = new Iterator(parseInt(target)).nextItem;
        }
        else {
            nextItemFunc = new Iterator(target).nextItem;
        }
        let task = new AsynchronousTask(func, nextItemFunc, complete, parallelCount, sequentialCount, wait);
        task.wake();
    }
    Lib.asynchronousIterateNumber = asynchronousIterateNumber;
    function asynchronousIterate(target, func, complete, parallelCount = 1, sequentialCount = 1, wait = 0) {
        let nextItemFunc;
        if (typeof target === "function") {
            nextItemFunc = target;
        }
        else {
            nextItemFunc = new ArrayIterator(target).nextItem;
        }
        let task = new AsynchronousTask(func, nextItemFunc, complete || undefined, parallelCount, sequentialCount, wait);
        task.wake();
    }
    Lib.asynchronousIterate = asynchronousIterate;
    class IntervalTaskBase {
        constructor() {
            this.canceled = false;
            this.exec = () => {
                if (this.canceled) {
                    return;
                }
                const curTime = new Date().getTime();
                let nextInterval = this.tick(curTime - this.prevTick);
                if (nextInterval === null) {
                    this.cancel();
                    return;
                }
                if (this.canceled) {
                    return;
                }
                if (nextInterval < 1) {
                    nextInterval = 1;
                }
                this.prevTick = curTime;
                setTimeout(this.exec, nextInterval);
            };
            this.prevTick = new Date().getTime();
        }
        cancel() {
            this.canceled = true;
        }
        start() {
            this.exec();
        }
    }
    Lib.IntervalTaskBase = IntervalTaskBase;
    class VariableIntervalTask extends IntervalTaskBase {
        constructor(tick) {
            super();
            this.tick = tick;
        }
        static start(tick) {
            const task = new VariableIntervalTask(tick);
            task.start();
            return task;
        }
    }
    Lib.VariableIntervalTask = VariableIntervalTask;
    class FixedIntervalTaskBase extends IntervalTaskBase {
        constructor(interval) {
            super();
            this.interval = interval;
            this.tick = (interval) => {
                this.fixedTick(interval);
                //			return this.interval * 2 - interval;
                return this.interval;
            };
            if (this.interval <= 0) {
                throw "interval (=" + interval + ") must be positive";
            }
        }
    }
    Lib.FixedIntervalTaskBase = FixedIntervalTaskBase;
    class FixedIntervalTask extends FixedIntervalTaskBase {
        constructor(fixedTick, interval) {
            super(interval);
            this.fixedTick = fixedTick;
            this.interval = interval;
        }
        static start(tick, interval) {
            const task = new FixedIntervalTask(tick, interval);
            task.start();
            return task;
        }
    }
    Lib.FixedIntervalTask = FixedIntervalTask;
    class UniqueVariableIntervalTask extends IntervalTaskBase {
        constructor(manager, target, uniqueTick) {
            super();
            this.manager = manager;
            this.target = target;
            this.uniqueTick = uniqueTick;
            this.tick = (interval) => {
                return this.uniqueTick(this.target, interval);
            };
        }
        cancel() {
            super.cancel();
            this.manager.canceled(this);
        }
    }
    class UniqueIntervalTaskBase extends FixedIntervalTaskBase {
        constructor(manager, target, interval) {
            super(interval);
            this.manager = manager;
            this.target = target;
            this.fixedTick = (interval) => {
                this.uniqueTick(this.target, interval);
            };
        }
        cancel() {
            super.cancel();
            this.manager.canceled(this);
        }
    }
    class UniqueIntervalTask extends UniqueIntervalTaskBase {
        constructor(manager, target, uniqueTick, interval) {
            super(manager, target, interval);
            this.manager = manager;
            this.target = target;
            this.uniqueTick = uniqueTick;
        }
    }
    class UniqueTaskManager {
        constructor() {
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
            public forEachTask(func: (task: IntervalTaskBase)=> undefined | "complete"){
                for(let i = 0; i < this.tasks.length; i ++){
                    if(func(this.tasks[i]) === "complete"){
                        return true;
                    }
                }
                return false;
            }
            */
        }
        constuctor() {
        }
        canceled(task) {
            this.removeTask(task.target);
        }
        startTask(task) {
            this.removeTask(task.target);
            this.tasks.push(task);
            task.start();
        }
        removeTask(target) {
            for (let i = 0; i < this.tasks.length; i++) {
                const task = this.tasks[i];
                if (task.target === target) {
                    this.tasks.splice(i, 1);
                    task.cancel();
                    return;
                }
            }
        }
        startVariable(target, tick) {
            this.startTask(new UniqueVariableIntervalTask(this, target, tick));
        }
        startFixed(target, tick, interval) {
            this.startTask(new UniqueIntervalTask(this, target, tick, interval));
        }
        forEachTask(func) {
            for (let i = 0; i < this.tasks.length; i++) {
                if (func(this.tasks[i]) === "complete") {
                    return true;
                }
            }
            return false;
        }
        cancelAll() {
            for (let i = 0; i < this.tasks.length; i++) {
                this.tasks[i].cancel();
            }
        }
    }
    Lib.UniqueTaskManager = UniqueTaskManager;
    class FaderTask extends UniqueIntervalTaskBase {
        constructor(manager, target, interval, time, fade, initialAlpha, complete) {
            super(manager, target, interval);
            this.uniqueTick = (target, interval) => {
                let alpha = this.alpha + interval * this.speed;
                if (alpha >= 1.0) {
                    alpha = 1;
                }
                else if (alpha <= 0.0) {
                    alpha = 0;
                }
                this.alpha = alpha;
                this.fade(target, this.alpha);
                if (this.speed > 0 && alpha == 1 || this.speed < 0 && alpha == 0) {
                    if (this.complete) {
                        this.complete(this.target);
                    }
                    this.cancel();
                }
            };
            this.alpha = initialAlpha;
            this.setParams(time, fade, complete);
        }
        setParams(time, fade, complete) {
            this.speed = 1.0 / time;
            this.fade = fade;
            this.complete = complete;
        }
    }
    class Fader {
        constructor(interval, manager) {
            this.interval = interval;
            if (manager) {
                this.manager = manager;
            }
            else {
                this.manager = new UniqueTaskManager();
            }
        }
        start(target, time, fade, initialAlpha, complete) {
            const task = new FaderTask(this.manager, target, this.interval, time, fade, initialAlpha, complete);
            this.manager.startTask(task);
            return task;
        }
        fadeIn(target, time, fade, initialAlpha = 0, complete) {
            return this.start(target, time, fade, initialAlpha, complete);
        }
        fadeOut(target, time, fade, initialAlpha = 1, complete) {
            return this.start(target, -time, fade, initialAlpha, complete);
        }
        stop(target) {
            this.manager.forEachTask((t) => {
                if (t instanceof FaderTask) {
                    if (t.target === target) {
                        t.cancel();
                        return "complete";
                    }
                }
                return undefined;
            });
        }
        cancelAll() {
            this.manager.cancelAll();
        }
    }
    Lib.Fader = Fader;
    class ComposedCallback {
        constructor(callback1, callback2) {
            this.callback1 = callback1;
            this.callback2 = callback2;
            this.callback = (target) => {
                this.callback1(target);
                this.callback2(target);
            };
        }
    }
    /*
    class ElementFaderTask{
        public constructor(private readonly complete1: FadeComplete<T>, private readonly complete2: FadeComplete<T>){
        }
        public complete: FadeComplete<T> = (element: HTMLElement) => {
            this.complete1(element);
            this.complete2(element);
        }
    }*/
    class ElementFader {
        constructor(interval, manager) {
            this.fadeAfterLoad = (target, time, onloadCallback, fadeInCallback) => {
                Lib.executeOnLoad((target) => {
                    onloadCallback(target);
                    this.fadeIn(target, time, fadeInCallback);
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
        static fade(target, alpha) {
            target.style.opacity = "" + alpha;
        }
        static fadeInComplete(target) {
            target.style.opacity = "";
        }
        static fadeOutComplete(target) {
            target.style.display = "none";
            target.style.opacity = "";
        }
        fadeIn(target, time, complete) {
            let initialAlpha;
            if (target.style.display == "none" || target.style.visibility == "hidden") {
                initialAlpha = 0;
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
                initialAlpha = parseFloat(target.style.opacity);
            }
            if (complete) {
                complete = new ComposedCallback(ElementFader.fadeInComplete, complete).callback;
            }
            else {
                complete = ElementFader.fadeInComplete;
            }
            return this.fader.fadeIn(target, time, ElementFader.fade, initialAlpha, complete);
        }
        fadeOut(target, time, complete) {
            if (target.style.display == "none" || target.style.visibility == "hidden") {
                target.style.display = "none";
                if (complete) {
                    complete(target);
                }
                return;
            }
            let initialAlpha;
            if (target.style.opacity === null || target.style.opacity == "") {
                initialAlpha = 1;
            }
            else {
                initialAlpha = parseFloat(target.style.opacity);
            }
            if (complete) {
                complete = new ComposedCallback(ElementFader.fadeOutComplete, complete).callback;
            }
            else {
                complete = ElementFader.fadeOutComplete;
            }
            return this.fader.fadeOut(target, time, ElementFader.fade, initialAlpha, complete);
        }
        stop(target) {
            this.fader.stop(target);
        }
        cancelAll() {
            this.fader.cancelAll();
        }
    }
    Lib.ElementFader = ElementFader;
})(Lib || (Lib = {}));
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.dragdrop.ts"/>
/// <reference path="../mylib/mylib.color.ts"/>
/// <reference path="../mylib/mylib.task.ts"/>
{
    const Dom = Lib.Dom;
    const FontSize = 24;
    const execute_button = null;
    const image_area = null;
    const Colors = ["r", "g", "b"];
    class RemoveBackground {
        constructor() {
            this.imagedata = null;
            this.elems = Dom.combineTables(Dom.getImages("result_image"), Dom.getElements("image_area", "picked_color"), Dom.getAnchors("download"), Dom.getInputs("execute_button", "r", "g", "b"), Dom.getSelects("background_mode"));
            this.original_image = null;
            this.drag_drop = (event, image) => {
                this.elems.result_image.src = image.src;
                this.elems.result_image.style.width = image.naturalWidth + "px";
                this.elems.result_image.style.height = image.naturalHeight + "px";
                this.original_image = image;
                this.elems.execute_button.disabled = false;
                this.canvas.width = this.original_image.naturalWidth;
                this.canvas.height = this.original_image.naturalHeight;
                this.canvas.style.width = this.canvas.width + "px";
                this.canvas.style.height = this.canvas.height + "px";
                this.context.drawImage(this.original_image, 0, 0);
                this.imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            };
            this.process_image = () => {
                if (this.imagedata === null || this.original_image === null) {
                    return;
                }
                const col = this.get_rgb();
                const r0 = col.r;
                const g0 = col.g;
                const b0 = col.b;
                Dom.clear(this.elems.image_area);
                this.elems.image_area.appendChild(this.canvas);
                this.elems.execute_button.disabled = true;
                this.elems.download.style.visibility = "hidden";
                let i = 0;
                const imagedata = this.imagedata;
                const origina_image = this.original_image;
                Lib.asynchronousIterateNumber(imagedata.height, (y) => {
                    for (let x = 0; x < imagedata.width; x++) {
                        const r1 = imagedata.data[i];
                        const g1 = imagedata.data[i + 1];
                        const b1 = imagedata.data[i + 2];
                        const a1 = imagedata.data[i + 3];
                        if (a1 == 255) {
                            // r1 = r0 * (1 - a2) + r2 * a2
                            // g1 = g0 * (1 - a2) + g2 * a2
                            // b1 = b0 * (1 - a2) + b2 * a2
                            // a2 = (r1 - r0) / (r2 - r0)
                            // a2 = (g1 - g0) / (g2 - g0)
                            // a2 = (b1 - b0) / (b2 - b0)
                            const a2_1 = this.calc_min_a(r0, r1);
                            const a2_2 = this.calc_min_a(g0, g1);
                            const a2_3 = this.calc_min_a(b0, b1);
                            const a2 = Math.max(a2_1, a2_2, a2_3);
                            const r2 = (r1 - r0 * (1 - a2)) / a2;
                            const g2 = (g1 - g0 * (1 - a2)) / a2;
                            const b2 = (b1 - b0 * (1 - a2)) / a2;
                            imagedata.data[i] = this.to8bits(r2);
                            imagedata.data[i + 1] = this.to8bits(g2);
                            imagedata.data[i + 2] = this.to8bits(b2);
                            imagedata.data[i + 3] = this.to8bits(255 * a2);
                        }
                        i += 4;
                    }
                    this.context.putImageData(imagedata, 0, 0, 0, y, imagedata.width, 1);
                }, () => {
                    this.elems.execute_button.disabled = false;
                    const url = this.canvas.toDataURL();
                    this.elems.result_image.src = url;
                    this.elems.download.href = this.canvas.toDataURL();
                    this.elems.download.style.visibility = "visible";
                    Dom.clear(this.elems.image_area);
                    this.elems.image_area.appendChild(this.elems.result_image);
                    this.context.drawImage(origina_image, 0, 0);
                    this.imagedata = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                }, 1, 1, 0);
            };
            this.color_change = () => {
                if (this.elems.background_mode.value == "specified") {
                    this.set_background_color(this.get_rgb().toString());
                }
            };
            this.get_color = (event) => {
                if (this.imagedata != null) {
                    const x = Math.round(event.offsetX), y = Math.round(event.offsetY);
                    if (x >= 0 && x < this.imagedata.width && y >= 0 && y < this.imagedata.height) {
                        const index = (this.imagedata.width * y + x) * 4;
                        return {
                            r: this.imagedata.data[index],
                            g: this.imagedata.data[index + 1],
                            b: this.imagedata.data[index + 2]
                        };
                    }
                }
                return null;
            };
            this.pick_color = (event) => {
                const color = this.get_color(event);
                if (color != null) {
                    for (const c of Colors) {
                        this.elems[c].value = "" + color[c];
                    }
                }
            };
            this.view_color = (event) => {
                let value;
                const color = this.get_color(event);
                if (color != null) {
                    value = "(" + color.r + "," + color.g + "," + color.b + ")";
                }
                else {
                    value = "(0,0,0)";
                }
                Dom.setText(this.elems.picked_color, value);
            };
            this.change_background = () => {
                if (this.elems.background_mode.value == "specified") {
                    this.set_background_color(this.get_rgb().toString());
                }
                else if (this.elems.background_mode.value == "transparent") {
                    this.set_background_color("url('transparent.png')");
                }
                else {
                    this.set_background_color(this.elems.background_mode.value);
                }
            };
            const canvas = Dom.canvas2D();
            this.canvas = canvas.canvas;
            this.context = canvas.context;
            this.canvas.width = this.elems.result_image.offsetWidth;
            this.canvas.height = this.elems.result_image.offsetHeight;
            this.context.font = FontSize + "px 'sans serif'";
            this.context.textAlign = "center";
            this.context.fillStyle = "black";
            this.context.fillText("ここに画像をドラッグ&ドロップ", this.canvas.width / 2, this.canvas.height / 2);
            this.context.fillText("Drag & drop an image here", this.canvas.width / 2, this.canvas.height / 2 + FontSize);
            this.elems.result_image.src = this.canvas.toDataURL();
            this.elems.execute_button.addEventListener("click", this.process_image, false);
            Lib.set_image_drop(this.elems.result_image, this.drag_drop);
            this.elems.result_image.addEventListener("mousemove", this.view_color, false);
            this.elems.result_image.addEventListener("click", this.pick_color, false);
            this.elems.background_mode.addEventListener("change", this.change_background, false);
            for (const color of Colors) {
                this.elems[color].addEventListener("keyup", this.color_change, false);
            }
            this.color_change();
        }
        to8bits(value) {
            value = Math.round(value);
            if (value < 0) {
                return 0;
            }
            else if (value > 255) {
                return 255;
            }
            else {
                return value;
            }
        }
        calc_min_a(c0, c1) {
            // a2 = (c1 - c0) / (c2 - c0)
            if (c0 == c1) {
                return 0;
            }
            else if (c1 > c0) {
                return (c1 - c0) / (255 - c0);
            }
            else {
                return (c1 - c0) / (0 - c0);
            }
        }
        get_color_value(name) {
            const col = Math.round(parseInt(this.elems[name].value));
            if (col < 0) {
                return 0;
            }
            else if (col > 255) {
                return 255;
            }
            else {
                return col;
            }
        }
        get_rgb() {
            return new Lib.Color(this.get_color_value("r"), this.get_color_value("g"), this.get_color_value("b"));
        }
        set_background_color(col) {
            this.elems.result_image.style.background = col;
            this.canvas.style.background = col;
        }
    }
    Lib.executeOnLoad(() => {
        new RemoveBackground();
    });
}
