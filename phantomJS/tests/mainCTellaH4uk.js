/**
 * Created by snikiforov on 25.10.16.
 */
casper.userAgent(chromeLinux);
casper.start();

var login1 = loginCTellaH4uk;
var psw1 = pswCTellaH4uk;
casper.then(function() {
    casper.test.comment('SUITE TEST #1. START.');
});

casper.then(function() {
    casper.login(login1, psw1);
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
