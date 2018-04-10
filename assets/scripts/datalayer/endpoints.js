'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);

  /**
   * Registers woocommerce endpoint events on page load.
   * endpoint_id is injected from backend using wp_localize_script().
   */
  function onLoad() {
    if ('order-received' === endpoint_id) {
      onOrderReceived();
    }
  }

  /**
   * Retrieves details about the final purchase.
   */
  function onOrderReceived () {
    var $order = $(document).find('.shop-analytics-order-details');
    var $products = $order.find('.shop-analytics-product-details');
    var event_data = {
      event: 'EECpurchase',
      ecommerce: {
        purchase: {
          actionField: {
            id: String($order.data('id')),
            revenue: String($order.data('revenue')),
            tax: String($order.data('tax')),
            shipping: String($order.data('shipping')),
          }
        },
        products: shopAnalytics.getProductsData($products)
      }
    };
    shopAnalytics.postToDataLayer(event_data);
  }

})(jQuery);
