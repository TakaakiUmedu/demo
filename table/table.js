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
        function getElementWithTypeByClassName(TYPE, className) {
            const elements = document.getElementsByClassName(className);
            const result = [];
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                if (element instanceof TYPE) {
                    result.push(element);
                }
            }
            return result;
        }
        Dom.getElementWithTypeByClassName = getElementWithTypeByClassName;
        function getInputsByClassName(className) {
            return getElementWithTypeByClassName(HTMLInputElement, className);
        }
        Dom.getInputsByClassName = getInputsByClassName;
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
///<reference path="mylib/mylib.ts"/>
///<reference path="mylib/mylib.dom.ts"/>
var Table;
///<reference path="mylib/mylib.ts"/>
///<reference path="mylib/mylib.dom.ts"/>
(function (Table) {
    const ID = "TABLE_DIV";
    const NO_GRIDS = "NO_GRIDS";
    const MONOSPACE = "MONOSPACE";
    const TAB = "TAB";
    const TAB_WIDTH = 4;
    const Dom = Lib.Dom;
    function makeToggleCheckboxCallback(checkbox, checkFunc, uncheckFunc) {
        return () => {
            if (checkbox.checked) {
                checkFunc();
            }
            else {
                uncheckFunc();
            }
        };
    }
    function makeToggleCheckbox(label, checkFunc, uncheckFunc, checked = true) {
        const checkbox = Dom.input("checkbox", { checked: checked });
        const callback = makeToggleCheckboxCallback(checkbox, checkFunc, uncheckFunc);
        Dom.addEventListener(checkbox, "click", callback);
        callback();
        return Dom.elem("label", {}, checkbox, label);
    }
    class Main {
        constructor() {
            this.div = Dom.getElement(ID);
            this.check = () => {
                Dom.clear(this.table);
                const firstTr = Dom.elem("tr", null, Dom.elem("th", null, ""));
                const widthList = [];
                const trList = [];
                Dom.append(this.table, firstTr);
                let maxWidth = 1;
                let count = 1;
                for (const line of this.textarea.value.split("\n")) {
                    const tr = Dom.elem("tr", null, Dom.elem("th", null, "" + (count % 10)));
                    let width = 0;
                    for (const c of line.split("")) {
                        const code = c.charCodeAt(0);
                        if (code == 0x09) {
                            const td = Dom.elem("td", { className: TAB }, "\u21E5");
                            Dom.append(tr, td);
                            width++;
                            let w = 1;
                            while (width % TAB_WIDTH != 0) {
                                width++;
                                w++;
                            }
                            td.colSpan = w;
                            Dom.appendClass(td, "w" + w);
                        }
                        else {
                            const td = Dom.elem("td", null, c);
                            Dom.append(tr, td);
                            if (code > 0xff) {
                                td.colSpan = 2;
                                width += 2;
                            }
                            else {
                                width++;
                            }
                        }
                    }
                    if (maxWidth < width) {
                        maxWidth = width;
                    }
                    widthList[count] = width;
                    trList[count] = tr;
                    Dom.append(this.table, tr);
                    count += 1;
                }
                for (let i = 0; i < maxWidth; i++) {
                    Dom.append(firstTr, Dom.elem("th", null, "" + (i % 10)));
                }
                for (let i = 0; i < count; i++) {
                    const tr = trList[count];
                    const width = maxWidth - widthList[i];
                    for (let j = 0; j < width; j++) {
                        Dom.append(trList[i], Dom.elem("td"));
                    }
                }
            };
            if (document.head !== null) {
                Dom.append(document.head, Dom.elem("link", { rel: "stylesheet", href: "table.css" }));
            }
            this.textarea = Dom.elem("textarea", { cols: 80, rows: 20 }, "ここにチェックしたいテキストをコピー&ペースト\n\n+-------------------+\n| 例えば  | 2,980円 |\n| example |   300円 |\n+-------------------+\n|  合計   | 3,280円 |\n+-------------------+\n");
            this.table = Dom.elem("table");
            const button = Dom.input("button", { value: "↓チェック↓", onclick: this.check });
            const drawGrids = makeToggleCheckbox("↓に罫線を表示", () => Dom.removeClass(this.table, NO_GRIDS), () => Dom.appendClass(this.table, NO_GRIDS));
            const monospace = makeToggleCheckbox("↑を(なるべく)等幅フォントで表示", () => Dom.appendClass(this.textarea, MONOSPACE), () => Dom.removeClass(this.textarea, MONOSPACE));
            Dom.append(this.div, Dom.elem("p", null, "出力チェッカー"), this.textarea, Dom.elem("p", null, button, drawGrids, monospace), this.table);
        }
        static initialize() {
            document.write("<div id=\"" + ID + "\"></div>");
            Lib.executeOnDomLoad(() => {
                new Main();
            });
        }
    }
    Main.initialize();
})(Table || (Table = {}));
