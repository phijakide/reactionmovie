import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Twitter, ExternalLink, Film, Star } from 'lucide-react';
import { Movie, MovieReview } from '../types';

interface ShareModalProps {
  movie: Movie | null;
  review?: MovieReview | null;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ movie, review, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  if (!movie) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href.split('?')[0] : 'https://cinerecap.app';
  const shareUrl = review ? `${currentUrl}?movie=${movie.id}&review=${review.id}` : `${currentUrl}?movie=${movie.id}`;

  const shareText = review
    ? `🎬 Read this recap & review for "${movie.title}" (${movie.year}): "${review.headline}" - Rated ${review.rating}/10!`
    : `🎬 Read the full plot recap, ending explained, and streaming guide for "${movie.title}" (${movie.year}) on CineRecap!`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const copyFormattedQuote = async () => {
    const quoteContent = review
      ? `> "${review.headline}"\n> ${review.content.slice(0, 200)}...\n— ${review.userName} (${review.rating}/10) on CineRecap: ${shareUrl}`
      : `> 30-Second Recap of ${movie.title} (${movie.year}):\n> "${movie.recap.elevatorPitch}"\nCheck out the ending breakdown on CineRecap: ${shareUrl}`;

    try {
      await navigator.clipboard.writeText(quoteContent);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleTwitterShare = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(waUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `CineRecap: ${movie.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden p-6 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg">Share with Friends</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Share Card Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 text-white p-5 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-xs">
                C
              </span>
              <span className="font-bold text-xs tracking-wider uppercase text-zinc-400">CineRecap PRO</span>
            </div>
            <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-semibold">
              ★ {movie.imdbRating} IMDb
            </span>
          </div>

          <div className="flex gap-3">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-16 h-24 object-cover rounded-lg shadow-md flex-shrink-0"
            />
            <div className="min-w-0 space-y-1">
              <h4 className="font-black text-base text-white tracking-tight leading-snug">
                {movie.title} <span className="text-zinc-500 text-xs font-normal">({movie.year})</span>
              </h4>
              <p className="text-xs text-amber-400/90 font-medium italic line-clamp-1">
                "{review ? review.headline : movie.tagline}"
              </p>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                {review ? review.content : movie.recap.elevatorPitch}
              </p>
            </div>
          </div>

          {review && (
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <img src={review.userAvatar} alt="user" className="w-5 h-5 rounded-full object-cover" />
                <span>Reviewed by {review.userName}</span>
              </div>
              <span className="text-amber-400 font-bold">★ {review.rating}/10</span>
            </div>
          )}
        </div>

        {/* Quick Share Platforms */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <button
            onClick={copyToClipboard}
            className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 transition flex items-center justify-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleTwitterShare}
            className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition flex items-center justify-center gap-2 text-xs font-bold text-blue-500"
          >
            <Twitter className="w-4 h-4" />
            <span>Post to X</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition flex items-center justify-center gap-2 text-xs font-bold text-emerald-500"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Formatted Markdown Quote */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Need formatted quote snippet for Discord?</span>
          <button
            onClick={copyFormattedQuote}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition flex items-center gap-1.5"
          >
            {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedQuote ? 'Copied Quote!' : 'Copy Quote'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
