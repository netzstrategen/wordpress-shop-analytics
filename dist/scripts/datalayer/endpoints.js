"use strict";

!function(e) {
    function t() {
        "order-received" === shop_analytics_endpoint_data.step && a();
    }
    function a() {
        var t = e(document).find(".shop-analytics-order-details"), a = t.find(".shop-analytics-product-details"), n = {
            event: "EECpurchase",
            ecommerce: {
                purchase: {
                    actionField: {
                        id: String(t.data("id")),
                        revenue: String(t.data("revenue")).replace(/,/g, ""),
                        tax: String(t.data("tax")).replace(/,/g, ""),
                        shipping: String(t.data("shipping")).replace(/,/g, "")
                    },
                    products: i.getProductsData(a)
                }
            }
        };
        i.postToDataLayer(n);
    }
    var i = document.shopAnalytics;
    e(t);
}(jQuery);
