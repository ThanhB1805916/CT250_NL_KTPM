import ApiCaller from "./ApiCaller";

import AuthenticationService from "./authentication_services/AuthenticationService";

import ProductsServiceApi from "./products_services/ProductsService";
// import ProductsService_Ram from "./products_services/ProductsService_Ram";

import PayPalPaymentSerivce from "./payment_services/PayPalPaymentService";

import StripePaymentService from "./payment_services/StripePaymentService";

import ZaloPaymentService from "./payment_services/ZaloPaymentService";

const caller = new ApiCaller();

export {
  caller,
  AuthenticationService,
  ProductsServiceApi as ProductsService,
  PayPalPaymentSerivce,
  StripePaymentService,
  ZaloPaymentService,
};
