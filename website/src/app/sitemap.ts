import type { MetadataRoute } from "next";
import { getAllModules, getAllWorkflows, getAllScenarios, getAllCaseStudies, getAllTools } from "@/lib/content/loader";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://asm-cheatsheet.vercel.app";

  const staticPages = [
    "",
    "/learn",
    "/commands",
    "/tools",
    "/workflows",
    "/scenarios",
    "/case-studies",
    "/guides",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const modules = await getAllModules();
  const modulePages = modules.map((m) => ({
    url: `${baseUrl}/learn/module-${m.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const workflows = await getAllWorkflows();
  const workflowPages = workflows.map((wf) => ({
    url: `${baseUrl}/workflows/${wf.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const scenarios = await getAllScenarios();
  const scenarioPages = scenarios.map((sc) => ({
    url: `${baseUrl}/scenarios/${sc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const caseStudies = await getAllCaseStudies();
  const caseStudyPages = caseStudies.map((cs) => ({
    url: `${baseUrl}/case-studies/${cs.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const tools = await getAllTools();
  const toolPages = tools.map((t) => ({
    url: `${baseUrl}/tools/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...modulePages, ...workflowPages, ...scenarioPages, ...caseStudyPages, ...toolPages];
}
