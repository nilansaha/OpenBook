var express = require('express');
var app = express();
var nunjucks = require('nunjucks');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var nl2br = require('nl2br');
var striptags = require('striptags');

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect('mongodb://localhost/openbook');
var postsSchema = mongoose.Schema({
    title: String,
    body: String
});

var post = mongoose.model('Posts', postsSchema);

var PATH_TO_TEMPLATES = './views/' ;
nunjucks.configure( PATH_TO_TEMPLATES, {
    autoescape: true,
    express: app
});

app.use(express.static('./static/'));

app.get('/', function(req, res) {
  post.find({}, function(err, posts) {
    for (var i = 0; i < posts.length; i++) {
      posts[i].body = striptags(posts[i].body);
    }
    res.render('index.html', {posts: posts});
  }).sort({_id:-1});
});

app.get('/blog/:id', function(req, res) {
  post.find({ _id: req.params.id}, function(err, post) {
    if (!err) {
      res.render('blog.html', {title: post[0].title, body: post[0].body});
    } else {
      res.send("Blog doesnt exist");
    }
  });
});

app.get('/admin', function(req, res) {
  res.render('admin.html');
});

app.post('/admin', function(req, res) {
  title = req.body.title;
  body = req.body.body;
  if (title && body) {
    body = nl2br(body);
    var newPost = new post({
        title: title,
        body: body
    });
    newPost.save();
    res.send("Submitted");
  } else {
    res.send("Please fill the required fields");
  }
});

app.listen(5000, function() {
  console.log('Server is up and runnning...');
});
