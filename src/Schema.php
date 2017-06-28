<?php

/**
 * @file
 * Contains \Netzstrategen\ShopAnalytics\Schema.
 */

namespace Netzstrategen\ShopAnalytics;

/**
 * Generic plugin lifetime and maintenance functionality.
 */
class Schema {

  /**
   * register_activation_hook() callback.
   */
  public static function activate() {
  }

  /**
   * register_deactivation_hook() callback.
   */
  public static function deactivate() {
  }

  /**
   * register_uninstall_hook() callback.
   */
  public static function uninstall() {
    delete_option('shop-analytics-settings');
  }

}
