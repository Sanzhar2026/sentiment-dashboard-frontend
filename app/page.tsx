'use client';

import { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Minus,
  TrendingUp,
  Loader2,
  Sparkles,
  Send
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import SentimentChart from '@/components/SentimentChart';
import ReviewList from '@/components/ReviewList';
import { Button } from '@/components/ui/button';

interface Review {
  text: string;
  sentiment: string;
  confidence: number;
}

interface Statistics {
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  avg_confidence: number;
}

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadDemoReviews();
  }, []);

  const loadDemoReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sentiment/demo`);
      const data = await response.json();

      // Анализируем демо-отзывы
      const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sentiment/analyze-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: data.reviews })
      });

      const result = await analyzeResponse.json();
      setReviews(result.reviews);
      setStatistics(result.statistics);
    } catch (error) {
      console.error('Error loading demo:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeReview = async () => {
    if (!inputText.trim()) return;

    try {
      setAnalyzing(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sentiment/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      const result = await response.json();

      // Добавляем новый отзыв к списку
      const newReviews = [result, ...reviews];
      setReviews(newReviews);

      // Пересчитываем статистику
      const statsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sentiment/analyze-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: newReviews.map(r => r.text) })
      });

      const statsResult = await statsResponse.json();
      setStatistics(statsResult.statistics);

      setInputText('');
    } catch (error) {
      console.error('Error analyzing review:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Sentiment Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Review Intelligence
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analyze customer feedback in real-time with AI
          </p>
        </div>

        {/* Input */}
        <div className="bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Введите отзыв / Пікір жазыңыз / Enter a review..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeReview()}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400/50"
              />
            </div>
            <Button
              onClick={analyzeReview}
              disabled={analyzing || !inputText.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Analyze
            </Button>
          </div>
        </div>

        {/* Stats */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatsCard
              title="Total Reviews"
              value={statistics.total}
              icon={<MessageSquare className="w-5 h-5" />}
              color="bg-cyan-400/10 text-cyan-400"
            />
            <StatsCard
              title="Positive"
              value={`${statistics.positive} (${statistics.positive_percentage}%)`}
              icon={<ThumbsUp className="w-5 h-5" />}
              color="bg-green-400/10 text-green-400"
            />
            <StatsCard
              title="Neutral"
              value={`${statistics.neutral} (${statistics.neutral_percentage}%)`}
              icon={<Minus className="w-5 h-5" />}
              color="bg-yellow-400/10 text-yellow-400"
            />
            <StatsCard
              title="Negative"
              value={`${statistics.negative} (${statistics.negative_percentage}%)`}
              icon={<ThumbsDown className="w-5 h-5" />}
              color="bg-red-400/10 text-red-400"
            />
            <StatsCard
              title="Avg Confidence"
              value={`${(statistics.avg_confidence * 100).toFixed(0)}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="bg-purple-400/10 text-purple-400"
            />
          </div>
        )}

        {/* Charts & Reviews */}
        <div className="grid lg:grid-cols-2 gap-8">
          {statistics && (
            <SentimentChart
              positive={statistics.positive}
              negative={statistics.negative}
              neutral={statistics.neutral}
            />
          )}
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </main>
  );
}
