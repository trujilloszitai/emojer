import Head from "next/head";
import { api } from "~/utils/api";
import { createServerSideHelpers } from '@trpc/react-query/server';
import { db } from '~/server/db';
import { appRouter } from '~/server/api/root';
import superjson from 'superjson';
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";

const Profile: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({
    username: username,
  });


  if(!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Emojer - { data.username }</title>
      </Head>
      <main className="flex min-h-screen justify-center">
        <div>
          { data.username }
        </div>
      </main>
    </>
  );
}

export default Profile;

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" }
}

export const getStaticProps: GetStaticProps = async(context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if(typeof slug !== "string") throw new Error("No slug provided");

  const username = slug.replace('@', '');

  await helpers.profile.getUserByUsername.prefetch({ username: username });
  
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username
    },
  }
}