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
var Tiling;
///<reference path="mylib/mylib.dom.ts"/>
///<reference path="mylib/mylib.geometry.ts"/>
///<reference path="mylib/mylib.linear_algebra.ts"/>
(function (Tiling) {
    const DIV_NAME = "TILING";
    const Dom = Lib.Dom;
    const W = 480;
    const H = 480;
    const MARGIN = 10;
    const photos = ["写真0", "写真1", "写真2", "写真3", "写真4"];
    const TABINDEX_BASE = photos.length * 3 + 1;
    const TABINDEX_CREATE_BUTTON = TABINDEX_BASE;
    const TABINDEX_PROBLEM = TABINDEX_BASE + 1;
    const TABINDEX_PROBLEM_BUTTON = TABINDEX_BASE + 2;
    const TABINDEX_ANSWER = TABINDEX_BASE + 3;
    const TABINDEX_ANSWER_BUTTON = TABINDEX_BASE + 4;
    const SIZE_MIN = 200;
    const SIZE_MAX = 1000;
    class Main {
        constructor(id) {
            this.inputsW = [];
            this.inputsH = [];
            this.inputsR = [];
            this.arrangeMode = "A";
            this.problemTotal = Dom.elem("textarea", { tabIndex: TABINDEX_PROBLEM, rows: 2, cols: 40 });
            this.answerTotal = Dom.elem("textarea", { tabIndex: TABINDEX_ANSWER, rows: 2, cols: 40 });
            this.errors = Dom.elem("p", { style: { color: "red" } });
            this.importProblem = () => {
                Dom.clear(this.errors);
                const lines = this.problemTotal.value.split("\n");
                if (lines.length != 2) {
                    this.error("問題はちょうど2行必要です");
                    return;
                }
                const valueLists = [];
                for (let i = 0; i < 2; i++) {
                    const values = lines[i].split(",");
                    if (values.length != 5) {
                        this.error("問題は各行ちょうど5要素ずつ必要です" + (i + 1) + "行目に" + values.length + "要素あります");
                        return;
                    }
                    for (let j = 0; j < 5; j++) {
                        if (!values[j].match(/^(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?$/)) {
                            this.error("0以上の数値以外が含まれています: " + values[j]);
                            return;
                        }
                    }
                    valueLists.push(values);
                }
                const inputLists = [this.inputsW, this.inputsH];
                for (let i = 0; i < 2; i++) {
                    const values = valueLists[i];
                    const inputs = inputLists[i];
                    for (let j = 0; j < 5; j++) {
                        inputs[j].value = values[j];
                    }
                }
                this.draw();
            };
            this.importAnswer = () => {
                Dom.clear(this.errors);
                const lines = this.answerTotal.value.split("\n");
                if (lines.length != 2) {
                    this.error("問題はちょうど2行必要です");
                    return;
                }
                const mode = lines[0].trim();
                if (mode !== "1" && mode !== "2") {
                    this.error("1行目は「1」か「2」のいずれかである必要があります");
                    return;
                }
                const values = lines[1].split(",");
                if (values.length != 5) {
                    this.error("解答はちょうど5要素必要です" + values.length + "要素あります");
                    return;
                }
                for (let i = 0; i < 5; i++) {
                    if (!values[i].match(/^(\d+|\d+\.\d+|\.\d+)([eE][-+]?\d+)?$/)) {
                        this.error("0以上の数値以外が含まれています: " + values[i]);
                        return;
                    }
                }
                for (let i = 0; i < 5; i++) {
                    this.inputsR[i].value = values[i];
                }
                this.draw();
            };
            this.changed = () => {
                const valuesW = [];
                const valuesH = [];
                const valuesR = [];
                for (let i = 0; i < photos.length; i++) {
                    valuesW.push(this.inputsW[i].value);
                    valuesH.push(this.inputsH[i].value);
                    valuesR.push(this.inputsR[i].value);
                }
                this.problemTotal.value = valuesW.join(",") + "\n" + valuesH.join(",");
                this.answerTotal.value = this.mode.value + "\n" + valuesR.join(",");
                this.draw();
            };
            this.draw = () => {
                const posList = [];
                let prevX = 0;
                let prevY = 0;
                let prevW = 0;
                let prevH = 0;
                const xList = [];
                const yList = [];
                for (let i = 0; i < photos.length; i++) {
                    const r = parseFloat(this.inputsR[i].value);
                    const w = Math.round(parseFloat(this.inputsW[i].value) * r);
                    const h = Math.round(parseFloat(this.inputsH[i].value) * r);
                    posList.push({ x: 0, y: 0, w, h });
                }
                const CT = 0;
                const LT = 1;
                const RT = 2;
                const RB = 3;
                const LB = 4;
                const layout = this.mode.value;
                const totalW = Math.max(posList[LT].w + posList[RT].w, posList[LB].w + posList[RB].w, posList[CT].w + (layout === "1" ? posList[LB].w + posList[RT].w : posList[LT].w + posList[RB].w));
                const totalH = Math.max(posList[LT].h + posList[LB].h, posList[RT].h + posList[RB].h, posList[CT].h + (layout === "1" ? posList[LT].h + posList[RB].h : posList[RT].h + posList[LB].h));
                const r = Math.min((W - MARGIN * 2) / totalW, (H - MARGIN * 2) / totalH);
                posList[LT].x = 0;
                posList[LT].y = 0;
                posList[RT].x = totalW - posList[RT].w;
                posList[RT].y = 0;
                posList[RB].x = totalW - posList[RB].w;
                posList[RB].y = totalH - posList[RB].h;
                posList[LB].x = 0;
                posList[LB].y = totalH - posList[LB].h;
                if (layout === "1") {
                    posList[CT].x = posList[LB].w;
                    posList[CT].y = posList[LT].h;
                }
                else {
                    posList[CT].x = posList[LT].w;
                    posList[CT].y = posList[RT].h;
                }
                //			const gridList: PHOTO_POS[] = [];
                //			gridList.push( { x: 0, y: 0, w: totalW - posList[1].w, h: posList[0].h } );
                //			gridList.push( { x: posList[1].x, y: 0, w: posList[1].w, h: totalH - posList[2].h } );
                //			gridList.push( { x: posList[3].w, y: posList[2].y, w: totalW - posList[3].w, h: posList[2].h } );
                //			gridList.push( { x: 0, y: posList[0].h, w: posList[3].w, h: totalH - posList[0].h } );
                const mh = (W - totalW * r) / 2;
                const mv = (H - totalH * r) / 2;
                for (const pos of posList) {
                    const pl = Math.round(mh + pos.x * r);
                    const pt = Math.round(mv + pos.y * r);
                    const pr = Math.round(mh + pos.x * r + pos.w * r);
                    const pb = Math.round(mv + pos.y * r + pos.h * r);
                    pos.x = pl;
                    pos.y = pt;
                    pos.w = pr - pl;
                    pos.h = pb - pt;
                }
                this.context.clearRect(0, 0, H, W);
                this.context.lineWidth = 1;
                this.context.strokeStyle = "#888";
                this.context.strokeRect(posList[LT].x, posList[LT].y, posList[RB].x + posList[RB].w - posList[LT].x, posList[RB].y + posList[RB].h - posList[LT].y);
                let lines = [];
                if (this.mode.value === "1") {
                    lines.push([posList[LT].x, posList[CT].y, posList[RT].x, posList[CT].y]);
                    lines.push([posList[RT].x, posList[RT].y, posList[RT].x, posList[RB].y]);
                    lines.push([posList[CT].x, posList[RB].y, posList[RB].x + posList[RB].w, posList[RB].y]);
                    lines.push([posList[CT].x, posList[CT].y, posList[CT].x, posList[LB].y + posList[LB].h]);
                }
                else {
                    lines.push([posList[CT].x, posList[LT].y, posList[CT].x, posList[LB].y]);
                    lines.push([posList[CT].x, posList[CT].y, posList[RT].x + posList[RT].w, posList[CT].y]);
                    lines.push([posList[RB].x, posList[CT].y, posList[RB].x, posList[RB].y + posList[RB].h]);
                    lines.push([posList[LB].x, posList[LB].y, posList[RB].x, posList[LB].y]);
                }
                this.context.beginPath();
                for (const line of lines) {
                    this.context.moveTo(line[0], line[1]);
                    this.context.lineTo(line[2], line[3]);
                }
                this.context.stroke();
                //			for(const pos of gridList){
                //				this.context.fillStyle = "rgba(255,0,255,0.5)";
                //				this.context.strokeRect(pos.x, pos.y, pos.w, pos.h);
                //			}
                const colorsB = ["rgba(0,255,0,0.4)", "rgba(255,0,0,0.4)", "rgba(0,0,255,0.4)", "rgba(127,0,127,0.4)", "rgba(0,127,127,0.4)"];
                const colorsL = ["rgba(0,127,0,1.0)", "rgba(127,0,0,1.0)", "rgba(0,0,127,1.0)", "rgba(64,0,64,1.0)", "rgba(0,64,64,1.0)"];
                this.context.lineWidth = 3;
                this.context.textBaseline = "middle";
                this.context.textAlign = "center";
                this.context.font = "20px sans-serif";
                for (let i = 0; i < photos.length; i++) {
                    const pos = posList[i];
                    this.context.fillStyle = colorsB[i];
                    this.context.fillRect(pos.x, pos.y, pos.w, pos.h);
                }
                for (let i = 0; i < photos.length; i++) {
                    const pos = posList[i];
                    this.context.strokeStyle = colorsL[i];
                    this.context.strokeStyle = "#aaa";
                    this.context.strokeRect(pos.x, pos.y, pos.w, pos.h);
                }
                this.context.fillStyle = "black";
                for (let i = 0; i < photos.length; i++) {
                    const pos = posList[i];
                    this.context.fillText(photos[i], pos.x + pos.w / 2, pos.y + pos.h / 2);
                }
            };
            this.create = () => {
                for (let i = 0; i < photos.length; i++) {
                    let w = Math.round(SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.random());
                    let h = Math.round(SIZE_MIN + (SIZE_MAX - SIZE_MIN) * Math.random());
                    if (i <= 3) {
                        if ((i % 2 == 0 && h >= w) || (i % 2 == 1 && w >= h)) {
                            const tmp = w;
                            w = h;
                            h = tmp;
                        }
                    }
                    this.inputsW[i].value = "" + w;
                    this.inputsH[i].value = "" + h;
                }
                this.changed();
            };
            const div = Dom.getElement(id);
            const canvas = Dom.canvas2D({ width: W, height: H, style: { width: W + "px", height: H + "px" } });
            this.context = canvas.context;
            const labelTr = Dom.elem("tr", null, Dom.elem("td"));
            const inputWTr = Dom.elem("tr", null, Dom.elem("th", null, "幅: "));
            const inputHTr = Dom.elem("tr", null, Dom.elem("th", null, "高さ: "));
            const inputRTr = Dom.elem("tr", null, Dom.elem("th", null, "倍率: "));
            for (let i = 0; i < photos.length; i++) {
                const photo = photos[i];
                Dom.append(labelTr, Dom.elem("td", null, photo));
                const inputW = Dom.input("number", { tabIndex: i * 3 + 1, size: 5, onchange: this.changed, style: { width: "5em" } });
                const inputH = Dom.input("number", { tabIndex: i * 3 + 2, size: 5, onchange: this.changed, style: { width: "5em" } });
                const inputR = Dom.input("number", { tabIndex: i * 3 + 3, size: 5, value: "50", onchange: this.changed, style: { width: "5em" } });
                Dom.append(inputWTr, Dom.elem("td", null, inputW));
                Dom.append(inputHTr, Dom.elem("td", null, inputH));
                Dom.append(inputRTr, Dom.elem("td", null, inputR));
                this.inputsW.push(inputW);
                this.inputsH.push(inputH);
                this.inputsR.push(inputR);
            }
            Dom.append(inputWTr, Dom.elem("td", { rowSpan: 2 }, Dom.input("button", { tabIndex: TABINDEX_CREATE_BUTTON, value: "新しい問題", onclick: this.create })));
            const radios = Dom.radiosWithState("mode", { onchange: this.changed }, { value: "1", label: "写真1" }, { value: "2", label: "写真2" });
            this.mode = radios.state;
            this.create();
            const control = Dom.elem("div", null, Dom.elem("table", null, labelTr, inputWTr, inputHTr, inputRTr), Dom.elem("p", null, Dom.elem("span", { style: { fontWeight: "bolder" } }, "写真0の上にくっつけて配置する写真: "), radios.radios[0], radios.labels[0], radios.radios[1], radios.labels[1]), Dom.elem("p", { style: { display: "flex" } }, "問題一括入力: ", this.problemTotal, Dom.elem("div", null, Dom.input("button", { tabIndex: TABINDEX_PROBLEM_BUTTON, value: "取り込み", onclick: this.importProblem }))), Dom.elem("p", { style: { display: "flex" } }, "解答一括入力: ", this.answerTotal, Dom.elem("div", null, Dom.input("button", { tabIndex: TABINDEX_ANSWER_BUTTON, value: "取り込み", onclick: this.importAnswer }))), this.errors);
            Dom.append(div, canvas.canvas, control);
        }
        static initialize(id) {
            new Main(id);
        }
        error(message) {
            Dom.append(this.errors, "一括入力失敗: " + message);
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
})(Tiling || (Tiling = {}));
