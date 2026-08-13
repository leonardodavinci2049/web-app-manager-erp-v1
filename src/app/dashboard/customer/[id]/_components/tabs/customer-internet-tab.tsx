"use client";

import { type FormEvent, useState } from "react";
import { updateCustomerInternetAction } from "@/app/dashboard/customer/_actions/customer-actions";
import type { UICustomerDetail } from "@/services/api-main/customer-general";
import { CustomerField } from "./customer-field";
import { useCustomerSectionAction } from "./customer-section-action";
import { CustomerSectionButton } from "./customer-section-button";

interface InternetValues {
  facebook: string;
  instagram: string;
  linkedin: string;
  telegram: string;
  tiktok: string;
  twitter: string;
  website: string;
}

interface CustomerInternetTabProps {
  customer: UICustomerDetail;
}

function toInternetValues(customer: UICustomerDetail): InternetValues {
  return {
    facebook: customer.facebook ?? "",
    instagram: customer.instagram ?? "",
    linkedin: customer.linkedin ?? "",
    telegram: customer.telegram ?? "",
    tiktok: customer.tiktok ?? "",
    twitter: customer.twitter ?? "",
    website: customer.website ?? "",
  };
}

export function CustomerInternetTab({ customer }: CustomerInternetTabProps) {
  const [values, setValues] = useState(() => toInternetValues(customer));
  const { clearError, errors, runAction, saving } = useCustomerSectionAction();

  const setField = (field: keyof InternetValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    clearError(field);
  };

  const field = (name: keyof InternetValues, label: string) => (
    <CustomerField
      id={`customer-detail-${name}`}
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
          updateCustomerInternetAction({
            customerId: customer.id,
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
      <CustomerSectionButton saving={saving} label="Salvar presença digital" />
    </form>
  );
}
