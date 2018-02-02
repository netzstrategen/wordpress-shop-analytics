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
  public static function pluginIsActive() {
    return is_plugin_active('woocommerce/woocommerce.php');
  }

  /**
   * Returns TRUE if WooCommerce plugin is active and ecommerce tracking enabled.
   *
   * @return bool
   */
  public static function trackingIsEnabled() {
    return static::pluginIsActive() && get_option('shop_analytics_track_ecommerce');
  }

  /**
   * Returns the current shop currency code.
   *
   * @return string
   */
  public static function getCurrency() {
    $currency = '';
    if (static::trackingIsEnabled() && function_exists('get_woocommerce_currency')) {
      $currency = strtoupper(get_woocommerce_currency());
    }
    return $currency;
  }

}
