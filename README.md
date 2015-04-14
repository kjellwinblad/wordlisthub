# WordListHub.com

[WordListHub.com](http://wordlisthub.com) is a web application for
learning languages. You can use it to learn words by playing games.

## Key features

* Users can add their own word lists
* Word lists can be shared with other users
* "Guess Word" game
* "Spell Word" game

## Contribute

There are many ways to contribute to this project, e.g:

* Add and share your word lists at [WordListHub.com](http://wordlisthub.com)
* Report bugs or suggest improvements by using the issue tracker at the [github.com page](http://github.com/kjellwinblad/wordlisthub)
* Improve the code or implement a new feature and make a [pull request](https://help.github.com/articles/using-pull-requests/)!

## Development

WordListHub.com is developed to run on nodejs so you need to be
familiar with JavaScript to create new features. Follow the following
steps to set up a test environment:

1. Install recent version of the dependencies nodejs and mongodb
2. Clone the repository using git: `git clone https://github.com/kjellwinblad/wordlisthub.git`
3. Change to the project directory: `cd wordlisthub`
4. Install the nodejs dependencies `npm install`
5. Configure the e-mail based login system by editing the file `wordlisthub_config.json`
7. Create a directory for the database, e.g.: `mkdir data`
6. Start mongodb (will take a few seconds) `mongod --smallfiles --port 27018 --dbpath data`
7. Start the web server (in another terminal) `npm start`
8. Open [http://localhost:3000](http://localhost:3000) in your web browser
