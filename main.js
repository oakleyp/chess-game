"use strict";

var pvpBtn = document.getElementById('pvpbtn');
var menuDiv = document.getElementById('menu-screen');
var gameDiv = document.getElementById('game-screen');
var menuBtn = document.getElementById('menubtn');

pvpBtn.addEventListener('click', function() {
    menuDiv.style.display = "none";
    gameDiv.style.visibility = "visible";
    startGame("pvp");
});

menuBtn.addEventListener('click', function() {
    if(confirm("Are you sure you want to leave the game?\n Press cancel to stay on the page.")) {
        location.reload();
    }
});