"use strict";

!function(t) {
    function a() {
        e();
    }
    function e() {
        var a = t(document).find(".shop-analytics-order-details"), e = a.find(".shop-analytics-product-details"), n = {
            event: "EECpurchase",
            ecommerce: {
                purchase: {
                    actionField: {
                        id: String(a.data("id")),
                        revenue: String(a.data("revenue")),
                        tax: String(a.data("tax")),
                        shipping: String(a.data("shipping"))
                    }
                },
                products: i.getProductsData(e)
            }
        };
        i.postToDataLayer(n);
    }
    var i = document.shopAnalytics;
    t(a);
}(jQuery);
