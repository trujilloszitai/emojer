import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Spinner, LoadingScreen } from "~/components";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs, api } from "~/utils/api";

dayjs.extend(relativeTime);

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.post.getAll.useQuery();

  // Since user data tends to load faster, an empty div will be returned if it's not loaded
  if (!userLoaded) return <div></div>;

  return (
    <>
      <main className="flex min-h-screen justify-center">
        <div className="w-full border-x border-slate-700 md:max-w-2xl">
          <div className="border-b border-slate-700 p-4 ">
            <div className="flex justify-center">
              {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <Link href={`/post/${post.id}`}>
      <div
        key={post.id}
        className="flex w-full items-start gap-x-3 border-b border-slate-700 p-8"
      >
        <Image
          src={author.imageUrl}
          alt={`${author.username}}'s profile image`}
          width={36}
          height={36}
          className="h-10 w-10 rounded-full"
        />
        <div className="flex w-full flex-col gap-y-2">
          <div className="flex w-full items-center justify-between">
            <Link href={`/@${author.username}`}>
              <span className="font-medium text-slate-400 hover:text-slate-200">{`@${author.username}`}</span>
            </Link>
            <span className="text-sm text-slate-500">
            • {dayjs(post.createdAt).fromNow()}
            </span>
          </div>
          <span className="text-xl">{post.content}</span>
        </div>
      </div>
    </Link>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading) return <LoadingScreen />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView key={fullPost.post.id} {...fullPost} />
      ))}
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const ctx = api.useUtils(); // Calling our API

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) toast.error(errorMessage[0]);
      else toast.error("Something went wrong. Try again later.");
    },
  });

  if (!user) return null;

  return (
    <div className="flex w-full gap-3">
      {/* <Image
        src={user.imageUrl}
        alt="Profile image"
        className="h-10 w-10 rounded-full"
        width={48}
        height={48}
      /> */}
      <UserButton />
      <input
        placeholder="Type some emojis..."
        className="grow bg-transparent outline-none"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isPosting}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
      />
      {input !== "" && !isPosting && (
        <button onClick={() => mutate({ content: input })} disabled={isPosting}>
          Post
        </button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <Spinner size={18} />
        </div>
      )}
    </div>
  );
};
