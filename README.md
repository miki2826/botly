botly
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
    - [send (recipientId, message[, notificationType][, callback])](#send-recipientid-message-notificationtype-callback)
    - [sendText (recipientId, text[, notificationType][, callback])](#sendtext-recipientid-text-notificationtype-callback)
    - [sendAttachment (recipientId, type, payload[, notificationType][, callback])](#sendattachment-recipientid-type-payload-notificationtype-callback)
    - [sendImage (recipientId, imageURL[, notificationType][, callback])](#sendimage-recipientid-imageurl-notificationtype-callback)
    - [sendButtons (recipientId, text, buttons[, notificationType][, callback])](#sendbuttons-recipientid-text-buttons-notificationtype-callback)
    - [sendGeneric (recipientId, elements[, notificationType][, callback])](#sendgeneric-recipientid-elements-notificationtype-callback)
    - [sendReceipt (recipientId, payload[, notificationType][, callback])](#sendreceipt-recipientid-payload-notificationtype-callback)
    - [setWelcomeScreen (pageId, message[, callback])](#setwelcomescreen-pageid-message-callback)
    - [getUserProfile (userId[, callback])](#getuserprofile-userid-callback)
    - [createWebURLButton (title, url)](#createweburlbutton-title-url)
    - [createPostbackButton (title, payload)](#createpostbackbutton-title-payload)
    - [createButtonTemplate (text, buttons)](#createbuttontemplate-text-buttons)
    - [createGenericTemplate (elements)](#creategenerictemplate-elements)
    - [createElement (title, itemURL, imageURL, subtitle, buttons)](#createelement-title-itemurl-imageurl-subtitle-buttons)
    - [handleMessage (req)](#handlemessage-req)
  - [Events](#events)

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
    notificationType: Botly.CONST.REGULAR //already the default (optional)
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

#### send (recipientId, message[, notificationType][, callback])
```javascript
botly.send(userId, {
    text: "Hi There!"
}, function (err, data) {
        //log it
});
```

#### sendText (recipientId, text[, notificationType][, callback])
```javascript
botly.sendText(userId, "Hi There!", function (err, data) {
        //log it
});
```

#### sendAttachment (recipientId, type, payload[, notificationType][, callback])
```javascript
botly.sendAttachment(userId, Botly.CONST.ATTACHMENT_TYPE.IMAGE,
    {
        url: "http://example.com/image.png"
    }, function (err, data) {
        //log it
});
```

#### sendImage (recipientId, imageURL[, notificationType][, callback])
```javascript
botly.sendImage(userId, "http://example.com/image.png", function (err, data) {
        //log it
});
```

#### sendButtons (recipientId, text, buttons[, notificationType][, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
botly.sendButtons(userId, "What do you want to do next?", buttons
    , function (err, data) {
        //log it
});
```

#### sendGeneric (recipientId, elements[, notificationType][, callback])
```javascript
let buttons = [];
buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
buttons.push(botly.createPostbackButton("Continue", "continue"));
let element = botly.createElement("What do you want to do next?",
    "http://example.com", /*itemURL*/
    "http://example.com/image.png", /*imageURL*/
"Choose now!", buttons);
botly.sendGeneric(sender, element, function (err, data) {
    console.log("send generic cb:", err, data);
});
```

#### sendReceipt (recipientId, payload[, notificationType][, callback])
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
botly.sendReceipt(sender, payload, function (err, data) {
    console.log("send generic cb:", err, data);
});
```

#### setWelcomeScreen (pageId, message[, callback])
```javascript
botly.setWelcomeScreen("myPage", {
    text: "Welcome to my page!"
}, function (err, body) {
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

#### createButtonTemplate (text, buttons)
Where `buttons` can be a single button or an array of buttons.

#### createGenericTemplate (elements)
Where `elements` can be a single element or an array of elements.

#### createElement (title, itemURL, imageURL, subtitle, buttons)
Where `buttons` can be a single button or an array of buttons.

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
```
