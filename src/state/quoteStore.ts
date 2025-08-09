import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { quotes, Quote } from '@/lib/quotes';
import { format } from 'date-fns';

interface QuoteState {
  currentQuote: Quote | null;
  lastQuoteDate: string | null;
  recentlyUsedIds: number[];
  setDailyQuote: () => void;
}

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      currentQuote: null,
      lastQuoteDate: null,
      recentlyUsedIds: [],
      setDailyQuote: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const { lastQuoteDate, recentlyUsedIds } = get();

        if (lastQuoteDate === today && get().currentQuote) {
          return; // Quote for today is already set
        }

        let availableQuotes = quotes.filter(q => !recentlyUsedIds.includes(q.id));

        if (availableQuotes.length === 0) {
          // All quotes have been used in the rotation, reset the used list but keep the last one
          const lastUsedId = recentlyUsedIds[recentlyUsedIds.length - 1];
          set({ recentlyUsedIds: [lastUsedId] });
          availableQuotes = quotes.filter(q => q.id !== lastUsedId);
        }

        const randomIndex = Math.floor(Math.random() * availableQuotes.length);
        const newQuote = availableQuotes[randomIndex];
        
        const updatedUsedIds = [...get().recentlyUsedIds, newQuote.id];
        // Keep the list to the last 30 used quotes
        if (updatedUsedIds.length > 30) {
          updatedUsedIds.shift();
        }

        set({
          currentQuote: newQuote,
          lastQuoteDate: today,
          recentlyUsedIds: updatedUsedIds,
        });
      },
    }),
    {
      name: 'quote-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);