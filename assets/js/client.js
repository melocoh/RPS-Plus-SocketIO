/**
 *  Client side JS file that is responsible for emit activities in this application
 *  It is the equivalent of broadcasting in Socket.io, but it allows the
 *  sending of objects.
 */

let playerChoice = "";
let opponentChoice;
let winner;
let roomID;

let playerType;
let playerName;
let message = document.getElementById("message");
let btn = document.getElementById("send");
let output = document.getElementById("output");
let feedback = document.getElementById("feedback");

const choices = document.querySelectorAll(".choice");
const score = document.getElementById("score");
const result = document.getElementById("result");
const modal = document.querySelector(".modal");
const scoreboard = {
    player1: 0,
    player2: 0
};

// uncomment for socket connection in localhost on node, and comment out line 26
var socket = io.connect("http://localhost:3000");

// uncomment for socket connectin in the heroku server, and comment out line 22
// var socket = io.connect("https://comp3940-rps-plus.herokuapp.com/");

/////////////////////////////////////////
////////////// GAME EVENTS //////////////
/////////////////////////////////////////

// disconnect function with an emit event that shows room id
function disconnect() {
    socket.emit("disconnect", {
        room: roomID
    });
}

// new game onClick listener
$("#new").on("click", function () {
    
    // player type is host
    playerType = true;
    
    // sets username as player 1's name
    playerName = $("#nameNew").val();
    $("#player1Name").html(playerName);

    // if user doesn't enter a name
    if (!playerName) {
        alert("Please enter your name.");
        return;
    }

    // emit event for createGame thase sends player name
    socket.emit("createGame", {
        name: playerName
    });

    // makes menu invisible and gameboard visible
    $(".menu").fadeOut();
    $(".gameBoard").fadeIn();
});

// join game onClick listener
$("#join").on("click", function () {

    // player type is not host
    playerType = false;
    
    // sets username as player 2's name
    var name = $("#nameJoin").val();
    playerName = name;
    $("#player2Name").html(name);

    // receives room id to join game
    roomID = $("#room").val();

    // if room id doesn't exist
    if (!name || !roomID) {
        alert("Please enter your name and game ID.");
        return;
    }

    // emit event for joinGame that sends player name and room id
    socket.emit("joinGame", {
        name: name,
        room: roomID
    });

    // makes menu invisible and gameboard visible
    $(".menu").fadeOut();
    $(".gameBoard").fadeIn();
});

//////////////////////////////////////////////
////////////// UI UPDATE EVENTS //////////////
//////////////////////////////////////////////

// on newGame listener
// diplays welcome message, new room id and waits for player 2
socket.on("newGame", function (data) {
    var message =
        "Hello, " +
        data.name +
        ". Please ask your friend to enter Game ID: " +
        data.room +
        ". Waiting for player 2...";
    roomID = data.room;
    
    $("#msg").html(message);
});

// on informAboutExit listener
// when one player leaves, other player gets notified
// and is offered to return to start menu
socket.on("informAboutExit", function (data) {
    var {
        leaver
    } = data
    
    if (confirm(`Player ${leaver.name} left the game. Do you want to go back to play with computer? `)) {
        location.reload();
    }
})

// on player1 start game listener
// sets the ui for player 1's room when the game starts
socket.on("player1", function (data) {
    var message = "Hello , " + playerName;

    $("#msg").html(message);
    $("#player2Name").html(data.oppName);
    socket.emit("joinedGame", {
        room: roomID,
        player: playerName
    });
    $(".gamePlay").css("display", "block");
});

// on player2 start game listener
// sets the ui for player 1's room when the game starts
socket.on("player2", function (data) {
    var message = "Hello , " + playerName;
    $("#opposite-player-name").html(playerName);
    $("#msg").html(message);
});

// on welcomeGame listener
// sets the displays the players' names in the game room
socket.on("welcomeGame", function (data) {
    $("#player1Name").html(data);
    $("#opposite-player-name").html(data);
    $(".gamePlay").css("display", "block");
});

// on error listener
socket.on("err", function (err) {
    alert(err.message);
    location.reload();
});


//Result Listener
socket.on("result", function (data) {
    if (playerType) {
        showWinner(data.winner, data.choice2);
    } else {
        showWinner(data.winner, data.choice1);
    }
    $("#" + playerChoice).css("color", "#333");
    playerChoice = "";
});

////////////////////////////////////////////
////////////// GAME MECHANICS //////////////
////////////////////////////////////////////

// function for playing the game
// takes in the player's choice
function play(e) {
    if (playerChoice === "") {
        playerChoice = e;
        $("#" + e).css("color", "#c72121");
        if (playerType) {
            socket.emit("choice1", {
                choice: playerChoice,
                room: roomID
            });
        } else {
            socket.emit("choice2", {
                choice: playerChoice,
                room: roomID
            });
        }
    }
}

// player's choice onClick Listener
$(".choices").on('click', '[data-fa-i2svg]', function () {
    play($(this)[0].id);
});

// function for displaying the players' choices
function ResultDisplay(res, opponentChoice) {
    result.innerHTML = `
      <h1 class="text-${res}">You ${res.charAt(0).toUpperCase() + res.slice(1)}</h1>
      <i class="fas fa-hand-${opponentChoice} fa-10x"></i>
      <p>Opponent Chose <strong>${opponentChoice.charAt(0).toUpperCase() +
        opponentChoice.slice(1)}</strong></p>
    `;
}

// function for displaying the winning result
function showWinner(winner, opponentChoice) {

    // if player 1 wins
    if (winner === "1") {

        // increments player's score
        scoreboard.player1++;

        // show modal result
        if (playerType) {
            ResultDisplay("win", opponentChoice);
        } else {
            ResultDisplay("lose", opponentChoice);
        }
    } else if (winner === "2") { // if player 2 wins

        // increments computer score
        scoreboard.player2++;

        // show modal result
        if (!playerType) {
            ResultDisplay("win", opponentChoice);
        } else {
            ResultDisplay("lose", opponentChoice);
        }
    } else { // if it is a tie
        result.innerHTML = `
      <h1>It's A Draw</h1>
      <i class="fas fa-hand-${opponentChoice} fa-10x"></i>
      o
    `;
    }

    // show score of both players
    $("#score #p1").html(scoreboard.player1);
    $("#score #p2").html(scoreboard.player2);

    // makes the modal visible and sets timer for the length of
    // its display
    modal.style.display = "block";
    setTimeout(() => {
        $('.modal').fadeOut(850)
    }, 1000)
}