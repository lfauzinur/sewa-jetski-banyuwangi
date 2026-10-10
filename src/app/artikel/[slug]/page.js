import { articles } from '@/lib/data';
import { notFound } from 'next/navigation';
import ArticleClient from './ArticleClient';

export const instant = false;

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticleDetail({ params }) {
  const { slug } = await params;
  const article = articles.find(a => a.slug === slug);

  if (!article) {
    notFound();
  }

  return <ArticleClient article={article} />;
}
