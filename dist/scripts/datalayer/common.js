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
        "object" == typeof t && ("on" === shop_analytics_settings.datalayer_console_log && console.dir(t), 
        window.dataLayer.push(t));
    }
}, function(t) {
    function a(a, e) {
        var o = t(e && e.responseText ? e.responseText : document).find(".shop-analytics-product-details");
        if (o.length && !o.parents(".shop-analytics-order-details").length) {
            var r = 1, n = "";
            o.each(function(a) {
                var e = t(this), o = i.getProductsListType(e);
                n !== o && (n = o, r = 1), e.data("position", r++), e.data("list", o);
            });
            var c = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: o.first().data("currency"),
                    impressions: i.getProductsData(o)
                }
            };
            i.postToDataLayer(c);
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
        n(a), c(a);
    }
    function r() {
        n(t(this)), c(t(this));
    }
    function n(a) {
        a.each(function() {
            var a = t(this), e = a.data("item_key");
            a.data("quantity", t('[name="cart[' + e + '][qty]"]').val());
        });
    }
    function c(t) {
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
    t(document).ajaxSuccess(function(a, e, o) {
        if (void 0 !== o && void 0 !== o.data && o.data.indexOf("nm_cart_panel_remove_product") >= 0) {
            var r = o.data.indexOf("cart_item_key=") + 14, i = o.data.substring(r);
            t('a[data-item_key="' + i + '"]');
            n(t('a[data-item_key="' + i + '"]')), c(t('a[data-item_key="' + i + '"]'));
        }
    }), t(a), t(document).ajaxComplete(a).on("click", ".products .product a", e).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", r).on("click", "th.product-remove .remove", o);
}(jQuery);
