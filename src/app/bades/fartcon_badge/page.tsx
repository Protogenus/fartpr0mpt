import type { Metadata } from "next";
import BadgeClient from "./badge-client";
import './styles.css';

export const metadata: Metadata = {
  title: "FARTCON Badge Generator",
  description: "Generate a FARTCON badge with interactive controls.",
};

export default function FartconBadge() {
  return (
    <BadgeClient />
  );
}
