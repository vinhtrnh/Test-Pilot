import { type VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";
import type React from "react";
import { forwardRef, useState } from "react";
import { IconX } from "~/components/Icons";

interface InputProps
  extends VariantProps<typeof variants>,
    React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search" | "minisearch" | "error";
  suffix?: React.ReactNode;
  prefixElement?: React.ReactNode;
  onClear?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

let variants = cva(
  "w-full focus-visible:outline-none !shadow-none focus:ring-0",
  {
    variants: {
      variant: {
        default: "leading-tight",
        search:
          "px-0 py-2 text-2xl w-full focus:ring-0 border-x-0 border-t-0 transition border-b-2 border-bar/10 focus:border-bar/50",
        minisearch:
          "hidden md:inline-block text-left lg:text-right border-b transition border-transparent -mb-px border-x-0 border-t-0 appearance-none px-0 py-1 focus:ring-transparent placeholder:opacity-20 placeholder:text-inherit focus:border-bar/50",
        error: "border-red-500",
      },
    },
  },
);

export let Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type,
      variant = "default",
      prefixElement,
      prefix,
      suffix,
      onFocus,
      onBlur,
      onClear,
      ...rest
    },
    ref,
  ) => {
    let [focused, setFocused] = useState(false);
    let commonClasses = clsx(
      "w-full rounded-sm border px-3 py-3",
      focused ? "border-bar/50" : "border-bar/30",
      className,
    );

    let handleClear = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.currentTarget?.previousSibling) {
        e.currentTarget.previousSibling.value = "";
      }
      if (onClear) onClear(e);
    };
    if (type === "search") {
      suffix = (
        <IconX className="cursor-pointer w-5 h-5" onClick={handleClear} />
      );
    }
    let hasChild = Boolean(prefixElement || suffix);

    let rawInput = (
      <input
        ref={ref}
        className={clsx(
          variants({ variant }),
          hasChild ? "grow border-none bg-transparent p-0" : commonClasses,
        )}
        onFocus={(e) => {
          setFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...rest}
      />
    );

    return hasChild ? (
      <div
        className={clsx(
          commonClasses,
          "flex gap-2 overflow-hidden items-center bg-primary p-2.5 border rounded-sm",
        )}
      >
        {prefixElement}
        {rawInput}
        {suffix}
      </div>
    ) : (
      rawInput
    );
  },
);
