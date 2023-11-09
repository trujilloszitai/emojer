import Head from "next/head";

export default function SinglePost() {
  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex min-h-screen justify-center">
        <div>
          Single post!
        </div>
      </main>
    </>
  );
}