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
            for (const arg of iterate(args, 1, args.length)) {
                message += "," + arg.toString();
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
            for (const child of item) {
                forEachRecursive(child, callback);
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
            for (const [i, key] of enumerate(list)) {
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
        for (const [i, weight] of enumerateGen(iterate(weights, weights.length - 1))) {
            value -= weight;
            if (value < 0) {
                return i;
            }
        }
        return weights.length - 1;
    }
    function weightedItemChoice(items, getWeightFunc) {
        const sum = items.reduce((a, c) => a + getWeightFunc(c), 0);
        let value = Math.random() * sum;
        for (const [i, item] of enumerateGen(iterate(items, items.length - 1))) {
            value -= getWeightFunc(item);
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
        for (const [i, tmp] of enumerate(array)) {
            const j = Math.floor(Math.random() * (i + 1));
            array[i] = array[j];
            array[j] = tmp;
        }
    }
    Lib.shuffle = shuffle;
    function* range(s, e, step) {
        if (e === undefined) {
            e = s;
            s = 0;
        }
        if (step === undefined) {
            step = 1;
        }
        for (let i = s; i != e; i += step) {
            yield i;
        }
    }
    Lib.range = range;
    function* iterate(items, s, e, step) {
        const r = (s === undefined ? range(items.length) : range(s, e, step));
        for (const i of r) {
            yield (items[i]);
        }
    }
    Lib.iterate = iterate;
    function* iterateRev(items) {
        yield* iterate(items, items.length - 1, -1, -1);
    }
    Lib.iterateRev = iterateRev;
    function* enumerate(items) {
        for (const i of range(items.length)) {
            yield ([i, items[i]]);
        }
    }
    Lib.enumerate = enumerate;
    function* enumerateGen(items) {
        let i = 0;
        for (const item of items) {
            yield ([i, item]);
            i++;
        }
    }
    Lib.enumerateGen = enumerateGen;
    function checkAndGetOption(item) {
        return (item !== null && item !== undefined) ? item : null;
    }
    Lib.checkAndGetOption = checkAndGetOption;
    function checkAndMapOption(item, map) {
        return (item !== null && item !== undefined) ? map(item) : null;
    }
    Lib.checkAndMapOption = checkAndMapOption;
    class KeyError extends Error {
        constructor(message) {
            super(message);
            this.name = new.target.name;
            Object.setPrototypeOf(this, new.target.prototype);
        }
    }
    Lib.KeyError = KeyError;
    // unsafe function
    function constructTable(ids, get) {
        const table = {};
        for (const id of ids) {
            table[id] = get(id);
        }
        return table; // unsafe, but must be filled in the previous loop
    }
    Lib.constructTable = constructTable;
    // unsafe function
    // if C1 and C2 has same keys, return type will be never
    function combineTables(table1, table2) {
        const table = {};
        for (const id in table1) {
            if (table2.hasOwnProperty(id)) {
                throw new KeyError("id \"" + id + "\" is confricted in combining tables"); // C1 and C2 has a same key
            }
            table[id] = table1[id];
        }
        for (const id in table2) {
            table[id] = table2[id];
        }
        return table; // unsafe, but have be filled in the previous loop
    }
    Lib.combineTables = combineTables;
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
                                    element.addEventListener(event, aValue); // unsafe any = EventListener guarded by Attributes<N>["on*"]
                                }
                                else if (aValue instanceof Object && aValue.hasOwnProperty("handleEvent")) {
                                    element.addEventListener(event, aValue); // unsafe any = EventListenerObject guarded by Attributes<N>["on*"]
                                }
                                else {
                                    throw new NodeNotFound("invalid event handler specified for \"" + aNameStr + "\"");
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
                addEventListener(radio, "click", () => { state.value = radio.value; });
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
            for (const item of items) {
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
        function setRadioChangeListener(name, listener, form) {
            let formElem;
            if (form === null || form == undefined) {
                formElem = null;
            }
            else {
                formElem = prepareTarget(form);
            }
            for (const input of Lib.iterate(document.getElementsByName(name))) {
                if (input instanceof HTMLInputElement && input.type === "radio" && (formElem === null || input.form == formElem)) {
                    addEventListener(input, "change", (event) => {
                        if (input.checked) {
                            listener(input.value);
                        }
                    });
                    if (input.checked) {
                        listener(input.value);
                    }
                }
            }
        }
        Dom.setRadioChangeListener = setRadioChangeListener;
        function text(str) {
            return document.createTextNode(str.toString());
        }
        Dom.text = text;
        function find(type, id) {
            const element = document.getElementById(id);
            if (element instanceof type) {
                return element;
            }
            else {
                return null;
            }
        }
        Dom.find = find;
        function get(type, id) {
            const element = find(type, id);
            if (element !== null) {
                return element;
            }
            throw new NodeNotFound("cannot find " + type + " type target with id \"" + id + "\"");
        }
        Dom.get = get;
        function findElement(id) {
            return find(HTMLElement, id);
        }
        Dom.findElement = findElement;
        function getElement(id) {
            return get(HTMLElement, id);
        }
        Dom.getElement = getElement;
        function getFirstText(element) {
            let result = findFirstText(element);
            if (result) {
                return result;
            }
            else {
                const textNode = text("");
                append(element, textNode);
                return textNode;
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
            for (const item of Lib.iterateRev(list)) {
                element.insertBefore(toElement(item), element.firstChild);
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
                for (const name of classNames) {
                    if (name.length > 0 && name != value) {
                        newClassNames.push(name);
                    }
                }
                return element.className = newClassNames.join(" ");
            }
        }
        Dom.removeClass = removeClass;
        function* iterateChildNodes(node) {
            for (let child = node.firstChild; child !== null; child = child.nextSibling) {
                yield child;
            }
        }
        Dom.iterateChildNodes = iterateChildNodes;
        function* iterateChildren(node, type) {
            for (const child of iterateChildNodes(node)) {
                if (child instanceof type) {
                    yield child;
                }
            }
        }
        Dom.iterateChildren = iterateChildren;
        function* iterateChildElements(node) {
            yield* iterateChildren(node, HTMLElement);
        }
        Dom.iterateChildElements = iterateChildElements;
        function* iterateChildTags(node, tagName) {
            for (const child of iterateChildNodes(node)) {
                const elem = asSpecificElementType(child, tagName);
                if (elem !== null) {
                    yield elem;
                }
            }
        }
        Dom.iterateChildTags = iterateChildTags;
        function* iterateDescendantNodes(node) {
            yield node;
            for (const child of iterateChildNodes(node)) {
                yield* iterateDescendantNodes(child);
            }
        }
        Dom.iterateDescendantNodes = iterateDescendantNodes;
        function* iterateDescendants(type, node) {
            for (const descendant of iterateDescendantNodes(node)) {
                if (descendant instanceof type) {
                    yield descendant;
                }
            }
        }
        Dom.iterateDescendants = iterateDescendants;
        function* iterateDescendantElements(node) {
            yield* iterateDescendants(HTMLElement, node);
        }
        Dom.iterateDescendantElements = iterateDescendantElements;
        function* iterateDescendantTags(node, tagName) {
            for (const descendant of iterateDescendantNodes(node)) {
                const elem = asSpecificElementType(descendant, tagName);
                if (elem !== null) {
                    yield elem;
                }
            }
        }
        Dom.iterateDescendantTags = iterateDescendantTags;
        function cloneText(text) {
            return document.createTextNode(text.nodeValue || "");
        }
        Dom.cloneText = cloneText;
        function cloneShallow(element) {
            const newElement = cloneElement(element);
            for (const attribute of Lib.iterate(element.attributes)) {
                if (attribute.name == "style") {
                    let subTable = element.style;
                    for (const sName in subTable) {
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
            for (const name in element.dataset) {
                newElement.dataset[name] = element.dataset[name];
            }
            return newElement;
        }
        Dom.cloneShallow = cloneShallow;
        function clone(element) {
            const newElement = cloneShallow(element);
            for (const child of iterateChildNodes(element)) {
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
            const canvas = get(HTMLCanvasElement, id);
            return { canvas, context: getCanvasContext2D(canvas) };
        }
        Dom.getCanvas = getCanvas;
        function innerText(target) {
            if (target instanceof Text) {
                return target.nodeValue || "";
            }
            else {
                const elem = prepareTarget(target);
                let text = "";
                for (const node of iterateDescendantNodes(elem)) {
                    if (node instanceof Text) {
                        text += node.nodeValue;
                    }
                }
                return text;
            }
        }
        Dom.innerText = innerText;
        function findFirstText(elem) {
            for (const node of iterateDescendantNodes(elem)) {
                if (node instanceof Text) {
                    return node;
                }
            }
            return null;
        }
        Dom.findFirstText = findFirstText;
        function setText(elem, value) {
            const str = value.toString();
            for (const node of iterateDescendantNodes(elem)) {
                if (node instanceof Text) {
                    node.nodeValue = str;
                    return;
                }
            }
            append(elem, str);
        }
        Dom.setText = setText;
        function findFirstTag(node, tagName) {
            for (const elem of iterateDescendantTags(node, tagName)) {
                return elem;
            }
            return null;
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
                get(type, id).addEventListener(event_name, table[id], useCapture);
            }
        }
        Dom.setEventListeners = setEventListeners;
        function getTypedElement(id, type) {
            const element = document.getElementById(id);
            if (element) {
                if (element instanceof type) {
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
        const DisableableElements = [
            HTMLTextAreaElement,
            HTMLSelectElement,
            HTMLOptionElement,
            HTMLOptGroupElement,
            HTMLLinkElement,
            HTMLInputElement,
            HTMLFieldSetElement,
            HTMLButtonElement,
        ];
        function isDisableable(elem) {
            for (const type of DisableableElements) {
                if (elem instanceof type) {
                    return true;
                }
            }
            return false;
        }
        Dom.isDisableable = isDisableable;
        function getDisableableElement(id) {
            const elem = asDisableable(getElement(id));
            if (elem) {
                return elem;
            }
            else {
                throw new NodeNotFound("cannot find disableabletarget: " + id);
                ;
            }
        }
        Dom.getDisableableElement = getDisableableElement;
        let dummyIdNumber = 0;
        function ensureId(elem) {
            if (elem.id === null) {
                while (true) {
                    const dummyId = "tmp-" + dummyIdNumber;
                    if (document.getElementById(dummyId) === null) {
                        elem.id = dummyId;
                        break;
                    }
                    dummyIdNumber++;
                }
            }
            return elem.id;
        }
        Dom.ensureId = ensureId;
        class Collector {
            constructor(table) {
                this.table = table;
            }
            collect(type, ...ids) {
                return new Collector(Lib.combineTables(this.table, Lib.constructTable(ids, (id) => get(type, id))));
            }
            static construct() {
                return new Collector({});
            }
        }
        ;
        function collect(type, ...ids) {
            return Collector.construct().collect(type, ...ids);
        }
        Dom.collect = collect;
        function setFormDisabled(form, disabled) {
            for (const element of Lib.iterate(form.elements)) {
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
                try {
                    const f = () => { };
                    const options = Object.defineProperty({}, "passive", {
                        get: function () {
                            passiveSupported = true;
                        }
                    });
                    window.addEventListener("test", options, options);
                    window.removeEventListener("test", options, options);
                }
                catch (e) {
                    passiveSupported = false;
                }
            }
            return passiveSupported;
        }
        Dom.isPassiveSupported = isPassiveSupported;
        // unsafe function
        function asSpecificElementType(node, tagName) {
            if (node instanceof HTMLElement && node.tagName.toLowerCase() === tagName) {
                return node; // unsafe but type guarded by tagName
            }
            else {
                return null;
            }
        }
        Dom.asSpecificElementType = asSpecificElementType;
        // unsafe function
        function cloneElement(elem) {
            return document.createElement(elem.tagName.toLowerCase()); // cast guarded by tagName;
        }
        // unsafe function
        function asDisableable(elem) {
            if (isDisableable(elem)) {
                return elem;
            }
            else {
                return null;
            }
        }
        Dom.asDisableable = asDisableable;
        /*
                // obsoluting
                export class ElementWithText<T extends HTMLElement = HTMLElement>{
                    public readonly style: CSSStyleDeclaration;
                    public static create<N extends TagName>(tagName: N, text: string, attributes?: Attributes<N> | null | undefined){
                        const textNode = Dom.text(text);
                        const element = elem(tagName, textNode);
                        if(attributes){
                            setAttributes(element, attributes);
                        }
                        return new ElementWithText(element, textNode);
                    }
                    
                    public constructor(public readonly element: T, public readonly text: Text){
                        this.style = this.element.style;
                    }
                    public set(text: DomItem){
                        this.text.nodeValue = text.toString();
                    }
                    public get(): string{
                        return this.text.nodeValue || "";
                    }
                }
        
        //		export function getElementsWithText<IDs extends string>(...ids: IDs[]): ItemTable<ElementWithText<HTMLElement>, IDs>{
        //			return getSpecifiedItems<IDs, ElementWithText<HTMLElement>>((id)=> getElementWithText(id), ids);
        //		}
                
        
        */
    })(Dom = Lib.Dom || (Lib.Dom = {}));
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
        for (const item of filedata) {
            ret += item.text + joinIncludingFiles(includingData, item.filename);
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
        for (const name of ATTRIBUTES_TO_COPY) {
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
/*
namespace Lib{
    if((window as any)["Promise"] === undefined){
        
        type Callback<T, R> = (result: T)=> R;
        
        class ResultHolder<T>{
            public constructor(public readonly value: T){
            }
        }
        
        class MyPromise<T>{
            readonly [Symbol.toStringTag]: "Promise";
            
            private result: ResultHolder<T> | undefined = undefined;
            private reason: any | undefined = undefined;
            private callbacks: [Callback<T, void>, Callback<any, void>][] | null = [];
            
            private static apply_then<T>(value: T | Promise<T>, resolve: Callback<T, void>, reject: Callback<any, void>): void{
                if(value instanceof Promise){
                    value.then(resolve, reject);
                }else{
                    resolve(value);
                }
            }
            
            public constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void){
                const setResolveValue = (value: T)=> {
                    if(this.callbacks){
                        this.result = new ResultHolder(value);
                        for(const callback of this.callbacks){
                            callback[0](value);
                        }
                        this.callbacks = null;
                    }
                };
                const setRejectValue = (value: any)=> {
                    if(this.callbacks){
                        this.reason = value;
                        for(const callback of this.callbacks){
                            callback[1](value);
                        }
                        this.callbacks = null;
                    }
                };
                try{
                    executor((value)=> MyPromise.apply_then(value as any, setResolveValue, setRejectValue), setRejectValue); // value could be undefined
                }catch(error){
                    setRejectValue(error);
                }
            
            }
            private add_callbacks(resolve: Callback<T, void>, reject: Callback<any, void>){
                if(this.callbacks){
                    this.callbacks.push([resolve, reject]);
                }else{
                    if(this.result){
                        resolve(this.result.value);
                    }else{
                        reject(this.reason);
                    }
                }
            }
            
            public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>{
                if(this.callbacks){
                    const _onfulfilled = onfulfilled || ((value)=> value as any);   // T == TResult1
                    const _onrejected = onrejected || ((value)=> value);
                    const prev = this;
                    return new MyPromise((resolve: (value?: TResult1 | PromiseLike<TResult1>)=> void, reject: (value?: any)=> void)=> {
                        prev.add_callbacks(
                            value=> {
                                try{
                                    MyPromise.apply_then(_onfulfilled(value), resolve, reject);
                                }catch(error){
                                    reject(error);
                                }
                            },
                            value=> {
                                try{
                                    MyPromise.apply_then(_onrejected(value), resolve, reject)
                                }catch(error){
                                    reject(error);
                                }
                            }
                        );
                    });
                }else{
                    try{
                        if(this.result){
                            if(onfulfilled){
                                const result = onfulfilled(this.result.value);
                                if(result instanceof Promise){
                                    return result;
                                }else{
                                    return Promise.resolve(result);
                                }
                            }else{
                                return Promise.resolve(this.result.value as any); // T == TResult1
                            }
                        }else{
                            if(onrejected){
                                const result = onrejected(this.reason);
                                if(result instanceof Promise){
                                    return result;
                                }else{
                                    return Promise.reject(result);
                                }
                            }else{
                                return Promise.reject(this.reason);
                            }
                        }
                    }catch(error){
                        return Promise.reject(error);
                    }
                }
            }
            
            public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>{
                return this.then(undefined, onrejected);
            }
            
            public static all<T = any>(promises: Promise<T>[]): Promise<T[]>{
                let pending = true;
                let count = promises.length;
                let next_resolve: ((results: T[])=> void) | undefined = undefined;
                let next_reject: Callback<any, void> | undefined = undefined;
                let rejected = false;
                let results: T[] = [];
                let reason: any = undefined;
                function make_resolve(index: number){
                    return (value: T)=> {
                        if(pending){
                            results[index] = value;
                            count --;
                            if(count == 0){
                                if(next_resolve){
                                    next_resolve(results);
                                }
                                pending = false;
                            }
                        }
                    };
                }
                const reject = (value: any)=> {
                    if(pending){
                        if(next_reject){
                            next_reject(value);
                        }else{
                            rejected = true;
                            reason = value;
                        }
                        pending = false;
                    }
                };
                for(const [i, promise] of enumerate(promises)){
                    promise.then(make_resolve(i), reject);
                }
                return new Promise((resolve, reject)=> {
                    if(pending){
                        next_resolve = resolve;
                        next_reject = reject;
                    }else{
                        if(rejected){
                            reject(reason);
                        }else{
                            resolve(results);
                        }
                    }
                });
            }
            public static resolve<T>(value : T): Promise<T>{
                return new Promise((resolve, _)=> {
                    resolve(value);
                });
            }
            public static reject<T>(value : T): Promise<T>{
                return new Promise((_, reject)=> {
                    reject(value);
                });
            }
        }
        (window as any)["Promise"] = MyPromise;
    }
}
*/
var Lib;
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.ajax.ts" />
/// <reference path="./mylib.xml.ts" />
/*
namespace Lib{
    if((window as any)["Promise"] === undefined){
        
        type Callback<T, R> = (result: T)=> R;
        
        class ResultHolder<T>{
            public constructor(public readonly value: T){
            }
        }
        
        class MyPromise<T>{
            readonly [Symbol.toStringTag]: "Promise";
            
            private result: ResultHolder<T> | undefined = undefined;
            private reason: any | undefined = undefined;
            private callbacks: [Callback<T, void>, Callback<any, void>][] | null = [];
            
            private static apply_then<T>(value: T | Promise<T>, resolve: Callback<T, void>, reject: Callback<any, void>): void{
                if(value instanceof Promise){
                    value.then(resolve, reject);
                }else{
                    resolve(value);
                }
            }
            
            public constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void){
                const setResolveValue = (value: T)=> {
                    if(this.callbacks){
                        this.result = new ResultHolder(value);
                        for(const callback of this.callbacks){
                            callback[0](value);
                        }
                        this.callbacks = null;
                    }
                };
                const setRejectValue = (value: any)=> {
                    if(this.callbacks){
                        this.reason = value;
                        for(const callback of this.callbacks){
                            callback[1](value);
                        }
                        this.callbacks = null;
                    }
                };
                try{
                    executor((value)=> MyPromise.apply_then(value as any, setResolveValue, setRejectValue), setRejectValue); // value could be undefined
                }catch(error){
                    setRejectValue(error);
                }
            
            }
            private add_callbacks(resolve: Callback<T, void>, reject: Callback<any, void>){
                if(this.callbacks){
                    this.callbacks.push([resolve, reject]);
                }else{
                    if(this.result){
                        resolve(this.result.value);
                    }else{
                        reject(this.reason);
                    }
                }
            }
            
            public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>{
                if(this.callbacks){
                    const _onfulfilled = onfulfilled || ((value)=> value as any);   // T == TResult1
                    const _onrejected = onrejected || ((value)=> value);
                    const prev = this;
                    return new MyPromise((resolve: (value?: TResult1 | PromiseLike<TResult1>)=> void, reject: (value?: any)=> void)=> {
                        prev.add_callbacks(
                            value=> {
                                try{
                                    MyPromise.apply_then(_onfulfilled(value), resolve, reject);
                                }catch(error){
                                    reject(error);
                                }
                            },
                            value=> {
                                try{
                                    MyPromise.apply_then(_onrejected(value), resolve, reject)
                                }catch(error){
                                    reject(error);
                                }
                            }
                        );
                    });
                }else{
                    try{
                        if(this.result){
                            if(onfulfilled){
                                const result = onfulfilled(this.result.value);
                                if(result instanceof Promise){
                                    return result;
                                }else{
                                    return Promise.resolve(result);
                                }
                            }else{
                                return Promise.resolve(this.result.value as any); // T == TResult1
                            }
                        }else{
                            if(onrejected){
                                const result = onrejected(this.reason);
                                if(result instanceof Promise){
                                    return result;
                                }else{
                                    return Promise.reject(result);
                                }
                            }else{
                                return Promise.reject(this.reason);
                            }
                        }
                    }catch(error){
                        return Promise.reject(error);
                    }
                }
            }
            
            public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>{
                return this.then(undefined, onrejected);
            }
            
            public static all<T = any>(promises: Promise<T>[]): Promise<T[]>{
                let pending = true;
                let count = promises.length;
                let next_resolve: ((results: T[])=> void) | undefined = undefined;
                let next_reject: Callback<any, void> | undefined = undefined;
                let rejected = false;
                let results: T[] = [];
                let reason: any = undefined;
                function make_resolve(index: number){
                    return (value: T)=> {
                        if(pending){
                            results[index] = value;
                            count --;
                            if(count == 0){
                                if(next_resolve){
                                    next_resolve(results);
                                }
                                pending = false;
                            }
                        }
                    };
                }
                const reject = (value: any)=> {
                    if(pending){
                        if(next_reject){
                            next_reject(value);
                        }else{
                            rejected = true;
                            reason = value;
                        }
                        pending = false;
                    }
                };
                for(const [i, promise] of enumerate(promises)){
                    promise.then(make_resolve(i), reject);
                }
                return new Promise((resolve, reject)=> {
                    if(pending){
                        next_resolve = resolve;
                        next_reject = reject;
                    }else{
                        if(rejected){
                            reject(reason);
                        }else{
                            resolve(results);
                        }
                    }
                });
            }
            public static resolve<T>(value : T): Promise<T>{
                return new Promise((resolve, _)=> {
                    resolve(value);
                });
            }
            public static reject<T>(value : T): Promise<T>{
                return new Promise((_, reject)=> {
                    reject(value);
                });
            }
        }
        (window as any)["Promise"] = MyPromise;
    }
}
*/
(function (Lib) {
    function waitForOneByOne(promises, resolve, reject) {
        function call_then(prev, next) {
            const execute = () => next.then(resolve, reject);
            return prev.then(execute, execute);
        }
        let prev = promises[0].then(resolve, reject);
        const next_promises = [prev];
        for (const promise of Lib.iterate(promises, 1, promises.length)) {
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
                const form = typeof (target) === "string" ? Lib.Dom.get(HTMLFormElement, target) : target;
                const postData = {};
                const formID = form.id;
                for (const input of Lib.iterate(form.elements)) {
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
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ajax.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>
var Sort;
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ajax.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>
(function (Sort) {
    const Dom = Lib.Dom;
    function loadCSV(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = yield Lib.waitForGet(url);
            const data = [];
            for (const line of source.trim().split("\n")) {
                const values = [];
                for (const value of line.trim().split(",")) {
                    values.push(value);
                }
                data.push(values);
            }
            return data;
        });
    }
    const filenames = ["prices.csv", "scores.csv"];
    class Main {
        constructor() {
            this.elems = Dom.collect(HTMLElement, "menu", "tables").collect(HTMLInputElement, "stable").table;
            this.tables = [];
            this.init();
        }
        sort(tableData, index) {
            Dom.clear(tableData.tbody);
            if (this.elems.stable.checked) {
                for (let i = 0; i < tableData.rows.length; i++) {
                    tableData.rows[i].values[0] = i;
                }
            }
            else {
                for (const row of tableData.rows) {
                    row.values[0] = Math.random();
                }
            }
            tableData.rows.sort((r0, r1) => {
                const v0 = r0.values[index];
                const v1 = r1.values[index];
                const n0 = typeof (v0) === "number";
                const n1 = typeof (v1) === "number";
                if (n0 && !n1) {
                    return -1;
                }
                else if (n1 && !n0) {
                    return 1;
                }
                if (v0 < v1) {
                    return -1;
                }
                else if (v0 > v1) {
                    return 1;
                }
                else {
                    const s0 = r0.values[0];
                    const s1 = r1.values[0];
                    if (s0 < s1) {
                        return -1;
                    }
                    else if (s0 > s1) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                }
            });
            for (const row of tableData.rows) {
                Dom.append(tableData.tbody, row.tr);
            }
        }
        init() {
            return __awaiter(this, void 0, void 0, function* () {
                for (const filename of filenames) {
                    const data = yield loadCSV(filename);
                    const titleLine = data.shift();
                    if (titleLine === undefined) {
                        return;
                    }
                    const title = titleLine[0];
                    const li = Dom.elem("li", title);
                    const table = Dom.elem("table");
                    const tbody = Dom.elem("tbody");
                    const index = this.tables.length;
                    const rows = [];
                    const tableData = { table, tbody, rows };
                    this.tables.push(tableData);
                    {
                        const tr = Dom.elem("tr");
                        const line = data[0];
                        for (let i = 0; i < line.length; i++) {
                            const th = Dom.elem("th", line[i]);
                            const index = i + 1;
                            Dom.addEventListener(th, "click", () => {
                                this.sort(tableData, index);
                            });
                            Dom.append(tr, th);
                        }
                        Dom.append(table, tr);
                    }
                    for (let i = 1; i < data.length; i++) {
                        const line = data[i];
                        const tr = Dom.elem("tr");
                        const values = [i - 1];
                        for (const value of line) {
                            Dom.append(tr, Dom.elem("td", value));
                            if (value.match(/^\d+$/)) {
                                values.push(parseInt(value));
                            }
                            else {
                                values.push(value);
                            }
                        }
                        rows.push({ values, tr });
                        Dom.append(tbody, tr);
                    }
                    Dom.append(table, tbody);
                    Dom.addEventListener(li, "click", () => {
                        for (let i = 0; i < this.tables.length; i++) {
                            if (i == index) {
                                this.tables[i].table.style.display = "";
                            }
                            else {
                                this.tables[i].table.style.display = "none";
                            }
                        }
                    });
                    if (index > 0) {
                        table.style.display = "none";
                    }
                    Dom.append(this.elems.menu, li);
                    Dom.append(this.elems.tables, table);
                }
            });
        }
        static initialize() {
            new Main();
        }
    }
    Lib.executeOnDomLoad(Main.initialize);
})(Sort || (Sort = {}));
