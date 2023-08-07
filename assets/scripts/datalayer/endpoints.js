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
  function onOrderReceived() {
    var $order = $(document).find('.shop-analytics-order-details');
    var orderData = $order.data();
    var orderId = String(orderData.id);
    // Ensure we are not tracking the same order again.
    var trackedOrders = JSON.parse(localStorage.getItem('shop-analytics-tracked-orders')),
        // Check LocalStorage for previous order_count parameter, else default value from php.
        orderCount = localStorage.getItem('shop-analytics-order-count') ? (JSON.parse(localStorage.getItem('shop-analytics-order-count')) + 1) : orderData.order_count;
    if (trackedOrders && trackedOrders.includes(orderId)) {
      return;
    } else {
      trackedOrders.push(orderId);
      localStorage.setItem('shop-analytics-tracked-orders', JSON.stringify(trackedOrders));
      localStorage.setItem('shop-analytics-order-count', JSON.stringify(orderCount));
    }
    var $products = $order.find('.shop-analytics-product-details');
    var event_data = {
      event: 'EECpurchase',
      ecommerce: {
        transaction_id: orderId,
        value: String(orderData.revenue).replace(/,/g, ''),
        tax: String(orderData.tax).replace(/,/g, ''),
        shipping: String(orderData.shipping).replace(/,/g, ''),
        order_count: orderCount,
        currency: orderData.currency,
        items: shopAnalytics.getProductsData($products)
      }
    };

    if (orderData.coupon) {
      event_data.ecommerce.purchase.actionField.coupon = orderData.coupon;
    }

    shopAnalytics.postToDataLayer(event_data);
  }

})(jQuery);
