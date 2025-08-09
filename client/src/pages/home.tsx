import { useState } from "react";
import { VisitorForm } from "@/components/visitor-form";
import { AdminPanel } from "@/components/admin-panel";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { useChurchSettings } from "@/hooks/use-church-settings";
import { Settings as SettingsIcon, Church } from "lucide-react";
import { type Language } from "@/lib/i18n";

export default function Home() {
  const [language, setLanguage] = useState<Language>('es');
  const [showAdmin, setShowAdmin] = useState(false);
  const { data: churchSettings } = useChurchSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" style={{ 
      '--primary': churchSettings?.primaryColor || '#1976D2' 
    } as React.CSSProperties}>
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Church Branding Section */}
            <div className="flex items-center space-x-4">
              {/* Church logo */}
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                {churchSettings?.logoUrl ? (
                  <img
                    src={churchSettings.logoUrl}
                    alt="Church logo"
                    className="w-full h-full rounded-lg object-cover"
                    data-testid="img-church-logo"
                  />
                ) : (
                  <Church className="text-white" size={24} data-testid="icon-church-default" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900" data-testid="text-church-name">
                  {churchSettings?.name || "Grace Community Church"}
                </h1>
                <p className="text-sm text-gray-600" data-testid="text-church-subtitle">
                  {churchSettings?.subtitle || "Welcome Center"}
                </p>
              </div>
            </div>
            
            {/* Language Toggle and Admin Access */}
            <div className="flex items-center space-x-4">
              <LanguageToggle 
                currentLanguage={language} 
                onLanguageChange={setLanguage} 
              />
              
              {/* Admin Access Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAdmin(true)}
                className="p-2 text-gray-600 hover:text-primary transition-colors rounded-lg min-h-[44px] min-w-[44px]"
                title="Admin Access"
                data-testid="button-admin-access"
              >
                <SettingsIcon size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <VisitorForm language={language} churchName={churchSettings?.name || "Grace Community Church"} />

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdmin} 
        onClose={() => setShowAdmin(false)} 
        language={language}
      />
    </div>
  );
}
