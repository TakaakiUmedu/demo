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
                            element.setAttribute("class", aValue.toString());
                        }
                        else {
                            const aNameStr = aName.toString();
                            if ((match = aNameStr.match(/^on(.*)/))) {
                                let event = match[1];
                                if (aValue instanceof Function) {
                                    element.addEventListener(event, aValue); // any: EventListener
                                }
                                else if (typeof (aValue) === "object" && aValue.hasOwnProperty("handleEvent")) {
                                    element.addEventListener(event, aValue); // any: EventListenerObject
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
                return null;
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
        function eachChild(element, func) {
            for (let node = element.firstChild; node; node = node.nextSibling) {
                if (func(node) === "break") {
                    return false;
                }
            }
            return true;
        }
        Dom.eachChild = eachChild;
        function eachChildElement(element, func) {
            return eachChild(element, (child) => {
                if (child instanceof HTMLElement) {
                    return func(child);
                }
            });
        }
        Dom.eachChildElement = eachChildElement;
        function eachChildTag(element, name, func) {
            name = name.toLowerCase();
            return eachChildElement(element, (child) => {
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
            return eachChild(element, (child) => {
                if (!eachDescendant(child, func)) {
                    return "break";
                }
                return;
            });
        }
        Dom.eachDescendant = eachDescendant;
        function eachDescendantElement(element, func) {
            return eachDescendant(element, (child) => {
                if (child instanceof HTMLElement) {
                    return func(child);
                }
            });
        }
        Dom.eachDescendantElement = eachDescendantElement;
        function eachDescendantTag(element, name, func) {
            name = name.toLowerCase();
            return eachDescendantElement(element, (child) => {
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
            let children = element.getElementsByTagName(name);
            for (let i = 0; i < children.length; i++) {
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
            let newElement = elem(element.nodeName.toLowerCase());
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
        function getSelect(...idList) {
            return getTypedElements(idList, HTMLSelectElement);
        }
        Dom.getSelect = getSelect;
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
                        table[name] = t[name];
                    }
                }
            }
            return table;
        }
        Dom.combineTables = combineTables;
        function getForm(id) {
            return getElementWithType(HTMLFormElement, id);
        }
        Dom.getForm = getForm;
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
///<reference path="mylib/mylib.dom.ts"/>
///<reference path="mylib/mylib.geometry.ts"/>
///<reference path="mylib/mylib.linear_algebra.ts"/>
var Shooting;
///<reference path="mylib/mylib.dom.ts"/>
///<reference path="mylib/mylib.geometry.ts"/>
///<reference path="mylib/mylib.linear_algebra.ts"/>
(function (Shooting) {
    const DIV_NAME = "SHOOTING";
    const W = 480;
    const H = 480;
    const Dom = Lib.Dom;
    //	const SLIT = 50;
    const LABEL_H = 20;
    const MARGIN_L = LABEL_H * 2;
    const MARGIN_R = LABEL_H * 2;
    const MARGIN_T = 0;
    const MARGIN_B = LABEL_H * 3;
    const INTERVAL = 33;
    const g = 9.8;
    class Animator {
        constructor(interval = 33) {
            this.interval = interval;
            this.registered = false;
            this.task = null;
            this.animate = () => {
                const now = Date.now();
                if (!this.task || !this.task(now - this.prevTime, now - this.startTime)) {
                    this.registered = false;
                    return;
                }
                this.prevTime = now;
                setTimeout(this.animate, this.interval);
                this.registered = true;
            };
            this.prevTime = this.startTime = Date.now();
        }
        start(task) {
            this.task = task;
            this.prevTime = this.startTime = Date.now();
            if (!this.registered) {
                this.animate();
            }
        }
        stop() {
            this.task = null;
        }
        animating() {
            return this.registered;
        }
    }
    function drawArrowhead(context, src, dst, w, h) {
        const v0 = src.sub(dst);
        const maxH = v0.length() / 2 - 1;
        if (maxH < h) {
            w = w * maxH / h;
            h = maxH;
        }
        const v1 = v0.unit();
        if (v1) {
            const v2 = v1.mul(h);
            const v3 = v1.rotateR().mul(w / 2);
            const p1 = dst.add(v2);
            const p2 = p1.add(v3);
            const p3 = p1.add(v3.neg());
            context.beginPath();
            context.moveTo(MARGIN_R + dst.x, dst.y);
            context.lineTo(MARGIN_R + p2.x, p2.y);
            context.stroke();
            context.beginPath();
            context.moveTo(MARGIN_R + dst.x, dst.y);
            context.lineTo(MARGIN_R + p3.x, p3.y);
            context.stroke();
        }
    }
    //	const paramNames = ["壁1のX座標", "スリット1の下端のY座標", "スリット1の下端のY座標", "スリット1の下端のY座標", "的のY座標", "的のY座標"];
    class Main {
        constructor(id) {
            this.paramNames = [
                "S[m]",
                ["X", Dom.elem("sub", null, "1"), "[m]"],
                ["Y", Dom.elem("sub", null, "1"), "[m]"],
                ["X", Dom.elem("sub", null, "2"), "[m]"],
                ["Y", Dom.elem("sub", null, "2"), "[m]"],
                ["X", Dom.elem("sub", null, "t"), "[m]"],
                ["Y", Dom.elem("sub", null, "t"), "[m]"],
            ];
            this.paramInputs = [];
            this.drawBackground = () => {
                this.context.clearRect(0, 0, W, H);
                this.context.strokeStyle = "black";
                this.context.lineWidth = 2;
                this.context.strokeRect(0, 0, W, H);
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + this.stageParams.x1, 0);
                this.context.lineTo(MARGIN_R + this.stageParams.x1, H - (this.stageParams.y1 + this.stageParams.s));
                this.context.moveTo(MARGIN_R + this.stageParams.x1, H - this.stageParams.y1);
                this.context.lineTo(MARGIN_R + this.stageParams.x1, H);
                this.context.stroke();
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + this.stageParams.x2, 0);
                this.context.lineTo(MARGIN_R + this.stageParams.x2, H - (this.stageParams.y2 + this.stageParams.s));
                this.context.moveTo(MARGIN_R + this.stageParams.x2, H - this.stageParams.y2);
                this.context.lineTo(MARGIN_R + this.stageParams.x2, H);
                this.context.stroke();
                this.context.strokeStyle = "blue";
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + this.stageParams.xt, H - (this.stageParams.yt + this.stageParams.s));
                this.context.lineTo(MARGIN_R + this.stageParams.xt, H - this.stageParams.yt);
                this.context.stroke();
                const y = parseFloat(this.inputY.value);
                const t = Math.PI * parseFloat(this.inputT.value) / 180.0;
                const v = parseFloat(this.inputV.value);
                const vx = v * Math.cos(t);
                const vy = v * Math.sin(t);
                this.context.lineWidth = 5;
                this.context.strokeStyle = "darkGreen";
                this.context.fillStyle = "lightGreen";
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + 0, H);
                this.context.lineTo(MARGIN_R + 0, H - y);
                this.context.lineTo(MARGIN_R + vx, H - (y + vy));
                this.context.stroke();
                this.context.beginPath();
                this.context.arc(MARGIN_R, H - y, 10, 0, Math.PI * 2);
                this.context.fill();
                this.context.stroke();
                this.context.fillStyle = "#777";
                this.context.strokeStyle = "#777";
                this.context.lineWidth = 1;
                this.drawArrow(-LABEL_H * 0.8, H, -LABEL_H * 0.8, H - y, "Y", null, y - LABEL_H * 1.5);
                this.drawArrow(0, H - LABEL_H * 0.8, this.stageParams.xt, H - LABEL_H * 0.8, "x", "t", LABEL_H * 2);
                this.drawArrow(0, H - LABEL_H * 1.8, this.stageParams.x2, H - LABEL_H * 1.8, "x", "2", LABEL_H * 2);
                this.drawArrow(0, H - LABEL_H * 2.8, this.stageParams.x1, H - LABEL_H * 2.8, "x", "1", LABEL_H * 2);
                this.drawArrow(this.stageParams.xt, H, this.stageParams.xt, H - this.stageParams.yt, "y", "t", LABEL_H * 1.5);
                this.drawArrow(this.stageParams.xt + LABEL_H * 0.8, H - this.stageParams.yt, this.stageParams.xt + LABEL_H * 0.8, H - (this.stageParams.yt + this.stageParams.s), null, null, this.stageParams.s / 2);
                this.context.textAlign = "left";
                this.context.font = (LABEL_H * 0.8) + "px sans-serif";
                this.context.fillText("S", MARGIN_R + this.stageParams.xt + LABEL_H * 1.0, H - (this.stageParams.yt + this.stageParams.s / 2));
                this.drawArrow(this.stageParams.x2 + LABEL_H * 0.8, H, this.stageParams.x2 + LABEL_H * 0.8, H - this.stageParams.y2, "y", "1", LABEL_H * 2.5);
                this.drawArrow(this.stageParams.x1 + LABEL_H * 0.8, H, this.stageParams.x1 + LABEL_H * 0.8, H - this.stageParams.y1, "y", "2", LABEL_H * 3.5);
                let p0 = new Lib.Point2D(0, H - y);
                let p1 = new Lib.Point2D(vx, H - (y + vy));
                let d = p1.sub(p0);
                let ud = d.unit();
                if (ud) {
                    ud = ud.rotateR();
                    p0 = p0.add(ud.mul(-LABEL_H * 0.8));
                    p1 = p1.add(ud.mul(-LABEL_H * 0.8));
                    this.drawArrow(p0.x, p0.y, p1.x, p1.y, "V", null, d.length() / 2);
                }
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + 10, H - y);
                this.context.lineTo(100, H - y);
                this.context.stroke();
                this.context.beginPath();
                let t0 = 0;
                let t1 = -t;
                if (t1 > t0) {
                    const tmp = t0;
                    t0 = t1;
                    t1 = tmp;
                }
                this.context.arc(MARGIN_R, H - y, 50, t0, t1, true);
                this.context.stroke();
                const tlt = (t0 + t1) / 2;
                this.context.fillText("θ", MARGIN_R + 60 * Math.cos(tlt), H - (y - 60 * Math.sin(tlt)));
                /*			this.context.strokeStyle = "red";
                            this.context.beginPath();
                            this.context.moveTo(MARGIN_R + 0, H - this.c);
                            for(let i = 0; i < W; i ++){
                                const x = i / W;
                                this.context.lineTo(MARGIN_R + i, H - (this.a * x * x + this.b * x + this.c));
                            }
                            this.context.stroke();
                */
            };
            this.readProblem = () => {
                const line = this.problemInput.value.split(",");
                ;
                if (line.length < this.paramInputs.length) {
                    this.error(line.length + "項目しかありません");
                    return;
                }
                for (let i = 0; i < this.paramInputs.length; i++) {
                    this.paramInputs[i].value = line[i].trim();
                }
            };
            this.readAnswer = () => {
                const line = this.answerInput.value.split(",");
                if (line.length < 3) {
                    this.error(line.length + "項目しかありません");
                }
                else {
                    this.inputY.value = line[0].trim();
                    this.inputT.value = line[1].trim();
                    this.inputV.value = line[2].trim();
                    this.launch();
                }
            };
            this.problemChanged = () => {
                let line = [];
                for (const input of this.paramInputs) {
                    line.push(input.value);
                }
                this.problemInput.value = line.join(",");
                this.stageParams = this.readValues();
                if (!this.animator.animating()) {
                    this.drawBackground();
                }
            };
            this.answerChanged = () => {
                let line = [this.inputY.value, this.inputT.value, this.inputV.value];
                this.answerInput.value = line.join(",");
                if (!this.animator.animating()) {
                    this.drawBackground();
                }
            };
            this.keyTable = {
                ArrowUp: () => { this.inputY.value = "" + (parseFloat(this.inputY.value) + 1); },
                ArrowDown: () => { this.inputY.value = "" + (parseFloat(this.inputY.value) - 1); },
                "+": () => { this.inputT.value = "" + (parseFloat(this.inputT.value) + 1); },
                "-": () => { this.inputT.value = "" + (parseFloat(this.inputT.value) - 1); },
                ArrowLeft: () => { this.inputV.value = "" + (parseFloat(this.inputV.value) - 1); },
                ArrowRight: () => { this.inputV.value = "" + (parseFloat(this.inputV.value) + 1); },
                " ": () => { this.launch(); },
            };
            this.keyDown = (event) => {
                if (event.srcElement === document.body) {
                    const handler = this.keyTable[event.key];
                    if (handler !== undefined) {
                        handler();
                        this.answerChanged();
                        event.preventDefault();
                    }
                    //				Lib.debugOutput("" + event.key);
                }
            };
            this.inputY = Dom.input("number", { size: 5, value: "100", style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
            this.inputT = Dom.input("number", { size: 5, value: "45", style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
            this.inputV = Dom.input("number", { size: 5, value: "100", style: { width: "6em", marginRight: "2em" }, onchange: this.answerChanged });
            this.problemInput = Dom.input("text", { size: 40, style: { margin: "0.2em 0.5em" } });
            this.answerInput = Dom.input("text", { size: 40, style: { margin: "0.2em 0.5em" } });
            this.animator = new Animator();
            this.errors = Dom.elem("p", null);
            this.launch = () => {
                const y = parseFloat(this.inputY.value);
                const t = Math.PI * parseFloat(this.inputT.value) / 180.0;
                const v = parseFloat(this.inputV.value);
                const vx = v * Math.cos(t);
                const vy = v * Math.sin(t);
                const tt = vy / g;
                const xt = tt * vx;
                const yt = y + vy * vy / g / 2.0;
                const c = y;
                const result = Lib.solveLinearEquation([
                    { a: 2 * xt, b: 1, _: 0 },
                    { a: xt * xt, b: xt, _: yt - y },
                ]);
                if (result) {
                    const { a, b } = result;
                    const signs = [
                        [Math.round(this.stageParams.x1), this.stageParams.y1, undefined],
                        [Math.round(this.stageParams.x2), this.stageParams.y2, undefined],
                        [Math.round(this.stageParams.xt), this.stageParams.yt, undefined],
                    ];
                    this.animator.start(this.makeAnimTask({ vx, vy, a, b, c, trace: [[0, 0, y]], signs }));
                }
            };
            const div = Dom.getElement(id);
            const canvas = Dom.canvas2D({ width: W, height: H, style: { width: W + "px", height: H + "px" } });
            document.addEventListener("keydown", this.keyDown);
            Dom.append(div, canvas.canvas);
            this.context = canvas.context;
            const nameTr = Dom.elem("tr", null, Dom.elem("td", null, "g[m/s", Dom.elem("sup", null, "2"), "]"));
            const paramTr = Dom.elem("tr", null, Dom.elem("td", null, "" + g));
            for (const paramName of this.paramNames) {
                const input = Dom.input("text", { size: 5, onchange: this.problemChanged });
                this.paramInputs.push(input);
                Dom.append(nameTr, Dom.elem("td", null, paramName));
                Dom.append(paramTr, Dom.elem("td", null, input));
            }
            this.paramInputs[0].value = "" + 10;
            Dom.append(paramTr, Dom.input("button", { value: "新しい問題", onclick: () => {
                    this.animator.stop();
                    this.stageParams = this.create();
                    this.problemChanged();
                    this.drawBackground();
                } }));
            this.stageParams = this.create();
            this.answerChanged();
            const control = Dom.elem("div", null, Dom.elem("table", null, nameTr, paramTr), Dom.elem("div", null, "位置Y: ", this.inputY, "角度θ: ", this.inputT, "初速V: ", this.inputV, Dom.input("button", { value: "発射", onclick: this.launch })), Dom.elem("pre", null, "【キー操作】 ↑↓: 上下移動    +-: 角度の増減    ←→: 初速の増減    スペースキー: 発射"), Dom.elem("div", null, "問題一括入力: ", this.problemInput, Dom.elem("span", null, Dom.input("button", { value: "取り込み", onclick: this.readProblem }))), Dom.elem("div", null, "解答一括入力: ", this.answerInput, Dom.elem("span", null, Dom.input("button", { value: "取り込み", onclick: this.readAnswer }))), this.errors);
            Dom.append(div, control);
            this.drawBackground();
        }
        static initialize(id) {
            new Main(id);
        }
        drawArrow(x1, y1, x2, y2, label, labelSub, labelPos) {
            let p1 = new Lib.Point2D(x1, y1);
            let p2 = new Lib.Point2D(x2, y2);
            const v = p2.sub(p1);
            let p;
            let headW = 8;
            let headH = 8;
            if (v.length() > 6 + headH * 2) {
                const uv = v.unit();
                if (uv) {
                    p1 = p1.add(uv.mul(3));
                    p2 = p2.add(uv.mul(-3));
                    p = p1.add(uv.mul(labelPos));
                }
                else {
                    p = p1;
                }
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + p1.x, p1.y);
                this.context.lineTo(MARGIN_R + p2.x, p2.y);
                this.context.stroke();
                drawArrowhead(this.context, p1, p2, headW, headH);
                drawArrowhead(this.context, p2, p1, headW, headH);
            }
            else {
                const uv = v.unit();
                if (uv !== null) {
                    const p12 = p1.add(uv.mul(-20));
                    const p22 = p2.add(uv.mul(20));
                    this.context.beginPath();
                    this.context.moveTo(MARGIN_R + p12.x, p12.y);
                    this.context.lineTo(MARGIN_R + p1.x, p1.y);
                    this.context.moveTo(MARGIN_R + p22.x, p22.y);
                    this.context.lineTo(MARGIN_R + p2.x, p2.y);
                    this.context.stroke();
                    drawArrowhead(this.context, p12, p1, headW, headH);
                    drawArrowhead(this.context, p22, p2, headW, headH);
                }
                p = p1.add(v.mul(0.5));
            }
            if (label !== null || labelSub !== null) {
                const h = LABEL_H * 0.8;
                this.context.font = h + "px sans-serif";
                const textMetrix = this.context.measureText(label + (labelSub !== null ? labelSub : ""));
                const w = textMetrix.width;
                this.context.clearRect(MARGIN_R + p.x - w / 2 - 1, p.y - h / 2 - 1, w + 2, h + 2);
                this.context.textBaseline = "middle";
                if (labelSub) {
                    if (label !== null) {
                        this.context.textAlign = "right";
                        this.context.fillText(label, MARGIN_R + p.x, p.y);
                    }
                    this.context.textAlign = "left";
                    this.context.font = (h * 0.8) + "px sans-serif";
                    this.context.fillText(labelSub, MARGIN_R + p.x + (h * 0.1), p.y + (h * 0.2));
                }
                else if (label !== null) {
                    this.context.textAlign = "center";
                    this.context.fillText(label, MARGIN_R + p.x, p.y);
                }
            }
        }
        error(message) {
            Dom.clear(this.errors);
            Dom.append(this.errors, "一括入力失敗: " + message);
        }
        makeAnimTask(params) {
            return (interval, time) => {
                let [t, x, y] = params.trace[params.trace.length - 1];
                if (x > -100 && x < W + 100 && (params.vy > g * time / 1000.0 || y > -100)) {
                    let updated = false;
                    while (true) {
                        t += INTERVAL;
                        if (t > time) {
                            break;
                        }
                        const t_s = t / 1000.0;
                        x = params.vx * t_s;
                        y = params.c + params.vy * t_s - g * t_s * t_s * 0.5;
                        params.trace.push([t, x, y]);
                        updated = true;
                    }
                    if (updated) {
                        for (const sign of params.signs) {
                            const [sx, sy, values] = sign;
                            if (values === undefined) {
                                if (sx <= x) {
                                    const my = params.a * sx * sx + params.b * sx + params.c;
                                    const yb = sy - 1;
                                    const yt = sy + this.stageParams.s + 1;
                                    sign[2] = [my, yb <= my && my <= yt];
                                }
                            }
                        }
                    }
                }
                /*				this.context.strokeStyle = "yellow";
                                this.context.beginPath();
                                this.context.moveTo(MARGIN_R + 0, H - params.c);
                                for(let i = 0; i < W; i ++){
                                    const x = i;
                                    this.context.lineTo(MARGIN_R + i, H - (params.a * x * x + params.b * x + params.c));
                                }
                                this.context.stroke();
                */
                this.drawBackground();
                this.context.strokeStyle = "rgba(0,240,0,0.5)";
                this.context.lineWidth = 3;
                this.context.beginPath();
                this.context.moveTo(MARGIN_R + params.trace[0][1], H - params.trace[0][2]);
                for (let i = 1; i < params.trace.length; i++) {
                    this.context.lineTo(MARGIN_R + params.trace[i][1], H - params.trace[i][2]);
                }
                this.context.stroke();
                this.context.fillStyle = "rgba(0,200,0,1)";
                this.context.beginPath();
                this.context.arc(MARGIN_R + params.trace[params.trace.length - 1][1], H - params.trace[params.trace.length - 1][2], 5, 0, Math.PI * 2);
                this.context.fill();
                this.context.textBaseline = "middle";
                this.context.textAlign = "center";
                this.context.font = "40px sans-serif";
                //				this.context.fontWeight = "bolder";
                for (const sign of params.signs) {
                    const [sx, sy, values] = sign;
                    if (values !== undefined) {
                        const [my, flag] = values;
                        if (flag) {
                            this.context.strokeStyle = "rgba(0,255,0,0.5)";
                            this.context.strokeText("○", MARGIN_R + sx, H - my);
                        }
                        else {
                            this.context.strokeStyle = "rgba(255,0,0,0.5)";
                            this.context.strokeText("×", MARGIN_R + sx, H - my);
                        }
                    }
                }
                /*
                                if(x <= W){
                                    return true;
                                }else{
                                    return false;
                                }
                */
                return true;
            };
        }
        /*
                private a: number;
                private b: number
                private c: number;
        */
        create() {
            const s = parseFloat(this.paramInputs[0].value);
            while (true) {
                const w1 = Math.random() + 1;
                const w2 = Math.random() + 1;
                const w3 = Math.random() + 1;
                const w = w1 + w2 + w3;
                const t_x0 = 0.0;
                const t_xt = 1.0;
                const t_x1 = t_xt * w1 / w;
                const t_x2 = t_xt * (w1 + w2) / w;
                // t_x0 = 0
                const t_y2 = Math.random() * 0.4 + 0.5;
                const t_y0 = Math.random() * t_y2;
                const t_yt = Math.random() * t_y2;
                // a t_x^2 + b t_y + c = t_y
                // c = t_y0
                // a t_x2 ^ 2 + b t_x2 = t_y2 - t_y0
                // a t_xt ^ 2 + b t_xt = t_yt - t_y0
                const result = Lib.solveLinearEquation([
                    { a: t_x0 * t_x0, b: t_x0, c: 1, _: t_y0 },
                    { a: t_x2 * t_x2, b: t_x2, c: 1, _: t_y2 },
                    { a: t_xt * t_xt, b: t_xt, c: 1, _: t_yt },
                ]);
                if (result === null) {
                    continue;
                }
                const { a, b, c } = result;
                const t_y1 = a * t_x1 * t_x1 + b * t_x1 + c;
                const t_y_max = Math.max(1.0, t_y1 / 0.9, t_y2 / 0.9);
                const h = H - (MARGIN_T + MARGIN_B + s * 3);
                /*
                                this.a = h * a / t_y_max;
                                this.b = h * b / t_y_max;
                                this.c = MARGIN_V + h * c / t_y_max;
                */
                const x1 = Math.round((W - MARGIN_R - MARGIN_L) * t_x1);
                const x2 = Math.round((W - MARGIN_R - MARGIN_L) * t_x2);
                const xt = Math.round((W - MARGIN_R - MARGIN_L) * t_xt);
                const y1 = Math.round(MARGIN_B + h * t_y1 / t_y_max);
                const y2 = Math.round(MARGIN_B + h * t_y2 / t_y_max);
                const yt = Math.round(MARGIN_B + h * t_yt / t_y_max);
                this.paramInputs[1].value = "" + x1;
                this.paramInputs[2].value = "" + y1;
                this.paramInputs[3].value = "" + x2;
                this.paramInputs[4].value = "" + y2;
                this.paramInputs[5].value = "" + xt;
                this.paramInputs[6].value = "" + yt;
                this.problemChanged();
                return { s, x1, y1, x2, y2, xt, yt };
            }
        }
        readValues() {
            const s = parseFloat(this.paramInputs[0].value);
            const x1 = parseFloat(this.paramInputs[1].value);
            const y1 = parseFloat(this.paramInputs[2].value);
            const x2 = parseFloat(this.paramInputs[3].value);
            const y2 = parseFloat(this.paramInputs[4].value);
            const xt = parseFloat(this.paramInputs[5].value);
            const yt = parseFloat(this.paramInputs[6].value);
            return { s, x1, y1, x2, y2, xt, yt };
        }
    }
    (function () {
        let id = DIV_NAME;
        let n = 1;
        while (true) {
            if (document.getElementById(id) === null) {
                break;
            }
            id = DIV_NAME + "_" + n;
            n++;
        }
        document.write("<div id=\"" + id + "\"></div>");
        Lib.executeOnDomLoad(() => Main.initialize(id));
    })();
})(Shooting || (Shooting = {}));
