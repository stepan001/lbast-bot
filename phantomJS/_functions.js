/**
 * Created by snikiforov on 25.10.16.
 */

/**
 * It is a file with helper functions. In future - it will be a class with helper functions.
 */


/**
 * Perform login (sign in) to the site
 */

var healthPrint = -1;
var timePrint = -1;
var statusPrint = -1;
var counterOfBattles = 0;

casper.login = function login(login, psw) {

    if (!this.isLoggedIn()) {
        this.echo("not logged in. logging in...");
        this.then(function() {
            this.open(indexPageUrl);
        });

        this.then(function () {
            this.fill('form', {
                'login': login,
                'pass': psw,
                'zap': true
            }, true);
        });

        this.then(function () {
            this.waitForSelector('#top');
        });
    } else {
        this.then(function() {
            this.echo("logged in");
            this.open(locationPageUrl);
        });
    }
};


/**
 * Checks is logged user to the site
 */

casper.isLoggedIn = function isLoggedIn() {
    return !this.exists(returnAnchorSelector);
};


/**
 * Makes a capture (a screenshot) to the default directory, in PNG format
 * Example: yorso_20161026_170824_102.png
 */

casper.makeCapture = function makeCapture() {
    var nameOfCapture = createTimestamp() + ".png";
    this.echo("\nCapturing: " + nameOfCapture + " ...");
    this.capture(pathForCaptures + nameOfCapture);
};


/**
 * Create a string with current date and time for casper.makeCapture function
 */

function createTimestamp () {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = today.getMonth()+1; //January is 0!
    var dd = today.getDate();
    var hours = today.getHours();
    var minutes = today.getMinutes();
    var seconds = today.getSeconds();

    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (hours < 10) {
        hours = '0' + hours;
    }

    if (minutes < 10) {
        minutes = '0' + minutes;
    }

    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    today = yyyy + '' + mm + '' + dd + '_' + hours + '' + minutes + '' + seconds;

    return today;
}


/**
 * Wait random time
 */

casper.waiter = function waiter(min, max) {
    min *= oneThousandNumber;
    max *= oneThousandNumber;
    var sub = max - min;
    var valueForTimer = min + Math.random() * sub;
    if (min < 60) { // increase waiter's time in 10% of cases up to 10 times. Only if not working.
        var digit = valueForTimer.toString()[2];
        if (+digit % 8  == 0) {
            valueForTimer *= 10;
        }
    }
    casper.then(function() {
        casper.wait(valueForTimer);
    });
};


/**
 * Check health
 */

casper.getHealth = function getHealth() {
    var actualHealth = this.fetchText('a[href^="pers.php"] font:nth-child(2)');
    var maxHealth = this.fetchText('a[href^="pers.php"] font:nth-child(3)');
    if ((actualHealth == null) || (maxHealth == null)) {
        return 0;
    }
    return actualHealth/maxHealth;
};


/**
 * Check time out
 */

casper.getTimeOut = function getTimeOut() {
    // var contentOfPageString = '';
    // var actualTimeOut = -100;
    // casper.then(function () {
        var actualTimeOut = this.fetchText('a[href^="pers.php"] + nobr');
        this.echo(actualTimeOut);

    // });
    // casper.then(function () {
        if (actualTimeOut == null || actualTimeOut == '') {
            actualTimeOut = 60;
        } else if (actualTimeOut == undefined) {
            actualTimeOut = 0;
        } else {
            actualTimeOut = actualTimeOut.replace(/^\(|\)$/g, '');
        }
    // });
    // casper.then(function () {
    //     contentOfPageString = this.evaluate(function () {
    //         return document.body.innerHTML;
    //     });
    // });
    // casper.then(function () {
    //     if ((contentOfPageString.indexOf('[') != -1) || (contentOfPageString.indexOf(']') != -1)) {
    //         actualTimeOut = 0;
    //     }
    // });
    // casper.then(function () {
    //     this.echo(contentOfPageString);
    //     this.echo(actualTimeOut);
    // });
    return actualTimeOut;

};


/**
 * Can act
 */

casper.createStatus = function createStatus() {
    var healthRate = this.getHealth();
    healthPrint = healthRate;
    var actualTimeOut = this.getTimeOut();
    timePrint = actualTimeOut;

    var today = new Date();
    var hours = today.getHours();

    if (hours >= 0 && hours < 9) {
        return 4; // it's a night
    } else if ((healthRate > 0.8) && (actualTimeOut > 10)) {
        return 0; // good, go war
    } else if (((healthRate >= -2) && (healthRate <= 0.8)) && (actualTimeOut > 10)) {
        return 1; // recover life
    } else if ((actualTimeOut < 10) || (healthRate < -2)) {
        return 2; // low time or blood, go work
    }
};


