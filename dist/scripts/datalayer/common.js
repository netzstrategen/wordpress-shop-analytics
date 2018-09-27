"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(t) {
        var e = [];
        return t.each(function() {
            var t = jQuery(this), o = t.data(), a = {
                name: o.name,
                id: String(o.sku),
                price: o.price,
                category: o.category
            };
            o.brand && (a.brand = o.brand), o.variant && (a.variant = o.variant), o.quantity && (a.quantity = parseInt(o.quantity)), 
            o.position && (a.position = o.position), o.list && (a.list = o.list), e.push(a);
        }), e;
    },
    getProductsListType: function(t) {
        return t.closest(".cross-sells").length ? "Cross-sells products" : t.closest(".related").length ? "Related products" : "Product Category";
    },
    getProductVariationAttributes: function(t) {
        var e = [];
        return jQuery(t).each(function() {
            var t = jQuery(this);
            t.val().trim() && e.push(t.text().trim());
        }), e.join(", ");
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
    },
    event: {
        click: {
            login: '.woocommerce-form-login button[name="login"]',
            register: '.woocommerce-form-register button[name="register"]',
            registerOnCheckoutSubmit: ".woocommerce-checkout #place_order"
        }
    }
}, function(t) {
    function e(e, o) {
        var a = t(o && o.responseText ? o.responseText : document).find(".shop-analytics-product-details");
        if (a.length && !a.parents(".shop-analytics-order-details").length) {
            var n = 1, r = "";
            a.each(function(e) {
                var o = t(this), a = i.getProductsListType(o);
                r !== a && (r = a, n = 1), o.data("position", n++), o.data("list", a);
            });
            var c = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: a.first().data("currency"),
                    impressions: i.getProductsData(a)
                }
            };
            i.postToDataLayer(c);
        }
    }
    function o() {
        var e = t(this).closest(".product").find(".shop-analytics-product-details"), o = e.first().data("list"), a = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: o
                    },
                    products: i.getProductsData(e)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", o), i.postToDataLayer(a);
    }
    function a() {
        var t = {
            event: "UniversalEvent",
            eventCategory: "User",
            eventAction: "Click",
            eventLabel: "login"
        };
        i.postToDataLayer(t);
    }
    function n() {
        var t = {
            event: "UniversalEvent",
            eventCategory: "User",
            eventAction: "Click",
            eventLabel: "register"
        };
        i.postToDataLayer(t);
    }
    function r() {
        t("#createaccount").is(":checked") && n();
    }
    var i = document.shopAnalytics;
    t(e), t(document).on("click", ".products .product a", o).on("click", document.shopAnalytics.event.click.login, a).on("click", document.shopAnalytics.event.click.register, n).on("click", document.shopAnalytics.event.click.registerOnCheckoutSubmit, r);
}(jQuery);
