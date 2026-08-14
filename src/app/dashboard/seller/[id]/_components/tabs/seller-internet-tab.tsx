"use client";

import { type FormEvent, useState } from "react";
import type { UISellerDetail } from "@/services/api-main/seller";
import { updateSellerInternetAction } from "../../_actions/seller-actions";
import { SellerField } from "./seller-field";
import { useSellerSectionAction } from "./seller-section-action";
import { SellerSectionButton } from "./seller-section-button";

interface InternetValues {
  facebook: string;
  instagram: string;
  linkedin: string;
  telegram: string;
  tiktok: string;
  twitter: string;
  website: string;
}

interface SellerInternetTabProps {
  seller: UISellerDetail;
}

function toInternetValues(seller: UISellerDetail): InternetValues {
  return {
    facebook: seller.facebook ?? "",
    instagram: seller.instagram ?? "",
    linkedin: seller.linkedin ?? "",
    telegram: seller.telegram ?? "",
    tiktok: seller.tiktok ?? "",
    twitter: seller.twitter ?? "",
    website: seller.website ?? "",
  };
}

export function SellerInternetTab({ seller }: SellerInternetTabProps) {
  const [values, setValues] = useState(() => toInternetValues(seller));
  const { clearError, errors, runAction, saving } = useSellerSectionAction();

  const setField = (field: keyof InternetValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const field = (name: keyof InternetValues, label: string) => (
    <SellerField
      id={`seller-detail-${name}`}
      label={label}
      value={values[name]}
      maxLength={500}
      disabled={saving}
      error={errors[name]}
      onChange={(value) => setField(name, value)}
    />
  );

  return (
    <form
      className="space-y-3 rounded-lg border p-3 sm:space-y-4 sm:p-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        runAction(
          updateSellerInternetAction({
            sellerId: seller.id,
            website: values.website,
            facebook: values.facebook,
            twitter: values.twitter,
            linkedin: values.linkedin,
            instagram: values.instagram,
            tiktok: values.tiktok,
            telegram: values.telegram,
          }),
        );
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        <div className="sm:col-span-2">{field("website", "Website")}</div>
        {field("facebook", "Facebook")}
        {field("twitter", "X/Twitter")}
        {field("linkedin", "LinkedIn")}
        {field("instagram", "Instagram")}
        {field("tiktok", "TikTok")}
        {field("telegram", "Telegram")}
      </div>
      <SellerSectionButton saving={saving} label="Salvar presença digital" />
    </form>
  );
}
