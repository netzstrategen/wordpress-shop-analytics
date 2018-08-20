!function(t) {
    function e() {
        if (!t(this).is(".disabled")) {
            var e, a, o, r = t(".shop-analytics-single-product-details"), d = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: r.first().data("currency"),
                    add: {
                        products: c.getProductsData(r)
                    }
                }
            };
            e = c.getProductVariationAttributes(".variations_form option:selected"), e && (d.ecommerce.add.products[0].variant = e, 
            a = c.getVariationId(), d.ecommerce.add.products[0].id = a, (o = c.getVariationName(a)) && (d.ecommerce.add.products[0].name = o)), 
            c.postToDataLayer(d);
        }
    }
    function a() {
        r(t(".cart .cart_item td.product-remove .remove"));
    }
    function o() {
        r(t(this));
    }
    function r(e) {
        e.each(function() {
            var e = t(this), a = e.data("item_key");
            e.data("quantity", t('[name="cart[' + a + '][qty]"]').val());
        });
        var a = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: c.getProductsData(e)
                }
            }
        };
        c.postToDataLayer(a);
    }
    var c = document.shopAnalytics;
    t(document).on("click", ".single_add_to_cart_button", e).on("adding_to_cart", "body", e).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", o).on("click", "th.product-remove .remove", a), 
    t(document).ajaxSuccess(function(e, a, o) {
        if (void 0 !== o && void 0 !== o.data && o.data.indexOf("nm_cart_panel_remove_product") >= 0) {
            var c = o.data.indexOf("cart_item_key=") + 14, d = o.data.substring(c);
            t('a[data-item_key="' + d + '"]');
            r(t('a[data-item_key="' + d + '"]'));
        }
    });
}(jQuery);
