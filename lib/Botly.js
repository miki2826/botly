'use strict';

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const Router = require('express').Router;
const FB_URL = 'https://graph.facebook.com/v2.6/';
const FB_MESSENGER_URL = `${FB_URL}/me/messages`;

const BUTTON_TYPE = {
    POSTBACK: 'postback',
    WEB_URL: 'web_url',
    ACCOUNT_LINK: 'account_link',
    SHARE: 'element_share'
};

const TEMPLATE_TYPE = {
    BUTTON: 'button',
    RECEIPT: 'receipt',
    GENERIC: 'generic'
};

const ATTACHMENT_TYPE = {
    IMAGE: 'image',
    FILE: 'file',
    VIDEO: 'video',
    AUDIO: 'audio',
    TEMPLATE: 'template'
};

const NOTIFICATION_TYPE = {
    REGULAR: 'REGULAR',
    SILENT_PUSH: 'SILENT_PUSH',
    NO_PUSH: 'NO_PUSH'
};

const CONTENT_TYPE = {
    TEXT: 'text',
    LOCATION: 'location'
};

const ACTION_TYPES = {
    MARK_SEEN: 'mark_seen',
    TYPING_ON: 'typing_on',
    TYPING_OFF: 'typing_off',
};

const WEBVIEW_HEIGHT_RATIO = {
    FULL: 'full',
    TALL: 'tall',
    COMPACT: 'compact'
};

function Botly(options) {
    if (!(this instanceof Botly)) {
        return new Botly(options);
    }

    if (!options || !options.accessToken) {
        throw new Error('Must provide accessToken');
    }
    this.accessToken = options.accessToken;
    this.verifyToken = options.verifyToken;
    this.webHookPath = options.webHookPath || '/';
    this.notificationType = options.notificationType || NOTIFICATION_TYPE.REGULAR;
    EventEmitter.call(this);
}

util.inherits(Botly, EventEmitter);

Botly.prototype.router = function () {

    const router = Router();

    router.get(this.webHookPath, (req, res) => {
        if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === this.verifyToken) {
            res.send(req.query['hub.challenge']);
        } else {
            res.status(403).send('Error, wrong validation token');
        }
    });

    router.post(this.webHookPath, (req, res) => {
        res.sendStatus(200); //return 200 to facebook no matter what
        try {
            this.handleMessage(req);
        } catch (ex) {
            this.emit('error', ex);
        }
    });

    return router;
};

