(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(document)
  .on('click', '.single_add_to_cart_button', onProductAddToCart)
  .on('adding_to_cart', 'body', onProductAddToCart)
  .on('click', '.remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove', onRemoveSingleProduct)
  .on('click', 'th.product-remove .remove', onEmptyCart);

  /**
   * Reacts to product removal from the cart.
   * 
   * Savoy theme blocks WooCommerce remove from cart events,
   * so we have to detect the "remove from cart" Ajax operation
   * in order to track it.
   */
  $(document).ajaxSuccess(function(event, xhr, settings) {
    if (settings === undefined || settings.data === undefined) {
      return;
    }
    if (settings.data.indexOf('nm_cart_panel_remove_product') >= 0) {
      var pos = settings.data.indexOf('cart_item_key=') + 14;
      var item_key = settings.data.substring(pos);
      var $remove = $('a[data-item_key="' + item_key + '"]');
      removeProductsFromCart($('a[data-item_key="' + item_key + '"]'));
    }
  });

  /**
   * Reacts to adding a product to cart.
   */
  function onProductAddToCart() {
    var $this = $(this);
    if ($this.is('.disabled')) {
      return;
    }
    var $products = $('.shop-analytics-single-product-details');
    var variation;
    var variation_id;
    var custom_name;
    var event_data = {
      event: 'EECaddToCart',
      ecommerce: {
        currencyCode: $products.first().data('currency'),
        add: {
          products: shopAnalytics.getProductsData($products)
        }
      }
    };
    variation = shopAnalytics.getProductVariationAttributes('.variations_form option:selected');
    if (variation) {
      event_data.ecommerce.add.products[0].variant = variation;
      variation_id = shopAnalytics.getVariationId();
      event_data.ecommerce.add.products[0].id = variation_id;
      // Override product name with custom name, if it exists.
      if (custom_name = shopAnalytics.getVariationName(variation_id)) {
        event_data.ecommerce.add.products[0].name = custom_name;
      }
    }
    shopAnalytics.postToDataLayer(event_data);
  };

  /**
   * Retrieves details of all products in the cart when it is emptied.
   */
  function onEmptyCart() {
    var $cart_items = $('.cart .cart_item td.product-remove .remove');
    removeProductsFromCart($cart_items);
  }

  /**
   * Retrieves details of a single product when it is removed from cart.
   */
  function onRemoveSingleProduct() {
    removeProductsFromCart($(this));
  }

  /**
   * Reacts to removal of products from cart.
   */
  function removeProductsFromCart($items) {
    // Updates quantity value of each item in the cart.
    $items.each(function() {
      var $this = $(this);
      var item_key = $this.data('item_key');
      // Each quantity field is linked to its corresponding item by a unique key.
      $this.data('quantity', $('[name="cart[' + item_key + '][qty]"]').val());
    });

    var event_data = {
      event: 'EECremoveFromCart',
      ecommerce: {
        remove: {
          products: shopAnalytics.getProductsData($items)
        }
      }
    };

    shopAnalytics.postToDataLayer(event_data);
  };
})(jQuery);
