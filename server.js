#!/usr/bin/env node

"use strict";

var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    key,
    app = express();

var INIT_KEY = Math.pow(10 * 36, 3);

mongoose.connect('mongodb://localhost/URL-Shortner');

var db = mongoose.connection;
db.on('error', function (err) {
console.log('connection error', err);
});
db.once('open', function () {
console.log('connected.');
});

var urlSchema = mongoose.Schema({
    short: String,
    long: String,
    view: Number
});

var url = mongoose.model('url', urlSchema);


app.use(express.static(__dirname + "/public"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
function key() {
    var incr = Math.floor((Math.random() * 10) + 1);
    INIT_KEY += incr;
    var value = INIT_KEY;
    return value.toString(36);
}

app.post("/geturl", function (req, res) {
	var posturl = req.body.url0;
	var index = posturl.indexOf('localhost:3000');
	if(index > -1)
	{
		url.findOne({ short: posturl}, function (err, original){
			if (err) return console.error(err);

			else if(original === null){
				console.log("URL does not exist in the database");
				return;
			}
			else {
				res.json({"url":original.long});
			}
		});
	}
	else
	{
		
		posturl = "https://" + posturl;
		url.findOne({long: posturl}, function(err, shorten){
			if (err) return console.error(err);
			
			else if(shorten === null){
				var shorturl = "localhost:3000/" + key();
				var urlentry = new url;
                                urlentry.short = shorturl;
				urlentry.long = posturl;
				urlentry.view = 0;
				
				urlentry.save(function (err, urlentry) {
				  if (err) return console.error(err);
				});
				console.log(shorturl);
				res.json({"url":shorturl});
			}
			else{
				res.json({"url":shorten.short});
			}
		});
	}
});

app.get("/:url", function (req, res){
	var shorturl = req.params.url;
	var valueincr = 1,
	    orignalurl;

	shorturl = "localhost:3000/" + shorturl;
	url.findOne({ short: shorturl}, function (err, original){
		if (err) return console.error(err);

		else if(original === null){
			console.log("URL does not exist in the database");
			return;
		}
		else {
			orignalurl = original.long;
			original.view = original.view + valueincr;
			original.save(function (err, urlentry) {
				if (err) return console.error(err);
				});
			res.redirect(orignalurl);
		}
	});

});

app.post("/getList", function (req, res){
	url.aggregate([{$sort: {'view': -1}}, {$limit: 10}], function(err, count){
		if (err) return console.error(err);				
		res.json(count);
	});
});

var server = app.listen(3000),
    address = server.address();
console.log("Server is listening at http://localhost:" + address.port + "/");
