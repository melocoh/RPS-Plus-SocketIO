/**
 *  server.js is responsible for server connection to port
 *  and the handling of data communication link between the two players.
 */

var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var randomstring = require("randomstring");

var choice1 = "", choice2 = "";
var players = [];
connections = [];

// connects server to local host or deployed server port
server.listen(process.env.PORT || 3000);
console.log('Server running...');

// sets view type and and folder imports
app.set("view engine", "ejs");
app.use(express.static("assets"));

// app starts from index
app.get("/", function (req, res) {
    res.render("index");
});

/////////////////////////////////////////////
////////////// SOCKET ACTIVITY //////////////
/////////////////////////////////////////////

// @onConnect
io.sockets.on("connection", function (socket) {
    connections.push(socket);
    console.log('Connected: %s socket(s) connected.', connections.length);

    // @onDisconnect
    socket.on("disconnect", function (data) {
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected 1 socket. %s sockets left.', connections.length);
    });

    // create game event listener
    socket.on("createGame", function (data) {
        
        // generate random string of length 4 for room id
        var room = randomstring.generate({
            length: 4
        });

        // push player info into players list
        players.push({
            socket: socket.id,
            name: data.name,
            room
        })

        // join socket to the room based on generated id
        socket.join(room);

        // emit even for newGame with the username and room id
        socket.emit("newGame", {
            name: data.name,
            room: room
        });
    });

    // join game listener
    socket.on("joinGame", function (data) {

        // adds extra / when in new room
        var room = io.nsps["/"].adapter.rooms[data.room];

        // if room exists
        if (room) {

            // number of players in the room is 1
            if (room.length == 1) {

                // allow player to enter, given that they have the correct room id
                socket.join(data.room);
                players.push({
                    socket: socket.id,
                    name: data.name,
                    room: data.room
                });

                // broadcasts player 1's name
                socket.broadcast.to(data.room).emit("player1", {
                    oppName: data.name
                });
                
                // broadcasts player 2's name
                socket.emit("player2", {
                    name: data.name,
                    room: data.room
                });

            } else { // if there are 2 peopler currently in the room

                // do not allow more people
                socket.emit("err", {
                    message: "Sorry, The room is full!"
                });
            }
        } else { // if input room is non-existent
            socket.emit("err", {
                message: "Invalid Room Key"
            });
        }
    });

    // joined game listener that passes in the room creator's name
    socket.on("joinedGame", function (data) {
        console.log("Joined Game ", data);
        socket.broadcast.to(data.room).emit("welcomeGame", data.player);
    });

    // player 1's choice listener
    socket.on("choice1", function (data) {
        choice1 = data.choice;
        console.log("Player 1's choice: " + choice1);
        if (choice2 != "") {
            result(data.room);
        }
    });

    // player 2's choice listener
    socket.on("choice2", function (data) {
        choice2 = data.choice;
        console.log("Player 2's choice: " + choice2);
        if (choice1 != "") {
            result(data.room);
        }
    });
});

///////////////////////////////////////////
////////////// GAME ACTIVITY //////////////
///////////////////////////////////////////

// function to calculate winner for rps+
function getWinner(p, c) {

    if (p === c) { // if tie
        return "draw";
    } else if (p === "rock") { // if rock
        if (c === "paper" || c === "spock") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "paper") { // if paper
        if (c === "scissors" || c === "lizard") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "scissors") { // if scissors
        if (c === "rock" || c === "spock") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "lizard") { // if lizard
        if (c === "rock" || c === "scissors") {
            return "2";
        } else {
            return "1";
        }
    } else if (p === "spock") { // if spock
        if (c === "paper" || c === "lizard") {
            return "2";
        } else {
            return "1";
        }
    }
}

// function to execute the result of the user's choices
function result(roomID) {
    var winner = getWinner(choice1, choice2);
    
    io.sockets.to(roomID).emit("result", {
        winner: winner,
        choice1: choice1,
        choice2: choice2
    });

    choice1 = "";
    choice2 = "";
}