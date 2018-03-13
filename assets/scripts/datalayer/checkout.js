'use strict';

(function ($) {
  $('form.checkout')
    .on('change', '.address-field select, .address-field input.input-text', onAddressChange)
    .on('click', 'input[name="payment_method"]', onPaymentMethodSelect);

  /**
   * Reacts to an address change.
   */
  function onAddressChange() {
    var $products = $('.shop-analytics-product-details');
    var data = {
      actionField: {
        step: 1
      }
    };
    var event_data = buildProductsDataLayerSet($products, 'EECcheckout', 'checkout', data);
    postToDataLayer(event_data);
  }

  /**
   * Reacts to a selection of a payment method.
   */
  function onPaymentMethodSelect(e) {
    var $products = $('.shop-analytics-product-details');
    var data = {
      actionField: {
        step: 2,
        option: $(e.target).val()
      }
    };
    var event_data = buildProductsDataLayerSet($products, 'EECcheckout', 'checkout', data);
    postToDataLayer(event_data);
  }

})(jQuery);
