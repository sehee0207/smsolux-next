import React from "react";
import Hero from "@/components/home/Hero";
import Introduce from "@/components/home/Introduce"
import About from "@/components/home/About";
import Review from "@/components/home/Review";
import JoinUs from "@/components/home/JoinUs";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function Home() {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main className="flex flex-col w-full snap-y snap-mandatory text-white no-scrollbar scroll-smooth">
      <Hero className="snap-start shrink-0" />
      <Introduce className="snap-start shrink-0" />
      <About className="snap-start shrink-0" />
      <Review
        className="snap-start shrink-0"
        initialReviews={reviews || []}
      />
      <JoinUs className="snap-start shrink-0" />
    </main>
  );
}
