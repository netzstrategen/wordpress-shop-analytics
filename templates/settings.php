<?php

namespace Netzstrategen\ShopAnalytics;

global $wp_roles;

$product_attributes = function_exists('wc_get_attribute_taxonomies') ? wc_get_attribute_taxonomies() : '';
$product_id = get_option('shop_analytics_product_id', 'post_id');
if ($product_attributes) {
  $brand_attribute = get_option('shop_analytics_brand_attribute', 'product_brand');
  $category_attribute = get_option('shop_analytics_category_attribute', 'product_cat');
}
?>

<div class="wrap">
  <h2><?= __('Shop Analytics', Plugin::L10N) ?></h2>
  <form method="post" action="options.php" class="<?= Plugin::PREFIX ?>-form">
    <?php settings_fields('shop-analytics-settings'); ?>
    <?php do_settings_sections('shop-analytics-settings'); ?>
    <table class="form-table">
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-gtm-id"><?= __('Google Tag Manager Container ID', Plugin::L10N) ?></label></th>
        <td>
          <input type="text" name="shop_analytics_gtm_id" value="<?= esc_attr(get_option('shop_analytics_gtm_id')) ?>" id="shop-analytics-gtm-id">
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><?= __('Google Tag Manager script embed', Plugin::L10N) ?></th>
        <td>
          <label for="shop-analytics-gtm-embed">
            <input type="checkbox" name="shop_analytics_gtm_embed" value="1" <?php checked(get_option('shop_analytics_gtm_embed')); ?> id="shop-analytics-gtm-embed">
          </label>
          <?= __('Embed Google Tag Manager script to head and footer', Plugin::L10N) ?>
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><?= __('TagCommander enabled', Plugin::L10N) ?></th>
        <td>
          <label for="shop_analytics_tc_enabled">
            <input type="checkbox" name="shop_analytics_tc_enabled" value="1" <?php checked(get_option('shop_analytics_tc_enabled')); ?> id="shop_analytics_tc_enabled">
          </label>
          <?= __('Enable TagCommander variable optout', Plugin::L10N) ?>
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-track-user-id"><?= __('Track User ID', Plugin::L10N) ?></label></th>
        <td>
          <input type="checkbox" name="shop_analytics_track_user_id" value="1" <?php checked(get_option('shop_analytics_track_user_id')); ?> id="shop-analytics-track-user-id">
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-user-id-email"><?= __('Use anonymized E-Mail address as User ID', Plugin::L10N) ?></label></th>
        <td>
          <input type="checkbox" name="shop_analytics_user_id_email" value="1" <?php checked(get_option('shop_analytics_user_id_email')); ?> id="shop-analytics-user-id_email">
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-track-user-role"><?= __('Track User Role', Plugin::L10N) ?></label></th>
        <td>
          <input type="checkbox" name="shop_analytics_track_user_role" value="1" <?php checked(get_option('shop_analytics_track_user_role')); ?> id="shop-analytics-track-user-role">
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><?= __('Disable User Tracking', Plugin::L10N) ?></th>
        <td>
          <?php
            // Shouldn't there also the `visitor` role be included?
            $user_roles = $wp_roles->get_names();
          ?>
          <?php foreach ($user_roles as $user_role => $user_role_name): ?>
          <!-- `in_array` should use the 3rd parameter to compare strictly.-->
            <label>
              <input type="checkbox" name="shop_analytics_disable_user_tracking[]" value="<?= $user_role ?>" <?php checked(in_array($user_role, Plugin::getDisabledUserRoles(), TRUE)); ?>>
              <?= $user_role_name ?>
            </label>
            <br>
          <?php endforeach; ?>
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row">
          <label for="shop-analytics-track-ecommerce"><?= __('Enable E-Commerce tracking', Plugin::L10N) ?></label>
        </th>
        <td>
          <input
            id="shop-analytics-track-ecommerce"
            name="shop_analytics_track_ecommerce"
            type="checkbox"
            value="1"
            <?php checked(Plugin::isEcommerceTrackingEnabled()); ?>
            <?php disabled(Plugin::isWooCommerceActive(), FALSE); ?>
          >
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row">
          <label for="shop-analytics-google-optimize"><?= __('Enable Page Hiding for Google Optimize', Plugin::L10N) ?></label>
        </th>
        <td>
          <input
            id="shop-analytics-google-optimize"
            name="shop_analytics_google_optimize"
            type="checkbox"
            value="1"
            <?php checked(Plugin::isGoogleOptimizeEnabled()); ?>
          >
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row">
          <label for="shop-analytics-market-default"><?= __('Market code (fallback value)', Plugin::L10N) ?></label>
        </th>
        <td>
          <input
            id="shop-analytics-market-default"
            name="shop_analytics_market_default"
            type="text"
            size="20"
            value="<?= esc_attr(get_option('shop_analytics_market_default')) ?: 'GLOBAL' ?>"
            maxlength="12"
            style="width:120px;"
          >
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row">
          <label for="shop-analytics-datalayer-logging"><?= __('Enable GA dataLayer console logging', Plugin::L10N) ?></label>
        </th>
        <td>
          <input
            id="shop-analytics-datalayer-logging"
            name="shop_analytics_datalayer_logging"
            type="checkbox"
            value="1"
            <?php checked(get_option('shop_analytics_datalayer_logging')); ?>
            <?php disabled(Plugin::isWooCommerceActive(), FALSE); ?>
          >
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row">
          <label for="shop-analytics-product-id"><?= __('Field to use as product ID', Plugin::L10N) ?></label>
        </th>
        <td>
          <select id="shop-analytics-product-id" name="shop_analytics_product_id">
            <?php foreach (['post_id', 'sku_id'] as $field): ?>
              <option value="<?= $field ?>" <?php selected($field, $product_id); ?>>
                <?= $field ?>
              </option>
            <?php endforeach; ?>
          </select>
        </td>
      </tr>
      <?php if ($product_attributes): ?>
        <tr class="form-field">
          <th scope="row">
            <label for="shop-analytics-brand-attribute"><?= __('Attribute used as product brand', Plugin::L10N) ?></label>
            <p class="hint"><?= __('Slug of attribute used as product brand. Default: product_brand', Plugin::L10N) ?></p>
          </th>
          <td>
              <select
                id="shop-analytics-brand-attribute"
                name="shop_analytics_brand_attribute"
              >
                <option
                  value="product_brand"
                  <?php selected('product_brand', $brand_attribute); ?>
                >product_brand</option>
                <?php foreach ($product_attributes as $attribute): ?>
                  <option
                    value="<?= $attribute->attribute_name ?>"
                    <?php selected($attribute->attribute_name, $brand_attribute); ?>
                  ><?= $attribute->attribute_name ?></option>
                <?php endforeach; ?>
              </select>
            </td>
        </tr>
      <?php endif; ?>
      <?php if ($product_attributes): ?>
        <tr class="form-field">
          <th scope="row">
            <label for="shop-analytics-category-attribute"><?= __('Attribute used as product category', Plugin::L10N) ?></label>
            <p class="hint"><?= __('Slug of attribute used as product category. Default: product_cat', Plugin::L10N) ?></p>
          </th>
          <td>
            <select
              id="shop-analytics-category-attribute"
              name="shop_analytics_category_attribute"
            >
              <option
                value="product_cat"
                <?php selected('product_cat', $category_attribute); ?>
              >product_cat</option>
              <?php foreach ($product_attributes as $attribute): ?>
                <option
                  value="<?= $attribute->attribute_name ?>"
                  <?php selected($attribute->attribute_name, $category_attribute); ?>
                ><?= $attribute->attribute_name ?></option>
              <?php endforeach; ?>
            </select>
          </td>
        </tr>
      <?php endif; ?>
    </table>
    <?php submit_button(); ?>
  </form>
</div>
