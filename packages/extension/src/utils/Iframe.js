import {
    warnLog,
} from '~/utils/log';

export default class Iframe {
    constructor({
        id,
        src,
        width,
        height,
        style = {},
        onReadyEventName = '',
        containerId = '',
    } = {}) {
        this.id = id;
        this.containerId = containerId;
        this.src = src;
        this.url = new URL(this.src);
        this.width = width;
        this.height = height;
        this.style = style;
        this.frame = null;
        this.onReadyEventName = onReadyEventName;
        this.onReadyCallback = null;
    }

    bindAwaitFrameReady() {
        window.addEventListener('message', this.handleFrameReadyEvent);
    }

    unbindAwaitFrameReady() {
        window.removeEventListener('message', this.handleFrameReadyEvent);
    }

    handleFrameReadyEvent = (event) => {
        if (event.data.type === this.onReadyEventName
            && event.origin === this.url.origin
        ) {
            this.unbindAwaitFrameReady();
            this.onReadyCallback(this.frame);
            this.onReadyCallback = null;
        }
    };

    async init() {
        if (!this.onReadyEventName) {
            warnLog("Please define 'onReadyEventName' in the constructor or call .create() instead.");
            return null;
        }

        // clear previous unresolved init
        this.unbindAwaitFrameReady();

        return new Promise((resolve) => {
            this.onReadyCallback = resolve;
            this.bindAwaitFrameReady();
            this.create();
        });
    }

    create() {
        const frame = document.createElement('iframe');
        frame.id = this.id;
        frame.src = this.src;
        frame.style.display = 'none';
        frame.height = 0;
        frame.width = 0;
        frame.style.border = 'none';
        Object.keys(this.style).forEach((attr) => {
            frame.style[attr] = this.style[attr];
        });

        let container;
        if (this.containerId) {
            container = document.getElementById(this.containerId);
            container.innerHTML = '';
        } else {
            container = document.body;
        }
        container.appendChild(frame);

        this.frame = document.getElementById(this.id);
    }

    open({
        width = this.width,
        height = this.height,
        ...style
    } = {}) {
        this.frame.width = width;
        this.frame.height = height;
        this.frame.style.display = 'block';
        Object.keys(style).forEach((attr) => {
            this.frame.style[attr] = style[attr];
        });
    }

    close() {
        setTimeout(() => {
            this.frame.style.display = 'none';
            this.frame.height = 0;
            this.frame.width = 0;
        }, 500);
    }

    updateStyle({
        width,
        height,
        ...style
    }) {
        if (width !== undefined) {
            this.frame.width = width;
        }
        if (height !== undefined) {
            this.frame.height = height;
        }
        Object.keys(style).forEach((attr) => {
            this.frame.style[attr] = style[attr];
        });
    }
}
