# Rock Paper Scissors Plus

Hosted link: https://rps-plus.herokuapp.com

This application uses HTML / CSS, Node.js, Express, JQuery, and Socket.io.

## Personal Environment Configurations
This section explains the proper configurations for local app set-up in your environment.
1. Clone the repo
2. *npm install* to install all dependencies
3. *npm start* to run the application , The application is hosted on http://localhost:3000

## Introduction

Many are aware of the universal game, “rock-paper-scissors”, as it requires virtually no tools or elaborate strategies to play. The game uses a simple protocol where two players must count down and simultaneously form either a rock, a pair of scissors, or a piece of paper with their hands. Depending on the input, it can produce two possible outcomes: a draw or a win/lose scenario. This project is an expansion of that idea with more choices for the input and have it hosted online for multiple players by using a Node.js / Express server and browser websockets. The revamped rules and additional choices produces more variations for the outcome and reduces the probability of causing a tie-breaker.

The inspiration for the rules transpired from the popular five-weapon form of the original game, called “rock-paper-scissors-spock-lizard”, which was invented by Sam Kass and Karen Brya. It adds “Spock” and “lizard” to the standard input options.

## Project Description

This project uses a two way communication between the players and a socket server to host a simple multiplayer game. This is a common real-time communication structure, and can be found in many chat applications, realtime databases, online multiplayer games, and more.

### Features 
* Allows a player to create a room with a unique room id, in which another player can join by entering that id key
* Uses multi-threading and thread-safety practices to ensure that only two players can play in one room, and allows multiple games to be run concurrently
* Checks that there is a minimum and maximum number of two players in the game room for the game to proceed
