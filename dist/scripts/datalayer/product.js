"use strict";

!function(t) {
    function e() {
        var e = t(".shop-analytics-single-product-details");
        if (e.length) {
            var a, i = localStorage.getItem("shop-analytics-list-type"), r = {
                event: "EECproductDetailView",
                ecommerce: {
                    detail: {
                        actionField: {
                            list: "Product detail"
                        },
                        products: o.getProductsData(e)
                    }
                }
            };
            i && (r.ecommerce.detail.actionField.list = i, localStorage.removeItem("shop-analytics-list-type")), 
            (a = c()) && (r.ecommerce.detail.products[0].variant = a), o.postToDataLayer(r);
        }
    }
    function a() {
        var e = t(this);
        e.closest(".cart").siblings(".shop-analytics-single-product-details").data("quantity", e.val());
    }
    function i(e) {
        if (e.preventDefault(), !t(this).is(".disabled")) {
            var a, i, r, s = t(".shop-analytics-single-product-details"), n = {
                event: "EECaddToCart",
                ecommerce: {
                    currencyCode: s.first().data("currency"),
                    add: {
                        products: o.getProductsData(s)
                    }
                }
            };
            a = c(), a && (n.ecommerce.add.products[0].variant = a, i = o.getVariationId(), 
            n.ecommerce.add.products[0].id = i, (r = o.getVariationName(i)) && (n.ecommerce.add.products[0].name = r)), 
            o.postToDataLayer(n);
        }
    }
    function c() {
        var e = [];
        return t(".variations_form option:selected").each(function() {
            t(this).val().trim() && e.push(t(this).text().trim());
        }), e.join(", ");
    }
    var o = document.shopAnalytics;
    t(e), t(document).on("change", ".cart .quantity .qty", a).on("click", ".single_add_to_cart_button", i);
}(jQuery);
