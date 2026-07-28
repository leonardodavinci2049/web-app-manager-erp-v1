import type { CarrierDetail, CarrierListItem } from "../types/carrier-types";

export interface UICarrier {
  id: number;
  typePersonId: number;
  typePerson: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  cnpj?: string;
  companyName?: string;
  responsibleName?: string;
  cpf?: string;
  imagePath?: string;
  createdAt?: string;
}

export function transformCarrierListItem(entity: CarrierListItem): UICarrier {
  return {
    id: entity.ID_TRANSPORTADORA,
    typePersonId: entity.ID_PESSOA_TIPO,
    typePerson: entity.TIPO_PESSOA,
    name: entity.NOME,
    phone: entity.FONE1 || undefined,
    whatsapp: entity.WHATAPP1 || undefined,
    email: entity.EMAIL1 || undefined,
    website: entity.WEBSITE || undefined,
    cnpj: entity.CNPJ || undefined,
    companyName: entity.RAZAO_SOCIAL || undefined,
    responsibleName: entity.NOME_RESPONSAVEL || undefined,
    cpf: entity.CPF || undefined,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    createdAt: entity.CREATEDAT ?? undefined,
  };
}

export function transformCarrierList(items: CarrierListItem[]): UICarrier[] {
  return items.map(transformCarrierListItem);
}

export function transformCarrierDetail(entity: CarrierDetail): UICarrier {
  return transformCarrierListItem(entity);
}

export function transformCarrier(
  entity: CarrierListItem | CarrierDetail | null | undefined,
): UICarrier | null {
  if (!entity) return null;
  return transformCarrierListItem(entity);
}
