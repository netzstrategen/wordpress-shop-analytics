# Wordpress Shop Analytics
This plugin tracks the activity of customers in WooCommerce based ecommerce sites and sends the collected data to Google Data Layer.

The plugin acts in two general areas:
- __Static Tracking:__ Tracking of information about the page currently displayed.
- __Dynamic Tracking:__ Tracking of the events triggered by the customers as they interact with the site.

In order to implement these functionalities, the plugin relies on Google Tag manager script. The plugin takes care of adding the GTM script in the page, once the required GTM ID is added to its backend configuration settings and the script injection enabled.

The (very) initial concept and requirements description of `shop-analytics` plugin can be found [in this document](https://docs.google.com/document/d/1Wpe4YoVDrdgiXtzfuSmIh36rEpaJ0gM87LMKST8BacQ/edit#heading=h.qu6ahb5mfd10). However, the plugin has grown and considerably evolved in complexity and functionality since then.
## Shop Analytics configuration settings

The plugin has a dedicated configuration settings page (`wp-admin/admin.php?page=shop-analytics`). Upon activation, the plugin adds a `Shop Analytics` entry to the WordPress admin menu.

The available configuration settings are:
- __Google Tag Manager Container ID:__ account ID to be used by Tag Manager script.
- __Google Tag Manager script embed:__ if checked, enabled the injection of the GTM script.
- __TagCommander enabled:__ Enables TagCommander variable optout.
- __Track User ID:__ if checked, user ID is tracked.
- __Use anonymized E-Mail address as User ID:__ if checked, anonymized E-Mail address is applied as user ID.
- __Track User Role:__ if checked, user role is tracked.
- __Disable User Tracking:__ user roles that should not be tracked.
- __Enable E-Commerce tracking:__ if checked, e-commerce related activity is tracked.
- __Market code (fallback value):__ market default code.
- __Enable GA dataLayer console logging:__ if checked, data object pushed to Google Data Layer is printed in the browser console. Useful for debugging purposes.
- __Attribute used as product brand:__ if a product attribute is used to manage product brands (instead of the WooCommerce native brand field), it can be selected here. This is necessary to correctly track products brand.
- __Attribute used as product category:__ if a product attribute is used to manage product categories (instead of regular categories), it can be selected here. This is necessary to correctly track products categories.
## Static Tracking

Several relevant details about the site page displayed are sent to GTM. This is achieved by injecting data attribute fields in the `<html>` tag. [See code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L101).

The data fields can vary depending on the type of page visited. Some data fields are used in all cases.

- __Common data fields:__
  - `language`: Site language.
  - `user-id`: User ID (if logged in).
  - `user-type`: User role.
  - `user-track`: tracking status for current user (`1` means tracked, `0` not tracked).

- __Not commerce related__
  - `page-type`: Page type. Possible values are:
    - Home
    - Page
    - Post
    - Tag
    - Category
    - Search
    - Other
- __Commerce related, if tracking enabled in backend settings:__
  - `page-type`: Page type. Possible values are:
    - Product single
      - Additionally: Product details and attributes.
        - `product-{detail name}`: product details.
        - `product-{attribute name}`: product attributes.
    - Product category, and
      - `product-category`: Category path
      - `product-count`: Products count in current taxonomy.
    - Product tag, and
      - `product-tag`: Tag name,
      - `product-count`: Products count in current taxonomy.
    - Cart
    - Checkout
  - `market`: Market designation.
  - `currency`: Currency in use.

E.g
Homepage
```
<html class="no-js" lang="de" data-language="de" data-user-id="cee037efd9a618bc4d1e8773eb18d2278370b798" data-user-type="administrator" data-user-track="0" data-page-type="Home" data-market="GLOBAL" data-currency="EUR">
```
Content page
```
<html class="no-js" lang="de" data-language="de" data-user-id="cee037efd9a618bc4d1e8773eb18d2278370b798" data-user-type="administrator" data-user-track="0" data-page-type="Page" data-market="GLOBAL" data-currency="EUR"
```
Search results page
```
<html class="no-js" lang="de" data-language="de" data-user-id="cee037efd9a618bc4d1e8773eb18d2278370b798" data-user-type="administrator" data-user-track="0" data-page-type="Search" data-market="GLOBAL" data-currency="CHF">
```

Product category listing
```
<html class="no-js" lang="de" data-language="de" data-user-id="cee037efd9a618bc4d1e8773eb18d2278370b798" data-user-type="administrator" data-user-track="0" data-page-type="Product | Category" data-market="GLOBAL" data-currency="EUR" data-product-category="Loungemöbel > Fix &amp; Fertig > Loungesets" data-product-count="173">
```
Single product
```
<html class="no-js" lang="de" data-language="de" data-user-id="cee037efd9a618bc4d1e8773eb18d2278370b798" data-user-type="administrator" data-user-track="0" data-page-type="Product | Variable" data-market="GLOBAL" data-currency="EUR" data-product-id="237112" data-product-sku="213520-M" data-product-name="4Seasons Outdoor Accor Diningsessel" data-product-type="variable" data-product-price="294.00" data-product-category="Gartenmöbel > Basics > Gartenstühle" data-product-brand="4Seasons Outdoor" data-product-availability="In stock" data-product-stock="2" data-product-currency="EUR" data-product-delivery-time="ca. 8-10 Werktage (Lagerartikel)" data-product-ausfuehrung-gestell="Edelstahl anthrazit" data-product-ausfuehrung-sitzflaeche="Rope anthrazit | Rope mid grey" data-product-material-kissen-bzw-auflage="100% Polypropylen (Olefin)" data-product-farbe-kissen-bzw-auflage="grau" data-product-pflegehinweis-kissen="abziehbar und waschbar" data-product-wetterfestigkeit-kissen="gut - verträgt längeren Schauer" data-product-breite="64 cm" data-product-tiefe="62 cm" data-product-hoehe="83 cm" data-product-belastbarkeit="120 kg" data-product-gewicht-ohne-verpackung="7 kg" data-product-serie="4Seasons Outdoor Accor" data-product-lieferzustand="montiert"
```
## Dynamic tracking

The activity of the user in the site triggers diverse events that are also tracked by `shop-analytics` and sent to Google Data Layer. The user interactions the plugin watches are related to:
- Navigation across the shop
- Checkout steps and details

In order to collect the data to be sent to Google Data Layer, `shop-analytics` builds adds data attribute fields into hidden `<div>` and `<span>` elements. This is done during the building and rendering of the page, relying on diverse WooCommerce hooks ([see code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L50)). E.g.

On single product view ([see code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/WooCommerce.php#L379))
```html
<div class="shop-analytics-single-product-details" style="display:none;height:0;" data-id="237112" data-sku="213520-M" data-name="4Seasons Outdoor Accor Diningsessel" data-type="variable" data-price="294.00" data-category="Gartenmöbel/Basics/Gartenstühle" data-brand="4Seasons Outdoor" data-availability="In stock" data-stock="2" data-currency="EUR" data-delivery_time="ca. 8-10 Werktage (Lagerartikel)"></div>
```
In cart page ([see code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/WooCommerce.php#L338))
```html
<span class="shop-analytics-product-info" data-id="237112" data-sku="213520-M" data-name="4Seasons Outdoor Accor Diningsessel" data-type="variable" data-price="294.00" data-category="Gartenmöbel/Basics/Gartenstühle" data-brand="4Seasons Outdoor" data-availability="In stock" data-stock="2" data-currency="EUR" data-delivery_time="ca. 8-10 Werktage (Lagerartikel)" data-item_key="8587e5976f070d5eee05ff4d18262f38" data-variant="Ausführung Sitzfläche: Rope anthrazit" data-quantity="1"></span>
```
In order confirmation page ([see code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/WooCommerce.php#L423))
```html
<div class="shop-analytics-order-details" style="display:none;height:0;" data-id="6023852" data-currency="EUR" data-revenue="578" data-tax="79.72" data-shipping="0" data-shipping_tax="0" data-payment-method="50% Vorkasse per Überweisung" data-coupon="weil wir nett sind :-)" data-order_count="2">
  <div class="shop-analytics-product-details" style="display:none;height:0;" data-id="280274" data-sku="213520" data-name="4Seasons Outdoor Accor Diningsessel - Rope anthrazit" data-type="variation" data-price="294.00" data-availability="Out of stock" data-stock="0" data-gtin="8720087001241" data-currency="EUR" data-delivery_time="ca. 8-10 Werktage (Lagerartikel)" data-quantity="2"></div>
</div>
```

When the hidden element is ready, all the required data attribute fields added, a set of scripts take care of retrieve the information, organize it in a DataLayer object, and push it into Google DataLayer.

The JSON object pushed to Google Data Layer has a predefined basic format, which varies depending on the event to be tracked.

E.g.
Products impressions (products listing page, partial data)
```json
{
  "event": "EECproductImpression",
  "ecommerce": {
    "currencyCode": "EUR",
    "impressions": [
      {
        "name": "4Seasons Outdoor Accor Diningsessel",
        "id": "213520-M",
        "price": "294.00",
        "category": "Gartenmöbel/Basics/Gartenstühle",
        "brand": "4Seasons Outdoor",
        "position": 1,
        "list": "Product Category"
      },
      {
        "name": "4Seasons Outdoor Athena Diningsessel",
        "id": "91013",
        "price": "249.00",
        "category": "Gartenmöbel/Basics/Gartenstühle",
        "brand": "4Seasons Outdoor",
        "position": 2,
        "list": "Product Category"
      },
      {
        "name": "Cane-line Diamond GartenstuhlTextilgewebe",
        "id": "8401TXW-M",
        "price": "484.00",
        "category": "Gartenmöbel/Basics/Gartenstühle",
        "brand": "Cane-line",
        "position": 3,
        "list": "Product Category"
      },
      {

      }
    ]
  },
  "gtm.uniqueEventId": 12
}
```
Single product view
```json
{
  "event": "EECproductDetailView",
  "ecommerce": {
    "detail": {
      "actionField": { "list": "Product detail" },
      "products": [
        {
          "name": "4Seasons Outdoor Accor Diningsessel",
          "id": "213520-M",
          "price": "294.00",
          "category": "Gartenmöbel/Basics/Gartenstühle",
          "brand": "4Seasons Outdoor"
        }
      ]
    }
  },
  "gtm.uniqueEventId": 12
}
```

Add product(s) to cart
```json
{
  "event": "EECaddToCart",
  "ecommerce": {
    "currencyCode": "EUR",
    "add": {
      "products": [
        {
          "name": "4Seasons Outdoor Accor Diningsessel",
          "id": "280274",
          "price": "294.00",
          "category": "Gartenmöbel/Basics/Gartenstühle",
          "brand": "4Seasons Outdoor",
          "variant": "Rope anthrazit",
          "quantity": 1
        }
      ]
    }
  },
  "gtm.uniqueEventId": 48
}
```
The events tracked are:
- Navigation
  - [Click on navigation element](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L433)
- User
  - [New user registration](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L401)
  - [New user registration during checkout](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L414)
  - [User login](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L388)
- Products listings
  - [Product impressions](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L226)
  - [Click on product](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L302)
- Single product
  - [View single product page](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/product.js#L16)
  - [Add product to cart](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L341)
  - [Update product quantity](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/product.js#L48)
  - [Product variation selection](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/product.js#L57)
  - [Show product gallery](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/product.js#L77)
- Cart
  - [Update cart totals](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L36)
  - [Update product quantity in cart](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L36)
  - [Remove product from cart](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L459)
  - [Empty cart](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L424)
- Checkout
  - [Update shipping method](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L36)
  - [Update payment method](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L36)
  - [Update billing address](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L36)
  - [Update shipping address](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L108)
  - [Order placed](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/cart-checkout.js#L72)
  - WooCommerce checkout enpoints ([See code](https://github.com/netzstrategen/wordpress-shop-analytics/blob/3f326907a7bb49db30b67cc9bd0c3538850d93b5/src/Plugin.php#L281)), represented with an integer value (default values can be [modified with a filter](#backend)).
    - `view-order`
    - `edit-account`
    - `edit-address`
    - `lost-password`
    - `customer-logout`
    - `add-payment-method`
    - `order-pay`
    - `order-received`

## Code customization

### Backend
Code customization is possible using the provided filters:
- [shop_analytics_product_meta_key_gtin](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/WooCommerce.php#L85): allows to modify the name (value of `meta_key`) of the meta field used to store the products GTIN.
- [shop_analytics_checkout_steps](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L276): allows to modify the integer used to represent each WooCommerce checkout step.
- [shop_analytics_wc_endpoints](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L281): allows to modify the integer used to represent each WooCommerce endpoint.
- [shop_analytics_checkout_step__view_cart](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L301): allows to modify the integer used to represent WooCommerce `view_cart` checkout step.
- [shop_analytics_checkout_step__checkout_pay](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L305): allows to modify the integer used to represent WooCommerce `pay` checkout step.
- [shop_analytics_checkout_step__checkout_page](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L308): allows to modify the integer used to represent WooCommerce `checkout_page` checkout step.
- [shop_analytics_checkout_step_current](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/src/Plugin.php#L308): allows to modify the integer passed to the frontend to represent WooCommerce current checkout step.

### Frontend (JS)
It is possible to override many default values modifying the entries of the properties of the object `shopAnalytics`, which is [added to the browser document object as a property](https://github.com/netzstrategen/wordpress-shop-analytics/blob/5b410895b76599adf24ada7feac5733c71c42c95/assets/scripts/datalayer/common.js#L129-L180). This allows to customize the selectors used to trigger some dynamic tracking events, if necessary.

