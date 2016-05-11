#!/usr/bin/env node

"use strict";
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');

const port = '3000';

const Botly = require("botly");
const botly = new Botly({
    verifyToken: "this_is_a_token",
    accessToken: "<YOUR_ACCESS_TOKEN>"
});

var app = express();

var users = {};

botly.on('message', (sender, message, data) => {
    let text = `echo: ${data.text}`;

    if (users[sender]) {
        if (data && data.text.indexOf("image") !== -1) {
            botly.sendImage(sender, "https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg", function (err, whatever) {
                console.log(err);
            });
        }
        else if (data && data.text.indexOf("buttons") !== -1) {
            let buttons = [];
            buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
            buttons.push(botly.createPostbackButton("Continue", "continue"));
            botly.sendButtons(sender, "What do you want to do next?", buttons, function (err, data) {
                console.log("send buttons cb:", err, data);
            });
        }
        else if (data && data.text.indexOf("generic") !== -1) {
            let buttons = [];
            buttons.push(botly.createWebURLButton("Go to Askrround", "http://askrround.com"));
            buttons.push(botly.createPostbackButton("Continue", "continue"));
            let element = botly.createElement("What do you want to do next?",
                "https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg",
                "https://upload.wikimedia.org/wikipedia/en/9/93/Tanooki_Mario.jpg",
                "Choose now!", buttons);
            botly.sendGeneric(sender, element, function (err, data) {
                console.log("send generic cb:", err, data);
            });
        }
        else if (data && data.text.indexOf("receipt") !== -1) {
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
        }
        else {
            botly.send(sender, {
                text: `Sorry ${users[sender].last_name}, you are annoying `
            }, function (err, data) {
                console.log("regular send cb:", err, data);
            });
        }
    }
    else {
        botly.getUserProfile(sender, function (err, info) {
            users[sender] = info;

            botly.sendText(sender, text + users[sender].first_name, function (err, data) {
                console.log("send text cb:", err, data);
            });
        });
    }
});

botly.on('postback', (sender, message, postback) => {
    console.log("postback:", sender, message, postback);
});

botly.on('delivery', (sender, message, mids) => {
    console.log("delivery:", sender, message, mids);
});

botly.on('optin', (sender, message, optin) => {
    console.log("optin:", sender, message, optin);
});

botly.on('error', (ex) => {
    console.log("error:", ex);
});

botly.setWelcomeScreen("mikitestapp", {text: "What's upppppppppp?????!!!!"}, function (err, body) {
    console.log("welcome cb:", err, body);
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/webhook', botly.router());
app.set('port', port);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

const server = http.createServer(app);

server.listen(port);

