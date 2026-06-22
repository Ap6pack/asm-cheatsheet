import { notFound } from "next/navigation";
import { getAllGuides } from "@/lib/content/loader";
import { MDXRenderer } from "@/components/content/mdx-renderer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EditOnGitHub } from "@/components/content/edit-on-github";
import { Separator } from "@/components/ui/separator";

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guides = await getAllGuides();
  const guide = guides.find((g) => g.slug === slug);

  if (!guide) notFound();

  return (
    <div className="max-w-4xl space-y-8">
      <Breadcrumbs />
      <MDXRenderer content={guide.content} />
      <Separator />
      <footer className="flex justify-end">
        <EditOnGitHub contentPath={`guides/${guide.file}`} />
      </footer>
    </div>
  );
}
