"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(t) {
        var e = [];
        return t.each(function() {
            var t = jQuery(this), o = t.data(), n = {
                name: o.name,
                id: String(o.sku),
                price: o.price,
                category: o.category
            };
            o.brand && (n.brand = o.brand), o.variant && (n.variant = o.variant), o.quantity && (n.quantity = parseInt(o.quantity)), 
            o.position && (n.position = o.position), o.list && (n.list = o.list), e.push(n);
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
            registerOnCheckout: ".woocommerce-checkout #place_order"
        }
    }
}, function(t) {
    function e() {
        var e = t(document).find(".shop-analytics-product-details");
        if (e.length && !e.parents(".shop-analytics-order-details").length) {
            s || (s = e.length);
            var n = 1, a = "";
            e.each(function(e) {
                var o = t(this), r = i.getProductsListType(o);
                a !== r && (a = r, n = 1), o.data("position", n++), o.data("list", r);
            }), e.length > s && (e = e.filter("body.woocommerce ul.products .shop-analytics-product-details").slice(s), 
            s = e.length);
            var r = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: e.first().data("currency"),
                    impressions: i.getProductsData(e)
                }
            };
            i.postToDataLayer(r), u || (u = o());
        }
    }
    function o() {
        var t = document.querySelector("body.woocommerce ul.products");
        return new MutationObserver(function(t) {
            t.forEach(function(t) {
                null !== t.addedNodes && e();
            });
        }).observe(t, {
            childList: !0
        });
    }
    function n() {
        var e = t(this).closest(".product").find(".shop-analytics-product-details"), o = e.first().data("list"), n = {
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
        localStorage.setItem("shop-analytics-list-type", o), i.postToDataLayer(n);
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
    function r() {
        var t = {
            event: "UniversalEvent",
            eventCategory: "User",
            eventAction: "Click",
            eventLabel: "register"
        };
        i.postToDataLayer(t);
    }
    function c() {
        t("#createaccount").is(":checked") && r();
    }
    var i = document.shopAnalytics, s = 0, u = 0;
    t(e), t(document).on("click", ".products .product a", n).on("click", document.shopAnalytics.event.click.login, a).on("click", document.shopAnalytics.event.click.register, r).on("click", document.shopAnalytics.event.click.registerOnCheckout, c);
}(jQuery);
