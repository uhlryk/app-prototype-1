/*jslint node: true */
"use strict";
/**
 * Obsługuje komunikaty publiczne, czyli grupy, zawierające więcej niż dwie osoby. Wątek z takimi samymi osobami może być ząłożony
 * wielokrotnie.
 * DO wątku można dodawać nowe osoby.
 * Wątek widziany jest przez cały zakres ról danych userów (czyli jak w wątku jest inwestor to wszyscy inwestorzy to widzą)
 * Mogą pisać również inni z grup
 */


var express = require('express');
var router = new express.Router();
var RuleAccess = require('ruleaccess');

/**
 * Odpowiada za tworzenie wątku w dyskusji
 */
router.post("/public", RuleAccess.isAllowed(), function(req, res, next){

});