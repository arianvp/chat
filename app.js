
/**
 * Module dependencies.
 */

var express = require('express');
var crypto = require('crypto');
var db = require('./database.js');
var app = module.exports = express();
var http = require('http');
var server = http.createServer(app);
var querystring = require('querystring');
var io = require('socket.io').listen(server);
var https = require('https');
//var eyes = require('eyes');
var async = require('async');
// Configuration


function requiresLogin(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    var err = new Error("Unauthorized");
    res.statusCode = 403;
    next(err);
  }
}
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'your secret here' }));
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);



});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.post('/login', function (request, response) {
  var data = querystring.stringify({
    audience: 'http://'+request.host+':3000',
    assertion: request.body.assertion
  });

  var options = {
    host: 'verifier.login.persona.org',
    path: '/verify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': data.length
    }
  };

  var vrequest = https.request(options, function (vresponse) {
    var text = "";
    vresponse.on('data', function (blob) {
      text += blob;
    });
    vresponse.on('end', function () {
      var user = JSON.parse(text);
      if (user.status === 'okay') {
        //request.session.uid = crypto.createHash('md5').update(user.email).digest('hex');
        request.session.email = user.email;
        response.json({email:request.session.email});
      
      } else {
        response.send(500, {error: 'ALLES IS KAPOT'});
      }
    });
  });

  vrequest.write(data);
  vrequest.end();

});

app.post('/logout', function (request, response) {
  request.session.email = undefined;
  response.end();
});



var Chats = db.collection('Chats');
app.get('/chats', requiresLogin, function (request, response) {
  Chats.find({participants: request.session.email})
    .toArray(function (err, result) {
    });
});

var a = {b:3};

var http = require('http');


app.get('/chats/:email', requiresLogin, function (request, response) {

});


var Users = db.collection('Users');

app.get('/contacts', requiresLogin, function (request, response){
    response.end("okay");
    return;
  Users.findOne({_id:request.session.email}, {contacts:1, _id:0},
    function(err, result) {
      console.log(err);
      var contacts = result.contacts;
      async.map(
        contacts,
        function (contact, cb) {
          Users.findOne({_id:contact}, function (err, result) {
            cb(err, result);
          });
        },
        function (err, results) {
          response.json(results);
      });
    });
});

app.get('/contacts/:email', requiresLogin, function (request, response) {
  Users.findOne({});
});

app.listen(3000);
console.log("Express server listening on port %s in %s mode", app.port, app.settings.env);
