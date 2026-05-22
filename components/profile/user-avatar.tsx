import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function UserAvatar({
  image,
  name,
  size = "md",
  className
}: {
  image?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-24 w-24 text-2xl"
  };
  const initials = getInitials(name);

  return (
    <div className={cn("relative shrink-0 overflow-hidden rounded-full border bg-muted text-muted-foreground shadow-sm", sizes[size], className)}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={name ? `${name} profile image` : "Profile image"} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold">
          {initials || <UserRound className="h-1/2 w-1/2" />}
        </div>
      )}
    </div>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
