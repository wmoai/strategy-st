import type { FC, ReactNode } from "react";

type Props = {
  navigation: ReactNode;
  deckList: ReactNode;
};

export const TopPage: FC<Props> = ({ navigation, deckList }) => {
  return (
    <>
      <header>{navigation}</header>
      <main className="flex flex-col items-center justify-center gap-4 mt-10">
        <h1 className="text-3xl">YOUR DECK</h1>
        {deckList}
      </main>
    </>
  );
};
