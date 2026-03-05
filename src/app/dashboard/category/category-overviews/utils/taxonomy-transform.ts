/**
 * Utilitários para transformar dados da API de taxonomias em estruturas hierárquicas
 */

import type {
  UITaxonomy,
  UITaxonomyMenuItem,
} from "@/services/api-main/taxonomy-base/transformers/transformers";
import type { CategoryNode } from "../_components/category-tree.types";

type TaxonomyItem = UITaxonomy | UITaxonomyMenuItem;

/**
 * Converte dados da API em estrutura hierárquica
 * Os dados já vêm planos do novo serviço, necessário construir hierarquia
 */
export function transformTaxonomyToHierarchy(
  data: TaxonomyItem[],
): CategoryNode[] {
  return buildHierarchyFromFlatData(data);
}

/**
 * Builds hierarchy from flat data
 * @param flatData - Flat array of taxonomies
 * @returns Hierarchical array of CategoryNode
 */
function buildHierarchyFromFlatData(flatData: TaxonomyItem[]): CategoryNode[] {
  const nodes: CategoryNode[] = flatData.map(apiItemToCategoryNode);

  // Create map of nodes by ID for quick lookup
  const nodeMap = new Map<string | number, CategoryNode>();
  const rootNodes: CategoryNode[] = [];

  // First pass: create map of all nodes with children initialized
  for (const node of nodes) {
    nodeMap.set(node.id, { ...node, children: [] });
  }

  // Second pass: build hierarchy
  for (const node of nodes) {
    const currentNode = nodeMap.get(node.id);
    if (!currentNode) continue;

    // Protection against self-reference (node that is parent of itself)
    if (currentNode.parentId && currentNode.parentId === currentNode.id) {
      console.warn(
        `Auto-referência detectada: ID ${currentNode.id}, forçando como nó raiz`,
      );
      currentNode.parentId = null;
    }

    // If it's a root node (parentId is 0, null or undefined)
    if (!currentNode.parentId || currentNode.parentId === 0) {
      rootNodes.push(currentNode);
    } else {
      // Find parent node and add as child
      const parentNode = nodeMap.get(currentNode.parentId);
      if (parentNode) {
        // Ensure children is initialized
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(currentNode);
      } else {
        // If parent doesn't exist, treat as root node
        console.warn(
          `Pai não encontrado para ID ${currentNode.id} (parentId: ${currentNode.parentId}), tratando como raiz`,
        );
        currentNode.parentId = null;
        rootNodes.push(currentNode);
      }
    }
  }

  // Sort nodes at each level by specified order
  return sortNodesByOrder([...rootNodes]);
}

/**
 * Converte um item da API para CategoryNode
 * @param apiItem - Item da API
 * @returns CategoryNode formatado
 */
function apiItemToCategoryNode(apiItem: TaxonomyItem): CategoryNode {
  return {
    id: apiItem.id,
    name: apiItem.name,
    slug: apiItem.slug || undefined,
    level: clampLevel(apiItem.level),
    parentId: apiItem.parentId === 0 ? null : apiItem.parentId,
    quantity: apiItem.productCount ?? undefined,
    order: apiItem.order ?? undefined,
    isActive: true,
  };
}

/**
 * Ordena nós recursivamente pela propriedade ORDEM da API
 * @param nodes - Array de nós para ordenar
 * @returns Array ordenado
 */
function sortNodesByOrder(nodes: CategoryNode[]): CategoryNode[] {
  // Ordenar nós do nível atual (caso tenha informação de ordem)
  const filteredNodes = nodes.filter((node): node is CategoryNode =>
    Boolean(node),
  );
  const sortedNodes = filteredNodes.sort((a, b) => {
    const orderA = a.order ?? Number.POSITIVE_INFINITY;
    const orderB = b.order ?? Number.POSITIVE_INFINITY;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return a.name.localeCompare(b.name);
  });

  // Ordenar recursivamente os filhos
  for (const node of sortedNodes) {
    if (node.children && node.children.length > 0) {
      node.children = sortNodesByOrder([...node.children]);
    }
  }

  return sortedNodes;
}

/**
 * Valida se os dados da API estão no formato esperado
 * @param data - Dados para validar
 * @returns true se válidos
 */
export function validateTaxonomyData(data: unknown): data is TaxonomyItem[] {
  if (!Array.isArray(data)) {
    return false;
  }

  return data.every((item) => {
    if (!item || typeof item !== "object") {
      return false;
    }

    const record = item as Record<string, unknown>;
    const hasId = typeof record.id === "number";
    const hasName = typeof record.name === "string";
    const hasParent = typeof record.parentId === "number";

    return hasId && hasName && hasParent;
  });
}

/**
 * Filtra taxonomias por nível específico
 * @param data - Dados das taxonomias
 * @param level - Nível desejado (1, 2 ou 3)
 * @returns Array filtrado
 */
export function filterTaxonomiesByLevel(
  data: TaxonomyItem[],
  level: 1 | 2 | 3,
): TaxonomyItem[] {
  return data.filter((item) => item.level === level);
}

/**
 * Conta total de itens em uma estrutura hierárquica
 * @param nodes - Nós da árvore
 * @returns Número total de nós
 */
export function countTotalNodes(nodes: CategoryNode[]): number {
  let count = 0;

  for (const node of nodes) {
    count += 1; // Conta o nó atual
    if (node.children && node.children.length > 0) {
      count += countTotalNodes(node.children); // Conta recursivamente os filhos
    }
  }

  return count;
}

/**
 * Encontra um nó específico na árvore hierárquica
 * @param nodes - Nós da árvore
 * @param id - ID do nó procurado
 * @returns Nó encontrado ou null
 */
export function findNodeById(
  nodes: CategoryNode[],
  id: string | number,
): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      const found = findNodeById(node.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

/**
 * Extrai todos os IDs de uma estrutura hierárquica (útil para expandir todos)
 * @param nodes - Nós da árvore
 * @returns Array de IDs
 */
export function extractAllNodeIds(
  nodes: CategoryNode[],
): Array<string | number> {
  const ids: Array<string | number> = [];

  for (const node of nodes) {
    ids.push(node.id);
    if (node.children && node.children.length > 0) {
      ids.push(...extractAllNodeIds(node.children));
    }
  }

  return ids;
}

function clampLevel(level: number): 1 | 2 | 3 {
  if (level <= 1) {
    return 1;
  }
  if (level >= 3) {
    return 3;
  }
  return 2;
}
