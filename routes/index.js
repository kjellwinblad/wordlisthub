var express = require('express');
var passwordless = require('passwordless');
var _ = require("underscore");
var router = express.Router();
var crypto = require('crypto');

var users = {}

/* GET home page. */
router.get('/', function(req, res) {
    if(req.user!== undefined){console.log(req.user[0]);}
    console.log({ha:"asd"});
    console.log(users[req.user]);
    console.log([]);
    res.render('index', { title: 'WordListHub.com', user: users[req.user] });
});

router.post('/wordlists/remove/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.remove({_id: id});
    res.location("/public_wordlists");
    res.redirect("/public_wordlists");
});

router.post('/wordlists/:id/editword/:position', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    var wordAlternatives = [];
    var wordNr = 1;
    while(req.body["word" + wordNr] !== undefined){
        wordAlternatives.push(req.body["word" + wordNr]);
        wordNr = wordNr + 1;
    }
    console.log(wordAlternatives, req.body);
    var explanation = req.body.explanation;
    var position = Math.round(req.params.position);
    collection.findById(id,function(e,wordList){
        wordList.words[position] = {word:wordAlternatives, explanation:explanation};
        var promise = collection.update({_id:id}, wordList);
        promise.on('success', function(){
            res.location("/wordlists/" + id);
            res.redirect("/wordlists/" + id);
        });
    });
});

router.post('/wordlists/:id/addword', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    var wordAlternatives = [];
    var wordNr = 1;
    while(req.body["word" + wordNr] !== undefined){
        wordAlternatives.push(req.body["word" + wordNr]);
        wordNr = wordNr + 1;
    }
    var explanation = req.body.explanation;
    console.log(id, wordAlternatives, explanation);
    collection.findById(id,function(e,wordList){
        wordList.words.push({
            word: wordAlternatives,
            explanation: explanation
        });
        var promise = collection.update({_id:id}, wordList);
        promise.on('success', function(){
            res.location("/wordlists/" + id);
            res.redirect("/wordlists/" + id);
        });
    });
});


router.post('/wordlists/:id/makepublicprivate', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findById(id,function(e,wordList){
        if(wordList['isPublic'] === undefined){
            wordList['isPublic'] = true;
        }else{
            wordList['isPublic'] = !wordList['isPublic'];
        }
        var promise = collection.update({_id:id}, wordList);
        promise.on('success', function(){
            res.location("/wordlists/" + id);
            res.redirect("/wordlists/" + id);
        });
    });
});


router.post('/wordlists/:id/removeword/:position', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    var position = req.params.position
    collection.findById(id,function(e,wordList){
        console.log("before",wordList.words);
        wordList.words.splice(position, 1);
        console.log("after",wordList.words);
        var promise = collection.update({_id:id}, wordList);
        promise.on('success', function(){
            res.location("/wordlists/" + id);
            res.redirect("/wordlists/" + id);
        });
    });
});

router.get('/wordlists/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    collection.findById(id,function(e,wordList){
        _.each(wordList.words, function(word){
            word.jsonString = JSON.stringify(word)
        });
        console.log(wordList)
        res.render('wordlist', {
            "wordList" : wordList,
            user: users[req.user]
        });
    });
});

router.get('/wordlists',
           function(req, res) {
    var db = req.db;
    console.log(db);
    var collection = db.get('wordLists');
    console.log(collection);
    collection.find({owner:req.user},{},function(e,docs){
        console.log(e);
        console.log(docs);
        res.render('wordlists', {
            "wordLists" : docs,
            user: users[req.user] 
        });
    });
});


router.get('/public_wordlists',
           function(req, res) {
    var db = req.db;
    console.log(db);
    var collection = db.get('wordLists');
    collection.find({ isPublic: true },{},function(e,docs){
        res.render('public_wordlists', {
            "wordLists" : docs,
            user: req.user 
        });
    });
});

router.post('/addwordlist', function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var name = req.body.name;

    if(name.length === 0){
        res.send("The name has length 0.");
    }

    // Set our collection
    var collection = db.get('wordLists');

    // Submit to the DB
    collection.insert({name: name,
                       owner: req.user, 
                       source:"",
                       target: "",
                       words:[]}, function (err, doc) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.location("wordlists");
            res.redirect("wordlists");
        }
    });
});


router.get('/wordlists/:id/guessword', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findById(id,function(e,wordList){
        res.render('guessword', {
            "wordList" : JSON.stringify(wordList),
            user: users[req.user] 
        });
    });
});


router.get('/wordlists/:id/spellword', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findById(id,function(e,wordList){
        res.render('spellword', {
            "wordList" : JSON.stringify(wordList),
            user: users[req.user] 
        });
    });
});




/* GET login screen. */
router.get('/login', function(req, res) {
  res.redirect('/');
});

/* GET logout. */
router.get('/logout', passwordless.logout(),
	function(req, res) {
  res.redirect('/');
});

/* POST login screen. */
router.post('/sendtoken', 
	    passwordless.requestToken(
		// Simply accept every user
	        function(user, delivery, callback) {
		    callback(null, user);
                    users[user] =
                        {email: user,
                         gravatar:'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(user).digest("hex") + '?&d=retro'};
			// usually you would want something like:
			// User.find({email: user}, callback(ret) {
			// 		if(ret)
			// 			callback(null, ret.id)
			// 		else
			// 			callback(null, null)
			// })
		}),
	function(req, res) {
  		res.render('sent');
});

module.exports = router;
