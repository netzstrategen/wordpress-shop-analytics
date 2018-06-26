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
    getVariationId: function() {
        return jQuery(".woocommerce-variation-add-to-cart-enabled .variation_id").val();
    },
    getVariationName: function(t) {
        return jQuery("#data-shop-analytics-" + t).data("custom-product-name");
    },
    postToDataLayer: function(t) {
        "object" == typeof t && (shop_analytics_settings.datalayer_console_log && console.dir(t), 
        window.dataLayer.push(t));
    }
}, function(t) {
    function a(a, e) {
        var o = t(e && e.responseText ? e.responseText : document).find(".shop-analytics-product-details");
        if (o.length && !o.parents(".shop-analytics-order-details").length) {
            var r = 1, c = "";
            o.each(function(a) {
                var e = t(this), o = i.getProductsListType(e);
                c !== o && (c = o, r = 1), e.data("position", r++), e.data("list", o);
            });
            var n = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: o.first().data("currency"),
                    impressions: i.getProductsData(o)
                }
            };
            i.postToDataLayer(n);
        }
    }
    function e() {
        var a = t(this).closest(".product").find(".shop-analytics-product-details"), e = a.first().data("list"), o = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: e
                    },
                    products: i.getProductsData(a)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", e), i.postToDataLayer(o);
    }
    function o() {
        var a = t(".cart .cart_item td.product-remove .remove");
        c(a), n(a);
    }
    function r() {
        c(t(this)), n(t(this));
    }
    function c(a) {
        a.each(function() {
            var a = t(this), e = a.data("item_key");
            a.data("quantity", t('[name="cart[' + e + '][qty]"]').val());
        });
    }
    function n(t) {
        var a = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: i.getProductsData(t)
                }
            }
        };
        i.postToDataLayer(a);
    }
    var i = document.shopAnalytics;
    t(a), t(document).ajaxComplete(a).on("click", ".products .product a", e).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", r).on("click", "th.product-remove .remove", o);
}(jQuery);
