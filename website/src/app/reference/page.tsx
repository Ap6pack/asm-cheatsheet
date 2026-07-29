import Link from "next/link";
import { getAllReferencePages } from "@/lib/content/loader";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ArrowRight, FileText } from "lucide-react";

export const metadata = {
  title: "Reference - ASM Cheatsheet",
  description:
    "Long-form reference material: getting started, legal and ethical practice, advanced techniques, automation, and continuous monitoring.",
};

export default async function ReferencePage() {
  const pages = await getAllReferencePages();

  // Preserve the manifest's category ordering rather than sorting alphabetically
  const categories: { name: string; pages: typeof pages }[] = [];
  for (const page of pages) {
    let bucket = categories.find((c) => c.name === page.category);
    if (!bucket) {
      bucket = { name: page.category, pages: [] };
      categories.push(bucket);
    }
    bucket.pages.push(page);
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Reference</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted-foreground)]">
          The long-form material behind the modules and commands — how to get
          set up, how to stay legal, and how to go deeper once the basics work.
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.name}>
          <h2 className="mb-4 text-2xl font-semibold">{category.name}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {category.pages.map((page) => (
              <Link key={page.slug} href={`/reference/${page.slug}`}>
                <Card className="h-full transition-colors hover:border-[var(--primary)]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                    </div>
                    <CardDescription>{page.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-flex items-center text-sm text-[var(--primary)]">
                      Read <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
