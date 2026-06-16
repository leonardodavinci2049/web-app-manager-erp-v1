/**
 * Tipos para visualização hierárquica de categorias
 */

export interface CategoryNode {
  /** ID único da categoria */
  id: string | number;

  /** Nome da categoria */
  name: string;

  /** Slug para URL amigável */
  slug?: string;

  /** Nível hierárquico (1 = Família, 2 = Grupo, 3 = Subgrupo) */
  level: 1 | 2 | 3;

  /** ID do nó pai */
  parentId?: string | number | null;

  /** Subcategorias */
  children?: CategoryNode[];

  /** Ícone opcional */
  icon?: string;

  /** Estado ativo */
  isActive?: boolean;

  /** Quantidade de registros (produtos) */
  quantity?: number;

  /** Ordem de exibição */
  order?: number;
}

export interface CategoryTreeProps {
  /** Lista de categorias a renderizar */
  categories: CategoryNode[];

  /** Callback quando uma categoria é selecionada */
  onSelect?: (id: string | number) => void;

  /** Categoria atualmente selecionada */
  selectedId?: string | number | null;
}

export interface CreateCategoryTarget {
  parentId: number;
  parentName: string;
  parentLevel: 0 | 1 | 2;
}

export interface CategoryTreeItemProps {
  /** Nó de categoria */
  node: CategoryNode;

  /** Callback quando expandir/colapsar (inclui parentId para accordion) */
  onToggle?: (
    id: string | number,
    isExpanded: boolean,
    parentId?: string | number | null,
  ) => void;

  /** IDs dos nós expandidos */
  expandedIds?: Set<string | number>;

  /** Callback quando selecionar categoria */
  onSelect?: (id: string | number) => void;

  /** Callback para adicionar categoria filha */
  onAddChild?: (node: CategoryNode) => void;

  /** Callback para excluir categoria */
  onDelete?: (node: CategoryNode) => void;

  /** Estado de mutação em andamento */
  isMutating?: boolean;

  /** ID selecionado atualmente */
  selectedId?: string | number | null;
}
