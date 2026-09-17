'use strict';

/**
 * GA4 ecommerce events for the Cart and Checkout blocks.
 *
 * The blocks render from React and keep their state in the wc/store/* data
 * stores, so none of the jQuery events cart-checkout.js listens for ever fire
 * here. This reads the same cart the blocks render and pushes on change.
 */
(function (wp) {
  var shopAnalytics = document.shopAnalytics;
  var settings = window.shop_analytics_block_data;

  if (!wp || !wp.data || !shopAnalytics || !settings) {
    return;
  }

  var CART = 'wc/store/cart';
  var PAYMENT = 'wc/store/payment';

  // What the last push saw, so a store change that does not concern us is
  // cheap to ignore and nothing is pushed twice.
  var seen = {
    entered: false,
    refetched: false,
    items: null,
    shippingId: null,
    paymentType: null,
    // What was selected before an express attempt, so its cancellation is
    // not read as the customer choosing that method again.
    preExpress: null,
    beganCheckout: false
  };

  wp.data.subscribe(onStoreChange);
  // subscribe() does not call the listener on registration, so a store that
  // already resolved before this script ran would never be seen.
  onStoreChange();

  /**
   * Whether every item carries this plugin's Store API data.
   */
  function identified(cart) {
    // The cart's own answer on tax has to be there too. A snapshot stored by
    // an older version carries the item data but not this, and reading its
    // absence as "no tax" reports a net value beside gross prices.
    var cartExtra = cart.extensions && cart.extensions[settings.namespace];
    if (!cartExtra || typeof cartExtra.prices_include_tax !== 'boolean') {
      return false;
    }
    return cart.items.every(function (item) {
      var extra = item.extensions && item.extensions[settings.namespace];
      // The tracking id itself, not merely the namespace: an empty object
      // passes a presence check while carrying nothing to report.
      return !!(extra && extra.item_id);
    });
  }

  /**
   * Asks the blocks to fetch the cart again, once.
   */
  function refetchCart() {
    try {
      var store = wp.data.dispatch(CART);
      if (store && typeof store.invalidateResolutionForStoreSelector === 'function') {
        store.invalidateResolutionForStoreSelector('getCartData');
      }
    }
    catch (error) {
      // Never break the cart over analytics: without a refresh the next
      // store change reports what it has.
      seen.refetched = true;
    }
  }

  /**
   * A per-unit share of a line amount, in currency units.
   *
   * Rounded far enough that multiplying it back by the quantity returns the
   * line it came from. The currency's own precision is not enough: a share
   * smaller than one minor unit would round to nothing.
   */
  function perUnit(minorUnits, minorUnit) {
    var unit = decimals(minorUnit) + 4;
    return parseFloat((minorUnits / Math.pow(10, decimals(minorUnit))).toFixed(unit));
  }

  /**
   * Converts a Store API amount, which is an integer in the minor unit.
   */
  function amount(value, minorUnit) {
    var unit = decimals(minorUnit);
    return parseFloat((parseInt(value, 10) / Math.pow(10, unit)).toFixed(unit));
  }

  /**
   * toFixed throws above 100, and the currency decimals setting has no upper
   * bound, so a nonsensical value would take the whole subscriber down.
   */
  function decimals(minorUnit) {
    if (typeof minorUnit !== 'number' || !isFinite(minorUnit) || minorUnit < 0) {
      return 2;
    }
    return Math.min(Math.floor(minorUnit), 100);
  }

  /**
   * Builds the items array from the cart.
   *
   * The identifying fields come from the Store API extension rather than from
   * the cart item itself, so they match what the purchase event sends.
   */
  /**
   * Whether the prices in this response carry tax.
   *
   * Answered by the request that built the response. The setting is filtered
   * per country, so it cannot be decided when the page renders, and it cannot
   * be inferred either: a line whose net and gross sit equally far from the
   * quoted price is genuinely ambiguous, and guessing it wrong turns every
   * amount in the cart into the wrong one.
   */
  function pricesIncludeTax(cart) {
    var extra = cart.extensions && cart.extensions[settings.namespace];
    return !!(extra && extra.prices_include_tax);
  }

  /**
   * What one line owes after its discounts, in minor units.
   */
  function lineTotal(item, inclTax) {
    var t = item.totals;
    return parseInt(t.line_total, 10) + (inclTax ? parseInt(t.line_total_tax, 10) : 0);
  }

  /**
   * The discount on one line, per unit, in minor units.
   */
  function lineDiscount(item, inclTax) {
    var t = item.totals;
    var before = parseInt(t.line_subtotal, 10) + (inclTax ? parseInt(t.line_subtotal_tax, 10) : 0);
    var quantity = item.quantity || 1;
    return Math.max(0, before - lineTotal(item, inclTax)) / quantity;
  }

  function buildItems(cart) {
    var inclTax = pricesIncludeTax(cart);
    return cart.items.map(function (item, position) {
      var extra = (item.extensions && item.extensions[settings.namespace]) || {};
      var built = {
        item_id: String(extra.item_id || item.id),
        item_name: extra.item_name || item.name,
        // The Store API price is the one this cart line actually costs.
        // Composites and bundles change it, so the catalog price would lie.
        price: amount(item.prices.price, item.prices.currency_minor_unit),
        quantity: item.quantity,
        index: position + 1
      };
      if (extra.item_brand) {
        built.item_brand = extra.item_brand;
      }
      if (extra.item_category) {
        built.item_category = extra.item_category;
      }
      if (extra.item_variant) {
        built.item_variant = extra.item_variant;
      }
      // A coupon reduces what the line costs without changing the product's
      // price, which is what GA4 keeps discount for. Carried at whatever
      // precision the per-unit share needs: four cents off ten units is
      // 0.004 each, and rounding that to the currency loses the discount
      // entirely while value still reports it.
      var discount = lineDiscount(item, inclTax);
      if (discount > 0) {
        built.discount = perUnit(discount, item.prices.currency_minor_unit);
      }
      return built;
    });
  }

  /**
   * Pushes one ecommerce event.
   *
   * The null push clears the previous ecommerce object, so items from an
   * earlier event cannot leak into this one.
   */
  function push(event, ecommerce) {
    shopAnalytics.postToDataLayer({ecommerce: null});
    shopAnalytics.postToDataLayer({event: event, ecommerce: ecommerce});
  }

  function cartEcommerce(cart) {
    return {
      currency: cart.totals.currency_code,
      value: cartValue(cart),
      items: buildItems(cart)
    };
  }

  /**
   * What the cart owes for its items, shipping excluded.
   *
   * Summed from the line totals, which is what the customer is actually
   * charged, rather than from the per-unit prices. The two are different
   * roundings and cannot always agree: WooCommerce rounds the line, GA4's
   * item model rounds the unit, and a line discount that does not divide by
   * its quantity has no exact per-unit form. The line is the one that has to
   * be right, because it is the one the shop bills.
   */
  function cartValue(cart) {
    var inclTax = pricesIncludeTax(cart);
    var sum = cart.items.reduce(function (total, item) {
      return total + lineTotal(item, inclTax);
    }, 0);
    return amount(sum, cart.totals.currency_minor_unit);
  }

  /**
   * What the items cost, shipping excluded.
   *
   * Summed from the very prices this event reports, not from the cart's own
   * item total. Those are two different roundings — the total rounds the
   * line, the price rounds the unit — so a cart of 3 at 11.665 reports items
   * adding up to 35.01 against a total of 35.00. Summing the reported prices
   * also means the value follows whatever tax display the Store API applied,
   * with nothing to keep in step on this side.
   */
  /**
   * The short, fixed name for a gateway, falling back to its id.
   */
  function paymentType(id) {
    var map = settings.payment_types || {};
    return Object.prototype.hasOwnProperty.call(map, id) ? map[id] : id;
  }

  /**
   * The short, fixed tier for a shipping label, falling back to the label.
   */
  function shippingTier(label) {
    var map = settings.shipping_tiers || {};
    var haystack = String(label).toLowerCase();
    var keys = Object.keys(map);
    for (var i = 0; i < keys.length; i++) {
      if (haystack.indexOf(keys[i]) !== -1) {
        return map[keys[i]];
      }
    }
    return label;
  }

  function couponCodes(cart) {
    // ' | ' is the separator the purchase event already uses.
    return cart.coupons.map(function (coupon) {
      return coupon.code;
    }).join(' | ');
  }

  /**
   * The shipping the customer has selected, across every package.
   *
   * Identified by rate id per package, not by name: a cart can ship in more
   * than one package, and two rates can carry the same label, so a name alone
   * would hide a real change.
   */
  function selectedShipping(cart) {
    var chosen = [];
    (cart.shippingRates || []).forEach(function (packageRates) {
      (packageRates.shipping_rates || []).forEach(function (rate) {
        if (rate.selected) {
          chosen.push({pkg: String(packageRates.package_id), rate: rate.rate_id, name: shippingTier(decode(rate.name))});
        }
      });
    });
    if (!chosen.length) {
      return null;
    }
    // Sorted by package: the response may list the same packages in another
    // order, and an order-dependent fingerprint would read as a change.
    chosen.sort(function (a, b) {
      return a.pkg < b.pkg ? -1 : (a.pkg > b.pkg ? 1 : 0);
    });
    // Identified by the tier it reports, not by rate id: switching between two
    // rates of the same tier would otherwise fire the same value twice.
    var tier = chosen.map(function (c) { return c.name; }).join(', ');
    return {id: tier, tier: tier};
  }

  /**
   * Shipping names arrive HTML-encoded, so "DHL & Express" would be sent as
   * "DHL &#038; Express".
   */
  function decode(text) {
    if (wp.htmlEntities && typeof wp.htmlEntities.decodeEntities === 'function') {
      return wp.htmlEntities.decodeEntities(text);
    }
    return text;
  }

  /**
   * Items that lost quantity since the last state, as remove_from_cart wants
   * them: only the affected item, and only the amount that went away.
   */
  function removedItems(before, cart) {
    var current = {};
    cart.items.forEach(function (item) {
      current[item.key] = item.quantity;
    });

    var removed = [];
    Object.keys(before.quantities).forEach(function (key) {
      var gone = before.quantities[key] - (current[key] || 0);
      if (gone <= 0) {
        return;
      }
      var item = before.items[key];
      if (item) {
        var gone_item = Object.assign({}, item, {quantity: gone});
        // The ticket's removal payload has no index.
        delete gone_item.index;
        removed.push({item: gone_item, minorUnit: before.units[key]});
      }
    });
    return removed;
  }

  /**
   * Snapshot used to tell a removal from any other cart change.
   */
  function snapshot(cart) {
    var quantities = {};
    var items = {};
    var units = {};
    var built = buildItems(cart);
    cart.items.forEach(function (item, position) {
      quantities[item.key] = item.quantity;
      items[item.key] = built[position];
      units[item.key] = item.prices.currency_minor_unit;
    });
    return {quantities: quantities, items: items, units: units};
  }

  function onStoreChange() {
    var cartStore = wp.data.select(CART);
    if (!cartStore || !cartStore.hasFinishedResolution('getCartData')) {
      return;
    }
    var cart = cartStore.getCartData();
    if (!cart || !cart.items) {
      return;
    }

    // The first state with items is the one the customer is looking at.
    if (!seen.entered) {
      if (!cart.items.length) {
        return;
      }
      // A cart snapshot stored before this plugin shipped carries no
      // extension data, and the blocks hydrate it as already resolved. Its
      // items would be reported by product id instead of the tracking id the
      // purchase event uses, and the first event cannot be taken back, so
      // fetch the cart once and wait for the answer.
      if (!identified(cart)) {
        if (!seen.refetched) {
          seen.refetched = true;
          refetchCart();
          return;
        }
        // The refresh did not bring it either, so nothing here can be priced
        // honestly. Reporting a guessed amount is worse than reporting none.
        seen.entered = true;
        return;
      }
      seen.entered = true;
      seen.items = snapshot(cart);

      if (settings.page === 'checkout') {
        beginCheckout(cart);
      }
      else {
        push('view_cart', cartEcommerce(cart));
      }
    }
    else {
      removedItems(seen.items, cart).forEach(function (gone) {
        var unit = decimals(gone.minorUnit);
        var net = (gone.item.price - (gone.item.discount || 0)) * gone.item.quantity;
        push('remove_from_cart', {
          currency: cart.totals.currency_code,
          value: parseFloat(net.toFixed(unit)),
          items: [gone.item]
        });
      });
      // Always move the snapshot forward, so the next decrease is measured
      // from the quantities the customer can see right now.
      seen.items = snapshot(cart);
    }

    // The cart has no shipping step, but it does offer express payment, and
    // clicking PayPal there is a real choice. Anything else on the cart page
    // is the session's leftover default, which the customer never picked.
    if (settings.page !== 'checkout') {
      if (expressPaymentActive()) {
        // An express purchase can finish without ever loading the checkout
        // page, so this is where its checkout begins. Left unreported the
        // funnel would jump from view_cart straight to purchase.
        beginCheckout(cart);
        reportPayment(cart);
      }
      return;
    }

    // seen starts empty, so the method the checkout resolves first counts as
    // a selection and the funnel gets its step even if nothing is switched.
    var shippingChoice = selectedShipping(cart);
    if (shippingChoice && shippingChoice.id !== seen.shippingId) {
      seen.shippingId = shippingChoice.id;
      var shipping = cartEcommerce(cart);
      shipping.coupon = couponCodes(cart);
      shipping.shipping_tier = shippingChoice.tier;
      push('add_shipping_info', shipping);
    }

    reportPayment(cart);
  }

  /**
   * Pushes begin_checkout, at most once per page.
   *
   * Not suppressed across pages: a customer who cancels an express payment
   * on the cart and then opens the checkout really has started checkout
   * twice, and suppressing the second would lose a step that happened.
   */
  function beginCheckout(cart) {
    if (seen.beganCheckout) {
      return;
    }
    seen.beganCheckout = true;
    var checkout = cartEcommerce(cart);
    checkout.coupon = couponCodes(cart);
    push('begin_checkout', checkout);
  }

  function reportPayment(cart) {
    var active = activePaymentMethod();
    // Compared as the name that gets reported: two gateways sharing one name
    // are one value, and the checkout re-resolves often.
    var payment = active ? paymentType(active) : null;
    if (!payment || payment === seen.paymentType) {
      return;
    }

    var express = expressPaymentActive();
    if (express) {
      if (seen.preExpress === null) {
        seen.preExpress = seen.paymentType;
      }
    }
    else if (seen.preExpress !== null) {
      var restored = payment === seen.preExpress;
      seen.preExpress = null;
      if (restored) {
        // The blocks put back what was selected before the express attempt.
        // Nobody chose it, so record it without reporting a step.
        seen.paymentType = payment;
        return;
      }
    }

    seen.paymentType = payment;
    var paying = cartEcommerce(cart);
    paying.coupon = couponCodes(cart);
    paying.payment_type = payment;
    push('add_payment_info', paying);
  }

  /**
   * The payment method the customer can actually pay with.
   *
   * The store restores the method held in the session before it knows which
   * ones this cart allows, so it can briefly report one that is no longer
   * available. Reporting that would be a step the customer never took.
   *
   * Express methods live in their own map, so both have to be consulted: a
   * customer paying with Apple Pay picks a method that the regular map has
   * never heard of.
   */
  function activePaymentMethod() {
    var store = wp.data.select(PAYMENT);
    if (!store || typeof store.getActivePaymentMethod !== 'function') {
      return null;
    }
    var active = store.getActivePaymentMethod();
    if (!active) {
      return null;
    }
    if (offered(store, 'getAvailablePaymentMethods', active) || offered(store, 'getAvailableExpressPaymentMethods', active)) {
      return active;
    }
    return null;
  }

  function offered(store, selector, method) {
    if (typeof store[selector] !== 'function') {
      // Without the selector there is nothing to check against, so the
      // method stands rather than being dropped.
      return true;
    }
    var methods = store[selector]();
    return !!methods && Object.prototype.hasOwnProperty.call(methods, method);
  }

  function expressPaymentActive() {
    var store = wp.data.select(PAYMENT);
    if (!store || typeof store.isExpressPaymentMethodActive !== 'function') {
      return false;
    }
    return !!store.isExpressPaymentMethodActive();
  }

})(window.wp);
