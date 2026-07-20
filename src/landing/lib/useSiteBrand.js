/**
 * useSiteBrand — resolves the school/platform brand for the current domain.
 *
 * Same source the LoginPage and the previous LandingPage used: a school served
 * on its own domain or subdomain sees its own name and logo; everyone else
 * falls back to the platform brand from utils/data.
 */
import { useEffect, useState } from "react";
import apiClient from "../../services/axios";
import { BRAND } from "../utils/data";

export function useSiteBrand() {
  const [school, setSchool] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiClient
      .get("/public/school", { params: { host: window.location.hostname } })
      .then((res) => {
        if (!cancelled && res.data?.success && res.data.data) setSchool(res.data.data);
      })
      .catch(() => { /* keep the platform default */ });
    return () => { cancelled = true; };
  }, []);

  return {
    name: school?.name || BRAND.name,
    logo: school?.logo || null,
    isSchoolDomain: Boolean(school),
  };
}

export default useSiteBrand;
