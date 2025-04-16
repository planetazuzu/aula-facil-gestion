
import { useState } from "react";
import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  onChange?: (rating: number) => void;
  max?: number;
  readOnly?: boolean;
}

export function RatingStars({ 
  rating, 
  onChange, 
  max = 5, 
  readOnly = false 
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const filled = readOnly 
          ? starValue <= rating 
          : starValue <= (hoverRating || rating);
        
        return (
          <span
            key={i}
            className={`cursor-${readOnly ? 'default' : 'pointer'} p-1`}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            onClick={() => !readOnly && onChange && onChange(starValue)}
          >
            <Star
              className={`h-6 w-6 ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-transparent text-muted-foreground"
              } transition-colors`}
            />
          </span>
        );
      })}
    </div>
  );
}