Botly.prototype.getPSID = function (options, callback) {
    let accountLinkingToken = options;
    if (typeof options === 'object') {
        accountLinkingToken = options.token;
    }
    const USER_URL = `${FB_URL}me`;

    request.get(
        {
            url: USER_URL,
            qs: {
                fields: 'recipient',
                account_linking_token: accountLinkingToken,
                access_token: this.accessToken || options.accessToken
            },
            json: true

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.getUserProfile = function (options, callback) {
    let userId = options;
    if (typeof options === 'object') {
        userId = options.id;
    }
    const USER_URL = `${FB_URL}${userId}`;

    request.get(
        {
            url: USER_URL,
            qs: {
                fields: 'first_name,last_name,profile_pic,locale,timezone,gender',
                access_token: this.accessToken || options.accessToken
            },
            json: true

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.setGetStarted = function (options, callback) {
    const PAGE_URL = `${FB_URL}${options.pageId}/thread_settings`;

    request.post(
        {
            url: PAGE_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                setting_type: 'call_to_actions',
                thread_state: 'new_thread',
                call_to_actions: [
                    {
                        payload: options.payload
                    }
                ]
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.setGreetingText = function (options, callback) {
    const PAGE_URL = `${FB_URL}${options.pageId}/thread_settings`;

    request.post(
        {
            url: PAGE_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                setting_type: 'greeting',
                "greeting":{
                    "text": options.text
                }
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.setPersistentMenu = function (options, callback) {
    const PAGE_URL = `${FB_URL}${options.pageId}/thread_settings`;

    request.post(
        {
            url: PAGE_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                setting_type: 'call_to_actions',
                thread_state: 'existing_thread',
                call_to_actions: options.buttons
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.setWhiteList = function (options, callback) {
    const PAGE_URL = `${FB_URL}${options.pageId}/thread_settings`;

    request.post(
        {
            url: PAGE_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                setting_type: 'domain_whitelisting',
                whitelisted_domains: options.whiteList,
                domain_action_type: options.actionType || 'add'
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.send = function (options, callback) {
    options.notificationType = options.notificationType || this.notificationType;
    request.post(
        {
            url: FB_MESSENGER_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                recipient: {id: options.id},
                message: options.message,
                notification_type: options.notificationType
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
    this.emit('sent', options.id, options.message);
};

Botly.prototype.sendAction = function (options, callback) {
    request.post(
        {
            url: FB_MESSENGER_URL,
            json: true,
            qs: {
                access_token: this.accessToken || options.accessToken
            },
            body: {
                recipient: {id: options.id},
                sender_action: options.action
            }

        }, (err, res, body) => {
            if (callback) {
                callback(err, body);
            }
        });
};

Botly.prototype.sendAttachment = function (options, callback) {
    options.message = options.message || {
            attachment: {
                type: options.type,
                payload: options.payload
            }
        };
    if (options.quick_replies) {
        options.message.quick_replies = options.quick_replies;
    }
    this.send(options, callback);
};

Botly.prototype.sendImage = function (options, callback) {
    options.payload = options.payload || {
            url: options.url,
        };
    if (options.is_reusable) {
        options.payload.is_reusable = options.is_reusable;
    }
    options.type = ATTACHMENT_TYPE.IMAGE;
    this.sendAttachment(options, callback);
};

Botly.prototype.sendText = function (options, callback) {
    options.message = options.message || {
            text: options.text
        };
    if (options.quick_replies) {
        options.message.quick_replies = options.quick_replies;
    }
    this.send(options, callback);
};

Botly.prototype.sendButtons = function (options, callback) {
    options.payload = this.createButtonTemplate(options.text, options.buttons);
    options.type = ATTACHMENT_TYPE.TEMPLATE;
    this.sendAttachment(options, callback);
};

Botly.prototype.sendGeneric = function (options, callback) {
    options.payload = this.createGenericTemplate(options.elements);
    options.type = ATTACHMENT_TYPE.TEMPLATE;
    this.sendAttachment(options, callback);
};

Botly.prototype.sendReceipt = function (options, callback) {
    options.payload.template_type = TEMPLATE_TYPE.RECEIPT;
    options.type = ATTACHMENT_TYPE.TEMPLATE;
    this.sendAttachment(options, callback);
};

Botly.prototype.createWebURLButton = function (title, url, heightRatio, supportExtension, fallbackURL) {
    let button = {
        type: BUTTON_TYPE.WEB_URL,
        title: title,
        url: url
    };
    if (heightRatio) {
        button.webview_height_ratio = heightRatio;
    }
    if (supportExtension) {
        button.messenger_extensions = supportExtension;
    }
    if (fallbackURL) {
        button.fallback_url = fallbackURL;
    }
    return button;
};

Botly.prototype.createAccountLinkButton = function (url) {
    return {
        type: BUTTON_TYPE.ACCOUNT_LINK,
        url: url
    };
};

Botly.prototype.createShareButton = function () {
    return {
        type: BUTTON_TYPE.SHARE,
    };
};

Botly.prototype.createPostbackButton = function (title, payload) {
    return {
        type: BUTTON_TYPE.POSTBACK,
        title: title,
        payload: payload
    };
};

Botly.prototype.createQuickReply = function (title, payload, imageURL) {
    let reply = {
        'content_type': CONTENT_TYPE.TEXT,
        'title': title,
        'payload': payload,
    };
    if (imageURL) {
        reply.image_url = imageURL;
    }
    return reply;
};

Botly.prototype.createShareLocation = function () {
    return {
        'content_type': CONTENT_TYPE.LOCATION,
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

Botly.prototype.handleMessage = function (req) {
    const body = _clone(req.body);

    this.emit('complete_message', body);
    body.entry.forEach(entry => {
        entry.messaging.forEach(message => {
            _handleOptIn.call(this, message);
            _handleDelivery.call(this, message);
            _handlePostback.call(this, message);
            _handleAccountLinking.call(this, message);
            _handleUserMessage.call(this, message);
            _handleEcho.call(this, message);
        }, this);
    }, this);
};

function _handleOptIn(message) {
    if (message.optin) {
        let optin = message.optin.ref;
        this.emit('optin', message.sender.id, message, optin);
    }
}

function _handleDelivery(message) {
    if (message.delivery) {
        let mids = message.delivery.mids;
        this.emit('delivery', message.sender.id, message, mids);
    }
}

function _handlePostback(message) {
    if (message.postback || (message.message && !message.message.is_echo && message.message.quick_reply)) {
        let postback = (message.postback && message.postback.payload) || message.message.quick_reply.payload;
        this.emit('postback', message.sender.id, message, postback);
    }
}

function _handleAccountLinking(message) {
    if (message.account_linking) {
        let link = message.account_linking;
        this.emit('account_link', message.sender.id, message, link);
    }
}

function _handleUserMessage(message) {
    var value;
    if (message.message && !message.message.is_echo && message.message.text && !message.message.quick_reply) {
        value = {text: message.message.text};
    }

    if (message.message && !message.message.is_echo && message.message.attachments) {
        let attachments = {};
        message.message.attachments.forEach((attachment) => {
            if (attachment.type && attachment.payload) {
                attachments[attachment.type] = attachments[attachment.type] || [];
                attachments[attachment.type].push(attachment.payload.url || attachment.payload.coordinates);
            }
        });
        value = {attachments: attachments};
    }

    if (value) {
        this.emit('message', message.sender.id, message, value);
    }
}

function _handleEcho(message) {
    if (message.message && message.message.is_echo) {
        this.emit('echo', message.sender.id, message, message.message);
    }
}

function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

Botly.CONST = {
    BUTTON_TYPE: BUTTON_TYPE,
    TEMPLATE_TYPE: TEMPLATE_TYPE,
    ATTACHMENT_TYPE: ATTACHMENT_TYPE,
    NOTIFICATION_TYPE: NOTIFICATION_TYPE,
    ACTION_TYPES: ACTION_TYPES,
    CONTENT_TYPE: CONTENT_TYPE,
    WEBVIEW_HEIGHT_RATIO: WEBVIEW_HEIGHT_RATIO
};

module.exports = Botly;
