import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const STACK_SIZE = 3;

export default function CardStack({ items = [] }) {
  const [current, setCurrent] = useState(0);

  const tilts = useMemo(() => {
    return Object.fromEntries(
      items.map((item, idx) => {
        const key = item.id || item._id || idx.toString();
        return [key, (Math.random() - 0.5) * 10];
      })
    );
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <div className="w-full text-center py-6 text-sm text-muted-foreground">
        No images available.
      </div>
    );
  }

  const N = items.length;
  const moveNext = () => setCurrent((p) => (p + 1) % N);
  const movePrev = () => setCurrent((p) => (p - 1 + N) % N);

  const stack = Array.from({ length: Math.min(STACK_SIZE, N) }, (_, depth) => {
    const idx = (current - depth + N) % N;
    return { item: items[idx], depth };
  });

  return (
    <div className="w-full flex flex-col items-center py-10">
      <div className="w-full max-w-lg">
        <div className="relative w-full aspect-[3/2.6]">
          {[...stack].reverse().map(({ item, depth }) => {
            const key = item.id || item._id || Math.random().toString();
            return (
              <div
                key={key}
                className="absolute top-0 left-0 w-full h-full bg-white shadow-xl"
                style={{
                  transform: `rotate(${tilts[key] || 0}deg) translateY(${depth * 10}px)`,
                  zIndex: STACK_SIZE - depth,
                }}
              >
                <div className="flex flex-col h-full p-2 sm:p-3">
                  <div className="flex-1 overflow-hidden">
                    <img
                      src={item.src}
                      alt={item.title}
                      className="w-full h-full object-cover select-none"
                      draggable={false}
                    />
                  </div>
                  <div className="pt-2 pb-1 px-1 min-h-[40px]">
                    {depth === 0 && (
                      <>
                        <p className="text-zinc-900 font-semibold text-sm sm:text-base leading-tight">
                          {item.title}
                        </p>
                        <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
                          {item.subtitle}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {N > 1 && (
        <div className="flex items-center gap-4 mt-10">
          <Button variant="outline" size="icon-lg" onClick={movePrev}>
            <ChevronLeft />
          </Button>
          <span className="text-sm font-medium text-muted-foreground tabular-nums w-12 text-center">
            {current + 1} / {N}
          </span>
          <Button variant="outline" size="icon-lg" onClick={moveNext}>
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
}
