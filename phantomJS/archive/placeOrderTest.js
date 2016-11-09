// /**
//  * Created by snikiforov on 25.10.16.
//  */
//
casper.start();

casper.then(function () {
    // this.makeCapture();
    this.test.assertTrue(true);
});

casper.run(function() {
    this.test.done();
});

// var counterItemsInCart = 0;
// var itemsInCart = [];
//
// casper.then(function() {
//     casper.test.comment('SUITE TEST #2. START. Place an order to the cart.');
// });
//
// casper.then(function() {
//     casper.login(emailMain, passwordMain);
// });
//
// casper.then(function () {
//     this.test.assertHttpStatus(httpStatusOk);
//     this.test.assertEquals(this.getCurrentUrl(), indexPageUrl + "/");
//     this.test.assertExist(profileUserAnchorSelector);
//     this.test.assertDoesntExist(loginSessionAnchorSelector);
// });
//
// casper.then(function() {
//     this.click(cartAnchorSelector);
// });
//
// casper.then(function() {
//     this.openIndexPage();
// });
//
// // grab item to cart from header
// casper.then(function() {
//     var productFromHeader = 'a[href="' + this.getHrefIndexHeader(0) + '"]';
//     casper.then(function () {
//         casper.placeProductToCart(productFromHeader);
//     });
// });
//
// // grab items to cart from middle and bottom
// casper.then(function() {
//     this.openIndexPage();
// });
//
// casper.then(function() {
//     var blocksCount = this.evaluate(function() {
//         return document.getElementsByClassName('index-fish-list').length;
//     });
//
//     // will contain href of products by count: 'blocksCount' (2 at now)
//     var productsFromBlocks = [];
//
//     for (var i = 0; i < blocksCount; i++) {
//         productsFromBlocks.push(this.getHrefIndexFishList(i));
//     }
//
//     var firstProductSelector = 'a[href="' + productsFromBlocks[0] + '"]';
//     var secondProductSelector = 'a[href="' + productsFromBlocks[1] + '"]';
//
//     // TODO: wrap this into for loop with resolving problem "mutable variable is accessible from closure"
//     casper.then(function () {
//         casper.placeProductToCart(firstProductSelector);
//     });
//
//     casper.then(function () {
//         this.back();
//     });
//
//     casper.then(function () {
//         casper.placeProductToCart(secondProductSelector);
//     });
// });
//
// // grab items to cart from search
// casper.then(function() {
//     this.openIndexPage();
// });
//
// casper.then(function() {
//     this.fillSearchInput('octopus');
// });
//
// casper.then(function() {
//     var productId = casper.getProductIdSearchPage();
//     var searchProductSelector = 'a[id="' + productId + '"]';
//     this.placeProductToCart(searchProductSelector);
// });
//
// casper.then(function() {
//     this.click(cartAnchorSelector);
// });
//
// casper.then(function() {
//     this.waitForUrl(indexPageUrl + cartUrl, function() {
//         //do nothing
//     });
// });
//
// casper.then(function() {
//     var itemsInCartFactCount = this.evaluate(function() {
//         return window.cartPage.options.itemCount;
//     });
//     this.echo("\nProducts in cart (fact, value taken from JS variable): " + itemsInCartFactCount);
//
//     var itemsInCartFactIDs = this.evaluate(function() {
//         return window.cartPage.options.shopCartItems;
//     });
//     var listOfProductsInCart = [];
//     for (var key in itemsInCartFactIDs) {
//         listOfProductsInCart.push(key);
//     }
//     this.echo("Product IDs from cart (fact): " + listOfProductsInCart.join(', '));
//
// });
//
// casper.then(function() {
//     if (counterItemsInCart > 0) {
//         this.click(placeOrderButton);
//     } else {
//         this.die("Zero items in cart. Please launch test suite again. Or rewrite this shit.");
//     }
// });
//
// casper.then(function() {
//     this.waitForUrl(ordersUserWithRegexUrl, function() {
//         //do nothing
//     });
// });
//
// casper.then(function() {
//     if (this.exists('div.alert-success')) {
//         this.echo("\n" + this.fetchText('div.alert-success'));
//         this.test.assertUrlMatch(ordersUserWithRegexUrl);
//         this.test.assertTextExists(this.fetchText('div.alert-success'));
//     }
// });
//
// casper.then(function() {
//     casper.test.comment('SUITE TEST #2. END.');
// });
//
// casper.run(function() {
//     this.test.done();
// });
