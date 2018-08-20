'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);

  $(document)
    .on('change', '.cart .quantity .qty', updateProductQuantity);

  /**
   * Reacts to loading of a product details page.
   */
  function onLoad() {
    var $products = $('.shop-analytics-single-product-details');
    if (!$products.length) {
      return;
    }
    var variation;
    // Get the list type where this product was displayed on when clicked.
    var list_type = localStorage.getItem('shop-analytics-list-type');
    var event_data = {
      event: 'EECproductDetailView',
      ecommerce: {
        detail: {
          actionField: {
            list: 'Product detail'
          },
          products: shopAnalytics.getProductsData($products)
        }
      }
    };
    if (list_type) {
      event_data.ecommerce.detail.actionField.list = list_type;
      localStorage.removeItem('shop-analytics-list-type');
    }
    if (variation = shopAnalytics.getProductVariationAttributes('.variations_form option:selected')) {
      event_data.ecommerce.detail.products[0].variant = variation;
    }
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Updates product quantity data attribute.
   */
  function updateProductQuantity() {
    var $this = $(this);
    $('.shop-analytics-single-product-details').data('quantity', $this.val());
  }

})(jQuery);
