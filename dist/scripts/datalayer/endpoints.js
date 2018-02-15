"use strict";

!function(a) {
    function e() {
        "order-received" === endpoint_id && t();
    }
    function t() {
        var e = a(document).find(".shop-analytics-order-details"), t = e.find(".shop-analytics-product-details"), i = {
            event: "EECpurchase",
            ecommerce: {
                purchase: {
                    actionField: {
                        id: e.data("id") + "",
                        revenue: e.data("revenue") + "",
                        tax: e.data("tax") + "",
                        shipping: e.data("shipping") + ""
                    }
                },
                products: d.getProductsData(t)
            }
        };
        d.postToDataLayer(dataLayer, i);
    }
    var d = document.shopAnalytics;
    a(e);
}(jQuery);
