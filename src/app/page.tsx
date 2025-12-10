import HomeClient from "./HomeClient";

interface HomePageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <HomeClient error={error} />
    </main>
  );
}
