import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-sm animate-fade-in">
          <Link href="/" className="mb-10 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-black text-white"
              style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)", boxShadow: "0 2px 8px rgba(79,70,229,0.30)" }}
            >
              מ
            </div>
            <span className="text-lg font-black text-foreground">
              מנהל<span className="text-primary">.</span>AI
            </span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-primary">
              BETA
            </span>
          </Link>
          {children}
        </div>
      </div>
      <div className="relative hidden overflow-hidden lg:block" style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_50%)]" />
        <div className="relative flex h-full flex-col items-center justify-center p-16 text-white">
          <h2 className="mb-4 text-center text-2xl font-bold leading-tight text-balance">
            הניהול האקדמי החכם שלך, במקום אחד
          </h2>
          <p className="max-w-md text-center text-[13px] leading-relaxed text-white/80">
            מסמכים, כספים, תזכורות ועוזר AI אישי - הכל מסונכרן ומותאם
            במיוחד לסטודנטים בישראל.
          </p>
          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-3">
            {["מסמכים מאורגנים", "מעקב כספי", "תזכורות חכמות"].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-white/20 bg-white/10 p-3 text-center text-[12px] font-semibold backdrop-blur-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
