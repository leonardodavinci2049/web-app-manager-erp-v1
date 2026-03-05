# Agent Guidelines - Taxonomy Inline API Service

Este documento define convenções e padrões específicos para o módulo de serviço de atualizações inline de taxonomias (`src/services/api-main/taxonomy-inline`).

## Arquitetura

O módulo segue um padrão **simplificado** para atualizações inline (apenas mutations, sem cache):

```
taxonomy-inline/
├── AGENTS.md                            # Documentação da arquitetura
├── taxonomy-inline-service-api.ts       # Classe principal - integração com API
├── index.ts                              # Exportações públicas
├── types/
│   └── taxonomy-inline-types.ts         # Interfaces TypeScript
└── validation/
    └── taxonomy-inline-schemas.ts       # Schemas Zod
```

## Endpoints Suportados

| Método                                | Endpoint                                           | Tipo    |
|---------------------------------------|----------------------------------------------------|---------|
| `updateTaxonomyImagePathInline()`     | `/taxonomy-inline/v3/taxonomy-upd-inl-image-path`  | Mutação |
| `updateTaxonomyInactiveInline()`      | `/taxonomy-inline/v3/taxonomy-upd-inl-inactive`    | Mutação |
| `updateTaxonomyNameInline()`          | `/taxonomy-inline/v3/taxonomy-upd-inl-name`        | Mutação |
| `updateTaxonomyNotesInline()`         | `/taxonomy-inline/v3/taxonomy-upd-inl-notes`       | Mutação |
| `updateTaxonomyOrderInline()`         | `/taxonomy-inline/v3/taxonomy-upd-inl-order`       | Mutação |
| `updateTaxonomyParentIdInline()`      | `/taxonomy-inline/v3/taxonomy-upd-inl-parent-id`   | Mutação |
| `updateTaxonomyQtProductsInline()`    | `/taxonomy-inline/v3/taxonomy-upd-inl-qt-products` | Mutação |
| `updateTaxonomySlugInline()`          | `/taxonomy-inline/v3/taxonomy-upd-inl-slug`        | Mutação |

## Padrão

- **Sem cached service** — apenas mutations
- **Sem transformers** — retorno direto da StoredProcedureResponse
- Instância singleton: `taxonomyInlineServiceApi`
