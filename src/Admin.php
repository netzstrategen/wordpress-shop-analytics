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
   * @implements init
   */
  public static function init() {
    add_action('admin_menu', __CLASS__ . '::admin_menu');
    add_action('admin_init', __CLASS__ . '::admin_init');
  }

  /**
   * @implements admin_menu
   */
  public static function admin_menu() {
    add_menu_page(__('Shop Analytics Settings', Plugin::L10N), __('Shop Analytics', Plugin::L10N), 'manage_options', 'shop-analytics', [__CLASS__, 'renderSettings'], 'dashicons-chart-area');
  }

  /**
   * @implements admin_init
   */
  public static function admin_init() {
    register_setting('shop-analytics-settings', 'shop_analytics_gtm_id');
    register_setting('shop-analytics-settings', 'shop_analytics_gtm_embed');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_id');
    register_setting('shop-analytics-settings', 'shop_analytics_user_id_email');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_role');
    register_setting('shop-analytics-settings', 'shop_analytics_disable_user_tracking');
  }

  /**
   * @see static::admin_menu()
   */
  public static function renderSettings() {
    Plugin::renderTemplate(['templates/settings.php']);
  }

}
