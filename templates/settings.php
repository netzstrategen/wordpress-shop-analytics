<?php

namespace Netzstrategen\ShopAnalytics;

global $wp_roles;

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
        <th scope="row"><?= __('Enable tracking', Plugin::L10N) ?></th>
        <td>
          <label for="shop-analytics-gtm-enabled">
            <input type="checkbox" name="shop_analytics_gtm_enabled" value="1" <?php checked(get_option('shop_analytics_gtm_enabled')); ?> id="shop-analytics-gtm-enabled">
          </label>
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-track-user-id"><?= __('Track User ID', Plugin::L10N) ?></label></th>
        <td>
          <input type="checkbox" name="shop_analytics_track_user_id" value="1" <?php checked(get_option('shop_analytics_track_user_id')); ?> id="shop-analytics-track-user-id">
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
    </table>
    <?php submit_button(); ?>
  </form>
</div>
