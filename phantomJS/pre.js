/**
 * Created by snikiforov on 25.10.16.
 */

casper.start();

casper.then(function() {
    casper.test.comment('PRE-section. START.');
});

casper.then(function() {
    casper.test.comment('PRE-section. END.');
});

casper.run(function() {
    this.test.done();
});
