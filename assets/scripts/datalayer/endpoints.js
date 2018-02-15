'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);

  function onLoad() {
    if ('order-received' === endpoint_id) {
      onOrderReceived();
    }
  }

  /**
   * Reacts to purchase.
   */
  function onOrderReceived () {
    var $order = $(document).find('.shop-analytics-order-details');
    var $products = $order.find('.shop-analytics-product-details');
    var event_data = {
      'event': 'EECpurchase',
      'ecommerce': {
        'purchase': {
          'actionField': {
            'id': $order.data('id') + '',
            'revenue': $order.data('revenue') + '',
            'tax': $order.data('tax') + '',
            'shipping': $order.data('shipping') + '',
          }
        },
        'products': shopAnalytics.getProductsData($products)
      }
    };
    shopAnalytics.postToDataLayer(dataLayer, event_data);
  }

})(jQuery);
