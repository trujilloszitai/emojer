import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { AppLayout } from "~/components/Layout";

const Profile: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username: username,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Emojer - {data.username}</title>
      </Head>
      <AppLayout>
        <div>
          <div className="relative h-48 border-b border-slate-950 bg-slate-600">
            <Image
              src={data.imageUrl}
              alt={`${data.username}}'s profile image`}
              width={128}
              height={128}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-slate-950"
            />
          </div>
          <div className="h-[64px]"></div>
          <div className="p-4 text-2xl font-bold">
            {`@${data.username}`}
          </div>
          <div className="border-b border-slate-700"></div>
        </div>
      </AppLayout>
    </>
  );
};

export default Profile;

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { db, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug provided");

  const username = slug.replace("@", "");

  await helpers.profile.getUserByUsername.prefetch({ username: username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
  };
};
