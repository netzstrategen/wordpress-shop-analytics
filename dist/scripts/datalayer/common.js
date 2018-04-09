"use strict";

document.shopAnalytics = {
    getProductsData: function(t) {
        var e = [];
        return t.each(function() {
            var t = jQuery(this), a = {
                name: t.data("name"),
                id: t.data("sku") + "",
                price: t.data("price"),
                brand: t.data("brand"),
                category: t.data("category")
            }, o = t.data();
            o.variant && (a.variant = o.variant), o.quantity && (a.quantity = parseInt(o.quantity)), 
            o.position && (a.position = o.position), o.list && (a.list = o.list), e.push(a);
        }), e;
    },
    getProductsListType: function(t) {
        return t.closest(".cross-sells").length ? "Cross-sells products" : t.closest(".related").length ? "Related products" : "Product Category";
    },
    postToDataLayer: function(t, e) {
        "object" == typeof e && (console.dir(e), t = t || [], window.dataLayer.push(e));
    }
}, function(t, e) {
    function a(a, o) {
        var r = e(o && o.responseText ? o.responseText : document).find(".shop-analytics-product-details");
        if (r.length && !r.parents(".shop-analytics-order-details").length) {
            var c = 1, s = "";
            r.each(function(t) {
                e(this).closest(".cart").length && r.splice(t, 1);
            }), r.each(function(t) {
                var a = e(this), o = i.getProductsListType(a);
                s !== o && (s = o, c = 1), a.data("position", c++), a.data("list", o);
            });
            var n = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: r.first().data("currency"),
                    impressions: i.getProductsData(r)
                }
            };
            i.postToDataLayer(t, n);
        }
    }
    function o() {
        var a = e(this).closest(".product").find(".shop-analytics-product-details"), o = a.first().data("list"), r = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: o
                    },
                    products: i.getProductsData(a)
                }
            }
        };
        Cookies.set("shop-analytics-list-type", o, new Date(new Date().getTime() + 6e5)), 
        i.postToDataLayer(t, r);
    }
    function r() {
        var t = e(".cart .cart_item td.product-remove .remove");
        s(t), n(t);
    }
    function c() {
        s(e(this)), n(e(this));
    }
    function s(t) {
        t.each(function() {
            var t = e(this), a = t.data("item_key");
            t.data("quantity", e('[name="cart[' + a + '][qty]"]').val());
        });
    }
    function n(e) {
        var a = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: i.getProductsData(e)
                }
            }
        };
        i.postToDataLayer(t, a);
    }
    var i = document.shopAnalytics;
    e(a), e(document).ajaxComplete(a).on("click", ".products .product a", o).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", c).on("click", "th.product-remove .remove", r);
}(window.dataLayer, jQuery);
