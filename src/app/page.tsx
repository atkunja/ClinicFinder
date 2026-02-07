// src/app/page.tsx
import HomeInner from "./home_inner";

export const metadata = {
  title: "ZB Impact",
  description: "Find free or low-cost healthcare clinics near you",
};

export default function HomePage() {
  return <HomeInner />;
}
