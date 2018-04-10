"use strict";

!function(t) {
    function a() {
        var a = t(".cart .shop-analytics-product-details"), e = localStorage.getItem("shop-analytics-list-type"), c = {
            event: "EECproductDetailView",
            ecommerce: {
                detail: {
                    actionField: {
                        list: "Product detail"
                    },
                    products: o.getProductsData(a)
                }
            }
        };
        e && (c.ecommerce.detail.actionField.list = e, localStorage.removeItem("shop-analytics-list-type")), 
        o.postToDataLayer(c);
    }
    function e() {
        var a = t(this);
        a.closest(".quantity").siblings(".shop-analytics-product-details").data("quantity", a.val());
    }
    function c() {
        if (!t(this).is(".disabled")) {
            var a, e = t(".cart .shop-analytics-product-details"), c = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: e.first().data("currency"),
                    add: {
                        products: o.getProductsData(e)
                    }
                }
            };
            a = i(), a && (c.ecommerce.add.products[0].variant = a), o.postToDataLayer(c);
        }
    }
    function i() {
        var a = [];
        return t(".variations_form option:selected").each(function() {
            t(this).val().trim() && a.push(t(this).text().trim());
        }), a.join(", ");
    }
    var o = document.shopAnalytics;
    t(a), t(document).on("change", ".cart .quantity .qty", e).on("click", ".single_add_to_cart_button", c);
}(jQuery);
