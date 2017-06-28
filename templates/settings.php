<?php
  namespace Netzstrategen\ShopAnalytics;
?>

<div class="wrap">
  <h2><?= __('Shop Analytics', Plugin::L10N) ?></h2>
  <form method="post" action="options.php" class="<?= Plugin::PREFIX ?>-form">
    <?php settings_fields('shop-analytics-settings'); ?>
    <?php do_settings_sections('shop-analytics-settings'); ?>
    <table class="form-table">
      <tr class="form-field">
        <th scope="row"><label for="shop-analytics-gtm-container"><?= __('Google Tag Manager Container ID', Plugin::L10N) ?></label></th>
        <td>
          <input type="text" name="shop_analytics_gtm_container" value="<?= esc_attr(get_option('shop_analytics_gtm_container')) ?>" id="shop-analytics-gtm-container">
        </td>
      </tr>
      <tr class="form-field">
        <th scope="row"><?= __('Google Tag Manager Container Embed', Plugin::L10N) ?></th>
        <td>
          <label for="shop-analytics-gtm-container-embed">
            <input type="checkbox" name="shop_analytics_gtm_container_embed" value="1" <?php checked(get_option('shop_analytics_gtm_container_embed')); ?> id="shop-analytics-gtm-container-embed">
            <?= __('Embed Google Tag Manager container code to head and footer', Plugin::L10N) ?>
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
            global $wp_roles;
            $user_roles = $wp_roles->get_names();
            $disabled_user_roles = (get_option('shop_analytics_disable_user_tracking')) ? get_option('shop_analytics_disable_user_tracking') : array();
            foreach ($user_roles as $user_role => $user_role_name) {
          ?>
            <input type="checkbox" name="shop_analytics_disable_user_tracking[]" value="<?= $user_role ?>" <?php checked(in_array($user_role, $disabled_user_roles)); ?>>
            <?= $user_role_name ?>
            <br/>
          <?php
            }
          ?>
        </td>
      </tr>
    </table>
    <?php submit_button(); ?>
  </form>
</div>
