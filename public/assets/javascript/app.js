var config = {
    apiKey: "AIzaSyD98KyEcpCT4C2dxV73QXzhEu5ZD26pncM",
    authDomain: "rock-paper-scissors-a33bf.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-a33bf.firebaseio.com",
    projectId: "rock-paper-scissors-a33bf",
    storageBucket: "rock-paper-scissors-a33bf.appspot.com",
    messagingSenderId: "69855625422"
};

firebase.initializeApp(config);

var player1 = {
    choice: "",
    opponentChoice: "",
    opponent: "",
    status: "",
    opponentStatus: "",
};

var player1Id;
var opponentId;
var player2Status = "waiting to join...";
var player1Status = "Ready!";
var outcome;
var pChoice = "";
var oChoice = "";
var wins = 0;
var losses = 0;
var ties = 0;


// Create a variable to reference the database.
var database = firebase.database();

// -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //
// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");
var player1Ref = database.ref('/players').push(player1);
player1Id = player1Ref.key;


// '.info/connected' is a special location provided by Firebase that is updated every time
// the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");

// When the client's connection state changes...
connectedRef.on("value", function (snap) {

    // If they are connected..
    if (snap.val()) {

        // Add user to the connections list.
        var con = connectionsRef.push(true);

        // Remove user from the connection list when they disconnect.
        con.onDisconnect().remove();

        // Remove player when they disconnect
        player1Ref.onDisconnect().remove();

    }
});


// -------------------------------------------------------------- (CRITICAL - BLOCK) --------------------------- //

// At the page load and subsequent value changes, get a snapshot of the local data.
// This callback allows the page to stay updated with the values in firebase node "clicks"
database.ref("/players").on("value", function (snapshot) {

    $('#outcome').text("Waiting for Player 2");

    var players = snapshot.val();

    if (opponentId) {
        var keys = Object.keys(players);

        var opponentOnline = false;
        for (i = 0; i < keys.length; i++) {
            var oppId = keys[i];
            if (players[oppId].opponent == player1Id) {
                opponentOnline = true;
                break;
            }
        }

        if (!opponentOnline) {
            opponentId = null;
            database.ref('/players').child(player1Id).update({ opponent: "" });
            player2Status = "waiting to join...";
            outcome = "Waiting for Player 2";
        }
    }

    else {
        var keys = Object.keys(players);

        for (i = 0; i < keys.length; i++) {

            var oppId = keys[i];
            console.log('oppId =  ', oppId);

            if (oppId != player1Id && players[oppId].opponent == "") {

                players[oppId].opponent = player1Id;
                player1.opponent = oppId;

                database.ref('/players').child(player1Id).update({ opponent: oppId });
                database.ref('/players').child(oppId).update({ opponent: player1Id });

                opponentId = oppId;
                console.log('opponentId = oppId;', opponentId);

                player2Status = "Ready!!";
                outcome = "Play!";
                $('#player-2-span').text(player2Status);


                break;
            }
        }
    };

    $('#player-1-span').text(player1Status);
    $('#player-2-span').text(player2Status);
    $('#outcome').text(outcome);

    if ("Ready!!" == player2Status) {
        $('#player-2-span');
    }
    else {
        $('#player-2-span');
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

database.ref("/players/" + player1Id).on('value', function (snapshot) {

    console.log('opponent choice changed', snapshot.val());

    var player = snapshot.val();

    pChoice = player.choice;
    oChoice = player.opponentChoice;
    pStatus = player.status;
    oStatus = player.opponentStatus;

    if (pChoice != "" && oChoice != "" && pStatus === 'selected' && oStatus === 'selected') {

        if ((pChoice === "rock") || (pChoice === "paper") || (pChoice === "scissors")) {

            if ((pChoice === "rock" && oChoice === "scissors") ||
                (pChoice === "scissors" && oChoice === "paper") ||
                (pChoice === "paper" && oChoice === "rock")) {
                outcome = "Player 1 Wins!"
                wins++;
            } else if (pChoice === oChoice) {
                outcome = "Tie!"
                ties++;
            } else {
                outcome = "Player 2 Wins!"
                losses++;
            }

            player1Status = pChoice;
            player2Status = oChoice;
            $('#player-2-span').text(player2Status);
            $('#player-1-span').text(player1Status);
            player1.choice = "";
            player1.status = "";
            player1.opponentChoice = "";
            player1.opponentStatus = "";

            database.ref('players/').child(player1Id).update(player1);

            $('#outcome').text(outcome);

            var delayNextQuestion = setTimeout(function () {
                nextRound();
            }, 3000);
        }
    }

    $('#wins-span').text(wins);
    $('#losses-span').text(losses);
    $('#ties-span').text(ties);
});


$('.card').on('click', function (event) {
    var _this = $(this);
    var choice = _this.attr('data-type');
    $(`#${choice}-overlay`).addClass('selected');

    console.log('choice = ', choice);
    player1Status = choice;
    $('#player-1-span').text(player1Status);
    database.ref('players/').child(player1Id).update({ choice: choice, status: 'selected' });
    database.ref('players/').child(opponentId).update({ opponentChoice: choice, opponentStatus: 'selected' });

});

function nextRound() {

    $('.selected').removeClass('selected');
    outcome = "Next Round - Go!"
    player1Status = "";
    player2Status = "";
    $('#player-2-span').text(player2Status);
    $('#player-1-span').text(player1Status);
    $('#outcome').text(outcome);
};


