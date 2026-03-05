"use client";

import { useEffect, useState } from "react";
import { loadCategoriesMenuAction } from "@/app/actions/action-categories";
import type { UITaxonomyMenuItem } from "@/services/api-main/taxonomy-base/transformers/transformers";

export interface CategoryOption {
  id: number;
  name: string;
  level: number;
  displayName: string; // Nome formatado com traços
}

/**
 * Hook for loading and managing categories from taxonomy API
 * Loads hierarchical categories and flattens them with proper formatting
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories on component mount
  useEffect(() => {
    /**
     * Converte dados flat de taxonomia em opções formatadas
     */
    const mapCategories = (
      taxonomies: UITaxonomyMenuItem[],
    ): CategoryOption[] => {
      return taxonomies.map((taxonomy) => {
        const level = taxonomy.level || 1;
        let displayName = taxonomy.name;
        if (level === 2) displayName = `- ${taxonomy.name}`;
        else if (level === 3) displayName = `-- ${taxonomy.name}`;

        return {
          id: taxonomy.id,
          name: taxonomy.name,
          level,
          displayName,
        };
      });
    };

    /**
     * Loads categories using Server Action
     * Uses pe_id_tipo = 2 for product categories as per API documentation
     */
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Call Server Action to load categories
        const response = await loadCategoriesMenuAction();

        if (response.success) {
          const flattenedCategories = mapCategories(response.data);
          setCategories(flattenedCategories);
        } else {
          throw new Error(response.message);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar categorias";
        setError(errorMessage);
        console.error("Error loading categories:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Separate refetch function for manual reload
  const refetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loadCategoriesMenuAction();

      if (response.success) {
        // Inline mapping for refetch
        const mapItems = (
          taxonomies: UITaxonomyMenuItem[],
        ): CategoryOption[] => {
          return taxonomies.map((taxonomy) => {
            const level = taxonomy.level || 1;
            let displayName = taxonomy.name;
            if (level === 2) displayName = `- ${taxonomy.name}`;
            else if (level === 3) displayName = `-- ${taxonomy.name}`;

            return {
              id: taxonomy.id,
              name: taxonomy.name,
              level,
              displayName,
            };
          });
        };

        const flattenedCategories = mapItems(response.data);
        setCategories(flattenedCategories);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar categorias";
      setError(errorMessage);
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    isLoading,
    error,
    refetch,
  };
}
