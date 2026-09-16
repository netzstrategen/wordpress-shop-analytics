<?php

/**
 * @file
 * Contains \Netzstrategen\ShopAnalytics\BlockCheckout.
 */

namespace Netzstrategen\ShopAnalytics;

/**
 * GA4 ecommerce events for the Cart and Checkout blocks.
 *
 * cart-checkout.js drives the classic flow off jQuery events and the shortcode
 * markup — updated_cart_totals, payment_method_selected, form.checkout. None of
 * those exist in the block checkout, which renders from React and talks to the
 * Store API, so every event between viewing the cart and placing the order went
 * silent when the blocks went live. purchase kept working: it is pushed from
 * the order received page, which is still a classic template.
 *
 * The item fields come from the Store API rather than the DOM, added to each
 * cart item under this plugin's namespace, so the ids, names and categories are
 * the ones WooCommerce::getGa4ItemData() builds for the purchase event too. The
 * dataLayer joins these events on item_id, and a cart that disagrees with the
 * purchase would split the funnel.
 */
class BlockCheckout {

  const EXTENSION_NAMESPACE = 'shop-analytics';

  /**
   * @implements init
   */
  public static function init() {
    if (!function_exists('woocommerce_store_api_register_endpoint_data')) {
      return;
    }
    // Registered here rather than on woocommerce_blocks_loaded: the plugin
    // starts on init, by which time that action has already fired. init runs
    // on the Store API requests too, which is what has to see this.
    static::registerCartItemData();
    add_action('wp_enqueue_scripts', __CLASS__ . '::enqueueScript', 20);
  }

  /**
   * Adds the GA4 item fields to every cart item returned by the Store API.
   */
  public static function registerCartItemData() {
    woocommerce_store_api_register_endpoint_data([
      'endpoint' => \Automattic\WooCommerce\StoreApi\Schemas\V1\CartItemSchema::IDENTIFIER,
      'namespace' => static::EXTENSION_NAMESPACE,
      'data_callback' => __CLASS__ . '::getCartItemData',
      'schema_callback' => __CLASS__ . '::getCartItemSchema',
      'schema_type' => ARRAY_A,
    ]);
  }

  /**
   * The GA4 item fields of one cart item.
   */
  public static function getCartItemData($cart_item) {
    $product = $cart_item['data'] ?? NULL;
    if (!$product instanceof \WC_Product) {
      return [];
    }
    return WooCommerce::getGa4ItemData($product);
  }

  /**
   * @see getCartItemData()
   */
  public static function getCartItemSchema() {
    $string = [
      'description' => __('Google Analytics item field.', Plugin::L10N),
      'type' => ['string', 'null'],
      'readonly' => TRUE,
    ];
    return [
      'item_id' => $string,
      'item_name' => $string,
      'item_category' => $string,
      'item_brand' => $string,
      'item_variant' => $string,
    ];
  }

  /**
   * @implements wp_enqueue_scripts
   */
  public static function enqueueScript() {
    if (!static::isBlockCartOrCheckout()) {
      return;
    }
    $handle = Plugin::PREFIX . '_datalayer';
    $source = defined('SCRIPT_DEBUG') && SCRIPT_DEBUG ? '/assets' : '/dist';
    $scripts = Plugin::getBaseUrl() . $source . '/scripts/datalayer';

    wp_enqueue_script(
      $handle . '_block_cart_checkout',
      "$scripts/block-cart-checkout.js",
      [$handle . '_common', 'wp-data'],
      FALSE,
      TRUE
    );
    wp_localize_script($handle . '_block_cart_checkout', Plugin::PREFIX . '_block_data', [
      'page' => is_checkout() ? 'checkout' : 'cart',
      'namespace' => static::EXTENSION_NAMESPACE,
    ]);
  }

  /**
   * Whether the current page renders the Cart or Checkout block.
   *
   * The shortcode pages are already covered by cart-checkout.js, and running
   * both would push each event twice.
   */
  public static function isBlockCartOrCheckout() {
    if (!function_exists('has_block') || !function_exists('is_cart')) {
      return FALSE;
    }
    // order-received and order-pay are endpoints of the checkout page, so
    // is_checkout() is TRUE on them too. The blocks do not render there, and
    // a cart left in the session would push a checkout event over the
    // thank-you page.
    if (is_checkout()) {
      return !is_wc_endpoint_url() && has_block('woocommerce/checkout', get_post());
    }
    if (is_cart()) {
      return has_block('woocommerce/cart', get_post());
    }
    return FALSE;
  }

}
