"use strict";

!function(t, a) {
    function e() {
        var e = a(".cart .shop-analytics-product-details"), i = Cookies.get("shop-analytics-list-type"), o = {
            event: "EECproductDetailView",
            ecommerce: {
                detail: {
                    actionField: {
                        list: "Product detail"
                    },
                    products: c.getProductsData(e)
                }
            }
        };
        i && (o.ecommerce.detail.actionField.list = i, Cookies.remove("shop-analytics-list-type")), 
        c.postToDataLayer(t, o);
    }
    function i() {
        var t = a(this);
        t.closest(".quantity").siblings(".shop-analytics-product-details").data("quantity", t.val());
    }
    function o() {
        if (!a(this).is(".disabled")) {
            var e = a(".cart .shop-analytics-product-details"), i = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: e.first().data("currency"),
                    add: {
                        products: c.getProductsData(e)
                    }
                }
            };
            c.postToDataLayer(t, i);
        }
    }
    var c = document.shopAnalytics;
    a(e), a(document).on("change", ".cart .quantity .qty", i).on("click", ".single_add_to_cart_button", o);
}(window.dataLayer, jQuery);
