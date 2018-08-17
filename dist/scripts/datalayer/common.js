"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(t) {
        var a = [];
        return t.each(function() {
            var t = jQuery(this), e = t.data(), o = {
                name: e.name,
                id: String(e.sku),
                price: e.price,
                category: e.category
            };
            e.brand && (o.brand = e.brand), e.variant && (o.variant = e.variant), e.quantity && (o.quantity = parseInt(e.quantity)), 
            e.position && (o.position = e.position), e.list && (o.list = e.list), a.push(o);
        }), a;
    },
    getProductsListType: function(t) {
        return t.closest(".cross-sells").length ? "Cross-sells products" : t.closest(".related").length ? "Related products" : "Product Category";
    },
    getProductVariationAttributes: function(t) {
        var a = [];
        return jQuery(t).each(function() {
            var t = jQuery(this);
            t.val().trim() && a.push(t.text().trim());
        }), a.join(", ");
    },
    getVariationId: function() {
        return jQuery(".woocommerce-variation-add-to-cart-enabled .variation_id").val();
    },
    getVariationName: function(t) {
        return jQuery("#data-shop-analytics-" + t).data("custom-product-name");
    },
    postToDataLayer: function(t) {
        "object" == typeof t && ("on" === shop_analytics_settings.datalayer_console_log && console.dir(t), 
        window.dataLayer.push(t));
    }
}, function(t) {
    function a(a, e) {
        var r = t(e && e.responseText ? e.responseText : document).find(".shop-analytics-product-details");
        if (r.length && !r.parents(".shop-analytics-order-details").length) {
            var n = 1, i = "";
            r.each(function(a) {
                var e = t(this), r = o.getProductsListType(e);
                i !== r && (i = r, n = 1), e.data("position", n++), e.data("list", r);
            });
            var s = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: r.first().data("currency"),
                    impressions: o.getProductsData(r)
                }
            };
            o.postToDataLayer(s);
        }
    }
    function e() {
        var a = t(this).closest(".product").find(".shop-analytics-product-details"), e = a.first().data("list"), r = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: e
                    },
                    products: o.getProductsData(a)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", e), o.postToDataLayer(r);
    }
    var o = document.shopAnalytics;
    t(a), t(document).on("click", ".products .product a", e);
}(jQuery);
