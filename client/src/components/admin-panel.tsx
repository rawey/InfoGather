import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Users, Settings, Upload } from "lucide-react";
import { useVisitors } from "@/hooks/use-visitors";
import { useChurchSettings, useUpdateChurchSettings, useUploadLogo } from "@/hooks/use-church-settings";
import { insertChurchSettingsSchema, type InsertChurchSettings } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { t, type Language } from "@/lib/i18n";
import { format } from "date-fns";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export function AdminPanel({ isOpen, onClose, language }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState("visitors");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const { data: visitors, isLoading: visitorsLoading } = useVisitors();
  const { data: churchSettings, isLoading: settingsLoading } = useChurchSettings();
  const updateSettings = useUpdateChurchSettings();
  const uploadLogo = useUploadLogo();
  const { toast } = useToast();

  const settingsForm = useForm<InsertChurchSettings>({
    resolver: zodResolver(insertChurchSettingsSchema),
    defaultValues: {
      name: "Grace Community Church",
      subtitle: "Welcome Center",
      primaryColor: "#1976D2",
      notificationEmails: {
        children: "",
        youth: "",
        youngAdult: "",
        adult: "",
        senior: ""
      }
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (churchSettings) {
      const currentValues = settingsForm.getValues();
      const newValues = {
        name: churchSettings.name,
        subtitle: churchSettings.subtitle,
        primaryColor: churchSettings.primaryColor,
        notificationEmails: churchSettings.notificationEmails || {
          children: "",
          youth: "",
          youngAdult: "",
          adult: "",
          senior: ""
        }
      };
      
      // Only reset if values are actually different
      if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
        settingsForm.reset(newValues);
      }
    }
  }, [churchSettings]);

  const onSettingsSubmit = async (data: InsertChurchSettings) => {
    try {
      await updateSettings.mutateAsync(data);
      toast({
        title: "Success",
        description: "Church settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    
    try {
      const result = await uploadLogo.mutateAsync(logoFile);
      
      // Update church settings with new logo URL
      const currentSettings = settingsForm.getValues();
      await updateSettings.mutateAsync({
        ...currentSettings,
        logoUrl: result.logoUrl
      });
      
      setLogoFile(null);
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto" data-testid="dialog-admin">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="text-admin-title">
              {t('admin.title', language)}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-admin">
              <X size={24} />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visitors" className="flex items-center" data-testid="tab-visitors">
              <Users className="mr-2" size={16} />
              {t('admin.visitors', language)}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center" data-testid="tab-settings">
              <Settings className="mr-2" size={16} />
              {t('admin.settings', language)}
            </TabsTrigger>
          </TabsList>

          {/* Visitor Data Tab */}
          <TabsContent value="visitors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-recent-visitors">
                  {t('admin.recent_visitors', language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visitorsLoading ? (
                  <div className="text-center py-8" data-testid="text-loading-visitors">Loading visitors...</div>
                ) : visitors && visitors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead data-testid="header-date">Date</TableHead>
                          <TableHead data-testid="header-name">Name</TableHead>
                          <TableHead data-testid="header-contact">Contact</TableHead>
                          <TableHead data-testid="header-age-group">Age Group</TableHead>
                          <TableHead data-testid="header-first-time">First Time</TableHead>
                          <TableHead data-testid="header-language">Language</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visitors.map((visitor) => (
                          <TableRow key={visitor.id} data-testid={`row-visitor-${visitor.id}`}>
                            <TableCell data-testid={`cell-date-${visitor.id}`}>
                              {format(new Date(visitor.submissionDate), 'MM/dd/yyyy')}
                            </TableCell>
                            <TableCell data-testid={`cell-name-${visitor.id}`}>
                              <div>
                                <div className="font-medium">{visitor.fullName}</div>
                                {visitor.city && (
                                  <div className="text-sm text-gray-500">{visitor.city}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell data-testid={`cell-contact-${visitor.id}`}>
                              <div>
                                {visitor.email && (
                                  <div className="text-sm">{visitor.email}</div>
                                )}
                                {visitor.phone && (
                                  <div className="text-sm text-gray-500">{visitor.phone}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell data-testid={`cell-age-group-${visitor.id}`}>
                              {visitor.ageGroup}
                            </TableCell>
                            <TableCell data-testid={`cell-first-time-${visitor.id}`}>
                              <Badge variant={visitor.isFirstTime ? "default" : "secondary"}>
                                {visitor.isFirstTime ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell data-testid={`cell-language-${visitor.id}`}>
                              {visitor.language === 'es' ? 'Spanish' : 'English'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500" data-testid="text-no-visitors">
                    No visitors yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Church Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
              
              {/* Church Branding Settings */}
              {/* <Card>
                <CardHeader>
                  <CardTitle data-testid="text-church-branding">
                    {t('admin.church_branding', language)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...settingsForm}>
                    <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                      <FormField
                        control={settingsForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-church-name">Church Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="min-h-[48px]"
                                data-testid="input-church-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={settingsForm.control}
                        name="subtitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-subtitle">Subtitle</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="min-h-[48px]"
                                data-testid="input-subtitle"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2" data-testid="label-logo">
                          Church Logo
                        </label>
                        <div className="flex items-center space-x-4">
                          {churchSettings?.logoUrl ? (
                            <img
                              src={churchSettings.logoUrl}
                              alt="Church logo"
                              className="w-16 h-16 rounded-lg object-cover"
                              data-testid="img-current-logo"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                              <Settings className="text-white" size={24} />
                            </div>
                          )}
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                              className="mb-2"
                              data-testid="input-logo-file"
                            />
                            <Button
                              type="button"
                              onClick={handleLogoUpload}
                              disabled={!logoFile || uploadLogo.isPending}
                              className="w-full"
                              data-testid="button-upload-logo"
                            >
                              <Upload className="mr-2" size={16} />
                              Upload Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <FormField
                        control={settingsForm.control}
                        name="primaryColor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel data-testid="label-primary-color">Primary Color</FormLabel>
                            <div className="flex items-center space-x-3">
                              <FormControl>
                                <input
                                  type="color"
                                  {...field}
                                  className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                                  data-testid="input-color-picker"
                                />
                              </FormControl>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="flex-1"
                                  placeholder="#1976D2"
                                  data-testid="input-color-hex"
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full min-h-[48px]"
                        disabled={updateSettings.isPending}
                        data-testid="button-save-branding"
                      >
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card> */}
              
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-notification-settings">
                    {t('admin.notification_settings', language)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...settingsForm}>
                    <div className="space-y-4">
                      <FormField
                      control={settingsForm.control}
                      name="notificationEmails.children"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-children-email">Children's Ministry</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="children@church.org"
                              className="min-h-[48px]"
                              data-testid="input-children-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingsForm.control}
                      name="notificationEmails.youth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-youth-email">Youth Ministry</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="youth@church.org"
                              className="min-h-[48px]"
                              data-testid="input-youth-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingsForm.control}
                      name="notificationEmails.youngAdult"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-young-adult-email">Young Adults</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="youngadults@church.org"
                              className="min-h-[48px]"
                              data-testid="input-young-adult-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingsForm.control}
                      name="notificationEmails.adult"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-adult-email">Adult Ministry</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="adults@church.org"
                              className="min-h-[48px]"
                              data-testid="input-adult-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingsForm.control}
                      name="notificationEmails.senior"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel data-testid="label-senior-email">Senior Ministry</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="seniors@church.org"
                              className="min-h-[48px]"
                              data-testid="input-senior-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                      <Button
                        onClick={settingsForm.handleSubmit(onSettingsSubmit)}
                        className="w-full min-h-[48px] bg-green-600 hover:bg-green-700"
                        disabled={updateSettings.isPending}
                        data-testid="button-save-notifications"
                      >
                        Update Notifications
                      </Button>
                    </div>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
