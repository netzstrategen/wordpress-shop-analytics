<?php

/**
 * @file
 * Contains \Netzstrategen\ShopAnalytics\Admin.
 */

namespace Netzstrategen\ShopAnalytics;

/**
 * Administrative back-end functionality.
 */
class Admin {

  /**
   * @implements admin_menu
   */
  public static function menu() {
    add_menu_page(__('Shop Analytics Settings', Plugin::L10N), __('Shop Analytics', Plugin::L10N), 'manage_options', 'shop-analytics', [__CLASS__, 'renderSettings'], 'dashicons-chart-area');
  }

  /**
   * @implements admin_init
   */
  public static function init() {
    register_setting('shop-analytics-settings', 'shop_analytics_gtm_id');
    register_setting('shop-analytics-settings', 'shop_analytics_gtm_embed');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_id');
    register_setting('shop-analytics-settings', 'shop_analytics_user_id_email');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_role');
    register_setting('shop-analytics-settings', 'shop_analytics_disable_user_tracking');
    register_setting('shop-analytics-settings', 'shop_analytics_track_ecommerce');
    register_setting('shop-analytics-settings', 'shop_analytics_market_default');
    register_setting('shop-analytics-settings', 'shop_analytics_datalayer_logging');
  }

  /**
   * @see static::admin_menu()
   */
  public static function renderSettings() {
    Plugin::renderTemplate(['templates/settings.php']);
  }

}
