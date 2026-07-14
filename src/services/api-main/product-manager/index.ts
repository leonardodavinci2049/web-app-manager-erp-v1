export {
  ProductManagerServiceApi,
  productManagerServiceApi,
} from "./product-manager-service-api";

export type {
  ProductManagerDetail,
  ProductManagerFindAllRequest,
  ProductManagerFindAllResponse,
  ProductManagerFindByIdData,
  ProductManagerFindByIdRequest,
  ProductManagerFindByIdResponse,
  ProductManagerFindSearchRequest,
  ProductManagerFindSearchResponse,
  ProductManagerListItem,
  ProductManagerRelatedCategory,
  ProductManagerRelatedProduct,
  ProductManagerSearchItem,
} from "./types/product-manager-types";

export {
  ProductManagerError,
  ProductManagerNotFoundError,
  ProductManagerValidationError,
} from "./types/product-manager-types";
