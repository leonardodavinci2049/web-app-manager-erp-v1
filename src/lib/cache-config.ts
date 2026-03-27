/**
 * Cache configuration for Next.js 16 'use cache' directive
 * Defines cache tags for granular cache invalidation with cacheTag()
 *
 * Cache profiles are defined in next.config.ts:
 * - "hours": 1 hour cache (navigation, categories)
 * - "frequent": 5 minutes cache (products, listings)
 * - "daily": 24 hours cache (footer, static content)
 */

// Cache tags for granular invalidation with cacheTag()
export const CACHE_TAGS = {
  // Dynamic tag generators
  product: (id: string) => `product-${id}`,
  productGallery: (id: string) => `product-gallery-${id}`,
  category: (id: string) => `category-${id}`,
  organization: (id: string) => `organization-${id}`,
  organizationMeta: (organizationId: string) =>
    `organization-meta-${organizationId}`,
  organizationMetaKey: (organizationId: string, metaKey: string) =>
    `organization-meta-${organizationId}-${metaKey}`,
  user: (id: string) => `user-${id}`,
  userMeta: (userId: string) => `user-meta-${userId}`,
  userMetaKey: (userId: string, metaKey: string) =>
    `user-meta-${userId}-${metaKey}`,
  brand: (id: string) => `brand-${id}`,
  ptype: (id: string) => `ptype-${id}`,
  carrier: (id: string) => `carrier-${id}`,
  supplier: (id: string) => `supplier-${id}`,
  supplierRelProd: (id: string) => `supplier-rel-prod-${id}`,
  customer: (id: string) => `customer-${id}`,
  taxonomy: (id: string) => `taxonomy-${id}`,
  taxonomyMenu: (typeId: string) => `taxonomy-menu-${typeId}`,
  taxonomyRelProduct: (taxonomyId: string) =>
    `taxonomy-rel-products-${taxonomyId}`,
  productBase: (id: string) => `product-base-${id}`,
  customerLatestProducts: (id: string) => `customer-latest-products-${id}`,
  orderItem: (id: string) => `order-item-${id}`,
  orderReport: (id: string) => `order-report-${id}`,
  orderSale: (id: string) => `order-sale-${id}`,
  productPdv: (id: string) => `product-pdv-${id}`,
  agendaEntry: (id: string) => `agenda-entry-${id}`,
  agendaEntriesByUser: (userId: string) => `agenda-entries-${userId}`,
  agendaNotification: (id: string) => `agenda-notification-${id}`,
  agendaNotificationsByUser: (userId: string) =>
    `agenda-notifications-${userId}`,

  // CRM dynamic tags
  crmLead: (id: string) => `crm-lead-${id}`,
  crmLeadsByOrg: (orgId: string) => `crm-leads-org-${orgId}`,
  crmStage: (id: string) => `crm-stage-${id}`,
  crmLeadStageHistory: (leadId: string) => `crm-lead-stage-history-${leadId}`,
  crmActivity: (id: string) => `crm-activity-${id}`,
  crmActivitiesByLead: (leadId: string) => `crm-activities-lead-${leadId}`,
  crmTask: (id: string) => `crm-task-${id}`,
  crmTasksByUser: (userId: string) => `crm-tasks-user-${userId}`,
  crmTasksByLead: (leadId: string) => `crm-tasks-lead-${leadId}`,
  crmDeal: (id: string) => `crm-deal-${id}`,
  crmDealByLead: (leadId: string) => `crm-deal-lead-${leadId}`,

  // Static tags
  products: "products",
  categories: "categories",
  brands: "brands",
  ptypes: "ptypes",
  carriers: "carriers",
  suppliers: "suppliers",
  suppliersRelProd: "suppliers-rel-prod",
  customers: "customers",
  taxonomies: "taxonomies",
  taxonomiesMenu: "taxonomies-menu",
  taxonomyRelProducts: "taxonomy-rel-products",
  productsBase: "products-base",
  orderItems: "order-items",
  orderReports: "order-reports",
  orderSales: "order-sales",
  productsPdv: "products-pdv",
  navigation: "navigation",
  banners: "banners",
  footer: "footer",
  organizations: "organizations",
  organizationMetaCollection: "organization-meta-collection",
  userMetaCollection: "user-meta-collection",
  logLogins: "log-logins",
  logOperations: "log-operations",
  agendaEntries: "agenda-entries",
  agendaNotifications: "agenda-notifications",
  crmLeads: "crm-leads",
  crmStages: "crm-stages",
  crmPipeline: "crm-pipeline",
  crmActivities: "crm-activities",
  crmTasks: "crm-tasks",
  crmDeals: "crm-deals",
  crmDashboard: "crm-dashboard",
  crmReports: "crm-reports",
} as const;

// Cache life profiles (matching next.config.ts cacheLife)
export const CACHE_PROFILES = {
  hours: "hours", // 1 hour - navigation
  quarter: "quarter", // 15 minutes - categories menu
  frequent: "frequent", // 5 minutes - products
  daily: "daily", // 24 hours - footer
} as const;

// Type helpers
export type CacheTagKey = keyof typeof CACHE_TAGS;
export type CacheProfile = keyof typeof CACHE_PROFILES;
export type ProductTag = ReturnType<typeof CACHE_TAGS.product>;
export type CategoryTag = ReturnType<typeof CACHE_TAGS.category>;
