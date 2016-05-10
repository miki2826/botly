botly
---------
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![Build Status](https://travis-ci.org/Askrround/botly.svg)](https://travis-ci.org/Askrround/botly)
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
app.use('/webhook', bot.router());
app.listen(3000);
```
