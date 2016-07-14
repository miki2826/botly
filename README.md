<img src="https://raw.githubusercontent.com/Askrround/botly/master/botly_logo.png" width="250" height="250" />
---------
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/Askrround/botly.svg)](https://travis-ci.org/Askrround/botly)
[![Test Coverage](https://codeclimate.com/github/Askrround/botly/badges/coverage.svg)](https://codeclimate.com/github/Askrround/botly/coverage)
[![npm version](https://badge.fury.io/js/botly.svg)](http://badge.fury.io/js/botly)
[![Dependency Status](https://david-dm.org/Askrround/botly.svg?theme=shields.io)](https://david-dm.org/Askrround/botly)
[![devDependency Status](https://david-dm.org/Askrround/botly/dev-status.svg?theme=shields.io)](https://david-dm.org/Askrround/botly#info=devDependencies)
[![npm downloads](https://img.shields.io/npm/dm/botly.svg)](https://img.shields.io/npm/dm/botly.svg)
[![license](https://img.shields.io/npm/l/botly.svg)](LICENSE)
[![NPM](https://nodei.co/npm/botly.png)](https://nodei.co/npm/botly/)

> Simple Facebook Messenger Platform Bot API

  - [Install](#install)
  - [Example](#example)
  - [API](#api)
    - [send (options[, callback])](#send-options-callback)
    - [sendText (options[, callback])](#sendtext-options-callback)
    - [sendAttachment (options[, callback])](#sendattachment-options-callback)
    - [sendImage (options[, callback])](#sendimage-options-callback)
    - [sendButtons (options[, callback])](#sendbuttons-options-callback)
    - [sendGeneric (options[, callback])](#sendgeneric-options-callback)
    - [sendAction (options[, callback])](#sendaction-options-callback)
    - [sendReceipt (options[, callback])](#sendreceipt-options-callback)
    - [setGetStarted (options[, callback])](#setgetstarted-options-callback)
    - [setPersistentMenu (options[, callback])](#setpersistentmenue-options-callback)
    - [getUserProfile (userId[, callback])](#getuserprofile-userid-callback)
    - [createWebURLButton (title, url)](#createweburlbutton-title-url)
    - [createPostbackButton (title, payload)](#createpostbackbutton-title-payload)
    - [createQuickReply (title, payload)](#createquickreply-title-payload)
    - [createButtonTemplate (text, buttons)](#createbuttontemplate-text-buttons)
    - [createGenericTemplate (elements)](#creategenerictemplate-elements)
    - [handleMessage (req)](#handlemessage-req)
  - [Events](#events)
  - [Change Log](#change-log)
    - [version 1.0.0](#version-100)

### Install
`npm i botly --save`

### Example
```javascript
const express = require("express");
const Botly = require("botly");
const botly = new Botly({
    accessToken: pageAccessToken, //page access token provided by facebook
    verifyToken: verificationToken, //needed when using express - the verification token you provided when defining the webhook in facebook
    webHookPath: yourWebHookPath, //defaults to "/",
    notificationType: Botly.CONST.REGULAR //already the default (optional),
});

botly.on("message", (senderId, message, data) => {
    let text = `echo: ${data.text}`;

    botly.sendText(senderId, text);
});

const app = express();
app.use("/webhook", botly.router());
app.listen(3000);
```

You can also clone the repository and run a complete bot example from the `example` folder.

### API

#### send (options[, callback])
```javascript
botly.send({
    id: userId,
    message: {text: "Hi There!"}
}, function (err, data) {
        //log it
});
```

#### sendText (options[, callback])
```javascript
botly.sendText({id: userId, text: "Hi There!"}, function (err, data) {
        //log it
});
```

#### sendAttachment (options[, callback])
```javascript
botly.sendAttachment({
    id: userId,
    type: Botly.CONST.ATTACHMENT_TYPE.IMAGE,
    payload: {url: "http://example.com/image.png"}
}, function (err, data) {
        //log it
});
```

#### sendImage (options[, callback])
```javascript
botly.sendImage({id: userId, url: "http://example.com/image.png"}, function (err, data) {
        //log it
});
```

#### sendButtons (options[, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
botly.sendButtons({id: userId, text: "What do you want to do next?", buttons: buttons}
    , function (err, data) {
        //log it
});
```

#### sendGeneric (options[, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
let element = {
  title: "What do you want to do next?",
  item_url: "http://example.com",
  image_url: "http://example.com/image.png",
  subtitle: "Choose now!",
  buttons: buttons
}
botly.sendGeneric({id: userId, elements: element}, function (err, data) {
    console.log("send generic cb:", err, data);
});
```

#### sendAction (options[, callback])
```javascript
botly.sendAction({id: userId, action: Botly.CONST.ACTION_TYPES.TYPING_ON}, function (err, data) {
        //log it
});
```

#### sendReceipt (options[, callback])
```javascript
let payload = {
    "recipient_name": "Stephane Crozatier",
    "order_number": "12345678902",
    "currency": "USD",
    "payment_method": "Visa 2345",
    "order_url": "http://petersapparel.parseapp.com/order?order_id=123456",
    "timestamp": "1428444852",
    "elements": [
        {
            "title": "Classic White T-Shirt",
            "subtitle": "100% Soft and Luxurious Cotton",
            "quantity": 2,
            "price": 50,
            "currency": "USD",
            "image_url": "http://petersapparel.parseapp.com/img/whiteshirt.png"
        },
        {
            "title": "Classic Gray T-Shirt",
            "subtitle": "100% Soft and Luxurious Cotton",
            "quantity": 1,
            "price": 25,
            "currency": "USD",
            "image_url": "http://petersapparel.parseapp.com/img/grayshirt.png"
        }
    ],
    "address": {
        "street_1": "1 Hacker Way",
        "street_2": "",
        "city": "Menlo Park",
        "postal_code": "94025",
        "state": "CA",
        "country": "US"
    },
    "summary": {
        "subtotal": 75.00,
        "shipping_cost": 4.95,
        "total_tax": 6.19,
        "total_cost": 56.14
    },
    "adjustments": [
        {
            "name": "New Customer Discount",
            "amount": 20
        },
        {
            "name": "$10 Off Coupon",
            "amount": 10
        }
    ]
};
botly.sendReceipt({id: sender, payload: payload}, function (err, data) {
    console.log("send generic cb:", err, data);
});
```

#### setGetStarted (options[, callback])
```javascript
botly.setGetStarted({pageId: "myPage", payload: "GET_STARTED_CLICKED"}, function (err, body) {
    //log it
});
```

#### setPersistentMenu (options[, callback])
```javascript
botly.setPersistentMenu({pageId: "myPage", buttons: [botly.createPostbackButton('reset', 'reset_me')]}, function (err, body) {
    //log it
});
```

#### getUserProfile (userId[, callback])
```javascript
botly.getUserProfile(senduserIder, function (err, info) {
    //cache it
});
```

#### createWebURLButton (title, url)

#### createPostbackButton (title, payload)

#### createQuickReply (title, payload)
`sendAttachment` and `sendText` both support optional `quick_replies`

#### createButtonTemplate (text, buttons)
Where `buttons` can be a single button or an array of buttons.

#### createGenericTemplate (elements)
Where `elements` can be a single element or an array of elements.

#### handleMessage (req)
If you are not using express, you can use this function to parse the request from facebook in order to generate the proper events.
`req` should have a body property.

### Events
```javascript
botly.on("message", (sender, message, data) => {
    /**
     * where data can be a text message or an attachment
     * data = {
     *   text: "text entered by user"
     * }
     * OR
     * data = {
     *   attachments: {
     *       image: ["imageURL1", "imageURL2"],
     *       video: ["videoURL"],
     *       audio: ["audioURL1"],
     *       location: [{coordinates}]
     *   }
     * }
     */
});

botly.on("postback", (sender, message, postback) => {
    /**
     * where postback is the postback payload
     */
});

botly.on("delivery", (sender, message, mids) => {
    /**
     * where mids is an array of mids
     */
});

botly.on("optin", (sender, message, optin) => {
    /**
     * where optin is the ref pass through param
     */
});

botly.on("error", (ex) => {
    /* handle exceptions */
});

botly.on("sent", (to, message) => {
    /* track it */
});
```

### Change Log

#### version 1.1.0
- added support for sender actions using `sendAction` (mark seen/ typing on/ typing off)

#### version 1.0.3
- added send event - useful for tracking

#### version 1.0.1
- quick replies are considered as postback and not regular message

#### version 1.0.0
- removed `createTemplate` function - was too verbose
- moved to object parameters - too many parameters
- added support for quick replies
- add support for persistent menu
- added support for audio/video/file attachments
- renamed setWelcomeScreen to setGetStarted since no longer supported by facebook.
