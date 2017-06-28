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
    if (!static::isTrackingEnabled()) {
      return;
    }
    add_action('wp_head', __CLASS__ . '::embedGtmContainerHead', 1);
    add_action('wp_footer', __CLASS__ . '::embedGtmContainerFooter', 1);
    add_filter('language_attributes', __CLASS__ . '::setDataUserId');
    add_filter('language_attributes', __CLASS__ . '::setDataUserRole');
    add_filter('language_attributes', __CLASS__ . '::setDataDisableUserTracking');
  }

  /**
   * @implements wp_head
   */
  public static function embedGtmContainerHead() {
  ?>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','<?=get_option('shop_analytics_gtm_id')?>');</script>
    <!-- End Google Tag Manager -->
  <?php
  }

  /**
   * @implements wp_footer
   */
  public static function embedGtmContainerFooter() {
  ?>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-<?=get_option('shop_analytics_gtm_id')?>"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
  <?php
  }

  /**
   * @implements language_attributes
   */
  public static function setDataUserId($attr) {
    if (get_option('shop_analytics_track_user_id') && get_current_user_id()) {
      $attr .= ' data-user-id="' . get_current_user_id() . '"';
    }
    return $attr;
  }

  /**
   * @implements language_attributes
   */
  public static function setDataUserRole($attr) {
    if (get_option('shop_analytics_track_user_role')) {
      $attr .= ' data-user-role="' . Plugin::getCurrentUserRole() . '"';
    }
    return $attr;
  }


  /**
   * @implements language_attributes
   */
  public static function setDataDisableUserTracking($attr) {
    // Exclude the current user role from tracking if option is set.
    $track_user = (int) !in_array(static::getCurrentUserRole(), static::getDisabledUserRoles(), TRUE);
    return $attr . ' data-user-track="' . $track_user . '"';
  }

  /**
   * Returns the first role of the current user. 'Visitor' otherwise.
   */
  public static function getCurrentUserRole() {
    // Probably you should check against all of the users roles?
    $user = wp_get_current_user();
    return $user->roles ? $user->roles[0] : 'visitor';
  }

  /**
   * Returns the user roles which should not be tracked.
   */
  public static function getDisabledUserRoles() {
    return get_option('shop_analytics_disable_user_tracking') ? get_option('shop_analytics_disable_user_tracking') : [];
  }

  /**
   * Returns whether tracking is enabled or not.
   */
  public static function isTrackingEnabled() {
    return get_option('shop_analytics_gtm_enabled') && get_option('shop_analytics_gtm_id');
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
