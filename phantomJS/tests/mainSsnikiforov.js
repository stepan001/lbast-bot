/**
 * Created by snikiforov on 25.10.16.
 */
casper.userAgent(chromeWindows);
casper.start();

var login2 = "ssnikiforov";
var psw2 = "Aaa112233";
casper.then(function() {
    casper.test.comment('SUITE TEST #1. START.');
});

casper.then(function() {
    casper.login(login2, psw2);
});

casper.repeat(9999, function() {
    casper.then(function() {
        this.makeDecisionByStatus();
    });

    casper.then(function() {
        this.echo("Counter of battles: " + counterOfBattles);
        this.makeCapture();
    });
});

casper.then(function() {

});

casper.then(function() {

});

casper.then(function() {
    this.test.assertTrue(true);
    casper.test.comment('SUITE TEST #1. END.');
});

casper.run(function() {
    this.test.done();
});

casper.then(function() {

});
