'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);

  /**
   * Registers woocommerce endpoint events on page load.
   * endpoint_id is injected from backend using wp_localize_script().
   */
  function onLoad() {
    if ('order-received' === shop_analytics_endpoint_data.step) {
      onOrderReceived();
    }
  }

  /**
   * Retrieves details about the final purchase.
   */
  function onOrderReceived () {
    var $order = $(document).find('.shop-analytics-order-details');
    var orderNumber = String($order.data('order_number'));
    // Ensure we are not tracking the same order again.
    var trackedOrders = JSON.parse(localStorage.getItem('shop-analytics-tracked-orders'));
    if (trackedOrders && trackedOrders.includes(orderNumber)) {
      return;
    } else {
      trackedOrders.push(orderId, orderNumber);
      localStorage.setItem('shop-analytics-tracked-orders', JSON.stringify(trackedOrders));
    }
    var $products = $order.find('.shop-analytics-product-details');
    var event_data = {
      event: 'EECpurchase',
      ecommerce: {
        purchase: {
          actionField: {
            id: orderNumber,
            revenue: String($order.data('revenue')).replace(/,/g, ''),
            tax: String($order.data('tax')).replace(/,/g, ''),
            shipping: String($order.data('shipping')).replace(/,/g, ''),
          },
          products: shopAnalytics.getProductsData($products)
        }
      }
    };
    shopAnalytics.postToDataLayer(event_data);
  }

})(jQuery);
