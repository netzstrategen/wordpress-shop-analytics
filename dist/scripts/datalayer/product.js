"use strict";

!function(t) {
    function e() {
        var e = t(".shop-analytics-single-product-details");
        if (e.length) {
            var a, o = localStorage.getItem("shop-analytics-list-type"), c = {
                event: "EECproductDetailView",
                ecommerce: {
                    detail: {
                        actionField: {
                            list: "Product detail"
                        },
                        products: i.getProductsData(e)
                    }
                }
            };
            o && (c.ecommerce.detail.actionField.list = o, localStorage.removeItem("shop-analytics-list-type")), 
            (a = i.getProductVariationAttributes(".variations_form option:selected")) && (c.ecommerce.detail.products[0].variant = a), 
            i.postToDataLayer(c);
        }
    }
    function a() {
        var e = t(this);
        t(".shop-analytics-single-product-details").data("quantity", e.val());
    }
    var i = document.shopAnalytics;
    t(e), t(document).on("change", ".cart .quantity .qty", a);
}(jQuery);
