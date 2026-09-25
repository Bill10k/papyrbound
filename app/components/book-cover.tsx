import Image from "next/image";

type BookCoverVariant = "home" | "library" | "detail";

type BookCoverProps = {
  src: string;
  title: string;
  sizes: string;
  variant?: BookCoverVariant;
  className?: string;
  preload?: boolean;
  zoomOnHover?: boolean;
};

const variantClasses: Record<BookCoverVariant, string> = {
  home: "aspect-3/4 rounded-md border-5 border-background shadow-xl",
  library:
    "aspect-2/3 rounded-[5px] border-[3px] border-background bg-[#e4dccb] shadow-[0_5px_12px_rgba(42,37,26,0.28)]",
  detail:
    "aspect-[2/3] rounded-[6px] border-[3px] border-[#fffdf6] bg-[#e4dccb] shadow-[0_5px_12px_rgba(42,37,26,0.3)]",
};

/** A consistent, responsive cover frame for every book surface. */
export default function BookCover({
  src,
  title,
  sizes,
  variant = "library",
  className = "",
  preload = false,
  zoomOnHover = true,
}: BookCoverProps) {
  return (
    <div
      className={`relative overflow-hidden ${variantClasses[variant]} ${className}`}
    >
      <Image
        src={src}
        alt={`${title} cover`}
        fill
        sizes={sizes}
        preload={preload}
        className={`object-cover ${
          zoomOnHover
            ? "transition-transform duration-500 group-hover:scale-[1.025]"
            : ""
        }`}
      />
    </div>
  );
}
