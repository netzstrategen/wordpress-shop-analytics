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
                    products: s.getProductsData(e)
                }
            }
        };
        i && (o.ecommerce.detail.actionField.list = i, Cookies.remove("shop-analytics-list-type")), 
        s.postToDataLayer(t, o);
    }
    function i() {
        var t = a(this);
        t.closest(".quantity").siblings(".shop-analytics-product-details").data("quantity", t.val());
    }
    function o() {
        if (!a(this).is(".disabled")) {
            var e, i = a(".cart .shop-analytics-product-details"), o = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: i.first().data("currency"),
                    add: {
                        products: s.getProductsData(i)
                    }
                }
            };
            e = c(), e && (o.ecommerce.add.products[0].variant = e), s.postToDataLayer(t, o);
        }
    }
    function c() {
        var t = "";
        return a(".variations_form option:selected").each(function() {
            a(this).val().trim() && (t += a(this).text().trim() + ", ");
        }), t.slice(0, -2);
    }
    var s = document.shopAnalytics;
    a(e), a(document).on("change", ".cart .quantity .qty", i).on("click", ".single_add_to_cart_button", o);
}(window.dataLayer, jQuery);
