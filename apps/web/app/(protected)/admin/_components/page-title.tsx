"use client";

interface PageTitleProps {
  title: string;
  children?: React.ReactNode;
}

const PageTitle = ({ title, children }: PageTitleProps) => {
  return (
    <div className="w-full flex justify-between items-center border-b-2 py-2">
      <h2 className="font-semibold md:text-2xl">{title}</h2>
      {children}
    </div>
  );
};

export default PageTitle;
