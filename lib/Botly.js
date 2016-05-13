"use strict";

const util = require("util");
const EventEmitter = require("events").EventEmitter;
const request = require("request");
const Router = require("express").Router;
const FB_URL = "https://graph.facebook.com/v2.6/";
const FB_MESSENGER_URL = `${FB_URL}/me/messages`;

const BUTTON_TYPE = {
    POSTBACK: "postback",
    WEB_URL: "web_url"
};

const TEMPLATE_TYPE = {
    BUTTON: "button",
    RECEIPT: "receipt",
    GENERIC: "generic"
};

const ATTACHMENT_TYPE = {
    IMAGE: "image",
    TEMPLATE: "template"
};

const NOTIFICATION_TYPE = {
    REGULAR: "REGULAR",
    SILENT_PUSH: "SILENT_PUSH",
    NO_PUSH: "NO_PUSH"
};

function Botly(options) {
    if (!(this instanceof Botly)) {
        return new Botly(options);
    }

    if (!options || !options.accessToken) {
        throw new Error("Must provide accessToken");
    }
    this.accessToken = options.accessToken;
    this.verifyToken = options.verifyToken;
    this.webHookPath = options.webHookPath || "/";
    this.notificationType = options.notificationType || NOTIFICATION_TYPE.REGULAR;
    EventEmitter.call(this);
}

util.inherits(Botly, EventEmitter);

Botly.prototype.router = function () {

    const router = Router();

    router.get(this.webHookPath, (req, res) => {
        if (req.query["hub.verify_token"] === this.verifyToken) {
            res.send(req.query["hub.challenge"]);
        } else {
            res.send("Error, wrong validation token");
        }
    });

    router.post(this.webHookPath, (req, res) => {
        res.sendStatus(200); //return 200 to facebook no matter what
        try {
            this.handleMessage(req);
        } catch (ex) {
            this.emit("error", ex);
        }
    });

    return router;
};

Botly.prototype.getUserProfile = function (userId, callback) {
    const USER_URL = `${FB_URL}${userId}`;

    request.get(
        {
            url: USER_URL,
            qs: {
                fields: "first_name,last_name,profile_pic,locale,timezone,gender",
                access_token: this.accessToken
            },
            json: true

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.setWelcomeScreen = function (pageId, message, callback) {
    const PAGE_URL = `${FB_URL}${pageId}/thread_settings`;

    request.post(
        {
            url: PAGE_URL,
            json: true,
            qs: {
                access_token: this.accessToken
            },
            body: {
                setting_type: "call_to_actions",
                thread_state: "new_thread",
                call_to_actions: [
                    {
                        message: message
                    }
                ]
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.send = function (recipientId, message, callback) {
    request.post(
        {
            url: FB_MESSENGER_URL,
            json: true,
            qs: {
                access_token: this.accessToken
            },
            body: {
                recipient: {id: recipientId},
                message: message,
                notification_type: this.notificationType
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.sendAttachment = function (recipientId, type, payload, callback) {
    this.send(recipientId, {
        attachment: {
            type: type,
            payload: payload
        }
    }, callback);
};

Botly.prototype.sendImage = function (recipientId, imageURL, callback) {
    this.sendAttachment(recipientId, ATTACHMENT_TYPE.IMAGE, {
        url: imageURL
    }, callback);
};

Botly.prototype.sendText = function (recipientId, text, callback) {
    this.send(recipientId, {
        text: text
    }, callback);
};

Botly.prototype.sendButtons = function (recipientId, text, buttons, callback) {
    this.sendAttachment(recipientId, ATTACHMENT_TYPE.TEMPLATE,
        this.createButtonTemplate(text, buttons), callback);
};

Botly.prototype.sendGeneric = function (recipientId, elements, callback) {
    this.sendAttachment(recipientId, ATTACHMENT_TYPE.TEMPLATE,
        this.createGenericTemplate(elements), callback);
};

Botly.prototype.sendReceipt = function (recipientId, payload, callback) {
    payload.template_type = TEMPLATE_TYPE.RECEIPT;
    this.sendAttachment(recipientId, ATTACHMENT_TYPE.TEMPLATE, payload, callback);
};

Botly.prototype.createWebURLButton = function (title, url) {
    return {
        type: BUTTON_TYPE.WEB_URL,
        title: title,
        url: url
    };
};

Botly.prototype.createPostbackButton = function (title, payload) {
    return {
        type: BUTTON_TYPE.POSTBACK,
        title: title,
        payload: payload
    };
};

Botly.prototype.createButtonTemplate = function (text, buttons) {
    if (!Array.isArray(buttons)) {
        buttons = [buttons];
    }
    return {
        template_type: TEMPLATE_TYPE.BUTTON,
        text: text,
        buttons: buttons
    };
};

Botly.prototype.createGenericTemplate = function (elements) {
    if (!Array.isArray(elements)) {
        elements = [elements];
    }
    return {
        template_type: TEMPLATE_TYPE.GENERIC,
        elements: elements
    };
};

Botly.prototype.createElement = function (title, itemURL, imageURL, subtitle, buttons) {
    if (buttons && !Array.isArray(buttons)) {
        buttons = [buttons];
    }
    return {
        title: title,
        item_url: itemURL,
        image_url: imageURL,
        subtitle: subtitle,
        buttons: buttons
    };
};

Botly.prototype.handleMessage = function (req) {
    const body = _clone(req.body);

    body.entry.forEach(entry => {
        entry.messaging.forEach(message => {
            _handleOptIn.call(this, message);
            _handleDelivery.call(this, message);
            _handlePostback.call(this, message);
            _handleUserMessage.call(this, message);
        }, this);
    }, this);
};

function _handleOptIn(message) {
    if (message.optin) {
        let optin = message.optin.ref;
        this.emit("optin", message.sender.id, message, optin);
    }
}

function _handleDelivery(message) {
    if (message.delivery) {
        let mids = message.delivery.mids;
        this.emit("delivery", message.sender.id, message, mids);
    }
}

function _handlePostback(message) {
    if (message.postback) {
        let postback = message.postback.payload;
        this.emit("postback", message.sender.id, message, postback);
    }
}

function _handleUserMessage(message) {
    var value;
    if (message.message && message.message.text) {
        value = {text: message.message.text};
    }

    if (message.message && message.message.attachments) {
        let attachments = {};
        message.message.attachments.forEach((attachment) => {
            attachments[attachment.type] = attachments[attachment.type] || [];
            attachments[attachment.type].push(attachment.payload.url || attachment.payload.coordinates);
        });
        value = {attachments: attachments};
    }

    if (value) {
        this.emit("message", message.sender.id, message, value);
    }
}

function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

Botly.CONST = {
    BUTTON_TYPE: BUTTON_TYPE,
    TEMPLATE_TYPE: TEMPLATE_TYPE,
    ATTACHMENT_TYPE: ATTACHMENT_TYPE,
    NOTIFICATION_TYPE: NOTIFICATION_TYPE
};

module.exports = Botly;
