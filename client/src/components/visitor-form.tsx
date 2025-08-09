import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Phone, Mail, MapPin, Megaphone, Info, ArrowRight, Check } from "lucide-react";
import { insertVisitorSchema, type InsertVisitor } from "@shared/schema";
import { useCreateVisitor } from "@/hooks/use-visitors";
import { useToast } from "@/hooks/use-toast";
import { t, type Language } from "@/lib/i18n";

interface VisitorFormProps {
  language: Language;
  churchName: string;
}

export function VisitorForm({ language, churchName }: VisitorFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const createVisitor = useCreateVisitor();
  const { toast } = useToast();

  const form = useForm<InsertVisitor>({
    resolver: zodResolver(insertVisitorSchema.extend({
      language: insertVisitorSchema.shape.language.default(language),
    })),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      ageGroup: undefined,
      city: "",
      hearAbout: "",
      isFirstTime: false,
      notes: "",
      language: language,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: InsertVisitor) => {
    try {
      await createVisitor.mutateAsync({ ...data, language });
      setShowSuccess(true);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit information. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hearAboutOptions = [
    { value: "friend_family", key: "form.hear.friend_family" },
    { value: "social_media", key: "form.hear.social_media" },
    { value: "website", key: "form.hear.website" },
    { value: "drive_by", key: "form.hear.drive_by" },
    { value: "event", key: "form.hear.event" },
    { value: "other", key: "form.hear.other" },
  ];

  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Card className="gradient-card rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Welcome Header */}
          <div className="gradient-header text-white p-8 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-2" data-testid="text-welcome-title">
              {t('welcome.title', language)}
            </h2>
            <p className="text-lg opacity-90" data-testid="text-welcome-subtitle">
              {t('welcome.subtitle', language)}
            </p>
          </div>

          {/* Visitor Information Form */}
          <div className="p-8 bg-gradient-to-br from-white to-slate-50">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="visitor-form space-y-8" data-testid="form-visitor">
                
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="text-primary mr-3" size={24} />
                    <span data-testid="text-personal-info">{t('form.personal_info', language)}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-full-name">{t('form.full_name', language)}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('form.name_placeholder', language)}
                                className="min-h-[56px] text-lg"
                                data-testid="input-full-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-phone">{t('form.phone', language)}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                placeholder={t('form.phone_placeholder', language)}
                                className="min-h-[56px] text-lg"
                                data-testid="input-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Email */}
                    <div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-email">{t('form.email', language)}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                placeholder={t('form.email_placeholder', language)}
                                className="min-h-[56px] text-lg"
                                data-testid="input-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Age Group */}
                    <div>
                      <FormField
                        control={form.control}
                        name="ageGroup"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-age-group">{t('form.age_group', language)}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="min-h-[56px] text-lg" data-testid="select-age-group">
                                  <SelectValue placeholder={t('form.select_age', language)} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="children" data-testid="option-children">
                                  {t('form.age.children', language)}
                                </SelectItem>
                                <SelectItem value="youth" data-testid="option-youth">
                                  {t('form.age.youth', language)}
                                </SelectItem>
                                <SelectItem value="young_adult" data-testid="option-young-adult">
                                  {t('form.age.young_adult', language)}
                                </SelectItem>
                                <SelectItem value="adult" data-testid="option-adult">
                                  {t('form.age.adult', language)}
                                </SelectItem>
                                <SelectItem value="senior" data-testid="option-senior">
                                  {t('form.age.senior', language)}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* City */}
                    <div>
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-city">{t('form.city', language)}</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={t('form.city_placeholder', language)}
                                className="min-h-[56px] text-lg"
                                data-testid="input-city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                {/* How did you hear about us? */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Megaphone className="text-primary mr-3" size={24} />
                    <span data-testid="text-how-hear">{t('form.how_hear', language)}</span>
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="hearAbout"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                            data-testid="radio-group-hear-about"
                          >
                            {hearAboutOptions.map((option) => (
                              <label
                                key={option.value}
                                className="flex items-center p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[44px]"
                                data-testid={`radio-option-${option.value}`}
                              >
                                <RadioGroupItem value={option.value} className="mr-3" />
                                <span className="text-gray-700">
                                  {t(option.key, language)}
                                </span>
                              </label>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Additional Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Info className="text-primary mr-3" size={24} />
                    <span data-testid="text-additional-info">{t('form.additional_info', language)}</span>
                  </h3>
                  
                  {/* First-time visitor checkbox */}
                  <div className="mb-6">
                    <FormField
                      control={form.control}
                      name="isFirstTime"
                      render={({ field }) => (
                        <FormItem>
                          <label className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-xl min-h-[44px] cursor-pointer">
                            <FormControl>
                              <Checkbox
                                checked={field.value || false}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked === true);
                                }}
                                className="mr-3"
                                data-testid="checkbox-first-time"
                              />
                            </FormControl>
                            <span className="text-gray-700 font-medium" data-testid="text-first-time">
                              {t('form.first_time', language)}
                            </span>
                          </label>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Notes */}
                  <div>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-notes">{t('form.notes', language)}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t('form.notes_placeholder', language)}
                              rows={4}
                              className="text-lg resize-none"
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="min-h-[56px] gradient-primary hover:from-blue-700 hover:to-primary text-white text-xl font-semibold px-12 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    disabled={createVisitor.isPending}
                    data-testid="button-submit"
                  >
                    <span>{t('form.submit', language)}</span>
                    <ArrowRight className="ml-3" size={20} />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md" data-testid="dialog-success">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 gradient-success rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Check className="text-white" size={32} />
            </div>
            <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="text-success-title">
              {t('success.title', language)}
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-6" data-testid="text-success-message">
              {t('success.message', language)}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => setShowSuccess(false)}
            className="min-h-[56px] bg-primary text-white px-8 py-3 rounded-xl font-semibold"
            data-testid="button-success-close"
          >
            {t('success.close', language)}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
