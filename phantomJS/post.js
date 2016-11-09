/**
 * Created by snikiforov on 25.10.16.
 */

casper.start();

casper.then(function() {
    casper.test.comment('POST-section. START.');
});


casper.then(function() {
    casper.test.comment('POST-section. END.');
});

casper.then(function() {

});

casper.run(function() {
    this.test.done();
});

