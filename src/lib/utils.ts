import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getEmbeddableDriveImageUrl(url: string): string {
  if (!url) return "";
  const trimmed = url.trim();

  // If it's already a direct Google photos or lh3 link, return as is
  if (trimmed.includes("lh3.googleusercontent.com") || trimmed.includes("lh3.google.com")) {
    return trimmed;
  }

  // Check if it is a Google Drive link
  if (trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com")) {
    // 1. Match /file/d/FILE_ID (and ignore trailing view/edit/etc.)
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{25,50})/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/u/0/d/${fileDMatch[1]}`;
    }

    // 2. Match open?id=FILE_ID, uc?id=FILE_ID, or copy link params
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{25,50})/);
    if (idParamMatch && idParamMatch[1]) {
      return `https://lh3.googleusercontent.com/u/0/d/${idParamMatch[1]}`;
    }
  }

  return trimmed;
}
