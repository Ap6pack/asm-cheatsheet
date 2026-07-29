import { notFound } from "next/navigation";
import {
  getAllReferencePages,
  getReferencePageBySlug,
} from "@/lib/content/loader";
import { MDXRenderer } from "@/components/content/mdx-renderer";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EditOnGitHub } from "@/components/content/edit-on-github";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateStaticParams() {
  const pages = await getAllReferencePages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getReferencePageBySlug(slug);
  if (!page) return {};
  return { title: `${page.title} - ASM Cheatsheet`, description: page.description };
}

export default async function ReferenceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getReferencePageBySlug(slug);
  if (!page) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      <Breadcrumbs title={page.title} />
      <div>
        <Badge variant="outline">{page.category}</Badge>
        <p className="mt-3 text-[var(--muted-foreground)]">
          {page.description}
        </p>
      </div>
      <Separator />
      <MDXRenderer content={page.content} />
      <Separator />
      <footer className="flex justify-end">
        <EditOnGitHub contentPath={page.file} />
      </footer>
    </div>
  );
}
