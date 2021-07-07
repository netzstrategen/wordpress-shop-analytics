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
    register_setting('shop-analytics-settings', 'shop_analytics_tc_enabled');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_id');
    register_setting('shop-analytics-settings', 'shop_analytics_user_id_email');
    register_setting('shop-analytics-settings', 'shop_analytics_track_user_role');
    register_setting('shop-analytics-settings', 'shop_analytics_disable_user_tracking');
    register_setting('shop-analytics-settings', 'shop_analytics_track_ecommerce');
    register_setting('shop-analytics-settings', 'shop_analytics_google_optimize');
    register_setting('shop-analytics-settings', 'shop_analytics_market_default');
    register_setting('shop-analytics-settings', 'shop_analytics_datalayer_logging');
    register_setting('shop-analytics-settings', 'shop_analytics_brand_attribute');
    register_setting('shop-analytics-settings', 'shop_analytics_product_id');
    register_setting('shop-analytics-settings', 'shop_analytics_category_attribute');

    // Adds a new custom product name field.
    add_action('woocommerce_product_options_sku', __NAMESPACE__ . '\WooCommerce::woocommerce_product_options_sku');
    add_action('woocommerce_process_product_meta', __NAMESPACE__ . '\WooCommerce::woocommerce_process_product_meta');
    add_action('woocommerce_variation_options', __NAMESPACE__ . '\WooCommerce::woocommerce_variation_options', 10, 3);
    add_action('woocommerce_save_product_variation', __NAMESPACE__ . '\WooCommerce::woocommerce_save_product_variation', 10, 2);
  }

  /**
   * @see static::admin_menu()
   */
  public static function renderSettings() {
    Plugin::renderTemplate(['templates/settings.php']);
  }

}
