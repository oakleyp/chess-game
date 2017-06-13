"use strict";

var body = document.querySelector('body');
var pvpBtn = document.getElementById('pvpbtn');
var pvcBtn = document.getElementById('pvcbtn');
var menuDiv = document.getElementById('menu-screen');
var gameDiv = document.getElementById('game-screen');
var menuBtn = document.getElementById('menubtn');
var pauseplayBtn = document.getElementById('pauseplay');


pvpBtn.addEventListener('click', function () {
    menuDiv.style.display = "none";
    gameDiv.style.visibility = "visible";
    body.classList.add("body-bg-shift");
    startGame("pvp");
});

pvcBtn.addEventListener('click', function () {
    menuDiv.style.display = "none";
    gameDiv.style.visibility = "visible";
    body.classList.add("body-bg-shift");
    startGame("pvc");
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
