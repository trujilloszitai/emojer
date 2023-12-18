import { useState } from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { Spinner, LoadingScreen, PostView } from "~/components";

import { api } from "~/utils/api";
import { AppLayout } from "~/components/Layout";


export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.post.getAll.useQuery();

  // Since user data tends to load faster, an empty div will be returned if it's not loaded
  if (!userLoaded) return <div></div>;

  return (
    <>
      <AppLayout>
          <div className="border-b border-slate-700 p-4 ">
            <div className="flex justify-center">
              {isSignedIn ? <CreatePostWizard /> : <SignInButton />}
            </div>
          </div>
          <Feed />
      </AppLayout>
    </>
  );
}

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
