export {
  CustomerGeneralServiceApi,
  customerGeneralServiceApi,
} from "./customer-general-service-api";

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
