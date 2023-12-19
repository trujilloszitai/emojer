import Head from "next/head";
import Image from "next/image";
import { api } from "~/utils/api";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { AppLayout } from "~/components/Layout";
import { LoadingScreen, PostView } from "~/components";
import { generateServerSideHelper } from "~/server/helpers/serverSideHelper";

const SinglePostView: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id,
  });

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>
          `{data.post.content} - @{data.author.username}`
        </title>
      </Head>
      <AppLayout>
        <PostView {...data} />
      </AppLayout>
    </>
  );
};

export default SinglePostView;

export const getStaticPaths: GetStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = generateServerSideHelper();

  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("No id provided");

  await helpers.post.getById.prefetch({
    id,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
  };
};
