"use strict";

!function(t) {
    function a() {
        var a = t(".shop-analytics-single-product-details");
        if (a.length) {
            var e = localStorage.getItem("shop-analytics-list-type"), i = {
                event: "EECproductDetailView",
                ecommerce: {
                    detail: {
                        actionField: {
                            list: "Product detail"
                        },
                        products: c.getProductsData(a)
                    }
                }
            };
            e && (i.ecommerce.detail.actionField.list = e, localStorage.removeItem("shop-analytics-list-type")), 
            c.postToDataLayer(i);
        }
    }
    function e() {
        var a = t(this);
        a.closest(".cart").siblings(".shop-analytics-single-product-details").data("quantity", a.val());
    }
    function i() {
        if (!t(this).is(".disabled")) {
            var a, e = t(".shop-analytics-single-product-details"), i = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: e.first().data("currency"),
                    add: {
                        products: c.getProductsData(e)
                    }
                }
            };
            a = o(), a && (i.ecommerce.add.products[0].variant = a), c.postToDataLayer(i);
        }
    }
    function o() {
        var a = [];
        return t(".variations_form option:selected").each(function() {
            t(this).val().trim() && a.push(t(this).text().trim());
        }), a.join(", ");
    }
    var c = document.shopAnalytics;
    t(a), t(document).on("change", ".cart .quantity .qty", e).on("click", ".single_add_to_cart_button", i);
}(jQuery);
