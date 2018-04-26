'use strict';

window.dataLayer = window.dataLayer || [];

document.shopAnalytics = {
  /**
   * Builds an array of products details retrieving the
   * values of data attributes from a set of DOM elements.
   * This array will be used as part of the data pushed
   * to the Google Analytics dataLayer.
   *
   * @param $products
   *   Array of DOM elements with product data details as
   *   data attributes.
   *
   * @return array
   *   Array of objects containing products details.
   */
  getProductsData: function($products) {
    var products_data = [];
    var position;

    $products.each(function () {
      var $this = jQuery(this);
      var product_data = $this.data();
      var product = {
        name: product_data.name,
        id: String(product_data.sku),
        category: product_data.category,
      };
      if (product_data.price) {
        // If product price is less than 1.000 it gets casted as a number, otherwise it's a string.
        product.price = (typeof product_data.price === 'string') ? product_data.price.replace(/,/g, '') : product_data.price;
      }
      if (product_data.brand) {
        product.brand = product_data.brand;
      }
      if (product_data.variant) {
        product.variant = product_data.variant;
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
    }
    else if ($product.closest('.related').length) {
      list_type = 'Related products';
    }
    else {
      list_type = 'Product Category';
    }
    return list_type;
  },

  /**
   * Pushes event data to Google Analytics data layer.
   * datalayer_console_log is injected from backend
   * using wp_localize_script().
   */
  postToDataLayer: function(event_data) {
    if ('object' === typeof event_data) {
      if (shop_analytics_settings.datalayer_console_log) {
        console.dir(event_data);
      }
      window.dataLayer.push(event_data);
    }
  }
};

(function ($) {
  var shopAnalytics = document.shopAnalytics;

  $(onLoad);
  $(document)
    .ajaxComplete(onLoad)
    .on('click', '.products .product a', onProductClick)
    .on('click', '.remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove', onRemoveSingleProduct)
    .on('click', 'th.product-remove .remove', onEmptyCart);

  /**
   * Collects details about products displayed on the page when loaded or added
   * dynamically with AJAX. Each product is assigned a position as an index to
   * its order in the list/block it is contained (Related products, Cross-sells,
   * Category).
   */
  function onLoad(event, xhr) {
    var $products = $(xhr && xhr.responseText ? xhr.responseText : document).find('.shop-analytics-product-details');
    if (!$products.length || $products.parents('.shop-analytics-order-details').length) {
      return;
    }

    // Assign a list type (Related products, Cross-sells, Category) and a position
    // value (index of the product in the list it belongs) to the rest.
    var position = 1;
    var products_list_type = '';
    $products.each(function(index) {
      var $this = $(this);
      var current_product_list_type = shopAnalytics.getProductsListType($this);
      // Reset the position counter if start parsing products from a different list.
      if (products_list_type !== current_product_list_type) {
        products_list_type = current_product_list_type;
        position = 1;
      }
      $this.data('position', position++);
      $this.data('list', current_product_list_type);
    });

    var event_data = {
      event: 'EECproductImpression',
      ecommerce: {
        currencyCode: $products.first().data('currency'),
        impressions: shopAnalytics.getProductsData($products)
      }
    };
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Retrieves data details about the product the user clicked on.
   */
  function onProductClick() {
    var $products = $(this).closest('.product').find('.shop-analytics-product-details');
    var list_type = $products.first().data('list');
    var event_data = {
      event: 'EECproductClick',
      ecommerce: {
        click: {
          actionField: {
            list: list_type
          },
          products: shopAnalytics.getProductsData($products)
        }
      }
    };
    // Save the type of list where the clicked product is displayed.
    localStorage.setItem('shop-analytics-list-type', list_type);
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Retrieves details of all products in the cart when it is emptied.
   */
  function onEmptyCart() {
    var $cart_items = $('.cart .cart_item td.product-remove .remove');
    updateCartItemsQuantity($cart_items);
    removeProductsFromCart($cart_items);
  }

  /**
   * Retrieves details of a single product when it is removed from cart.
   */
  function onRemoveSingleProduct() {
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
      event: 'EECremoveFromCart',
      ecommerce: {
        remove: {
          products: shopAnalytics.getProductsData($products)
        }
      }
    };

    shopAnalytics.postToDataLayer(event_data);
  };

})(jQuery);
