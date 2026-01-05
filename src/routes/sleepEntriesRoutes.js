/**
 * 
 *
*/

const express = require("express");
const router = express.Router();
const sleepEntriesController = require("../controllers/sleepEntriesController");

router.get("/", sleepEntriesController.getSleepEntries);

module.exports = router;

