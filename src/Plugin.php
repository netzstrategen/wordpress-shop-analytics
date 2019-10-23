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
  const PREFIX = 'shop_analytics';

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
    if (is_admin()) {
      // @see Admin::init()
      return;
    }
    if (static::isContainerEnabled()) {
      add_action('wp_head', __CLASS__ . '::wp_head', 1);
      add_action('wp_footer', __CLASS__ . '::wp_footer', 1);
    }

    // Adds global site and user context attributes to HTML tag.
    add_filter('language_attributes', __CLASS__ . '::language_attributes', 99);

    if (static::isEcommerceTrackingEnabled()) {
      // Add products details as data attributes to remove item from cart link.
      add_filter('woocommerce_cart_item_remove_link', __NAMESPACE__ . '\WooCommerce::woocommerce_cart_item_remove_link', 10, 2);

      // Add a hidden HTML div element with product details as data attributes.
      add_action('woocommerce_shop_loop_item_title', __NAMESPACE__ . '\WooCommerce::addImpressionsProductDetailsHtmlDataAttr');
      add_action('woocommerce_single_product_summary', __NAMESPACE__ . '\WooCommerce::addSingleProductDetailsHtmlDataAttr');
      add_action('woocommerce_thankyou', __NAMESPACE__ . '\WooCommerce::addOrderDetailsHtmlDataAttr');

      // Adds hidden fields with data related to product variations with a custom product name set.
      add_action('woocommerce_after_single_variation', __NAMESPACE__ . '\WooCommerce::woocommerce_after_single_variation');

      // Enqueue Google Analytics Data Layer related scripts.
      add_action('wp_enqueue_scripts', __CLASS__ . '::enqueueGaDataLayerScripts');
    }
  }

  /**
   * Returns whether basic GTM tracking is enabled or not.
   */
  public static function isContainerEnabled() {
    return get_option('shop_analytics_gtm_embed') && get_option('shop_analytics_gtm_id');
  }

  /**
   * @implements wp_head
   */
  public static function wp_head() {
    if (!$gtm_id = get_option('shop_analytics_gtm_id')) {
      return;
    }
    ?>
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','<?= $gtm_id ?>');</script>
    <?php
  }

  /**
   * @implements wp_footer
   */
  public static function wp_footer() {
    if (!$gtm_id = get_option('shop_analytics_gtm_id')) {
      return;
    }
    ?>
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?= $gtm_id ?>" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <?php
  }

  /**
   * @implements language_attributes
   */
  public static function language_attributes($html_attributes) {
    global $wp_query;

    $attributes = [];

    // Adds language code data attribute.
    $attributes['language'] = static::getLanguageCode();
    // Adds user id data attribute.
    if (get_option('shop_analytics_track_user_id') && is_user_logged_in()) {
      $attributes['user-id'] = static::getCurrentUserID();
    }
    // Adds user role data attribute.
    if (get_option('shop_analytics_track_user_role')) {
      $attributes['user-type'] = static::getCurrentUserRole();
    }
    // Adds user tracking status attribute. Exclude the current user role from tracking if option is set.
    $attributes['user-track'] = (int) !in_array(static::getCurrentUserRole(), static::getDisabledUserRoles(), TRUE);
    // Adds page type data attribute.
    if ($wp_query->queried_object) {
      $postId = $wp_query->queried_object->ID ?? 0;
      $attributes['page-type'] = static::getPageType($postId);
    }
    // Adds shop market code. Set to the the plugin settings default value if undefined.
    $attributes['market'] = get_option('shop_analytics_market_default') ?: 'GLOBAL';

    if (static::isEcommerceTrackingEnabled()) {
      // Adds currency code data attribute.
      $attributes['currency'] = get_woocommerce_currency();

      $is_tax = FALSE;
      if (is_product_category() && $category_page_path = WooCommerce::getProductCategoryParents($wp_query->queried_object->term_id, ' > ')) {
        $is_tax = TRUE;
        // Adds product category page path attribute.
        $attributes['product-category'] = $category_page_path;
      }
      elseif (is_product_tag() && $wp_query->queried_object->name) {
        $is_tax = TRUE;
        // Adds product tag attribute.
        $attributes['product-tag'] = $wp_query->queried_object->name;
      }
      elseif (WooCommerce::isAttribute() && $wp_query->queried_object->name) {
        $is_tax = TRUE;
        // Adds product attribute page attribute.
        $attributes['product-attribute'] = $wp_query->queried_object->name;
      }
      elseif (is_product() && $product_details = WooCommerce::getProductDetails(get_the_ID(), FALSE)) {
        // Adds product details and attributes.
        foreach ($product_details as $key => $detail) {
          $attributes['product-' . str_replace('_', '-', $key)] = $detail;
        }
        foreach (WooCommerce::getProductAttributes(wc_get_product($product_details['id'])) as $attribute) {
          $attributes['product-' . $attribute['key']] = $attribute['value'] ?: '';
        }
      }

      // Adds products count in taxonomy attribute.
      if ($is_tax) {
        $attributes['product-count'] = $wp_query->queried_object->count;
      }
    }

    return $html_attributes . ' ' . static::buildAttributesDataTags($attributes);
  }

  /**
   * Returns site frontend language code. If WPML plugin is active, its language setting gets precedence.
   *
   * @return string
   */
  public static function getLanguageCode() {
    $language = defined('ICL_LANGUAGE_CODE') ? ICL_LANGUAGE_CODE : get_bloginfo('language');
    return substr($language, 0, 2);
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
   * Returns the wordpress user ID or hashed e-mail address of the current user.
   */
  public static function getCurrentUserID() {
    // Probably change the hash method to get shorter hashes.
    $user = wp_get_current_user();
    return get_option('shop_analytics_user_id_email') ? sha1($user->user_email) : $user->ID;
  }

  /**
   * Returns the user roles which should not be tracked.
   */
  public static function getDisabledUserRoles() {
    return get_option('shop_analytics_disable_user_tracking') ? get_option('shop_analytics_disable_user_tracking') : [];
  }

  /**
   * Returns current page type.
   *
   * @param int $post_id
   *   Current page post ID.
   *
   * @return string
   */
  public static function getPageType($post_id) {
    if (Plugin::isEcommerceTrackingEnabled() && $page_type = WooCommerce::getPageType($post_id)) {
      return $page_type;
    }
    elseif (is_front_page()) {
      return 'Home';
    }
    elseif (is_page()) {
      return 'Page';
    }
    elseif (is_single()) {
      return 'Post';
    }
    elseif (is_tag()) {
      return 'Tag';
    }
    elseif (is_category()) {
      return 'Category';
    }
    elseif (is_search()) {
      return 'Search';
    }
    else {
      return 'Other';
    }
  }

  /**
   * Returns TRUE if WooCommerce plugin is installed and activated.
   *
   * @return bool
   */
  public static function isWooCommerceActive() {
    return class_exists('WooCommerce');
  }

  /**
   * Returns TRUE if WooCommerce plugin is active and ecommerce tracking enabled.
   *
   * @return bool
   */
  public static function isEcommerceTrackingEnabled() {
    return static::isWooCommerceActive() && get_option('shop_analytics_track_ecommerce');
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
   * Loads Google Analytics Data Layer related scripts.
   */
  public static function enqueueGaDataLayerScripts() {
    global $wp;

    $handle = Plugin::PREFIX . '_datalayer';
    $scripts = static::getBaseUrl() . '/dist/scripts/datalayer';
    $checkout_step_prefix = 'shop_analytics_checkout_step_';
    $checkout_step = 0;
    $wc_checkout_steps = apply_filters('shop_analytics_checkout_steps', [
      'view_cart' => 10,
      'checkout_page' => 20,
      'checkout_pay_page' => 30,
    ]);
    $wc_endpoints = apply_filters('shop_analytics_wc_endpoints', [
      'view-order' => 10,
      'edit-account' => 20,
      'edit-address' => 30,
      'lost-password' => 40,
      'customer-logout' => 50,
      'add-payment-method' => 60,
      'order-pay' => 70,
      'order-received' => 80,
    ]);

    wp_enqueue_script($handle . '_common', "$scripts/common.js", ['jquery'], FALSE, FALSE);
    wp_localize_script($handle . '_common', Plugin::PREFIX . '_settings', [
      'datalayer_console_log' => (int) get_option('shop_analytics_datalayer_logging') ? 'on' : 'off'
    ]);
    wp_enqueue_script($handle . '_cart', "$scripts/cart-checkout.js", [$handle . '_common'], FALSE, TRUE);

    if (is_cart() || is_checkout()) {
      if (is_cart()) {
        $checkout_step = apply_filters($checkout_step_prefix . '_view_cart', $wc_checkout_steps['view_cart']);
      }

      if (is_checkout_pay_page() && !empty($wc_checkout_steps['checkout_pay'])) {
        $checkout_step = apply_filters($checkout_step_prefix . '_checkout_pay', $wc_checkout_steps['checkout_pay']);
      }
      elseif (is_checkout() && !empty($wc_checkout_steps['checkout_page'])) {
        $checkout_step = apply_filters($checkout_step_prefix . '_checkout_page', $wc_checkout_steps['checkout_page']);
      }
    }
    elseif (isset($wp->query_vars['pagename'])) {
      $checkout_step = $wc_checkout_steps[$wp->query_vars['pagename']] ?? 0;
    }

    if ($checkout_step) {
      wp_enqueue_script($handle . '_cart_checkout', "$scripts/cart-checkout.js", [$handle . '_common'], FALSE, TRUE);
      wp_localize_script($handle . '_cart_checkout', Plugin::PREFIX . '_checkout_steps', [
        'order' => apply_filters($checkout_step_prefix . 'current', $checkout_step),
      ]);
    }

    if (is_wc_endpoint_url()) {
      wp_enqueue_script($handle . '_endpoints', "$scripts/endpoints.js", [$handle . '_common'], FALSE, TRUE);
      // Inject woocoomerce endpoint identifier into frontend.
      foreach ($wc_endpoints as $endpoint => $order) {
        if (is_wc_endpoint_url($endpoint)) {
          break;
        }
      }
      wp_localize_script($handle . '_endpoints', Plugin::PREFIX . '_endpoint_data', [
        'step' => $endpoint,
        'order' => $order,
      ]);
    }

    if (is_product()) {
      wp_enqueue_script($handle . '_product', "$scripts/product.js", [$handle . '_common'], FALSE, TRUE);
    }
  }

  /**
   * Builds a string containing HTML data tags with the product attributes.
   *
   * @param array $attributes
   *   Product attributes.
   *
   * @return string
   *   Product attributes as HTML data tags.
   */
  public static function buildAttributesDataTags(array $attributes) {
    array_walk($attributes, function (&$value, $key) {
      if (is_array($value)) {
        $value = implode($value, ', ');
      }
      if (!is_null($value) && '' !== trim($value)) {
        $value = 'data-' . $key . '="' . esc_attr($value) . '"';
      }
    });
    return implode(' ', $attributes);
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
