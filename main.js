"use strict";

var pvpBtn = document.getElementById('pvpbtn');
var menuDiv = document.getElementById('menu-screen');
var gameDiv = document.getElementById('game-screen');
var menuBtn = document.getElementById('menubtn');
var pauseplayBtn = document.getElementById('pauseplay');

pvpBtn.addEventListener('click', function () {
    menuDiv.style.display = "none";
    gameDiv.style.visibility = "visible";
    startGame("pvp");
});

menuBtn.addEventListener('click', function () {
    if (confirm("Are you sure you want to leave the game? All progress will be lost.\nPress cancel to stay on the page.")) {
        location.reload();
    }
});

/*===============================================================================*/
/* -------------- Control button handler functions ----------------------------- */
/*===============================================================================*/

pauseplayBtn.addEventListener('click', function () {
    if (paused) {
        startTimer();
        paused = false;
    } else {
        stopTimer();
        paused = true;
    }
});
