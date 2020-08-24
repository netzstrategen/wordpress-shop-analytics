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
   * Updates quantity value of each item in the cart.
   */
  updateCartItemsQuantity: function ($items) {
    $items.each(function() {
      var $this = jQuery(this);
      var item_key = $this.data('item_key');
      // Each quantity field is linked to its corresponding item by a unique key.
      $this.data('quantity', jQuery('[name="cart[' + item_key + '][qty]"]').val());
    });
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
      if (shop_analytics_settings.tc_enabled == 1) {
        window.tc_vars = window.tc_vars || [];
        window.event_data = window.event_data || [];
        window.event_data.push(event_data);
        window.tC.event.generic_event(this, {"payload": window.event_data });
      }
      else {
        window.dataLayer.push(event_data);

      }
    }
  },

  event: {
    click: {
      login: '.woocommerce-form-login button[name="login"]',
      register: '.woocommerce-form-register button[name="register"]',
      registerOnCheckout: '.woocommerce-checkout #place_order'
    }
  },
  cart: {
    elements: {
      product: '.shop-analytics-product-info',
      shippingMethods: 'select.shipping_method, input[name^="shipping_method"]',
      shippingMethodSelected: 'select.shipping_method:selected, input[name^="shipping_method"]:checked',
      paymentMethods: 'select.payment_method, input[name^="payment_method"]',
      paymentMethodSelected: 'select.payment_method:selected, input[name^="payment_method"]:checked'
    }
  },
  checkout: {
    dataInit: {
      event: 'EECcheckout',
      ecommerce: {
        checkout: {
          actionField: {
            step: 0,
          },
          products: []
        }
      }
    },
    elements: {
      shippingMethods: 'select.shipping_method, input[name^="shipping_method"]',
      shippingMethodSelected: 'select.shipping_method:selected, input[name^="shipping_method"]:checked',
      paymentMethods: 'input[name="payment_method"]',
      paymentMethodSelected: 'select.payment_method:selected, input[name="payment_method"]:checked',
      billingAddressFields: '.woocommerce-billing-fields input.input-text, .woocommerce-billing-fields select',
      billingAddressFieldsRequired: '.woocommerce-billing-fields .validate-required input.input-text, .woocommerce-billing-fields .validate-required select',
      shippingAddressFields: '.woocommerce-shipping-fields input.input-text, .woocommerce-shipping-fields select',
      shippingAddressFieldsRequired: '.woocommerce-shipping-fields .validate-required input.input-text, .woocommerce-shipping-fields .validate-required select',
      shippingAddressToggle: '#ship-to-different-address-checkbox',
      checkoutPlaceOrderButton: '#place_order',
    },
    messages: {
      shipToSameAddress: 'Ship to same address',
      shipToDifferentAddress: 'Ship to different address'
    }
  },
  product: {
    elements: {
      addToCartButton: '.single_add_to_cart_button',
      singleProductDetails: '.shop-analytics-single-product-details'
    }
  },
};

(function ($) {
  var shopAnalytics = document.shopAnalytics;
  var products_list_count = 0;
  var products_list_observer = 0;

  $(document)
    .ready(onLoad)
    .on('click', shopAnalytics.event.click.login, onLoginFormSubmit)
    .on('click', shopAnalytics.event.click.register, onRegisterFormSubmit)
    .on('click', shopAnalytics.event.click.registerOnCheckout, onRegisterOnCheckoutSubmit)
    .on('click', '.products .product a', onProductClick)
    .on('click', '.single_add_to_cart_button', onProductAddToCart)
    .on('click', '.remove_from_cart_button, .woocommerce-cart-form .product-remove > a, .cart_item td.product-remove .remove', onRemoveSingleProduct)
    .on('click', 'th.product-remove .remove', onEmptyCart)
    .on('click', 'nav a', onNavItemClick)
  ;

  $(document.body).on('adding_to_cart', onProductAddToCart);

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
      removeProductsFromCart($remove);
    }
  });

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
    if (!targetNode) {
      return;
    }

    // Keep track of amount of products displayed on the page.
    document.productsLoaded = document.querySelector('body.woocommerce ul.products').childNodes.length;
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Ensure new products are being displayed on the page.
        var productsLoaded = document.querySelector('body.woocommerce ul.products').childNodes.length;
        if (mutation.addedNodes !== null && productsLoaded !== document.productsLoaded) {
          document.productsLoaded = productsLoaded;
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
   * Reacts to adding a product to cart.
   *
   * This manages both add to cart product posted from the single product view
   * form and the event 'adding_to_cart' emmited during an Ajax 'add to cart'
   * request.
   *
   * If the event is triggered from the WooCommerce 'AddToCartHandler' handler,
   * the $button parameter contains the 'Add to cart' button DOM element. See
   * https://github.com/woocommerce/woocommerce/blob/35053e418f42316c84e4b1d5ec98e88cdfa1114b/assets/js/frontend/add-to-cart.js#L79
   *
   * If the event is generated by the 'Add to cart' button click, the $button
   * parameter is not defined. The button DOM element is then retrieved from the
   * event target.
   *
   * @param {object} event
   *   jQuery event object.
   * @param {object} $button
   *   'Add to click' button DOM element.
   */
  function onProductAddToCart(event, $button) {
    if ($button === undefined) {
      $button = $(event.target);
    }

    if ($button.hasClass('disabled')) {
      return;
    }

    var $products;
    if ($button.hasClass('single_add_to_cart_button')) {
      // Product is added from single product view page.
      $products = $('.shop-analytics-single-product-details');
    }
    else {
      // Product is added from products listing page.
      $products = $button.closest('.product').find('.shop-analytics-product-details');
    }

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

  /**
   * Retrieves details of all products in the cart when it is emptied.
   */
  function onEmptyCart() {
    var $cart_items = $(shopAnalytics.cart.elements.product);
    shopAnalytics.updateCartItemsQuantity($cart_items);
    removeProductsFromCart($cart_items);
  }

  /**
   * Populates tracking data for the clicked nav item.
   */
  function onNavItemClick(e) {
    var nav = null;
    var context = '';

    if (nav = this.closest('nav[aria-label]')) {
      context = nav.getAttribute('aria-label');
    }
    else if (nav = this.closest('nav[id]')) {
      context = nav.getAttribute('id');
    }
    else {
      context = 'unknown';
    }

    var event_data = {
      'event': 'UniversalEvent',
      'eventCategory': 'User Interaction | ' + context + ' menu',
      'eventAction': 'Click',
      'eventLabel': this.innerText,
    };
    shopAnalytics.postToDataLayer(event_data);
  }

  /**
   * Retrieves details of a single product when it is removed from cart.
   */
  function onRemoveSingleProduct() {
    var $cart_item = $(this).prev(shopAnalytics.cart.elements.product);
    shopAnalytics.updateCartItemsQuantity($cart_item);
    removeProductsFromCart($cart_item);
  }

  /**
   * Reacts to removal of products from cart.
   */
  function removeProductsFromCart($products) {
    if (!$products.length) {
      return;
    }
    var productsData = shopAnalytics.getProductsData($products);
    var event_data = {
      event: 'EECremoveFromCart',
      ecommerce: {
        remove: {
          products: productsData
        }
      }
    };
    localStorage.setItem('productsInCartData', JSON.stringify(productsData));
    shopAnalytics.postToDataLayer(event_data);
  };

})(jQuery);
