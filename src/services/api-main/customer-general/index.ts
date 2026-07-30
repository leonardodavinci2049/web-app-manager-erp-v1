export {
  CustomerGeneralServiceApi,
  customerGeneralServiceApi,
  type GetCustomersPageParams,
  getCustomerById,
  getCustomerLatestProducts,
  getCustomersPage,
  type UICustomerDetailsBundle,
} from "./customer-general-service-api";

export type {
  UICustomerDetail,
  UICustomerLatestProduct,
  UICustomerListItem,
  UISellerInfo,
} from "./transformers/transformers";

export type {
  CustomerCreateRequest,
  CustomerCreateResponse,
  CustomerDetail,
  CustomerFindAllRequest,
  CustomerFindAllResponse,
  CustomerFindByIdRequest,
  CustomerFindByIdResponse,
  CustomerFindLatestProductsRequest,
  CustomerFindLatestProductsResponse,
  CustomerFindManagerAllRequest,
  CustomerFindManagerAllResponse,
  CustomerLatestProduct,
  CustomerListItem,
  CustomerPersonListItem,
  CustomerSearchAllRequest,
  CustomerSearchAllResponse,
  SellerInfo,
  StoredProcedureResponse,
} from "./types/customer-general-types";

export {
  CustomerError,
  CustomerNotFoundError,
  CustomerValidationError,
} from "./types/customer-general-types";
