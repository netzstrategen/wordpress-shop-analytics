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
      var product = {
        name: $this.data('name'),
        id: String($this.data('sku')),
        price: $this.data('price'),
        brand: $this.data('brand'),
        category: $this.data('category'),
      };
      var product_data = $this.data();
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
   */
  postToDataLayer: function(event_data) {
    if ('object' === typeof event_data) {
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
   * dynamically with AJAX. Skips the products displayed in the cart content listing.
   * Each product is assigned a position as an index to its order in the list/block
   * it is contained (Related products, Cross-sells, Category).
   */
  function onLoad(event, xhr) {
    var $products = $(xhr && xhr.responseText ? xhr.responseText : document).find('.shop-analytics-product-details');
    if (!$products.length || $products.parents('.shop-analytics-order-details').length) {
      return;
    }

    // Remove single product view instances from product impressions list and assign
    // a list type (Related products, Cross-sells, Category) and a position value
    // (index of the product in the list it belongs) to the rest.
    var position = 1;
    var products_list_type = '';
    var remove = [];
    $products.each(function(index) {
      if ($(this).closest('.cart').length) {
        $products.splice(index, 1);
      }
    });
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
    Cookies.set('shop-analytics-list-type', list_type, new Date(new Date().getTime() + 10 * 60 * 1000));
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
