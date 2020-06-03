"use strict";window.dataLayer=window.dataLayer||[],document.shopAnalytics={getProductsData:function(e){var o=[];return e.each(function(){var e=jQuery(this).data(),t={name:e.name,id:String(e.sku),price:e.price,category:e.category};e.brand&&(t.brand=e.brand),e.variant&&(t.variant=e.variant),e.quantity&&(t.quantity=parseInt(e.quantity)),e.position&&(t.position=e.position),e.list&&(t.list=e.list),o.push(t)}),o},getProductsListType:function(e){return e.closest(".cross-sells").length?"Cross-sells products":e.closest(".related").length?"Related products":"Product Category"},getProductVariationAttributes:function(e){var t=[];return jQuery(e).each(function(){var e=jQuery(this);e.val().trim()&&t.push(e.text().trim())}),t.join(", ")},getVariationId:function(){return jQuery(".woocommerce-variation-add-to-cart-enabled .variation_id").val()},getVariationName:function(e){return jQuery("#data-shop-analytics-"+e).data("custom-product-name")},updateCartItemsQuantity:function(e){e.each(function(){var e=jQuery(this),t=e.data("item_key");e.data("quantity",jQuery('[name="cart['+t+'][qty]"]').val())})},postToDataLayer:function(e){"object"==typeof e&&("on"===shop_analytics_settings.datalayer_console_log&&console.dir(e),1==shop_analytics_settings.tc_enabled?(window.tc_vars=window.tc_vars||[],window.event_data=window.event_data||[],window.event_data.push(e),window.tC.event.generic_event(this,{payload:window.event_data})):window.dataLayer.push(e))},event:{click:{login:'.woocommerce-form-login button[name="login"]',register:'.woocommerce-form-register button[name="register"]',registerOnCheckout:".woocommerce-checkout #place_order"}},cart:{elements:{product:".shop-analytics-product-info",shippingMethods:'select.shipping_method, input[name^="shipping_method"]',shippingMethodSelected:'select.shipping_method:selected, input[name^="shipping_method"]:checked',paymentMethods:'select.payment_method, input[name^="payment_method"]',paymentMethodSelected:'select.payment_method:selected, input[name^="payment_method"]:checked'}},checkout:{dataInit:{event:"EECcheckout",ecommerce:{checkout:{actionField:{step:0},products:[]}}},elements:{shippingMethods:'select.shipping_method, input[name^="shipping_method"]',shippingMethodSelected:'select.shipping_method:selected, input[name^="shipping_method"]:checked',paymentMethods:'input[name="payment_method"]',paymentMethodSelected:'select.payment_method:selected, input[name="payment_method"]:checked',billingAddressFields:".woocommerce-billing-fields input.input-text, .woocommerce-billing-fields select",billingAddressFieldsRequired:".woocommerce-billing-fields .validate-required input.input-text, .woocommerce-billing-fields .validate-required select",shippingAddressFields:".woocommerce-shipping-fields input.input-text, .woocommerce-shipping-fields select",shippingAddressFieldsRequired:".woocommerce-shipping-fields .validate-required input.input-text, .woocommerce-shipping-fields .validate-required select",shippingAddressToggle:"#ship-to-different-address-checkbox",checkoutPlaceOrderButton:"#place_order"},messages:{shipToSameAddress:"Ship to same address",shipToDifferentAddress:"Ship to different address"}},product:{elements:{addToCartButton:".single_add_to_cart_button",singleProductDetails:".shop-analytics-single-product-details"}}},function(r){var d=document.shopAnalytics,n=0,c=0;function s(){var a,i,e,t,o=r(document).find(".shop-analytics-product-details");o.length&&!o.parents(".shop-analytics-order-details").length&&(n=n||o.length,a=1,i="",o.each(function(e){var t=r(this),o=d.getProductsListType(t);i!==o&&(i=o,a=1),t.data("position",a++),t.data("list",o)}),o.length>n&&(o=o.filter("body.woocommerce ul.products .shop-analytics-product-details").slice(n),n=o.length),e={event:"EECproductImpression",ecommerce:{currencyCode:o.first().data("currency"),impressions:d.getProductsData(o)}},d.postToDataLayer(e),c||(t=document.querySelector("body.woocommerce ul.products"),c=t?(document.productsLoaded=document.querySelector("body.woocommerce ul.products").childNodes.length,new MutationObserver(function(e){e.forEach(function(e){var t=document.querySelector("body.woocommerce ul.products").childNodes.length;null!==e.addedNodes&&t!==document.productsLoaded&&(document.productsLoaded=t,s())})}).observe(t,{childList:!0})):void 0))}function e(e,t){var o,a,i,n,c;void 0===t&&(t=r(e.target)),t.hasClass("disabled")||(n={event:"EECaddToCart",ecommerce:{currencyCode:(i=t.hasClass("single_add_to_cart_button")?r(".shop-analytics-single-product-details"):t.closest(".product").find(".shop-analytics-product-details")).first().data("currency"),add:{products:d.getProductsData(i)}}},(c=d.getProductVariationAttributes(".variations_form option:selected"))&&(n.ecommerce.add.products[0].variant=c,o=d.getVariationId(),n.ecommerce.add.products[0].id=o,(a=d.getVariationName(o))&&(n.ecommerce.add.products[0].name=a)),d.postToDataLayer(n))}function t(){d.postToDataLayer({event:"UniversalEvent",eventCategory:"User",eventAction:"Click",eventLabel:"register"})}function u(e){var t=d.getProductsData(e),o={event:"EECremoveFromCart",ecommerce:{remove:{products:t}}};localStorage.setItem("productsInCartData",JSON.stringify(t)),d.postToDataLayer(o)}r(document).ready(s).on("click",d.event.click.login,function(){d.postToDataLayer({event:"UniversalEvent",eventCategory:"User",eventAction:"Click",eventLabel:"login"})}).on("click",d.event.click.register,t).on("click",d.event.click.registerOnCheckout,function(){r("#createaccount").is(":checked")&&t()}).on("click",".products .product a",function(){var e=r(this).closest(".product").find(".shop-analytics-product-details"),t=e.first().data("list"),o={event:"EECproductClick",ecommerce:{click:{actionField:{list:t},products:d.getProductsData(e)}}};localStorage.setItem("shop-analytics-list-type",t),d.postToDataLayer(o)}).on("click",".single_add_to_cart_button",e).on("click",".remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove",function(){var e=r(this).prev(d.cart.elements.product);d.updateCartItemsQuantity(e),u(e)}).on("click","th.product-remove .remove",function(){var e=r(d.cart.elements.product);d.updateCartItemsQuantity(e),u(e)}),r(document.body).on("adding_to_cart",e),r(document).ajaxSuccess(function(e,t,o){var a,i;void 0!==o&&void 0!==o.data&&0<=o.data.indexOf("nm_cart_panel_remove_product")&&(a=o.data.indexOf("cart_item_key=")+14,i=o.data.substring(a),u(r('a[data-item_key="'+i+'"]')))})}(jQuery);
