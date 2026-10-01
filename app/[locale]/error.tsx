"use client";

export default function Error({ error }: { error: Error }) {
  console.error(error);

  return null;
}
