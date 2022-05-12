"use strict";
/// <reference path="./mylib.dom.ts"/>
var Lib;
/// <reference path="./mylib.dom.ts"/>
(function (Lib) {
    const Dom = Lib.Dom;
    Lib.isTouchDevice = false;
    function makeNotEmptyArray(first, ...rest) {
        return [first, ...rest];
    }
    Lib.makeNotEmptyArray = makeNotEmptyArray;
    //	const a: NotEmptyArrayOf<string> = ["a", "b"];
    //	a.push("c");
    //	a.pop();
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
            infoDiv = Dom.elem("div", { style: { position: "fixed", top: "10px", left: "10px", border: "solid 2px #faa", backgroundColor: "#fee" } });
            Dom.append(document.body, infoDiv);
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
        function radio(label, ...attributes) {
            let radio = input("radio");
            for (const attribute of attributes) {
                setAttributes(radio, attribute);
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
            const firstItem = items[0];
            const state = { labels: [], radios: [], value: typeof (firstItem) === "string" ? firstItem : firstItem.value };
            let checked = false;
            for (const item of items) {
                let value;
                let label;
                const attributeList = [];
                if (attributes) {
                    attributeList.push(attributes);
                }
                if (typeof (item) === "string") {
                    value = label = item;
                }
                else {
                    value = item.value;
                    if (item.label) {
                        label = item.label;
                    }
                    else {
                        label = value;
                    }
                    if (item.attributes) {
                        attributeList.push(item.attributes);
                    }
                }
                const { radio, label: radioLabel } = Dom.radio(label, ...attributeList, { name, value });
                if (radio.checked) {
                    if (checked == false) {
                        state.value = value;
                    }
                    checked = true;
                }
                addEventListener(radio, "click", () => { state.value = value; });
                state.radios.push(radio);
                state.labels.push(radioLabel);
            }
            if (!checked) {
                state.radios[0].checked = true;
            }
            return state;
        }
        Dom.radiosWithState = radiosWithState;
        function radioSelecter(name, items, checked, callback) {
            const labels = [];
            for (const item of items) {
                let value;
                let label;
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
                    addEventListener(labelElem, "click", () => callback(value));
                }
                labels.push(labelElem);
            }
            if (checked !== null && checked !== undefined && callback) {
                callback(checked);
            }
            return labels;
        }
        Dom.radioSelecter = radioSelecter;
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
            let v;
            for (v in equations[0]) {
                if (v !== "_") {
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
                return solution; // unsafe, but all the VARS must have been set by the last roop
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
/// <reference path="./mylib.ts"/>
/// <reference path="./mylib.dom.ts"/>
/// <reference path="./mylib.color.ts"/>
var Lib;
/// <reference path="./mylib.ts"/>
/// <reference path="./mylib.dom.ts"/>
/// <reference path="./mylib.color.ts"/>
(function (Lib) {
    let SVG;
    (function (SVG) {
        const Dom = Lib.Dom;
        function getSVG(id) {
            return Dom.get(SVGElement, id);
        }
        SVG.getSVG = getSVG;
        function getSVGs(...idList) {
            return Dom.collect(SVGElement, ...idList).table;
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
                for (const name in attributes) {
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
    for (const prio of Lib.range(maxPriority)) {
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
var Lib;
/// <reference path="./mylib.ts" />
/// <reference path="./mylib.dom.ts" />
/// <reference path="./mylib.ajax.ts" />
/// <reference path="./mylib.xml.ts" />
(function (Lib) {
    if (window["Promise"] === undefined) { // unsafe
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
                for (const [i, promise] of Lib.enumerate(promises)) {
                    promise.then(make_resolve(i), reject);
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
        return new Promise(async (resolve, reject) => {
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
                    const result = await (form.method === "post" ? waitForPost(form.action, postData) : waitForGet(form.action + "?" + postDataToString(postData)));
                    resolve({ result, postData });
                }
                finally {
                    Lib.Dom.enableForm(form);
                }
            }
            catch (e) {
                reject(e);
            }
        });
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
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>
var Tournament;
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.svg.ts"/>
/// <reference path="../mylib/mylib.promise.ts"/>
(function (Tournament) {
    const Dom = Lib.Dom;
    const SVG = Lib.SVG;
    const MARGIN = 20;
    const FONT_SIZE = 16;
    const INTERVAL = 33;
    const LINE_WIDTH = 3; // must be odd
    const PATH_WIDTH = 7; // must be odd
    class Tree {
        constructor(mode, values, dummy, type, speed, width, height, planes) {
            this.mode = mode;
            this.type = type;
            this.speed = speed;
            this.leaves = [];
            const count = values.length;
            const nums = [];
            const tree = [];
            for (let i = 0; i < count; i++) {
                nums.push(i);
                const leaf = new TreeLeaf(i, values[i], planes);
                tree.push(leaf);
                this.leaves.push(leaf);
            }
            for (let i = 0; i < count; i++) {
                const j = i + Math.floor((count - i) * Math.random());
                if (i != j) {
                    const tmp = nums[i];
                    nums[i] = nums[j];
                    nums[j] = tmp;
                }
            }
            this.competitionState = [];
            if (dummy) {
                const dummyValue = mode === "sum" ? 0 : (mode === "fact" ? 1 : -1);
                const dummyLeaf = new TreeLeaf(count, dummyValue, planes, true);
                const dummyNode = new TreeBranch(dummyLeaf, tree[0], planes);
                tree[0] = dummyNode;
                this.leaves.push(dummyLeaf);
            }
            let fair_width = count / 2;
            let j = -1;
            for (let i = 0; i < count - 1; i++) {
                if (this.type == "fair") {
                    j++;
                    if (j >= fair_width) {
                        j = 0;
                        fair_width /= 2;
                    }
                }
                else if (this.type == "unfair") {
                    j = 0;
                }
                else {
                    j = Math.floor((tree.length - 1) * Math.random());
                }
                const newNode = new TreeBranch(tree[j], tree[j + 1], planes);
                tree[j] = newNode;
                tree.splice(j + 1, 1);
            }
            for (let i = 0; i < this.leaves.length - 1; i++) {
                this.competitionState[i] = false;
            }
            this.root = tree[0];
            const treeInfo = this.root.calcPositions(mode, 0, 0, width, height, []);
            //			const c = Math.round(width / 2);
            Dom.append(planes.line, SVG.path("", "black", "none", { "stroke-width": LINE_WIDTH + "px", d: ["M", treeInfo.x, 0, "L", treeInfo.x, treeInfo.h].join(" ") }));
        }
        updatePath() {
            let completed = true;
            const competitions = [];
            for (let i = 0; i < this.leaves.length - 1; i++) {
                competitions[i] = [];
            }
            for (let i = 0; i < this.leaves.length; i++) {
                const leaf = this.leaves[i];
                const state = leaf.updatePath(this.speed / INTERVAL, competitions, this.competitionState);
                if (state === "moving") {
                    completed = false;
                }
                else if (state !== "completed") {
                    completed = false;
                }
            }
            for (let i = 0; i < competitions.length; i++) {
                const competition = competitions[i];
                if (competition.length == 2 && !this.competitionState[i]) {
                    this.competitionState[i] = true;
                    if (this.mode !== "tournament") {
                        const v0 = competition[0].getValue();
                        const v1 = competition[1].getValue();
                        const v = this.mode === "sum" ? v0 + v1 : v0 * v1;
                        competition[0].setValue(v);
                        competition[1].setValue(v);
                    }
                }
            }
            return completed;
        }
    }
    class TreeBranch {
        constructor(l, r, planes) {
            this.l = l;
            this.r = r;
            this.line = SVG.path("", "black", "none", { "stroke-width": LINE_WIDTH + "px" });
            this.back = SVG.elem("g", null, this.line);
            Dom.append(planes.line, this.back);
        }
        depth() {
            return Math.max(this.l.depth(), this.r.depth()) + 1;
        }
        count() {
            return this.l.count() + this.r.count();
        }
        max() {
            return Math.max(this.l.max(), this.r.max());
        }
        calcPositions(mode, l, t, w, h, competitions) {
            const cl = this.l.count();
            const cr = this.r.count();
            const d = this.depth();
            const ix = Math.floor(w / (cl + cr));
            const iy = Math.floor(h / d);
            const wl = ix * cl;
            const wr = ix * cr;
            const lTree = this.l.calcPositions(mode, l, t + iy, wl, h - iy, competitions);
            const rTree = this.r.calcPositions(mode, l + wl, t + iy, wr, h - iy, competitions);
            const x = Math.round((lTree.x + rTree.x) / 2);
            const b = t + iy;
            const competition = competitions.length;
            competitions.push(0);
            const newPoint0 = { x, y: b };
            const newPoint1 = { x, y: t };
            let winnerPath;
            if (mode === "tournament") {
                let loserPath;
                if (this.l.max() > this.r.max()) {
                    winnerPath = lTree.path;
                    loserPath = rTree.path;
                }
                else {
                    winnerPath = rTree.path;
                    loserPath = lTree.path;
                }
                winnerPath.push(competition);
                winnerPath.push(newPoint0);
                winnerPath.push(newPoint1);
                loserPath.push(competition);
            }
            else {
                winnerPath = lTree.path;
                winnerPath.push(newPoint0);
                winnerPath.push(competition);
                winnerPath.push(newPoint1);
                rTree.path.push(newPoint0);
                rTree.path.push(competition);
                const op = mode === "sum" ? "+" : "×";
                Dom.append(this.back, SVG.elem("text", { x: "" + x, y: "" + (b + FONT_SIZE), "text-anchor": "middle", "dominant-baseline": "hanging", "font-size": FONT_SIZE + "px" }, op));
            }
            const lxl = lTree.x;
            const lxr = rTree.x;
            const hy = t + iy;
            this.line.setAttribute("d", ["M", lxl, hy + lTree.h, "L", lxl, hy, "L", lxr, hy, "L", lxr, hy + rTree.h].join(" "));
            return { h: iy, x, path: winnerPath };
        }
    }
    class TreeLeaf {
        constructor(index, value, planes, isDummy = false) {
            this.index = index;
            this.value = value;
            this.pathData = [];
            this.length = 0;
            let cl1, cb1, cl2, cb2;
            cl1 = "#7aa";
            cb1 = "#aff";
            if (isDummy) {
                cl2 = "#b9b";
                cb2 = "#fdf";
            }
            else {
                cl2 = "#9bb";
                cb2 = "#dff";
            }
            this.path = SVG.path("", "red", "none", { "stroke-width": PATH_WIDTH + "px", "opacity": "0.5" });
            this.ellipse = SVG.ellipse(0, 0, FONT_SIZE, FONT_SIZE, cl1, cb1, { "stroke-width": "3px", "shape-rendering": "geometricPrecision" });
            this.text = SVG.elem("g", null, this.ellipse, SVG.elem("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": FONT_SIZE + "px" }, "" + this.value));
            this.backText = SVG.elem("g", null, SVG.ellipse(0, 0, FONT_SIZE, FONT_SIZE, cl2, cb2, { "stroke-width": "3px", "shape-rendering": "geometricPrecision" }), SVG.elem("text", { "text-anchor": "middle", "dominant-baseline": "central", "font-size": FONT_SIZE + "px" }, "" + this.value));
            Dom.append(planes.path, this.path);
            Dom.append(planes.text, this.backText, this.text);
        }
        getValue() {
            return this.value;
        }
        setValue(value) {
            this.value = value;
            const v = "" + value;
            Dom.setText(this.text, v);
            if (v.length > 2) {
                this.ellipse.setAttribute("rx", Math.round(FONT_SIZE * v.length / 2.5) + "px");
            }
        }
        depth() {
            return 1;
        }
        count() {
            return 1;
        }
        max() {
            return this.value;
        }
        calcPositions(mode, l, t, w, h, competitions) {
            const x = l + Math.round(w / 2);
            this.pathData = [
                { x, y: t + h },
                { x, y: t },
            ];
            this.backText.setAttribute("transform", "translate(" + x + "," + (t + h) + ")");
            return { h, x, path: this.pathData };
        }
        updatePath(dl, competitions, competitionState) {
            let state = "completed";
            let lengthDrawn = 0;
            let px = undefined;
            let py = undefined;
            let i = 0;
            for (; i < this.pathData.length; i++) {
                const p = this.pathData[i];
                if (typeof (p) !== "number") {
                    px = p.x;
                    py = p.y;
                    break;
                }
            }
            if (px === undefined || py === undefined) {
                return "completed";
            }
            let winnerPath = "M " + px + " " + py;
            for (; i < this.pathData.length; i++) {
                const p = this.pathData[i];
                if (typeof (p) === "number") {
                    if (competitionState[p] === false) {
                        competitions[p].push(this);
                        state = "waiting";
                        break;
                    }
                }
                else {
                    const dx = p.x - px;
                    const dy = p.y - py;
                    const l = Math.sqrt(dx * dx + dy * dy);
                    lengthDrawn += l;
                    if (l == 0 || lengthDrawn <= this.length) {
                        winnerPath += "L " + p.x + " " + p.y;
                    }
                    else {
                        const r = (lengthDrawn - this.length) / l;
                        px = p.x - dx * r;
                        py = p.y - dy * r;
                        winnerPath += "L " + px + " " + py;
                        state = "moving";
                        this.length += dl;
                        break;
                    }
                    px = p.x;
                    py = p.y;
                }
            }
            this.path.setAttribute("d", winnerPath);
            this.text.setAttribute("transform", "translate(" + px + "," + py + ")");
            return state;
        }
    }
    const N = 16;
    class Main {
        constructor() {
            this.svg = SVG.getSVG("svg");
            this.opts = Dom.collect(HTMLSelectElement, "speed", "type", "mode").collect(HTMLInputElement, "dummy", "random").table;
            this.animTask = null;
            this.terminating = false;
            this.planes = {
                line: SVG.elem("g"),
                path: SVG.elem("g"),
                text: SVG.elem("g"),
            };
            const top = SVG.elem("g", { "shape-rendering": "geometricPrecision", transform: "translate(" + MARGIN + "," + MARGIN + ")" });
            Dom.append(top, this.planes.line, this.planes.path, this.planes.text);
            Dom.append(this.svg, top);
            Dom.addEventListener(Dom.get(HTMLInputElement, "start"), "click", () => {
                this.start();
            });
            this.start();
        }
        static initialize() {
            new Main();
        }
        ;
        async start() {
            if (this.animTask) {
                this.terminating = true;
                await this.animTask;
                this.terminating = false;
            }
            this.animTask = this.startAnim();
        }
        async startAnim() {
            const root = this.makeTree();
            while (!this.terminating) {
                if (root.updatePath()) {
                    break;
                }
                await Lib.waitFor(INTERVAL);
            }
            return null;
        }
        makeTree() {
            Dom.clear(this.planes.line);
            Dom.clear(this.planes.path);
            Dom.clear(this.planes.text);
            const values = [];
            for (let i = 0; i < N; i++) {
                values.push(i + 1);
            }
            if (this.opts.random.checked) {
                for (let i = 0; i < N; i++) {
                    const j = i + Math.floor((N - i) * Math.random());
                    if (i != j) {
                        const tmp = values[i];
                        values[i] = values[j];
                        values[j] = tmp;
                    }
                }
            }
            const rect = this.svg.getBoundingClientRect();
            return new Tree(this.opts.mode.value == "sum" ? "sum" : (this.opts.mode.value === "fact" ? "fact" : "tournament"), values, this.opts.dummy.checked, this.opts.type.value, parseInt(this.opts.speed.value), rect.width - MARGIN * 2, rect.height - MARGIN * 2, this.planes);
        }
        terminate() {
            this.terminating = true;
        }
    }
    Lib.executeOnDomLoad(Main.initialize);
})(Tournament || (Tournament = {}));
