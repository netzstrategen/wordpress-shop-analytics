'use strict';

document.shopAnalytics = {
  /**
   * Collects detailed data for a collection of products.
   */
  getProductsData: function($products) {
    var products_data = [];
    var position;

    $products.each(function () {
      var $this = jQuery(this);
      var variation;
      var quantity;
      var product = {
        name: $this.data('name'),
        id: $this.data('sku') + '',
        price: $this.data('price'),
        brand: $this.data('brand'),
        category: $this.data('category'),
      };
      var product_data = $this.data();
      if (product_data.variation) {
        product.variant = product_data.variation;
      }
      if (product_data.quantity) {
        product.quantity = parseInt(product_data.quantity);
      }
      if (product_data.position) {
        product.position = product_data.position;
      }
      if (product_data.list) {
        product.list = product_data.list;
      }
      products_data.push(product);
    });

    return products_data;
  },

  getProductsListType: function($product) {
    var list_type = 'Other';

    if ($product.closest('.cross-sells').length) {
      list_type = 'Cross-sells products';
    } else if ($product.closest('.related').length) {
      list_type = 'Related products';
    } else {
      list_type = 'Product Category';
    }
    return list_type;
  },

  /**
   * Pushes event data to Google Analytics data layer.
   */
  postToDataLayer: function(dataLayer, event_data) {
    if ('object' === typeof event_data) {
      console.dir(event_data);
      dataLayer = dataLayer || [];
      window.dataLayer.push(event_data);
    }
  }
};

(function (dataLayer, $) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);
  $(document)
    .ajaxComplete(onLoad)
    .on('click', '.products .product a', onProductClick)
    .on('click', '.remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove', onRemoveSingleProduct)
    .on('click', 'th.product-remove .remove', onEmptyCart);

  /**
   * Reacts to loading of products on a page or in a AJAX response.
   */
  function onLoad(event, xhr) {
    var $products = $(xhr && xhr.responseText ? xhr.responseText : document).find('.shop-analytics-product-details');
    if (!$products.length || $products.parents('.shop-analytics-order-details').length) {
      return;
    }

    // Remove unwanted product instances from product impressions list and assign
    // a position value and list type to the rest.
    var position = 1;
    var remove = [];
    $products.each(function(index) {
      if ($(this).closest('.cart').length) {
        $products.splice(index, 1);
      }
    });
    $products.each(function(index) {
      var $this = $(this);
      $this.data('position', position++);
      $this.data('list', shopAnalytics.getProductsListType($this));
    });

    var event_data = {
      'event': 'EECproductImpression',
      'ecommerce': {
        'currencyCode': $products.first().data('currency'),
        'impressions': shopAnalytics.getProductsData($products)
      }
    };
    shopAnalytics.postToDataLayer(dataLayer, event_data);
  }

  /**
   * Reacts to a click on a product.
   */
  function onProductClick() {
    var $products = $(this).closest('.product').find('.shop-analytics-product-details');
    var list_type = $products.first().data('list');
    var event_data = {
      'event': 'EECproductClick',
      'ecommerce': {
        'click': {
          actionField: {
            list: list_type
          },
          'products': shopAnalytics.getProductsData($products)
        }
      }
    };
    // Save the type of list where the clicked product is displayed.
    Cookies.set('shop-analytics-list-type', list_type, new Date(new Date().getTime() + 10 * 60 * 1000));
    shopAnalytics.postToDataLayer(dataLayer, event_data);
  }

  /**
   * Reacts to removal of all products from cart.
   */
  function onEmptyCart(e) {
    var $cart_items = $('.cart .cart_item td.product-remove .remove');
    updateCartItemsQuantity($cart_items);
    removeProductsFromCart($cart_items);
  }

  /**
   * Reacts to removal of a single product from cart.
   */
  function onRemoveSingleProduct(e) {
    updateCartItemsQuantity($(this));
    removeProductsFromCart($(this));
  }

  /**
   * Updates quantity value of each item in the cart.
   */
  function updateCartItemsQuantity($items) {
    $items.each(function() {
      var $this = $(this);
      var item_key = $this.data('item_key');
      // Each quantity field is linked to its corresponding item by a unique key.
      $this.data('quantity', $('[name="cart[' + item_key + '][qty]"]').val());
    });
  }

  /**
   * Reacts to removal of products from cart.
   */
  function removeProductsFromCart($products) {
    var event_data = {
      'event': 'EECremoveFromCart',
      'ecommerce': {
        'remove': {
          'products': shopAnalytics.getProductsData($products)
        }
      }
    };
    // Get product quantity removed.

    shopAnalytics.postToDataLayer(dataLayer, event_data);
  };

})(window.dataLayer, jQuery);
