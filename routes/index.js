var express = require('express');
var passwordless = require('passwordless');
var _ = require("underscore");
var router = express.Router();
var crypto = require('crypto');

var users = {}

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', { title: 'WordListHub.com', user: users[req.user] });
});

router.post('/wordlists/remove/:id', passwordless.restricted(),
            function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList == undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            var promise = collection.remove({_id: id});
            res.location("/wordlists");
            res.redirect("/wordlists");
        }
    });
});

router.post('/wordlists/:id/editword/:position', passwordless.restricted(),
            function(req, res) {
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
    var position = Math.round(req.params.position);
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList == undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            wordList.words[position] = {word:wordAlternatives, explanation:explanation};
            var promise = collection.update({_id:id}, wordList).then(function(){
                res.location("/wordlists/" + id);
                res.redirect("/wordlists/" + id);
            });
        }
    });
});

router.post('/wordlists/:id/addword', passwordless.restricted(),
            function(req, res) {
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
    collection.findOne({_id:id}).then(function(wordList){
        console.log("SUCCESS", wordList);
        if(wordList === undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            console.log("EDIT", wordList);
            wordList.words.push({
                word: wordAlternatives,
                explanation: explanation
            });
            var promise = collection.update({_id:id}, wordList).then(function(){
                console.log("success");
                res.location("/wordlists/" + id);
                res.redirect("/wordlists/" + id);
            });
            console.log("PUSH");
        }
    });
                console.log("REACG END");
});


router.post('/wordlists/:id/makepublicprivate', passwordless.restricted(),
            function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList === undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            if(wordList['isPublic'] === undefined){
                wordList['isPublic'] = true;
            }else{
                wordList['isPublic'] = !wordList['isPublic'];
            }
            var promise = collection.update({_id:id}, wordList).then(function(){
                res.location("/wordlists/" + id);
                res.redirect("/wordlists/" + id);
            });
        }
    });
});


router.post('/wordlists/:id/removeword/:position', passwordless.restricted(),
            function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    var position = req.params.position
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList === undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            wordList.words.splice(position, 1);
            var promise = collection.update({_id:id}, wordList).then(function(){
                res.location("/wordlists/" + id);
                res.redirect("/wordlists/" + id);
            });
        }
    });
});

router.get('/wordlists/:id', passwordless.restricted(),
           function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList === undefined || (wordList !== undefined && wordList.owner !== req.user)){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            _.each(wordList.words, function(word){
                word.jsonString = JSON.stringify(word)
            });
            res.render('wordlist', {
                "wordList" : wordList,
                user: users[req.user]
            });
        }
    });
});


router.get('/wordlists/view/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList === undefined){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            _.each(wordList.words, function(word){
                word.jsonString = JSON.stringify(word)
            });
            res.render('wordlistview', {
                "wordList" : wordList,
                user: users[req.user]
            });
        }
    });
});


router.get('/wordlists/record/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id
    collection.findOne({_id:id}).then(function(wordList){
        if(wordList === undefined){
            res.location("/public_wordlists");
            res.redirect("/public_wordlists");
        }else{
            _.each(wordList.words, function(word){
                word.jsonString = JSON.stringify(word)
            });
            res.render('wordlistrecorder', {
                "wordList" : wordList,
                user: users[req.user]
            });
        }
    });
});


router.get('/wordlists', passwordless.restricted(),
           function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    collection.find({owner:req.user},{},function(e,docs){
        res.render('wordlists', {
            "wordLists" : docs,
            user: users[req.user] 
        });
    });
});


router.get('/public_wordlists',
           function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    collection.find({ isPublic: true },{},function(e,docs){
        res.render('public_wordlists', {
            "wordLists" : docs,
            user: users[req.user] 
        });
    });
});

router.post('/addwordlist', passwordless.restricted(), function(req, res) {

    // Set our internal DB variable
    var db = req.db;

    // Get our form values. These rely on the "name" attributes
    var name = req.body.name;

    if(name.length === 0){
        res.send("The name has length 0.");
        return;
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
        }else {
            res.location("wordlists");
            res.redirect("wordlists");
        }
    });
});


router.get('/wordlists/:id/guessword', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findOne({_id:id}).then(function(wordList){
        res.render('guessword', {
            "wordList" : JSON.stringify(wordList),
            user: users[req.user] 
        });
    });
});

router.get('/wordlists/:id/guessdescription', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findOne({_id:id}).then(function(wordList){
        res.render('guessdescription', {
            "wordList" : JSON.stringify(wordList),
            user: users[req.user] 
        });
    });
});


router.get('/wordlists/:id/spellword', function(req, res) {
    var db = req.db;
    var collection = db.get('wordLists');
    var id = req.params.id;
    collection.findOne({_id:id}).then(function(wordList){
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
                         alias: "",
                         gravatar:'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(user).digest("hex") + '?&d=retro'};
		}, {deliveryField: "sendMethod"}),
	    function(req, res) {
  		res.render('sent');
            });

/* POST login screen. */
router.post('/passwordlogin',
            function(req, res, next) {
                var db = req.db;
                var collection = db.get('user_information');
                collection.findOne({user:req.body.user})
                    .then(function (doc) {
                        if(doc && (req.body.password === doc.password)){
                            next();
                        }else{
                            res.render('wrong_password');
                        }
                    });
            }, 
	    passwordless.requestToken(
		// Simply accept every user
	        function(user, delivery, callback) {
		    callback(null, user);
                    users[user] =
                        {email: user,
                         alias: "",
                         gravatar:'https://www.gravatar.com/avatar/' + crypto.createHash('md5').update(user).digest("hex") + '?&d=retro'};
		}, {deliveryField: "sendMethod"}),
	function(req, res) {
            var user = req.body.user;
            var loginURL = req.loginTokenMap[user];
            delete req.loginTokenMap[user];
            res.redirect(loginURL);
        });


router.get('/edit_user', passwordless.restricted(), function(req, res) {
    res.render('edit_user', { user: users[req.user] });
});

router.post('/setpassword', passwordless.restricted(), function(req, res) {
    var db = req.db;
    var password = req.body.password;

    if(password.length === 0){
        res.send("The password has length 0.");
        return;
    }

    // Set our collection
    var collection = db.get('user_information');

    // Submit to the DB
    collection.findOne({user:req.user})
        .then(function (doc) {
            if(doc){
                doc.password = password;
                collection.update({_id: doc._id}, doc);
                res.render('edit_user', { user: users[req.user] });
            }else{
                collection.insert({user: req.user,
                                   alias: "??????",
                                   password: password}, function (err, doc) {
                                       if (err) {
                                           // If it failed, return error
                                           res.send("There was a problem adding the information to the database.");
                                       }else {
                                           res.render('edit_user', { user: users[req.user] });
                                       }
                                   });
            }
        });
});


module.exports = router;
