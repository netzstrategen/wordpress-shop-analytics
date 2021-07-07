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
   * Retrieves the current page type.
   *
   * @param int $post_id
   *   Current page post ID.
   *
   * @return string
   *   Page type.
   */
  public static function getPageType($post_id) {
    if (is_product()) {
      return 'Product | ' . ucwords(wc_get_product($post_id)->get_type());
    }
    elseif (is_product_category()) {
      return 'Product | Category';
    }
    elseif (is_product_tag()) {
      return 'Product | Tag';
    }
    elseif (is_cart()) {
      return 'Cart';
    }
    elseif (is_checkout()) {
      return 'Checkout';
    }
    else {
      return '';
    }
  }

  /**
   * Retrieves detailed information of a product.
   *
   * @param int $product_id
   *   Product unique identifier.
   * @param bool $primary_category
   *   If TRUE, only gets the primary or first category of product.
   *
   * @return array
   *   Details about given product.
   */
  public static function getProductDetails($product_id = 0, $primary_category = TRUE) {
    $product_id = $product_id ?: get_the_ID();
    $product = wc_get_product($product_id);
    $parent_id = $product->get_parent_id();

    if ($primary_category) {
      if (!$category = static::getProductCategoryParents(static::getProductPrimaryCategoryId($parent_id), '/')) {
        $category = static::getProductCategoryParents(static::getProductPrimaryCategoryId($product_id), '/');
      }
    }
    else {
      if (!$category = static::getProductCategoriesParentsList($parent_id)) {
        $category = static::getProductCategoriesParentsList($product_id);
      }
    }

    // Custom product name overrides default product name.
    if (!$product_name = get_post_meta($product_id, Plugin::PREFIX . '_custom_product_name', TRUE)) {
      $product_name = str_replace(["'", '"'], '', wp_strip_all_tags($product->get_name(), TRUE));
    }

    $product_id_field = get_option('shop_analytics_product_id');

    $product_sku = $product->get_sku();
    if ($product_id_field === 'sku_id' && $product_sku) {
      $product_track_id = $product_sku;
    }

    $details = [
      'id' => $product_track_id ?? $product_id,
      'sku' => $product_sku ?: $product_id,
      'name' => $product_name,
      'type' => $product->get_type(),
      'price' => number_format($product->get_price() ?: 0, 2, '.', ''),
      'category' => $category,
      'brand' => static::getProductBrand($product_id, $parent_id),
      'availability' => $product->is_in_stock() ? __('In stock', Plugin::L10N) : __('Out of stock', Plugin::L10N),
      'stock' => (int) $product->get_stock_quantity(),
    ];

    // Add GTIN from shop-standards meta field.
    if ($gtin = get_post_meta($product_id, apply_filters(Plugin::PREFIX . '_product_meta_key_gtin', '_shop-standards_gtin'), TRUE)) {
      $details['gtin'] = $gtin;
    }

    if ($product_tags = static::getProductTagsList($product_id)) {
      $details['tag'] = $product_tags;
    }

    if ($currency = get_woocommerce_currency()) {
      $details['currency'] = $currency;
    }
    if (!is_wp_error($delivery_time = get_term(get_post_meta($product_id, '_lieferzeit', TRUE))) && (isset($delivery_time->name))) {
      $details['delivery_time'] = $delivery_time->name;
    }

    return $details;
  }

  /**
   * Retrieves the attributes of a given product.
   *
   * @param \WC_Product $product
   *   Product for which attributes should be retrieved.
   * @param bool $skip_variations
   *   If TRUE, attributtes used in variations are skipped.
   * @param string $separator
   *   Separator between multiple values of an attribute.
   *
   * @return array
   *   List of attributes of the product.
   */
  public static function getProductAttributes(\WC_Product $product, $skip_variations = FALSE, $separator = ' | ') {
    $data = [];
    $attributes = $product->get_attributes();

    foreach ($attributes as $attribute) {
      if ($attribute['is_taxonomy'] && $attribute['is_visible'] === 1) {
        if ($attribute['is_variation'] && $skip_variations) {
          continue;
        }

        $terms = wp_get_post_terms($product->get_id(), $attribute['name'], 'all');
        if (empty($terms)) {
          continue;
        }

        $taxonomy = $terms[0]->taxonomy;
        $taxonomy_object = get_taxonomy($taxonomy);
        $taxonomy_label = '';
        if (isset($taxonomy_object->labels->name)) {
          // @todo Use proper translated gettext string to remove prefix.
          $taxonomy_label = str_replace('Produkt ', '', $taxonomy_object->labels->name);
        }

        $attribute = [
          'key' => substr($taxonomy_object->name, 3),
          'name' => $taxonomy_label,
          'value' => implode($separator, wp_list_pluck($terms, 'name')),
        ];
        $data[] = $attribute;
      }
    }

    return $data;
  }

  /**
   * Retrieves the primary category assigned to a product.
   *
   * Primary category concept is not native to WordPress and is added by
   * some plugins like Yoast's wordpress-seo. If this plugin is not active,
   * this method considers the first category assigned to the product
   * as the primary.
   *
   * @param int $product_id
   *   Product unique identifier.
   *
   * @return int
   *   Primary product category id.
   */
  public static function getProductPrimaryCategoryId($product_id) {
    $primary_term_id = 0;
    $product_category = static::getProductCategoryTermSlug();

    // Check if primary category is defined by Yoast's wordpress-seo plugin.
    if (class_exists('\WPSEO_Primary_Term')) {
      $wpseo_primary_term = new \WPSEO_Primary_Term($product_category, $product_id);
      $primary_term = $wpseo_primary_term->get_primary_term();
      if (!is_wp_error($term = get_term($primary_term))) {
        $primary_term_id = $term->term_id;
      }
    }

    // We could not get the primary category from Yoast's wordpress-seo plugin.
    if (!$primary_term_id) {
      $args = [
        'orderby' => 'parent',
        'order' => 'DESC',
      ];
      $terms = wc_get_product_terms($product_id, $product_category, $args);
      if ($terms) {
        // Consider the first category assigned to product as primary.
        $primary_term_id = $terms[0]->term_id;
      }
    }

    return $primary_term_id;
  }

  /**
   * Builds a list of category ancestors of a given category.
   *
   * @param int $category_id
   *   The category id.
   * @param int $separator
   *   Separator between ancestors of the category.
   *
   * @return string
   *   List of category parents.
   */
  public static function getProductCategoryParents($category_id, $separator = ' > ') {
    $path = '';
    $product_category = static::getProductCategoryTermSlug();

    if ($term = get_term_by('id', $category_id, $product_category)) {
      $path = $term->name;
    }
    if ($ancestors = get_ancestors($category_id, $product_category)) {
      foreach ($ancestors as $ancestor) {
        $path = get_term_by('id', $ancestor, $product_category)->name . $separator . $path;
      }
    }
    return $path;
  }

  /**
   * Builds a list of all categories parents of a product.
   *
   * @param int $product_id
   *   Product unique identifier.
   * @param string $categories_separator
   *   Separator between category parents.
   * @param string $paths_separator
   *   Separator between category parents paths.
   *
   * @return string
   *   List of category parents.
   */
  public static function getProductCategoriesParentsList($product_id, $categories_separator = ' > ', $paths_separator = ' | ') {
    $args = [
      'orderby' => 'parent',
      'order' => 'DESC',
    ];
    $terms = wc_get_product_terms($product_id, static::getProductCategoryTermSlug(), $args);
    $categories = '';
    foreach ($terms as $term) {
      $categories .= static::getProductCategoryParents($term->term_id, $categories_separator) . $paths_separator;
    }
    return rtrim($categories, $paths_separator);
  }

  /**
   * Builds a list of all tags assigned to a product.
   *
   * @param int $product_id
   *   Product unique identifier.
   * @param string $separator
   *   Separator between tags.
   *
   * @return string
   *   List of category tags.
   */
  public static function getProductTagsList($product_id, $separator = ' | ') {
    $tags = get_the_terms($product_id, 'product_tag');
    if (!$tags || is_wp_error($tags)) {
      return FALSE;
    }

    return implode($separator, wp_list_pluck($tags, 'name'));
  }

  /**
   * Checks if current page is a product attribute page.
   *
   * @return bool
   *   TRUE if current page is a product attribute page, FALSE otherwhise.
   */
  public static function isAttribute() {
    return is_tax() && preg_match('@^pa_@', get_query_var('taxonomy'));
  }

  /**
   * Returns the brand or brands of a given product.
   *
   * @param int $product_id
   *   Unique identifier of a product.
   *
   * @return string
   *   List of product brands.
   */
  public static function getProductBrand($product_id, $parent_id) {
    $args = [
      'orderby' => 'name',
      'fields' => 'names',
    ];
    $brands = wp_get_post_terms($parent_id ?: $product_id, static::getProductBrandTermSlug(), $args);
    return !is_wp_error($brands) ? implode(' | ', $brands) : '';
  }

  /**
   * Returns the slug of the taxonomy term used as product brand.
   *
   * @return string
   *   Product brand term slug.
   */
  public static function getProductBrandTermSlug(): string {
    return static::getProductAttributeSlug(Plugin::PREFIX . '_brand_attribute', 'product_brand');
  }

  /**
   * Returns the slug of the taxonomy term used as product category.
   *
   * @return string
   *   Product category term slug.
   */
  public static function getProductCategoryTermSlug(): string {
    return static::getProductAttributeSlug(Plugin::PREFIX . '_category_attribute', 'product_cat');
  }

  /**
   * Returns the slug of a product attribute as set in the plugin configuration.
   *
   * @param string $settings_attribute_slug
   *   Configuration setting name for the product attribute slug.
   * @param string $default
   *   Default term slug of the product attribute.
   *
   * @return string
   *   Term slug of the product attribute.
   */
  public static function getProductAttributeSlug($settings_attribute_slug, $default) {
    $attribute_slug = get_option($settings_attribute_slug, $default);
    if ($attribute_slug && $attribute_slug !== $default) {
      $attribute_slug = 'pa_' . $attribute_slug;
    }
    return $attribute_slug;
  }

  /**
   * Adds details of the product to the associated "remove from cart" link.
   *
   * @implements woocommerce_cart_item_remove_link
   */
  public static function woocommerce_cart_item_remove_link($link, $cart_item_key) {
    $cart_item = WC()->cart->get_cart()[$cart_item_key];
    $product = $cart_item['data'];
    $product_id = $cart_item['product_id'];
    $product_details = static::getProductDetails($product_id);

    $product_details['item_key'] = $cart_item_key;
    if ('variation' === $product->get_type()) {
      $product_details['variant'] = wc_get_formatted_variation(wc_get_product($product)->get_variation_attributes(), TRUE);
    }

    return str_replace('<a ', '<span class="shop-analytics-product-info" ' . Plugin::buildAttributesDataTags($product_details) . ' data-quantity="' . $cart_item['quantity'] . '"></span><a ', $link);
  }

  /**
   * Prints a hidden HTML div element with current single view product details as data attributes.
   */
  public static function addSingleProductDetailsHtmlDataAttr() {
    global $product;
    echo static::getProductDetailsHtmlDataAttr($product, TRUE);
  }

  /**
   * Prints a hidden HTML div element with impression product details as data attributes.
   */
  public static function addImpressionsProductDetailsHtmlDataAttr() {
    global $product;
    echo static::getProductDetailsHtmlDataAttr($product);
  }

  /**
   * Builds a hidden HTML div element with product details as data attributes.
   *
   * @param \WC_Product $product
   *   Product instance.
   * @param bool $is_detail_view
   *   Given product is displayed in single product detail view.
   *
   * @return string
   *   hidden HTML div element with product details as data attributes.
   */
  public static function getProductDetailsHtmlDataAttr(\WC_Product $product, $is_detail_view = FALSE) {
    $product_id = $product->get_id();
    $product_details = static::getProductDetails($product_id);

    if (($product->get_type() === 'variable' && $is_detail_view) || ($product->get_type() === 'variation' && !isset($product_details['variant']))) {
      $attributes = $product->get_variation_attributes();
      $selected_attributes = [];
      foreach ($attributes as $attribute_name => $options) {
        if ($product->get_type() === 'variable') {
          $attribute = isset($_REQUEST['attribute_' . sanitize_title($attribute_name)]) ? wc_clean(stripslashes(urldecode($_REQUEST['attribute_' . sanitize_title($attribute_name)]))) : '';
          if ($attribute) {
            $attribute_term_data = get_term_by('slug', $attribute, $attribute_name);
            $selected_attributes[] = $attribute_term_data ? $attribute_term_data->name : $attribute;
          }
        }
        if ($product->get_type() === 'variation') {
          $selected_attributes[] = $options;
        }
      }
      if ($selected_attributes) {
        $product_details['variant'] = implode(', ', $selected_attributes);
      }
    }

    $class = $is_detail_view ? 'shop-analytics-single-product-details' : 'shop-analytics-product-details';

    $output = '<div class="' . $class . '" style="display:none;height:0;" ';
    $output .= Plugin::buildAttributesDataTags($product_details) . '>';
    $output .= '</div>';

    return $output;
  }

  /**
   * Prints nested hidden HTML div elements with order and product details as data attributes.
   *
   * @param int $order_id
   *   Order unique identifier.
   */
  public static function addOrderDetailsHtmlDataAttr($order_id) {
    echo static::getOrderDetailsHtmlDataAttr($order_id);
  }

  /**
   * Builds nested hidden HTML div elements with order and product details as data attributes.
   *
   * @param int $order_id
   *   Order unique identifier.
   */
  public static function getOrderDetailsHtmlDataAttr($order_id) {
    if (!$order_id || !$order = wc_get_order($order_id)) {
      return;
    }
    $order_data = $order->get_data();

    $shipping_gross = $order_data['shipping_total'] + $order_data['shipping_tax'];
    $order_details = [
      'id' => $order->get_order_number(),
      'currency' => $order_data['currency'],
      'revenue' => $order_data['total'] - $shipping_gross,
      'tax' => $order_data['cart_tax'],
      'shipping' => $shipping_gross,
      'shipping_tax' => $order_data['shipping_tax'],
      'payment-method' => $order_data['payment_method_title'],
    ];

    if ($coupons = static::getOrderCoupons($order)) {
      $order_details['coupon'] = implode(' | ', $coupons);
    }

    // Set order_count according to current customer_id if available,
    // else default to 1, since this is considered user's first order.
    // This value will be overriden in endpoint.js, if order_count is available
    // in LocalStorage.
    $order_details['order_count'] = 1;
    if (!empty([$order_data['customer_id']])) {
      $order_details['order_count'] = max(1, wc_get_customer_order_count($order_data['customer_id']));
    }

    $html = '<div class="shop-analytics-order-details" style="display:none;height:0;" ';
    $html .= Plugin::buildAttributesDataTags($order_details) . '>';

    foreach ($order->get_items() as $order_item) {
      $product = $order_item->get_product();
      $html .= str_replace('></div>', ' data-quantity="' . $order_item->get_quantity() . '"></div>', static::getProductDetailsHtmlDataAttr($product));
    }
    $html .= '</div>';

    return $html;
  }

  /**
   * Retrieves the discount coupons of a given order.
   *
   * @param WC_Order $order
   *   Order to retrieve coupons from.
   *
   * @return array
   *   Discount coupons.
   */
  public static function getOrderCoupons($order) {
    if (version_compare(WC_VERSION, '3.7.0', '<')) {
      $coupons = $order->get_used_coupons();
    }
    else {
      $coupons = $order->get_coupon_codes();
    }

    return $coupons;
  }

  /**
   * Adds hidden fields with data related to product variations with a custom product name set.
   *
   * @implements woocommerce_after_single_variation
   */
  public static function woocommerce_after_single_variation() {
    global $post, $wpdb;

    $product = wc_get_product($post->ID);
    if ($product->is_type('variable')) {
      $html = '';

      $variation_ids = $wpdb->get_col($wpdb->prepare(
        "SELECT p.ID FROM {$wpdb->posts} p
        WHERE post_parent = %d
        AND post_status = 'publish'
        AND post_type = 'product_variation'",
        $post->ID
      ));

      $placeholders = implode(',', array_fill(0, count($variation_ids), '%s'));
      $custom_name_field = Plugin::PREFIX . '_custom_product_name';

      $results = $wpdb->get_results($wpdb->prepare(
        "SELECT p.ID, p.post_title, m.meta_value FROM $wpdb->posts p
        JOIN $wpdb->postmeta m
        ON m.post_id = p.ID
        AND post_status = 'publish'
        AND p.ID IN ($placeholders)
        AND m.meta_key = '$custom_name_field'",
        $variation_ids
      ), ARRAY_A);
      foreach ($results as $result) {
        $html .= '<input type="hidden" ';
        $html .= 'id="data-shop-analytics-' . $result['ID'] . '" ';
        $html .= 'data-product-id="' . $result['ID'] . '" ';
        $html .= isset($result['meta_value']) ? 'data-custom-product-name="' . esc_attr(str_replace(['"', "'"], '', $result['meta_value'])) . '" ' : '';
        $html .= '/>';
      }
      echo $html;
    }
  }

  /**
   * Displays custom product name field for simple products.
   *
   * @implements woocommerce_product_options_sku
   */
  public static function woocommerce_product_options_sku() {
    echo '<div class="options_group show_if_simple show_if_external" style="border-top:1px solid #eee">';
    woocommerce_wp_text_input([
      'id' => Plugin::PREFIX . '_custom_product_name',
      'label' => __('Product name in Analytics', Plugin::L10N),
      'desc_tip' => 'true',
      'description' => __('Used instead of product title in Google Analytics tracking data in order to achieve sensible reports.', Plugin::L10N),
    ]);
    echo '</div>';
  }

  /**
   * Saves custom product name field for simple products.
   *
   * @implements woocommerce_process_product_meta
   */
  public static function woocommerce_process_product_meta($post_id) {
    $field_name = Plugin::PREFIX . '_custom_product_name';

    if (isset($_POST[$field_name])) {
      if (!is_array($_POST[$field_name]) && $custom_product_name = $_POST[$field_name]) {
        update_post_meta($post_id, $field_name, $custom_product_name);
      }
      else {
        delete_post_meta($post_id, $field_name);
      }
    }
  }

  /**
   * Displays custom product name field for product variations.
   *
   * @implements woocommerce_variation_options
   */
  public static function woocommerce_variation_options($loop, $variation_id, $variation) {
    $field_name = Plugin::PREFIX . '_custom_product_name';

    echo '<div style="clear:both;border-bottom:1px solid #eee">';
    woocommerce_wp_text_input([
      'id' => $field_name . '[' . $loop . ']',
      'label' => __('Product name in Analytics', Plugin::L10N),
      'value' => get_post_meta($variation->ID, $field_name, TRUE),
      'desc_tip' => 'true',
      'description' => __('Used instead of product title in Google Analytics tracking data in order to achieve sensible reports.', Plugin::L10N),
    ]);
    echo '</div>';
  }

  /**
   * Saves custom product name field for product variations.
   *
   * @implements woocommerce_save_product_variation
   */
  public static function woocommerce_save_product_variation($variation_id, $loop) {
    $field_name = Plugin::PREFIX . '_custom_product_name';
    if (isset($_POST[$field_name][$loop])) {
      update_post_meta($variation_id, $field_name, $_POST[$field_name][$loop]);
    }
    else {
      delete_post_meta($variation_id, $field_name);
    }
  }

}
