"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(t) {
        var a = [];
        return t.each(function() {
            var t = jQuery(this), e = {
                name: t.data("name"),
                id: String(t.data("sku")),
                price: t.data("price"),
                brand: t.data("brand"),
                category: t.data("category")
            }, o = t.data();
            o.variant && (e.variant = o.variant), o.quantity && (e.quantity = parseInt(o.quantity)), 
            o.position && (e.position = o.position), o.list && (e.list = o.list), a.push(e);
        }), a;
    },
    getProductsListType: function(t) {
        return t.closest(".cross-sells").length ? "Cross-sells products" : t.closest(".related").length ? "Related products" : "Product Category";
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
                t(this).closest(".cart").length && o.splice(a, 1);
            }), o.each(function(a) {
                var e = t(this), o = n.getProductsListType(e);
                c !== o && (c = o, r = 1), e.data("position", r++), e.data("list", o);
            });
            var s = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: o.first().data("currency"),
                    impressions: n.getProductsData(o)
                }
            };
            n.postToDataLayer(s);
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
                    products: n.getProductsData(a)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", e), n.postToDataLayer(o);
    }
    function o() {
        var a = t(".cart .cart_item td.product-remove .remove");
        c(a), s(a);
    }
    function r() {
        c(t(this)), s(t(this));
    }
    function c(a) {
        a.each(function() {
            var a = t(this), e = a.data("item_key");
            a.data("quantity", t('[name="cart[' + e + '][qty]"]').val());
        });
    }
    function s(t) {
        var a = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: n.getProductsData(t)
                }
            }
        };
        n.postToDataLayer(a);
    }
    var n = document.shopAnalytics;
    t(a), t(document).ajaxComplete(a).on("click", ".products .product a", e).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", r).on("click", "th.product-remove .remove", o);
}(jQuery);
