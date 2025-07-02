/*
  - `el.classList.remove("foo");`
  - `el.classList.add("anotherclass");`
  - `el.classList.contains("foo");`
  - `el.classList.replace("foo", "bar");`
*/

type ClassList = string | Array<string> | undefined;

// lurking method which will get minified to 1 letter
/**
 * Plops CSS classes on a DOM element.
 *
 * @param dom element to apply classes to
 * @param classes classes, if any, to add
 */
const applyClassW = (dom: HTMLElement, classes: ClassList) => {
    if (classes) {
        if (Array.isArray(classes)) {
            // internet says apply() faster than ...spread.
            // internet never lies.
            dom.classList.add(...classes);
        } else {
            dom.classList.add(classes);
        }
    }
};

/**
 * Factory for DOM creation. A bit dumb. DOMB
 */
class Domb {
    /**
     * Plops CSS classes on a DOM element.
     *
     * @param dom element to apply classes to
     * @param classes classes, if any, to add
     */
    static applyClass(dom: HTMLElement, classes: ClassList) {
        applyClassW(dom, classes);
    }

    /**
     * Shortcut to document.getElementById, assumes it exists
     */
    static git(id: string): HTMLElement {
        return document.getElementById(id)!;
    }

    /**
     * Makes a new standard (stock) HTML element.
     *
     * @param tagName name of the element tag (e.g. 'div')
     * @param id id of the element
     * @param classes any classes to apply to the element
     * @returns HTML element
     */
    static new<K extends keyof HTMLElementTagNameMap>(tagName: K, id: string = '', classes: ClassList = undefined): HTMLElementTagNameMap[K] {
        const elem = document.createElement(tagName);
        elem.id = id;
        applyClassW(elem, classes);

        return elem;
    }

    /**
     * Makes a new image HTML element.
     *
     * @param url image source
     * @param id id of the element
     * @param classes any classes to apply to the element
     * @returns Image element
     */
    static img(url: string, id: string = '', classes: ClassList = undefined): HTMLImageElement {
        const i = Domb.new('img', id, classes);
        i.src = url;
        i.draggable = false;
        return i;
    }
}

export { Domb };
