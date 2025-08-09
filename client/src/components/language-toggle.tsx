import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/i18n";

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

export function LanguageToggle({ currentLanguage, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-1">
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'ghost'}
        size="sm"
        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] min-w-[44px]"
        onClick={() => onLanguageChange('en')}
        data-testid="button-language-english"
      >
        English
      </Button>
      <Button
        variant={currentLanguage === 'es' ? 'default' : 'ghost'}
        size="sm"
        className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 min-h-[44px] min-w-[44px]"
        onClick={() => onLanguageChange('es')}
        data-testid="button-language-spanish"
      >
        Español
      </Button>
    </div>
  );
}
