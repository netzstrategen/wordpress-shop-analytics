"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(t) {
        var e = [];
        return t.each(function() {
            var t = jQuery(this), a = t.data(), o = {
                name: a.name,
                id: String(a.sku),
                price: a.price.replace(/,/g, ""),
                category: a.category
            };
            a.brand && (o.brand = a.brand), a.variant && (o.variant = a.variant), a.quantity && (o.quantity = parseInt(a.quantity)), 
            a.position && (o.position = a.position), a.list && (o.list = a.list), e.push(o);
        }), e;
    },
    getProductsListType: function(t) {
        return t.closest(".cross-sells").length ? "Cross-sells products" : t.closest(".related").length ? "Related products" : "Product Category";
    },
    postToDataLayer: function(t) {
        "object" == typeof t && (shop_analytics_settings.datalayer_console_log && console.dir(t), 
        window.dataLayer.push(t));
    }
}, function(t) {
    function e(e, a) {
        var o = t(a && a.responseText ? a.responseText : document).find(".shop-analytics-product-details");
        if (o.length && !o.parents(".shop-analytics-order-details").length) {
            var r = 1, c = "";
            o.each(function(e) {
                var a = t(this), o = n.getProductsListType(a);
                c !== o && (c = o, r = 1), a.data("position", r++), a.data("list", o);
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
    function a() {
        var e = t(this).closest(".product").find(".shop-analytics-product-details"), a = e.first().data("list"), o = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: a
                    },
                    products: n.getProductsData(e)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", a), n.postToDataLayer(o);
    }
    function o() {
        var e = t(".cart .cart_item td.product-remove .remove");
        c(e), s(e);
    }
    function r() {
        c(t(this)), s(t(this));
    }
    function c(e) {
        e.each(function() {
            var e = t(this), a = e.data("item_key");
            e.data("quantity", t('[name="cart[' + a + '][qty]"]').val());
        });
    }
    function s(t) {
        var e = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: n.getProductsData(t)
                }
            }
        };
        n.postToDataLayer(e);
    }
    var n = document.shopAnalytics;
    t(e), t(document).ajaxComplete(e).on("click", ".products .product a", a).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", r).on("click", "th.product-remove .remove", o);
}(jQuery);
