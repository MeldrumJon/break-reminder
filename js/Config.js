export default class Config {
    /*
     * Takes an HTML form and returns the contents as an object.
     * For example:
     * <form>
     *   <input type="checkbox" id="chk" checked>
     *   <fieldset id="group">
     *     <input type="text" id="str" value="String">
     *   </fieldset>
     * </form>
     * Would become:
     * {
     *   chk: true,
     *   group: {
     *     str: "String"
     *   }
     * }
     */
    constructor(formId, prefix='') {
        this._formId = formId;
        this._prefix = prefix;
        if (localStorage.getItem(formId) !== null) {
            this.restore();
        }
        else {
            this.save();
        }
    }

    save() {
        function recurse(dom_parent, cfg_obj, prefix) {
            for (let i = 0; i < dom_parent.children.length; ++i) {
                let ch = dom_parent.children[i];
                let ch_key = ch.id;
                if (ch_key.startsWith(prefix)) {
                    ch_key = ch_key.slice(prefix.length);
                }
                switch (ch.tagName) {
                    case "INPUT":
                        switch (ch.getAttribute('type')) {
                            case "text":
                                cfg_obj[ch_key] = ch.value;
                                break;
                            case "checkbox":
                                cfg_obj[ch_key] = ch.checked;
                                break;
                        }
                        break;
                    case "TEXTAREA":
                        cfg_obj[ch_key] = ch.value;
                        break;
                    case "FIELDSET":
                        if (ch_key) {
                            cfg_obj[ch_key] = {};
                            recurse(ch, cfg_obj[ch_key], prefix);
                        }
                        else {
                            recurse(ch, cfg_obj, prefix);
                        }
                        break;
                    default:
                        recurse(ch, cfg_obj, prefix);
                }
            }
        }
        recurse(document.getElementById(this._formId), this, this._prefix);
        localStorage.setItem(this._formId, JSON.stringify(this));
        console.log('saved: ', this);
        console.log('ls: ', localStorage.getItem(this._formId));
    }

    restore() {
        let cfg = JSON.parse(localStorage.getItem(this._formId));
        Object.assign(this, cfg);
        console.log('restoring: ', this);
        function recurse(dom_parent, cfg_obj, prefix) {
            for (let i = 0; i < dom_parent.children.length; ++i) {
                let ch = dom_parent.children[i];
                let ch_key = ch.id;
                if (ch_key.startsWith(prefix)) {
                    ch_key = ch_key.slice(prefix.length);
                }
                switch (ch.tagName) {
                    case "INPUT":
                        switch (ch.getAttribute('type')) {
                            case "text":
                                cfg_obj[ch_key] = ch.value;
                                break;
                            case "checkbox":
                                cfg_obj[ch_key] = ch.checked;
                                break;
                        }
                        break;
                    case "TEXTAREA":
                        cfg_obj[ch_key] = ch.value;
                        break;
                    case "FIELDSET":
                        if (ch_key) {
                            cfg_obj[ch_key] = {};
                            recurse(ch, cfg_obj[ch_key], prefix);
                        }
                        else {
                            recurse(ch, cfg_obj, prefix);
                        }
                        break;
                    default:
                        recurse(ch, cfg_obj, prefix);
                }
            }
        }
        recurse(document.getElementById(this._formId), this, this._prefix);
    }
}

