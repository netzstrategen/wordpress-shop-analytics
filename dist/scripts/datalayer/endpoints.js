"use strict";!function(c){var n=document.shopAnalytics;c(function(){"order-received"===shop_analytics_endpoint_data.step&&!function(){var e=c(document).find(".shop-analytics-order-details"),t=e.data(),a=String(t.id),r=JSON.parse(localStorage.getItem("shop-analytics-tracked-orders"))??[],o=localStorage.getItem("shop-analytics-order-count")?JSON.parse(localStorage.getItem("shop-analytics-order-count"))+1:t.order_count;r&&r.includes(a)||(r.push(a),localStorage.setItem("shop-analytics-tracked-orders",JSON.stringify(r)),localStorage.setItem("shop-analytics-order-count",JSON.stringify(o)),r=e.find(".shop-analytics-product-details"),e={event:"purchase",ecommerce:{transaction_id:a,value:String(t.revenue).replace(/,/g,""),tax:String(t.tax).replace(/,/g,""),shipping:String(t.shipping).replace(/,/g,""),order_count:o,currency:t.currency,items:n.getProductsData(r)}},t.coupon&&(e.ecommerce.coupon=t.coupon),n.postToDataLayer(e))}()})}(jQuery);
