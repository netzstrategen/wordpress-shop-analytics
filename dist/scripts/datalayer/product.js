"use strict";

!function(t) {
    function e() {
        var e = t(".shop-analytics-single-product-details");
        if (e.length) {
            var a, i = localStorage.getItem("shop-analytics-list-type"), n = {
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
            i && (n.ecommerce.detail.actionField.list = i, localStorage.removeItem("shop-analytics-list-type")), 
            (a = o.getProductVariationAttributes(".variations_form option:selected")) && (n.ecommerce.detail.products[0].variant = a), 
            o.postToDataLayer(n);
        }
    }
    function a() {
        var e = t(this);
        t(".shop-analytics-single-product-details").data("quantity", e.val());
    }
    function i() {
        var e = (t(this), {
            event: "UniversalEvent",
            eventCategory: "Products",
            eventAction: "clicked express",
            eventLabel: ""
        }), a = o.getProductsData(t(o.product.elements.singleProductDetails))[0];
        a.name && (e.eventLabel = a.name), o.postToDataLayer(e);
    }
    var o = document.shopAnalytics;
    t(e), t(document).on("change", ".cart .quantity .qty", a).on("change", "#lowest_delivery_variations", i);
}(jQuery);
