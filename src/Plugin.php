<?php

/**
 * @file
 * Contains \Netzstrategen\ShopAnalytics\Plugin.
 */

namespace Netzstrategen\ShopAnalytics;

/**
 * Main front-end functionality.
 */
class Plugin {

  /**
   * Prefix for naming.
   *
   * @var string
   */
  const PREFIX = 'shop-analytics';

  /**
   * Gettext localization domain.
   *
   * @var string
   */
  const L10N = self::PREFIX;

  /**
   * @var string
   */
  private static $baseUrl;

  /**
   * @implements init
   */
  public static function init() {
    add_action('wp_head', __CLASS__ . '::embed_gtm_container_head', 1);
    add_action('wp_footer', __CLASS__ . '::embed_gtm_container_footer', 1);
    add_filter('language_attributes', __CLASS__ . '::set_data_user_id');
    add_filter('language_attributes', __CLASS__ . '::set_data_user_role');
    add_filter('language_attributes', __CLASS__ . '::set_data_disable_user_tracking');
  }

  /**
   * @implements embed_gtm_container_head
   */
  public static function embed_gtm_container_head() {
    if (get_option('shop_analytics_gtm_container_embed') && get_option('shop_analytics_gtm_container')) {
      ?>
        <!-- Google Tag Manager -->
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','<?=get_option('shop_analytics_gtm_container')?>');</script>
        <!-- End Google Tag Manager -->
      <?php
    }
  }

  /**
   * @implements embed_gtm_container_footer
   */
  public static function embed_gtm_container_footer() {
    if (get_option('shop_analytics_gtm_container_embed') && get_option('shop_analytics_gtm_container')) {
      ?>
        <!-- Google Tag Manager (noscript) -->
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-<?=get_option('shop_analytics_gtm_container')?>"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        <!-- End Google Tag Manager (noscript) -->
      <?php
    }
  }

  /**
   * @implements set_data_user_id
   */
  public static function set_data_user_id($attr) {
    if (get_option('shop_analytics_track_user_id') && Plugin::get_current_user_id()) {
      return "{$attr} data-user-id=\"".Plugin::get_current_user_id()."\"";
    }
  }

  /**
   * @implements get_current_user_id
   */
  public static function get_current_user_id() {
    $user = wp_get_current_user();
    return $user->ID ? $user->ID : false;
  }

  /**
   * @implements set_data_user_role
   */
  public static function set_data_user_role($attr) {
    if (get_option('shop_analytics_track_user_role')) {
      return "{$attr} data-user-role=\"".Plugin::get_current_user_role()."\"";
    }
  }

  /**
   * @implements get_current_user_role
   */
  public static function get_current_user_role() {
    $user = wp_get_current_user();
    return $user->roles ? $user->roles[0] : 'visitor';
  }

  /**
   * @implements set_data_disable_user_tracking
   */
  public static function set_data_disable_user_tracking($attr) {
    $user_role = Plugin::get_current_user_role();
    $disabled_user_roles = (get_option('shop_analytics_disable_user_tracking')) ? get_option('shop_analytics_disable_user_tracking') : array();
    $track_user = (in_array($user_role, $disabled_user_roles)) ? 0 : 1;
    return "{$attr} data-user-track=\"$track_user\"";
  }

  /**
   * The base URL path to this plugin's folder.
   *
   * Uses plugins_url() instead of plugin_dir_url() to avoid a trailing slash.
   */
  public static function getBaseUrl() {
    if (!isset(static::$baseUrl)) {
      static::$baseUrl = plugins_url('', static::getBasePath() . '/plugin.php');
    }
    return static::$baseUrl;
  }

  /**
   * The absolute filesystem base path of this plugin.
   *
   * @return string
   */
  public static function getBasePath() {
    return dirname(__DIR__);
  }

  /**
   * Renders a given plugin template, optionally overridden by the theme.
   *
   * WordPress offers no built-in function to allow plugins to render templates
   * with custom variables, respecting possibly existing theme template overrides.
   * Inspired by Drupal (5-7).
   *
   * @param array $template_subpathnames
   *   An prioritized list of template (sub)pathnames within the plugin/theme to
   *   discover; the first existing wins.
   * @param array $variables
   *   An associative array of template variables to provide to the template.
   *
   * @throws \InvalidArgumentException
   *   If none of the $template_subpathnames files exist in the plugin itself.
   */
  public static function renderTemplate(array $template_subpathnames, array $variables = []) {
    $template_pathname = locate_template($template_subpathnames, FALSE, FALSE);
    extract($variables, EXTR_SKIP | EXTR_REFS);
    if ($template_pathname !== '') {
      include $template_pathname;
    }
    else {
      while ($template_pathname = current($template_subpathnames)) {
        if (file_exists($template_pathname = static::getBasePath() . '/' . $template_pathname)) {
          include $template_pathname;
          return;
        }
        next($template_subpathnames);
      }
      throw new \InvalidArgumentException("Missing template '$template_pathname'");
    }
  }

}
