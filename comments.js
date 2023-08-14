// Create web server
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db.js');
var template = require('./lib/template.js');
var cookie = require('cookie');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var shortid = require('shortid');
var bcrypt = require('bcrypt');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url,true).query;
    var pathname = url.parse(_url,true).pathname;
    var title = queryData.id;
    var filteredId = path.parse(title).base;
    var control = '';

    if(pathname === '/'){
        if(queryData.id === undefined){
            db.query(`SELECT * FROM topic`, function(error, topics){
                title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        } else {
            db.query(`SELECT * FROM topic`, function(error, topics){
                if(error){
                    throw error;
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,[filteredId], function(error2, topic){
                    if(error2){
                        throw error2;
                    }
                    console.log(topic);
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.HTML(title, list,
                        `
                        <h2>${sanitizeHtml(title)}</h2>
                        ${sanitizeHtml(description)}
                        <p>by ${sanitizeHtml(topic[0].name)}</p>
                        `,
                        ` <a href="/create">create</a>
                          <a href="/update?id=${topic[0].id}">update</a>
                          <form action