import { AdminPanel } from "@/components/admin-panel";
import { useState } from "react";
import { type Language } from "@/lib/i18n";

export default function Admin() {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminPanel 
        isOpen={true} 
        onClose={() => window.history.back()} 
        language={language}
      />
    </div>
  );
}
