"use strict";!function(c){var s=document.shopAnalytics,t=c(s.cart.elements.product),o=!0;function e(){var e=c(s.cart.elements.shippingMethodSelected);if(e){var t="";if(e.is("select"))t=e.find("option:selected").text();else{if("radio"!==e.attr("type"))return;if(!(e=e.attr("id")))return;t=c('label[for="'+e+'"]').text()}r(shop_analytics_checkout_steps.order,t)}}function a(e){var t=!0;return 0!==e.length&&e.each(function(){(c(this).val()||"").trim().length||(t=!1)}),t}function r(e,t){var c,o=JSON.parse(localStorage.getItem("productsInCartData"));o&&((c=s.checkout.dataInit).ecommerce.step=e,t&&(c.ecommerce.option=t.trim()),c.ecommerce.items=o,s.postToDataLayer(c))}c(function(){var e;t.length&&((e=s.checkout.dataInit).ecommerce.step=1,e.ecommerce.items=s.getProductsData(t),localStorage.setItem("productsInCartData",JSON.stringify(s.getProductsData(t))),s.postToDataLayer(e))}),c(document.body).on("updated_cart_totals",function(){s.updateCartItemsQuantity(t),localStorage.setItem("productsInCartData",JSON.stringify(s.getProductsData(t)))}).on("updated_shipping_method",e).on("payment_method_selected",function(){var e;o?o=!1:(e=c(s.checkout.elements.paymentMethodSelected).attr("id"))&&r(shop_analytics_checkout_steps.order,c('label[for="'+e+'"]').text())}).on("change",s.checkout.elements.billingAddressFields,function(){JSON.parse(localStorage.getItem("productsInCartData"))&&a(c(s.checkout.elements.billingAddressFieldsRequired))&&r(shop_analytics_checkout_steps.order)}).on("change",s.checkout.elements.shippingAddressFields,function(){var e;JSON.parse(localStorage.getItem("productsInCartData"))&&a(c(s.checkout.elements.shippingAddressFieldsRequired))&&(e=c(s.checkout.elements.shippingAddressToggle).is(":checked")?s.checkout.messages.shipToDifferentAddress:s.checkout.messages.shipToSameAddress,r(shop_analytics_checkout_steps.order,e))}),c("form.checkout").on("change",s.checkout.elements.shippingMethods,e).on("click",s.checkout.elements.checkoutPlaceOrderButton,function(){localStorage.setItem("shop-analytics-tracked-orders",JSON.stringify([]))})}(jQuery);
