interface Review {
  text: string;
  sentiment: string;
  confidence: number;
}

interface ReviewListProps {
  reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return 'text-green-400 bg-green-400/10';
    if (sentiment === 'neutral') return 'text-yellow-400 bg-yellow-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getSentimentEmoji = (sentiment: string) => {
    if (sentiment === 'positive') return '😊';
    if (sentiment === 'neutral') return '😐';
    return '😞';
  };

  return (
    <div className="bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Reviews</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-400/30 transition"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-gray-300 flex-1">{review.text}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(review.sentiment)}`}>
                  {getSentimentEmoji(review.sentiment)} {review.sentiment}
                </span>
                <span className="text-xs text-gray-500">
                  {(review.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
