import type { CarrierDetail, CarrierListItem } from "../types/carrier-types";

export interface UICarrier {
  id: number;
  typePersonId: number;
  typePerson: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  contact?: string;
  email?: string;
  website?: string;
  cnpj?: string;
  cnpjDate?: string;
  companyName?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  tradeName?: string;
  responsibleName?: string;
  responsibleRole?: string;
  cpf?: string;
  rg?: string;
  birthDate?: string;
  imagePath?: string;
  zipCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  countryRegion?: string;
  country?: string;
  cityCode?: number;
  stateCode?: number;
  facebook?: string;
  twitter?: string;
  freightForwarder?: boolean;
  lastPurchaseDate?: string;
  notes?: string;
  inactive?: boolean;
  updatedAt?: string;
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
  return {
    id: entity.ID_TRANSPORTADORA,
    typePersonId: entity.ID_PESSOA_TIPO,
    typePerson: entity.TIPO_PESSOA,
    name: entity.NOME ?? "",
    phone: entity.FONE1 || undefined,
    whatsapp: entity.WHATAPP1 || undefined,
    contact: entity.CONTATO1 || undefined,
    email: entity.EMAIL1 || undefined,
    website: entity.WEBSITE || undefined,
    cnpj: entity.CNPJ || undefined,
    cnpjDate: entity.DATA_CNPJ || undefined,
    companyName: entity.RAZAO_SOCIAL || undefined,
    stateRegistration: entity.INSC_ESTADUAL || undefined,
    municipalRegistration: entity.INSC_MUNICIPAL || undefined,
    tradeName: entity.NOME_FANTASIA || undefined,
    responsibleName: entity.NOME_RESPONSAVEL || undefined,
    responsibleRole: entity.CARGO || undefined,
    cpf: entity.CPF || undefined,
    rg: entity.RG || undefined,
    birthDate: entity.DATADONASCIMENTO ?? undefined,
    imagePath: entity.PATH_IMAGEM ?? undefined,
    zipCode: entity.CEP || undefined,
    address: entity.ENDERECO || undefined,
    addressNumber: entity.ENDERECO_NUMERO || undefined,
    complement: entity.COMPLEMENTO || undefined,
    neighborhood: entity.BAIRRO || undefined,
    city: entity.CIDADE || undefined,
    state: entity.UF || undefined,
    countryRegion: entity.REGIAO_PAIS || undefined,
    country: entity.PAIS || undefined,
    cityCode: entity.COD_MUNICIPIO || undefined,
    stateCode: entity.COD_UF || undefined,
    facebook: entity.FACEBOOK || undefined,
    twitter: entity.TWITTER || undefined,
    freightForwarder: entity.FRETADOR === 1,
    lastPurchaseDate: entity.DT_ULTIMA_COMPRA || undefined,
    notes: entity.ANOTACOES || undefined,
    inactive: entity.INATIVO === 1,
    updatedAt: entity.DT_UPDATE ?? undefined,
    createdAt: entity.DATADOCADASTRO || undefined,
  };
}

export function transformCarrier(
  entity: CarrierListItem | CarrierDetail | null | undefined,
): UICarrier | null {
  if (!entity) return null;

  if ("DATADOCADASTRO" in entity || "CONTATO1" in entity) {
    return transformCarrierDetail(entity as CarrierDetail);
  }

  return transformCarrierListItem(entity as CarrierListItem);
}
