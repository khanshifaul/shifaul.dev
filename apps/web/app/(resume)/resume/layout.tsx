export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-gray-800 print">
      <main>{children}</main>
    </div>
  );
}
