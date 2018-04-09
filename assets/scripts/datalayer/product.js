'use strict';

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);
  $(document)
    .on('change', '.cart .quantity .qty', updateProductQuantity)
    .on('click', '.single_add_to_cart_button', onProductAddToCart);

  /**
   * Reacts to loading of a product details page.
   */
  function onLoad() {
    var $products = $('.cart .shop-analytics-product-details');
    // Get the list type where this product was displayed on when clicked.
    var list_type = Cookies.get('shop-analytics-list-type');
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
      Cookies.remove('shop-analytics-list-type');
    }
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Updates product quantity data attribute.
   */
  function updateProductQuantity() {
    var $this = $(this);
    $this.closest('.quantity').siblings('.shop-analytics-product-details').data('quantity', $this.val());
  }

  /**
   * Reacts to adding a product to cart.
   */
  function onProductAddToCart() {
    var $this = $(this);
    if ($this.is('.disabled')) {
      return;
    }
    var $products = $('.cart .shop-analytics-product-details');
    var variation;
    var event_data = {
      event: 'EECaddToCart',
      ecommerce: {
        currencyCode: $products.first().data('currency'),
        add: {
          products: shopAnalytics.getProductsData($products)
        }
      }
    };
    variation = getProductVariationAttributes();
    if (variation) {
      event_data.ecommerce.add.products[0].variant = variation;
    }
    shopAnalytics.postToDataLayer(event_data);
  };

  /**
   * Retrieves the selected variation attributes names.
   *
   * @return string
   *   Comma-separated list of selected variation attributes.
   */
  function getProductVariationAttributes() {
    var variations = [];

    $('.variations_form option:selected').each(function () {
      if ($(this).val().trim()) {
        variations.push($(this).text().trim());
      }
    });
    return variations.join(', ');
  }

})(jQuery);
