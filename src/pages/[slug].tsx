import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { AppLayout } from "~/components/Layout";
import { LoadingScreen, PostView } from "~/components";
import { generateServerSideHelper } from "~/server/helpers/serverSideHelper";

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
          <div className="border-b border-slate-700 p-4 text-2xl font-bold">
            {`@${data.username}`}
          </div>
          <div className="border-b border-slate-700">
            <ProfileFeed userId={data.id} />
          </div>
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
  const helpers = generateServerSideHelper();

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

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.post.getByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingScreen />;

  if (!data || data.length === 0) return <div>User has not posted!</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};
