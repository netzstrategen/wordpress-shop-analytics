"use strict";

window.dataLayer = window.dataLayer || [], document.shopAnalytics = {
    getProductsData: function(e) {
        var t = [];
        return e.each(function() {
            var e = jQuery(this), o = e.data(), i = {
                name: o.name,
                id: String(o.sku),
                price: o.price,
                category: o.category
            };
            o.brand && (i.brand = o.brand), o.variant && (i.variant = o.variant), o.quantity && (i.quantity = parseInt(o.quantity)), 
            o.position && (i.position = o.position), o.list && (i.list = o.list), t.push(i);
        }), t;
    },
    getProductsListType: function(e) {
        return e.closest(".cross-sells").length ? "Cross-sells products" : e.closest(".related").length ? "Related products" : "Product Category";
    },
    getProductVariationAttributes: function(e) {
        var t = [];
        return jQuery(e).each(function() {
            var e = jQuery(this);
            e.val().trim() && t.push(e.text().trim());
        }), t.join(", ");
    },
    getVariationId: function() {
        return jQuery(".woocommerce-variation-add-to-cart-enabled .variation_id").val();
    },
    getVariationName: function(e) {
        return jQuery("#data-shop-analytics-" + e).data("custom-product-name");
    },
    updateCartItemsQuantity: function(e) {
        e.each(function() {
            var e = jQuery(this), t = e.data("item_key");
            e.data("quantity", jQuery('[name="cart[' + t + '][qty]"]').val());
        });
    },
    postToDataLayer: function(e) {
        "object" == typeof e && ("on" === shop_analytics_settings.datalayer_console_log && console.dir(e), 
        window.dataLayer.push(e));
    },
    event: {
        click: {
            login: '.woocommerce-form-login button[name="login"]',
            register: '.woocommerce-form-register button[name="register"]',
            registerOnCheckout: ".woocommerce-checkout #place_order"
        }
    },
    cart: {
        elements: {
            product: ".shop-analytics-product-info",
            shippingMethods: 'select.shipping_method, input[name^="shipping_method"]',
            shippingMethodSelected: 'select.shipping_method:selected, input[name^="shipping_method"]:checked',
            paymentMethods: 'select.payment_method, input[name^="payment_method"]',
            paymentMethodSelected: 'select.payment_method:selected, input[name^="payment_method"]:checked'
        }
    },
    checkout: {
        dataInit: {
            event: "EECcheckout",
            ecommerce: {
                checkout: {
                    actionField: {
                        step: 0
                    },
                    products: []
                }
            }
        },
        elements: {
            shippingMethods: 'select.shipping_method, input[name^="shipping_method"]',
            shippingMethodSelected: 'select.shipping_method:selected, input[name^="shipping_method"]:checked',
            paymentMethods: 'input[name="payment_method"]',
            paymentMethodSelected: 'select.payment_method:selected, input[name="payment_method"]:checked',
            billingAddressFields: ".woocommerce-billing-fields input.input-text, .woocommerce-billing-fields select",
            billingAddressFieldsRequired: ".woocommerce-billing-fields .validate-required input.input-text, .woocommerce-billing-fields .validate-required select",
            shippingAddressFields: ".woocommerce-shipping-fields input.input-text, .woocommerce-shipping-fields select",
            shippingAddressFieldsRequired: ".woocommerce-shipping-fields .validate-required input.input-text, .woocommerce-shipping-fields .validate-required select",
            shippingAddressToggle: "#ship-to-different-address-checkbox"
        },
        messages: {
            shipToSameAddress: "Ship to same address",
            shipToDifferentAddress: "Ship to different address"
        }
    },
    product: {
        elements: {
            singleProductDetails: ".shop-analytics-single-product-details"
        }
    }
}, function(e) {
    function t() {
        var t = e(document).find(".shop-analytics-product-details");
        if (t.length && !t.parents(".shop-analytics-order-details").length) {
            p || (p = t.length);
            var i = 1, n = "";
            t.each(function(t) {
                var o = e(this), a = l.getProductsListType(o);
                n !== a && (n = a, i = 1), o.data("position", i++), o.data("list", a);
            }), t.length > p && (t = t.filter("body.woocommerce ul.products .shop-analytics-product-details").slice(p), 
            p = t.length);
            var a = {
                event: "EECproductImpression",
                ecommerce: {
                    currencyCode: t.first().data("currency"),
                    impressions: l.getProductsData(t)
                }
            };
            l.postToDataLayer(a), u || (u = o());
        }
    }
    function o() {
        var e = document.querySelector("body.woocommerce ul.products");
        if (e) {
            return new MutationObserver(function(e) {
                e.forEach(function(e) {
                    null !== e.addedNodes && t();
                });
            }).observe(e, {
                childList: !0
            });
        }
    }
    function i() {
        var t = e(this).closest(".product").find(".shop-analytics-product-details"), o = t.first().data("list"), i = {
            event: "EECproductClick",
            ecommerce: {
                click: {
                    actionField: {
                        list: o
                    },
                    products: l.getProductsData(t)
                }
            }
        };
        localStorage.setItem("shop-analytics-list-type", o), l.postToDataLayer(i);
    }
    function n() {
        var e = {
            event: "UniversalEvent",
            eventCategory: "User",
            eventAction: "Click",
            eventLabel: "login"
        };
        l.postToDataLayer(e);
    }
    function a() {
        var e = {
            event: "UniversalEvent",
            eventCategory: "User",
            eventAction: "Click",
            eventLabel: "register"
        };
        l.postToDataLayer(e);
    }
    function c() {
        e("#createaccount").is(":checked") && a();
    }
    function r() {
        var t = e(l.cart.elements.product);
        l.updateCartItemsQuantity(t), d(t);
    }
    function s() {
        var t = e(this).prev(l.cart.elements.product);
        l.updateCartItemsQuantity(t), d(t);
    }
    function d(e) {
        var t = l.getProductsData(e), o = {
            event: "EECremoveFromCart",
            ecommerce: {
                remove: {
                    products: t
                }
            }
        };
        localStorage.setItem("productsInCartData", JSON.stringify(t)), l.postToDataLayer(o);
    }
    var l = document.shopAnalytics, p = 0, u = 0;
    e(t), e(document).on("click", l.event.click.login, n).on("click", l.event.click.register, a).on("click", l.event.click.registerOnCheckout, c).ajaxComplete(t).on("click", ".products .product a", i).on("click", ".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove", s).on("click", "th.product-remove .remove", r);
}(jQuery);