/**
 * Print out status
 */

casper.printStatus = function printStatus(healthPrint, timePrint, statusPrint) {
    var actualHealth = this.fetchText('a[href^="pers.php"] font:nth-child(2)');
    var maxHealth = this.fetchText('a[href^="pers.php"] font:nth-child(3)');
    this.echo("#################################################################");
    this.echo('TIME: ' + createTimestamp());
    this.echo("Health: " + actualHealth + " / " + maxHealth + " = " + healthPrint);
    this.echo("Time out: " + timePrint);
    var statusString = "Status: ";
    if (statusPrint == 0) {
        statusString += 0 + " . Go act."
    } else if (statusPrint == 1) {
        statusString += 1 + ". Recovering life. Staying here."
    } else if (statusPrint == 2) {
        statusString += 2 + " . Go work."
    } else {
        statusString += "ERROR";
    }
    this.echo(statusString);
    this.echo("#################################################################");
};


/**
 * Make decision
 */

casper.makeDecisionByStatus = function makeDecision() {
    casper.then(function() {
        this.open(locationPageUrl);
    });
    casper.then(function() {
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    var status;

    casper.then(function() {
        status = this.createStatus();
        statusPrint = status;
        this.printStatus(healthPrint, timePrint, statusPrint);
    });
    casper.then(function() {
        if (status == 4) { // it's a night, do dubilnya
            this.doDubilnya();
        } else if (status == 0) {
            this.chooseMainAction();
        } else if (status == 1) {
            // this.chooseMainAction();
            casper.then(function() {
                casper.waiter(600, 900); // do recover
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        } else if (status == 2) {
            // this.chooseMainAction();
            casper.then(function() {
                casper.waiter(3, 6);
            });
            casper.then(function() {
                var actualLogin = this.fetchText('a[href^="pers.php"] font:nth-child(1) b');
                this.echo(actualLogin);
                if (actualLogin == 'ssnikiforov') {
                    this.doWork('fz');
                } else {
                    this.doWork('ev');
                }
            });
        }
    });
    casper.then(function() {

    });
    casper.then(function() {

    });
};


/**
 * Do action
 */

casper.chooseMainAction = function chooseMainAction() {
    casper.then(function() {
        // this.chooseQuest();
    });
    casper.then(function() {
        this.doAndMoveBison();
    });
    casper.then(function() {

    });
};


var isParsedToday = 0;
var assBankir = 0;
var assKartina = 0;
var assTorgovets = 0;
var ordoFirst = 0;
var ordoSecond = 0;
var harchevnya = 0;
var edaDlyaRybaka = 0;
var questsAvailability = 0;
var quantityOfAvailableQuests = 0;

/**
 * Choose quest
 */

casper.chooseQuest = function chooseQuest() {
    casper.then(function() {
        this.resetIsParsedToday();
    });
    casper.then(function() {
        this.waiter(3,6);
    });
    casper.then(function() {
        this.parseQuests();
    });
    casper.then(function() {
        this.waiter(3,6);
    });
    casper.then(function() {
        this.isQuestsAvailable();
    });
    casper.then(function() {
        this.printQuests();
        this.waiter(3,6);
    });
    casper.then(function() {
        if (assBankir == 1) {
            casper.then(function() {
                this.doAssBankir();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (assKartina == 1) {
            casper.then(function() {
                this.doAssKartina();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (assTorgovets == 1) {
            casper.then(function() {
                this.doAssTorgovets();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (ordoFirst == 1) {
            casper.then(function() {
                this.doOrdoFirst();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (ordoSecond == 1) {
            casper.then(function() {
                this.doOrdoSecond();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (harchevnya == 1) {
            casper.then(function() {
                this.doHarchevnya();
                // quantityOfAvailableQuests--;
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
        if (edaDlyaRybaka == 1) {
            casper.then(function() {
                this.doEdaDlyaRybaka();
            });
            casper.then(function() {
                this.waiter(3,6);
            });
            casper.then(function() {
                this.makeDecisionByStatus();
            });
        }
    });
};


/**
 * Reset is quests parsed flag
 */

casper.resetIsParsedToday = function resetIsParsedToday() {

};


/**
 * Parse quests
 */

casper.parseQuests = function parseQuests() {
    casper.then(function () {
        if (isParsedToday == 0) {
            casper.then(function () {
                this.echo("Quests: parsing...");
            });
            var contentOfPageString = '';
            casper.then(function () {
                this.click('a[href*="mod=quests"]');
            });
            casper.then(function () {
                contentOfPageString = this.evaluate(function () {
                    return document.body.innerHTML;
                });
            });
            casper.then(function () {
                this.echo(contentOfPageString);
                if (contentOfPageString.indexOf("банкира") != -1) {
                    assBankir = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("картину") != -1) {
                    assKartina = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("торговца") != -1) {
                    assTorgovets = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("главаря банды") != -1) {
                    ordoFirst = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("банду") != -1) {
                    ordoSecond = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("Харчевня") != -1) {
                    harchevnya = 1;
                    quantityOfAvailableQuests++;
                }
                if (contentOfPageString.indexOf("Еда для") != -1) {
                    edaDlyaRybaka = 1;
                    quantityOfAvailableQuests++;
                }
            });
            casper.then(function () {
                isParsedToday = 1;
            });
            casper.then(function () {
                this.clickLabel('В игру');
            });
        }
    });
};


/**
 * Is quest available
 */

casper.isQuestsAvailable = function isQuestAvailable() {
  if ((assBankir == 1) || (assKartina == 1) || (assTorgovets == 1) || (ordoFirst == 1) || (ordoSecond == 1) || (harchevnya == 1) || (edaDlyaRybaka == 1)) {
      questsAvailability = 1;
  } else {
      questsAvailability = 0;
  }
};


/**
 * Print list of available quests
 */

casper.printQuests = function printQuests() {
    if ((assBankir == 1) || (assKartina == 1) || (assTorgovets == 1) || (ordoFirst == 1) || (ordoSecond == 1) || (harchevnya == 1) || (edaDlyaRybaka == 1)) {
        questsAvailability = 1;
    } else {
        questsAvailability = 0;
    }
    var listOfQuests = '';

    if (assBankir == 1) {
        listOfQuests += "assBankir. ";
    }
    if (assKartina == 1) {
        listOfQuests += "assKartina. ";
    }
    if (assTorgovets == 1) {
        listOfQuests += "assTorgovets. ";
    }
    if (ordoFirst == 1) {
        listOfQuests += "ordoFirst. ";
    }
    if (ordoSecond == 1) {
        listOfQuests += "ordoSecond. ";
    }
    if (harchevnya == 1) {
        listOfQuests += "harchevnya. ";
    }
    if (edaDlyaRybaka == 1) {
        listOfQuests += "edaDlyaRybaka. ";
    }

    if (questsAvailability == 1) {
        this.echo("Quests. Available: " + quantityOfAvailableQuests + ". List: ");
        this.echo(listOfQuests);
    } else {
        this.echo("Quests: no one quest available. Go further.")
    }
};


/**
 * Do quest bankir
 */

casper.doAssBankir = function doAssBankir() {
    casper.then(function () {
        this.echo("Quest started: " + "doAssBankir");
    });
    casper.then(function () {
        this.takeQuestAss('b');
    });
    casper.then(function () {
        this.moveBankir();
    });
    casper.then(function () {

    });
    casper.then(function () {

    });
};


/**
 * Do quest kartina
 */

casper.doAssKartina = function doAssKartina() {
    casper.then(function () {
        this.echo("Quest started: " + "doAssKartina");
    });
    casper.then(function () {
        this.takeQuestAss('k');
    });
    casper.then(function () {
        this.moveKartina();
    });
    casper.then(function () {

    });
    casper.then(function () {

    });
};


/**
 * Do quest torgovets
 */

casper.doAssTorgovets = function doAssTorgovets() {
    casper.then(function () {
        this.echo("Quest started: " + "doAssTorgovets");
    });
    casper.then(function () {
        this.takeQuestAss('t');
    });
    casper.then(function () {
        this.moveTorgovets();
    });
    casper.then(function () {

    });
    casper.then(function () {

    });
};


/**
 * Do quest ordo first
 */

casper.doOrdoFirst = function doOrdoFirst() {
    casper.then(function () {
        this.echo("Quest started: " + "doOrdoFirst");
    });
    casper.then(function () {
        this.takeQuestOrdo('f');
    });
    casper.then(function () {
        this.moveOrdoFirst();
    });
    casper.then(function () {

    });
    casper.then(function () {

    });
};


/**
 * Do quest ordo second
 */

casper.doOrdoSecond = function doOrdoSecond() {
    casper.then(function () {
        this.echo("Quest started: " + "doOrdoSecond");
    });
    casper.then(function () {
        this.takeQuestOrdo('s');
    });
    casper.then(function () {
        this.moveOrdoSecond();
    });
    casper.then(function () {

    });
    casper.then(function () {

    });
};


/**
 * Do quest harchevnya
 */

casper.doHarchevnya = function doHarchevnya() {
    casper.then(function () {
        this.echo("Quest started: " + "doHarchevnya");
    });
    casper.then(function () {
        this.harch1();
    });
    casper.then(function () {
        this.makeDecisionByStatus();
    });
    casper.then(function () {
        this.harch2();
    });
    casper.then(function () {
        this.makeDecisionByStatus();
    });
    casper.then(function () {
        this.harch3();
    });
};


/**
 * Do quest eda dlya rybaka
 */

casper.doEdaDlyaRybaka = function doEdaDlyaRybaka() {
    casper.then(function () {
        this.echo("Quest started: " + "doEdaDlyaRybaka");
    });
    casper.then(function () {
        this.edaDlyaRybaka1();
    });
    casper.then(function () {
        edaDlyaRybaka = 0;
        quantityOfAvailableQuests--;
        this.echo("Quest completed: " + "doEdaDlyaRybaka");
    });
};


/**
 * Do dubilnya
 */

casper.doDubilnya = function doDubilnya() {
    if (this.isProperLocation('kulakHaosa')) {
        casper.then(function() {
            this.echo("Start dubilnya...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Форпост');
        });
        casper.then(function() {
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Последний дом');
        });
        casper.then(function() {
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Исп. дубильный набор');
        });
        casper.then(function() {
            this.echo('Clicked on "use dubilnya". Go to sleep for 31 minutes.');
        });
        casper.then(function() {
            this.waiter(1860, 1860);
        });

    } else if (this.getCurrentUrl().indexOf('dom.php') != -1) {
        this.clickLabel('Исп. дубильный набор');
    } else {
        casper.then(function() {
            this.echo("Go to kulak haosa...");
        });
        casper.then(function() {
            this.moveAmulet('kh');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.doDubilnya();
        });
    }
};


/**
 * Do bison
 */

casper.doAndMoveBison = function doAndMoveBison() {
    if (this.isProperLocation('bison')) {
        casper.then(function() {
            this.echo("Initiate battle with bison...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Охотиться');
        });
        casper.then(function() {
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.battle();
        });

    } else {
        casper.then(function() {
            this.echo("Go to bison...");
        });
        casper.then(function() {
            this.moveAmulet('dk');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Идти на восток');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.doAndMoveBison();
        });
    }
};


/**
 * Do work
 */

casper.doWork = function doWork(target) {
    if (this.isProperLocation(target)) {
        casper.then(function() {
            this.echo("Initiate work on " + target);
            this.waiter(3, 6);
        });
        casper.then(function() {
            if (target == 'fz') {
                this.clickLabel('Нести караул');
            } else if (target == 'ev') {
                this.clickLabel('Копи');
            } else if (target == 's') {
                this.clickLabel('Рудник');
            }
        });
        casper.then(function() {
            this.waiter(3, 6);
        });
        casper.then(function() {
            if (this.exists('form[method="POST"] b')) {
                var randomNumber = this.fetchText('form[method="POST"] b');
                randomNumber = randomNumber.replace(/[А-Яа-я: ]/g, '');
                this.fill('form', {
                    'kod': randomNumber
                }, true);
            }
        });
        casper.then(function() {
            this.clickLabel("Вернуться");
        });
        casper.then(function() {
            this.makeCapture();
            this.echo('You are working now at ' + target + '. Pause: 60-63,5 minutes.');
            this.waiter(3600, 3800);
        });
        casper.then(function() {
            this.clickLabel("Получить вознаграждение");
        });
        casper.then(function() {
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel("Вернуться");
        });
    } else {
        casper.then(function() {
            this.echo("Going to " + target + "...");
        });
        casper.then(function() {
            this.moveToWork(target);
        });
    }
};


/**
 * Go to work
 */

casper.moveToWork = function moveToWork(target) {
    if (target == "ev") {
        casper.then(function() {
            this.moveAmulet('ev');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток - в город');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.doWork(target);
        });
    } else if (target == 'fz') {
        casper.then(function() {
            this.moveAmulet('fz');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.doWork(target);
        });
    }
};


/**
 * Checks if we focused out from the battle
 */

casper.isFocusOutFromBattle = function isFocusOutFromBattle() {
    return this.exists('a[href^="arena_go"]');
} ;


/**
 * Main method for battle
 */

casper.battle = function battle() {
    casper.then(function() {
        var enemy = this.fetchText('div.mainContainer font:nth-of-type(2) b');
        this.echo('... it\'s a battle now. Your enemy is: ' + enemy);
    });
    casper.then(function() {
        casper.waiter(3, 6);
    });
    casper.then(function() {
        if (casper.isFocusOutFromBattle()) {
            casper.then(function () {
                this.click('a[href^="arena_go"]');
            });
            casper.then(function () {
                casper.waiter(3, 6);
            });
            casper.then(function () {
                casper.battle();
            });
        } else if (this.exists('input[value^="Бить"]')) {
            casper.then(function() {
                this.click('input[value^="Бить"]');
            });
            casper.then(function() {
                casper.waiter(3, 6);
            });
            casper.then(function() {
                casper.battle();
            });
        } else if (this.exists('a[href^="location.php"]')) {
            var prizes = "";
            casper.then(function() {
                prizes = this.fetchText('font[color="red"]');
                if (this.exists('font[color="#ff0000"]')) {
                    prizes += " /// " + this.fetchText('font[color="#ff0000"]');
                }
                this.echo("Result of battle: " + prizes);
                counterOfBattles++;
            });
            casper.then(function() {
                this.click('a[href^="location.php"]');
            });
        }
    });

};


/**
 * Checks is this location proper or not
 */

casper.isProperLocation = function isProperLocation(guessedLocation) {
    var properLocations = [
        {key: 'bison', value: 'Поле'},
        {key: 'ev', value: 'Эвилгард'},
        {key: 'fz', value: 'Форт \"Жженый лист\"'},
        {key: 's', value: 'Стоунгард'},
        {key: 'bankir', value: 'Дорога'},
        {key: 'kartina', value: 'Боевые кварталы'},
        {key: 'torgovets', value: 'Южный тракт'},
        {key: 'ordoFirst', value: 'Рыбацкая деревня'},
        {key: 'ordoSecond', value: 'Горы'},
        {key: 'harch1', value: 'Дорога'},
        {key: 'harch2', value: 'Лес Эльсены'},
        {key: 'harch3', value: 'Ущелье призраков'},
        {key: 'edaDlyaRybaka1', value: 'За восточными воротами'},
        {key: 'edaDlyaRybaka2', value: 'Южное побережье'},
        {key: 'kulakHaosa', value: 'Форпост "Кулак Хаоса"'}
    ];
    var currentLocation = this.fetchText('center center div b span');
    var isProper = false;
    for (var i = 0; i < properLocations.length; i++) {
        if ((properLocations[i].key == guessedLocation) && (properLocations[i].value == currentLocation)) {
            isProper = true;
        }
    }
    this.echo("Current location: " + currentLocation + ". Guessed target: "  + guessedLocation);

    return isProper;
};


/**
 * Navigation via amulet
 */

casper.moveAmulet = function moveAmulet(target) {
    casper.then(function() {
        this.waiter(3, 3);
    });
    casper.then(function() {
        this.click('a[href$="fastway"]');
    });
    casper.then(function() {
        this.waiter(3, 6);
    });
    casper.then(function() {
        if (target == 'pp') { //posled portal
            this.clickLabel('» Последний портал');
        } else if (target == 'ss') { // stoungard sever
            this.click('a[href*="way=13"]');
        } else if (target == 'sv') { // stoungard vostok
            this.click('a[href*="way=14"]');
        } else if (target == 'su') { // stoungard ug
            this.click('a[href*="way=15"]');
        } else if (target == 'sz') { // stoungard zapad
            this.click('a[href*="way=16"]');
        } else if (target == 'ev') { // evilgard predmestya
            if (this.exists('a[href*="way=10"]')) {
                this.clickLabel('» Предместья Эвилгарда');
            } else {
                this.clickLabel('» Эвилгард');
            }
        } else if (target == 'kh') { // kulak haosa
            this.clickLabel('» Кулак Хаоса');
        } else if (target == 'fz') { // fort
            this.clickLabel('» Форт Жженого листа');
        } else if (target == 'dk') { // dorozhnyi krest
            this.clickLabel('» Дорожный крест');
        }
    });
};


/**
 * Navigation via konj
 */

casper.moveKonj = function moveKonj(target) {
    casper.then(function() {
        this.waiter(3, 3);
    });
    casper.then(function() {
        this.click('a[href$="konj"]');
    });
    casper.then(function() {
        this.waiter(3, 6);
    });
    casper.then(function() {
        if (target == 'vo') {
            this.clickLabel('» К Волчьим островам');
        } else if (target == 'le') {
            this.clickLabel('» Леса Эльсены');
        } else if (target == 'gd') {
            this.clickLabel('» Горы Дарии');
        } else if (target == 'ok') {
            this.clickLabel('» Озеро Камелко');
        } else if (target == 'mu') {
            this.clickLabel('» Маяк на южном побережье');
        }
    });
    casper.then(function() {
        this.waiter(7, 7);
    });
    casper.then(function() {
        this.click('a[href*="location.php"]');
    });
};


/**
 * Navigation to bankir's location
 */

casper.moveBankir = function moveBankir() {
    casper.then(function() {
        this.echo("Navigate to bankir's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('bankir')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest bankir...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.makeQuestBankir();
        });
    } else {
        casper.then(function() {
            this.echo("Go to bankir...");
        });
        casper.then(function() {
            this.moveAmulet('sz');
        });
        casper.then(function() {
            this.clickLabel('Идти к Западным воротам');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток - Центральная площадь');
        });
        casper.then(function() {
            this.clickLabel('Восточные ворота');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток - Выйти из города');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток');
        });
        casper.then(function() {
            this.moveBankir()
        });
    }
};


/**
 * Make quest bankir
 */

casper.makeQuestBankir = function makeQuestBankir() {
    // casper.then(function() {
    //     this.echo('Making quest:' + makeQuestBankir);
    //     if (this.exists('Идти к дому')) {
    //         this.clickLabel('Идти к дому');
    //     }
    // });
    // casper.then(function() {
    //     if (casper.isFocusOutFromBattle()) {
    //         casper.then(function() {
    //             this.click('a[href^="arena_go"]');
    //         });
    //         casper.then(function() {
    //             casper.waiter(3, 6);
    //         });
    //         casper.then(function() {
    //             casper.battle();
    //         });
    //         var status;
    //         casper.then(function() {
    //             status = this.createStatus();
    //             statusPrint = status;
    //             this.printStatus(healthPrint, timePrint, statusPrint);
    //         });
    //         casper.then(function() {
    //             if (status == 0) {
    //                 this.makeQuestBankir();
    //             } else if (status == 1) {
    //                 // this.chooseMainAction();
    //                 casper.then(function () {
    //                     casper.waiter(240, 600); // do recover
    //                 });
    //                 casper.then(function () {
    //                     this.makeDecisionByStatus();
    //                 });
    //             }
    //         });
    //     }
    //     if (this.exists('Перелезть через забор')) {
    //         this.clickLabel('Перелезть через забор');
    //     }

        // if () {
        //     this.makeQuestBankir();
        // }
    // });
    casper.then(function() {
        this.clickLabel('Перелезть через забор');
    });
    casper.then(function() {
        this.clickLabel('Перелезть через забор');
    });
    casper.then(function() {
        this.clickLabel('Перелезть через забор');
    });
};


/**
 * Navigation to kartina's location
 */

casper.moveKartina = function moveKartina() {
    casper.then(function() {
        this.echo("Navigate to kartina's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('kartina')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest with kartina...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.makeQuestKartina();
        });
    } else {
        casper.then(function() {
            this.echo("Go to kartina...");
        });
        casper.then(function() {
            this.moveAmulet('sz');
        });
        casper.then(function() {
            this.clickLabel('Идти к Западным воротам');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток - Центральная площадь');
        });
        casper.then(function() {
            this.clickLabel('Северные ворота');
        });
        casper.then(function() {
            this.clickLabel('Идти в боевые кварталы');
        });
        casper.then(function() {
            this.moveBankir();
        });
    }
};


/**
 * Make quest kartina
 */

casper.makeQuestKartina = function makeQuestKartina() {
    casper.then(function() {
        this.echo('Making quest:' + 'makeQuestKartina');
        this.waiter(3, 6);
    });
    casper.then(function() {
        // if () {
        //     this.makeQuestKartina();
        // }
    });
    casper.then(function() {

    });
};


/**
 * Navigation to torgovets's location
 */

casper.moveTorgovets = function moveTorgovets() {
    casper.then(function() {
        this.echo("Navigate to torgovets's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('torgovets')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest torgovets...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.makeQuestTorgovets();
        });
    } else {
        casper.then(function() {
            this.echo("Go to torgovets...");
        });
        casper.then(function() {
            this.moveAmulet('su');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.moveTorgovets();
        });
    }
};


/**
 * Make quest torgovets
 */

casper.makeQuestTorgovets = function makeQuestTorgovets() {
    casper.then(function() {
        this.echo('Making quest:' + 'makeQuestTorgovets');
        this.waiter(3, 6);
    });
    casper.then(function() {
        // if () {
        //     this.makeQuestKartina();
        // }
    });
    casper.then(function() {

    });
};


/**
 * Navigation to ordo first's location
 */

casper.moveOrdoFirst = function moveOrdoFirst() {
    casper.then(function() {
        this.echo("Navigate to ordoFirst's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('ordoFirst')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest ordoFirst...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.makeOrdoFirst();
        });
    } else {
        casper.then(function() {
            this.echo("Go to ordoFirst...");
        });
        casper.then(function() {
            this.moveAmulet('su');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.moveOrdoFirst();
        });
    }
};


/**
 * Make quest ordoFirst
 */

casper.makeOrdoFirst = function makeOrdoFirst() {
    casper.then(function() {
        this.echo('Making quest:' + 'makeOrdoFirst');
        this.waiter(3, 6);
    });
    casper.then(function() {
        // if () {
        //     this.makeQuestKartina();
        // }
    });
    casper.then(function() {

    });
};


/**
 * Navigation to ordoSecond's location
 */

casper.moveOrdoSecond = function moveOrdoSecond() {
    casper.then(function() {
        this.echo("Navigate to ordoSecond's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('ordoSecond')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest ordoSecond...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.makeOrdoSecond();
        });
    } else {
        casper.then(function() {
            this.echo("Go to ordoSecond...");
        });
        casper.then(function() {
            this.moveAmulet('sz');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.moveOrdoSecond();
        });
    }
};


/**
 * Make quest ordoSecond
 */

casper.makeOrdoSecond = function makeOrdoSecond() {
    casper.then(function() {
        this.echo('Making quest:' + 'makeQuestKartina');
        this.waiter(3, 6);
    });
    casper.then(function() {
        // if () {
        //     this.makeQuestKartina();
        // }
    });
    casper.then(function() {

    });
};


/**
 * Navigation to harch1's location
 */

casper.harch1 = function harch1() {
    casper.then(function() {
        this.echo("Navigate to harch1's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('harch1')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate battle with harch1...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            // this.clickLabel();
        });
        casper.then(function() {
            this.battle();
        });
    } else {
        casper.then(function() {
            this.echo("Go to harch1...");
        });
        casper.then(function() {
            this.moveKonj('vo');
        });
        casper.then(function() {
            this.clickLabel('Плыть на Волчьи острова');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад - вглубь острова');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Подойти к дереву');
        });
        casper.then(function() {
            this.clickLabel('Собрать сок');
        });
        casper.then(function() {
            this.clickLabel('В игру');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.harch1();
        });
    }
};


/**
 * Navigation to harch2's location
 */

casper.harch2 = function harch2() {
    casper.then(function() {
        this.echo("Navigate to harch2's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('harch2')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate battle with harch2...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            // this.clickLabel();
        });
        casper.then(function() {
            this.battle();
        });
    } else {
        casper.then(function() {
            this.echo("Go to harch2...");
        });
        casper.then(function() {
            this.moveKonj('le');
        });
        casper.then(function() {
            this.clickLabel('Идти на восток');
        });
        casper.then(function() {
            this.harch2();
        });
    }
};


/**
 * Navigation to harch3's location
 */

casper.harch3 = function harch3() {
    casper.then(function() {
        this.echo("Navigate to harch3's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('harch3')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate battle with harch3...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            // this.clickLabel();
        });
        casper.then(function() {
            this.battle();
        });
    } else {
        casper.then(function() {
            this.echo("Go to harch3...");
        });
        casper.then(function() {
            this.moveKonj('gd');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на юг');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на север');
        });
        casper.then(function() {
            this.harch3();
        });
    }
};


/**
 * Navigation to edaDlyaRybaka1's location
 */

casper.edaDlyaRybaka1 = function edaDlyaRybaka1() {
    casper.then(function() {
        this.echo("Navigate to edaDlyaRybaka1's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('edaDlyaRybaka1')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest edaDlyaRybaka1...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Дойти до деревни');
        });
        casper.then(function() {
            this.clickLabel('- Конечно, бабушка, давай еду.');
        });
        casper.then(function() {
            this.clickLabel('В игру');
        });
        casper.then(function() {
            this.edaDlyaRybaka2();
        });
    } else {
        casper.then(function() {
            this.echo("Go to edaDlyaRybaka1...");
        });
        casper.then(function() {
            this.moveAmulet('sv');
        });
        casper.then(function() {
            this.edaDlyaRybaka1();
        });
    }
};


/**
 * Navigation to edaDlyaRybaka2's location
 */

casper.edaDlyaRybaka2 = function edaDlyaRybaka2() {
    casper.then(function() {
        this.echo("Navigate to edaDlyaRybaka2's location...");
        this.waiter(3, 6);
    });
    if (casper.isFocusOutFromBattle()) {
        casper.then(function() {
            this.click('a[href^="arena_go"]');
        });
        casper.then(function() {
            casper.waiter(3, 6);
        });
        casper.then(function() {
            casper.battle();
        });
    }
    if (this.isProperLocation('edaDlyaRybaka2')) {
        var status;
        casper.then(function() {
            status = this.createStatus();
            statusPrint = status;
            this.printStatus(healthPrint, timePrint, statusPrint);
        });
        casper.then(function() {
            this.echo("Initiate quest edaDlyaRybaka2...");
            this.waiter(3, 6);
        });
        casper.then(function() {
            this.clickLabel('Войти в лачугу');
        });
        casper.then(function() {
            this.clickLabel('- Да, возьмите.');
        });
        casper.then(function() {
            this.clickLabel('В игру');
        });
    } else {
        casper.then(function() {
            this.echo("Go to edaDlyaRybaka2...");
        });
        casper.then(function() {
            this.moveKonj('mu');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.clickLabel('Идти на запад');
        });
        casper.then(function() {
            this.edaDlyaRybaka2();
        });
    }
};


/**
 * Take assassin's quest
 */

casper.takeQuestAss = function takeQuestAss(typeOfQuest) {
    casper.then(function() {
        this.waiter(3, 6);
    });
    casper.then(function() {
        this.moveAmulet('sz');
    });
    casper.then(function() {
        this.clickLabel('Идти к Западным воротам');
    });
    casper.then(function() {
        this.clickLabel('Гильдия асассинов');
    });
    casper.then(function() {
        this.clickLabel('Отказаться от задания');
    });
    casper.then(function() {
        this.click('a.button150');
    });
    casper.then(function() {
        if (typeOfQuest == 'b') {
            this.clickLabel('Убить банкира');
        } else if (typeOfQuest == 'k') {
            this.clickLabel('Украсть картину');
        } else if (typeOfQuest == 't') {
            this.clickLabel('Убить торговца');
        }
    });
    casper.then(function() {
        this.clickLabel('В игру');
    });
    casper.then(function() {
        this.echo("Assassin quest was taken: " + typeOfQuest + ". Go to desired location.")
    });
};


/**
 * Take ordo's quest
 */

casper.takeQuestOrdo = function takeOrdoAss(typeOfQuest) {
    casper.then(function() {
        this.waiter(3, 6);
    });
    casper.then(function() {
        this.moveAmulet('su');
    });
    casper.then(function() {
        this.clickLabel('Идти на восток');
    });
    casper.then(function() {
        this.clickLabel('Башня Ордо Экзекуторс');
    });
    casper.then(function() {
        if (this.exists('a[href*="go=2"]')) {
            casper.then(function() {
                this.clickLabel('Отказаться от задания');
            });
            casper.then(function() {
                this.clickLabel('Вы отказались от задания');
            });
        }
    });
    casper.then(function() {
        if (typeOfQuest == 'f') {
            this.clickLabel('Уничтожить главаря банды');
        } else if (typeOfQuest == 's') {
            this.clickLabel('Уничтожить банду');
        }
    });
    casper.then(function() {
        this.clickLabel('В игру');
    });
    casper.then(function() {
        this.echo("Ordo quest was taken: " + typeOfQuest + ". Go to desired location.")
    });
};
