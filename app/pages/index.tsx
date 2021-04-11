import { useRouter } from 'next/dist/client/router';
import Head from 'next/head';

const Button = (await import('item/Button')).default;
const Text = (await import('item/Text')).default;

export default function Home() {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Button />
      <button onClick={() => router.push('/test')}>GOGO</button>
      <Text />
    </div>
  );
}
