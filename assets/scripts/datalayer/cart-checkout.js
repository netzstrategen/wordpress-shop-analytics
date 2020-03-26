'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;
  var $productsInCart = $(shopAnalytics.cart.elements.product);
  var pageLoad = true;

  $(onLoad);

  $(document.body)
    .on('updated_cart_totals', onUpdatedCartTotals)
    .on('updated_shipping_method', onShippingMethodUpdated)
    .on('payment_method_selected', onPaymentMethodSelected)
    .on('change', shopAnalytics.checkout.elements.billingAddressFields, onBillingAddressUpdate)
    .on('change', shopAnalytics.checkout.elements.shippingAddressFields, onShippingAddressUpdate);

  $('form.checkout')
    .on('change', shopAnalytics.checkout.elements.shippingMethods, onShippingMethodUpdated)
    .on('click', shopAnalytics.checkout.elements.checkoutPlaceOrderButton, onCheckoutPlaceOrder);

  function onLoad() {
    if (!$productsInCart.length) {
      return;
    }
    var event_data = shopAnalytics.checkout.dataInit;
    event_data.ecommerce.checkout.actionField.step = 1;
    event_data.ecommerce.checkout.products = shopAnalytics.getProductsData($productsInCart);
    localStorage.setItem('productsInCartData', JSON.stringify(shopAnalytics.getProductsData($productsInCart)));

    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Reacts to the update of quantity of product items in the cart.
   */
  function onUpdatedCartTotals() {
    shopAnalytics.updateCartItemsQuantity($productsInCart);
    localStorage.setItem('productsInCartData', JSON.stringify(shopAnalytics.getProductsData($productsInCart)));
  }

  /**
   * Reacts to selection of shipping method.
   */
  function onShippingMethodUpdated() {
    var $selected = $(shopAnalytics.cart.elements.shippingMethodSelected);
    if (!$selected) {
      return;
    }
    var selectedId = '';
    var selectedValue = '';

    if ($selected.is('select')) {
      selectedValue = $selected.find('option:selected').text();
    }
    else if ($selected.attr('type') === 'radio') {
      selectedId = $selected.attr('id');
      if (!selectedId) {
        return;
      }
      selectedValue = $('label[for="' + selectedId + '"]').text();
    }
    else {
      return;
    }

    registerCheckoutStepEvent(shop_analytics_checkout_steps.order, selectedValue);
  }

  /**
   * Reacts to place order button click.
   */
  function onCheckoutPlaceOrder() {
    // Clears list of previously tracked orders.
    localStorage.setItem('shop-analytics-tracked-orders', JSON.stringify([]));
  }

  /**
   * Reacts to selection of payment method.
   */
  function onPaymentMethodSelected() {
    if (pageLoad) {
      pageLoad = false;
      return;
    }
    var optionId = $(shopAnalytics.checkout.elements.paymentMethodSelected).attr('id');
    if (!optionId) {
      return;
    }
    registerCheckoutStepEvent(shop_analytics_checkout_steps.order, $('label[for="' + optionId + '"]').text());
  }

  /**
   * Reacts to billing address fields update.
   */
  function onBillingAddressUpdate() {
    var productsData = JSON.parse(localStorage.getItem('productsInCartData'));
    if (!productsData) {
      return;
    }
    if (fieldsAreFilled($(shopAnalytics.checkout.elements.billingAddressFieldsRequired))) {
      registerCheckoutStepEvent(shop_analytics_checkout_steps.order);
    }
  }

  /**
   * Reacts to billing address fields update.
   */
  function onShippingAddressUpdate() {
    var productsData = JSON.parse(localStorage.getItem('productsInCartData'));
    if (!productsData) {
      return;
    }
    if (fieldsAreFilled($(shopAnalytics.checkout.elements.shippingAddressFieldsRequired))) {
      var optionLabel = $(shopAnalytics.checkout.elements.shippingAddressToggle).is(':checked') ? shopAnalytics.checkout.messages.shipToDifferentAddress : shopAnalytics.checkout.messages.shipToSameAddress;
      registerCheckoutStepEvent(shop_analytics_checkout_steps.order, optionLabel);
    }
  }

  /**
   * Checks if given fields have content.
   */
  function fieldsAreFilled($fields) {
    var filled = true;
    $fields.each(function() {
      if (!$(this).val().trim().length) {
        filled = false;
      }
    });
    return filled;
  }

  /**
   * Pushes checkout step data to Google Analytics data layer.
   */
  function registerCheckoutStepEvent(step, optionLabel) {
    var productsData = JSON.parse(localStorage.getItem('productsInCartData'));
    if (!productsData) {
      return;
    }
    var event_data = shopAnalytics.checkout.dataInit;

    event_data.ecommerce.checkout.actionField.step = step;
    if (optionLabel) {
      event_data.ecommerce.checkout.actionField.option = optionLabel.trim();
    }
    event_data.ecommerce.checkout.products = productsData;
    shopAnalytics.postToDataLayer(event_data);
  }

})(jQuery);
