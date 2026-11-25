import { notFound } from 'next/navigation';
import { problems } from '../../problems';
import ProblemPage from './problem-page';

export const dynamicParams = false;

export function generateStaticParams() {
  return problems.map(problem => ({ id: String(problem.id) }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const problem = problems.find(item => String(item.id) === id);
  return { title: problem ? problem.title + ' | AlgoLab' : 'Problem | AlgoLab' };
}

export default async function Page({ params }) {
  const { id } = await params;
  const problem = problems.find(item => String(item.id) === id);
  if (!problem) notFound();
  return <ProblemPage problem={problem} />;
}
