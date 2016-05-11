botly
---------
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![Build Status](https://travis-ci.com/Askrround/botly.svg?token=d9DyBzKtc6v8W4BUJ1pp&branch=master)](https://travis-ci.com/Askrround/botly)
[![npm version](https://badge.fury.io/js/botly.svg)](http://badge.fury.io/js/botly)
[![Dependency Status](https://david-dm.org/Askrround/botly.svg?theme=shields.io)](https://david-dm.org/Askrround/botly)
[![devDependency Status](https://david-dm.org/Askrround/botly/dev-status.svg?theme=shields.io)](https://david-dm.org/Askrround/botly#info=devDependencies)
[![npm downloads](https://img.shields.io/npm/dm/botly.svg)](https://img.shields.io/npm/dm/botly.svg)
[![NPM](https://nodei.co/npm/batchelorjs.png)](https://nodei.co/npm/botly/)

> Simple Facebook Messenger Platform Bot API

## Install
`npm i botly --save`

## Example
```javascript
const express = require("express");
const Botly = require("botly");
const botly = new Botly({
    accessToken: pageAccessToken, //page access token provided by facebook
    verifyToken: verificationToken, //needed when using express - the verification token you provided when defining the webhook in facebook
    webHookPath: yourWebHookPath, //defaults to "/",
    notificationType: Botly.CONST.REGULAR //already the default (optional)
});

botly.on('message', (senderId, message, data) => {
    let text = `echo: ${data.text}`;

    botly.sendText(senderId, text);
});

const app = express();
app.use('/webhook', botly.router());
app.listen(3000);
```

## API

## Events
```javascript
botly.on('message', (sender, message, data) => {
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

botly.on('postback', (sender, message, postback) => {
    /**
     * where postback is the postback payload
     */
});

botly.on('delivery', (sender, message, mids) => {
    /**
     * where mids is an array of mids
     */
});

botly.on('optin', (sender, message, optin) => {
    /**
     * where optin is the ref pass through param
     */
});

botly.on('error', (ex) => {
    /* handle exceptions */
});
```
