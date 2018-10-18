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

    $products.each(function () {
      var $this = jQuery(this);
      var product_data = $this.data();
      var product = {
        name: product_data.name,
        id: String(product_data.sku),
        price: product_data.price,
        category: product_data.category,
      };

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
   * Retrieves the selected variation attributes names.
   *
   * @return string
   *   Comma-separated list of selected variation attributes.
   */
  getProductVariationAttributes: function ($variations) {
    var variationsList = [];

    jQuery($variations).each(function () {
      var $this = jQuery(this);
      if ($this.val().trim()) {
        variationsList.push($this.text().trim());
      }
    });
    return variationsList.join(', ');
  },

  getVariationId: function () {
    return jQuery('.woocommerce-variation-add-to-cart-enabled .variation_id').val();
  },

  getVariationName: function(variation_id) {
    return jQuery('#data-shop-analytics-' + variation_id).data('custom-product-name');
  },

  /**
   * Pushes event data to Google Analytics data layer.
   * datalayer_console_log is injected from backend
   * using wp_localize_script().
   */
  postToDataLayer: function(event_data) {
    if ('object' === typeof event_data) {
      if (shop_analytics_settings.datalayer_console_log === 'on') {
        console.dir(event_data);
      }
      window.dataLayer.push(event_data);
    }
  },

  event: {
    click: {
      login: '.woocommerce-form-login button[name="login"]',
      register: '.woocommerce-form-register button[name="register"]',
      registerOnCheckout: '.woocommerce-checkout #place_order'
    }
  }
};

(function ($) {
  var shopAnalytics = document.shopAnalytics;
  var products_list_count = 0;
  var products_list_observer = 0;

  $(onLoad);

  $(document)
    .on('click', '.products .product a', onProductClick)
    .on('click', document.shopAnalytics.event.click.login, onLoginFormSubmit)
    .on('click', document.shopAnalytics.event.click.register, onRegisterFormSubmit)
    .on('click', document.shopAnalytics.event.click.registerOnCheckout, onRegisterOnCheckoutSubmit);

  /**
   * Collects details about products displayed on the page when loaded or added
   * dynamically with AJAX. Each product is assigned a position as an index to
   * its order in the list/block it is contained (Related products, Cross-sells,
   * Category).
   */
  function onLoad() {
    var $products = $(document).find('.shop-analytics-product-details');
    if (!$products.length || $products.parents('.shop-analytics-order-details').length) {
      return;
    }

    if (!products_list_count) {
      products_list_count = $products.length;
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

    // Discards products in the main products list that are already tracked.
    if ($products.length > products_list_count) {
      $products = $products.filter('body.woocommerce ul.products .shop-analytics-product-details').slice(products_list_count);
      products_list_count = $products.length;
    }

    var event_data = {
      event: 'EECproductImpression',
      ecommerce: {
        currencyCode: $products.first().data('currency'),
        impressions: shopAnalytics.getProductsData($products)
      }
    };
    shopAnalytics.postToDataLayer(event_data);

    // Observes the list of products to detect dinamically loaded products.
    if (!products_list_observer) {
      products_list_observer = observeProductsList();
    }
  }

  /**
   * Starts a mutation observer on the products container element
   * to detect if new products are dinamically added.
   */
  function observeProductsList() {
    var targetNode = document.querySelector('body.woocommerce ul.products');
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes !== null) {
          onLoad();
        }
      });
    });

    return observer.observe(targetNode, {childList: true});
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
   * Reacts to user login form submision.
   */
  function onLoginFormSubmit() {
    var event_data = {
      'event': 'UniversalEvent',
      'eventCategory': 'User',
      'eventAction': 'Click',
      'eventLabel': 'login'
    };
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Reacts to user register form submision.
   */
  function onRegisterFormSubmit() {
    var event_data = {
      'event': 'UniversalEvent',
      'eventCategory': 'User',
      'eventAction': 'Click',
      'eventLabel': 'register'
    };
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Reacts to user register on checkout form submision.
   */
  function onRegisterOnCheckoutSubmit() {
    var $createAccountCheckbox = $('#createaccount');
    if ($createAccountCheckbox.is(':checked')) {
      onRegisterFormSubmit();
    }
  }

})(jQuery);
