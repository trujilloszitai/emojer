import type { PropsWithChildren } from "react";

export const AppLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className="w-full h-min border-x border-slate-700 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};
