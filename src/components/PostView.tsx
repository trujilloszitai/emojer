import Image from "next/image";
import Link from "next/link";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { type RouterOutputs } from "~/utils/api";
dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["post"]["getAll"][number];
const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id}>
      <Link
        href={`/post/${post.id}`}
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
      </Link>
    </div>
  );
};

export default PostView;
