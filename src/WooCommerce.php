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
   * Retrieves the current shop currency code.
   *
   * @return string
   *   Currency code.
   */
  public static function getCurrency() {
    $currency = '';
    if (Plugin::isEcommerceTrackingEnabled() && function_exists('get_woocommerce_currency')) {
      $currency = strtoupper(get_woocommerce_currency());
    }
    return $currency;
  }

  /**
   * Retrieves the current page type.
   *
   * @return string
   *   Page type.
   */
  public static function getPageType() {
    if (!Plugin::isEcommerceTrackingEnabled()) {
      return '';
    }
    if (is_product()) {
      global $post;

      return 'Product | ' . ucwords(wc_get_product($post->ID)->get_type());
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
   * Retrieves current taxonomy product count.
   *
   * @return int
   *   Taxonomy product count.
   */
  public static function getProductCountInTaxonomy() {
    if (is_product_category() || is_product_tag() || static::isAttribute()) {
      return get_queried_object()->count;
    }
    return FALSE;
  }

  /**
   * Retrieves detailed information of a product.
   *
   * @return array
   *   List of product details.
   */
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

    if ($primary_category) {
      $category = static::getProductCategoryParents(static::getProductPrimaryCategoryId($product_id), '/');
    }
    else {
      $category = static::getProductCategoriesParentsList($product_id);
    }

    $details = [
      'id' => $product_id,
      'sku' => $product->get_sku(),
      'name' => str_replace(["'", '"'], '', wp_strip_all_tags($product->get_name(), TRUE)),
      'type' => $product->get_type(),
      'price' => number_format($product->get_price(), 2),
      'category' => $category,
      'brand' => static::getProductBrand($product_id),
      'gtin' => ($gtin = get_post_meta($product_id, '_custom_gtin', TRUE)) ? $gtin : '' ,
      'availability' => $product->is_in_stock() ? __('In stock', Plugin::L10N) : __('Out of stock', Plugin::L10N),
      'stock' => (int) $product->get_stock_quantity(),
    ];
    if ($currency = static::getCurrency()) {
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

    // Check if primary category is defined by Yoast's wordpress-seo plugin.
    if ( class_exists('\WPSEO_Primary_Term') ) {
      $wpseo_primary_term = new \WPSEO_Primary_Term('product_cat', get_the_id());
      $primary_term = $wpseo_primary_term->get_primary_term();
      if (!is_wp_error($term = get_term($primary_term))) {
        $primary_term_id = $term->term_id;
      }
    }

    if (!$primary_term_id && $terms = wc_get_product_terms($product_id, 'product_cat', ['orderby' => 'parent', 'order' => 'DESC'])) {
      // Consider the first category assigned to product as primary.
      $primary_term_id = $terms[0]->term_id;
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
    if ($term = get_term_by('id', $category_id, 'product_cat')) {
      $path = $term->name;
    }
    if ($ancestors = get_ancestors($category_id, 'product_cat')) {
      foreach ($ancestors as $ancestor) {
        $path = get_term_by('id', $ancestor, 'product_cat')->name . $separator . $path;
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
    $terms = wc_get_product_terms($product_id, 'product_cat', ['orderby' => 'parent', 'order' => 'DESC']);
    $categories = '';
    foreach ($terms as $term) {
      $categories .= static::getProductCategoryParents($term->term_id, $categories_separator) . $paths_separator;
    }
    return rtrim($categories, $paths_separator);
  }

  /**
   * Checks if current page is a product attribute page.
   *
   * @return bool
   *   TRUE if current page is a product attribute page, FALSE otherwhise.
   */
  public static function isAttribute() {
    return is_tax() && preg_match('/^pa_/', get_query_var('taxonomy'));
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
  public static function getProductBrand($product_id) {
    return !is_wp_error($brands = wp_get_post_terms($product_id, 'product_brand', ['orderby' => 'name', 'fields' => 'names'])) ? implode(' | ', $brands) : '';
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

    return str_replace('<a ', '<a ' . Plugin::buildAttributesDataTags($product_details) . ' ', $link);
  }

  /**
   * Prints a hidden HTML div element with current product details as data attributes.
   */
  public static function addProductDetailsHtmlDataAttr() {
    global $product;
    echo static::getProductDetailsHtmlDataAttr($product);
  }

  /**
   * Builds a hidden HTML div element with product details as data attributes.
   *
   * @param int $product
   *   Product unique identifier.
   */
  public static function getProductDetailsHtmlDataAttr($product) {
    $product_details = static::getProductDetails($product->get_id());

    if ('variation' === $product->get_type()) {
      $product_details['variant'] = wc_get_formatted_variation(wc_get_product($product)->get_variation_attributes(), TRUE);
    }

    $output = '<div class="shop-analytics-product-details" style="display:none;height:0;" ';
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

    $order_details = [
      'id' => $order->get_order_number(),
      'currency' => $order_data['currency'],
      'revenue' => $order_data['total'],
      'tax' => $order_data['cart_tax'],
      'shipping' => $order_data['shipping_total'],
      'payment-method' => $order_data['payment_method_title'],
    ];

    $html = '<div class="shop-analytics-order-details" style="display:none;height:0;"';
    $html .= Plugin::buildAttributesDataTags($order_details) . '>';

    foreach ($order->get_items() as $order_item) {
      $product = $order_item->get_product();
      $html .= str_replace('></div', ' data-quantity="' . $order_item->get_quantity() . '"></div', static::getProductDetailsHtmlDataAttr($product));
    }
    $html .= '</div>';

    return $html;
  }

}
