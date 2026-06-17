"use client";

import { motion, type Variants } from "framer-motion";
import { popIn, staggerContainer } from "@/lib/motion";

/** Container that reveals its <Item> children in a gentle stagger. */
export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

/** A child of <Stagger>. Pops in with a soft spring. */
export function Item({
  children,
  className,
  variant = popIn,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: Variants;
}) {
  return (
    <motion.div className={className} variants={variant}>
      {children}
    </motion.div>
  );
}
