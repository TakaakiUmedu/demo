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
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ts"/>
var HexSlide;
/// <reference path="../mylib/mylib.ts"/>
/// <reference path="../mylib/mylib.dom.ts"/>
/// <reference path="../mylib/mylib.ts"/>
(function (HexSlide) {
    const Dom = Lib.Dom;
    const posX = 100;
    const posY = 100;
    const count = 3;
    const size = 30;
    const margin = 2;
    const speed = 1;
    class Main {
        constructor() {
            this.canvas = Dom.getCanvas("canvas");
            this.context = this.canvas.context;
            this.data = [];
            this.lines = [];
            this.cursor = null;
            this.moving = false;
            this.draw = () => {
                if (this.moving) {
                    let moving = false;
                    for (let i = 0; i < this.data.length; i++) {
                        const d = this.data[i];
                        if (d.dx !== 0 || d.dy !== 0) {
                            const v = Math.sqrt(d.dx * d.dx + d.dy * d.dy);
                            if (v > speed) {
                                d.dx *= (v - speed) / v;
                                d.dy *= (v - speed) / v;
                                moving = true;
                            }
                            else {
                                d.dx = 0;
                                d.dy = 0;
                            }
                        }
                    }
                    this.moving = moving;
                }
                this.context.clearRect(0, 0, this.canvas.canvas.width, this.canvas.canvas.height);
                for (let i = 0; i < this.data.length; i++) {
                    const d = this.data[i];
                    if (this.vacant === i) {
                        this.context.fillStyle = "transparent";
                        this.context.strokeStyle = "#bfffff";
                        this.drawHex(d.x, d.y, "");
                    }
                    else {
                        if (this.cursor === i) {
                            this.context.fillStyle = "#ffbfff";
                            this.context.strokeStyle = "#ff80ff";
                        }
                        else if (d.n === d.a) {
                            this.context.fillStyle = "#cfffcf";
                            this.context.strokeStyle = "#9fff9f";
                        }
                        else {
                            this.context.fillStyle = "#bfffff";
                            this.context.strokeStyle = "#80ffff";
                        }
                        this.drawHex(d.x + d.dx, d.y + d.dy, d.n);
                    }
                }
                setTimeout(this.draw, 33);
            };
            this.context.lineWidth = 2;
            this.context.fillStyle = "#bfffff";
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.context.font = "bold 24px serif";
            {
                const grid = [];
                const h = count * 2 - 1;
                let i = 1;
                for (let y = 0; y < h; y++) {
                    const l = [];
                    const c = Math.abs((y - count + 1));
                    for (let x = 0; x < c / 2; x++) {
                        l.push(undefined);
                    }
                    const line = [];
                    const w = h - c;
                    for (let x = 0; x < w; x++) {
                        const d = {
                            x: posX + (x + (h - w) / 2) * (margin * 2 + size * 2 * Math.sin(Math.PI / 3)),
                            y: posY + y * (margin / Math.sin(Math.PI / 6) + size * 1.5),
                            n: i.toString(),
                            a: i.toString(),
                            dx: 0,
                            dy: 0,
                        };
                        line.push(this.data.length);
                        l.push(this.data.length);
                        this.data.push(d);
                        i++;
                    }
                    grid.push(l);
                    this.lines.push(line);
                }
                {
                    let x = 0;
                    let found = false;
                    while (true) {
                        const line = [];
                        let dx = 0;
                        for (const l of grid) {
                            const cx = x - Math.floor(dx / 2);
                            if (cx >= 0 && cx < l.length) {
                                const v = l[cx];
                                if (v !== undefined) {
                                    line.push(v);
                                }
                            }
                            dx++;
                        }
                        if (found && line.length == 0) {
                            break;
                        }
                        if (line.length > 0) {
                            this.lines.push(line);
                            found = true;
                        }
                        x++;
                    }
                }
                {
                    let x = -count;
                    let found = false;
                    while (true) {
                        const line = [];
                        let dx = 1;
                        for (const l of grid) {
                            const cx = x + Math.floor(dx / 2);
                            if (cx >= 0 && cx < l.length) {
                                const v = l[cx];
                                if (v !== undefined) {
                                    line.push(v);
                                }
                            }
                            dx++;
                        }
                        if (found && line.length == 0) {
                            break;
                        }
                        if (line.length > 0) {
                            this.lines.push(line);
                            found = true;
                        }
                        x++;
                    }
                }
            }
            this.vacant = this.data.length - 1;
            for (let i = 0; i < this.data.length - 1; i++) {
                const j = Math.floor(Math.random() * i);
                const d0 = this.data[i];
                const d1 = this.data[j];
                const t = d0.n;
                d0.n = d1.n;
                d1.n = t;
            }
            Dom.addEventListener(this.canvas.canvas, "mousemove", (event) => {
                if (this.moving) {
                    return;
                }
                let m = null;
                this.cursor = null;
                for (let i = 0; i < this.data.length; i++) {
                    const d = this.data[i];
                    const dx = d.x - event.offsetX;
                    const dy = d.y - event.offsetY;
                    const v = Math.sqrt(dx * dx + dy * dy);
                    if (v < size * 1.5 && (m === null || m > v)) {
                        m = v;
                        this.cursor = i;
                    }
                }
                //				console.log(m);
            });
            Dom.addEventListener(this.canvas.canvas, "mouseout", (event) => {
                this.cursor = null;
            });
            Dom.addEventListener(this.canvas.canvas, "click", (event) => {
                if (this.cursor === null || this.moving) {
                    return;
                }
                for (const line of this.lines) {
                    const indexV = line.indexOf(this.vacant);
                    if (indexV === -1) {
                        continue;
                    }
                    const indexC = line.indexOf(this.cursor);
                    if (indexC === -1) {
                        continue;
                    }
                    if (indexV > indexC) {
                        for (let i = indexV; i > indexC; i--) {
                            const d0 = this.data[line[i]];
                            const d1 = this.data[line[i - 1]];
                            d0.n = d1.n;
                            d0.dx = d1.x - d0.x;
                            d0.dy = d1.y - d0.y;
                        }
                    }
                    else {
                        for (let i = indexV; i < indexC; i++) {
                            const d0 = this.data[line[i]];
                            const d1 = this.data[line[i + 1]];
                            d0.n = d1.n;
                            d0.dx = d1.x - d0.x;
                            d0.dy = d1.y - d0.y;
                        }
                    }
                    this.vacant = this.cursor;
                    this.moving = true;
                }
            });
            setInterval(this.draw, 33);
        }
        drawHex(x, y, s) {
            this.context.beginPath();
            this.context.moveTo(x, y - size);
            for (let i = 1; i < 6; i++) {
                this.context.lineTo(x + size * Math.sin(Math.PI * i / 3), y - size * Math.cos(Math.PI * i / 3));
            }
            this.context.closePath();
            this.context.fill();
            this.context.stroke();
            this.context.fillStyle = "#000000";
            this.context.fillText(s, x, y);
        }
        static initialize() {
            new Main();
        }
    }
    Lib.executeOnDomLoad(Main.initialize);
})(HexSlide || (HexSlide = {}));
