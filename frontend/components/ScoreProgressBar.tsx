'use client';

interface ScoreProgressBarProps {
  userScore: number; // Percentage (0-100)
}

export default function ScoreProgressBar({ userScore }: ScoreProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-700">Your Score</h3>
        <span className="text-sm font-semibold text-green-600">{userScore}%</span>
      </div>

      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-visible">
        {/* User score fill */}
        <div
          className="absolute left-0 top-0 h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(userScore, 100)}%` }}
        />

        {/* User score indicator triangle */}
        <div
          className="absolute top-full mt-1 z-10"
          style={{ left: `${Math.min(userScore, 100)}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-green-600"></div>
        </div>
      </div>
    </div>
  );
}
