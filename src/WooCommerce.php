<?php

/**
 * @file
 * Contains \Netzstrategen\ShopAnalytics\WooCommerce.
 */

namespace Netzstrategen\ShopAnalytics;

/**
 * WooCommerce related functionality.
 */
class WooCommerce {

  /**
   * Returns TRUE is WooCommerce plugin is installed and activated.
   *
   * @return bool
   */
  public static function woocommerceIsEnabled() {
    return is_plugin_active('woocommerce/woocommerce.php');
  }

  /**
   * Returns TRUE if WooCommerce plugin is active and ecommerce tracking enabled.
   *
   * @return bool
   */
  public static function woocommerceTrackingIsEnabled() {
    return static::woocommerceIsEnabled() && get_option('shop_analytics_track_ecommerce');
  }

}
