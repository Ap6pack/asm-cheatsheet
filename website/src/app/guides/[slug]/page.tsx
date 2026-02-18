import { notFound } from "next/navigation";
import * as fs from "fs";
import * as path from "path";
import { MDXRenderer } from "@/components/content/mdx-renderer";

function getGuideFiles(): string[] {
  const guidesDir = path.resolve(process.cwd(), "../content/guides");
  return fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md"));
}

export async function generateStaticParams() {
  const files = getGuideFiles();
  return files.map((f) => ({ slug: f.replace(".md", "") }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guidesDir = path.resolve(process.cwd(), "../content/guides");
  const filePath = path.join(guidesDir, `${slug}.md`);

  if (!fs.existsSync(filePath)) notFound();

  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <div className="max-w-4xl">
      <MDXRenderer content={content} />
    </div>
  );
}
