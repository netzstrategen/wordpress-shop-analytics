"use strict";

!function(t) {
    function a() {
        var a = t(".shop-analytics-single-product-details");
        if (a.length) {
            var e, i = localStorage.getItem("shop-analytics-list-type"), r = {
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
            i && (r.ecommerce.detail.actionField.list = i, localStorage.removeItem("shop-analytics-list-type")), 
            (e = o()) && (r.ecommerce.detail.products[0].variant = e), c.postToDataLayer(r);
        }
    }
    function e() {
        var a = t(this);
        a.closest(".cart").siblings(".shop-analytics-single-product-details").data("quantity", a.val());
    }
    function i() {
        if (!t(this).is(".disabled")) {
            var a, e, i, r = t(".shop-analytics-single-product-details"), s = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: r.first().data("currency"),
                    add: {
                        products: c.getProductsData(r)
                    }
                }
            };
            a = o(), a && (s.ecommerce.add.products[0].variant = a, e = c.getVariationId(), 
            s.ecommerce.add.products[0].id = e, (i = c.getVariationName(e)) && (s.ecommerce.add.products[0].name = i)), 
            c.postToDataLayer(s);
        }
    }
    function o() {
        var a = [];
        return t(".variations_form option:selected").each(function() {
            t(this).val().trim() && a.push(t(this).text().trim());
        }), a.join(", ");
    }
    var c = document.shopAnalytics;
    t(a), t(document).on("change", ".cart .quantity .qty", e).on("adding_to_cart", "body", i);
}(jQuery);
