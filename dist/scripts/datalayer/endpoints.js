"use strict";

!function(t) {
    function e() {
        "order-received" === endpoint_id && a();
    }
    function a() {
        var e = t(document).find(".shop-analytics-order-details"), a = e.find(".shop-analytics-product-details"), n = {
            event: "EECpurchase",
            ecommerce: {
                purchase: {
                    actionField: {
                        id: String(e.data("id")),
                        revenue: String(e.data("revenue")),
                        tax: String(e.data("tax")),
                        shipping: String(e.data("shipping"))
                    }
                },
                products: i.getProductsData(a)
            }
        };
        i.postToDataLayer(n);
    }
    var i = document.shopAnalytics;
    t(e);
}(jQuery);
