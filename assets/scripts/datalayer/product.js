'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);

  $(document)
    .on('change', '.cart .quantity .qty', updateProductQuantity)
    .on('change', '#lowest_delivery_variations', onLowestDeliveryVariationSelected)
    .on('click', '.single-product .woocommerce-product-gallery a', trackProductGalleryOpen);

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

  /**
   * Reacts to the selection of a product variation from the dropdown list
   * of variations with lowest delivery time.
   */
  function onLowestDeliveryVariationSelected() {
    var $this = $(this);
    var event_data = {
      'event': 'UniversalEvent',
      'eventCategory': 'Products',
      'eventAction': 'clicked express',
      'eventLabel': ''
    };
    var product_data = shopAnalytics.getProductsData($(shopAnalytics.product.elements.singleProductDetails))[0];

    if (product_data.name) {
      event_data.eventLabel = product_data.name;
    }

    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Tracks opening of product image gallery.
   */
  function trackProductGalleryOpen() {
    var event_data = {
      event: 'UniversalEvent',
      eventCategory: 'User Interaction | Lightbox',
      eventAction: 'open',
      eventLabel: document.documentElement.getAttribute('data-product-name'),
      eventValue: 0,
      eventNonInteraction: false
    };
    shopAnalytics.postToDataLayer(event_data);
  }

})(jQuery);
