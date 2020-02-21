"use strict";window.dataLayer=window.dataLayer||[],document.shopAnalytics={getProductsData:function(e){var t=[];return e.each(function(){var e=jQuery(this),o=e.data(),a={name:o.name,id:String(o.sku),price:o.price,category:o.category};o.brand&&(a.brand=o.brand),o.variant&&(a.variant=o.variant),o.quantity&&(a.quantity=parseInt(o.quantity)),o.position&&(a.position=o.position),o.list&&(a.list=o.list),t.push(a)}),t},getProductsListType:function(e){return e.closest(".cross-sells").length?"Cross-sells products":e.closest(".related").length?"Related products":"Product Category"},getProductVariationAttributes:function(e){var t=[];return jQuery(e).each(function(){var e=jQuery(this);e.val().trim()&&t.push(e.text().trim())}),t.join(", ")},getVariationId:function(){return jQuery(".woocommerce-variation-add-to-cart-enabled .variation_id").val()},getVariationName:function(e){return jQuery("#data-shop-analytics-"+e).data("custom-product-name")},updateCartItemsQuantity:function(e){e.each(function(){var e=jQuery(this),t=e.data("item_key");e.data("quantity",jQuery('[name="cart['+t+'][qty]"]').val())})},postToDataLayer:function(e){"object"==typeof e&&("on"===shop_analytics_settings.datalayer_console_log&&console.dir(e),window.dataLayer.push(e))},event:{click:{login:'.woocommerce-form-login button[name="login"]',register:'.woocommerce-form-register button[name="register"]',registerOnCheckout:".woocommerce-checkout #place_order"}},cart:{elements:{product:".shop-analytics-product-info",shippingMethods:'select.shipping_method, input[name^="shipping_method"]',shippingMethodSelected:'select.shipping_method:selected, input[name^="shipping_method"]:checked',paymentMethods:'select.payment_method, input[name^="payment_method"]',paymentMethodSelected:'select.payment_method:selected, input[name^="payment_method"]:checked'}},checkout:{dataInit:{event:"EECcheckout",ecommerce:{checkout:{actionField:{step:0},products:[]}}},elements:{shippingMethods:'select.shipping_method, input[name^="shipping_method"]',shippingMethodSelected:'select.shipping_method:selected, input[name^="shipping_method"]:checked',paymentMethods:'input[name="payment_method"]',paymentMethodSelected:'select.payment_method:selected, input[name="payment_method"]:checked',billingAddressFields:".woocommerce-billing-fields input.input-text, .woocommerce-billing-fields select",billingAddressFieldsRequired:".woocommerce-billing-fields .validate-required input.input-text, .woocommerce-billing-fields .validate-required select",shippingAddressFields:".woocommerce-shipping-fields input.input-text, .woocommerce-shipping-fields select",shippingAddressFieldsRequired:".woocommerce-shipping-fields .validate-required input.input-text, .woocommerce-shipping-fields .validate-required select",shippingAddressToggle:"#ship-to-different-address-checkbox",checkoutPlaceOrderButton:"#place_order"},messages:{shipToSameAddress:"Ship to same address",shipToDifferentAddress:"Ship to different address"}},product:{elements:{addToCartButton:".single_add_to_cart_button",singleProductDetails:".shop-analytics-single-product-details"}}},function(e){function t(){var t=e(document).find(".shop-analytics-product-details");if(t.length&&!t.parents(".shop-analytics-order-details").length){p||(p=t.length);var a=1,i="";t.each(function(t){var o=e(this),n=u.getProductsListType(o);i!==n&&(i=n,a=1),o.data("position",a++),o.data("list",n)}),t.length>p&&(t=t.filter("body.woocommerce ul.products .shop-analytics-product-details").slice(p),p=t.length);var n={event:"EECproductImpression",ecommerce:{currencyCode:t.first().data("currency"),impressions:u.getProductsData(t)}};u.postToDataLayer(n),m||(m=o())}}function o(){var e=document.querySelector("body.woocommerce ul.products");if(e){return new MutationObserver(function(e){e.forEach(function(e){null!==e.addedNodes&&t()})}).observe(e,{childList:!0})}}function a(){var t=e(this).closest(".product").find(".shop-analytics-product-details"),o=t.first().data("list"),a={event:"EECproductClick",ecommerce:{click:{actionField:{list:o},products:u.getProductsData(t)}}};localStorage.setItem("shop-analytics-list-type",o),u.postToDataLayer(a)}function i(t,o){if(void 0===o&&(o=e(t.target)),!o.hasClass("disabled")){var a;a=o.hasClass("single_add_to_cart_button")?e(".shop-analytics-single-product-details"):o.closest(".product").find(".shop-analytics-product-details");var i,n,r,c={event:"EECaddToCart",ecommerce:{currencyCode:a.first().data("currency"),add:{products:u.getProductsData(a)}}};i=u.getProductVariationAttributes(".variations_form option:selected"),i&&(c.ecommerce.add.products[0].variant=i,n=u.getVariationId(),c.ecommerce.add.products[0].id=n,(r=u.getVariationName(n))&&(c.ecommerce.add.products[0].name=r)),u.postToDataLayer(c)}}function n(){var e={event:"UniversalEvent",eventCategory:"User",eventAction:"Click",eventLabel:"login"};u.postToDataLayer(e)}function r(){var e={event:"UniversalEvent",eventCategory:"User",eventAction:"Click",eventLabel:"register"};u.postToDataLayer(e)}function c(){e("#createaccount").is(":checked")&&r()}function s(){var t=e(u.cart.elements.product);u.updateCartItemsQuantity(t),l(t)}function d(){var t=e(this).prev(u.cart.elements.product);u.updateCartItemsQuantity(t),l(t)}function l(e){var t=u.getProductsData(e),o={event:"EECremoveFromCart",ecommerce:{remove:{products:t}}};localStorage.setItem("productsInCartData",JSON.stringify(t)),u.postToDataLayer(o)}var u=document.shopAnalytics,p=0,m=0;e(t),e(document).on("click",u.event.click.login,n).on("click",u.event.click.register,r).on("click",u.event.click.registerOnCheckout,c).ajaxComplete(t).on("click",".products .product a",a).on("click",".single_add_to_cart_button",i).on("click",".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove",d).on("click","th.product-remove .remove",s),e(document.body).on("adding_to_cart",i),e(document).ajaxSuccess(function(t,o,a){if(void 0!==a&&void 0!==a.data&&a.data.indexOf("nm_cart_panel_remove_product")>=0){var i=a.data.indexOf("cart_item_key=")+14,n=a.data.substring(i);l(e('a[data-item_key="'+n+'"]'))}})}(jQuery);
