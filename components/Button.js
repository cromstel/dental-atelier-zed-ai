import Link from "next/link";

export default function Button({
  children,
  href,
  variant = "primary",
  className: customClassName = "",
  ...props
}) {
  const buttonClassName = `inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
    variant === "secondary"
      ? "border border-brand bg-white text-brand hover:bg-blue-50"
      : "bg-brand text-white hover:bg-blue-900"
  } ${customClassName}`;

  if (href) {
    return (
      <Link className={buttonClassName} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <button className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
